import React from 'react';
import { Award, BookOpen, Layers, AlertCircle } from 'lucide-react';
import type { CGPAResult } from '../types/calculator';

import { formatGrade } from '../utils/format';

interface SummaryCardsProps {
  cgpaResult: CGPAResult;
  activeBacklogs: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ cgpaResult, activeBacklogs }) => {
  const { cgpa, validSemesterCount, cumulativeCredits, message } = cgpaResult;

  return (
    <div className="summary-cards-grid">
      <div className="card summary-card primary-gradient">
        <div className="card-header-icon">
          <Award size={24} />
        </div>
        <div className="card-content">
          <span className="card-label">Cumulative CGPA</span>
          <div className="card-value">
            {cgpa !== null ? formatGrade(cgpa) : '—'}
          </div>
          <span className="card-subtext">
            {cgpa !== null
              ? 'Based on latest applicable subject attempts'
              : message || 'Requires at least 2 valid semesters'}
          </span>
        </div>
      </div>

      <div className="card summary-card">
        <div className="card-header-icon secondary">
          <Layers size={24} />
        </div>
        <div className="card-content">
          <span className="card-label">Semesters Completed</span>
          <div className="card-value">{validSemesterCount} / 8</div>
          <span className="card-subtext">Semesters with valid entered data</span>
        </div>
      </div>

      <div className="card summary-card">
        <div className="card-header-icon accent">
          <BookOpen size={24} />
        </div>
        <div className="card-content">
          <span className="card-label">Total Earned Credits</span>
          <div className="card-value">{cumulativeCredits}</div>
          <span className="card-subtext">Unique credits counted towards CGPA</span>
        </div>
      </div>

      <div className={`card summary-card ${activeBacklogs > 0 ? 'warning-border' : ''}`}>
        <div className={`card-header-icon ${activeBacklogs > 0 ? 'warning' : 'success'}`}>
          <AlertCircle size={24} />
        </div>
        <div className="card-content">
          <span className="card-label">Active Backlogs</span>
          <div className="card-value">
            {activeBacklogs}
          </div>
          <span className="card-subtext">
            {activeBacklogs === 0
              ? 'All attempted subjects cleared'
              : `${activeBacklogs} subject(s) currently awaiting clearance`}
          </span>
        </div>
      </div>
    </div>
  );
};
