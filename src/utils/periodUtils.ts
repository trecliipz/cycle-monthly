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
  cycleTrend: 'stable' | 'increasing' | 'decreasing';
  symptomPatterns: SymptomPattern[];
  healthScore: number;
}

export interface SymptomPattern {
  phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  commonSymptoms: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface AdvancedPredictionData {
  nextPeriodStart: Date;
  nextPeriodEnd: Date;
  nextOvulation: Date;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
  daysUntilPeriod: number;
  daysUntilOvulation: number;
  confidence: 'low' | 'medium' | 'high';
  pmsWindow: { start: Date; end: Date };
  cyclePhase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  recommendedActions: string[];
  riskFactors: string[];
}

// Multi-month prediction interface
export interface MultiMonthPrediction {
  month: number; // 1 for next month, 2 for month after
  nextPeriodStart: Date;
  nextPeriodEnd: Date;
  nextOvulation: Date;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
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

// Enhanced cycle analytics with advanced pattern recognition
export function getAdvancedCycleAnalytics(): CycleAnalytics {
  const cycleLengths = getCycleLengths();
  const periodStarts = getPeriodStartDates();
  const history = getPeriodHistory();
  
  if (cycleLengths.length === 0) {
    return {
      averageCycleLength: DEFAULT_CYCLE_LENGTH,
      minCycleLength: DEFAULT_CYCLE_LENGTH,
      maxCycleLength: DEFAULT_CYCLE_LENGTH,
      isRegular: false,
      regularityScore: 0,
      totalCycles: 0,
      averagePeriodLength: DEFAULT_PERIOD_LENGTH,
      predictionConfidence: 0,
      cycleTrend: 'stable',
      symptomPatterns: [],
      healthScore: 0
    };
  }
  
  const averageCycleLength = Math.round(cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length);
  const minCycleLength = Math.min(...cycleLengths);
  const maxCycleLength = Math.max(...cycleLengths);
  
  // Calculate cycle trend
  const cycleTrend = calculateCycleTrend(cycleLengths);
  
  // Calculate regularity
  const regularCycles = cycleLengths.filter(length => 
    Math.abs(length - averageCycleLength) <= REGULARITY_THRESHOLD
  ).length;
  
  const regularityScore = cycleLengths.length > 0 ? (regularCycles / cycleLengths.length) * 100 : 0;
  const isRegular = regularityScore >= 70;
  
  // Calculate prediction confidence
  let predictionConfidence = 0;
  if (cycleLengths.length >= 3) {
    predictionConfidence = Math.min(100, (cycleLengths.length * 15) + (regularityScore * 0.6) + (history.length * 2));
  }
  
  // Analyze symptom patterns
  const symptomPatterns = analyzeSymptomPatterns(history, periodStarts);
  
  // Calculate health score
  const healthScore = calculateHealthScore(history, cycleLengths);
  
  return {
    averageCycleLength,
    minCycleLength,
    maxCycleLength,
    isRegular,
    regularityScore: Math.round(regularityScore),
    totalCycles: cycleLengths.length,
    averagePeriodLength: calculateAveragePeriodLength(),
    predictionConfidence: Math.round(predictionConfidence),
    cycleTrend,
    symptomPatterns,
    healthScore
  };
}

// Calculate cycle trend
function calculateCycleTrend(cycleLengths: number[]): 'stable' | 'increasing' | 'decreasing' {
  if (cycleLengths.length < 3) return 'stable';
  
  const recent = cycleLengths.slice(-3);
  const earlier = cycleLengths.slice(-6, -3);
  
  if (earlier.length === 0) return 'stable';
  
  const recentAvg = recent.reduce((sum, length) => sum + length, 0) / recent.length;
  const earlierAvg = earlier.reduce((sum, length) => sum + length, 0) / earlier.length;
  
  const difference = recentAvg - earlierAvg;
  
  if (Math.abs(difference) < 1) return 'stable';
  return difference > 0 ? 'increasing' : 'decreasing';
}

// Analyze symptom patterns across cycle phases
function analyzeSymptomPatterns(history: PeriodDay[], periodStarts: Date[]): SymptomPattern[] {
  const patterns: SymptomPattern[] = [];
  
  // Group symptoms by cycle phase
  const phaseSymptoms = {
    menstrual: [] as string[],
    follicular: [] as string[],
    ovulation: [] as string[],
    luteal: [] as string[]
  };
  
  history.forEach(day => {
    const phase = getCyclePhaseForDate(day.date, periodStarts);
    if (phase) {
      if (day.symptoms.cramps !== SymptomIntensity.None) {
        phaseSymptoms[phase].push('cramps');
      }
      if (day.symptoms.headache !== SymptomIntensity.None) {
        phaseSymptoms[phase].push('headache');
      }
      if (day.symptoms.mood !== Mood.Neutral) {
        phaseSymptoms[phase].push(`mood: ${day.symptoms.mood}`);
      }
    }
  });
  
  // Create patterns for each phase
  Object.entries(phaseSymptoms).forEach(([phase, symptoms]) => {
    if (symptoms.length > 0) {
      const uniqueSymptoms = [...new Set(symptoms)];
      const severity = symptoms.length > 10 ? 'high' : symptoms.length > 5 ? 'medium' : 'low';
      
      patterns.push({
        phase: phase as 'menstrual' | 'follicular' | 'ovulation' | 'luteal',
        commonSymptoms: uniqueSymptoms.slice(0, 5),
        severity
      });
    }
  });
  
  return patterns;
}

// Calculate overall health score based on logged data
function calculateHealthScore(history: PeriodDay[], cycleLengths: number[]): number {
  let score = 100;
  
  // Deduct points for irregular cycles
  if (cycleLengths.length > 0) {
    const variance = calculateVariance(cycleLengths);
    score -= Math.min(variance * 2, 20);
  }
  
  // Deduct points for severe symptoms
  const severeSymptomDays = history.filter(day => 
    day.symptoms.cramps === SymptomIntensity.Severe ||
    day.symptoms.headache === SymptomIntensity.Severe
  ).length;
  
  const symptomPercentage = history.length > 0 ? (severeSymptomDays / history.length) * 100 : 0;
  score -= Math.min(symptomPercentage, 30);
  
  return Math.max(0, Math.round(score));
}

// Get cycle phase for a specific date
function getCyclePhaseForDate(date: Date, periodStarts: Date[]): 'menstrual' | 'follicular' | 'ovulation' | 'luteal' | null {
  if (periodStarts.length === 0) return null;
  
  // Find the most recent period start before or on this date
  const relevantStart = periodStarts
    .filter(start => start <= date)
    .sort((a, b) => b.getTime() - a.getTime())[0];
  
  if (!relevantStart) return null;
  
  const daysSinceStart = differenceInDays(date, relevantStart);
  const periodLength = getPeriodLength();
  
  if (daysSinceStart < periodLength) return 'menstrual';
  if (daysSinceStart < 14) return 'follicular';
  if (daysSinceStart >= 14 && daysSinceStart <= 16) return 'ovulation';
  return 'luteal';
}

// Calculate variance for cycle regularity
function calculateVariance(numbers: number[]): number {
  const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
  return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
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

// Get cycle length (enhanced with priority: Manual Settings → Analytics → Defaults)
export function getCycleLength(): number {
  // First priority: Check for manually saved cycle length
  const stored = localStorage.getItem(CYCLE_LENGTH_KEY);
  if (stored) {
    const value = parseInt(stored, 10);
    if (!isNaN(value) && value >= 20 && value <= 40) {
      return value;
    }
  }
  
  // Second priority: Use analytics if available
  const analytics = getAdvancedCycleAnalytics();
  if (analytics.totalCycles > 0) {
    return analytics.averageCycleLength;
  }
  
  // Third priority: Default value
  return DEFAULT_CYCLE_LENGTH;
}

// Set cycle length
export function setCycleLength(days: number): void {
  if (days >= 20 && days <= 40) {
    localStorage.setItem(CYCLE_LENGTH_KEY, days.toString());
  }
}

// Get period length (enhanced with priority: Manual Settings → Analytics → Defaults)
export function getPeriodLength(): number {
  // First priority: Check for manually saved period length
  const stored = localStorage.getItem(PERIOD_LENGTH_KEY);
  if (stored) {
    const value = parseInt(stored, 10);
    if (!isNaN(value) && value >= 1 && value <= 14) {
      return value;
    }
  }
  
  // Second priority: Use analytics if available
  const analytics = getAdvancedCycleAnalytics();
  if (analytics.totalCycles > 0) {
    return analytics.averagePeriodLength;
  }
  
  // Third priority: Default value
  return DEFAULT_PERIOD_LENGTH;
}

// Set period length
export function setPeriodLength(days: number): void {
  if (days >= 1 && days <= 14) {
    localStorage.setItem(PERIOD_LENGTH_KEY, days.toString());
  }
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

// Enhanced prediction with advanced analytics
export function getAdvancedPrediction(): AdvancedPredictionData | null {
  const lastStart = getLastPeriodStartDate();
  if (!lastStart) return null;
  
  const analytics = getAdvancedCycleAnalytics();
  const cycleLength = getCycleLength();
  const periodLength = getPeriodLength();
  
  // Calculate next period with confidence adjustments
  let adjustedCycleLength = cycleLength;
  if (analytics.cycleTrend === 'increasing') {
    adjustedCycleLength += 1;
  } else if (analytics.cycleTrend === 'decreasing') {
    adjustedCycleLength -= 1;
  }
  
  const nextPeriodStart = addDays(lastStart, adjustedCycleLength);
  const nextPeriodEnd = addDays(nextPeriodStart, periodLength - 1);
  
  // Calculate ovulation (14 days before next period)
  const nextOvulation = addDays(nextPeriodStart, -14);
  
  // Calculate fertile window (5 days before ovulation + ovulation day)
  const fertileWindowStart = addDays(nextOvulation, -5);
  const fertileWindowEnd = nextOvulation;
  
  // Calculate PMS window (5-10 days before period)
  const pmsWindow = {
    start: addDays(nextPeriodStart, -10),
    end: addDays(nextPeriodStart, -5)
  };
  
  // Calculate days until events
  const today = new Date();
  const daysUntilPeriod = Math.max(0, differenceInDays(nextPeriodStart, today));
  const daysUntilOvulation = Math.max(0, differenceInDays(nextOvulation, today));
  
  // Determine confidence level
  let confidence: 'low' | 'medium' | 'high' = 'low';
  if (analytics.predictionConfidence >= 75) confidence = 'high';
  else if (analytics.predictionConfidence >= 50) confidence = 'medium';
  
  // Determine current cycle phase
  const cyclePhase = getCyclePhaseForDate(today, getPeriodStartDates()) || 'follicular';
  
  // Generate recommendations
  const recommendedActions = generateRecommendations(cyclePhase, analytics);
  
  // Identify risk factors
  const riskFactors = identifyRiskFactors(analytics);
  
  return {
    nextPeriodStart,
    nextPeriodEnd,
    nextOvulation,
    fertileWindowStart,
    fertileWindowEnd,
    daysUntilPeriod,
    daysUntilOvulation,
    confidence,
    pmsWindow,
    cyclePhase,
    recommendedActions,
    riskFactors
  };
}

// Get predictions for the next 2-3 months
export function getMultiMonthPredictions(): MultiMonthPrediction[] {
  const lastStart = getLastPeriodStartDate();
  if (!lastStart) return [];
  
  const analytics = getAdvancedCycleAnalytics();
  const cycleLength = getCycleLength();
  const periodLength = getPeriodLength();
  
  const predictions: MultiMonthPrediction[] = [];
  
  // Calculate predictions for next 3 cycles
  for (let month = 1; month <= 3; month++) {
    // Apply trend adjustments
    let adjustedCycleLength = cycleLength;
    if (analytics.cycleTrend === 'increasing') {
      adjustedCycleLength += Math.floor(month / 2);
    } else if (analytics.cycleTrend === 'decreasing') {
      adjustedCycleLength -= Math.floor(month / 2);
    }
    
    // Calculate cycle start date
    const cycleStart = addDays(lastStart, adjustedCycleLength * month);
    const cycleEnd = addDays(cycleStart, periodLength - 1);
    
    // Calculate ovulation (14 days before period)
    const ovulation = addDays(cycleStart, -14);
    
    // Calculate fertile window (5 days before ovulation + ovulation day)
    const fertileStart = addDays(ovulation, -5);
    const fertileEnd = ovulation;
    
    // Calculate confidence (decreases with distance)
    let baseConfidence = analytics.predictionConfidence;
    let confidence: 'low' | 'medium' | 'high' = 'low';
    
    // Reduce confidence for future months
    const adjustedConfidence = baseConfidence - (month - 1) * 20;
    
    if (adjustedConfidence >= 75) confidence = 'high';
    else if (adjustedConfidence >= 50) confidence = 'medium';
    
    predictions.push({
      month,
      nextPeriodStart: cycleStart,
      nextPeriodEnd: cycleEnd,
      nextOvulation: ovulation,
      fertileWindowStart: fertileStart,
      fertileWindowEnd: fertileEnd,
      confidence
    });
  }
  
  return predictions;
}

// Generate personalized recommendations
function generateRecommendations(phase: string, analytics: CycleAnalytics): string[] {
  const recommendations: string[] = [];
  
  switch (phase) {
    case 'menstrual':
      recommendations.push("Rest and stay hydrated");
      recommendations.push("Use heat therapy for cramps");
      if (analytics.healthScore < 70) {
        recommendations.push("Consider iron-rich foods");
      }
      break;
    case 'follicular':
      recommendations.push("Good time for new projects");
      recommendations.push("Increase protein intake");
      break;
    case 'ovulation':
      recommendations.push("Peak fertility window");
      recommendations.push("Stay active with high-energy workouts");
      break;
    case 'luteal':
      recommendations.push("Practice stress management");
      if (analytics.symptomPatterns.some(p => p.phase === 'luteal' && p.severity === 'high')) {
        recommendations.push("Monitor PMS symptoms");
      }
      break;
  }
  
  return recommendations.slice(0, 3);
}

// Identify potential risk factors
function identifyRiskFactors(analytics: CycleAnalytics): string[] {
  const risks: string[] = [];
  
  if (!analytics.isRegular) {
    risks.push("Irregular cycles detected");
  }
  
  if (analytics.healthScore < 60) {
    risks.push("Frequent severe symptoms");
  }
  
  if (analytics.cycleTrend !== 'stable') {
    risks.push(`Cycle length ${analytics.cycleTrend}`);
  }
  
  return risks;
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

// Enhanced period detection functions
export function isDateInPredictedPeriod(date: Date): boolean {
  const predictions = getMultiMonthPredictions();
  
  for (const prediction of predictions) {
    const checkDate = startOfDay(date);
    const start = startOfDay(prediction.nextPeriodStart);
    const end = startOfDay(prediction.nextPeriodEnd);
    
    if (checkDate >= start && checkDate <= end) {
      return true;
    }
  }
  
  return false;
}

// Check if date is in second month prediction
export function isDateInSecondMonthPrediction(date: Date): boolean {
  const predictions = getMultiMonthPredictions();
  const secondMonth = predictions.find(p => p.month === 2);
  
  if (!secondMonth) return false;
  
  const checkDate = startOfDay(date);
  const start = startOfDay(secondMonth.nextPeriodStart);
  const end = startOfDay(secondMonth.nextPeriodEnd);
  
  return checkDate >= start && checkDate <= end;
}

// Check if date is in third month prediction
export function isDateInThirdMonthPrediction(date: Date): boolean {
  const predictions = getMultiMonthPredictions();
  const thirdMonth = predictions.find(p => p.month === 3);
  
  if (!thirdMonth) return false;
  
  const checkDate = startOfDay(date);
  const start = startOfDay(thirdMonth.nextPeriodStart);
  const end = startOfDay(thirdMonth.nextPeriodEnd);
  
  return checkDate >= start && checkDate <= end;
}

export function isDateInOvulationPeriod(date: Date): boolean {
  const predictions = getMultiMonthPredictions();
  
  for (const prediction of predictions) {
    // Create a 5-day window around ovulation
    const ovulationStart = addDays(prediction.nextOvulation, -2);
    const ovulationEnd = addDays(prediction.nextOvulation, 2);
    
    const checkDate = startOfDay(date);
    const start = startOfDay(ovulationStart);
    const end = startOfDay(ovulationEnd);
    
    if (checkDate >= start && checkDate <= end) {
      return true;
    }
  }
  
  return false;
}

// Check if date is in second month ovulation
export function isDateInSecondMonthOvulation(date: Date): boolean {
  const predictions = getMultiMonthPredictions();
  const secondMonth = predictions.find(p => p.month === 2);
  
  if (!secondMonth) return false;
  
  const ovulationStart = addDays(secondMonth.nextOvulation, -2);
  const ovulationEnd = addDays(secondMonth.nextOvulation, 2);
  
  const checkDate = startOfDay(date);
  const start = startOfDay(ovulationStart);
  const end = startOfDay(ovulationEnd);
  
  return checkDate >= start && checkDate <= end;
}

// Check if date is in third month ovulation
export function isDateInThirdMonthOvulation(date: Date): boolean {
  const predictions = getMultiMonthPredictions();
  const thirdMonth = predictions.find(p => p.month === 3);
  
  if (!thirdMonth) return false;
  
  const ovulationStart = addDays(thirdMonth.nextOvulation, -2);
  const ovulationEnd = addDays(thirdMonth.nextOvulation, 2);
  
  const checkDate = startOfDay(date);
  const start = startOfDay(ovulationStart);
  const end = startOfDay(ovulationEnd);
  
  return checkDate >= start && checkDate <= end;
}

export function isDateInFertileWindow(date: Date): boolean {
  const predictions = getMultiMonthPredictions();
  
  for (const prediction of predictions) {
    const checkDate = startOfDay(date);
    const start = startOfDay(prediction.fertileWindowStart);
    const end = startOfDay(prediction.fertileWindowEnd);
    
    if (checkDate >= start && checkDate <= end) {
      return true;
    }
  }
  
  return false;
}

// Check if date is in second month fertile window
export function isDateInSecondMonthFertile(date: Date): boolean {
  const predictions = getMultiMonthPredictions();
  const secondMonth = predictions.find(p => p.month === 2);
  
  if (!secondMonth) return false;
  
  const checkDate = startOfDay(date);
  const start = startOfDay(secondMonth.fertileWindowStart);
  const end = startOfDay(secondMonth.fertileWindowEnd);
  
  return checkDate >= start && checkDate <= end;
}

// Check if date is in third month fertile window
export function isDateInThirdMonthFertile(date: Date): boolean {
  const predictions = getMultiMonthPredictions();
  const thirdMonth = predictions.find(p => p.month === 3);
  
  if (!thirdMonth) return false;
  
  const checkDate = startOfDay(date);
  const start = startOfDay(thirdMonth.fertileWindowStart);
  const end = startOfDay(thirdMonth.fertileWindowEnd);
  
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

// Update the legacy function to use advanced prediction
export function getEnhancedPrediction(): AdvancedPredictionData | null {
  return getAdvancedPrediction();
}
