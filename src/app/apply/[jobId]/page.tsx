import type { Metadata } from "next"
import Header from "@/components/ui/header"
import Footer from "@/components/ui/footer"
import JobApplicationForm from "@/components/job-application-form"
import JobDetail from "@/components/job-detail"
import { getJobById, getAllJobIds } from "@/app/actions/public-job-actions"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Pisa | Apply for Job",
  description: "Apply for a job at Pisa",
}

interface PageProps {
  params: Promise< {
    jobId: string
  }>
}

// Generate static paths for job IDs
export async function generateStaticParams() {
  // For static site, fetch all job IDs from the database
  const jobIds = await getAllJobIds()

  // If no jobs are found, provide at least one fallback path
  if (jobIds.length === 0) {
    return [{ jobId: "1" }]
  }

  return jobIds.map((jobId) => ({
    jobId,
  }))
}

export default async function ApplyPage({ params }: PageProps) {
  const awaitedparams = await params
  if (!awaitedparams?.jobId) {
    notFound()
  }
  // Convert jobId to number for database query
  const jobId = Number.parseInt(awaitedparams.jobId, 10)

  if (isNaN(jobId)) {
    notFound()
  }

  // Fetch job details from database
  const { success, job, error } = await getJobById(jobId)

  if (!success || !job) {
    notFound()
  }

  // Format requirements and responsibilities as arrays for the JobDetail component
  const formattedJob = {
    id: job.id.toString(),
    title: job.title,
    location: job.location,
    department: job.department,
    description: job.description,
    // Split by newlines and filter out empty strings
    requirements: job.requirements.split("\n").filter((item) => item.trim() !== ""),
    responsibilities: job.responsibilities.split("\n").filter((item) => item.trim() !== ""),
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <h1 className="text-2xl font-bold mb-6">Job Details</h1>
            <JobDetail
              title={formattedJob.title}
              location={formattedJob.location}
              department={formattedJob.department}
              description={formattedJob.description}
              requirements={formattedJob.requirements}
              responsibilities={formattedJob.responsibilities}
            />
          </div>
          <div className="lg:col-span-2">
            <h1 className="text-2xl font-bold mb-6">Application Form</h1>
            <JobApplicationForm jobId={job.id} jobTitle={job.title} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
