
/**
 * Represents a clinical trial center.
 */
export interface TrialCenter {
  /**
   * The name of the trial center.
   */
  name: string;
  /**
   * The location of the trial center.
   */
  location: string;
}

/**
 * Represents a patient's gender.
 */
export type Gender = 'Male' | 'Female' | 'Other';

/**
 * Represents an adverse event reported during the trial.
 */
export interface AdverseEvent {
  /**
   * The name of the adverse event.
   */
  name: string;
  /**
   * The severity of the adverse event.
   */
  severity: 'Mild' | 'Moderate' | 'Severe';
}

/**
 * Represents the Patient Global Assessment (PGA).
 */
export interface PGA {
  /**
   * The PGA score.
   */
  score: number;
  /**
   * A description of the PGA score.
   */
  description: string;
}

/**
 * Represents demographic information for a patient.
 */
export interface Demographics {
  age: number; // years
  race: 'Caucasian' | 'African American' | 'Asian' | 'Hispanic' | 'Other' | 'Unknown';
  ethnicity: 'Hispanic or Latino' | 'Not Hispanic or Latino' | 'Unknown';
  height?: number; // cm
  weight?: number; // kg
}

/**
 * Represents clinical trial data for a single participant/record.
 */
export interface TrialData {
  /**
   * The trial center.
   */
  trialCenter: TrialCenter;
  /**
   * The patient's gender.
   */
  gender: Gender;
  /**
   * The adverse events reported.
   */
  adverseEvents: AdverseEvent[];
  /**
   * The PGA score.
   */
  pga: PGA;
  /**
   * Unique patient identifier
   */
  patientId: string;
  /**
   * Demographic information for the patient.
   */
  demographics: Demographics;
}

/**
 * Represents the filters that can be applied to the trial data.
 */
export interface TrialFilters {
  /**
   * The trial center to filter by.
   */
  trialCenter?: string;
  /**
   * The gender to filter by.
   */
  gender?: Gender;
  /**
   * The adverse event to filter by (name of the event).
   */
  adverseEvent?: string;
  /**
   * The PGA score to filter by.
   */
  pga?: number;
}

// More comprehensive stubbed data
const allTrialData: TrialData[] = [
  {
    patientId: 'P001',
    trialCenter: { name: 'City Hospital', location: 'New York' },
    gender: 'Male',
    adverseEvents: [{ name: 'Headache', severity: 'Mild' }],
    pga: { score: 3, description: 'Moderate improvement' },
    demographics: { age: 45, race: 'Caucasian', ethnicity: 'Not Hispanic or Latino', height: 175, weight: 70 },
  },
  {
    patientId: 'P002',
    trialCenter: { name: 'City Hospital', location: 'New York' },
    gender: 'Female',
    adverseEvents: [{ name: 'Nausea', severity: 'Mild' }],
    pga: { score: 4, description: 'Significant improvement' },
    demographics: { age: 52, race: 'African American', ethnicity: 'Not Hispanic or Latino', height: 162, weight: 75 },
  },
  {
    patientId: 'P003',
    trialCenter: { name: 'General Clinic', location: 'Los Angeles' },
    gender: 'Male',
    adverseEvents: [
      { name: 'Fatigue', severity: 'Moderate' },
      { name: 'Dizziness', severity: 'Mild' },
    ],
    pga: { score: 2, description: 'Slight improvement' },
    demographics: { age: 60, race: 'Hispanic', ethnicity: 'Hispanic or Latino', weight: 80 },
  },
  {
    patientId: 'P004',
    trialCenter: { name: 'University Medical Center', location: 'Chicago' },
    gender: 'Female',
    adverseEvents: [],
    pga: { score: 5, description: 'Cleared' },
    demographics: { age: 38, race: 'Asian', ethnicity: 'Not Hispanic or Latino', height: 155, weight: 55 },
  },
  {
    patientId: 'P005',
    trialCenter: { name: 'Rural Health Services', location: 'Austin' },
    gender: 'Other',
    adverseEvents: [{ name: 'Rash', severity: 'Severe' }],
    pga: { score: 1, description: 'No improvement' },
    demographics: { age: 29, race: 'Other', ethnicity: 'Not Hispanic or Latino', height: 180 },
  },
  {
    patientId: 'P006',
    trialCenter: { name: 'City Hospital', location: 'New York' },
    gender: 'Male',
    adverseEvents: [{ name: 'Headache', severity: 'Moderate' }],
    pga: { score: 2, description: 'Slight improvement' },
    demographics: { age: 67, race: 'Caucasian', ethnicity: 'Not Hispanic or Latino', weight: 85 },
  },
  {
    patientId: 'P007',
    trialCenter: { name: 'General Clinic', location: 'Los Angeles' },
    gender: 'Female',
    adverseEvents: [{ name: 'Nausea', severity: 'Mild' }],
    pga: { score: 3, description: 'Moderate improvement' },
    demographics: { age: 42, race: 'Hispanic', ethnicity: 'Hispanic or Latino', height: 160, weight: 65 },
  },
  {
    patientId: 'P008',
    trialCenter: { name: 'University Medical Center', location: 'Chicago' },
    gender: 'Male',
    adverseEvents: [{ name: 'Fatigue', severity: 'Mild' }],
    pga: { score: 4, description: 'Significant improvement' },
    demographics: { age: 55, race: 'African American', ethnicity: 'Not Hispanic or Latino', height: 185, weight: 90 },
  },
  {
    patientId: 'P009',
    trialCenter: { name: 'Rural Health Services', location: 'Austin' },
    gender: 'Female',
    adverseEvents: [{ name: 'Dizziness', severity: 'Mild' }],
    pga: { score: 3, description: 'Moderate improvement' },
    demographics: { age: 33, race: 'Caucasian', ethnicity: 'Not Hispanic or Latino', height: 170, weight: 60 },
  },
  {
    patientId: 'P010',
    trialCenter: { name: 'City Hospital', location: 'New York' },
    gender: 'Other',
    adverseEvents: [{ name: 'Rash', severity: 'Mild' }, { name: 'Headache', severity: 'Mild' }],
    pga: { score: 2, description: 'Slight improvement' },
    demographics: { age: 48, race: 'Asian', ethnicity: 'Not Hispanic or Latino', height: 168, weight: 72 },
  },
];

/**
 * Asynchronously retrieves clinical trial data based on the provided filters.
 * This is a mock implementation. In a real application, this would fetch data from an API.
 *
 * @param filters The filters to apply to the trial data.
 * @returns A promise that resolves to an array of TrialData objects.
 */
export async function getTrialData(filters: TrialFilters): Promise<TrialData[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));

  let filteredData = allTrialData;

  if (filters.trialCenter) {
    filteredData = filteredData.filter(
      (item) => item.trialCenter.name === filters.trialCenter
    );
  }
  if (filters.gender) {
    filteredData = filteredData.filter(
      (item) => item.gender === filters.gender
    );
  }
  if (filters.adverseEvent) {
    filteredData = filteredData.filter((item) =>
      item.adverseEvents.some((event) => event.name === filters.adverseEvent)
    );
  }
  if (filters.pga !== undefined) {
    filteredData = filteredData.filter((item) => item.pga.score === filters.pga);
  }

  return filteredData;
}

/**
 * Asynchronously retrieves a single patient's data by their ID.
 * @param patientId The ID of the patient to retrieve.
 * @returns A promise that resolves to a TrialData object or undefined if not found.
 */
export async function getPatientById(patientId: string): Promise<TrialData | undefined> {
  await new Promise(resolve => setTimeout(resolve, 200)); // Simulate API call delay
  return allTrialData.find(patient => patient.patientId === patientId);
}


/**
 * Retrieves a list of unique trial center names.
 * @returns A promise that resolves to an array of strings.
 */
export async function getTrialCenterOptions(): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate API delay
  const centers = new Set(allTrialData.map(item => item.trialCenter.name));
  return Array.from(centers).sort();
}

/**
 * Retrieves a list of unique gender options.
 * @returns A promise that resolves to an array of Gender types.
 */
export async function getGenderOptions(): Promise<Gender[]> {
   await new Promise(resolve => setTimeout(resolve, 100));
   const genders = new Set(allTrialData.map(item => item.gender));
   return Array.from(genders);
}

/**
 * Retrieves a list of unique adverse event names.
 * @returns A promise that resolves to an array of strings.
 */
export async function getAdverseEventOptions(): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const events = new Set<string>();
  allTrialData.forEach(item => {
    item.adverseEvents.forEach(event => events.add(event.name));
  });
  return Array.from(events).sort();
}

/**
 * Retrieves a list of unique PGA scores.
 * @returns A promise that resolves to an array of numbers.
 */
export async function getPgaScoreOptions(): Promise<number[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const scores = new Set(allTrialData.map(item => item.pga.score));
  return Array.from(scores).sort((a, b) => a - b);
}
