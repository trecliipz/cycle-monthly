
import { addDays, format, isSameDay, parse, startOfDay, subDays, differenceInDays } from "date-fns";

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

export interface CycleAnalytics {
  averageCycleLength: number;
  minCycleLength: number;
  maxCycleLength: number;
  isRegular: boolean;
  regularityScore: number;
  totalCycles: number;
  averagePeriodLength: number;
  predictionConfidence: number;
}

export interface PredictionData {
  nextPeriodStart: Date;
  nextPeriodEnd: Date;
  nextOvulation: Date;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
  daysUntilPeriod: number;
  daysUntilOvulation: number;
  confidence: 'low' | 'medium' | 'high';
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

// Validation constants
const MIN_CYCLE_LENGTH = 15;
const MAX_CYCLE_LENGTH = 45;
const REGULARITY_THRESHOLD = 3; // ±3 days for regular cycles

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

// Save period day with validation
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

// Get all period start dates from history
export function getPeriodStartDates(): Date[] {
  const history = getPeriodHistory();
  const periodStarts: Date[] = [];
  
  // Sort history by date ascending
  const sortedHistory = [...history].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  let inPeriod = false;
  
  for (const day of sortedHistory) {
    if (day.flow !== FlowIntensity.None) {
      if (!inPeriod) {
        // This is a new period start
        periodStarts.push(day.date);
        inPeriod = true;
      }
    } else {
      inPeriod = false;
    }
  }
  
  return periodStarts;
}

// Calculate cycle lengths between consecutive periods
export function getCycleLengths(): number[] {
  const periodStarts = getPeriodStartDates();
  if (periodStarts.length < 2) return [];
  
  const cycleLengths: number[] = [];
  
  for (let i = 1; i < periodStarts.length; i++) {
    const cycleLength = differenceInDays(periodStarts[i], periodStarts[i - 1]);
    
    // Filter out unrealistic cycles
    if (cycleLength >= MIN_CYCLE_LENGTH && cycleLength <= MAX_CYCLE_LENGTH) {
      cycleLengths.push(cycleLength);
    }
  }
  
  return cycleLengths;
}

// Enhanced cycle analytics
export function getCycleAnalytics(): CycleAnalytics {
  const cycleLengths = getCycleLengths();
  const periodStarts = getPeriodStartDates();
  
  if (cycleLengths.length === 0) {
    return {
      averageCycleLength: DEFAULT_CYCLE_LENGTH,
      minCycleLength: DEFAULT_CYCLE_LENGTH,
      maxCycleLength: DEFAULT_CYCLE_LENGTH,
      isRegular: false,
      regularityScore: 0,
      totalCycles: 0,
      averagePeriodLength: DEFAULT_PERIOD_LENGTH,
      predictionConfidence: 0
    };
  }
  
  const averageCycleLength = Math.round(cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length);
  const minCycleLength = Math.min(...cycleLengths);
  const maxCycleLength = Math.max(...cycleLengths);
  
  // Calculate regularity - cycles within ±3 days of average are considered regular
  const regularCycles = cycleLengths.filter(length => 
    Math.abs(length - averageCycleLength) <= REGULARITY_THRESHOLD
  ).length;
  
  const regularityScore = cycleLengths.length > 0 ? (regularCycles / cycleLengths.length) * 100 : 0;
  const isRegular = regularityScore >= 70; // 70% of cycles within threshold
  
  // Calculate prediction confidence based on data quality
  let predictionConfidence = 0;
  if (cycleLengths.length >= 3) {
    predictionConfidence = Math.min(100, (cycleLengths.length * 20) + (regularityScore * 0.5));
  }
  
  return {
    averageCycleLength,
    minCycleLength,
    maxCycleLength,
    isRegular,
    regularityScore: Math.round(regularityScore),
    totalCycles: cycleLengths.length,
    averagePeriodLength: calculateAveragePeriodLength(),
    predictionConfidence: Math.round(predictionConfidence)
  };
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

// Get cycle length (enhanced with analytics)
export function getCycleLength(): number {
  const analytics = getCycleAnalytics();
  return analytics.averageCycleLength;
}

// Set cycle length
export function setCycleLength(days: number): void {
  localStorage.setItem(CYCLE_LENGTH_KEY, days.toString());
}

// Get period length (enhanced)
export function getPeriodLength(): number {
  const analytics = getCycleAnalytics();
  return analytics.averagePeriodLength;
}

// Set period length
export function setPeriodLength(days: number): void {
  localStorage.setItem(PERIOD_LENGTH_KEY, days.toString());
}

// Get last period start date (enhanced)
export function getLastPeriodStartDate(): Date | null {
  // First check if there's a manually set start date
  const manualStart = getManualPeriodStartDate();
  if (manualStart) {
    return manualStart;
  }
  
  // Get from calculated period starts
  const periodStarts = getPeriodStartDates();
  return periodStarts.length > 0 ? periodStarts[periodStarts.length - 1] : null;
}

// Enhanced prediction with confidence levels
export function getEnhancedPrediction(): PredictionData | null {
  const lastStart = getLastPeriodStartDate();
  if (!lastStart) return null;
  
  const analytics = getCycleAnalytics();
  const cycleLength = analytics.averageCycleLength;
  const periodLength = analytics.averagePeriodLength;
  
  // Calculate next period
  const nextPeriodStart = addDays(lastStart, cycleLength);
  const nextPeriodEnd = addDays(nextPeriodStart, periodLength - 1);
  
  // Calculate ovulation (14 days before next period)
  const nextOvulation = addDays(nextPeriodStart, -14);
  
  // Calculate fertile window (5 days before ovulation + ovulation day)
  const fertileWindowStart = addDays(nextOvulation, -5);
  const fertileWindowEnd = nextOvulation;
  
  // Calculate days until events
  const today = new Date();
  const daysUntilPeriod = Math.max(0, differenceInDays(nextPeriodStart, today));
  const daysUntilOvulation = Math.max(0, differenceInDays(nextOvulation, today));
  
  // Determine confidence level
  let confidence: 'low' | 'medium' | 'high' = 'low';
  if (analytics.predictionConfidence >= 70) confidence = 'high';
  else if (analytics.predictionConfidence >= 40) confidence = 'medium';
  
  return {
    nextPeriodStart,
    nextPeriodEnd,
    nextOvulation,
    fertileWindowStart,
    fertileWindowEnd,
    daysUntilPeriod,
    daysUntilOvulation,
    confidence
  };
}

// Legacy function for backward compatibility
export function predictNextPeriod(): { start: Date, end: Date } | null {
  const prediction = getEnhancedPrediction();
  if (!prediction) return null;
  
  return {
    start: prediction.nextPeriodStart,
    end: prediction.nextPeriodEnd
  };
}

// Enhanced ovulation calculation
export function calculateOvulationWindow(): { start: Date, end: Date } | null {
  const prediction = getEnhancedPrediction();
  if (!prediction) return null;
  
  // Create a 5-day window around ovulation
  const ovulationStart = addDays(prediction.nextOvulation, -2);
  const ovulationEnd = addDays(prediction.nextOvulation, 2);
  
  return {
    start: ovulationStart,
    end: ovulationEnd
  };
}

// Enhanced fertile window calculation
export function calculateFertileWindow(): { start: Date, end: Date } | null {
  const prediction = getEnhancedPrediction();
  if (!prediction) return null;
  
  return {
    start: prediction.fertileWindowStart,
    end: prediction.fertileWindowEnd
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

// Check if a date is within the fertile window
export function isDateInFertileWindow(date: Date): boolean {
  const fertileWindow = calculateFertileWindow();
  if (!fertileWindow) return false;
  
  const checkDate = startOfDay(date);
  const start = startOfDay(fertileWindow.start);
  const end = startOfDay(fertileWindow.end);
  
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

// Enhanced period day detection
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

// Enhanced current cycle day calculation
export function getCurrentCycleDay(): number | null {
  const lastStart = getLastPeriodStartDate();
  if (!lastStart) return null;
  
  const today = new Date();
  const daysSinceLastPeriod = differenceInDays(today, lastStart);
  
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

// Calculate average period length from history (enhanced)
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
      const dayDifference = differenceInDays(day.date, lastDay.date);
      
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
  
  // Filter out unrealistic period lengths (1-10 days)
  const validPeriods = periods.filter(period => period.length >= 1 && period.length <= 10);
  
  if (validPeriods.length === 0) return DEFAULT_PERIOD_LENGTH;
  
  // Calculate average period length
  const totalLength = validPeriods.reduce((sum, period) => sum + period.length, 0);
  return Math.round(totalLength / validPeriods.length);
}

// Recommended foods based on cycle phase (enhanced)
export function getFoodRecommendationsForPhase(date: Date = new Date()): string[] {
  const prediction = getEnhancedPrediction();
  
  if (prediction && isDateInPredictedPeriod(date)) {
    return [
      "Iron-rich foods: leafy greens, red meat, beans",
      "Anti-inflammatory foods: berries, fatty fish",
      "Calcium-rich foods: yogurt, milk, cheese",
      "Magnesium-rich foods: dark chocolate, nuts, seeds",
      "Hydrating foods: water, herbal teas, fruits"
    ];
  } else if (prediction && isDateInOvulationPeriod(date)) {
    return [
      "Zinc-rich foods: pumpkin seeds, oysters, beef",
      "Antioxidant-rich foods: colorful vegetables, fruits",
      "Light proteins: fish, chicken, tofu",
      "Healthy fats: avocado, olive oil, nuts",
      "Complex carbs: whole grains, sweet potatoes"
    ];
  } else if (prediction && isDateInFertileWindow(date)) {
    return [
      "Folate-rich foods: spinach, asparagus, lentils",
      "Omega-3 fatty acids: salmon, walnuts, chia seeds",
      "Vitamin E: almonds, sunflower seeds",
      "Coenzyme Q10: organ meats, broccoli",
      "Whole grains: quinoa, brown rice, oats"
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

// Health tips based on cycle phase (enhanced)
export function getHealthTipsForPhase(date: Date = new Date()): string[] {
  const prediction = getEnhancedPrediction();
  
  if (prediction && isDateInPredictedPeriod(date)) {
    return [
      "Rest more and minimize strenuous exercise",
      "Apply heat to lower abdomen for cramp relief",
      "Stay hydrated to minimize bloating",
      "Practice gentle yoga to ease discomfort",
      "Consider supplements like magnesium and iron"
    ];
  } else if (prediction && isDateInOvulationPeriod(date)) {
    return [
      "This is a great time for high-intensity workouts",
      "Eat foods that support hormone production",
      "Your energy is typically highest now",
      "Focus on self-care and stress reduction",
      "Stay hydrated as body temperature rises slightly"
    ];
  } else if (prediction && isDateInFertileWindow(date)) {
    return [
      "Optimal time for conception if trying to conceive",
      "Maintain regular exercise routine",
      "Track basal body temperature for accuracy",
      "Reduce stress through meditation or gentle activities",
      "Ensure adequate sleep for hormone balance"
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
