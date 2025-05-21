
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
import {getTrialData, getPatientById, TrialData, TrialFilters } from '@/services/clinical-trials';

// Define Zod schemas for the new data structures to be used in the prompt input.
// These are simplified for the prompt; the full types are in clinical-trials.ts.

const AeDataRecordSchema = z.object({
  ae: z.string(),
  aeSeverity: z.string(), // Simplified from AeSeverity type
  aeRelationship: z.string(), // Simplified from AeRelationship type
});

const StudyPopulationSchema = z.object({
  itt: z.boolean(),
  pp: z.boolean(),
});

const GlobalAssessmentSchema = z.object({
  pgaScore: z.number(),
  pgaDescription: z.string(),
});

const DemographicsDataSchema = z.object({
  age: z.number(),
  ageGroup: z.string(), // Simplified
  gender: z.string(), // Simplified
  race: z.string().optional(),
  ethnicity: z.string().optional(),
  heightCm: z.number().optional(),
  weightKg: z.number().optional(),
});

const RandomizationDataSchema = z.object({
  center: z.string(),
  treatment: z.string(), // Simplified
});

const BaselineCharacteristicsSchema = z.object({
  surgeryLastYear: z.boolean(),
  workStatus: z.string(), // Simplified
});

const VasDataPointSchema = z.object({
  day: z.number(),
  vasScore: z.number(),
});

const VitalSignsDataSchema = z.object({
  dbp: z.number().optional(),
  sbp: z.number().optional(),
  pr: z.number().optional(),
  rr: z.number().optional(),
});

// Full TrialData schema for prompt input if needed, or use specific parts
const TrialDataPromptSchema = z.object({
  patientId: z.string(),
  demographics: DemographicsDataSchema,
  randomization: RandomizationDataSchema,
  studyPopulations: StudyPopulationSchema,
  globalAssessment: GlobalAssessmentSchema,
  baselineCharacteristics: BaselineCharacteristicsSchema,
  aeData: z.array(AeDataRecordSchema),
  vasData: z.array(VasDataPointSchema),
  vitalSigns: VitalSignsDataSchema,
});


const TrialFiltersSchema = z.object({
  center: z.string().optional().describe('The trial center to filter by.'),
  gender: z.string().optional().describe('The gender to filter by.'),
  treatment: z.string().optional().describe('The treatment group to filter by.'),
  ageGroup: z.string().optional().describe('The age group to filter by.'),
  pgaScore: z.number().optional().describe('The PGA score to filter by.'),
  adverseEventName: z.string().optional().describe('A specific adverse event to filter by.'),
  itt: z.boolean().optional().describe('Filter by ITT population status.'),
  pp: z.boolean().optional().describe('Filter by PP population status.'),
});

const SummarizeTrialInsightsInputSchema = z.object({
  filters: z.optional(TrialFiltersSchema).describe('The filters to apply to the trial data. Used if patientId is not provided, or for context if patientId is provided.'),
  patientId: z.string().optional().describe('The ID of a specific patient to summarize. If provided, filters are primarily used for context if needed, and patient data is fetched directly.'),
  studyId: z.string().nullable().optional().describe('The ID of the current study. Used for context if AI logic needs to adapt per study.'),
});
export type SummarizeTrialInsightsInput = z.infer<typeof SummarizeTrialInsightsInputSchema>;

const SummarizeTrialInsightsOutputSchema = z.object({
  summary: z.string().describe('A summary of the key insights from the trial data or specific patient data.'),
});
export type SummarizeTrialInsightsOutput = z.infer<typeof SummarizeTrialInsightsOutputSchema>;

export async function summarizeTrialInsights(input: SummarizeTrialInsightsInput): Promise<SummarizeTrialInsightsOutput> {
  return summarizeTrialInsightsFlow(input);
}

// Define a schema for the data that will be passed into the prompt
const PromptInputSchema = z.object({
    patientData: z.string().optional().describe("JSON string of a single patient's full data record. Provided if summarizing a specific patient."),
    filteredTrialData: z.string().optional().describe("JSON string of filtered trial data (array of full patient records). Provided if summarizing a dataset based on filters."),
    filtersApplied: z.string().describe("Description of filters applied, or 'No filters applied' or 'Summarizing specific patient [ID] with contextual filters: [filters JSON]'."),
    studyContext: z.string().optional().describe("Context about the current study, if available (e.g., Study ID)."),
});


const summarizeTrialInsightsPrompt = ai.definePrompt({
  name: 'summarizeTrialInsightsPrompt',
  input: {schema: PromptInputSchema },
  output: {schema: SummarizeTrialInsightsOutputSchema},
  prompt: `You are an AI assistant specializing in summarizing clinical trial data.
  Your summary should be concise and highlight key findings.
  {{#if studyContext}}
  Current Study Context: {{{studyContext}}}
  {{/if}}

  {{#if patientData}}
  Based on the following specific patient data, provide a summary.
  Include key demographic characteristics (age, gender, age group), their assigned treatment, PGA status, notable adverse events (especially severe or related), and any significant baseline characteristics or vital signs if remarkable.
  Patient Data (JSON):
  {{{patientData}}}

  Contextual Information: {{{filtersApplied}}}
  {{else}}
  Based on the following clinical trial data (which may be a sample of a larger dataset) and the applied filters, provide a summary of key trends and insights.
  Consider:
  - Demographic distributions (age groups, gender).
  - Treatment group distributions and outcomes if discernible.
  - Common or severe adverse events and their relationship to treatment if apparent.
  - PGA score trends within the filtered dataset.
  - Any notable patterns in baseline characteristics, study populations, VAS scores, or vital signs.

  {{{filtersApplied}}}

  Trial Data (JSON array, sample might be truncated for brevity):
  {{{filteredTrialData}}}
  {{/if}}

  Provide your summary:`,
});

const summarizeTrialInsightsFlow = ai.defineFlow(
  {
    name: 'summarizeTrialInsightsFlow',
    inputSchema: SummarizeTrialInsightsInputSchema,
    outputSchema: SummarizeTrialInsightsOutputSchema,
  },
  async (input: SummarizeTrialInsightsInput) => {
    let promptPayload: z.infer<typeof PromptInputSchema> = {
        filtersApplied: "No specific context provided."
    };

    if (input.studyId) {
        promptPayload.studyContext = `Study ID: ${input.studyId}`;
    }

    if (input.patientId) {
      const patient = await getPatientById(input.patientId); // Potentially pass studyId here if getPatientById needs it
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
      // Potentially pass studyId to getTrialData if it's used for data scoping
      const trialData: TrialData[] = await getTrialData(input.filters ?? {}); 
      const dataForPrompt = trialData.length > 10 ? trialData.slice(0, 10) : trialData;
      promptPayload.filteredTrialData = JSON.stringify(dataForPrompt, null, 2);
      
      let filterDescriptions = "Filters Applied to Dataset:\n";
      if (input.filters && Object.keys(input.filters).length > 0) {
        const activeFilters = Object.entries(input.filters)
            .filter(([, value]) => value !== undefined)
            .map(([key, value]) => `  - ${key}: ${JSON.stringify(value)}`)
            .join("\n");
        if (activeFilters) {
            filterDescriptions += activeFilters;
        } else {
            filterDescriptions = "No filters applied. Summarizing dataset for the current study.\n";
        }
      } else {
        filterDescriptions = "No filters applied. Summarizing dataset for the current study.\n";
      }
      promptPayload.filtersApplied = filterDescriptions;
    }

    try {
        const {output} = await summarizeTrialInsightsPrompt(promptPayload);
        if (!output) {
            return { summary: "Error: AI failed to generate a summary."};
        }
        return output;
    } catch (e) {
        console.error("Error calling AI prompt:", e);
        return { summary: "Error: An exception occurred while generating the AI summary."};
    }
  }
);
