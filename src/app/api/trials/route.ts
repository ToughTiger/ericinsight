
import { NextResponse, type NextRequest } from 'next/server';
import { getTrialData, type TrialFilters } from '@/services/clinical-trials';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const filters: TrialFilters = {};

  const center = searchParams.get('center');
  if (center) filters.center = center;

  const gender = searchParams.get('gender') as TrialFilters['gender'];
  if (gender) filters.gender = gender;

  const treatment = searchParams.get('treatment') as TrialFilters['treatment'];
  if (treatment) filters.treatment = treatment;

  const ageGroup = searchParams.get('ageGroup') as TrialFilters['ageGroup'];
  if (ageGroup) filters.ageGroup = ageGroup;

  const pgaScoreString = searchParams.get('pgaScore');
  if (pgaScoreString) {
    const pgaScore = parseInt(pgaScoreString, 10);
    if (!isNaN(pgaScore)) {
      filters.pgaScore = pgaScore;
    }
  }

  const adverseEventName = searchParams.get('adverseEventName');
  if (adverseEventName) filters.adverseEventName = adverseEventName;

  const ittString = searchParams.get('itt');
  if (ittString) filters.itt = ittString === 'true';

  const ppString = searchParams.get('pp');
  if (ppString) filters.pp = ppString === 'true';
  
  try {
    const data = await getTrialData(filters);
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error fetching trial data:", error);
    return NextResponse.json({ message: "Error fetching trial data" }, { status: 500 });
  }
}
