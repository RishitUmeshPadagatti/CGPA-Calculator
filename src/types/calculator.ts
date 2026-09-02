export interface Subject {
  id: string;
  code: string;
  name: string;
  marks: string; // Keep as string for controlled input handling
  credits: string; // Keep as string for controlled input handling
}

export interface CalculatedSubject extends Subject {
  numericMarks: number | null;
  numericCredits: number;
  gradePoint: number | null;
  creditPoints: number | null;
  normalizedCode: string;
  isReappearance: boolean;
  isFailedReappearance: boolean;
  isDuplicateInSemester: boolean;
}

export interface Semester {
  id: number;
  name: string;
  subjects: Subject[];
}

export interface CalculatedSemester {
  id: number;
  name: string;
  subjects: CalculatedSubject[];
  totalCredits: number;
  totalCreditPoints: number;
  sgpa: number | null;
  isValidForSGPA: boolean;
}

export interface SemesterSummary {
  semesterId: number;
  name: string;
  totalCredits: number;
  sgpa: number | null;
  cumulativeCGPA: number | null;
  isValid: boolean;
}

export interface VTUAppState {
  app: string;
  version: number;
  semesters: {
    [key: string]: {
      subjects: Subject[];
    };
  };
}

export interface CGPAResult {
  cgpa: number | null;
  cumulativeCredits: number;
  cumulativeCreditPoints: number;
  validSemesterCount: number;
  message?: string;
  semesterSummaries: SemesterSummary[];
}
