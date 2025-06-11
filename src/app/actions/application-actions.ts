"use server"

import { PrismaClient } from "@prisma/client"
import { applicationFormSchema, type ApplicationFormValues } from "@/lib/schema"
import { revalidatePath } from "next/cache"

const prisma = new PrismaClient()

export async function submitApplication(formData: ApplicationFormValues) {
  try {
    // Validate form data
    const validatedData = applicationFormSchema.parse(formData)

    // Create application record with related data
    const application = await prisma.application.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        zipCode: validatedData.zipCode,
        country: validatedData.country,
        coverLetter: validatedData.coverLetter,
        portfolioWebsite: validatedData.portfolioWebsite || null,
        linkedIn: validatedData.linkedIn || null,
        github: validatedData.github || null,
        hasResume: validatedData.hasResume,
        agreeToTerms: validatedData.agreeToTerms,
        jobId: validatedData.jobId,
        // Create related education record
        education: {
          create: {
            highestLevel: validatedData.education.highestLevel,
            institution: validatedData.education.institution,
            fieldOfStudy: validatedData.education.fieldOfStudy,
            graduationYear: validatedData.education.graduationYear,
          },
        },
        // Create related experience record
        experience: {
          create: {
            totalYears: validatedData.experience.totalYears,
            currentTitle: validatedData.experience.currentTitle,
            currentCompany: validatedData.experience.currentCompany,
            achievements: validatedData.experience.achievements,
          },
        },
        // Create related skills
        skills: {
          create: validatedData.skills.map((skill) => ({
            skill: skill,
          })),
        },
        // Create related projects
        projects: {
          create:
            validatedData.projects?.map((project) => ({
              title: project.title,
              description: project.description,
              technologies: Array.isArray(project.technologies) 
                ? project.technologies.join(', ') 
                : project.technologies,
            })) || [],
        },
      },
    })

    // Update job applicants count
    await prisma.job.update({
      where: { id: validatedData.jobId },
      data: { applicants: { increment: 1 } },
    })

    // Run prediction model
    try {
      // Get job details for prediction
      const job = await prisma.job.findUnique({
        where: { id: validatedData.jobId },
        select: { requirements: true, responsibilities: true }
      })

      // Prepare achievements as array
      let achievementsArray: string[] = []
      if (validatedData.experience.achievements) {
        if (Array.isArray(validatedData.experience.achievements)) {
          achievementsArray = validatedData.experience.achievements
        } else {
          achievementsArray = [validatedData.experience.achievements]
        }
      }

      // Prepare data for the prediction model - matching the exact format expected
      const predictionData = {
        applicationId: application.id.toString(), // Convert to string
        skills: validatedData.skills,
        education: {
          highestLevel: validatedData.education.highestLevel,
          field: validatedData.education.fieldOfStudy || "",
        },
        experience: {
          totalYears: validatedData.experience.totalYears,
          currentPosition: validatedData.experience.currentTitle || "",
          achievements: achievementsArray, // Ensure it's always an array
        },
        projects: validatedData.projects?.map(project => ({
          name: project.title,
          description: project.description,
          technologies: Array.isArray(project.technologies) 
            ? project.technologies 
            : project.technologies.split(',').map((tech: string) => tech.trim()).filter((tech: string) => tech),
        })) || [],
        Job: {
          requirements: job?.requirements || "",
          responsibilities: job?.responsibilities || "",
        },
      }

      console.log("[APPLICATION ACTION] Calling prediction API with data:", JSON.stringify(predictionData, null, 2))

      // Call the prediction API
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/run-prediction`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(predictionData),
        })

        console.log("[APPLICATION ACTION] Prediction API response status:", response.status)

        if (response.ok) {
          const result = await response.json()
          console.log("[APPLICATION ACTION] Prediction API result:", result)

          if (result.success && result.result?.score) {
            // Store the real prediction score
            await prisma.application.update({
              where: { id: application.id },
              data: {
                score: result.result.score,
              },
            })
            console.log("[APPLICATION ACTION] Stored prediction score:", result.result.score)
          } else {
            throw new Error('Invalid prediction response')
          }
        } else {
          // Try to get the error details from the response
          let errorDetails = 'Unknown error'
          try {
            const errorData = await response.json()
            errorDetails = JSON.stringify(errorData)
          } catch (e) {
            errorDetails = `Status ${response.status} - Could not parse error response`
          }
          console.error("[APPLICATION ACTION] API Error Details:", errorDetails)
          throw new Error(`Prediction API returned status ${response.status}: ${errorDetails}`)
        }
      } catch (fetchError) {
        console.error("[APPLICATION ACTION] Error calling prediction API:", fetchError)
        
        // Generate a random score as fallback
        const fallbackScore = -1
        
        await prisma.application.update({
          where: { id: application.id },
          data: {
            score: fallbackScore,
          },
        })
        
        console.log("[APPLICATION ACTION] Using fallback score:", fallbackScore)
      }
    } catch (predictionError) {
      // Log the error but don't fail the application submission
      console.error("Error running prediction model:", predictionError)
    }

    // Revalidate the job page
    revalidatePath(`/jobs/${validatedData.jobId}`)

    return {
      success: true,
      applicationId: application.id,
      message: "Application submitted successfully",
    }
  } catch (error) {
    console.error("Error submitting application:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to submit application",
    }
  } finally {
    await prisma.$disconnect()
  }
}
