import Header from "@/components/ui/header"
import Footer from "@/components/ui/footer"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building, MapPin, Briefcase, Clock } from "lucide-react"
import { getPublicJobs } from "../actions/public-job-actions"
import { formatDistanceToNow } from "date-fns"

// Forzar renderizado dinámico para evitar cache en producción
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function JobsPage() {
  const { success, jobs, error } = await getPublicJobs()

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {/* Jobs Header Section */}
        <section className="bg-blue-700 text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Available Positions</h1>
            <p className="text-lg md:text-xl max-w-3xl">
              Explore our current job openings and find your next opportunity at Pisa
            </p>
          </div>
        </section>

        {/* Jobs Grid Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            {!success ? (
              <div className="text-center p-8 border rounded-lg bg-white">
                <h3 className="text-lg font-medium mb-2">Error Loading Jobs</h3>
                <p className="text-gray-500 mb-4">{error || "Failed to load jobs. Please try again later."}</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center p-8 border rounded-lg bg-white">
                <h3 className="text-lg font-medium mb-2">No Jobs Available</h3>
                <p className="text-gray-500 mb-4">Check back later for new job postings.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
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
                        <span>Posted {formatDistanceToNow(new Date(job.postedDate), { addSuffix: true })}</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button asChild className="w-full">
                        <Link href={`/apply/${job.id}`}>Apply Now</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
