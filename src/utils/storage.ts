import type { Semester, Subject, VTUAppState } from '../types/calculator';

export const LOCAL_STORAGE_KEY = 'vtu-sgpa-cgpa-data';

export const EMPTY_INITIAL_SEMESTERS: Semester[] = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  name: `Semester ${i + 1}`,
  subjects: [],
}));

/**
 * Loads semester data from LocalStorage or returns empty initial semesters.
 */
export function loadFromLocalStorage(): Semester[] {
  try {
    const rawData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!rawData) {
      return EMPTY_INITIAL_SEMESTERS;
    }
    const parsed: VTUAppState = JSON.parse(rawData);
    if (!parsed || !parsed.semesters) {
      return EMPTY_INITIAL_SEMESTERS;
    }

    // Convert object or array schema to Semester[] array
    const semesters: Semester[] = [];
    for (let i = 1; i <= 8; i++) {
      const key = i.toString();
      const semObj = parsed.semesters[key];
      const subjects: Subject[] = Array.isArray(semObj?.subjects)
        ? semObj.subjects.map((sub, idx) => ({
            id: sub.id || `${i}-${idx + 1}-${Date.now()}`,
            code: sub.code || '',
            name: sub.name || '',
            marks: sub.marks !== undefined ? String(sub.marks) : '',
            credits: sub.credits !== undefined ? String(sub.credits) : '',
          }))
        : [];

      semesters.push({
        id: i,
        name: `Semester ${i}`,
        subjects,
      });
    }
    return semesters;
  } catch (error) {
    console.error('Failed to load VTU data from LocalStorage:', error);
    return EMPTY_INITIAL_SEMESTERS;
  }
}

/**
 * Saves current semester data to LocalStorage.
 */
export function saveToLocalStorage(semesters: Semester[]): void {
  try {
    const stateToSave: VTUAppState = {
      app: 'VTU SGPA CGPA Calculator',
      version: 1,
      semesters: {},
    };

    semesters.forEach((sem) => {
      stateToSave.semesters[sem.id.toString()] = {
        subjects: sem.subjects.map((s) => ({
          id: s.id,
          code: s.code,
          name: s.name,
          marks: s.marks,
          credits: s.credits,
        })),
      };
    });

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave, null, 2));
  } catch (error) {
    console.error('Failed to save VTU data to LocalStorage:', error);
  }
}

/**
 * Clears application data from LocalStorage.
 */
export function clearLocalStorage(): void {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
}

/**
 * Triggers JSON export download.
 */
export function exportToJSONFile(semesters: Semester[]): void {
  const stateToExport: VTUAppState = {
    app: 'VTU SGPA CGPA Calculator',
    version: 1,
    semesters: {},
  };

  semesters.forEach((sem) => {
    stateToExport.semesters[sem.id.toString()] = {
      subjects: sem.subjects.map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        marks: s.marks,
        credits: s.credits,
      })),
    };
  });

  const blob = new Blob([JSON.stringify(stateToExport, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `vtu-sgpa-cgpa-data.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parses and validates JSON data for import.
 */
export function validateAndParseImportJSON(jsonText: string): Semester[] {
  const parsed = JSON.parse(jsonText);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid JSON format.');
  }

  if (!parsed.semesters || typeof parsed.semesters !== 'object') {
    throw new Error('Missing "semesters" key in JSON data.');
  }

  const importedSemesters: Semester[] = [];

  for (let i = 1; i <= 8; i++) {
    const key = i.toString();
    const semData = parsed.semesters[key];
    const rawSubjects = Array.isArray(semData?.subjects) ? semData.subjects : [];

    const validatedSubjects: Subject[] = rawSubjects.map((s: any, idx: number) => ({
      id: s.id || `${i}-${idx + 1}-${Date.now()}`,
      code: typeof s.code === 'string' ? s.code : '',
      name: typeof s.name === 'string' ? s.name : '',
      marks: s.marks !== undefined ? String(s.marks) : '',
      credits: s.credits !== undefined ? String(s.credits) : '',
    }));

    importedSemesters.push({
      id: i,
      name: `Semester ${i}`,
      subjects: validatedSubjects,
    });
  }

  return importedSemesters;
}
