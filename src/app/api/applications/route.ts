import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { applicationFormSchema } from "@/lib/schema"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("Received data:", body)

    // Validate the data against the schema
    const data = applicationFormSchema.parse(body)

    // Create the application with related data
    const application = await prisma.application.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        coverLetter: data.coverLetter || null,
        portfolioWebsite: data.portfolioWebsite || null,
        linkedIn: data.linkedIn || null,
        github: data.github || null,
        hasResume: data.hasResume,
        agreeToTerms: data.agreeToTerms,
        jobId: data.jobId,
        education: {
          create: {
            highestLevel: data.education.highestLevel,
            institution: data.education.institution,
            fieldOfStudy: data.education.fieldOfStudy,
            graduationYear: data.education.graduationYear,
          },
        },
        experience: {
          create: {
            totalYears: data.experience.totalYears,
            currentTitle: data.experience.currentTitle ?? undefined,
            currentCompany: data.experience.currentCompany ?? undefined,
            achievements: data.experience.achievements ?? undefined,
          },
        },
        skills: {
          create: data.skills.map((skill) => ({
            skill,
          })),
        },
        projects: {
          create: (data.projects ?? []).map((project) => ({
            title: project.title,
            description: project.description,
            technologies: project.technologies,
          })),
        },
      },
      include: {
        education: true,
        experience: true,
        skills: true,
        projects: true,
      },
    })

    // Run prediction model
    try {
      // Prepare data for the prediction model
      const predictionData = {
        applicationId: application.id,
        firstName: data.firstName,
        lastName: data.lastName,
        education: {
          highestLevel: data.education.highestLevel,
          fieldOfStudy: data.education.fieldOfStudy,
        },
        experience: {
          totalYears: data.experience.totalYears,
        },
        skills: data.skills,
        jobId: data.jobId,
      }

      // Fix: Use absolute URL with origin for API call
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

      // Call the prediction API with absolute URL
      const response = await fetch(`${baseUrl}/api/run-prediction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(predictionData),
      })

      const predictionResult = await response.json()

      if (predictionResult.success && predictionResult.result) {
        // Store prediction result in the score field
        await prisma.application.update({
          where: { id: application.id },
          data: {
            score: predictionResult.result.score,
          },
        })

        console.log("Prediction successful and stored:", predictionResult.result)
      } else {
        console.error("Prediction failed:", predictionResult.error)
      }
    } catch (predictionError) {
      // Log the error but don't fail the application submission
      console.error("Error running prediction model:", predictionError)
    }

    return NextResponse.json(
      {
        message: "Application submitted successfully",
        applicationId: application.id,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("API error:", error)

    // Return more detailed error information
    return NextResponse.json(
      {
        message: "Error submitting application",
        error: error instanceof Error ? error.message : "Unknown error",
        details: error,
      },
      { status: 400 },
    )
  } finally {
    await prisma.$disconnect()
  }
}
