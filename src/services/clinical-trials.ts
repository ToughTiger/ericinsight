
/**
 * Represents a patient's gender.
 */
export type Gender = 'Male' | 'Female' | 'Other' | 'Unknown';

/**
 * Represents the severity of an adverse event.
 */
export type AeSeverity = 'Mild' | 'Moderate' | 'Severe' | 'Unknown';

/**
 * Represents the relatedness of an adverse event to treatment.
 */
export type AeRelationship = 'Related' | 'Not Related' | 'Possible' | 'Unknown';


/**
 * Represents an adverse event record.
 */
export interface AeDataRecord {
  ae: string; // Name of the adverse event
  aeSeverity: AeSeverity;
  aeRelationship: AeRelationship; // AE_REL
}

/**
 * Represents study population information for a patient.
 */
export interface StudyPopulation {
  itt: boolean; // Intention-to-treat
  pp: boolean;  // Per-protocol
}

/**
 * Represents global assessment information for a patient.
 */
export interface GlobalAssessment {
  pgaScore: number;
  pgaDescription: string;
}

/**
 * Represents demographic information for a patient.
 */
export interface DemographicsData {
  age: number; // years
  ageGroup: '18-30' | '31-45' | '46-60' | '61+' | 'Unknown';
  gender: Gender;
  race: 'Caucasian' | 'African American' | 'Asian' | 'Hispanic' | 'Other' | 'Unknown';
  ethnicity: 'Hispanic or Latino' | 'Not Hispanic or Latino' | 'Unknown';
  heightCm?: number;
  weightKg?: number;
}

/**
 * Represents randomization information for a patient.
 */
export interface RandomizationData {
  center: string; // Trial Center Name
  treatment: 'Active Drug' | 'Placebo' | 'Comparator';
}

/**
 * Represents baseline characteristics for a patient.
 */
export interface BaselineCharacteristics {
  surgeryLastYear: boolean; // Surgery_1Y
  workStatus: 'Working' | 'Not Working' | 'Student' | 'Retired' | 'Unknown'; // Work
}

/**
 * Represents a single Visual Analog Scale (VAS) data point.
 */
export interface VasDataPoint {
  day: number;
  vasScore: number;
}

/**
 * Represents vital signs data for a patient.
 */
export interface VitalSignsData {
  dbp?: number; // Diastolic blood pressure (mmHg)
  sbp?: number; // Systolic blood pressure (mmHg)
  pr?: number;  // Pulse rate (beats/min)
  rr?: number;  // Respiratory rate (breaths/min)
}

/**
 * Represents comprehensive clinical trial data for a single participant/record.
 */
export interface TrialData {
  patientId: string;
  demographics: DemographicsData;
  randomization: RandomizationData;
  studyPopulations: StudyPopulation;
  globalAssessment: GlobalAssessment;
  baselineCharacteristics: BaselineCharacteristics;
  aeData: AeDataRecord[];
  vasData: VasDataPoint[];
  vitalSigns: VitalSignsData;
}

/**
 * Represents the filters that can be applied to the trial data.
 */
export interface TrialFilters {
  center?: string; // from randomization.center
  gender?: Gender; // from demographics.gender
  treatment?: 'Active Drug' | 'Placebo' | 'Comparator'; // from randomization.treatment
  ageGroup?: '18-30' | '31-45' | '46-60' | '61+' | 'Unknown'; // from demographics.ageGroup
  pgaScore?: number; // from globalAssessment.pgaScore
  adverseEventName?: string; // from aeData[].ae
  itt?: boolean;
  pp?: boolean;
}

// Updated and expanded mock data based on the new schema
const allTrialData: TrialData[] = [
  {
    patientId: 'P001',
    demographics: { age: 45, ageGroup: '31-45', gender: 'Male', race: 'Caucasian', ethnicity: 'Not Hispanic or Latino', heightCm: 175, weightKg: 70 },
    randomization: { center: 'City Hospital', treatment: 'Active Drug' },
    studyPopulations: { itt: true, pp: true },
    globalAssessment: { pgaScore: 3, pgaDescription: 'Moderate improvement' },
    baselineCharacteristics: { surgeryLastYear: false, workStatus: 'Working' },
    aeData: [{ ae: 'Headache', aeSeverity: 'Mild', aeRelationship: 'Possible' }],
    vasData: [{ day: 0, vasScore: 7 }, { day: 7, vasScore: 4 }, { day: 14, vasScore: 3 }],
    vitalSigns: { dbp: 80, sbp: 120, pr: 70, rr: 16 },
  },
  {
    patientId: 'P002',
    demographics: { age: 52, ageGroup: '46-60', gender: 'Female', race: 'African American', ethnicity: 'Not Hispanic or Latino', heightCm: 162, weightKg: 75 },
    randomization: { center: 'City Hospital', treatment: 'Placebo' },
    studyPopulations: { itt: true, pp: false },
    globalAssessment: { pgaScore: 4, pgaDescription: 'Significant improvement' },
    baselineCharacteristics: { surgeryLastYear: true, workStatus: 'Not Working' },
    aeData: [{ ae: 'Nausea', aeSeverity: 'Mild', aeRelationship: 'Not Related' }],
    vasData: [{ day: 0, vasScore: 8 }, { day: 7, vasScore: 5 }, { day: 14, vasScore: 2 }],
    vitalSigns: { dbp: 85, sbp: 130, pr: 75, rr: 18 },
  },
  {
    patientId: 'P003',
    demographics: { age: 60, ageGroup: '46-60', gender: 'Male', race: 'Hispanic', ethnicity: 'Hispanic or Latino', weightKg: 80 },
    randomization: { center: 'General Clinic', treatment: 'Active Drug' },
    studyPopulations: { itt: true, pp: true },
    globalAssessment: { pgaScore: 2, pgaDescription: 'Slight improvement' },
    baselineCharacteristics: { surgeryLastYear: false, workStatus: 'Retired' },
    aeData: [
      { ae: 'Fatigue', aeSeverity: 'Moderate', aeRelationship: 'Related' },
      { ae: 'Dizziness', aeSeverity: 'Mild', aeRelationship: 'Possible' },
    ],
    vasData: [{ day: 0, vasScore: 6 }, { day: 7, vasScore: 5 }, { day: 14, vasScore: 4 }],
    vitalSigns: { dbp: 70, sbp: 110, pr: 60, rr: 14 },
  },
  {
    patientId: 'P004',
    demographics: { age: 38, ageGroup: '31-45', gender: 'Female', race: 'Asian', ethnicity: 'Not Hispanic or Latino', heightCm: 155, weightKg: 55 },
    randomization: { center: 'University Medical Center', treatment: 'Comparator' },
    studyPopulations: { itt: true, pp: true },
    globalAssessment: { pgaScore: 5, pgaDescription: 'Cleared' },
    baselineCharacteristics: { surgeryLastYear: false, workStatus: 'Working' },
    aeData: [],
    vasData: [{ day: 0, vasScore: 5 }, { day: 7, vasScore: 2 }, { day: 14, vasScore: 1 }],
    vitalSigns: { dbp: 75, sbp: 115, pr: 65, rr: 15 },
  },
  {
    patientId: 'P005',
    demographics: { age: 29, ageGroup: '18-30', gender: 'Other', race: 'Other', ethnicity: 'Not Hispanic or Latino', heightCm: 180 },
    randomization: { center: 'Rural Health Services', treatment: 'Placebo' },
    studyPopulations: { itt: false, pp: false },
    globalAssessment: { pgaScore: 1, pgaDescription: 'No improvement' },
    baselineCharacteristics: { surgeryLastYear: true, workStatus: 'Student' },
    aeData: [{ ae: 'Rash', aeSeverity: 'Severe', aeRelationship: 'Related' }],
    vasData: [{ day: 0, vasScore: 9 }, { day: 7, vasScore: 9 }, { day: 14, vasScore: 8 }],
    vitalSigns: { dbp: 90, sbp: 140, pr: 80, rr: 20 },
  },
  // Add 5 more patients
  {
    patientId: 'P006',
    demographics: { age: 67, ageGroup: '61+', gender: 'Male', race: 'Caucasian', ethnicity: 'Not Hispanic or Latino', weightKg: 85 },
    randomization: { center: 'City Hospital', treatment: 'Active Drug' },
    studyPopulations: { itt: true, pp: true },
    globalAssessment: { pgaScore: 2, pgaDescription: 'Slight improvement' },
    baselineCharacteristics: { surgeryLastYear: false, workStatus: 'Retired' },
    aeData: [{ ae: 'Headache', aeSeverity: 'Moderate', aeRelationship: 'Possible' }],
    vasData: [{ day: 0, vasScore: 7 }, { day: 7, vasScore: 6 }, { day: 14, vasScore: 5 }],
    vitalSigns: { dbp: 82, sbp: 125, pr: 72, rr: 17 },
  },
  {
    patientId: 'P007',
    demographics: { age: 42, ageGroup: '31-45', gender: 'Female', race: 'Hispanic', ethnicity: 'Hispanic or Latino', heightCm: 160, weightKg: 65 },
    randomization: { center: 'General Clinic', treatment: 'Placebo' },
    studyPopulations: { itt: true, pp: false },
    globalAssessment: { pgaScore: 3, pgaDescription: 'Moderate improvement' },
    baselineCharacteristics: { surgeryLastYear: true, workStatus: 'Working' },
    aeData: [{ ae: 'Nausea', aeSeverity: 'Mild', aeRelationship: 'Not Related' }],
    vasData: [{ day: 0, vasScore: 6 }, { day: 7, vasScore: 3 }, { day: 14, vasScore: 2 }],
    vitalSigns: { dbp: 78, sbp: 118, pr: 68, rr: 16 },
  },
  {
    patientId: 'P008',
    demographics: { age: 55, ageGroup: '46-60', gender: 'Male', race: 'African American', ethnicity: 'Not Hispanic or Latino', heightCm: 185, weightKg: 90 },
    randomization: { center: 'University Medical Center', treatment: 'Comparator' },
    studyPopulations: { itt: true, pp: true },
    globalAssessment: { pgaScore: 4, pgaDescription: 'Significant improvement' },
    baselineCharacteristics: { surgeryLastYear: false, workStatus: 'Working' },
    aeData: [{ ae: 'Fatigue', aeSeverity: 'Mild', aeRelationship: 'Possible' }],
    vasData: [{ day: 0, vasScore: 7 }, { day: 7, vasScore: 4 }, { day: 14, vasScore: 1 }],
    vitalSigns: { dbp: 88, sbp: 135, pr: 78, rr: 19 },
  },
  {
    patientId: 'P009',
    demographics: { age: 33, ageGroup: '31-45', gender: 'Female', race: 'Caucasian', ethnicity: 'Not Hispanic or Latino', heightCm: 170, weightKg: 60 },
    randomization: { center: 'Rural Health Services', treatment: 'Active Drug' },
    studyPopulations: { itt: true, pp: true },
    globalAssessment: { pgaScore: 3, pgaDescription: 'Moderate improvement' },
    baselineCharacteristics: { surgeryLastYear: false, workStatus: 'Working' },
    aeData: [{ ae: 'Dizziness', aeSeverity: 'Mild', aeRelationship: 'Possible' }],
    vasData: [{ day: 0, vasScore: 5 }, { day: 7, vasScore: 3 }, { day: 14, vasScore: 2 }],
    vitalSigns: { dbp: 72, sbp: 112, pr: 62, rr: 14 },
  },
  {
    patientId: 'P010',
    demographics: { age: 48, ageGroup: '46-60', gender: 'Other', race: 'Asian', ethnicity: 'Not Hispanic or Latino', heightCm: 168, weightKg: 72 },
    randomization: { center: 'City Hospital', treatment: 'Placebo' },
    studyPopulations: { itt: true, pp: false },
    globalAssessment: { pgaScore: 2, pgaDescription: 'Slight improvement' },
    baselineCharacteristics: { surgeryLastYear: true, workStatus: 'Not Working' },
    aeData: [{ ae: 'Rash', aeSeverity: 'Mild', aeRelationship: 'Not Related' }, { ae: 'Headache', aeSeverity: 'Mild', aeRelationship: 'Possible' }],
    vasData: [{ day: 0, vasScore: 8 }, { day: 7, vasScore: 7 }, { day: 14, vasScore: 6 }],
    vitalSigns: { dbp: 86, sbp: 128, pr: 76, rr: 18 },
  },
];

/**
 * Asynchronously retrieves clinical trial data based on the provided filters.
 */
export async function getTrialData(filters: TrialFilters): Promise<TrialData[]> {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call delay

  let filteredData = allTrialData;

  if (filters.center) {
    filteredData = filteredData.filter(item => item.randomization.center === filters.center);
  }
  if (filters.gender) {
    filteredData = filteredData.filter(item => item.demographics.gender === filters.gender);
  }
  if (filters.treatment) {
    filteredData = filteredData.filter(item => item.randomization.treatment === filters.treatment);
  }
  if (filters.ageGroup) {
    filteredData = filteredData.filter(item => item.demographics.ageGroup === filters.ageGroup);
  }
  if (filters.pgaScore !== undefined) {
    filteredData = filteredData.filter(item => item.globalAssessment.pgaScore === filters.pgaScore);
  }
  if (filters.adverseEventName) {
    filteredData = filteredData.filter(item =>
      item.aeData.some(ae => ae.ae === filters.adverseEventName)
    );
  }
  if (filters.itt !== undefined) {
    filteredData = filteredData.filter(item => item.studyPopulations.itt === filters.itt);
  }
  if (filters.pp !== undefined) {
    filteredData = filteredData.filter(item => item.studyPopulations.pp === filters.pp);
  }

  return filteredData;
}

/**
 * Asynchronously retrieves a single patient's data by their ID.
 */
export async function getPatientById(patientId: string): Promise<TrialData | undefined> {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate API call delay
  return allTrialData.find(patient => patient.patientId === patientId);
}

/**
 * Retrieves a list of unique trial center names.
 */
export async function getTrialCenterOptions(): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const centers = new Set(allTrialData.map(item => item.randomization.center));
  return Array.from(centers).sort();
}

/**
 * Retrieves a list of unique gender options.
 */
export async function getGenderOptions(): Promise<Gender[]> {
   await new Promise(resolve => setTimeout(resolve, 100));
   const genders = new Set(allTrialData.map(item => item.demographics.gender));
   return Array.from(genders);
}

/**
 * Retrieves a list of unique treatment options.
 */
export async function getTreatmentOptions(): Promise<Array<'Active Drug' | 'Placebo' | 'Comparator'>> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const treatments = new Set(allTrialData.map(item => item.randomization.treatment));
  return Array.from(treatments);
}

/**
 * Retrieves a list of unique age group options.
 */
export async function getAgeGroupOptions(): Promise<Array<'18-30' | '31-45' | '46-60' | '61+' | 'Unknown'>> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const ageGroups = new Set(allTrialData.map(item => item.demographics.ageGroup));
  return Array.from(ageGroups);
}

/**
 * Retrieves a list of unique adverse event names.
 */
export async function getAdverseEventOptions(): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const events = new Set<string>();
  allTrialData.forEach(item => {
    item.aeData.forEach(event => events.add(event.ae));
  });
  return Array.from(events).sort();
}

/**
 * Retrieves a list of unique PGA scores.
 */
export async function getPgaScoreOptions(): Promise<number[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const scores = new Set(allTrialData.map(item => item.globalAssessment.pgaScore));
  return Array.from(scores).sort((a, b) => a - b);
}
