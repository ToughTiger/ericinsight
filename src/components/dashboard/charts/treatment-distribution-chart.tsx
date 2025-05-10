
"use client";

import type { TrialData } from '@/services/clinical-trials';
import { Pie, PieChart as RechartsPieChart, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Stethoscope } from 'lucide-react';

interface TreatmentDistributionChartProps {
  data: TrialData[];
  onTreatmentSelect?: (treatment: 'Active Drug' | 'Placebo' | 'Comparator') => void;
}

type TreatmentGroup = 'Active Drug' | 'Placebo' | 'Comparator';

const TREATMENT_COLORS: Record<TreatmentGroup, string> = {
  'Active Drug': "hsl(var(--chart-1))",
  'Placebo': "hsl(var(--chart-2))",
  'Comparator': "hsl(var(--chart-3))",
};

const chartConfigBase = {
  'Active Drug': { label: "Active Drug", color: TREATMENT_COLORS['Active Drug'] },
  'Placebo': { label: "Placebo", color: TREATMENT_COLORS['Placebo'] },
  'Comparator': { label: "Comparator", color: TREATMENT_COLORS['Comparator'] },
} satisfies ChartConfig;


export function TreatmentDistributionChart({ data, onTreatmentSelect }: TreatmentDistributionChartProps) {
  const treatmentCounts = data.reduce((acc, trial) => {
    const treatment = trial.randomization.treatment;
    acc[treatment] = (acc[treatment] || 0) + 1;
    return acc;
  }, {} as Record<TreatmentGroup, number>);

  const chartData = Object.entries(treatmentCounts).map(([name, value]) => ({
    name: name as TreatmentGroup,
    value,
    fill: TREATMENT_COLORS[name as TreatmentGroup],
  }));

  if (chartData.length === 0) {
     return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Stethoscope className="mr-2 h-5 w-5 text-primary" />
            Treatment Group Distribution
          </CardTitle>
          <CardDescription>Distribution of participants by treatment group.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">No treatment data to display.</p>
        </CardContent>
      </Card>
    );
  }
  
  const activeChartConfig = Object.fromEntries(
    Object.entries(chartConfigBase).filter(([key]) => chartData.some(d => d.name === key))
  ) as ChartConfig;


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Stethoscope className="mr-2 h-5 w-5 text-primary" />
          Treatment Group Distribution
        </CardTitle>
        <CardDescription>Distribution by treatment group. Click a slice to filter.</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <ChartContainer config={activeChartConfig} className="h-[250px] w-full max-w-[300px]">
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
                onClick={(dataPoint: any) => {
                  if (onTreatmentSelect && dataPoint && dataPoint.name) {
                    onTreatmentSelect(dataPoint.name as TreatmentGroup);
                  }
                }}
                style={{ cursor: onTreatmentSelect ? 'pointer' : 'default' }}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
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
