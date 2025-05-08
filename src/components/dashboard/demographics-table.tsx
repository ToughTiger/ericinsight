
"use client";

import type { TrialData } from '@/services/clinical-trials';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users } from 'lucide-react'; // Using Users icon for demographics

interface DemographicsTableProps {
  data: TrialData[];
  isLoading: boolean;
}

const MAX_TABLE_HEIGHT = '300px'; // Max height before scrollbar appears

export function DemographicsTable({ data, isLoading }: DemographicsTableProps) {
  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Users className="mr-2 h-6 w-6 text-primary" />
            Demographics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Users className="mr-2 h-6 w-6 text-primary" />
            Demographics Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No demographic data available for the selected filters.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Users className="mr-2 h-6 w-6 text-primary" />
          Demographics Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea style={{ maxHeight: MAX_TABLE_HEIGHT }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient ID</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Race</TableHead>
                <TableHead>Ethnicity</TableHead>
                <TableHead>Height (cm)</TableHead>
                <TableHead>Weight (kg)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((trial) => (
                <TableRow key={trial.patientId} className="transition-colors hover:bg-muted/50">
                  <TableCell className="font-medium">{trial.patientId}</TableCell>
                  <TableCell>{trial.demographics.age}</TableCell>
                  <TableCell>{trial.gender}</TableCell>
                  <TableCell>{trial.demographics.race}</TableCell>
                  <TableCell>{trial.demographics.ethnicity}</TableCell>
                  <TableCell>{trial.demographics.height ?? 'N/A'}</TableCell>
                  <TableCell>{trial.demographics.weight ?? 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
