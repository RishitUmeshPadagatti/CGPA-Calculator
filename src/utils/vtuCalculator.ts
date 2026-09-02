import type {
  CalculatedSubject,
  Semester,
  CalculatedSemester,
  SemesterSummary,
  CGPAResult,
} from '../types/calculator';

/**
 * Calculates VTU Grade Point based on total marks out of 100.
 * Returns null if marks field is blank or invalid.
 */
export function calculateGradePoint(marksInput: string): number | null {
  if (marksInput === undefined || marksInput === null || marksInput.trim() === '') {
    return null;
  }

  const marks = Number(marksInput);
  if (isNaN(marks) || marks < 0 || marks > 100) {
    return null;
  }

  // Exact VTU Grading Scale
  if (marks >= 90) return 10;
  if (marks >= 80) return 9;
  if (marks >= 70) return 8;
  if (marks >= 60) return 7;
  if (marks >= 55) return 6;
  if (marks >= 50) return 5;
  if (marks >= 40) return 4;
  return 0; // Below 40 marks
}

/**
 * Calculates Credit Points for a subject = Credits * Grade Point.
 */
export function calculateCreditPoints(credits: number, gradePoint: number | null): number | null {
  if (
    gradePoint === null ||
    isNaN(credits) ||
    credits < 0 ||
    !Number.isInteger(credits)
  ) {
    return null;
  }
  return credits * gradePoint;
}

/**
 * Normalizes subject code (trimmed & uppercase).
 */
export function normalizeSubjectCode(code: string): string {
  return code ? code.trim().toUpperCase() : '';
}

/**
 * Processes semesters to compute SGPA, detect reappearances, and flag duplicate codes.
 */
export function processSemesters(semesters: Semester[]): CalculatedSemester[] {
  const seenCodes = new Set<string>();

  return semesters.map((sem) => {
    // Count code frequencies in this semester to flag internal duplicates
    const codeCounts: { [code: string]: number } = {};
    sem.subjects.forEach((sub) => {
      const norm = normalizeSubjectCode(sub.code);
      if (norm) {
        codeCounts[norm] = (codeCounts[norm] || 0) + 1;
      }
    });

    const calculatedSubjects: CalculatedSubject[] = sem.subjects.map((sub) => {
      const normCode = normalizeSubjectCode(sub.code);
      const numMarks = sub.marks.trim() !== '' && !isNaN(Number(sub.marks)) ? Number(sub.marks) : null;
      const rawCredits = Number(sub.credits);
      const isCreditValid =
        sub.credits.trim() !== '' &&
        !isNaN(rawCredits) &&
        rawCredits >= 0 &&
        Number.isInteger(rawCredits);

      const numCredits = isCreditValid ? rawCredits : 0;

      const gradePoint = calculateGradePoint(sub.marks);
      const creditPoints = isCreditValid ? calculateCreditPoints(rawCredits, gradePoint) : null;

      const isReappearance = normCode !== '' && seenCodes.has(normCode);
      const isFailedReappearance = isReappearance && gradePoint === 0;
      const isDuplicateInSemester = normCode !== '' && (codeCounts[normCode] || 0) > 1;

      return {
        ...sub,
        numericMarks: numMarks,
        numericCredits: numCredits,
        gradePoint,
        creditPoints,
        normalizedCode: normCode,
        isReappearance,
        isFailedReappearance,
        isDuplicateInSemester,
      };
    });

    // Update seen codes for subsequent semesters
    calculatedSubjects.forEach((sub) => {
      if (sub.normalizedCode) {
        seenCodes.add(sub.normalizedCode);
      }
    });

    // Calculate Semester SGPA (strictly using this semester's attempts)
    const validSubjects = calculatedSubjects.filter(
      (sub) => sub.gradePoint !== null && sub.creditPoints !== null
    );

    const totalCredits = validSubjects.reduce((acc, sub) => acc + sub.numericCredits, 0);
    const totalCreditPoints = validSubjects.reduce(
      (acc, sub) => acc + (sub.creditPoints || 0),
      0
    );

    const sgpa =
      validSubjects.length > 0 && totalCredits > 0
        ? parseFloat((totalCreditPoints / totalCredits).toFixed(2))
        : null;

    return {
      id: sem.id,
      name: sem.name,
      subjects: calculatedSubjects,
      totalCredits,
      totalCreditPoints,
      sgpa,
      isValidForSGPA: validSubjects.length > 0 && totalCredits > 0,
    };
  });
}

/**
 * Calculates Cumulative CGPA and per-semester cumulative CGPA.
 * Requirements:
 * - Requires at least 2 valid semesters.
 * - Does NOT double-count repeated/backlog subject codes.
 * - Uses the latest attempt for repeated subjects up to each semester point.
 */
export function calculateCGPA(calculatedSemesters: CalculatedSemester[]): CGPAResult {
  const validSemesters = calculatedSemesters.filter((sem) => sem.isValidForSGPA);
  const semesterSummaries: SemesterSummary[] = [];

  // Track overall latest attempts for final CGPA
  // Key: subjectCode or unique fallback ID if code is blank
  const semesterCumulativeCGPAs: { [semId: number]: number | null } = {};

  // Compute cumulative CGPA up to each semester (1..8)
  for (let i = 1; i <= 8; i++) {
    const semsUpToI = calculatedSemesters.filter((s) => s.id <= i && s.isValidForSGPA);
    
    if (semsUpToI.length < 2) {
      semesterCumulativeCGPAs[i] = null;
    } else {
      // Collect all valid subject attempts up to semester i
      const latestSubjectsMap = new Map<string, CalculatedSubject>();
      let uncodedCounter = 0;

      for (const sem of semsUpToI) {
        for (const sub of sem.subjects) {
          if (sub.gradePoint !== null && sub.creditPoints !== null) {
            const key = sub.normalizedCode !== '' ? sub.normalizedCode : `__uncoded_${uncodedCounter++}`;
            // Overwrite with latest attempt up to semester i
            latestSubjectsMap.set(key, sub);
          }
        }
      }

      let cumCredits = 0;
      let cumCreditPoints = 0;

      latestSubjectsMap.forEach((sub) => {
        if (sub.gradePoint !== null && sub.gradePoint > 0) {
          cumCredits += sub.numericCredits;
          cumCreditPoints += sub.creditPoints || 0;
        }
      });

      semesterCumulativeCGPAs[i] =
        cumCredits > 0 ? parseFloat((cumCreditPoints / cumCredits).toFixed(2)) : null;
    }
  }

  // Populate semester summaries for the table in Section 12
  calculatedSemesters.forEach((sem) => {
    semesterSummaries.push({
      semesterId: sem.id,
      name: sem.name,
      totalCredits: sem.totalCredits,
      sgpa: sem.sgpa,
      cumulativeCGPA: semesterCumulativeCGPAs[sem.id],
      isValid: sem.isValidForSGPA,
    });
  });

  // Calculate overall final CGPA
  if (validSemesters.length < 2) {
    return {
      cgpa: null,
      cumulativeCredits: 0,
      cumulativeCreditPoints: 0,
      validSemesterCount: validSemesters.length,
      message: 'CGPA requires results from at least 2 semesters',
      semesterSummaries,
    };
  }

  // Final CGPA across all active valid semesters
  const finalLatestSubjectsMap = new Map<string, CalculatedSubject>();
  let uncodedIndex = 0;

  validSemesters.forEach((sem) => {
    sem.subjects.forEach((sub) => {
      if (sub.gradePoint !== null && sub.creditPoints !== null) {
        const key = sub.normalizedCode !== '' ? sub.normalizedCode : `__uncoded_${uncodedIndex++}`;
        finalLatestSubjectsMap.set(key, sub);
      }
    });
  });

  let cumulativeCredits = 0;
  let cumulativeCreditPoints = 0;

  finalLatestSubjectsMap.forEach((sub) => {
    if (sub.gradePoint !== null && sub.gradePoint > 0) {
      cumulativeCredits += sub.numericCredits;
      cumulativeCreditPoints += sub.creditPoints || 0;
    }
  });

  const cgpa =
    cumulativeCredits > 0
      ? parseFloat((cumulativeCreditPoints / cumulativeCredits).toFixed(2))
      : null;

  return {
    cgpa,
    cumulativeCredits,
    cumulativeCreditPoints,
    validSemesterCount: validSemesters.length,
    semesterSummaries,
  };
}

/**
 * Counts the total active backlogs (subjects whose latest attempt has gradePoint === 0).
 */
export function countActiveBacklogs(calculatedSemesters: CalculatedSemester[]): number {
  const latestSubjectsMap = new Map<string, CalculatedSubject>();

  calculatedSemesters.forEach((sem) => {
    sem.subjects.forEach((sub) => {
      if (sub.normalizedCode !== '' && sub.gradePoint !== null && sub.creditPoints !== null) {
        latestSubjectsMap.set(sub.normalizedCode, sub);
      }
    });
  });

  let activeBacklogCount = 0;
  latestSubjectsMap.forEach((sub) => {
    if (sub.gradePoint === 0) {
      activeBacklogCount++;
    }
  });

  return activeBacklogCount;
}
