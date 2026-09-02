import { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import type { Semester } from './types/calculator';
import {
  processSemesters,
  calculateCGPA,
  countActiveBacklogs,
} from './utils/vtuCalculator';
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  exportToJSONFile,
  validateAndParseImportJSON,
} from './utils/storage';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { CGPASummaryTable } from './components/CGPASummaryTable';
import { SemesterAccordion } from './components/SemesterAccordion';
import { FinalCGPABanner } from './components/FinalCGPABanner';
import { Modal } from './components/Modal';

export function App() {
  const [semesters, setSemesters] = useState<Semester[]>(() => loadFromLocalStorage());

  // Modal dialog states
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isDanger: boolean;
    confirmText: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    isDanger: false,
    confirmText: 'Confirm',
    onConfirm: () => {},
  });

  // Notification Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Automatically sync state changes to LocalStorage
  useEffect(() => {
    saveToLocalStorage(semesters);
  }, [semesters]);

  // Derive calculated semesters and CGPA metrics
  const calculatedSemesters = useMemo(() => {
    return processSemesters(semesters);
  }, [semesters]);

  const cgpaResult = useMemo(() => {
    return calculateCGPA(calculatedSemesters);
  }, [calculatedSemesters]);

  const activeBacklogs = useMemo(() => {
    return countActiveBacklogs(calculatedSemesters);
  }, [calculatedSemesters]);

  // Trigger celebration confetti for high distinction CGPA (>= 8.5)
  useEffect(() => {
    if (cgpaResult.cgpa !== null && cgpaResult.cgpa >= 8.5 && cgpaResult.validSemesterCount >= 2) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch (e) {
        // Safe fallback if canvas is not available
      }
    }
  }, [cgpaResult.cgpa, cgpaResult.validSemesterCount]);

  // CRUD operations for subjects
  const handleUpdateSubject = (
    semId: number,
    subjectId: string,
    field: 'code' | 'name' | 'marks' | 'credits',
    value: string
  ) => {
    setSemesters((prevSemesters) =>
      prevSemesters.map((sem) => {
        if (sem.id !== semId) return sem;
        return {
          ...sem,
          subjects: sem.subjects.map((sub) => {
            if (sub.id !== subjectId) return sub;
            return { ...sub, [field]: value };
          }),
        };
      })
    );
  };

  const handleAddSubject = (semId: number) => {
    setSemesters((prevSemesters) =>
      prevSemesters.map((sem) => {
        if (sem.id !== semId) return sem;
        const newSubId = `${semId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        return {
          ...sem,
          subjects: [
            ...sem.subjects,
            { id: newSubId, code: '', name: '', marks: '', credits: '3' },
          ],
        };
      })
    );
  };

  const handleDeleteSubject = (semId: number, subjectId: string) => {
    setSemesters((prevSemesters) =>
      prevSemesters.map((sem) => {
        if (sem.id !== semId) return sem;
        return {
          ...sem,
          subjects: sem.subjects.filter((sub) => sub.id !== subjectId),
        };
      })
    );
  };

  const handleReorderSubjects = (semId: number, fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setSemesters((prevSemesters) =>
      prevSemesters.map((sem) => {
        if (sem.id !== semId) return sem;
        const updatedSubjects = [...sem.subjects];
        const [movedSubject] = updatedSubjects.splice(fromIndex, 1);
        updatedSubjects.splice(toIndex, 0, movedSubject);
        return {
          ...sem,
          subjects: updatedSubjects,
        };
      })
    );
  };

  const handleClearSemester = (semId: number) => {
    setModalState({
      isOpen: true,
      title: `Clear Semester ${semId}`,
      message: `Are you sure you want to remove all subjects from Semester ${semId}?`,
      isDanger: true,
      confirmText: 'Clear Semester',
      onConfirm: () => {
        setSemesters((prevSemesters) =>
          prevSemesters.map((sem) => {
            if (sem.id !== semId) return sem;
            return { ...sem, subjects: [] };
          })
        );
        showToast(`Semester ${semId} subjects cleared.`);
      },
    });
  };

  // Action Bar operations
  const handleExport = () => {
    exportToJSONFile(semesters);
    showToast('Data exported successfully as JSON file.');
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const importedData = validateAndParseImportJSON(text);

        setModalState({
          isOpen: true,
          title: 'Import JSON Data',
          message:
            'Importing this file will replace your current data in LocalStorage. Are you sure you want to continue?',
          isDanger: true,
          confirmText: 'Import & Overwrite',
          onConfirm: () => {
            setSemesters(importedData);
            saveToLocalStorage(importedData);
            showToast('JSON data imported successfully.');
          },
        });
      } catch (err: any) {
        showToast(err?.message || 'Failed to parse JSON file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* App Header */}
      <Header
        onExport={handleExport}
        onImportClick={handleImportFile}
      />

      {/* Main Container */}
      <main className="main-content">
        {/* Top Metric Cards */}
        <SummaryCards cgpaResult={cgpaResult} activeBacklogs={activeBacklogs} />

        {/* Semester CGPA Summary Table */}
        <CGPASummaryTable
          summaries={cgpaResult.semesterSummaries}
          validSemesterCount={cgpaResult.validSemesterCount}
        />

        {/* Semester 1 to 8 Accordions */}
        <section className="semesters-section">
          <div className="section-header">
            <h2>Semesters (1 – 8)</h2>
            <p className="section-subtitle">
              Enter Subject Code, Name, Marks (out of 100), and Credits for each semester. Grade Points, Credit Points, and Reappearances are calculated automatically.
            </p>
          </div>

          <div className="accordion-list">
            {calculatedSemesters.map((sem, idx) => (
              <SemesterAccordion
                key={sem.id}
                semester={sem}
                onUpdateSubject={handleUpdateSubject}
                onAddSubject={handleAddSubject}
                onDeleteSubject={handleDeleteSubject}
                onClearSemester={handleClearSemester}
                onReorderSubjects={handleReorderSubjects}
                defaultExpanded={idx === 0 || idx === 1} // Expand Sem 1 & 2 by default
              />
            ))}
          </div>
        </section>

        {/* Final CGPA Banner at Bottom */}
        <FinalCGPABanner cgpaResult={cgpaResult} />
      </main>

      {/* Reusable Modal Dialog */}
      <Modal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        isDanger={modalState.isDanger}
        confirmText={modalState.confirmText}
        onConfirm={modalState.onConfirm}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export default App;
