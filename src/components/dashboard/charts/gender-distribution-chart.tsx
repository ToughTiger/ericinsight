
"use client";

import type { TrialData, Gender } from '@/services/clinical-trials';
import { Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip, Legend, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Users } from 'lucide-react';

interface GenderDistributionChartProps {
  data: TrialData[];
}

const GENDER_COLORS: Record<Gender, string> = {
  Male: "hsl(var(--chart-1))",
  Female: "hsl(var(--chart-2))",
  Other: "hsl(var(--chart-3))",
};

const chartConfig = {
  Male: { label: "Male", color: GENDER_COLORS.Male },
  Female: { label: "Female", color: GENDER_COLORS.Female },
  Other: { label: "Other", color: GENDER_COLORS.Other },
} satisfies ChartConfig;


export function GenderDistributionChart({ data }: GenderDistributionChartProps) {
  const genderCounts = data.reduce((acc, trial) => {
    acc[trial.gender] = (acc[trial.gender] || 0) + 1;
    return acc;
  }, {} as Record<Gender, number>);

  const chartData = Object.entries(genderCounts).map(([name, value]) => ({
    name: name as Gender,
    value,
    fill: GENDER_COLORS[name as Gender],
  }));

  if (chartData.length === 0) {
     return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5 text-primary" />
            Gender Distribution
          </CardTitle>
          <CardDescription>Distribution of genders among participants.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">No gender data to display.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5 text-primary" />
          Gender Distribution
        </CardTitle>
        <CardDescription>Distribution of genders among participants.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <ChartContainer config={chartConfig} className="h-[250px] w-full max-w-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel nameKey="name" />}
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  return (
                    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10px">
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
