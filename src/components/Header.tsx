import React, { useRef } from 'react';
import { Download, Upload, Calculator } from 'lucide-react';

interface HeaderProps {
  onExport: () => void;
  onImportClick: (file: File) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onExport,
  onImportClick,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportClick(file);
      // Reset input value so re-importing same file works
      e.target.value = '';
    }
  };

  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="logo-badge">
          <Calculator size={28} />
        </div>
        <div>
          <h1>VTU SGPA & CGPA Calculator</h1>
          <p className="header-subtitle">
            Automated VTU Grade Point calculation with intelligent backlog & reappearance handling.
          </p>
        </div>
      </div>

      <div className="header-actions">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json,application/json"
          style={{ display: 'none' }}
        />

        <button className="btn btn-secondary" onClick={onExport} title="Export data to JSON file">
          <Download size={16} />
          <span>Export JSON</span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => fileInputRef.current?.click()}
          title="Import data from JSON file"
        >
          <Upload size={16} />
          <span>Import JSON</span>
        </button>
      </div>
    </header>
  );
};
