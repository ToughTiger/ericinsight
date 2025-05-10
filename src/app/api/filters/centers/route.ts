
import { NextResponse } from 'next/server';
import { getTrialCenterOptions } from '@/services/clinical-trials';

export async function GET() {
  try {
    const options = await getTrialCenterOptions();
    return NextResponse.json(options);
  } catch (error) {
    console.error("API Error fetching trial center options:", error);
    return NextResponse.json({ message: "Error fetching trial center options" }, { status: 500 });
  }
}
