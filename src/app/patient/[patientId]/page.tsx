
"use client";

import type { NextPage } from 'next';
import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation'; 

import type { TrialData, VasDataPoint } from '@/services/clinical-trials';
import { getPatientById } from '@/services/clinical-trials';
import { summarizeTrialInsights } from '@/ai/flows/summarize-trial-insights';

import { AppShell } from '@/components/layout/app-shell';
import { PatientFiltersPanel, type PatientSpecificFilters } from '@/components/patient/patient-filters-panel';
import { PatientView } from '@/components/patient/patient-view';
import { AppHeader } from '@/components/layout/header'; // Already imported, ensure it's used by AppShell
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, AlertTriangle, UserCircle } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';

const PatientDetailPage: NextPage = () => {
  const params = useParams(); 
  const patientId = params?.patientId as string | undefined;

  const [patientData, setPatientData] = useState<TrialData | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiSummaryLoading, setIsAiSummaryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [patientSpecificFilters, setPatientSpecificFilters] = useState<PatientSpecificFilters>({
    vasTimePeriod: 'all',
    // Potentially add other filters like aeSeverity here later
  });

  useEffect(() => {
    if (patientId) {
      const fetchData = async () => {
        setIsLoading(true);
        setIsAiSummaryLoading(true);
        setError(null);
        try {
          const patient = await getPatientById(patientId);
          if (patient) {
            setPatientData(patient);
            // Fetch AI summary for the entire patient record
            try {
                const summaryOutput = await summarizeTrialInsights({ patientId });
                setAiSummary(summaryOutput.summary);
            } catch (aiError) {
                console.error("Error fetching AI summary:", aiError);
                setAiSummary("Could not load AI summary for this patient.");
            } finally {
                setIsAiSummaryLoading(false);
            }
          } else {
            setError(`Patient with ID ${patientId} not found.`);
          }
        } catch (err) {
          console.error("Error fetching patient data:", err);
          setError("Failed to load patient data. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    } else {
        setError("Patient ID is missing.");
        setIsLoading(false);
        setIsAiSummaryLoading(false);
    }
  }, [patientId]);

  const handlePatientFilterChange = useCallback(<K extends keyof PatientSpecificFilters>(key: K, value: PatientSpecificFilters[K]) => {
    setPatientSpecificFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const processedPatientData = useMemo(() => {
    if (!patientData) return null;

    let filteredVasData = [...patientData.vasData]; // Start with all VAS data

    if (patientSpecificFilters.vasTimePeriod !== 'all' && filteredVasData.length > 0) {
      // Sort by day descending to easily get the latest data
      const sortedVas = [...filteredVasData].sort((a, b) => b.day - a.day);
      const maxDay = sortedVas[0]?.day;

      if (maxDay !== undefined) {
        let daysToInclude = 0;
        if (patientSpecificFilters.vasTimePeriod === '7days') daysToInclude = 7;
        else if (patientSpecificFilters.vasTimePeriod === '14days') daysToInclude = 14;
        else if (patientSpecificFilters.vasTimePeriod === '30days') daysToInclude = 30;
        
        if (daysToInclude > 0) {
            const cutoffDay = maxDay - daysToInclude +1; // +1 because day 0 is a day
            filteredVasData = patientData.vasData.filter(vas => vas.day >= cutoffDay && vas.day <=maxDay);
        }
      }
    }
     // Sort by day ascending for the chart
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
        // onApplyFilters={() => {}} // Apply on change for simplicity, or add button
        isLoading={isLoading}
      />
  ), [patientSpecificFilters, handlePatientFilterChange, isLoading]);


  const PageSkeleton = () => (
    <div className="space-y-6">
        <Skeleton className="h-10 w-1/4" /> {/* Back button placeholder */}
        <Skeleton className="h-12 w-1/2" /> {/* Title placeholder */}
        <Skeleton className="h-24 w-full" /> {/* AI Summary placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
        </div>
        <Skeleton className="h-60 w-full" />
        <Skeleton className="h-60 w-full" />
    </div>
    );

  return (
    <AppShell sidebarContent={sidebar}>
        <Button variant="outline" asChild>
          <Link href="/" className="inline-flex items-center mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        {isLoading ? (
          <PageSkeleton />
        ) : error ? (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : processedPatientData ? (
          <>
            <h1 className="text-3xl font-bold text-primary flex items-center mb-6">
              <UserCircle className="mr-3 h-10 w-10" />
              Patient Details: {processedPatientData.patientId}
            </h1>
            <PatientView 
                patient={processedPatientData} 
                aiSummary={aiSummary} // AI summary is for the whole patient
                isLoadingAiSummary={isAiSummaryLoading} 
            />
          </>
        ) : (
            <p className="text-muted-foreground text-center py-10">Patient data could not be loaded.</p>
        )}
      <Toaster />
    </AppShell>
  );
};

export default PatientDetailPage;
