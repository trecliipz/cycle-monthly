
import { addDays, format, isSameDay, parse, startOfDay, subDays } from "date-fns";

// Types for our period tracker
export interface PeriodDay {
  date: Date;
  symptoms: PeriodSymptoms;
  flow: FlowIntensity;
}

export interface PeriodSymptoms {
  cramps: SymptomIntensity;
  headache: SymptomIntensity;
  mood: Mood;
  notes: string;
}

export enum SymptomIntensity {
  None = "none",
  Mild = "mild",
  Moderate = "moderate",
  Severe = "severe",
}

export enum FlowIntensity {
  None = "none",
  Light = "light",
  Medium = "medium",
  Heavy = "heavy",
}

export enum Mood {
  Neutral = "neutral",
  Happy = "happy",
  Sad = "sad",
  Irritable = "irritable",
  Anxious = "anxious",
  Tired = "tired",
}

// Local storage keys
const PERIOD_HISTORY_KEY = "period_tracker_history";
const CYCLE_LENGTH_KEY = "period_tracker_cycle_length";
const PERIOD_LENGTH_KEY = "period_tracker_period_length";

// Default values
const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_PERIOD_LENGTH = 5;

// Get stored period days
export function getPeriodHistory(): PeriodDay[] {
  const storedData = localStorage.getItem(PERIOD_HISTORY_KEY);
  if (!storedData) return [];
  
  try {
    // Parse dates back to Date objects when retrieving from localStorage
    const parsed = JSON.parse(storedData);
    return parsed.map((day: any) => ({
      ...day,
      date: new Date(day.date),
    }));
  } catch (error) {
    console.error("Error parsing period history:", error);
    return [];
  }
}

// Save period day
export function savePeriodDay(periodDay: PeriodDay): void {
  const history = getPeriodHistory();
  
  // Check if we already have an entry for this date
  const existingIndex = history.findIndex(day => 
    isSameDay(new Date(day.date), new Date(periodDay.date))
  );
  
  if (existingIndex >= 0) {
    // Update existing entry
    history[existingIndex] = periodDay;
  } else {
    // Add new entry
    history.push(periodDay);
  }
  
  // Sort by date before saving
  history.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  localStorage.setItem(PERIOD_HISTORY_KEY, JSON.stringify(history));
}

// Get cycle length (avg or default)
export function getCycleLength(): number {
  const stored = localStorage.getItem(CYCLE_LENGTH_KEY);
  return stored ? parseInt(stored, 10) : DEFAULT_CYCLE_LENGTH;
}

// Set cycle length
export function setCycleLength(days: number): void {
  localStorage.setItem(CYCLE_LENGTH_KEY, days.toString());
}

// Get period length (avg or default)
export function getPeriodLength(): number {
  const stored = localStorage.getItem(PERIOD_LENGTH_KEY);
  return stored ? parseInt(stored, 10) : DEFAULT_PERIOD_LENGTH;
}

// Set period length
export function setPeriodLength(days: number): void {
  localStorage.setItem(PERIOD_LENGTH_KEY, days.toString());
}

// Get last period start date
export function getLastPeriodStartDate(): Date | null {
  const history = getPeriodHistory();
  if (history.length === 0) return null;
  
  // Sort by date descending to find the most recent period
  const periodDaysWithFlow = history
    .filter(day => day.flow !== FlowIntensity.None)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
  
  if (periodDaysWithFlow.length === 0) return null;
  
  // Get the most recent period start date
  // We need to find the first day of the most recent period
  const mostRecentDay = periodDaysWithFlow[0];
  let consecutiveDays = [mostRecentDay];
  
  // Go backwards from most recent day to find consecutive period days
  for (let i = 1; i < periodDaysWithFlow.length; i++) {
    const currentDay = periodDaysWithFlow[i];
    const previousDay = consecutiveDays[consecutiveDays.length - 1];
    
    // Check if this day is consecutive to our period
    const dayDifference = (previousDay.date.getTime() - currentDay.date.getTime()) / (1000 * 60 * 60 * 24);
    
    if (dayDifference === 1) {
      consecutiveDays.push(currentDay);
    } else {
      break;
    }
  }
  
  // The start date is the last item in our consecutiveDays array (oldest date)
  return consecutiveDays[consecutiveDays.length - 1].date;
}

// Predict next period
export function predictNextPeriod(): { start: Date, end: Date } | null {
  const lastStart = getLastPeriodStartDate();
  if (!lastStart) return null;
  
  const cycleLength = getCycleLength();
  const periodLength = getPeriodLength();
  
  const nextStart = addDays(lastStart, cycleLength);
  const nextEnd = addDays(nextStart, periodLength - 1);
  
  return {
    start: nextStart,
    end: nextEnd
  };
}

// Check if a date is within a predicted period
export function isDateInPredictedPeriod(date: Date): boolean {
  const prediction = predictNextPeriod();
  if (!prediction) return false;
  
  const checkDate = startOfDay(date);
  const start = startOfDay(prediction.start);
  const end = startOfDay(prediction.end);
  
  return checkDate >= start && checkDate <= end;
}

// Check if a date has period data
export function hasDataForDate(date: Date): boolean {
  const history = getPeriodHistory();
  return history.some(day => isSameDay(new Date(day.date), date));
}

// Get data for a specific date
export function getDataForDate(date: Date): PeriodDay | null {
  const history = getPeriodHistory();
  const found = history.find(day => isSameDay(new Date(day.date), date));
  return found || null;
}

// Format date to display in the app
export function formatDateForDisplay(date: Date): string {
  return format(date, "MMMM d, yyyy");
}

// Get a default period day
export function getDefaultPeriodDay(date: Date): PeriodDay {
  return {
    date,
    symptoms: {
      cramps: SymptomIntensity.None,
      headache: SymptomIntensity.None,
      mood: Mood.Neutral,
      notes: "",
    },
    flow: FlowIntensity.None,
  };
}

// Calculate average cycle length from history
export function calculateAverageCycleLength(): number {
  const history = getPeriodHistory();
  if (history.length < 2) return DEFAULT_CYCLE_LENGTH;
  
  // Find all period start dates
  const periodStarts: Date[] = [];
  let currentPeriodDays: PeriodDay[] = [];
  
  // Sort history by date ascending
  const sortedHistory = [...history].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  for (let i = 0; i < sortedHistory.length; i++) {
    const day = sortedHistory[i];
    
    if (day.flow !== FlowIntensity.None) {
      if (currentPeriodDays.length === 0) {
        // This is a new period start
        periodStarts.push(day.date);
      }
      currentPeriodDays.push(day);
    } else if (currentPeriodDays.length > 0) {
      // End of a period
      currentPeriodDays = [];
    }
  }
  
  if (periodStarts.length < 2) return DEFAULT_CYCLE_LENGTH;
  
  // Calculate differences between consecutive period starts
  let totalDays = 0;
  for (let i = 1; i < periodStarts.length; i++) {
    const diff = (periodStarts[i].getTime() - periodStarts[i-1].getTime()) / (1000 * 60 * 60 * 24);
    totalDays += diff;
  }
  
  return Math.round(totalDays / (periodStarts.length - 1));
}

// Calculate average period length from history
export function calculateAveragePeriodLength(): number {
  const history = getPeriodHistory();
  if (history.length === 0) return DEFAULT_PERIOD_LENGTH;
  
  // Group consecutive period days
  const periods: PeriodDay[][] = [];
  let currentPeriod: PeriodDay[] = [];
  
  // Sort history by date ascending
  const sortedHistory = [...history]
    .filter(day => day.flow !== FlowIntensity.None)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  
  for (let i = 0; i < sortedHistory.length; i++) {
    const day = sortedHistory[i];
    
    if (currentPeriod.length === 0) {
      currentPeriod.push(day);
    } else {
      const lastDay = currentPeriod[currentPeriod.length - 1];
      const dayDifference = (day.date.getTime() - lastDay.date.getTime()) / (1000 * 60 * 60 * 24);
      
      if (dayDifference === 1) {
        // Consecutive day
        currentPeriod.push(day);
      } else {
        // New period
        periods.push(currentPeriod);
        currentPeriod = [day];
      }
    }
  }
  
  if (currentPeriod.length > 0) {
    periods.push(currentPeriod);
  }
  
  if (periods.length === 0) return DEFAULT_PERIOD_LENGTH;
  
  // Calculate average period length
  const totalLength = periods.reduce((sum, period) => sum + period.length, 0);
  return Math.round(totalLength / periods.length);
}
