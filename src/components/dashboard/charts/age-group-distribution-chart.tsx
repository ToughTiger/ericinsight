
"use client";

import type { TrialData } from '@/services/clinical-trials';
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { UsersRound } from 'lucide-react';

interface AgeGroupDistributionChartProps {
  data: TrialData[];
  onAgeGroupSelect?: (ageGroup: '18-30' | '31-45' | '46-60' | '61+' | 'Unknown') => void;
}

type AgeGroup = '18-30' | '31-45' | '46-60' | '61+' | 'Unknown';

const chartConfig = {
  count: {
    label: "Patient Count",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

const AGE_GROUP_ORDER: AgeGroup[] = ['18-30', '31-45', '46-60', '61+', 'Unknown'];

export function AgeGroupDistributionChart({ data, onAgeGroupSelect }: AgeGroupDistributionChartProps) {
  const ageGroupCounts = data.reduce((acc, trial) => {
    const group = trial.demographics.ageGroup;
    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {} as Record<AgeGroup, number>);

  const chartData = AGE_GROUP_ORDER.map(group => ({
    name: group,
    count: ageGroupCounts[group] || 0,
  })).filter(item => item.count > 0); // Only show groups with data

  if (chartData.length === 0) {
     return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UsersRound className="mr-2 h-5 w-5 text-primary" />
            Age Group Distribution
          </CardTitle>
          <CardDescription>Distribution of participants by age group.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">No age group data to display.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <UsersRound className="mr-2 h-5 w-5 text-primary" />
          Age Group Distribution
        </CardTitle>
        <CardDescription>Distribution by age group. Click a bar to filter.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} />
              <Tooltip
                cursor={onAgeGroupSelect ? { fill: 'hsl(var(--muted))' } : false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Legend />
              <Bar 
                dataKey="count" 
                fill="var(--color-count)" 
                radius={4}
                onClick={(dataPoint: any) => {
                  if (onAgeGroupSelect && dataPoint && dataPoint.name) {
                    onAgeGroupSelect(dataPoint.name as AgeGroup);
                  }
                }}
                style={{ cursor: onAgeGroupSelect ? 'pointer' : 'default' }}
              />
            </RechartsBarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

