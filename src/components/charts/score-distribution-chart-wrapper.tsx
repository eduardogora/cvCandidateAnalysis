"use client"

import dynamic from "next/dynamic"

const ScoreDistributionChart = dynamic(
  () => import("./score-distribution-chart").then((mod) => ({ default: mod.ScoreDistributionChart })),
  {
    ssr: false,
    loading: () => (
      <div className="p-4">
        <div className="h-[300px] flex items-center justify-center border border-gray-200 rounded bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-500">Loading chart...</p>
          </div>
        </div>
      </div>
    ),
  },
)

interface ScoreDistributionChartWrapperProps {
  jobId: number
  data: {
    totalApplications: number
    averageScore: number
    applications?: Array<{
      score: number
    }>
  }
  type?: "bar" | "dot"
}

export function ScoreDistributionChartWrapper(props: ScoreDistributionChartWrapperProps) {
  return <ScoreDistributionChart {...props} />
}
