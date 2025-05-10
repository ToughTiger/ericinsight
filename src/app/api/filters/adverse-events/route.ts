
import { NextResponse } from 'next/server';
import { getAdverseEventOptions } from '@/services/clinical-trials';

export async function GET() {
  try {
    const options = await getAdverseEventOptions();
    return NextResponse.json(options);
  } catch (error) {
    console.error("API Error fetching adverse event options:", error);
    return NextResponse.json({ message: "Error fetching adverse event options" }, { status: 500 });
  }
}
