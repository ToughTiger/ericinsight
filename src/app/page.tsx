
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { TrialData, TrialFilters, Gender } from '@/services/clinical-trials';
import { getTrialData as fetchTrialData, getPatientById } from '@/services/clinical-trials';
import { summarizeTrialInsights } from '@/ai/flows/summarize-trial-insights';

import { AppShell } from '@/components/layout/app-shell';
import { FiltersPanel } from '@/components/dashboard/filters-panel';
import { TrialDataTable } from '@/components/dashboard/trial-data-table';
import { AiInsightsSummary } from '@/components/dashboard/ai-insights-summary';
import { PatientDetailView } from '@/components/dashboard/patient-detail-view';
import { PgaDistributionChart } from '@/components/dashboard/charts/pga-distribution-chart';
import { AdverseEventsChart } from '@/components/dashboard/charts/adverse-events-chart';
import { GenderDistributionChart } from '@/components/dashboard/charts/gender-distribution-chart';

import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartPieIcon, PresentationChartLineIcon, TableCellsIcon } from '@heroicons/react/24/outline'; // Using heroicons for variety
import { BarChart, LineChart, PieChart } from 'lucide-react'; // Using lucide-react as preferred


// Mocked data for filter options until API provides them
const MOCK_TRIAL_CENTERS = ['City Hospital', 'General Clinic', 'University Medical Center', 'Rural Health Services'];
const MOCK_GENDERS: Gender[] = ['Male', 'Female', 'Other'];
const MOCK_ADVERSE_EVENTS = ['Headache', 'Nausea', 'Fatigue', 'Dizziness', 'Rash'];
const MOCK_PGA_SCORES = [0, 1, 2, 3, 4, 5];

export default function DashboardPage() {
  const [filters, setFilters] = useState<TrialFilters>({});
  const [trialData, setTrialData] = useState<TrialData[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const [selectedPatient, setSelectedPatient] = useState<TrialData | null>(null);
  const [isPatientDetailOpen, setIsPatientDetailOpen] = useState(false);
  const [patientAiSummary, setPatientAiSummary] = useState<string | null>(null);
  const [isPatientSummaryLoading, setIsPatientSummaryLoading] = useState(false);

  const { toast } = useToast();

  const [availableTrialCenters, setAvailableTrialCenters] = useState<string[]>([]);
  const [availableGenders, setAvailableGenders] = useState<Gender[]>([]);
  const [availableAdverseEvents, setAvailableAdverseEvents] = useState<string[]>([]);
  const [availablePgaScores, setAvailablePgaScores] = useState<number[]>([]);

  useEffect(() => {
    setAvailableTrialCenters(MOCK_TRIAL_CENTERS);
    setAvailableGenders(MOCK_GENDERS);
    setAvailableAdverseEvents(MOCK_ADVERSE_EVENTS);
    setAvailablePgaScores(MOCK_PGA_SCORES);
  }, []);

  const handleFilterChange = useCallback(<K extends keyof TrialFilters>(key: K, value: TrialFilters[K]) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  }, []);

  const applyFiltersAndSummarize = useCallback(async () => {
    setIsLoading(true);
    setAiSummary(null);
    try {
      const data = await fetchTrialData(filters);
      setTrialData(data);

      if (data.length > 0) {
        const summaryOutput = await summarizeTrialInsights({ filters });
        setAiSummary(summaryOutput.summary);
      } else {
        setAiSummary(null); 
      }
      
      if (!isInitialLoad) {
        toast({
          title: "Filters Applied",
          description: "Data and AI summary updated successfully.",
          variant: "default",
        });
      }

    } catch (error) {
      console.error("Error applying filters or summarizing:", error);
      toast({
        title: "Error",
        description: "Failed to update data or summary. Please try again.",
        variant: "destructive",
      });
      setTrialData([]);
      setAiSummary(null);
    } finally {
      setIsLoading(false);
      if (isInitialLoad) setIsInitialLoad(false);
    }
  }, [filters, toast, isInitialLoad]);

  useEffect(() => {
    applyFiltersAndSummarize();
  }, [applyFiltersAndSummarize]); // applyFiltersAndSummarize is stable due to useCallback

  const handlePatientSelect = useCallback(async (patientId: string) => {
    setIsPatientDetailOpen(true);
    setSelectedPatient(null); // Clear previous patient
    setPatientAiSummary(null);
    setIsPatientSummaryLoading(true);
    try {
      const patientData = await getPatientById(patientId);
      if (patientData) {
        setSelectedPatient(patientData);
        const summaryOutput = await summarizeTrialInsights({ patientId });
        setPatientAiSummary(summaryOutput.summary);
      } else {
        toast({ title: "Error", description: "Patient data not found.", variant: "destructive" });
        setIsPatientDetailOpen(false);
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
      toast({ title: "Error", description: "Failed to fetch patient details.", variant: "destructive" });
      setIsPatientDetailOpen(false);
    } finally {
      setIsPatientSummaryLoading(false);
    }
  }, [toast]);

  const sidebar = useMemo(() => (
    <FiltersPanel
      filters={filters}
      onFilterChange={handleFilterChange}
      onApplyFilters={applyFiltersAndSummarize}
      isLoading={isLoading}
      trialCenters={availableTrialCenters}
      genders={availableGenders}
      adverseEvents={availableAdverseEvents}
      pgaScores={availablePgaScores}
    />
  ), [filters, handleFilterChange, applyFiltersAndSummarize, isLoading, availableTrialCenters, availableGenders, availableAdverseEvents, availablePgaScores]);

  return (
    <AppShell sidebarContent={sidebar}>
      <div className="space-y-8">
        <AiInsightsSummary summary={aiSummary} isLoading={isLoading && trialData.length > 0} />
        
        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <BarChart className="mr-2 h-6 w-6 text-primary" />
              Data Visualizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && isInitialLoad ? (
              <p>Loading charts...</p>
            ) : trialData.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <PgaDistributionChart data={trialData} />
                <AdverseEventsChart data={trialData} />
                <GenderDistributionChart data={trialData} />
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No data available to display charts. Apply filters to see visualizations.</p>
            )}
          </CardContent>
        </Card>

        <Separator />

        <TrialDataTable data={trialData} isLoading={isLoading && isInitialLoad} onPatientSelect={handlePatientSelect} />
      </div>

      {selectedPatient && (
        <PatientDetailView
          patient={selectedPatient}
          aiSummary={patientAiSummary}
          isLoadingSummary={isPatientSummaryLoading}
          isOpen={isPatientDetailOpen}
          onOpenChange={setIsPatientDetailOpen}
        />
      )}
    </AppShell>
  );
}
