
"use client";

import type { TrialFilters, Gender } from '@/services/clinical-trials';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Hospital, Users, AlertTriangle, ListChecks, Filter } from 'lucide-react';

interface FiltersPanelProps {
  filters: TrialFilters;
  onFilterChange: <K extends keyof TrialFilters>(key: K, value: TrialFilters[K]) => void;
  onApplyFilters: () => void;
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
  onApplyFilters,
  isLoading,
  trialCenters,
  genders,
  adverseEvents,
  pgaScores,
}: FiltersPanelProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Filter className="mr-2 h-6 w-6 text-primary" />
          Filter Clinical Trial Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div>
            <Label htmlFor="trialCenter" className="flex items-center mb-2 text-sm font-medium">
              <Hospital className="mr-2 h-4 w-4 text-primary" />
              Trial Center
            </Label>
            <Select
              value={filters.trialCenter || ''}
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

          <div>
            <Label htmlFor="gender" className="flex items-center mb-2 text-sm font-medium">
              <Users className="mr-2 h-4 w-4 text-primary" />
              Gender
            </Label>
            <Select
              value={filters.gender || ''}
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

          <div>
            <Label htmlFor="adverseEvent" className="flex items-center mb-2 text-sm font-medium">
              <AlertTriangle className="mr-2 h-4 w-4 text-primary" />
              Adverse Event
            </Label>
            <Select
              value={filters.adverseEvent || ''}
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

          <div>
            <Label htmlFor="pga" className="flex items-center mb-2 text-sm font-medium">
              <ListChecks className="mr-2 h-4 w-4 text-primary" />
              PGA Score
            </Label>
            <Select
              value={filters.pga?.toString() || ''}
              onValueChange={(value) => {
                if (value === PLACEHOLDER_SELECT_ITEM_VALUE) {
                  onFilterChange('pga', undefined);
                } else {
                  const numericValue = parseInt(value);
                  onFilterChange('pga', isNaN(numericValue) ? undefined : numericValue);
                }
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
        </div>
        <div className="flex justify-end">
          <Button onClick={onApplyFilters} disabled={isLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            {isLoading ? 'Applying...' : 'Apply Filters & Summarize'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
