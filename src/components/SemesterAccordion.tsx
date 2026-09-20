import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash } from 'lucide-react';
import type { CalculatedSemester } from '../types/calculator';
import { formatGrade } from '../utils/format';
import { SubjectRow } from './SubjectRow';

interface SemesterAccordionProps {
  semester: CalculatedSemester;
  onUpdateSubject: (
    semId: number,
    subjectId: string,
    field: 'code' | 'name' | 'marks' | 'credits',
    value: string
  ) => void;
  onAddSubject: (semId: number) => void;
  onDeleteSubject: (semId: number, subjectId: string) => void;
  onClearSemester: (semId: number) => void;
  onReorderSubjects?: (semId: number, fromIndex: number, toIndex: number) => void;
  defaultExpanded?: boolean;
}

export const SemesterAccordion: React.FC<SemesterAccordionProps> = ({
  semester,
  onUpdateSubject,
  onAddSubject,
  onDeleteSubject,
  onClearSemester,
  onReorderSubjects,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const activeSubjectsCount = semester.subjects.filter(
    (s) => s.code.trim() !== '' || s.name.trim() !== '' || s.marks.trim() !== ''
  ).length;

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndexStr = e.dataTransfer.getData('text/plain');
    const fromIndex = draggedIndex !== null ? draggedIndex : Number(fromIndexStr);

    if (
      onReorderSubjects &&
      fromIndex !== null &&
      !isNaN(fromIndex) &&
      fromIndex >= 0 &&
      fromIndex < semester.subjects.length &&
      fromIndex !== toIndex
    ) {
      onReorderSubjects(semester.id, fromIndex, toIndex);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragLeave = () => {
    // Keep clean
  };

  return (
    <div className={`card semester-accordion ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div
        className="accordion-header"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className="accordion-title-group">
          <div className="accordion-toggle-icon">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          <h3>{semester.name}</h3>
          <span className="subject-count-tag">
            {activeSubjectsCount} {activeSubjectsCount === 1 ? 'subject' : 'subjects'}
          </span>
        </div>

        <div className="accordion-summary-stats">
          <div className="stat-item">
            <span className="stat-label">Credits:</span>
            <span className="stat-value">{semester.totalCredits}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">CP:</span>
            <span className="stat-value">{semester.totalCreditPoints}</span>
          </div>
          <div className="stat-item highlight">
            <span className="stat-label">SGPA:</span>
            <span className="stat-value">
              {semester.sgpa !== null ? formatGrade(semester.sgpa) : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="accordion-body">
          {semester.subjects.length === 0 ? (
            <div className="empty-semester-state">
              <p>No subjects added for {semester.name} yet.</p>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => onAddSubject(semester.id)}
              >
                <Plus size={16} /> Add First Subject
              </button>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="subject-table">
                  <thead>
                    <tr>
                      <th style={{ width: '36px' }} title="Drag to reorder"></th>
                      <th style={{ width: '40px' }}>#</th>
                      <th style={{ width: '180px' }}>Subject Code</th>
                      <th>Subject Name</th>
                      <th style={{ width: '110px' }} className="text-right">
                        Marks / 100
                      </th>
                      <th style={{ width: '100px' }} className="text-right">
                        Credits
                      </th>
                      <th style={{ width: '110px' }} className="text-right">
                        Grade Point
                      </th>
                      <th style={{ width: '120px' }} className="text-right">
                        Credit Points
                      </th>
                      <th style={{ width: '60px' }} className="text-center">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {semester.subjects.map((sub, idx) => (
                      <SubjectRow
                        key={sub.id}
                        subject={sub}
                        index={idx}
                        isDragging={draggedIndex === idx}
                        isDragOver={dragOverIndex === idx && draggedIndex !== idx}
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDrop={(e) => handleDrop(e, idx)}
                        onDragEnd={handleDragEnd}
                        onDragLeave={handleDragLeave}
                        onUpdate={(id, field, value) =>
                          onUpdateSubject(semester.id, id, field, value)
                        }
                        onDelete={(id) => onDeleteSubject(semester.id, id)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="semester-actions-bar">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => onAddSubject(semester.id)}
                >
                  <Plus size={16} /> Add Subject
                </button>

                <button
                  className="btn btn-ghost-danger btn-sm"
                  onClick={() => onClearSemester(semester.id)}
                  title="Clear all subjects in this semester"
                >
                  <Trash size={14} /> Clear Semester
                </button>
              </div>
            </>
          )}

          {/* Bottom Semester Footer Stats */}
          <div className="semester-footer-summary">
            <div className="summary-block">
              <span>Total Credits: </span>
              <strong>{semester.totalCredits}</strong>
            </div>
            <div className="summary-block">
              <span>Total Credit Points: </span>
              <strong>{semester.totalCreditPoints}</strong>
            </div>
            <div className="summary-block highlight">
              <span>SGPA: </span>
              <strong>{semester.sgpa !== null ? formatGrade(semester.sgpa) : '—'}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
