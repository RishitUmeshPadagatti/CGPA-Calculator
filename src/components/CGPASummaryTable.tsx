import React from 'react';
import type { SemesterSummary } from '../types/calculator';
import { Info } from 'lucide-react';

interface CGPASummaryTableProps {
  summaries: SemesterSummary[];
  validSemesterCount: number;
}

export const CGPASummaryTable: React.FC<CGPASummaryTableProps> = ({ summaries, validSemesterCount }) => {
  return (
    <div className="card table-card">
      <div className="card-header">
        <h2>Semester SGPA & CGPA Summary</h2>
        {validSemesterCount < 2 && (
          <div className="notice-badge">
            <Info size={16} />
            <span>CGPA requires results from at least 2 semesters</span>
          </div>
        )}
      </div>

      <div className="table-responsive">
        <table className="summary-table">
          <thead>
            <tr>
              <th>Semester</th>
              <th className="text-right">Total Credits</th>
              <th className="text-right">SGPA</th>
              <th className="text-right">Cumulative CGPA</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((sem) => (
              <tr key={sem.semesterId} className={!sem.isValid ? 'row-inactive' : ''}>
                <td className="font-semibold">{sem.name}</td>
                <td className="text-right">{sem.isValid ? sem.totalCredits : '—'}</td>
                <td className="text-right">
                  {sem.sgpa !== null ? (
                    <span className="badge badge-sgpa">{sem.sgpa.toFixed(2)}</span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="text-right">
                  {sem.cumulativeCGPA !== null ? (
                    <span className="badge badge-cgpa">{sem.cumulativeCGPA.toFixed(2)}</span>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
