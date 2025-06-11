import { getJobInsights } from "@/app/actions/job-actions"
import JobInsightsClientPage from "./JobInsightsClientPage"
import { notFound } from "next/navigation"

// Mock job data
const jobsData = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "Tech Solutions Inc.",
    department: "Engineering",
  },
  {
    id: 2,
    title: "Backend Engineer",
    company: "Data Systems",
    department: "Engineering",
  },
  {
    id: 3,
    title: "Full Stack Developer",
    company: "Web Innovations",
    department: "Product",
  },
  {
    id: 4,
    title: "UX Designer",
    company: "Creative Labs",
    department: "Design",
  },
  {
    id: 5,
    title: "DevOps Engineer",
    company: "Cloud Services",
    department: "Infrastructure",
  },
  {
    id: 6,
    title: "Data Scientist",
    company: "Analytics Pro",
    department: "Data",
  },
]

// Add this function to generate static paths for all job IDs
export function generateStaticParams() {
  return jobsData.map((job) => ({
    jobId: job.id.toString(),
  }))
}

interface PageProps {
  params: {
    jobId: string
  }
}

export default async function JobInsightsPage({ params }: PageProps) {
  try {
    const jobId = parseInt(params.jobId)
    const { job, stats } = await getJobInsights(jobId)
    
    return <JobInsightsClientPage initialData={{ job, stats }} />
  } catch (error) {
    console.error("Error loading job insights:", error)
    notFound()
  }
}
