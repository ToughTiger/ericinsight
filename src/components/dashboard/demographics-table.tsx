
"use client";

import type { TrialData } from '@/services/clinical-trials';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// Card, CardContent, CardHeader, CardTitle are removed as this component will be part of a larger card in page.tsx
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
// Users icon removed, as parent Card will have it.

interface DemographicsAndBaselineTableProps {
  data: TrialData[];
  isLoading: boolean;
}

const MAX_TABLE_HEIGHT = '300px';

export function DemographicsTable({ data, isLoading }: DemographicsAndBaselineTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <p className="text-center text-muted-foreground py-8">No participant data available for the selected filters.</p>
    );
  }

  return (
    <ScrollArea style={{ maxHeight: MAX_TABLE_HEIGHT }}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient ID</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Age Group</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Race</TableHead>
            <TableHead>Ethnicity</TableHead>
            <TableHead>Height (cm)</TableHead>
            <TableHead>Weight (kg)</TableHead>
            <TableHead>Surgery Last Year</TableHead>
            <TableHead>Work Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((trial) => (
            <TableRow key={trial.patientId} className="transition-colors hover:bg-muted/50">
              <TableCell className="font-medium">{trial.patientId}</TableCell>
              <TableCell>{trial.demographics.age}</TableCell>
              <TableCell>{trial.demographics.ageGroup}</TableCell>
              <TableCell>{trial.demographics.gender}</TableCell>
              <TableCell>{trial.demographics.race}</TableCell>
              <TableCell>{trial.demographics.ethnicity}</TableCell>
              <TableCell>{trial.demographics.heightCm ?? 'N/A'}</TableCell>
              <TableCell>{trial.demographics.weightKg ?? 'N/A'}</TableCell>
              <TableCell>{trial.baselineCharacteristics.surgeryLastYear ? 'Yes' : 'No'}</TableCell>
              <TableCell>{trial.baselineCharacteristics.workStatus}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
