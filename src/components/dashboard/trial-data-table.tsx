"use client";

import type { TrialData } from '@/services/clinical-trials';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { BarChart3 } from 'lucide-react';

interface TrialDataTableProps {
  data: TrialData[];
  isLoading: boolean;
}

const MAX_TABLE_HEIGHT = '400px'; // Max height before scrollbar appears

export function TrialDataTable({ data, isLoading }: TrialDataTableProps) {
  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
             <BarChart3 className="mr-2 h-6 w-6 text-primary" />
            Clinical Trial Data
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
            <BarChart3 className="mr-2 h-6 w-6 text-primary" />
            Clinical Trial Data
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
          <BarChart3 className="mr-2 h-6 w-6 text-primary" />
          Clinical Trial Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea style={{ maxHeight: MAX_TABLE_HEIGHT }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trial Center</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Adverse Events</TableHead>
                <TableHead>PGA Score</TableHead>
                <TableHead>PGA Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((trial, index) => (
                <TableRow key={index} className="transition-colors hover:bg-muted/50">
                  <TableCell>{trial.trialCenter.name}</TableCell>
                  <TableCell>{trial.trialCenter.location}</TableCell>
                  <TableCell>
                    <Badge variant={trial.gender === 'Male' ? 'secondary' : trial.gender === 'Female' ? 'outline' : 'default'}>
                      {trial.gender}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {trial.adverseEvents.map((event, i) => (
                      <Badge key={i} variant="destructive" className="mr-1 mb-1">
                        {event.name} ({event.severity})
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell>
                     <Badge variant="default" className="bg-accent text-accent-foreground">{trial.pga.score}</Badge>
                  </TableCell>
                  <TableCell>{trial.pga.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
