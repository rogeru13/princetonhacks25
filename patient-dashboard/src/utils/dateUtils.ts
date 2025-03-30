export function getNextCheckupDate(patientId: string): Date {
  // For now, we'll use a fixed date 3 days from now
  // In a real app, this would come from the database
  const nextCheckup = new Date();
  nextCheckup.setDate(nextCheckup.getDate() + 3);
  return nextCheckup;
}

export function formatCheckupDate(date: Date): string {
  // Calculate days until checkup
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Tomorrow";
  } else {
    return `${diffDays} days`;
  }
} 