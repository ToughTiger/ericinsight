"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb } from 'lucide-react';

interface AiInsightsSummaryProps {
  summary: string | null;
  isLoading: boolean;
}

export function AiInsightsSummary({ summary, isLoading }: AiInsightsSummaryProps) {
  return (
    <Card className="shadow-lg bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center text-xl text-primary">
          <Lightbulb className="mr-2 h-6 w-6" />
          AI Insights Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : summary ? (
          <p className="text-foreground/90 whitespace-pre-wrap">{summary}</p>
        ) : (
          <p className="text-center text-muted-foreground py-8">Apply filters to generate AI insights.</p>
        )}
      </CardContent>
    </Card>
  );
}
