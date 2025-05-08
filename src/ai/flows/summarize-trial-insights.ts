
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
import {getTrialData, getPatientById, TrialData, TrialFilters, Demographics} from '@/services/clinical-trials';

// Note: DemographicsSchema is not directly used in input/output of the flow,
// but it's good for documentation or if we decide to type parts of the prompt input more granularly later.
const DemographicsSchema = z.object({
  age: z.number(),
  race: z.string(),
  ethnicity: z.string(),
  height: z.number().optional(),
  weight: z.number().optional(),
});

const TrialFiltersSchema = z.object({
    trialCenter: z.string().optional().describe('The trial center to filter by.'),
    gender: z.string().optional().describe('The gender to filter by.'),
    adverseEvent: z.string().optional().describe('The adverse event to filter by.'),
    pga: z.number().optional().describe('The PGA score to filter by.'),
  });

const SummarizeTrialInsightsInputSchema = z.object({
  filters: z.optional(TrialFiltersSchema).describe('The filters to apply to the trial data. Used if patientId is not provided, or for context if patientId is provided.'),
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
  input: {schema: z.object({ 
    patientData: z.string().optional().describe("JSON string of a single patient's data, including demographics. Provided if summarizing a specific patient."),
    filteredTrialData: z.string().optional().describe("JSON string of filtered trial data, including demographics. Provided if summarizing a dataset based on filters."),
    filtersApplied: z.string().describe("Description of filters applied, or 'No filters applied' or 'Summarizing specific patient [ID] with contextual filters: [filters JSON]'.")
  })},
  output: {schema: SummarizeTrialInsightsOutputSchema},
  prompt: `You are an AI assistant specializing in summarizing clinical trial data.

  {{#if patientData}}
  Based on the following specific patient data (which includes demographics, PGA score, and adverse events), provide a concise summary. Highlight key demographic characteristics, their PGA status, and any significant adverse events.
  Patient Data:
  {{{patientData}}}
  Contextual Information: {{{filtersApplied}}}
  {{else}}
  Based on the following clinical trial data and applied filters, provide a concise summary of the key trends and insights. Consider demographic distributions, common adverse events, and PGA score trends within the filtered dataset.
  {{{filtersApplied}}}

  Trial Data (sample might be truncated for brevity if too large, but trends should be identifiable):
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
      filtersApplied: string; 
    } = { filtersApplied: "No specific context provided." };

    if (input.patientId) {
      const patient = await getPatientById(input.patientId);
      if (patient) {
        promptPayload.patientData = JSON.stringify(patient, null, 2);
        let patientContext = `Summarizing specific patient: ${input.patientId}.`;
        if (input.filters && Object.keys(input.filters).length > 0) {
             patientContext += ` Current dashboard filters for context: ${JSON.stringify(input.filters, null, 2)}`;
        } else {
             patientContext += ` No additional dashboard filters active.`;
        }
        promptPayload.filtersApplied = patientContext;

      } else {
        return { summary: "Error: Patient not found." };
      }
    } else {
      const trialData: TrialData[] = await getTrialData(input.filters ?? {});
      // Limit data sent to prompt if too large to avoid issues, summarize first few records
      const dataForPrompt = trialData.length > 20 ? trialData.slice(0, 20) : trialData;
      promptPayload.filteredTrialData = JSON.stringify(dataForPrompt, null, 2);
      
      let filterDescriptions = "Filters Applied to Dataset:\n";
      if (input.filters && Object.keys(input.filters).length > 0) {
        if (input.filters.trialCenter) filterDescriptions += `  - Trial Center: ${input.filters.trialCenter}\n`;
        if (input.filters.gender) filterDescriptions += `  - Gender: ${input.filters.gender}\n`;
        if (input.filters.adverseEvent) filterDescriptions += `  - Adverse Event: ${input.filters.adverseEvent}\n`;
        if (input.filters.pga !== undefined) filterDescriptions += `  - PGA Score: ${input.filters.pga}\n`;
      } else {
        filterDescriptions = "No filters applied. Summarizing entire dataset.\n";
      }
      promptPayload.filtersApplied = filterDescriptions;
    }

    const {output} = await summarizeTrialInsightsPrompt(promptPayload);
    return output!;
  }
);
