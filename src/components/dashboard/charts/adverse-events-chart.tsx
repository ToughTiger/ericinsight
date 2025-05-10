
"use client";

import type { TrialData } from '@/services/clinical-trials';
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { ShieldAlert } from 'lucide-react'; // Changed icon to ShieldAlert for AE

interface AdverseEventsChartProps {
  data: TrialData[];
}

const chartConfig = {
  frequency: {
    label: "Frequency",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function AdverseEventsChart({ data }: AdverseEventsChartProps) {
  const eventCounts = data.reduce((acc, trial) => {
    trial.aeData.forEach(event => { // Updated path to aeData
      acc[event.ae] = (acc[event.ae] || 0) + 1; // Updated field to event.ae
    });
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(eventCounts)
    .map(([name, frequency]) => ({ name, frequency }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10); 

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShieldAlert className="mr-2 h-5 w-5 text-primary" />
            Adverse Event Frequency
          </CardTitle>
          <CardDescription>Frequency of reported adverse events.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">No adverse event data to display.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ShieldAlert className="mr-2 h-5 w-5 text-primary" />
          Adverse Event Frequency
        </CardTitle>
        <CardDescription>Top reported adverse events by frequency.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis dataKey="name" type="category" width={80} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent />}
              />
              <Legend />
              <Bar dataKey="frequency" fill="var(--color-frequency)" radius={4} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
