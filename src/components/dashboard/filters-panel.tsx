
"use client";

import type { TrialFilters, Gender } from '@/services/clinical-trials';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Hospital, Users, AlertTriangle, ListChecks, RotateCcw, Stethoscope, UsersRound, Filter as FilterIcon } from 'lucide-react'; // Added Stethoscope, UsersRound

interface FiltersPanelProps {
  filters: TrialFilters;
  onFilterChange: <K extends keyof TrialFilters>(key: K, value: TrialFilters[K] | undefined) => void;
  onApplyFilters: () => void; // This will now likely trigger query invalidation or refetch
  isLoading: boolean;
  trialCenters: string[];
  genders: Gender[];
  adverseEvents: string[];
  pgaScores: number[];
  treatments: Array<'Active Drug' | 'Placebo' | 'Comparator'>;
  ageGroups: Array<'18-30' | '31-45' | '46-60' | '61+' | 'Unknown'>;
}

const PLACEHOLDER_SELECT_ITEM_VALUE = "__placeholder__"; // Value for "All" or "Any" options

export function FiltersPanel({
  filters,
  onFilterChange,
  onApplyFilters,
  isLoading,
  trialCenters,
  genders,
  adverseEvents,
  pgaScores,
  treatments,
  ageGroups,
}: FiltersPanelProps) {

  const handleResetFilters = () => {
    // Reset all filters to undefined
    (Object.keys(filters) as Array<keyof TrialFilters>).forEach(key => {
      onFilterChange(key, undefined);
    });
    // onApplyFilters(); // Call onApplyFilters after resetting to trigger refetch with no filters
    // setTimeout is a workaround for state update race condition with react-query invalidation
    setTimeout(() => onApplyFilters(), 0);
  };
  
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="space-y-4 flex-grow">
        {/* Trial Center Filter */}
        <div>
          <Label htmlFor="trialCenter" className="flex items-center mb-1 text-xs group-data-[collapsible=icon]:hidden">
            <Hospital className="mr-2 h-4 w-4 text-primary" />
            Trial Center
          </Label>
           <div className="group-data-[collapsible=icon]:hidden">
            <Select
              value={filters.center || PLACEHOLDER_SELECT_ITEM_VALUE}
              onValueChange={(value) => onFilterChange('center', value === PLACEHOLDER_SELECT_ITEM_VALUE ? undefined : value)}
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

        {/* Gender Filter */}
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
        
        {/* Treatment Filter */}
        <div>
          <Label htmlFor="treatment" className="flex items-center mb-1 text-xs group-data-[collapsible=icon]:hidden">
            <Stethoscope className="mr-2 h-4 w-4 text-primary" />
            Treatment Group
          </Label>
          <div className="group-data-[collapsible=icon]:hidden">
            <Select
              value={filters.treatment || PLACEHOLDER_SELECT_ITEM_VALUE}
              onValueChange={(value) => onFilterChange('treatment', value === PLACEHOLDER_SELECT_ITEM_VALUE ? undefined : value as 'Active Drug' | 'Placebo' | 'Comparator')}
              disabled={isLoading}
            >
              <SelectTrigger id="treatment">
                <SelectValue placeholder="All Treatments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PLACEHOLDER_SELECT_ITEM_VALUE}>All Treatments</SelectItem>
                {treatments.map((treatment) => (
                  <SelectItem key={treatment} value={treatment}>
                    {treatment}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Stethoscope className="h-6 w-6 text-primary group-data-[collapsible=icon]:block hidden mx-auto" title="Treatment Group" />
        </div>

        {/* Age Group Filter */}
        <div>
          <Label htmlFor="ageGroup" className="flex items-center mb-1 text-xs group-data-[collapsible=icon]:hidden">
            <UsersRound className="mr-2 h-4 w-4 text-primary" />
            Age Group
          </Label>
          <div className="group-data-[collapsible=icon]:hidden">
            <Select
              value={filters.ageGroup || PLACEHOLDER_SELECT_ITEM_VALUE}
              onValueChange={(value) => onFilterChange('ageGroup', value === PLACEHOLDER_SELECT_ITEM_VALUE ? undefined : value as '18-30' | '31-45' | '46-60' | '61+' | 'Unknown')}
              disabled={isLoading}
            >
              <SelectTrigger id="ageGroup">
                <SelectValue placeholder="All Age Groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PLACEHOLDER_SELECT_ITEM_VALUE}>All Age Groups</SelectItem>
                {ageGroups.map((group) => (
                  <SelectItem key={group} value={group}>
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <UsersRound className="h-6 w-6 text-primary group-data-[collapsible=icon]:block hidden mx-auto" title="Age Group" />
        </div>

        {/* Adverse Event Filter */}
        <div>
          <Label htmlFor="adverseEventName" className="flex items-center mb-1 text-xs group-data-[collapsible=icon]:hidden">
            <AlertTriangle className="mr-2 h-4 w-4 text-primary" />
            Adverse Event
          </Label>
          <div className="group-data-[collapsible=icon]:hidden">
            <Select
              value={filters.adverseEventName || PLACEHOLDER_SELECT_ITEM_VALUE}
              onValueChange={(value) => onFilterChange('adverseEventName', value === PLACEHOLDER_SELECT_ITEM_VALUE ? undefined : value)}
              disabled={isLoading}
            >
              <SelectTrigger id="adverseEventName">
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

        {/* PGA Score Filter */}
        <div>
          <Label htmlFor="pgaScore" className="flex items-center mb-1 text-xs group-data-[collapsible=icon]:hidden">
            <ListChecks className="mr-2 h-4 w-4 text-primary" />
            PGA Score
          </Label>
          <div className="group-data-[collapsible=icon]:hidden">
            <Select
              value={filters.pgaScore?.toString() || PLACEHOLDER_SELECT_ITEM_VALUE}
              onValueChange={(value) => {
                const numericValue = parseInt(value);
                onFilterChange('pgaScore', value === PLACEHOLDER_SELECT_ITEM_VALUE || isNaN(numericValue) ? undefined : numericValue);
              }}
              disabled={isLoading}
            >
              <SelectTrigger id="pgaScore">
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
          <FilterIcon className="mr-2 h-4 w-4" />
          {isLoading ? 'Applying...' : 'Apply Filters & Summarize'}
        </Button>
         <Button onClick={handleResetFilters} disabled={isLoading} variant="outline" className="w-full mt-2 group-data-[collapsible=icon]:hidden">
            <RotateCcw className="mr-2 h-4 w-4" /> Reset Filters
        </Button>

        {/* Icon only buttons for collapsed sidebar */}
        <Button onClick={onApplyFilters} disabled={isLoading} size="icon" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground group-data-[collapsible=icon]:flex hidden justify-center">
          <FilterIcon className="h-5 w-5" />
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
