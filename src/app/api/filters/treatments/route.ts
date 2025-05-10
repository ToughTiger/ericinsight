
import { NextResponse } from 'next/server';
import { getTreatmentOptions } from '@/services/clinical-trials';

export async function GET() {
  try {
    const options = await getTreatmentOptions();
    return NextResponse.json(options);
  } catch (error) {
    console.error("API Error fetching treatment options:", error);
    return NextResponse.json({ message: "Error fetching treatment options" }, { status: 500 });
  }
}
