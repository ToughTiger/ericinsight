
"use client";

import type { VasDataPoint } from '@/services/clinical-trials';
import { Line, LineChart as RechartsLineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { LineChartIcon } from 'lucide-react'; // Using an appropriate icon

interface VasTimelineChartProps {
  vasData: VasDataPoint[];
}

const chartConfig = {
  vasScore: {
    label: "VAS Score",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function VasTimelineChart({ vasData }: VasTimelineChartProps) {
  if (!vasData || vasData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LineChartIcon className="mr-2 h-5 w-5 text-primary" />
            VAS Score Timeline
          </CardTitle>
          <CardDescription>Visual Analog Scale (Pain) score over time.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">No VAS data available to display chart.</p>
        </CardContent>
      </Card>
    );
  }

  // Sort data by day to ensure the line chart is drawn correctly
  const sortedVasData = [...vasData].sort((a, b) => a.day - b.day);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <LineChartIcon className="mr-2 h-5 w-5 text-primary" />
          VAS Score Timeline
        </CardTitle>
        <CardDescription>Visual Analog Scale (Pain) score over time.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={sortedVasData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="day" 
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(day) => `Day ${day}`}
                tickLine={false} 
                axisLine={false} 
                tickMargin={8} 
              />
              <YAxis 
                dataKey="vasScore" 
                type="number"
                domain={[0, 10]} // VAS typically 0-10
                allowDecimals={false} 
                tickLine={false} 
                axisLine={false} 
                tickMargin={8} 
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="vasScore" 
                stroke="var(--color-vasScore)" 
                strokeWidth={2} 
                dot={{ r: 4, fill: "var(--color-vasScore)" }}
                activeDot={{ r: 6 }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
