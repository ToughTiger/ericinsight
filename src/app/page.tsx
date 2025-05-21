
"use client";

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { TrialData, TrialFilters, Gender } from '@/services/clinical-trials';
import { isAuthenticated, getSelectedStudyId, logout, getCurrentUser, getSelectedStudy, type User, type Study } from '@/lib/auth';
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
import { BarChart, Users, LogOut, FlaskConical } from 'lucide-react';
import type { SummarizeTrialInsightsOutput, SummarizeTrialInsightsInput } from '@/ai/flows/summarize-trial-insights';
import { Button } from '@/components/ui/button';


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
  const router = useRouter();
  const [currentUser, setCurrentUserLocal] = useState<User | null>(null);
  const [currentStudy, setCurrentStudyLocal] = useState<Study | null>(null);
  const [authChecked, setAuthChecked] = useState(false);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!isAuthenticated()) {
        router.replace('/login');
      } else if (!getSelectedStudyId()) {
        router.replace('/select-study');
      } else {
        setCurrentUserLocal(getCurrentUser());
        setCurrentStudyLocal(getSelectedStudy());
      }
      setAuthChecked(true);
    }
  }, [router]);


  const [filters, setFilters] = useState<TrialFilters>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const selectedStudyId = typeof window !== 'undefined' ? getSelectedStudyId() : null;


  const { data: availableTrialCenters = [] } = useQuery<string[], Error>({
    queryKey: ['trialCenterOptions', selectedStudyId],
    queryFn: () => fetchApi<string[]>('/api/filters/centers'),
    enabled: authChecked && !!selectedStudyId,
    onError: (error) => toast({ title: "Error", description: `Could not load trial center options: ${error.message}`, variant: "destructive" }),
  });
  const { data: availableGenders = [] } = useQuery<Gender[], Error>({
    queryKey: ['genderOptions', selectedStudyId],
    queryFn: () => fetchApi<Gender[]>('/api/filters/genders'),
    enabled: authChecked && !!selectedStudyId,
     onError: (error) => toast({ title: "Error", description: `Could not load gender options: ${error.message}`, variant: "destructive" }),
  });
  const { data: availableAdverseEvents = [] } = useQuery<string[], Error>({
    queryKey: ['adverseEventOptions', selectedStudyId],
    queryFn: () => fetchApi<string[]>('/api/filters/adverse-events'),
    enabled: authChecked && !!selectedStudyId,
    onError: (error) => toast({ title: "Error", description: `Could not load adverse event options: ${error.message}`, variant: "destructive" }),
  });
  const { data: availablePgaScores = [] } = useQuery<number[], Error>({
    queryKey: ['pgaScoreOptions', selectedStudyId],
    queryFn: () => fetchApi<number[]>('/api/filters/pga-scores'),
    enabled: authChecked && !!selectedStudyId,
    onError: (error) => toast({ title: "Error", description: `Could not load PGA score options: ${error.message}`, variant: "destructive" }),
  });
  const { data: availableTreatments = [] } = useQuery<Array<'Active Drug' | 'Placebo' | 'Comparator'>, Error>({
    queryKey: ['treatmentOptions', selectedStudyId],
    queryFn: () => fetchApi<Array<'Active Drug' | 'Placebo' | 'Comparator'>>('/api/filters/treatments'),
    enabled: authChecked && !!selectedStudyId,
    onError: (error) => toast({ title: "Error", description: `Could not load treatment options: ${error.message}`, variant: "destructive" }),
  });
  const { data: availableAgeGroups = [] } = useQuery<Array<'18-30' | '31-45' | '46-60' | '61+' | 'Unknown'>, Error>({
    queryKey: ['ageGroupOptions', selectedStudyId],
    queryFn: () => fetchApi<Array<'18-30' | '31-45' | '46-60' | '61+' | 'Unknown'>>('/api/filters/age-groups'),
    enabled: authChecked && !!selectedStudyId,
    onError: (error) => toast({ title: "Error", description: `Could not load age group options: ${error.message}`, variant: "destructive" }),
  });

  const { data: trialData = [], isLoading: isLoadingTrialData } = useQuery<TrialData[], Error>({
    queryKey: ['trialData', filters, selectedStudyId], 
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value).trim() !== '') {
          params.append(key, String(value));
        }
      });
      // If your API needs studyId for filtering trial data:
      // if (selectedStudyId) params.append('studyId', selectedStudyId);
      return fetchApi<TrialData[]>(`/api/trials?${params.toString()}`);
    },
    enabled: authChecked && !!selectedStudyId, 
    onError: (error) => {
      toast({ title: "Error", description: `Failed to fetch trial data: ${error.message}`, variant: "destructive" });
    },
  });

  const { data: aiSummaryData, isLoading: isLoadingAiSummary } = useQuery<SummarizeTrialInsightsOutput, Error>({
    queryKey: ['aiSummary', filters, selectedStudyId], 
    queryFn: () => postApi<SummarizeTrialInsightsOutput, SummarizeTrialInsightsInput>('/api/ai/summarize-insights', { filters, studyId: selectedStudyId }),
    enabled: authChecked && (trialData.length > 0 || Object.keys(filters).length > 0) && !!selectedStudyId,
    onSuccess: () => {
        if (Object.keys(filters).length > 0) {
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
    queryClient.invalidateQueries({ queryKey: ['trialData', filters, selectedStudyId] });
    queryClient.invalidateQueries({ queryKey: ['aiSummary', filters, selectedStudyId] });
    if (Object.keys(filters).length > 0) {
        toast({
          title: "Filters Applied",
          description: "Data and AI summary are being updated.",
        });
    }
  }, [filters, queryClient, toast, selectedStudyId]);
  
  const handlePgaScoreSelect = useCallback((score: number) => {
    const newFilters = { ...filters, pgaScore: score };
    setFilters(newFilters);
  }, [filters]);

  const handleTreatmentSelect = useCallback((treatment: 'Active Drug' | 'Placebo' | 'Comparator') => {
    const newFilters = { ...filters, treatment: treatment };
    setFilters(newFilters);
  }, [filters]);

  const handleAgeGroupSelect = useCallback((ageGroup: '18-30' | '31-45' | '46-60' | '61+' | 'Unknown') => {
    const newFilters = { ...filters, ageGroup: ageGroup };
    setFilters(newFilters);
  }, [filters]);

  const isLoading = (isLoadingTrialData || isLoadingAiSummary) && !!selectedStudyId;

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

  if (!authChecked || !selectedStudyId) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="flex flex-col items-center">
            <FlaskConical className="h-16 w-16 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      );
  }
  
  return (
    <AppShell sidebarContent={sidebar}>
      <div className="mb-6">
        {currentUser && currentStudy && (
            <Card className="bg-secondary border-secondary/50 shadow-sm">
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-semibold text-secondary-foreground">
                                Study: <span className="text-primary font-bold">{currentStudy.name}</span>
                            </h2>
                            <p className="text-sm text-muted-foreground">{currentStudy.description}</p>
                        </div>
                        <div className="text-sm text-right">
                            <p className="text-muted-foreground">User: {currentUser.name} ({currentUser.username})</p>
                             <Button onClick={() => logout()} variant="outline" size="sm" className="mt-1 border-primary/50 text-primary hover:bg-primary/10">
                                <LogOut className="mr-2 h-4 w-4" /> Logout
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}
      </div>
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
