import React from 'react';
import { Trash2, RefreshCw, AlertTriangle, CheckCircle2, GripVertical } from 'lucide-react';
import type { CalculatedSubject } from '../types/calculator';

interface SubjectRowProps {
  subject: CalculatedSubject;
  index: number;
  onUpdate: (id: string, field: 'code' | 'name' | 'marks' | 'credits', value: string) => void;
  onDelete: (id: string) => void;
  isDragging?: boolean;
  isDragOver?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
}

export const SubjectRow: React.FC<SubjectRowProps> = ({
  subject,
  index,
  onUpdate,
  onDelete,
  isDragging = false,
  isDragOver = false,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onDragLeave,
}) => {
  const isMarksInvalid =
    subject.marks.trim() !== '' &&
    (isNaN(Number(subject.marks)) || Number(subject.marks) < 0 || Number(subject.marks) > 100);

  const creditsNum = Number(subject.credits);
  const isCreditsInvalid =
    subject.credits.trim() !== '' &&
    (isNaN(creditsNum) || creditsNum < 0 || !Number.isInteger(creditsNum));

  return (
    <tr
      className={`subject-row ${isDragging ? 'is-dragging' : ''} ${isDragOver ? 'is-drag-over' : ''} ${
        subject.isReappearance ? 'reappearance-row' : ''
      }`}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onDragLeave={onDragLeave}
    >
      {/* Drag Handle */}
      <td className="cell-drag text-center" title="Drag to reorder subject">
        <div className="drag-handle">
          <GripVertical size={16} />
        </div>
      </td>

      <td className="cell-index">{index + 1}</td>

      {/* Subject Code */}
      <td className="cell-code">
        <div className="input-group">
          <input
            type="text"
            className={`form-input uppercase-input ${subject.isDuplicateInSemester ? 'input-warning' : ''}`}
            placeholder="e.g. 21MAT11"
            value={subject.code}
            onChange={(e) => onUpdate(subject.id, 'code', e.target.value)}
          />
          {subject.isDuplicateInSemester && (
            <span className="tooltip-warning" title="Duplicate Subject Code in this semester!">
              <AlertTriangle size={14} className="icon-warning" />
            </span>
          )}
        </div>
        {/* Reappearance Indicator Badge */}
        {subject.isReappearance && (
          <div className="reappearance-badge-container">
            {subject.gradePoint === 0 ? (
              <span className="badge badge-reappearance-failed" title="Automatic Detection: Subject code previously appeared in an earlier semester">
                <RefreshCw size={12} className="spin-icon-slow" /> Reappearance (Backlog)
              </span>
            ) : (
              <span className="badge badge-reappearance-cleared" title="Automatic Detection: Cleared reappearance of previous backlog">
                <CheckCircle2 size={12} /> Reappearance (Cleared)
              </span>
            )}
          </div>
        )}
      </td>

      {/* Subject Name */}
      <td className="cell-name">
        <input
          type="text"
          className="form-input"
          placeholder="e.g. Engineering Mathematics"
          value={subject.name}
          onChange={(e) => onUpdate(subject.id, 'name', e.target.value)}
        />
      </td>

      {/* Marks / 100 */}
      <td className="cell-marks">
        <input
          type="number"
          min="0"
          max="100"
          step="1"
          className={`form-input text-right ${isMarksInvalid ? 'input-error' : ''}`}
          placeholder="0-100"
          value={subject.marks}
          onChange={(e) => onUpdate(subject.id, 'marks', e.target.value)}
        />
        {isMarksInvalid && <span className="input-error-msg">0-100 only</span>}
      </td>

      {/* Credits */}
      <td className="cell-credits">
        <input
          type="number"
          min="0"
          step="1"
          className={`form-input text-right ${isCreditsInvalid ? 'input-error' : ''}`}
          placeholder="Credits"
          value={subject.credits}
          onChange={(e) => onUpdate(subject.id, 'credits', e.target.value)}
        />
        {isCreditsInvalid && <span className="input-error-msg">≥ 0 integer only</span>}
      </td>

      {/* Calculated Grade Point (Read-Only) */}
      <td className="cell-gp text-right font-semibold">
        {subject.gradePoint !== null ? (
          <span className={`gp-pill ${subject.gradePoint === 0 ? 'gp-zero' : 'gp-valid'}`}>
            {subject.gradePoint}
          </span>
        ) : (
          <span className="text-muted">—</span>
        )}
      </td>

      {/* Calculated Credit Points (Read-Only) */}
      <td className="cell-cp text-right font-semibold">
        {subject.creditPoints !== null ? (
          <span className="cp-val">{subject.creditPoints}</span>
        ) : (
          <span className="text-muted">—</span>
        )}
      </td>

      {/* Actions */}
      <td className="cell-actions text-center">
        <button
          className="btn-icon-danger"
          onClick={() => onDelete(subject.id)}
          title="Remove Subject"
          aria-label="Remove Subject"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
};
