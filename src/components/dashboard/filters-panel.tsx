
"use client";

import type { TrialFilters, Gender } from '@/services/clinical-trials';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Hospital, Users, AlertTriangle, ListChecks, RotateCcw } from 'lucide-react';

interface FiltersPanelProps {
  filters: TrialFilters;
  onFilterChange: <K extends keyof TrialFilters>(key: K, value: TrialFilters[K] | undefined) => void;
  onApplyFilters: () => void; // Retained for explicit apply/summarize, could be triggered by onFilterChange in parent
  isLoading: boolean;
  trialCenters: string[];
  genders: Gender[];
  adverseEvents: string[];
  pgaScores: number[];
}

const PLACEHOLDER_SELECT_ITEM_VALUE = "__placeholder__";

export function FiltersPanel({
  filters,
  onFilterChange,
  onApplyFilters, // Keep this prop for explicit re-summarization if needed
  isLoading,
  trialCenters,
  genders,
  adverseEvents,
  pgaScores,
}: FiltersPanelProps) {

  const handleResetFilters = () => {
    onFilterChange('trialCenter', undefined);
    onFilterChange('gender', undefined);
    onFilterChange('adverseEvent', undefined);
    onFilterChange('pga', undefined);
    // Optionally, call onApplyFilters here if reset should also trigger data fetch/summary
    onApplyFilters();
  };
  
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="space-y-4 flex-grow"> {/* Filters take available space */}
        <div>
          <Label htmlFor="trialCenter" className="flex items-center mb-1 text-xs group-data-[collapsible=icon]:hidden">
            <Hospital className="mr-2 h-4 w-4 text-primary" />
            Trial Center
          </Label>
           <div className="group-data-[collapsible=icon]:hidden">
            <Select
              value={filters.trialCenter || PLACEHOLDER_SELECT_ITEM_VALUE}
              onValueChange={(value) => onFilterChange('trialCenter', value === PLACEHOLDER_SELECT_ITEM_VALUE ? undefined : value)}
              disabled={isLoading}
            >
              <SelectTrigger id="trialCenter">
                <SelectValue placeholder="All Centers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PLACEHOLDER_SELECT_ITEM_VALUE}>All Centers</SelectItem>
                {trialCenters.map((center) => (
                  <SelectItem key={center} value={center}>
                    {center}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
           <Hospital className="h-6 w-6 text-primary group-data-[collapsible=icon]:block hidden mx-auto" title="Trial Center"/>
        </div>

        <div>
          <Label htmlFor="gender" className="flex items-center mb-1 text-xs group-data-[collapsible=icon]:hidden">
            <Users className="mr-2 h-4 w-4 text-primary" />
            Gender
          </Label>
          <div className="group-data-[collapsible=icon]:hidden">
            <Select
              value={filters.gender || PLACEHOLDER_SELECT_ITEM_VALUE}
              onValueChange={(value) => onFilterChange('gender', value === PLACEHOLDER_SELECT_ITEM_VALUE ? undefined : value as Gender)}
              disabled={isLoading}
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="All Genders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PLACEHOLDER_SELECT_ITEM_VALUE}>All Genders</SelectItem>
                {genders.map((gender) => (
                  <SelectItem key={gender} value={gender}>
                    {gender}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Users className="h-6 w-6 text-primary group-data-[collapsible=icon]:block hidden mx-auto" title="Gender" />
        </div>

        <div>
          <Label htmlFor="adverseEvent" className="flex items-center mb-1 text-xs group-data-[collapsible=icon]:hidden">
            <AlertTriangle className="mr-2 h-4 w-4 text-primary" />
            Adverse Event
          </Label>
          <div className="group-data-[collapsible=icon]:hidden">
            <Select
              value={filters.adverseEvent || PLACEHOLDER_SELECT_ITEM_VALUE}
              onValueChange={(value) => onFilterChange('adverseEvent', value === PLACEHOLDER_SELECT_ITEM_VALUE ? undefined : value)}
              disabled={isLoading}
            >
              <SelectTrigger id="adverseEvent">
                <SelectValue placeholder="Any Event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PLACEHOLDER_SELECT_ITEM_VALUE}>Any Event</SelectItem>
                {adverseEvents.map((event) => (
                  <SelectItem key={event} value={event}>
                    {event}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertTriangle className="h-6 w-6 text-primary group-data-[collapsible=icon]:block hidden mx-auto" title="Adverse Event" />
        </div>

        <div>
          <Label htmlFor="pga" className="flex items-center mb-1 text-xs group-data-[collapsible=icon]:hidden">
            <ListChecks className="mr-2 h-4 w-4 text-primary" />
            PGA Score
          </Label>
          <div className="group-data-[collapsible=icon]:hidden">
            <Select
              value={filters.pga?.toString() || PLACEHOLDER_SELECT_ITEM_VALUE}
              onValueChange={(value) => {
                const numericValue = parseInt(value);
                onFilterChange('pga', value === PLACEHOLDER_SELECT_ITEM_VALUE || isNaN(numericValue) ? undefined : numericValue);
              }}
              disabled={isLoading}
            >
              <SelectTrigger id="pga">
                <SelectValue placeholder="Any Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PLACEHOLDER_SELECT_ITEM_VALUE}>Any Score</SelectItem>
                {pgaScores.map((score) => (
                  <SelectItem key={score} value={score.toString()}>
                    {score}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ListChecks className="h-6 w-6 text-primary group-data-[collapsible=icon]:block hidden mx-auto" title="PGA Score" />
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-border"> {/* Action buttons at the bottom */}
        <Button onClick={onApplyFilters} disabled={isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground group-data-[collapsible=icon]:hidden">
          {isLoading ? 'Applying...' : 'Apply Filters & Summarize'}
        </Button>
         <Button onClick={handleResetFilters} disabled={isLoading} variant="outline" className="w-full mt-2 group-data-[collapsible=icon]:hidden">
            <RotateCcw className="mr-2 h-4 w-4" /> Reset Filters
        </Button>

        {/* Icon only buttons for collapsed sidebar */}
        <Button onClick={onApplyFilters} disabled={isLoading} size="icon" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground group-data-[collapsible=icon]:flex hidden justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search-check"><path d="m8 11 2 2 4-4"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <span className="sr-only">Apply Filters & Summarize</span>
        </Button>
        <Button onClick={handleResetFilters} disabled={isLoading} variant="outline" size="icon" className="w-full mt-2 group-data-[collapsible=icon]:flex hidden justify-center">
            <RotateCcw className="h-5 w-5" />
             <span className="sr-only">Reset Filters</span>
        </Button>
      </div>
    </div>
  );
}
