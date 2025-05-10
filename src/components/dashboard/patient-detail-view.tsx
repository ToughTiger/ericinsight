
"use client";

import type { TrialData, AeDataRecord, VasDataPoint } from '@/services/clinical-trials';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Lightbulb, UserCircle, FlaskConical, Users, ShieldCheck, Activity, Stethoscope, 
  ClipboardList, LineChartIcon, Thermometer, HeartPulse, Wind, CalendarDays, CheckCircle, XCircle
} from 'lucide-react';
import { cn } from "@/lib/utils";

interface PatientDetailViewProps {
  patient: TrialData | null;
  aiSummary: string | null;
  isLoadingSummary: boolean;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const SectionCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode, className?: string }> = ({ title, icon, children, className }) => (
  <Card className={cn("shadow-md", className)}>
    <CardHeader>
      <CardTitle className="flex items-center text-lg text-primary">
        {icon} {title}
      </CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);


export function PatientDetailView({
  patient,
  aiSummary,
  isLoadingSummary,
  isOpen,
  onOpenChange,
}: PatientDetailViewProps) {
  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b sticky top-0 bg-background z-10">
          <DialogTitle className="flex items-center text-2xl">
            <UserCircle className="mr-3 h-8 w-8 text-primary" />
            Patient Details: {patient.patientId}
          </DialogTitle>
          <DialogDescription>
            Comprehensive information for patient {patient.patientId}.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6 space-y-6">
            <SectionCard title="Demographics" icon={<Users className="mr-2 h-5 w-5" />}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                <div><strong>Age:</strong> {patient.demographics.age} ({patient.demographics.ageGroup})</div>
                <div><strong>Gender:</strong> <Badge variant={patient.demographics.gender === 'Male' ? 'secondary' : patient.demographics.gender === 'Female' ? 'outline' : 'default'}>{patient.demographics.gender}</Badge></div>
                <div><strong>Race:</strong> {patient.demographics.race}</div>
                <div><strong>Ethnicity:</strong> {patient.demographics.ethnicity}</div>
                <div><strong>Height:</strong> {patient.demographics.heightCm ? `${patient.demographics.heightCm} cm` : 'N/A'}</div>
                <div><strong>Weight:</strong> {patient.demographics.weightKg ? `${patient.demographics.weightKg} kg` : 'N/A'}</div>
              </div>
            </SectionCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SectionCard title="Randomization" icon={<FlaskConical className="mr-2 h-5 w-5" />}>
                <div className="space-y-2 text-sm">
                  <div><strong>Trial Center:</strong> {patient.randomization.center}</div>
                  <div><strong>Treatment Group:</strong> <Badge>{patient.randomization.treatment}</Badge></div>
                </div>
              </SectionCard>

              <SectionCard title="Study Populations" icon={<ClipboardList className="mr-2 h-5 w-5" />}>
                 <div className="space-y-2 text-sm">
                    <div className="flex items-center"><strong>ITT:</strong> {patient.studyPopulations.itt ? <CheckCircle className="ml-2 h-5 w-5 text-green-500" /> : <XCircle className="ml-2 h-5 w-5 text-red-500" />}</div>
                    <div className="flex items-center"><strong>PP:</strong> {patient.studyPopulations.pp ? <CheckCircle className="ml-2 h-5 w-5 text-green-500" /> : <XCircle className="ml-2 h-5 w-5 text-red-500" />}</div>
                  </div>
              </SectionCard>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SectionCard title="Global Assessment (PGA)" icon={<ShieldCheck className="mr-2 h-5 w-5" />}>
                    <div className="space-y-2 text-sm">
                    <div><strong>Score:</strong> <Badge className="bg-accent text-accent-foreground">{patient.globalAssessment.pgaScore}</Badge></div>
                    <div><strong>Description:</strong> {patient.globalAssessment.pgaDescription}</div>
                    </div>
                </SectionCard>

                <SectionCard title="Baseline Characteristics" icon={<CalendarDays className="mr-2 h-5 w-5" />}>
                    <div className="space-y-2 text-sm">
                    <div><strong>Surgery Last Year:</strong> {patient.baselineCharacteristics.surgeryLastYear ? 'Yes' : 'No'}</div>
                    <div><strong>Work Status:</strong> {patient.baselineCharacteristics.workStatus}</div>
                    </div>
                </SectionCard>
            </div>

            <SectionCard title="Adverse Events" icon={<Activity className="mr-2 h-5 w-5" />} className="max-h-96 overflow-y-auto">
              {patient.aeData.length > 0 ? (
                 <Table>
                    <TableHeader>
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
                          <TableCell><Badge variant={event.aeSeverity === 'Severe' ? 'destructive' : 'secondary'}>{event.aeSeverity}</Badge></TableCell>
                          <TableCell>{event.aeRelationship}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No adverse events reported.</p>
              )}
            </SectionCard>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SectionCard title="VAS Data (Pain Score)" icon={<LineChartIcon className="mr-2 h-5 w-5" />} className="max-h-96 overflow-y-auto">
                {patient.vasData.length > 0 ? (
                    <Table>
                        <TableHeader><TableRow><TableHead>Day</TableHead><TableHead>VAS Score</TableHead></TableRow></TableHeader>
                        <TableBody>
                        {patient.vasData.map((vas: VasDataPoint, index: number) => (
                            <TableRow key={index}><TableCell>{vas.day}</TableCell><TableCell>{vas.vasScore}</TableCell></TableRow>
                        ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className="text-sm text-muted-foreground">No VAS data available.</p>
                )}
                </SectionCard>

                <SectionCard title="Vital Signs" icon={<HeartPulse className="mr-2 h-5 w-5" />}>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><strong>Systolic BP:</strong> {patient.vitalSigns.sbp ? `${patient.vitalSigns.sbp} mmHg` : 'N/A'}</div>
                        <div><strong>Diastolic BP:</strong> {patient.vitalSigns.dbp ? `${patient.vitalSigns.dbp} mmHg` : 'N/A'}</div>
                        <div><strong>Pulse Rate:</strong> {patient.vitalSigns.pr ? `${patient.vitalSigns.pr} bpm` : 'N/A'}</div>
                        <div><strong>Resp. Rate:</strong> {patient.vitalSigns.rr ? `${patient.vitalSigns.rr} breaths/min` : 'N/A'}</div>
                    </div>
                </SectionCard>
            </div>


            <SectionCard title="AI Insights for this Patient" icon={<Lightbulb className="mr-2 h-5 w-5" />} className="bg-primary/5 border-primary/20">
              {isLoadingSummary ? (
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
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
