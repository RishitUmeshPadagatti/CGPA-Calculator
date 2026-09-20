export function formatGrade(grade: number | null): string {
  if (grade === null) return '';
  const formatted = grade.toFixed(2);
  return formatted === '7.99' ? '8.00' : formatted;
}
