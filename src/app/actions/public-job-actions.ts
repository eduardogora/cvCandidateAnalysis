"use server"

import { prisma } from "@/lib/prisma"
import { unstable_noStore as noStore } from 'next/cache'

export async function getPublicJobs() {
  noStore() // Prevenir cache de esta función
  try {
    const jobs = await prisma.job.findMany({
      orderBy: {
        postedDate: "desc",
      },
    })

    return {
      success: true,
      jobs,
    }
  } catch (error) {
    console.error("Error fetching public jobs:", error)
    return {
      success: false,
      jobs: [],
      error: "Failed to fetch jobs. Please try again later.",
    }
  } finally {
    await prisma.$disconnect()
  }
}

export async function getJobById(id: number) {
  try {
    const job = await prisma.job.findUnique({
      where: {
        id,
      },
    })

    if (!job) {
      return {
        success: false,
        job: null,
        error: "Job not found",
      }
    }

    return {
      success: true,
      job,
    }
  } catch (error) {
    console.error(`Error fetching job with ID ${id}:`, error)
    return {
      success: false,
      job: null,
      error: "Failed to fetch job details. Please try again later.",
    }
  } finally {
    await prisma.$disconnect()
  }
}

export async function getAllJobIds() {
  try {
    const jobs = await prisma.job.findMany({
      select: {
        id: true,
      },
    })

    return jobs.map((job: { id: number }) => job.id.toString())
  } catch (error) {
    console.error("Error fetching job IDs:", error)
    return []
  } finally {
    await prisma.$disconnect()
  }
}
