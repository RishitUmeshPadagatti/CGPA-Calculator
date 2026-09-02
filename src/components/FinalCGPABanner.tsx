import React from 'react';
import { Award, CheckCircle, AlertCircle } from 'lucide-react';
import type { CGPAResult } from '../types/calculator';

interface FinalCGPABannerProps {
  cgpaResult: CGPAResult;
}

export const FinalCGPABanner: React.FC<FinalCGPABannerProps> = ({ cgpaResult }) => {
  const { cgpa, cumulativeCredits, cumulativeCreditPoints, validSemesterCount, message } = cgpaResult;

  return (
    <div className="final-cgpa-banner">
      <div className="banner-content">
        <div className="banner-badge">
          <Award size={36} />
        </div>
        <div className="banner-text">
          <span className="banner-label">FINAL CGPA</span>
          <h2 className="banner-value">
            {cgpa !== null ? cgpa.toFixed(2) : 'N/A'}
          </h2>
          <p className="banner-subtext">
            {cgpa !== null ? (
              <>
                <CheckCircle size={16} className="inline-icon text-success" /> Computed from {validSemesterCount} active semesters ({cumulativeCredits} cumulative credits, {cumulativeCreditPoints} credit points)
              </>
            ) : (
              <>
                <AlertCircle size={16} className="inline-icon text-warning" /> {message || 'Minimum 2 valid semesters required for CGPA'}
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
