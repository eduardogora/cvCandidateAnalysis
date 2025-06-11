"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Line, LineChart } from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

interface ScoreDistributionChartProps {
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

export function ScoreDistributionChart({ jobId, data, type = "bar" }: ScoreDistributionChartProps) {
  // Add state to handle client-side rendering for Recharts
  const [mounted, setMounted] = useState(false)

  // Ensure this only renders on the client side to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Add debugging
  console.log("ScoreDistributionChart - Raw data:", data)
  console.log("ScoreDistributionChart - Applications:", data.applications)

  // Create ranges for bar chart
  const ranges = [
    { min: 0, max: 20, label: "0-20" },
    { min: 21, max: 40, label: "21-40" },
    { min: 41, max: 60, label: "41-60" },
    { min: 61, max: 80, label: "61-80" },
    { min: 81, max: 100, label: "81-100" },
  ]

  const chartData = ranges.map((range) => {
    const count =
      data.applications?.filter((app) => {
        const score = typeof app.score === "number" ? app.score : Number(app.score)
        return !isNaN(score) && score >= range.min && score <= range.max
      }).length || 0

    return {
      score: range.label,
      count,
    }
  })

  console.log("Bar chart data:", chartData)

  // Group scores and count frequency for line chart
  const scoreFrequencyMap = new Map<number, number>()

  if (data.applications && Array.isArray(data.applications)) {
    data.applications.forEach((app) => {
      const score = typeof app.score === "number" ? app.score : Number(app.score)
      if (!isNaN(score)) {
        const roundedScore = Math.round(score)
        scoreFrequencyMap.set(roundedScore, (scoreFrequencyMap.get(roundedScore) || 0) + 1)
        console.log(`Added score: ${roundedScore} with count: ${scoreFrequencyMap.get(roundedScore)}`)
      }
    })
  }

  console.log("Score frequency map:", Array.from(scoreFrequencyMap.entries()))

  const scatterData = Array.from(scoreFrequencyMap.entries())
    .map(([score, count]) => ({
      score,
      count,
    }))
    .sort((a, b) => a.score - b.score)

  console.log("Scatter data:", scatterData)

  // Create line data that includes actual data points and fills gaps with 0
  const completeLineData = []

  // Get min and max scores from actual data
  const scores = scatterData.map((item) => item.score)
  const minScore = Math.min(0, ...scores)
  const maxScore = Math.max(100, ...scores)

  // Create data points for every score from 0 to 100
  for (let score = 0; score <= 100; score += 1) {
    const existingData = scatterData.find((item) => item.score === score)
    completeLineData.push({
      score,
      count: existingData ? existingData.count : 0,
    })
  }

  console.log("Complete line data (first 10):", completeLineData.slice(0, 10))
  console.log("Complete line data (around score 76):", completeLineData.slice(74, 78))
  console.log("Complete line data (around score 96):", completeLineData.slice(94, 98))

  // Custom dot component that only renders when count > 0
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props
    if (payload && typeof payload.count === "number" && payload.count > 0) {
      console.log("Rendering dot at:", payload.score, "with count:", payload.count)
      return <circle cx={cx} cy={cy} r={6} fill="#8F3BF6FF" stroke="#38188BFF" strokeWidth={2} />
    }
    return null
  }

  // Custom active dot for hover
  const CustomActiveDot = (props: any) => {
    const { cx, cy, payload } = props
    if (payload && typeof payload.count === "number" && payload.count > 0) {
      return <circle cx={cx} cy={cy} r={8} fill="#763BF6FF" stroke="#E6B7FFFF" strokeWidth={3} />
    }
    return null
  }

  // Add fallback for when there's no data
  if (!data.applications || data.applications.length === 0) {
    return (
      <div className="p-4">
        <div className="h-[300px] flex items-center justify-center border border-gray-200 rounded">
          <p className="text-gray-500">No application data available</p>
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">Average Score: {data.averageScore.toFixed(1)}</p>
          <p className="text-sm text-gray-500">Total Applications: {data.totalApplications}</p>
        </div>
      </div>
    )
  }

  // Show loading state until client-side hydration is complete
  if (!mounted) {
    return (
      <div className="p-4">
        <div className="h-[300px] flex items-center justify-center border border-gray-200 rounded bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-500">Loading chart...</p>
          </div>
        </div>
        <div className="text-center mt-4">
          <p className="text-sm text-gray-500">Average Score: {data.averageScore.toFixed(1)}</p>
          <p className="text-sm text-gray-500">Total Applications: {data.totalApplications}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="h-[300px]">
        {type === "bar" ? (
          <ChartContainer
            config={{
              count: {
                label: "Applications",
                color: "hsl(215, 100%, 60%)",
              },
            }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="score" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="hsl(215, 100%, 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <ChartContainer
            config={{
              count: {
                label: "Applications",
                color: "hsl(215, 100%, 60%)",
              },
            }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={completeLineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis
                  type="number"
                  dataKey="score"
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tickFormatter={(value) => `${value}`}
                />
                <YAxis type="number" dataKey="count" allowDecimals={false} domain={[0, "dataMax"]} />
                <Tooltip
                  content={<ChartTooltipContent />}
                  formatter={(value: any, name: string) => [value, name === "count" ? "Applications" : "Score"]}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#4656D2FF"
                  strokeWidth={2}
                  dot={<CustomDot />}
                  activeDot={<CustomActiveDot />}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </div>
      <div className="text-center mt-4">
        <p className="text-sm text-gray-500">Average Score: {data.averageScore.toFixed(1)}</p>
        <p className="text-sm text-gray-500">Total Applications: {data.totalApplications}</p>
      </div>
    </div>
  )
}
