
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
import { Lightbulb, UserCircle, MapPin, Activity, ShieldCheck, FlaskConical } from 'lucide-react';

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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <UserCircle className="mr-2 h-7 w-7 text-primary" />
            Patient Details: {patient.patientId}
          </DialogTitle>
          <DialogDescription>
            Detailed information and AI-generated insights for patient {patient.patientId}.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-grow pr-6 -mr-6"> {/* Negative margin to compensate for scrollbar width within padding */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center">
                <FlaskConical className="mr-2 h-5 w-5 text-primary" /> Trial & Demographics
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Trial Center:</strong> {patient.trialCenter.name}</p>
                <p><strong>Location:</strong> {patient.trialCenter.location}</p>
                <p><strong>Gender:</strong> <Badge variant={patient.gender === 'Male' ? 'secondary' : patient.gender === 'Female' ? 'outline' : 'default'}>{patient.gender}</Badge></p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2 flex items-center">
                <ShieldCheck className="mr-2 h-5 w-5 text-primary" /> PGA Assessment
              </h3>
              <div className="space-y-2 text-sm">
                <p><strong>Score:</strong> <Badge className="bg-accent text-accent-foreground">{patient.pga.score}</Badge></p>
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

            <div className="md:col-span-2">
              <h3 className="font-semibold text-lg mb-3 flex items-center">
                <Lightbulb className="mr-2 h-5 w-5 text-primary" /> AI Insights for this Patient
              </h3>
              {isLoadingSummary ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : aiSummary ? (
                <p className="text-sm text-foreground/90 whitespace-pre-wrap bg-primary/5 p-3 rounded-md border border-primary/20">{aiSummary}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No AI summary available for this patient.</p>
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-auto pt-4 border-t">
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
