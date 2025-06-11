import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    // Get the FastAPI URL from environment variables or use default
    const fastApiUrl = process.env.FASTAPI_URL || "http://localhost:8000"
    const predictionEndpoint = `${fastApiUrl}/predict`

    try {
      // Make request to FastAPI prediction service
      const response = await fetch(predictionEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })


      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }))
        return NextResponse.json(
          { 
            success: false, 
            error: errorData.detail || `FastAPI returned status ${response.status}` 
          }, 
          { status: 500 }
        )
      }

      const result = await response.json()
      return NextResponse.json(result)
    } catch (fetchError) {
      const mockScore = -1 
      const fallbackResponse = {
        success: true,
        result: {
          applicationId: data.applicationId,
          score: mockScore,
        },
        warning: "Using mock prediction - FastAPI service not available"
      }
      return NextResponse.json(fallbackResponse)
    }
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    )
  }
}
