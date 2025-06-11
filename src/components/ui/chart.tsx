"use client"

import * as React from "react"
import type { TooltipProps } from "recharts"
import { cn } from "@/lib/utils"

interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config?: ChartConfig
}

export function ChartContainer({ config, className, children, ...props }: ChartContainerProps) {
  // Create CSS variables for chart colors
  const style = React.useMemo(() => {
    if (!config) return {}

    return Object.entries(config).reduce(
      (acc, [key, value]) => {
        acc[`--color-${key}`] = value.color
        return acc
      },
      {} as Record<string, string>,
    )
  }, [config])

  return (
    <div
      className={cn("chart-container", className)}
      style={
        {
          "--chart-1": "215 100% 60%",
          "--chart-2": "200 100% 60%",
          "--chart-3": "150 100% 50%",
          "--chart-4": "300 100% 60%",
          "--chart-5": "50 100% 50%",
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  )
}

// Update the ChartTooltipContent props interface to match recharts Formatter type
interface ChartTooltipContentProps {
  active?: boolean
  payload?: any[]
  label?: string
  formatter?: TooltipProps<any, any>["formatter"]
  labelFormatter?: (label: any, payload: any[]) => React.ReactNode
  config?: ChartConfig
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
  config,
}: ChartTooltipContentProps) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="grid gap-2">
        {label && <div className="text-xs font-medium">{labelFormatter ? labelFormatter(label, payload) : label}</div>}
        <div className="grid gap-1">
          {payload.map((item, index) => {
            const color = config?.[item.dataKey]?.color || item.color || `hsl(var(--chart-${index + 1}))`
            const name = config?.[item.dataKey]?.label || item.name || item.dataKey
            const value = formatter ? formatter(item.value, item.dataKey, item, index, payload) : item.value
            return (
              <div key={item.dataKey} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs font-medium text-muted-foreground">{name}:</span>
                <span className="text-xs font-medium">{value}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Then update the ChartTooltip function to properly adapt the props
export function ChartTooltip(props: TooltipProps<any, any>) {
  // Create a wrapper component that adapts the recharts tooltip props to our custom component
  return (
    <ChartTooltipContent
      active={props.active}
      payload={props.payload}
      label={props.label}
      formatter={props.formatter}
      labelFormatter={props.labelFormatter}
      config={undefined}
    />
  )
}
