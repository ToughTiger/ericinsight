
import { NextResponse } from 'next/server';
import { getPgaScoreOptions } from '@/services/clinical-trials';

export async function GET() {
  try {
    const options = await getPgaScoreOptions();
    return NextResponse.json(options);
  } catch (error) {
    console.error("API Error fetching PGA score options:", error);
    return NextResponse.json({ message: "Error fetching PGA score options" }, { status: 500 });
  }
}
