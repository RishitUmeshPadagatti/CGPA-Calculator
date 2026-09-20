import React, { useState } from 'react';
import { Target, Plus, Trash2, Calculator } from 'lucide-react';
import type { CGPAResult } from '../types/calculator';
import { formatGrade } from '../utils/format';

interface CGPAEstimatorProps {
  cgpaResult: CGPAResult;
}

interface EstimatedSemester {
  id: string;
  name: string;
  credits: string;
  sgpa: string;
}

export const CGPAEstimator: React.FC<CGPAEstimatorProps> = ({ cgpaResult }) => {
  const [estimatedSemesters, setEstimatedSemesters] = useState<EstimatedSemester[]>([]);

  const handleAddSemester = () => {
    const nextSemNumber = cgpaResult.validSemesterCount + estimatedSemesters.length + 1;
    setEstimatedSemesters([
      ...estimatedSemesters,
      {
        id: Math.random().toString(36).substr(2, 9),
        name: `Semester ${nextSemNumber}`,
        credits: '20',
        sgpa: '8.5'
      }
    ]);
  };

  const handleRemoveSemester = (id: string) => {
    setEstimatedSemesters(estimatedSemesters.filter(sem => sem.id !== id));
  };

  const handleUpdateSemester = (id: string, field: 'credits' | 'sgpa', value: string) => {
    setEstimatedSemesters(estimatedSemesters.map(sem => 
      sem.id === id ? { ...sem, [field]: value } : sem
    ));
  };

  // Calculate estimated CGPA
  let totalCredits = cgpaResult.cumulativeCredits;
  let totalCreditPoints = cgpaResult.cumulativeCreditPoints;

  estimatedSemesters.forEach(sem => {
    const credits = parseFloat(sem.credits) || 0;
    const sgpa = parseFloat(sem.sgpa) || 0;
    if (credits > 0 && sgpa > 0) {
      totalCredits += credits;
      totalCreditPoints += (credits * sgpa);
    }
  });

  const estimatedCGPA = totalCredits > 0 ? formatGrade(totalCreditPoints / totalCredits) : null;
  const isEstimating = estimatedSemesters.length > 0;

  return (
    <section className="estimator-section" style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
      <div className="section-header" style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0 }}>
            <Target className="text-info" size={24} style={{ color: 'var(--color-info)' }} /> CGPA Estimator
          </h2>
          <p className="text-secondary" style={{ fontSize: '0.9rem', margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>
            Add future semesters to estimate your overall CGPA at the end of college.
          </p>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={handleAddSemester} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.5rem 1rem',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            transition: 'var(--transition-fast)'
          }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
        >
          <Plus size={16} /> Add Semester
        </button>
      </div>

      {estimatedSemesters.length > 0 && (
        <div className="estimator-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          {estimatedSemesters.map((sem) => (
            <div key={sem.id} style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
              gap: '1rem', 
              alignItems: 'center', 
              background: 'var(--bg-input)', 
              padding: '1rem', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border-color)' 
            }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', gridColumn: '1 / -1', marginBottom: '-0.5rem', '@media (min-width: 640px)': { gridColumn: 'auto', marginBottom: 0 } } as React.CSSProperties}>{sem.name}</div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Credits</label>
                <input 
                  type="number" 
                  value={sem.credits} 
                  onChange={(e) => handleUpdateSemester(sem.id, 'credits', e.target.value)} 
                  min="1" 
                  max="30"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Expected SGPA</label>
                <input 
                  type="number" 
                  value={sem.sgpa} 
                  onChange={(e) => handleUpdateSemester(sem.id, 'sgpa', e.target.value)} 
                  step="0.01" 
                  min="0" 
                  max="10"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                />
              </div>
              <div style={{ alignSelf: 'flex-end' }}>
                <button 
                  onClick={() => handleRemoveSemester(sem.id)}
                  title="Remove Semester"
                  style={{ 
                    background: 'rgba(244, 63, 94, 0.1)', 
                    border: '1px solid rgba(244, 63, 94, 0.2)', 
                    color: 'var(--color-danger)', 
                    cursor: 'pointer', 
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    transition: 'var(--transition-fast)'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(244, 63, 94, 0.2)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)'; }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isEstimating && (
        <div style={{ 
          background: 'var(--accent-gradient)', 
          padding: '1.5rem', 
          borderRadius: 'var(--radius-md)', 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'space-between', 
          alignItems: 'center', 
          color: '#fff',
          boxShadow: 'var(--accent-glow)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Calculator size={36} style={{ opacity: 0.9 }} />
            <div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimated Final CGPA</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1 }}>{estimatedCGPA}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.95rem', opacity: 0.9 }}>
            Total Credits: <strong>{totalCredits}</strong> <br />
            Target Points: <strong>{totalCreditPoints.toFixed(2)}</strong>
          </div>
        </div>
      )}
    </section>
  );
};
