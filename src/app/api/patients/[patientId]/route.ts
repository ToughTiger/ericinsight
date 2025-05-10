
import { NextResponse, type NextRequest } from 'next/server';
import { getPatientById } from '@/services/clinical-trials';

interface Params {
  patientId: string;
}

export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { patientId } = params;

  if (!patientId) {
    return NextResponse.json({ message: "Patient ID is required" }, { status: 400 });
  }

  try {
    const patient = await getPatientById(patientId);
    if (patient) {
      return NextResponse.json(patient);
    } else {
      return NextResponse.json({ message: "Patient not found" }, { status: 404 });
    }
  } catch (error) {
    console.error(`API Error fetching patient data for ID ${patientId}:`, error);
    return NextResponse.json({ message: "Error fetching patient data" }, { status: 500 });
  }
}
