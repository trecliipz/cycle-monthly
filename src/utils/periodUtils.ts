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
const MANUAL_PERIOD_START_KEY = "period_tracker_manual_start";

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

// Set manual period start date
export function setManualPeriodStartDate(date: Date): void {
  localStorage.setItem(MANUAL_PERIOD_START_KEY, date.toISOString());
}

// Get manual period start date
export function getManualPeriodStartDate(): Date | null {
  const stored = localStorage.getItem(MANUAL_PERIOD_START_KEY);
  return stored ? new Date(stored) : null;
}

// Clear manual period start date
export function clearManualPeriodStartDate(): void {
  localStorage.removeItem(MANUAL_PERIOD_START_KEY);
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

// Get last period start date (prioritize manual setting over calculated)
export function getLastPeriodStartDate(): Date | null {
  // First check if there's a manually set start date
  const manualStart = getManualPeriodStartDate();
  if (manualStart) {
    return manualStart;
  }
  
  // Fall back to calculated start date from history
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

// Calculate ovulation window (usually 11-21 days after period start)
export function calculateOvulationWindow(): { start: Date, end: Date } | null {
  const lastStart = getLastPeriodStartDate();
  if (!lastStart) return null;
  
  const cycleLength = getCycleLength();
  
  // Ovulation typically happens 14 days before the next period starts
  // We'll create a window of +/- 5 days around that time
  const ovulationDay = addDays(lastStart, cycleLength - 14);
  const ovulationStart = addDays(ovulationDay, -2);
  const ovulationEnd = addDays(ovulationDay, 2);
  
  return {
    start: ovulationStart,
    end: ovulationEnd
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

// Check if a date is within the ovulation period
export function isDateInOvulationPeriod(date: Date): boolean {
  const ovulation = calculateOvulationWindow();
  if (!ovulation) return false;
  
  const checkDate = startOfDay(date);
  const start = startOfDay(ovulation.start);
  const end = startOfDay(ovulation.end);
  
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

// Check if today is a period day (predicted or actual)
export function isTodayPeriodDay(): boolean {
  const today = new Date();
  
  // Check if there's actual period data for today
  const todayData = getDataForDate(today);
  if (todayData && todayData.flow !== FlowIntensity.None) {
    return true;
  }
  
  // Check if today is in the predicted period
  return isDateInPredictedPeriod(today);
}

// Get current cycle day
export function getCurrentCycleDay(): number | null {
  const lastStart = getLastPeriodStartDate();
  if (!lastStart) return null;
  
  const today = new Date();
  const daysSinceLastPeriod = Math.floor((today.getTime() - lastStart.getTime()) / (1000 * 60 * 60 * 24));
  
  return daysSinceLastPeriod + 1; // Add 1 because day 1 is the first day of the period
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

// Recommended foods based on cycle phase
export function getFoodRecommendationsForPhase(date: Date = new Date()): string[] {
  const prediction = predictNextPeriod();
  const ovulation = calculateOvulationWindow();
  
  if (prediction && isDateInPredictedPeriod(date)) {
    return [
      "Iron-rich foods: leafy greens, red meat, beans",
      "Anti-inflammatory foods: berries, fatty fish",
      "Calcium-rich foods: yogurt, milk, cheese",
      "Magnesium-rich foods: dark chocolate, nuts, seeds",
      "Hydrating foods: water, herbal teas, fruits"
    ];
  } else if (ovulation && isDateInOvulationPeriod(date)) {
    return [
      "Zinc-rich foods: pumpkin seeds, oysters, beef",
      "Antioxidant-rich foods: colorful vegetables, fruits",
      "Light proteins: fish, chicken, tofu",
      "Healthy fats: avocado, olive oil, nuts",
      "Complex carbs: whole grains, sweet potatoes"
    ];
  } else {
    return [
      "B vitamin-rich foods: whole grains, eggs",
      "Hormone-balancing foods: seeds, nuts",
      "Fiber-rich foods: beans, lentils, fruits",
      "Probiotic foods: yogurt, kimchi, sauerkraut",
      "Lean proteins: chicken, fish, legumes"
    ];
  }
}

// Health tips based on cycle phase
export function getHealthTipsForPhase(date: Date = new Date()): string[] {
  const prediction = predictNextPeriod();
  const ovulation = calculateOvulationWindow();
  
  if (prediction && isDateInPredictedPeriod(date)) {
    return [
      "Rest more and minimize strenuous exercise",
      "Apply heat to lower abdomen for cramp relief",
      "Stay hydrated to minimize bloating",
      "Practice gentle yoga to ease discomfort",
      "Consider supplements like magnesium and iron"
    ];
  } else if (ovulation && isDateInOvulationPeriod(date)) {
    return [
      "This is a great time for high-intensity workouts",
      "Eat foods that support hormone production",
      "Your energy is typically highest now",
      "Focus on self-care and stress reduction",
      "Stay hydrated as body temperature rises slightly"
    ];
  } else {
    return [
      "Focus on rebuilding energy with balanced meals",
      "Moderate exercise like walking or swimming",
      "Start introducing more iron-rich foods",
      "Practice mindfulness to prepare for PMS symptoms",
      "Get adequate sleep to support hormone balance"
    ];
  }
}
