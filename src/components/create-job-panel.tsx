"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createJob } from "@/app/actions/job-actions"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function CreateJobPanel() {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [jobData, setJobData] = useState({
    title: "",
    company: "",
    department: "",
    location: "",
    type: "",
    level: "",
    salary: "",
    description: "",
    requirements: "",
    responsibilities: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setJobData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create FormData from the form
      const formData = new FormData()
      Object.entries(jobData).forEach(([key, value]) => {
        formData.append(key, value)
      })

      // Call the server action
      const result = await createJob(formData)

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        })

        // Reset form after successful submission
        setJobData({
          title: "",
          company: "",
          department: "",
          location: "",
          type: "",
          level: "",
          salary: "",
          description: "",
          requirements: "",
          responsibilities: "",
        })

        // Refresh the page to show the new job
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting job:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Create New Job</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-250px)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                name="title"
                value={jobData.title}
                onChange={handleChange}
                placeholder="e.g. Frontend Developer"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                name="company"
                value={jobData.company}
                onChange={handleChange}
                placeholder="e.g. Tech Solutions Inc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                name="department"
                value={jobData.department}
                onChange={handleChange}
                placeholder="e.g. Engineering"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                name="location"
                value={jobData.location}
                onChange={handleChange}
                placeholder="e.g. Remote, New York, NY"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Job Type *</Label>
              <Input
                id="type"
                name="type"
                value={jobData.type}
                onChange={handleChange}
                placeholder="e.g. Full-time, Part-time, Contract"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Level *</Label>
              <Input
                id="level"
                name="level"
                value={jobData.level}
                onChange={handleChange}
                placeholder="e.g. Junior, Mid-level, Senior"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary">Salary Range</Label>
              <Input
                id="salary"
                name="salary"
                value={jobData.salary}
                onChange={handleChange}
                placeholder="e.g. $80,000 - $100,000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={jobData.description}
                onChange={handleChange}
                placeholder="Enter job description..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements *</Label>
              <Textarea
                id="requirements"
                name="requirements"
                value={jobData.requirements}
                onChange={handleChange}
                placeholder="Enter job requirements..."
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsibilities">Responsibilities *</Label>
              <Textarea
                id="responsibilities"
                name="responsibilities"
                value={jobData.responsibilities}
                onChange={handleChange}
                placeholder="Enter job responsibilities..."
                rows={3}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Job"
              )}
            </Button>
          </form>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
