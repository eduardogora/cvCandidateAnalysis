// Application configuration
export const appConfig = {
    // FastAPI prediction service URL
    fastApiUrl: process.env.FASTAPI_URL || "http://localhost:8000",
  
    // Other configuration options
    appName: "PISA Job Application",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  }
