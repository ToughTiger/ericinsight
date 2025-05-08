'use server';

/**
 * @fileOverview A flow that summarizes clinical trial insights based on applied filters.
 *
 * - summarizeTrialInsights - A function that summarizes trial insights.
 * - SummarizeTrialInsightsInput - The input type for the summarizeTrialInsights function.
 * - SummarizeTrialInsightsOutput - The return type for the summarizeTrialInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {getTrialData, TrialData, TrialFilters} from '@/services/clinical-trials';

const SummarizeTrialInsightsInputSchema = z.object({
  filters: z.optional(z.object({
    trialCenter: z.string().optional().describe('The trial center to filter by.'),
    gender: z.string().optional().describe('The gender to filter by.'),
    adverseEvent: z.string().optional().describe('The adverse event to filter by.'),
    pga: z.number().optional().describe('The PGA score to filter by.'),
  })).describe('The filters to apply to the trial data.'),
});
export type SummarizeTrialInsightsInput = z.infer<typeof SummarizeTrialInsightsInputSchema>;

const SummarizeTrialInsightsOutputSchema = z.object({
  summary: z.string().describe('A summary of the key insights from the filtered trial data.'),
});
export type SummarizeTrialInsightsOutput = z.infer<typeof SummarizeTrialInsightsOutputSchema>;

export async function summarizeTrialInsights(input: SummarizeTrialInsightsInput): Promise<SummarizeTrialInsightsOutput> {
  return summarizeTrialInsightsFlow(input);
}

const summarizeTrialInsightsPrompt = ai.definePrompt({
  name: 'summarizeTrialInsightsPrompt',
  input: {schema: SummarizeTrialInsightsInputSchema},
  output: {schema: SummarizeTrialInsightsOutputSchema},
  prompt: `You are an AI assistant specializing in summarizing clinical trial data.

  Based on the following clinical trial data, provide a concise summary of the key trends and insights, focusing on the impact of the applied filters.

  Filters Applied:
  {{#if filters}}
    {{#if filters.trialCenter}}Trial Center: {{{filters.trialCenter}}}{{/if}}
    {{#if filters.gender}} Gender: {{{filters.gender}}}{{/if}}
    {{#if filters.adverseEvent}} Adverse Event: {{{filters.adverseEvent}}}{{/if}}
    {{#if filters.pga}} PGA Score: {{{filters.pga}}}{{/if}}
  {{else}}
    No filters applied.
  {{/if}}

  Trial Data:
  {{trialData}}

  Summary:`,
});

const summarizeTrialInsightsFlow = ai.defineFlow(
  {
    name: 'summarizeTrialInsightsFlow',
    inputSchema: SummarizeTrialInsightsInputSchema,
    outputSchema: SummarizeTrialInsightsOutputSchema,
  },
  async input => {
    const trialData: TrialData[] = await getTrialData(input.filters ?? {});

    const trialDataString = JSON.stringify(trialData, null, 2);

    const {output} = await summarizeTrialInsightsPrompt({
      ...input,
      trialData: trialDataString,
    });
    return output!;
  }
);
