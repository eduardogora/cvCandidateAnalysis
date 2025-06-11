"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, BarChart2, MapPin, Briefcase, Clock, Building } from "lucide-react"
import { EditJobModal } from "./edit-job-modal"
import { deleteJob, updateJob, getJobs } from "@/app/actions/job-actions"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

interface Job {
  id: number
  title: string
  company: string
  department: string
  location: string
  postedDate: Date
  applicants: number
  type: string
  level: string
  salary: string | null
  description: string
  requirements: string
  responsibilities: string
}

interface JobGridProps {
  initialJobs: Job[]
}

export function JobGrid({ initialJobs }: JobGridProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [jobs, setJobs] = useState<Job[]>(initialJobs)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Función para recargar los trabajos
  const refreshJobs = async () => {
    try {
      const updatedJobs = await getJobs()
      setJobs(updatedJobs)
      router.refresh() // Forzar recarga del router
    } catch (error) {
      console.error("Error refreshing jobs:", error)
    }
  }

  const handleEdit = (jobId: number) => {
    const job = jobs.find((j) => j.id === jobId) || null
    setSelectedJob(job)
    setIsEditModalOpen(true)
  }

  const handleInsights = (jobId: number) => {
    router.push(`/PisaManager/insights/${jobId.toString()}`)
  }

  const handleSaveJob = async (updatedJob: Job) => {
    try {
      const result = await updateJob(updatedJob.id, updatedJob)

      if (result.success) {
        await refreshJobs()
        router.refresh() // Forzar recarga del router
        toast({
          title: "Success",
          description: result.message,
        })
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating job:", error)
      toast({
        title: "Error",
        description: "Failed to update job. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteJob = async (jobId: number) => {
    try {
      const result = await deleteJob(jobId)

      if (result.success) {
        await refreshJobs()
        router.refresh() // Forzar recarga del router
        toast({
          title: "Success",
          description: result.message,
        })
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting job:", error)
      toast({
        title: "Error",
        description: "Failed to delete job. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Recargar los trabajos cuando se abre el modal de edición
  useEffect(() => {
    if (isEditModalOpen) {
      refreshJobs()
    }
  }, [isEditModalOpen])

  // Recargar los trabajos cuando se monta el componente
  useEffect(() => {
    refreshJobs()
  }, [])

  if (jobs.length === 0) {
    return (
      <div className="text-center p-8 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-medium mb-2">No jobs found</h3>
        <p className="text-gray-500 mb-4">Create your first job posting to get started.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((job) => (
          <Card key={job.id} className="hover:shadow-md transition-shadow relative">
            <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
              {job.applicants} Applications
            </div>
            <CardHeader className="pt-10">
              <CardTitle className="text-xl">{job.title}</CardTitle>
              <div className="text-sm text-blue-600 font-medium">{job.department}</div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Building className="h-4 w-4 flex-shrink-0" />
                <span>{job.company}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Briefcase className="h-4 w-4 flex-shrink-0" />
                <span>{job.type}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>Posted {format(new Date(job.postedDate), "yyyy-MM-dd")}</span>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button onClick={() => handleEdit(job.id)} className="flex-1">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button onClick={() => handleInsights(job.id)} variant="outline" className="flex-1">
                <BarChart2 className="mr-2 h-4 w-4" />
                Insights
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <EditJobModal
        job={selectedJob}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          refreshJobs()
          router.refresh() // Forzar recarga del router
        }}
        onSave={handleSaveJob}
        onDelete={handleDeleteJob}
      />
    </>
  )
}
