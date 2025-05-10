
"use client";

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Filter } from 'lucide-react'; // Filter icon for general filter section

export interface PatientSpecificFilters {
  vasTimePeriod: 'all' | '7days' | '14days' | '30days';
  // Add other patient-specific filter types here if needed
  // e.g., aeSeverity?: AeSeverity | 'all';
}

interface PatientFiltersPanelProps {
  filters: PatientSpecificFilters;
  onFilterChange: <K extends keyof PatientSpecificFilters>(key: K, value: PatientSpecificFilters[K]) => void;
  // onApplyFilters: () => void; // Or apply on change
  isLoading: boolean;
  // Add options for other filters if they are introduced
}

const PLACEHOLDER_SELECT_ITEM_VALUE = "__placeholder__"; // Could be used if "All" is not 'all'

export function PatientFiltersPanel({
  filters,
  onFilterChange,
  // onApplyFilters,
  isLoading,
}: PatientFiltersPanelProps) {
  
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="space-y-4 flex-grow">
        {/* VAS Time Period Filter */}
        <div>
          <Label htmlFor="vasTimePeriod" className="flex items-center mb-1 text-xs group-data-[collapsible=icon]:hidden">
            <Activity className="mr-2 h-4 w-4 text-primary" />
            VAS Time Period
          </Label>
           <div className="group-data-[collapsible=icon]:hidden">
            <Select
              value={filters.vasTimePeriod}
              onValueChange={(value) => onFilterChange('vasTimePeriod', value as PatientSpecificFilters['vasTimePeriod'])}
              disabled={isLoading}
            >
              <SelectTrigger id="vasTimePeriod">
                <SelectValue placeholder="Select Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="14days">Last 14 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <Activity className="h-6 w-6 text-primary group-data-[collapsible=icon]:block hidden mx-auto" title="VAS Time Period"/>
        </div>

        {/* Placeholder for future filters, e.g., AE Severity
        <div>
          <Label htmlFor="aeSeverity" className="flex items-center mb-1 text-xs">
            <ShieldAlert className="mr-2 h-4 w-4 text-primary" />
            AE Severity
          </Label>
          <Select
            // value={filters.aeSeverity || 'all'}
            // onValueChange={(value) => onFilterChange('aeSeverity', value as AeSeverity | 'all')}
            disabled={isLoading}
          >
            <SelectTrigger id="aeSeverity">
              <SelectValue placeholder="All Severities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="Mild">Mild</SelectItem>
              <SelectItem value="Moderate">Moderate</SelectItem>
              <SelectItem value="Severe">Severe</SelectItem>
            </SelectContent>
          </Select>
        </div>
        */}
      </div>

      {/* No "Apply Filters" button for now, filters apply on change for simplicity */}
      {/* If an apply button is desired, it can be added here similar to FiltersPanel */}
       <div className="mt-auto pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          Filters apply automatically.
        </p>
         <Filter className="h-6 w-6 text-primary group-data-[collapsible=icon]:block hidden mx-auto" title="Filters active"/>
      </div>
    </div>
  );
}
