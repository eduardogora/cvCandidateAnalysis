import { Card, CardContent } from "@/components/ui/card"

interface JobDetailProps {
  title: string
  location: string
  department: string
  description: string
  requirements: string[]
  responsibilities: string[]
}

export default function JobDetail({
  title,
  location,
  department,
  description,
  requirements,
  responsibilities,
}: JobDetailProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-gray-600">{department}</p>
          <p className="text-gray-600">{location}</p>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p className="text-gray-700">{description}</p>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Requirements</h3>
          <ul className="list-disc pl-5 space-y-1">
            {requirements.map((req, index) => (
              <li key={index} className="text-gray-700">
                {req}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Responsibilities</h3>
          <ul className="list-disc pl-5 space-y-1">
            {responsibilities.map((resp, index) => (
              <li key={index} className="text-gray-700">
                {resp}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
