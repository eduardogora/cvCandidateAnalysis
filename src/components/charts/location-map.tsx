"use client"

import { Card } from "@/components/ui/card"
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps"
import { scaleOrdinal } from "d3-scale"

const colorScale = scaleOrdinal<string>()
  .domain(["0", "1", "2", "3", "4+"])
  .range([
    "rgb(229, 231, 235)", // gris claro para 0
    "rgb(209, 229, 240)", // azul muy claro
    "rgb(146, 197, 222)", // azul claro
    "rgb(67, 147, 195)",  // azul medio
    "rgb(33, 102, 172)",  // azul oscuro
  ])

interface LocationMapProps {
  jobId: number
  data: Record<string, number>
}

export function LocationMap({ jobId, data }: LocationMapProps) {
  return (
    <div className="relative w-full h-[calc(100%-1rem)]">
      <div className="absolute inset-0">
        <ComposableMap 
          projection="geoAlbersUsa"
          projectionConfig={{
            scale: 1000
          }}
        >
          <ZoomableGroup zoom={1}>
            <Geographies geography="https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json">
              {({ geographies }) =>
                geographies.map((geo) => {
                  const stateName = geo.properties.name
                  const count = data[stateName] || 0
                  const colorIndex = count === 0 ? "0" : count > 4 ? "4+" : count.toString()
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={colorScale(colorIndex)}
                      stroke="#FFFFFF"
                      strokeWidth={0.5}
                      style={{
                        default: {
                          outline: "none",
                        },
                        hover: {
                          fill: "#F53",
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
        {["0", "1", "2", "3", "4+"].map((value) => (
          <div key={value} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: colorScale(value) }}
            />
            <span className="text-sm text-gray-500">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
