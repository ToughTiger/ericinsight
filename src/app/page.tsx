"use client";

import { useState, useEffect, useCallback } from 'react';
import type { TrialData, TrialFilters, Gender } from '@/services/clinical-trials';
import { getTrialData as fetchTrialData } from '@/services/clinical-trials';
import { summarizeTrialInsights } from '@/ai/flows/summarize-trial-insights';
import { AppHeader } from '@/components/layout/header';
import { FiltersPanel } from '@/components/dashboard/filters-panel';
import { TrialDataTable } from '@/components/dashboard/trial-data-table';
import { AiInsightsSummary } from '@/components/dashboard/ai-insights-summary';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

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
  const { toast } = useToast();

  const [availableTrialCenters, setAvailableTrialCenters] = useState<string[]>([]);
  const [availableGenders, setAvailableGenders] = useState<Gender[]>([]);
  const [availableAdverseEvents, setAvailableAdverseEvents] = useState<string[]>([]);
  const [availablePgaScores, setAvailablePgaScores] = useState<number[]>([]);

  // Simulate fetching available filter options
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
    setAiSummary(null); // Clear previous summary
    try {
      const data = await fetchTrialData(filters);
      setTrialData(data);

      if (data.length > 0) {
        const summaryOutput = await summarizeTrialInsights({ filters });
        setAiSummary(summaryOutput.summary);
      } else {
        setAiSummary(null); // No data to summarize
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

  // Initial data load on component mount
  useEffect(() => {
    applyFiltersAndSummarize();
  }, [applyFiltersAndSummarize]);


  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
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
        <Separator />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TrialDataTable data={trialData} isLoading={isLoading && isInitialLoad} />
          </div>
          <div className="lg:col-span-1">
            <AiInsightsSummary summary={aiSummary} isLoading={isLoading} />
          </div>
        </div>
      </main>
      <footer className="bg-secondary text-secondary-foreground py-4 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Trial Insights. All rights reserved.</p>
      </footer>
    </div>
  );
}
