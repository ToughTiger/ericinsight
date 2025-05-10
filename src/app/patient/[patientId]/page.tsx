
"use client";

import type { NextPage } from 'next';
import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation'; 
import { useQuery } from '@tanstack/react-query';

import type { TrialData } from '@/services/clinical-trials';
import type { SummarizeTrialInsightsOutput } from '@/ai/flows/summarize-trial-insights';

import { AppShell } from '@/components/layout/app-shell';
import { PatientFiltersPanel, type PatientSpecificFilters } from '@/components/patient/patient-filters-panel';
import { PatientView } from '@/components/patient/patient-view';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, AlertTriangle, UserCircle2 } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster'; // Ensure Toaster is available if useToast is used implicitly
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

  const [patientSpecificFilters, setPatientSpecificFilters] = useState<PatientSpecificFilters>({
    vasTimePeriod: 'all',
  });

  const { data: patientData, isLoading: isLoadingPatient, error: patientError } = useQuery<TrialData, Error>({
    queryKey: ['patientData', patientId],
    queryFn: () => {
      if (!patientId) throw new Error("Patient ID is missing.");
      return fetchApi<TrialData>(`/api/patients/${patientId}`);
    },
    enabled: !!patientId, // Only run query if patientId is available
    onError: (error) => {
      toast({ title: "Error", description: `Failed to load patient data: ${error.message}`, variant: "destructive" });
    }
  });

  const { data: aiSummaryData, isLoading: isLoadingAiSummary, error: aiSummaryError } = useQuery<SummarizeTrialInsightsOutput, Error>({
    queryKey: ['patientAiSummary', patientId],
    queryFn: () => {
      if (!patientId) throw new Error("Patient ID is missing for AI summary.");
      return postApi<SummarizeTrialInsightsOutput, { patientId: string }>('/api/ai/summarize-insights', { patientId });
    },
    enabled: !!patientData, // Only run query if patientData has been successfully fetched
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
      const sortedVas = [...filteredVasData].sort((a, b) => b.day - a.day);
      const maxDay = sortedVas[0]?.day;

      if (maxDay !== undefined) {
        let daysToInclude = 0;
        if (patientSpecificFilters.vasTimePeriod === '7days') daysToInclude = 7;
        else if (patientSpecificFilters.vasTimePeriod === '14days') daysToInclude = 14;
        else if (patientSpecificFilters.vasTimePeriod === '30days') daysToInclude = 30;
        
        if (daysToInclude > 0) {
            const cutoffDay = maxDay - daysToInclude + 1; 
            filteredVasData = patientData.vasData.filter(vas => vas.day >= cutoffDay && vas.day <= maxDay);
        }
      }
    }
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
        isLoading={isLoadingPatient} // Sidebar interactivity depends on main data loading
      />
  ), [patientSpecificFilters, handlePatientFilterChange, isLoadingPatient]);


  const PageSkeleton = () => (
    <div className="space-y-6">
        <Skeleton className="h-10 w-1/4 mb-6" /> {/* Back button placeholder */}
        <Skeleton className="h-12 w-1/2 mb-6" /> {/* Title placeholder */}
        <Skeleton className="h-24 w-full" /> {/* AI Summary placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
        </div>
        <Skeleton className="h-60 w-full" />
        <Skeleton className="h-60 w-full" />
    </div>
  );
  
  const overallError = patientError || (!patientId && !isLoadingPatient ? "Patient ID is missing." : null);

  return (
    <AppShell sidebarContent={sidebar}>
        <Button variant="outline" asChild>
          <Link href="/" className="inline-flex items-center mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        {isLoadingPatient ? (
          <PageSkeleton />
        ) : overallError ? (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{overallError instanceof Error ? overallError.message : overallError}</AlertDescription>
          </Alert>
        ) : processedPatientData ? (
          <>
            <h1 className="text-3xl font-bold text-primary flex items-center mb-6">
              <UserCircle2 className="mr-3 h-10 w-10" />
              Patient Details: {processedPatientData.patientId}
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
      {/* Toaster is in RootLayout */}
    </AppShell>
  );
};

export default PatientDetailPage;
