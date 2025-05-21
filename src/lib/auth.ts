
'use client'; // Since we're using localStorage

export interface User {
  id: string;
  username: string;
  name: string;
}

export interface Study {
  id: string;
  name: string;
  description: string;
}

// Dummy data
const DUMMY_USERS: Record<string, { passwordSalted: string; user: User }> = {
  'user1': { passwordSalted: 'password123', user: { id: 'user1', username: 'testuser', name: 'Test User' } },
};

const DUMMY_STUDIES: Record<string, Study[]> = {
  'user1': [
    { id: 'studyA', name: 'Alpha Clinical Trial', description: 'Phase 3 study for new drug Alpha.' },
    { id: 'studyB', name: 'Beta Research Project', description: 'Observational study Beta.' },
  ],
};

const AUTH_TOKEN_KEY = 'clinicalTrialAppAuthToken';
const SELECTED_STUDY_KEY = 'clinicalTrialAppSelectedStudyId';
const CURRENT_USER_KEY = 'clinicalTrialAppCurrentUser';


export function login(username: string, passwordSalted: string): User | null {
  const userRecord = Object.values(DUMMY_USERS).find(u => u.user.username === username);
  if (userRecord && userRecord.passwordSalted === passwordSalted) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_TOKEN_KEY, `dummy-token-${userRecord.user.id}`);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userRecord.user));
    }
    return userRecord.user;
  }
  return null;
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(SELECTED_STUDY_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = '/login'; // Redirect to login after logout
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(CURRENT_USER_KEY);
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error("Error parsing current user from localStorage", e);
    return null;
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStudiesForCurrentUser(): Study[] {
  const currentUser = getCurrentUser();
  if (!currentUser || !DUMMY_STUDIES[currentUser.id]) {
    return [];
  }
  return DUMMY_STUDIES[currentUser.id];
}

export function setSelectedStudy(studyId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SELECTED_STUDY_KEY, studyId);
  }
}

export function getSelectedStudyId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SELECTED_STUDY_KEY);
}

export function getSelectedStudy(): Study | null {
    const studyId = getSelectedStudyId();
    if (!studyId) return null;
    const studies = getStudiesForCurrentUser();
    return studies.find(s => s.id === studyId) || null;
}
