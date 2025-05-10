
import { NextResponse } from 'next/server';
import { getGenderOptions } from '@/services/clinical-trials';

export async function GET() {
  try {
    const options = await getGenderOptions();
    return NextResponse.json(options);
  } catch (error) {
    console.error("API Error fetching gender options:", error);
    return NextResponse.json({ message: "Error fetching gender options" }, { status: 500 });
  }
}
