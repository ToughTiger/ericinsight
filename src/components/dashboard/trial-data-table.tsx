
"use client";

import type { TrialData } from '@/services/clinical-trials';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { List, UserSearch, CheckCircle, XCircle } from 'lucide-react'; // Updated icons

interface TrialDataTableProps {
  data: TrialData[];
  isLoading: boolean;
  onPatientSelect: (patientId: string) => void;
  onPgaCellSelect?: (score: number) => void;
}

const MAX_TABLE_HEIGHT = '400px';

export function TrialDataTable({ data, isLoading, onPatientSelect, onPgaCellSelect }: TrialDataTableProps) {
  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
             <List className="mr-2 h-6 w-6 text-primary" />
            Patient Data Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
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
            <List className="mr-2 h-6 w-6 text-primary" />
            Patient Data Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">No data available for the selected filters.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <List className="mr-2 h-6 w-6 text-primary" />
          Patient Data Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea style={{ maxHeight: MAX_TABLE_HEIGHT }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient ID</TableHead>
                <TableHead>Center</TableHead>
                <TableHead>Treatment</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Age Group</TableHead>
                <TableHead>PGA Score</TableHead>
                <TableHead>ITT</TableHead>
                <TableHead>PP</TableHead>
                <TableHead>AE Count</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((trial) => (
                <TableRow key={trial.patientId} className="transition-colors hover:bg-muted/50">
                  <TableCell className="font-medium">{trial.patientId}</TableCell>
                  <TableCell>{trial.randomization.center}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        trial.randomization.treatment === 'Active Drug' ? 'default' : 
                        trial.randomization.treatment === 'Placebo' ? 'secondary' : 'outline'
                      }
                    >
                      {trial.randomization.treatment}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={trial.demographics.gender === 'Male' ? 'secondary' : trial.demographics.gender === 'Female' ? 'outline' : 'default'}>
                      {trial.demographics.gender}
                    </Badge>
                  </TableCell>
                  <TableCell>{trial.demographics.ageGroup}</TableCell>
                  <TableCell
                    onClick={() => onPgaCellSelect && onPgaCellSelect(trial.globalAssessment.pgaScore)}
                    className={onPgaCellSelect ? 'cursor-pointer hover:bg-muted' : ''}
                  >
                     <Badge variant="default" className="bg-accent text-accent-foreground">{trial.globalAssessment.pgaScore}</Badge>
                  </TableCell>
                  <TableCell>
                    {trial.studyPopulations.itt ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                  </TableCell>
                  <TableCell>
                    {trial.studyPopulations.pp ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                  </TableCell>
                  <TableCell>{trial.aeData.length}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPatientSelect(trial.patientId)}
                      aria-label={`View details for patient ${trial.patientId}`}
                    >
                      <UserSearch className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
