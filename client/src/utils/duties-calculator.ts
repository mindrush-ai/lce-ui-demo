/**
 * Duties Calculator Utilities
 * 
 * This module contains all the business logic for calculating customs duties,
 * fees, and related charges for The Honest Company product imports.
 */

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

/**
 * HTS Code Descriptions mapping
 */
export const HTS_CODE_DESCRIPTIONS = {
  "3401.19.00.00": "Baby Wipes & Flushable Wipes",
  "5603.92.00.70": "Dry Wipes", 
  "3401.11.50.00": "Benefit Wipes & Makeup Wipes",
  "5603.12.00.10": "Sanitizing Wipes",
  "5603.14.90.10": "Sanitizing Wipes"
} as const;

/**
 * Chapter 99 Duty Rates for China imports
 * Each HTS code has specific duty rates that are cumulative
 */
export const CHAPTER_99_DUTY_RATES = {
  "3401.19.00.00": [
    { code: "9903.01.24", description: "IEEPA China 20%", rate: 0.20 },
    { code: "9903.01.25", description: "IEEPA Reciprocal All Country 10%", rate: 0.10 },
    { code: "9903.88.15", description: "Section 301 List 4A", rate: 0.075 }
  ],
  "5603.92.00.70": [
    { code: "9903.01.24", description: "IEEPA China 20%", rate: 0.20 },
    { code: "9903.01.25", description: "IEEPA Reciprocal All Country 10%", rate: 0.10 },
    { code: "9903.88.03", description: "Section 301 List 3", rate: 0.25 }
  ],
  "3401.11.50.00": [
    { code: "9903.01.24", description: "IEEPA China 20%", rate: 0.20 },
    { code: "9903.01.25", description: "IEEPA Reciprocal All Country 10%", rate: 0.10 },
    { code: "9903.88.03", description: "Section 301 List 3", rate: 0.25 }
  ],
  "5603.12.00.10": [
    { code: "9903.01.24", description: "IEEPA China 20%", rate: 0.20 },
    { code: "9903.01.25", description: "IEEPA Reciprocal All Country 10%", rate: 0.10 },
    { code: "9903.88.03", description: "Section 301 List 3", rate: 0.25 }
  ],
  "5603.14.90.10": [
    { code: "9903.01.24", description: "IEEPA China 20%", rate: 0.20 },
    { code: "9903.01.25", description: "IEEPA Reciprocal All Country 10%", rate: 0.10 },
    { code: "9903.88.03", description: "Section 301 List 3", rate: 0.25 }
  ]
} as const;

/**
 * Fee calculation constants
 */
export const FEE_RATES = {
  HMF_RATE: 0.00125, // Harbor Maintenance Fee: 0.125%
  MPF_RATE: 0.003464, // Merchandise Processing Fee: 0.3464%
  MPF_MIN: 33.58, // Minimum MPF
  MPF_MAX: 651.50 // Maximum MPF
} as const;

/**
 * Supported HTS codes (all are duty-free at base level)
 */
export const SUPPORTED_HTS_CODES = [
  "3401.19.00.00",
  "5603.92.00.70", 
  "3401.11.50.00",
  "5603.12.00.10",
  "5603.14.90.10"
] as const;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type HTSCode = keyof typeof HTS_CODE_DESCRIPTIONS;
export type DutyLineItem = {
  code: string;
  description: string;
  rate: number;
  amount: number;
};

export interface DutiesCalculationInput {
  htsCode: HTSCode;
  countryOfOrigin: string;
  numberOfUnits: number;
  unitCost: number;
}

export interface DutiesCalculationResult {
  enteredValue: number;
  baseHtsDutyAmount: number;
  chapter99Duties: DutyLineItem[];
  hmfFee: number;
  mpfFee: number;
  totalCustomsAndDuties: number;
  totalPercentage: number;
  dutyPerItem: number;
}

// ============================================================================
// CORE CALCULATION FUNCTIONS
// ============================================================================

/**
 * Get HTS code description
 */
export function getHTSCodeDescription(htsCode: string): string {
  return HTS_CODE_DESCRIPTIONS[htsCode as HTSCode] || "Unknown HTS Code";
}

/**
 * Calculate base HTS duty (currently all supported codes are duty-free)
 */
export function calculateBaseHTSDuty(htsCode: string, enteredValue: number): number {
  const isSupported = SUPPORTED_HTS_CODES.includes(htsCode as HTSCode);
  return isSupported ? 0 : 0; // All wipes are duty-free at base level
}

/**
 * Calculate Chapter 99 duties for China imports
 */
export function calculateChapter99Duties(
  htsCode: string, 
  countryOfOrigin: string, 
  enteredValue: number
): DutyLineItem[] {
  // Chapter 99 duties only apply to China
  if (countryOfOrigin !== "CN") {
    return [];
  }

  const dutyRates = CHAPTER_99_DUTY_RATES[htsCode as HTSCode];
  if (!dutyRates) {
    return [];
  }

  return dutyRates.map(duty => ({
    code: duty.code,
    description: duty.description,
    rate: duty.rate,
    amount: enteredValue * duty.rate
  }));
}

/**
 * Calculate Harbor Maintenance Fee (HMF)
 */
export function calculateHMF(enteredValue: number): number {
  return enteredValue * FEE_RATES.HMF_RATE;
}

/**
 * Calculate Merchandise Processing Fee (MPF) with min/max caps
 */
export function calculateMPF(enteredValue: number): number {
  const calculated = enteredValue * FEE_RATES.MPF_RATE;
  return Math.min(Math.max(calculated, FEE_RATES.MPF_MIN), FEE_RATES.MPF_MAX);
}

/**
 * Get total Chapter 99 duty rate for an HTS code
 */
export function getChapter99TotalRate(htsCode: string): number {
  const dutyRates = CHAPTER_99_DUTY_RATES[htsCode as HTSCode];
  if (!dutyRates) return 0;
  
  return dutyRates.reduce((sum, duty) => sum + duty.rate, 0);
}

// ============================================================================
// MAIN CALCULATION FUNCTION
// ============================================================================

/**
 * Calculate all duties, fees, and totals for a product
 */
export function calculateDuties(input: DutiesCalculationInput): DutiesCalculationResult {
  const { htsCode, countryOfOrigin, numberOfUnits, unitCost } = input;
  
  // Calculate entered value (total value of shipment)
  const enteredValue = numberOfUnits * unitCost;
  
  // Calculate base HTS duty (duty-free for all supported codes)
  const baseHtsDutyAmount = calculateBaseHTSDuty(htsCode, enteredValue);
  
  // Calculate Chapter 99 duties (China only)
  const chapter99Duties = calculateChapter99Duties(htsCode, countryOfOrigin, enteredValue);
  const chapter99Total = chapter99Duties.reduce((sum, duty) => sum + duty.amount, 0);
  
  // Calculate fees
  const hmfFee = calculateHMF(enteredValue);
  const mpfFee = calculateMPF(enteredValue);
  
  // Calculate totals
  const totalCustomsAndDuties = baseHtsDutyAmount + chapter99Total + hmfFee + mpfFee;
  const totalPercentage = getChapter99TotalRate(htsCode); // Base is 0% for all codes
  const dutyPerItem = numberOfUnits > 0 ? totalCustomsAndDuties / numberOfUnits : 0;
  
  return {
    enteredValue,
    baseHtsDutyAmount,
    chapter99Duties,
    hmfFee,
    mpfFee,
    totalCustomsAndDuties,
    totalPercentage,
    dutyPerItem
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, decimals: number = 2): string {
  return amount.toLocaleString('en-US', { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  });
}

/**
 * Format percentage for display
 */
export function formatPercentage(rate: number, decimals: number = 1): string {
  return (rate * 100).toFixed(decimals) + '%';
}

/**
 * Check if country is China
 */
export function isChinaCountry(countryCode: string): boolean {
  return countryCode === "CN";
}