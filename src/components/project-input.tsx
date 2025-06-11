"use client"

import type React from "react"

import { useState } from "react"
import { Plus, X, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { FormLabel } from "@/components/ui/form"
import type { ProjectValues } from "@/lib/schema"

interface ProjectInputProps {
  projects: ProjectValues[]
  setProjects: (projects: ProjectValues[]) => void
}

export default function ProjectInput({ projects, setProjects }: ProjectInputProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentProject, setCurrentProject] = useState<ProjectValues | null>(null)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const openAddDialog = () => {
    setCurrentProject({ title: "", description: "", technologies: "" })
    setEditIndex(null)
    setErrors({})
    setIsDialogOpen(true)
  }

  const openEditDialog = (project: ProjectValues, index: number) => {
    // Convertir array de technologies de vuelta a string para edición
    const projectForEdit = {
      ...project,
      technologies: Array.isArray(project.technologies) 
        ? project.technologies.join(', ') 
        : project.technologies
    }
    setCurrentProject(projectForEdit)
    setEditIndex(index)
    setErrors({})
    setIsDialogOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (currentProject) {
      setCurrentProject({ ...currentProject, [name]: value })
    }
  }

  const validateProject = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!currentProject?.title) {
      newErrors.title = "Project title is required"
    }

    if (!currentProject?.description) {
      newErrors.description = "Project description is required"
    }

    if (!currentProject?.technologies) {
      newErrors.technologies = "Technologies used is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateProject() || !currentProject) return

    // Convertir technologies de string a array para el API
    const projectToSave = {
      ...currentProject,
      technologies: typeof currentProject.technologies === 'string' 
        ? currentProject.technologies.split(',').map((tech: string) => tech.trim()).filter((tech: string) => tech)
        : currentProject.technologies
    }

    if (editIndex !== null) {
      const updatedProjects = [...projects]
      updatedProjects[editIndex] = projectToSave
      setProjects(updatedProjects)
    } else {
      setProjects([...projects, projectToSave])
    }

    setIsDialogOpen(false)
  }

  const handleDelete = (index: number) => {
    const updatedProjects = [...projects]
    updatedProjects.splice(index, 1)
    setProjects(updatedProjects)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel className="text-xl font-semibold">Projects</FormLabel>
        <Button type="button" variant="outline" size="sm" onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-1" /> Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-gray-500">No projects added yet. Click "Add Project" to add one.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {projects.map((project, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="font-medium">{project.title}</h4>
                    {project.description && <p className="text-sm text-gray-600">{project.description}</p>}
                    {project.technologies && (
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Technologies:</span> {
                          Array.isArray(project.technologies) 
                            ? project.technologies.join(', ') 
                            : project.technologies
                        }
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => openEditDialog(project, index)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editIndex !== null ? "Edit Project" : "Add Project"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <FormLabel htmlFor="title">Project Title *</FormLabel>
              <Input
                id="title"
                name="title"
                value={currentProject?.title || ""}
                onChange={handleInputChange}
                placeholder="Project title"
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>
            <div className="space-y-2">
              <FormLabel htmlFor="description">Description *</FormLabel>
              <Textarea
                id="description"
                name="description"
                value={currentProject?.description || ""}
                onChange={handleInputChange}
                placeholder="Brief description of the project"
                rows={3}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>
            <div className="space-y-2">
              <FormLabel htmlFor="technologies">Technologies Used *</FormLabel>
              <Input
                id="technologies"
                name="technologies"
                value={currentProject?.technologies || ""}
                onChange={handleInputChange}
                placeholder="e.g., React, Node.js, MongoDB"
              />
              {errors.technologies && <p className="text-sm text-red-500">{errors.technologies}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
