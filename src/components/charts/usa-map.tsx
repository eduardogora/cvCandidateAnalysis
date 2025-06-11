"use client"

import { useState, useEffect } from "react"
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps"
import { getJobApplications } from "@/app/actions/job-actions"

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"

export function USAMap() {
  const [data, setData] = useState<{ [key: string]: number }>({})
  const [position, setPosition] = useState({ coordinates: [0, 0] as [number, number], zoom: 1 })

  useEffect(() => {
    const loadData = async () => {
      try {
        const apps = await getJobApplications(1)
        const stateCounts = apps.reduce((acc: { [key: string]: number }, app) => {
          const state = app.state
          acc[state] = (acc[state] || 0) + 1
          return acc
        }, {})
        setData(stateCounts)
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }

    loadData()
  }, [])

  const getColor = (count: number) => {
    if (count === 0) return "#E5E7EB"
    if (count <= 1) return "#BFDBFE"
    if (count <= 3) return "#93C5FD"
    if (count <= 5) return "#60A5FA"
    return "#3B82F6"
  }

  const handleMoveEnd = (position: { coordinates: [number, number], zoom: number }) => {
    setPosition(position)
  }

  return (
    <div className="relative w-full border rounded-lg overflow-hidden bg-white">
      <div className="absolute inset-0">
        <ComposableMap
          projection="geoAlbersUsa"
          projectionConfig={{
            scale: 1000,
          }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={handleMoveEnd}
            minZoom={1}
            maxZoom={4}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const count = data[geo.properties.name] || 0
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getColor(count)}
                      stroke="#FFFFFF"
                      strokeWidth={0.5}
                      style={{
                        default: {
                          outline: "none",
                        },
                        hover: {
                          fill: "#2563EB",
                          outline: "none",
                          cursor: "pointer",
                        },
                        pressed: {
                          outline: "none",
                        },
                      }}
                    />
                  )
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>
      <div className="absolute bottom-4 right-4 bg-white p-2 rounded-lg shadow-md text-sm z-10">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-[#3B82F6]"></div>
          <span>5+ applications</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-[#60A5FA]"></div>
          <span>3-5 applications</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-[#93C5FD]"></div>
          <span>1-3 applications</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#BFDBFE]"></div>
          <span>1 application</span>
        </div>
      </div>
    </div>
  )
} 