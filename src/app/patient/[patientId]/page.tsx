
"use client";

import type { NextPage } from 'next';
import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation'; 
import { useQuery } from '@tanstack/react-query';

import type { TrialData } from '@/services/clinical-trials';
import type { SummarizeTrialInsightsOutput, SummarizeTrialInsightsInput } from '@/ai/flows/summarize-trial-insights';
import { isAuthenticated, getSelectedStudyId, logout, getCurrentUser, getSelectedStudy, type User, type Study } from '@/lib/auth';


import { AppShell } from '@/components/layout/app-shell';
import { PatientFiltersPanel, type PatientSpecificFilters } from '@/components/patient/patient-filters-panel';
import { PatientView } from '@/components/patient/patient-view';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, AlertTriangle, UserCircle2, LogOut, FlaskConical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


async function fetchApi<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }
  return response.json();
}

async function postApi<T, B>(url: string, body: B): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }
  return response.json();
}


const PatientDetailPage: NextPage = () => {
  const params = useParams(); 
  const patientId = params?.patientId as string | undefined;
  const { toast } = useToast();
  const router = useRouter();
  const [currentUser, setCurrentUserLocal] = useState<User | null>(null);
  const [currentStudy, setCurrentStudyLocal] = useState<Study | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const selectedStudyId = typeof window !== 'undefined' ? getSelectedStudyId() : null;

  useEffect(() => {
    if (typeof window !== 'undefined') {
        if (!isAuthenticated()) {
        router.replace('/login');
        } else if (!selectedStudyId) {
        router.replace('/select-study');
        } else {
        setCurrentUserLocal(getCurrentUser());
        setCurrentStudyLocal(getSelectedStudy());
        }
        setAuthChecked(true);
    }
  }, [router, selectedStudyId]);

  const [patientSpecificFilters, setPatientSpecificFilters] = useState<PatientSpecificFilters>({
    vasTimePeriod: 'all',
  });

  const { data: patientData, isLoading: isLoadingPatient, error: patientError } = useQuery<TrialData, Error>({
    queryKey: ['patientData', patientId, selectedStudyId],
    queryFn: () => {
      if (!patientId) throw new Error("Patient ID is missing.");
      // If your API needs studyId for patient data:
      // return fetchApi<TrialData>(`/api/patients/${patientId}?studyId=${selectedStudyId}`);
      return fetchApi<TrialData>(`/api/patients/${patientId}`);
    },
    enabled: authChecked && !!patientId && !!selectedStudyId, 
    onError: (error) => {
      toast({ title: "Error", description: `Failed to load patient data: ${error.message}`, variant: "destructive" });
    }
  });

  const { data: aiSummaryData, isLoading: isLoadingAiSummary, error: aiSummaryError } = useQuery<SummarizeTrialInsightsOutput, Error>({
    queryKey: ['patientAiSummary', patientId, selectedStudyId],
    queryFn: () => {
      if (!patientId) throw new Error("Patient ID is missing for AI summary.");
      return postApi<SummarizeTrialInsightsOutput, SummarizeTrialInsightsInput>('/api/ai/summarize-insights', { patientId, studyId: selectedStudyId });
    },
    enabled: authChecked && !!patientData && !!selectedStudyId, 
    onError: (error) => {
       toast({ title: "Error", description: `Could not load AI summary: ${error.message}`, variant: "destructive" });
    }
  });
  
  const handlePatientFilterChange = useCallback(<K extends keyof PatientSpecificFilters>(key: K, value: PatientSpecificFilters[K]) => {
    setPatientSpecificFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const processedPatientData = useMemo(() => {
    if (!patientData) return null;

    let filteredVasData = [...patientData.vasData]; 

    if (patientSpecificFilters.vasTimePeriod !== 'all' && filteredVasData.length > 0) {
      const sortedVas = [...filteredVasData].sort((a, b) => b.day - a.day); // Sort descending to find max day easily
      const maxDay = sortedVas[0]?.day;

      if (maxDay !== undefined) {
        let daysToInclude = 0;
        if (patientSpecificFilters.vasTimePeriod === '7days') daysToInclude = 7;
        else if (patientSpecificFilters.vasTimePeriod === '14days') daysToInclude = 14;
        else if (patientSpecificFilters.vasTimePeriod === '30days') daysToInclude = 30;
        
        if (daysToInclude > 0) {
            // Filter from the original patientData.vasData to preserve original order for sorting later
            const cutoffDay = maxDay - daysToInclude + 1; 
            filteredVasData = patientData.vasData.filter(vas => vas.day >= cutoffDay && vas.day <= maxDay);
        }
      }
    }
    // Ensure final data is sorted by day ascending for the chart
    filteredVasData.sort((a,b) => a.day - b.day);


    return {
      ...patientData,
      vasData: filteredVasData,
    };
  }, [patientData, patientSpecificFilters]);


  const sidebar = useMemo(() => (
    <PatientFiltersPanel
        filters={patientSpecificFilters}
        onFilterChange={handlePatientFilterChange}
        isLoading={isLoadingPatient}
      />
  ), [patientSpecificFilters, handlePatientFilterChange, isLoadingPatient]);


  const PageSkeleton = () => (
    <div className="space-y-6">
        <Skeleton className="h-10 w-1/4 mb-6" />
        <Skeleton className="h-12 w-1/2 mb-6" />
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
        </div>
        <Skeleton className="h-60 w-full" />
        <Skeleton className="h-60 w-full" />
    </div>
  );
  
  const overallError = patientError || (!patientId && !isLoadingPatient && authChecked ? "Patient ID is missing." : null);

  if (!authChecked || !selectedStudyId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <FlaskConical className="h-16 w-16 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Loading patient details...</p>
        </div>
      </div>
    );
  }

  return (
    <AppShell sidebarContent={sidebar}>
        <div className="flex justify-between items-center mb-6">
            <Button variant="outline" asChild>
            <Link href="/" className="inline-flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Link>
            </Button>
            {currentUser && (
                <Button onClick={() => logout()} variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary/10">
                    <LogOut className="mr-2 h-4 w-4" /> Logout {currentUser.name}
                </Button>
            )}
        </div>


        {isLoadingPatient ? (
          <PageSkeleton />
        ) : overallError ? (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{overallError instanceof Error ? overallError.message : String(overallError)}</AlertDescription>
          </Alert>
        ) : processedPatientData ? (
          <>
            <h1 className="text-3xl font-bold text-primary flex items-center mb-6">
              <UserCircle2 className="mr-3 h-10 w-10" />
              Patient Details: {processedPatientData.patientId}
              {currentStudy && <span className="text-lg text-muted-foreground ml-2 font-normal">(Study: {currentStudy.name})</span>}
            </h1>
            <PatientView 
                patient={processedPatientData} 
                aiSummary={aiSummaryData?.summary ?? (isLoadingAiSummary ? null : "AI summary not available.")}
                isLoadingAiSummary={isLoadingAiSummary} 
            />
          </>
        ) : (
            <p className="text-muted-foreground text-center py-10">Patient data could not be loaded or found.</p>
        )}
    </AppShell>
  );
};

export default PatientDetailPage;
