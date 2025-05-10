
"use client";

import type { NextPage } from 'next';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation'; // Correct hook for App Router

import type { TrialData } from '@/services/clinical-trials';
import { getPatientById } from '@/services/clinical-trials';
import { summarizeTrialInsights } from '@/ai/flows/summarize-trial-insights';

import { PatientView } from '@/components/patient/patient-view';
import { AppHeader } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, AlertTriangle, UserCircle } from 'lucide-react'; // Added UserCircle import
import { Toaster } from '@/components/ui/toaster'; // Ensure Toaster is available for potential toasts

const PatientDetailPage: NextPage = () => {
  const params = useParams(); // Get route parameters
  const patientId = params?.patientId as string | undefined; // patientId can be string or string[]

  const [patientData, setPatientData] = useState<TrialData | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiSummaryLoading, setIsAiSummaryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            // Fetch AI summary after patient data is loaded
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
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader showSidebarTrigger={false} /> {/* No sidebar trigger on this page */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Button variant="outline" asChild>
          <Link href="/" className="inline-flex items-center">
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
        ) : patientData ? (
          <>
            <h1 className="text-3xl font-bold text-primary flex items-center">
              <UserCircle className="mr-3 h-10 w-10" />
              Patient Details: {patientData.patientId}
            </h1>
            <PatientView 
                patient={patientData} 
                aiSummary={aiSummary}
                isLoadingAiSummary={isAiSummaryLoading} 
            />
          </>
        ) : (
            <p className="text-muted-foreground text-center py-10">Patient data could not be loaded.</p>
        )}
      </main>
      <footer className="bg-secondary text-secondary-foreground py-4 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Trial Insights. All rights reserved.</p>
      </footer>
      <Toaster /> {/* Add Toaster here if any child components might use toast */}
    </div>
  );
};

export default PatientDetailPage;
