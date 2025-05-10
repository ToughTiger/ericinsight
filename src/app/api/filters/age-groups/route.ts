
import { NextResponse } from 'next/server';
import { getAgeGroupOptions } from '@/services/clinical-trials';

export async function GET() {
  try {
    const options = await getAgeGroupOptions();
    return NextResponse.json(options);
  } catch (error) {
    console.error("API Error fetching age group options:", error);
    return NextResponse.json({ message: "Error fetching age group options" }, { status: 500 });
  }
}
