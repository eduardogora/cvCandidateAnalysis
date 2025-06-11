import { z } from "zod"

// Define the project schema to match Prisma Project model
export const projectSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  description: z.string().min(1, "Project description is required"),
  technologies: z.union([
    z.string().min(1, "Technologies used is required"),
    z.array(z.string()).min(1, "Technologies used is required")
  ]),
})

// Define the education schema to match Prisma Education model
export const educationSchema = z.object({
  highestLevel: z.enum([
    "High School",
    "Associate's Degree",
    "Bachelor's Degree",
    "Master's Degree",
    "Doctorate",
    "Other",
  ]),
  institution: z.string().min(1, "Institution name is required"),
  fieldOfStudy: z.string().min(1, "Field of study is required"),
  graduationYear: z.string().min(1, "Graduation year is required"),
})

// Define the experience schema to match Prisma Experience model
export const experienceSchema = z.object({
  totalYears: z.enum(["0-1 years", "1-3 years", "3-5 years", "5-10 years", "10+ years"]),
  currentTitle: z.string().min(1, "Job title is required"),
  currentCompany: z.string().min(1, "Company name is required"),
  achievements: z.string().min(1, "Please provide some achievements"),
})

// Define the application form schema to match Prisma Application model
export const applicationFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State/Province is required"),
  zipCode: z.string().min(1, "Zip/Postal code is required"),
  country: z.string().min(1, "Country is required"),
  education: educationSchema,
  experience: experienceSchema,
  skills: z.array(z.string()).min(1, "Please add at least one skill"),
  projects: z.array(projectSchema).optional().default([]),
  coverLetter: z.string().min(50, "Cover letter should be at least 50 characters"),
  portfolioWebsite: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  linkedIn: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  github: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  hasResume: z.boolean().default(false),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
  jobId: z.number(),
})

export type ApplicationFormValues = z.infer<typeof applicationFormSchema>
export type ProjectValues = z.infer<typeof projectSchema>
export type EducationValues = z.infer<typeof educationSchema>
export type ExperienceValues = z.infer<typeof experienceSchema>
