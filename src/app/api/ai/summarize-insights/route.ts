
'use server';
import { NextResponse, type NextRequest } from 'next/server';
import { summarizeTrialInsights, type SummarizeTrialInsightsInput, type SummarizeTrialInsightsOutput } from '@/ai/flows/summarize-trial-insights';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SummarizeTrialInsightsInput;
    const summaryOutput: SummarizeTrialInsightsOutput = await summarizeTrialInsights(body);
    return NextResponse.json(summaryOutput);
  } catch (error) {
    console.error("API Error summarizing insights:", error);
    const message = error instanceof Error ? error.message : "Unknown error summarizing insights";
    return NextResponse.json({ summary: `Error: ${message}` }, { status: 500 });
  }
}
