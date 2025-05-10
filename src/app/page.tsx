
"use client";

import { useState, useCallback, useMemo } from 'react';
import type { TrialData, TrialFilters, Gender } from '@/services/clinical-trials';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { AppShell } from '@/components/layout/app-shell';
import { FiltersPanel } from '@/components/dashboard/filters-panel';
import { TrialDataTable } from '@/components/dashboard/trial-data-table';
import { AiInsightsSummary } from '@/components/dashboard/ai-insights-summary';
import { PgaDistributionChart } from '@/components/dashboard/charts/pga-distribution-chart';
import { AdverseEventsChart } from '@/components/dashboard/charts/adverse-events-chart';
import { GenderDistributionChart } from '@/components/dashboard/charts/gender-distribution-chart';
import { DemographicsTable } from '@/components/dashboard/demographics-table';
import { TreatmentDistributionChart } from '@/components/dashboard/charts/treatment-distribution-chart';
import { AgeGroupDistributionChart } from '@/components/dashboard/charts/age-group-distribution-chart';

import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Users } from 'lucide-react';
import type { SummarizeTrialInsightsOutput } from '@/ai/flows/summarize-trial-insights';

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


export default function DashboardPage() {
  const [filters, setFilters] = useState<TrialFilters>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: availableTrialCenters = [] } = useQuery<string[], Error>({
    queryKey: ['trialCenterOptions'],
    queryFn: () => fetchApi<string[]>('/api/filters/centers'),
    onError: (error) => toast({ title: "Error", description: `Could not load trial center options: ${error.message}`, variant: "destructive" }),
  });
  const { data: availableGenders = [] } = useQuery<Gender[], Error>({
    queryKey: ['genderOptions'],
    queryFn: () => fetchApi<Gender[]>('/api/filters/genders'),
     onError: (error) => toast({ title: "Error", description: `Could not load gender options: ${error.message}`, variant: "destructive" }),
  });
  const { data: availableAdverseEvents = [] } = useQuery<string[], Error>({
    queryKey: ['adverseEventOptions'],
    queryFn: () => fetchApi<string[]>('/api/filters/adverse-events'),
    onError: (error) => toast({ title: "Error", description: `Could not load adverse event options: ${error.message}`, variant: "destructive" }),
  });
  const { data: availablePgaScores = [] } = useQuery<number[], Error>({
    queryKey: ['pgaScoreOptions'],
    queryFn: () => fetchApi<number[]>('/api/filters/pga-scores'),
    onError: (error) => toast({ title: "Error", description: `Could not load PGA score options: ${error.message}`, variant: "destructive" }),
  });
  const { data: availableTreatments = [] } = useQuery<Array<'Active Drug' | 'Placebo' | 'Comparator'>, Error>({
    queryKey: ['treatmentOptions'],
    queryFn: () => fetchApi<Array<'Active Drug' | 'Placebo' | 'Comparator'>>('/api/filters/treatments'),
    onError: (error) => toast({ title: "Error", description: `Could not load treatment options: ${error.message}`, variant: "destructive" }),
  });
  const { data: availableAgeGroups = [] } = useQuery<Array<'18-30' | '31-45' | '46-60' | '61+' | 'Unknown'>, Error>({
    queryKey: ['ageGroupOptions'],
    queryFn: () => fetchApi<Array<'18-30' | '31-45' | '46-60' | '61+' | 'Unknown'>>('/api/filters/age-groups'),
    onError: (error) => toast({ title: "Error", description: `Could not load age group options: ${error.message}`, variant: "destructive" }),
  });

  const { data: trialData = [], isLoading: isLoadingTrialData, refetch: refetchTrialData } = useQuery<TrialData[], Error>({
    queryKey: ['trialData', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value).trim() !== '') {
          params.append(key, String(value));
        }
      });
      return fetchApi<TrialData[]>(`/api/trials?${params.toString()}`);
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to fetch trial data: ${error.message}`, variant: "destructive" });
    },
  });

  const { data: aiSummaryData, isLoading: isLoadingAiSummary, refetch: refetchAiSummary } = useQuery<SummarizeTrialInsightsOutput, Error>({
    queryKey: ['aiSummary', filters],
    queryFn: () => postApi<SummarizeTrialInsightsOutput, { filters: TrialFilters }>('/api/ai/summarize-insights', { filters }),
    enabled: trialData.length > 0 || Object.keys(filters).length > 0, // Fetch only when data or filters are present
    onSuccess: () => {
        if (Object.keys(filters).length > 0) { // Avoid toast on initial load with no filters
            toast({ title: "Insights Updated", description: "AI summary refreshed based on new data." });
        }
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to generate AI summary: ${error.message}`, variant: "destructive" });
    },
  });
  
  const handleFilterChange = useCallback(<K extends keyof TrialFilters>(key: K, value: TrialFilters[K] | undefined) => {
    setFilters((prevFilters) => {
      const newFilters = {...prevFilters};
      if (value === undefined || (typeof value === 'string' && value === '')) {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }
      return newFilters;
    });
  }, []);

  const applyFiltersAndSummarize = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['trialData', filters] });
    queryClient.invalidateQueries({ queryKey: ['aiSummary', filters] });
    // Toasts are now handled in onSuccess/onError of useQuery
    if (Object.keys(filters).length > 0) {
        toast({
          title: "Filters Applied",
          description: "Data and AI summary are being updated.",
        });
    }
  }, [filters, queryClient, toast]);
  
  const handlePgaScoreSelect = useCallback((score: number) => {
    const newFilters = { ...filters, pgaScore: score };
    setFilters(newFilters);
    // Data will refetch due to filters changing in queryKey
  }, [filters]);

  const handleTreatmentSelect = useCallback((treatment: 'Active Drug' | 'Placebo' | 'Comparator') => {
    const newFilters = { ...filters, treatment: treatment };
    setFilters(newFilters);
  }, [filters]);

  const handleAgeGroupSelect = useCallback((ageGroup: '18-30' | '31-45' | '46-60' | '61+' | 'Unknown') => {
    const newFilters = { ...filters, ageGroup: ageGroup };
    setFilters(newFilters);
  }, [filters]);

  const isLoading = isLoadingTrialData || isLoadingAiSummary;

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
      treatments={availableTreatments}
      ageGroups={availableAgeGroups}
    />
  ), [
      filters, handleFilterChange, applyFiltersAndSummarize, isLoading, 
      availableTrialCenters, availableGenders, availableAdverseEvents, availablePgaScores,
      availableTreatments, availableAgeGroups
    ]);

  return (
    <AppShell sidebarContent={sidebar}>
      <div className="space-y-8">
        <AiInsightsSummary summary={aiSummaryData?.summary ?? (isLoadingAiSummary ? null : "Apply filters to generate AI insights.")} isLoading={isLoadingAiSummary || (isLoadingTrialData && trialData.length === 0 && Object.keys(filters).length > 0)} />
        
        <Separator />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <BarChart className="mr-2 h-6 w-6 text-primary" />
              Data Visualizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTrialData && trialData.length === 0 ? (
              <p className="text-muted-foreground py-4">Loading charts...</p>
            ) : trialData.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <PgaDistributionChart data={trialData} onScoreSelect={handlePgaScoreSelect} />
                <AdverseEventsChart data={trialData} />
                <GenderDistributionChart data={trialData} />
                <TreatmentDistributionChart data={trialData} onTreatmentSelect={handleTreatmentSelect} />
                <AgeGroupDistributionChart data={trialData} onAgeGroupSelect={handleAgeGroupSelect} />
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No data available to display charts. Apply filters to see visualizations.</p>
            )}
          </CardContent>
        </Card>

        <Separator />
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center text-xl">
                    <Users className="mr-2 h-6 w-6 text-primary" />
                    Participant Overview
                </CardTitle>
            </CardHeader>
            <CardContent>
                <DemographicsTable data={trialData} isLoading={isLoadingTrialData && trialData.length === 0} />
            </CardContent>
        </Card>

        <Separator />
        
        <TrialDataTable 
          data={trialData} 
          isLoading={isLoadingTrialData && trialData.length === 0} 
          onPgaCellSelect={handlePgaScoreSelect}
        />
      </div>
    </AppShell>
  );
}
