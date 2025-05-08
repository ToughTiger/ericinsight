
"use client";

import type { TrialData } from '@/services/clinical-trials';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, UserCircle, FlaskConical, Users, ShieldCheck, Activity } from 'lucide-react';

interface PatientDetailViewProps {
  patient: TrialData | null;
  aiSummary: string | null;
  isLoadingSummary: boolean;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <UserCircle className="mr-2 h-7 w-7 text-primary" />
            Patient Details: {patient.patientId}
          </DialogTitle>
          <DialogDescription>
            Detailed information and AI-generated insights for patient {patient.patientId}.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 min-h-0"> 
          {/* Changed pr-6 to p-4 for consistent padding around scrollable content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center">
                <FlaskConical className="mr-2 h-5 w-5 text-primary" /> Trial Information
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Trial Center:</strong> {patient.trialCenter.name}</p>
                <p><strong>Location:</strong> {patient.trialCenter.location}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center">
                <Users className="mr-2 h-5 w-5 text-primary" /> Demographics
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <strong className="mr-1">Gender:</strong> 
                  <Badge 
                    variant={patient.gender === 'Male' ? 'secondary' : patient.gender === 'Female' ? 'outline' : 'default'} 
                  >
                    {patient.gender}
                  </Badge>
                </div>
                <p><strong>Age:</strong> {patient.demographics.age} years</p>
                <p><strong>Race:</strong> {patient.demographics.race}</p>
                <p><strong>Ethnicity:</strong> {patient.demographics.ethnicity}</p>
                {patient.demographics.height && <p><strong>Height:</strong> {patient.demographics.height} cm</p>}
                {patient.demographics.weight && <p><strong>Weight:</strong> {patient.demographics.weight} kg</p>}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center">
                <ShieldCheck className="mr-2 h-5 w-5 text-primary" /> PGA Assessment
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center"><strong>Score:</strong> <Badge className="bg-accent text-accent-foreground ml-1">{patient.pga.score}</Badge></div>
                <p><strong>Description:</strong> {patient.pga.description}</p>
              </div>
            </div>

            <div className="md:col-span-2">
              <h3 className="font-semibold text-lg mb-2 flex items-center">
                <Activity className="mr-2 h-5 w-5 text-primary" /> Adverse Events
              </h3>
              {patient.adverseEvents.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {patient.adverseEvents.map((event, index) => (
                    <Badge key={index} variant="destructive">
                      {event.name} ({event.severity})
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No adverse events reported.</p>
              )}
            </div>

            <Card className="md:col-span-2 shadow-md bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center text-lg text-primary">
                  <Lightbulb className="mr-2 h-5 w-5" /> AI Insights for this Patient
                </CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <DialogFooter className="pt-4 border-t">
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
