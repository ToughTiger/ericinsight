
"use client";

import type { TrialData } from '@/services/clinical-trials';
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { TrendingUp } from 'lucide-react';

interface PgaDistributionChartProps {
  data: TrialData[];
  onScoreSelect?: (score: number) => void;
}

const chartConfig = {
  count: {
    label: "Patient Count",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function PgaDistributionChart({ data, onScoreSelect }: PgaDistributionChartProps) {
  const pgaCounts = data.reduce((acc, trial) => {
    const score = trial.pga.score;
    acc[score] = (acc[score] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const chartData = Object.entries(pgaCounts)
    .map(([scoreStr, count]) => ({
      scoreKey: `PGA ${scoreStr}`, // For XAxis display
      originalScore: parseInt(scoreStr), // Actual numeric score
      count,
    }))
    .sort((a, b) => a.originalScore - b.originalScore);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-primary" />
            PGA Score Distribution
          </CardTitle>
          <CardDescription>Distribution of Patient Global Assessment scores.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">No PGA data to display.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-primary" />
          PGA Score Distribution
        </CardTitle>
        <CardDescription>Distribution of Patient Global Assessment scores. Click a bar to filter.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="scoreKey" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} />
              <Tooltip
                cursor={onScoreSelect ? { fill: 'hsl(var(--muted))' } : false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Legend />
              <Bar 
                dataKey="count" 
                fill="var(--color-count)" 
                radius={4} 
                onClick={(dataPoint) => {
                  if (onScoreSelect && dataPoint && dataPoint.originalScore !== undefined) {
                    onScoreSelect(dataPoint.originalScore);
                  }
                }}
                style={{ cursor: onScoreSelect ? 'pointer' : 'default' }}
              />
            </RechartsBarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
