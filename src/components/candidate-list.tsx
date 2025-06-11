"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, SortAsc } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getJobApplications } from "@/app/actions/job-actions"

interface CandidateListProps {
  jobId: number
}

export function CandidateList({ jobId }: CandidateListProps) {
  const [sortField, setSortField] = useState<string>("score")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [expanded, setExpanded] = useState<number | null>(null)
  const [candidates, setCandidates] = useState<any[]>([])

  // Fetch real candidates when component mounts
  useEffect(() => {
    const loadCandidates = async () => {
      try {
        const apps = await getJobApplications(jobId)
        setCandidates(apps)
      } catch (error) {
        console.error("Error loading candidates:", error)
      }
    }

    loadCandidates()
  }, [jobId])

  const sortedCandidates = [...candidates].sort((a, b) => {
    let comparison = 0

    if (sortField === "name") {
      comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
    } else if (sortField === "education") {
      comparison = (a.education[0]?.highestLevel || "").localeCompare(b.education[0]?.highestLevel || "")
    } else if (sortField === "location") {
      comparison = a.city.localeCompare(b.city)
    } else if (sortField === "experience") {
      const aYears = parseInt(a.experience[0]?.totalYears || "0")
      const bYears = parseInt(b.experience[0]?.totalYears || "0")
      comparison = aYears - bYears
    } else {
      // Default to score
      comparison = a.score - b.score
    }

    return sortDirection === "asc" ? comparison : -comparison
  })

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc") // Default to descending for new sort field
    }
  }

  const toggleExpand = (id: number) => {
    setExpanded(expanded === id ? null : id)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-medium">{candidates.length} Candidates</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <SortAsc className="h-4 w-4" />
              Sort by
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleSort("score")}>
              ML Score {sortField === "score" && (sortDirection === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("name")}>
              Name {sortField === "name" && (sortDirection === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("education")}>
              Education {sortField === "education" && (sortDirection === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("location")}>
              Location {sortField === "location" && (sortDirection === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("experience")}>
              Experience {sortField === "experience" && (sortDirection === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-2">
          {sortedCandidates.map((candidate) => (
            <div key={candidate.id} className="border rounded-lg overflow-hidden bg-white">
              <div
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpand(candidate.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-medium">
                    {candidate.firstName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium">{candidate.firstName} {candidate.lastName}</div>
                    <div className="text-sm text-gray-500">
                      {candidate.city}, {candidate.state}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">{candidate.score}</div>
                  {expanded === candidate.id ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>

              {expanded === candidate.id && (
                <div className="p-3 border-t bg-gray-50">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <div className="text-xs text-gray-500">Education</div>
                      <div className="text-sm">{candidate.education[0]?.highestLevel || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Field of Study</div>
                      <div className="text-sm">{candidate.education[0]?.fieldOfStudy || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Institution</div>
                      <div className="text-sm">{candidate.education[0]?.institution || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Experience</div>
                      <div className="text-sm">{candidate.experience[0]?.totalYears || "N/A"}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Skills</div>
                    <div className="flex flex-wrap gap-1">
                      {candidate.skills.map((skill: { skill: string }) => (
                        <Badge key={skill.skill} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {skill.skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
