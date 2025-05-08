'use server';

/**
 * @fileOverview A flow that summarizes clinical trial insights.
 * It can summarize based on applied filters or for a specific patient.
 *
 * - summarizeTrialInsights - A function that summarizes trial insights.
 * - SummarizeTrialInsightsInput - The input type for the summarizeTrialInsights function.
 * - SummarizeTrialInsightsOutput - The return type for the summarizeTrialInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {getTrialData, getPatientById, TrialData, TrialFilters} from '@/services/clinical-trials';

const SummarizeTrialInsightsInputSchema = z.object({
  filters: z.optional(z.object({
    trialCenter: z.string().optional().describe('The trial center to filter by.'),
    gender: z.string().optional().describe('The gender to filter by.'),
    adverseEvent: z.string().optional().describe('The adverse event to filter by.'),
    pga: z.number().optional().describe('The PGA score to filter by.'),
  })).describe('The filters to apply to the trial data. Used if patientId is not provided, or for context if patientId is provided.'),
  patientId: z.string().optional().describe('The ID of a specific patient to summarize. If provided, filters are primarily used for context if needed, and patient data is fetched directly.'),
});
export type SummarizeTrialInsightsInput = z.infer<typeof SummarizeTrialInsightsInputSchema>;

const SummarizeTrialInsightsOutputSchema = z.object({
  summary: z.string().describe('A summary of the key insights from the trial data or specific patient data.'),
});
export type SummarizeTrialInsightsOutput = z.infer<typeof SummarizeTrialInsightsOutputSchema>;

export async function summarizeTrialInsights(input: SummarizeTrialInsightsInput): Promise<SummarizeTrialInsightsOutput> {
  return summarizeTrialInsightsFlow(input);
}

const summarizeTrialInsightsPrompt = ai.definePrompt({
  name: 'summarizeTrialInsightsPrompt',
  input: {schema: z.object({ // Define a more specific input schema for the prompt itself
    patientData: z.string().optional().describe("JSON string of a single patient's data. Provided if summarizing a specific patient."),
    filteredTrialData: z.string().optional().describe("JSON string of filtered trial data. Provided if summarizing a dataset based on filters."),
    filtersApplied: z.string().optional().describe("Description of filters applied, if any.")
  })},
  output: {schema: SummarizeTrialInsightsOutputSchema},
  prompt: `You are an AI assistant specializing in summarizing clinical trial data.

  {{#if patientData}}
  Based on the following specific patient data, provide a concise summary of their profile, adverse events, and PGA status.
  Patient Data:
  {{{patientData}}}
  {{else}}
  Based on the following clinical trial data and applied filters, provide a concise summary of the key trends and insights.
  {{{filtersApplied}}}

  Trial Data:
  {{{filteredTrialData}}}
  {{/if}}

  Summary:`,
});

const summarizeTrialInsightsFlow = ai.defineFlow(
  {
    name: 'summarizeTrialInsightsFlow',
    inputSchema: SummarizeTrialInsightsInputSchema,
    outputSchema: SummarizeTrialInsightsOutputSchema,
  },
  async (input: SummarizeTrialInsightsInput) => {
    let promptPayload: {
      patientData?: string;
      filteredTrialData?: string;
      filtersApplied?: string;
    } = {};

    if (input.patientId) {
      const patient = await getPatientById(input.patientId);
      if (patient) {
        promptPayload.patientData = JSON.stringify(patient, null, 2);
      } else {
        return { summary: "Error: Patient not found." };
      }
    } else {
      const trialData: TrialData[] = await getTrialData(input.filters ?? {});
      promptPayload.filteredTrialData = JSON.stringify(trialData, null, 2);
      
      let filterDescriptions = "Filters Applied:\n";
      if (input.filters && Object.keys(input.filters).length > 0) {
        if (input.filters.trialCenter) filterDescriptions += `  Trial Center: ${input.filters.trialCenter}\n`;
        if (input.filters.gender) filterDescriptions += `  Gender: ${input.filters.gender}\n`;
        if (input.filters.adverseEvent) filterDescriptions += `  Adverse Event: ${input.filters.adverseEvent}\n`;
        if (input.filters.pga !== undefined) filterDescriptions += `  PGA Score: ${input.filters.pga}\n`;
      } else {
        filterDescriptions += "  No filters applied.\n";
      }
      promptPayload.filtersApplied = filterDescriptions;
    }

    const {output} = await summarizeTrialInsightsPrompt(promptPayload);
    return output!;
  }
);

