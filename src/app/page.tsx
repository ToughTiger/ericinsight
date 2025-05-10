
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { TrialData, TrialFilters, Gender } from '@/services/clinical-trials';
import { 
  getTrialData as fetchTrialData, 
  // getPatientById, // No longer needed here
  getTrialCenterOptions,
  getGenderOptions,
  getAdverseEventOptions,
  getPgaScoreOptions,
  getTreatmentOptions,
  getAgeGroupOptions,
} from '@/services/clinical-trials';
import { summarizeTrialInsights } from '@/ai/flows/summarize-trial-insights';

import { AppShell } from '@/components/layout/app-shell';
import { FiltersPanel } from '@/components/dashboard/filters-panel';
import { TrialDataTable } from '@/components/dashboard/trial-data-table';
import { AiInsightsSummary } from '@/components/dashboard/ai-insights-summary';
// import { PatientDetailView } from '@/components/dashboard/patient-detail-view'; // Removed
import { PgaDistributionChart } from '@/components/dashboard/charts/pga-distribution-chart';
import { AdverseEventsChart } from '@/components/dashboard/charts/adverse-events-chart';
import { GenderDistributionChart } from '@/components/dashboard/charts/gender-distribution-chart';
import { DemographicsTable } from '@/components/dashboard/demographics-table';
import { TreatmentDistributionChart } from '@/components/dashboard/charts/treatment-distribution-chart';
import { AgeGroupDistributionChart } from '@/components/dashboard/charts/age-group-distribution-chart';

import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Users, Filter } from 'lucide-react';


export default function DashboardPage() {
  const [filters, setFilters] = useState<TrialFilters>({});
  const [trialData, setTrialData] = useState<TrialData[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Removed state related to PatientDetailView dialog
  // const [selectedPatient, setSelectedPatient] = useState<TrialData | null>(null);
  // const [isPatientDetailOpen, setIsPatientDetailOpen] = useState(false);
  // const [patientAiSummary, setPatientAiSummary] = useState<string | null>(null);
  // const [isPatientSummaryLoading, setIsPatientSummaryLoading] = useState(false);

  const { toast } = useToast();

  const [availableTrialCenters, setAvailableTrialCenters] = useState<string[]>([]);
  const [availableGenders, setAvailableGenders] = useState<Gender[]>([]);
  const [availableAdverseEvents, setAvailableAdverseEvents] = useState<string[]>([]);
  const [availablePgaScores, setAvailablePgaScores] = useState<number[]>([]);
  const [availableTreatments, setAvailableTreatments] = useState<Array<'Active Drug' | 'Placebo' | 'Comparator'>>([]);
  const [availableAgeGroups, setAvailableAgeGroups] = useState<Array<'18-30' | '31-45' | '46-60' | '61+' | 'Unknown'>>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setAvailableTrialCenters(await getTrialCenterOptions());
        setAvailableGenders(await getGenderOptions());
        setAvailableAdverseEvents(await getAdverseEventOptions());
        setAvailablePgaScores(await getPgaScoreOptions());
        setAvailableTreatments(await getTreatmentOptions());
        setAvailableAgeGroups(await getAgeGroupOptions());
      } catch (error) {
        console.error("Failed to load filter options:", error);
        toast({
          title: "Error",
          description: "Could not load filter options. Some filters may not work.",
          variant: "destructive",
        });
      }
    };
    fetchOptions();
  }, [toast]);

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
  

  const applyFiltersAndSummarize = useCallback(async (newFilters?: TrialFilters) => {
    setIsLoading(true);
    setAiSummary(null); 
    const currentFilters = newFilters ?? filters; 

    try {
      const data = await fetchTrialData(currentFilters);
      setTrialData(data);

      if (data.length > 0) {
        const summaryOutput = await summarizeTrialInsights({ filters: currentFilters });
        setAiSummary(summaryOutput.summary);
      } else {
        setAiSummary("No data matches the current filters. Try adjusting your filter criteria.");
      }
      
      if (!isInitialLoad || (newFilters && Object.keys(newFilters).length > 0)) {
        toast({
          title: "Filters Applied",
          description: "Data and AI summary updated successfully.",
        });
      }

    } catch (error) {
      console.error("Error applying filters or summarizing:", error);
      toast({
        title: "Error",
        description: "Failed to update data or AI summary. Please try again.",
        variant: "destructive",
      });
      setTrialData([]); 
      setAiSummary("An error occurred while fetching data or generating insights.");
    } finally {
      setIsLoading(false);
      if (isInitialLoad) setIsInitialLoad(false);
    }
  }, [filters, toast, isInitialLoad]); 

  useEffect(() => {
    if(isInitialLoad) { 
        applyFiltersAndSummarize(); 
    }
  }, [isInitialLoad, applyFiltersAndSummarize]);

  // handlePatientSelect is removed as navigation will be handled by TrialDataTable
  
  const handlePgaScoreSelect = useCallback((score: number) => {
    const newFilters = { ...filters, pgaScore: score };
    setFilters(newFilters); 
    applyFiltersAndSummarize(newFilters); 
  }, [filters, applyFiltersAndSummarize]);

  const handleTreatmentSelect = useCallback((treatment: 'Active Drug' | 'Placebo' | 'Comparator') => {
    const newFilters = { ...filters, treatment: treatment };
    setFilters(newFilters);
    applyFiltersAndSummarize(newFilters);
  }, [filters, applyFiltersAndSummarize]);

  const handleAgeGroupSelect = useCallback((ageGroup: '18-30' | '31-45' | '46-60' | '61+' | 'Unknown') => {
    const newFilters = { ...filters, ageGroup: ageGroup };
    setFilters(newFilters);
    applyFiltersAndSummarize(newFilters);
  }, [filters, applyFiltersAndSummarize]);


  const sidebar = useMemo(() => (
    <FiltersPanel
      filters={filters}
      onFilterChange={handleFilterChange}
      onApplyFilters={() => applyFiltersAndSummarize(filters)} 
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
                <DemographicsTable data={trialData} isLoading={isLoading && isInitialLoad} />
            </CardContent>
        </Card>

        <Separator />
        
        <TrialDataTable 
          data={trialData} 
          isLoading={isLoading && isInitialLoad} 
          // onPatientSelect is no longer needed as the table handles navigation
          onPgaCellSelect={handlePgaScoreSelect}
        />
      </div>

      {/* PatientDetailView dialog removed */}
    </AppShell>
  );
}
