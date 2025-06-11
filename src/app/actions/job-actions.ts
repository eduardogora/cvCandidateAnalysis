"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { unstable_noStore as noStore } from "next/cache"

export async function createJob(formData: FormData) {
  try {
    const jobData = {
      title: formData.get("title") as string,
      company: formData.get("company") as string,
      department: formData.get("department") as string,
      location: formData.get("location") as string,
      type: formData.get("type") as string,
      level: formData.get("level") as string,
      salary: formData.get("salary") as string,
      description: formData.get("description") as string,
      requirements: formData.get("requirements") as string,
      responsibilities: formData.get("responsibilities") as string,
      postedDate: new Date(),
      applicants: 0,
    }

    const job = await prisma.job.create({
      data: jobData,
    })

    // Revalidar todas las rutas relevantes
    revalidatePath("/")
    revalidatePath("/PisaManager")
    revalidatePath("/jobs")

    return { success: true, message: "Job created successfully", job }
  } catch (error) {
    console.error("Error creating job:", error)
    return { success: false, message: "Failed to create job" }
  }
}

export async function getJobs() {
  noStore() // Deshabilitar el caché para esta función
  try {
    const jobs = await prisma.job.findMany({
      orderBy: {
        postedDate: "desc",
      },
    })
    return jobs
  } catch (error) {
    console.error("Error fetching jobs:", error)
    throw new Error("Failed to fetch jobs")
  }
}

export async function updateJob(jobId: number, jobData: any) {
  try {
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: jobData,
    })

    // Revalidar todas las rutas relevantes
    revalidatePath("/")
    revalidatePath("/PisaManager")
    revalidatePath("/jobs")

    return { success: true, message: "Job updated successfully", job: updatedJob }
  } catch (error) {
    console.error("Error updating job:", error)
    return { success: false, message: "Failed to update job" }
  }
}

export async function deleteJob(jobId: number) {
  try {
    await prisma.job.delete({
      where: { id: jobId },
    })

    // Revalidar todas las rutas relevantes
    revalidatePath("/")
    revalidatePath("/PisaManager")
    revalidatePath("/jobs")

    return { success: true, message: "Job deleted successfully" }
  } catch (error) {
    console.error("Error deleting job:", error)
    return { success: false, message: "Failed to delete job" }
  }
}

export async function getJobInsights(jobId: number) {
  noStore()
  try {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        applications: {
          include: {
            education: true,
            experience: true,
            skills: true,
            projects: true,
          },
        },
      },
    })

    if (!job) {
      throw new Error("Job not found")
    }

    // Calcular estadísticas
    const totalApplications = job.applications.length
    const averageScore = totalApplications > 0
      ? job.applications.reduce((acc, app) => acc + app.score, 0) / totalApplications
      : 0

    // Agrupar por nivel educativo
    const educationStats = job.applications.reduce((acc, app) => {
      app.education.forEach(edu => {
        acc[edu.highestLevel] = (acc[edu.highestLevel] || 0) + 1
      })
      return acc
    }, {} as Record<string, number>)

    // Agrupar por habilidades
    const skillsStats = job.applications.reduce((acc, app) => {
      app.skills.forEach(skill => {
        acc[skill.skill] = (acc[skill.skill] || 0) + 1
      })
      return acc
    }, {} as Record<string, number>)

    // Agrupar por experiencia
    const experienceStats = job.applications.reduce((acc, app) => {
      app.experience.forEach(exp => {
        const years = parseInt(exp.totalYears) || 0
        if (years <= 2) acc["0-2"] = (acc["0-2"] || 0) + 1
        else if (years <= 5) acc["3-5"] = (acc["3-5"] || 0) + 1
        else if (years <= 10) acc["6-10"] = (acc["6-10"] || 0) + 1
        else acc["10+"] = (acc["10+"] || 0) + 1
      })
      return acc
    }, {} as Record<string, number>)

    // Agrupar por ubicación - ahora solo usamos el estado
    const locationStats = job.applications.reduce((acc, app) => {
      const state = app.state.trim()
      acc[state] = (acc[state] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      job,
      stats: {
        totalApplications,
        averageScore,
        educationStats,
        skillsStats,
        experienceStats,
        locationStats,
        applications: job.applications.map(app => ({ score: app.score }))
      },
    }
  } catch (error) {
    console.error("Error fetching job insights:", error)
    throw new Error("Failed to fetch job insights")
  }
}

export async function getJobApplications(jobId: number) {
  noStore()
  try {
    const applications = await prisma.application.findMany({
      where: { jobId },
      include: {
        education: true,
        experience: true,
        skills: true,
        projects: true,
      },
      orderBy: {
        score: "desc",
      },
    })

    return applications
  } catch (error) {
    console.error("Error fetching job applications:", error)
    throw new Error("Failed to fetch job applications")
  }
}
