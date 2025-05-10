
"use client";

import type { TrialData, AeDataRecord, VasDataPoint } from '@/services/clinical-trials';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Lightbulb, UserCircle, FlaskConical, Users, ShieldCheck, Activity, ClipboardList, 
  HeartPulse, CalendarDays, CheckCircle, XCircle, LineChartIcon
} from 'lucide-react';
import { SectionCard } from '@/components/layout/section-card';
import { VasTimelineChart } from '@/components/patient/charts/vas-timeline-chart'; 

interface PatientViewProps {
  patient: TrialData; // This will be the processedPatientData with potentially filtered vasData
  aiSummary: string | null;
  isLoadingAiSummary: boolean;
}

export function PatientView({ patient, aiSummary, isLoadingAiSummary }: PatientViewProps) {
  return (
    <div className="space-y-6">
      <SectionCard 
        title="AI Insights for this Patient" 
        icon={<Lightbulb />} 
        className="bg-primary/5 border-primary/20"
      >
        {isLoadingAiSummary ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : aiSummary ? (
          <p className="text-sm text-foreground/90 whitespace-pre-wrap">{aiSummary}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No AI summary available for this patient.</p>
        )}
      </SectionCard>

      <SectionCard title="Demographics" icon={<Users />}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 text-sm">
          <div><strong>Age:</strong> {patient.demographics.age} ({patient.demographics.ageGroup})</div>
          <div><strong>Gender:</strong> <Badge variant={patient.demographics.gender === 'Male' ? 'secondary' : patient.demographics.gender === 'Female' ? 'outline' : 'default'}>{patient.demographics.gender}</Badge></div>
          <div><strong>Race:</strong> {patient.demographics.race || 'N/A'}</div>
          <div><strong>Ethnicity:</strong> {patient.demographics.ethnicity || 'N/A'}</div>
          <div><strong>Height:</strong> {patient.demographics.heightCm ? `${patient.demographics.heightCm} cm` : 'N/A'}</div>
          <div><strong>Weight:</strong> {patient.demographics.weightKg ? `${patient.demographics.weightKg} kg` : 'N/A'}</div>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard title="Randomization" icon={<FlaskConical />}>
          <div className="space-y-2 text-sm">
            <div><strong>Trial Center:</strong> {patient.randomization.center}</div>
            <div><strong>Treatment Group:</strong> <Badge className="bg-blue-500 text-white">{patient.randomization.treatment}</Badge></div>
          </div>
        </SectionCard>

        <SectionCard title="Study Populations" icon={<ClipboardList />}>
           <div className="space-y-2 text-sm">
              <div className="flex items-center"><strong>ITT:</strong> {patient.studyPopulations.itt ? <CheckCircle className="ml-2 h-5 w-5 text-green-500" /> : <XCircle className="ml-2 h-5 w-5 text-red-500" />}</div>
              <div className="flex items-center"><strong>PP:</strong> {patient.studyPopulations.pp ? <CheckCircle className="ml-2 h-5 w-5 text-green-500" /> : <XCircle className="ml-2 h-5 w-5 text-red-500" />}</div>
            </div>
        </SectionCard>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SectionCard title="Global Assessment (PGA)" icon={<ShieldCheck />}>
              <div className="space-y-2 text-sm">
              <div><strong>Score:</strong> <Badge className="bg-accent text-accent-foreground">{patient.globalAssessment.pgaScore}</Badge></div>
              <div><strong>Description:</strong> {patient.globalAssessment.pgaDescription}</div>
              </div>
          </SectionCard>

          <SectionCard title="Baseline Characteristics" icon={<CalendarDays />}>
              <div className="space-y-2 text-sm">
              <div><strong>Surgery Last Year:</strong> {patient.baselineCharacteristics.surgeryLastYear ? 'Yes' : 'No'}</div>
              <div><strong>Work Status:</strong> {patient.baselineCharacteristics.workStatus}</div>
              </div>
          </SectionCard>
      </div>

      <SectionCard title="Adverse Events" icon={<Activity />} contentClassName="max-h-96">
        {patient.aeData.length > 0 ? (
          <ScrollArea className="max-h-80"> 
           <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Relationship</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patient.aeData.map((event: AeDataRecord, index: number) => (
                  <TableRow key={index}>
                    <TableCell>{event.ae}</TableCell>
                    <TableCell><Badge variant={event.aeSeverity === 'Severe' ? 'destructive' : event.aeSeverity === 'Moderate' ? 'secondary' : 'outline' }>{event.aeSeverity}</Badge></TableCell>
                    <TableCell>{event.aeRelationship}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <p className="text-sm text-muted-foreground">No adverse events reported.</p>
        )}
      </SectionCard>
      
      {/* VasTimelineChart will now display patient.vasData which could be filtered by the page */}
      <SectionCard title="VAS Data (Pain Score)" icon={<LineChartIcon />}>
          <VasTimelineChart vasData={patient.vasData} />
      </SectionCard>

      <SectionCard title="Vital Signs" icon={<HeartPulse />}>
          <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>Systolic BP:</strong> {patient.vitalSigns.sbp ? `${patient.vitalSigns.sbp} mmHg` : 'N/A'}</div>
              <div><strong>Diastolic BP:</strong> {patient.vitalSigns.dbp ? `${patient.vitalSigns.dbp} mmHg` : 'N/A'}</div>
              <div><strong>Pulse Rate:</strong> {patient.vitalSigns.pr ? `${patient.vitalSigns.pr} bpm` : 'N/A'}</div>
              <div><strong>Resp. Rate:</strong> {patient.vitalSigns.rr ? `${patient.vitalSigns.rr} breaths/min` : 'N/A'}</div>
          </div>
      </SectionCard>
    </div>
  );
}
