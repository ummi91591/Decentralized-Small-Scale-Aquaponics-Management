import { describe, it, expect, beforeEach } from 'vitest';

// Mock implementation for testing Clarity contracts
const mockPrincipal = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const mockBlockHeight = 100;

// Mock state
let lastReadingId = 0;
const waterReadings = new Map();

// Mock contract functions
const recordWaterReading = (systemId, ph, temperature, dissolvedOxygen, ammonia, nitrite, nitrate, notes) => {
  const newId = lastReadingId + 1;
  lastReadingId = newId;
  
  waterReadings.set(newId, {
    systemId,
    owner: mockPrincipal,
    ph,
    temperature,
    dissolvedOxygen,
    ammonia,
    nitrite,
    nitrate,
    readingDate: mockBlockHeight,
    notes
  });
  
  return { value: newId };
};

const getReading = (id) => {
  const reading = waterReadings.get(id);
  return reading ? { value: reading } : { error: 404 };
};

const updateWaterReading = (id, ph, temperature, dissolvedOxygen, ammonia, nitrite, nitrate, notes) => {
  const reading = waterReadings.get(id);
  if (!reading) return { error: 404 };
  if (reading.owner !== mockPrincipal) return { error: 403 };
  
  waterReadings.set(id, {
    ...reading,
    ph,
    temperature,
    dissolvedOxygen,
    ammonia,
    nitrite,
    nitrate,
    notes
  });
  
  return { value: id };
};

const checkWaterQuality = (id) => {
  const reading = waterReadings.get(id);
  if (!reading) return { error: 404 };
  
  const phStatus = checkPh(reading.ph);
  const tempStatus = checkTemperature(reading.temperature);
  const ammoniaStatus = checkAmmonia(reading.ammonia);
  const nitriteStatus = checkNitrite(reading.nitrite);
  
  return {
    value: {
      phStatus,
      tempStatus,
      ammoniaStatus,
      nitriteStatus
    }
  };
};

const checkPh = (ph) => {
  if (ph >= 65 && ph <= 75) return 'optimal';
  if ((ph >= 60 && ph < 65) || (ph > 75 && ph <= 80)) return 'acceptable';
  return 'critical';
};

const checkTemperature = (temp) => {
  if (temp >= 220 && temp <= 260) return 'optimal';
  if ((temp >= 180 && temp < 220) || (temp > 260 && temp <= 280)) return 'acceptable';
  return 'critical';
};

const checkAmmonia = (ammonia) => {
  if (ammonia <= 5) return 'optimal';
  if (ammonia <= 10) return 'acceptable';
  return 'critical';
};

const checkNitrite = (nitrite) => {
  if (nitrite <= 5) return 'optimal';
  if (nitrite <= 10) return 'acceptable';
  return 'critical';
};

describe('Water Quality Monitoring Contract', () => {
  beforeEach(() => {
    // Reset state before each test
    lastReadingId = 0;
    waterReadings.clear();
  });
  
  it('should record a new water reading', () => {
    const result = recordWaterReading(
        1,
        70,  // pH 7.0
        240, // 24.0°C
        80,  // 8.0 mg/L
        2,   // 0.2 mg/L
        1,   // 0.1 mg/L
        50,  // 5.0 mg/L
        'Regular weekly reading'
    );
    
    expect(result.value).toBe(1);
    expect(waterReadings.size).toBe(1);
    
    const readingResult = getReading(1);
    expect(readingResult.value).not.toBeNull();
    expect(readingResult.value.systemId).toBe(1);
    expect(readingResult.value.ph).toBe(70);
    expect(readingResult.value.temperature).toBe(240);
    expect(readingResult.value.dissolvedOxygen).toBe(80);
    expect(readingResult.value.ammonia).toBe(2);
    expect(readingResult.value.nitrite).toBe(1);
    expect(readingResult.value.nitrate).toBe(50);
    expect(readingResult.value.notes).toBe('Regular weekly reading');
  });
  
  it('should update an existing water reading', () => {
    // First record a reading
    recordWaterReading(1, 70, 240, 80, 2, 1, 50, 'Regular weekly reading');
    
    // Then update it
    const updateResult = updateWaterReading(
        1,
        68,  // pH 6.8
        250, // 25.0°C
        75,  // 7.5 mg/L
        3,   // 0.3 mg/L
        2,   // 0.2 mg/L
        60,  // 6.0 mg/L
        'Updated reading'
    );
    
    expect(updateResult.value).toBe(1);
    
    const readingResult = getReading(1);
    expect(readingResult.value.ph).toBe(68);
    expect(readingResult.value.temperature).toBe(250);
    expect(readingResult.value.ammonia).toBe(3);
    expect(readingResult.value.notes).toBe('Updated reading');
  });
  
  it('should check water quality status', () => {
    // Record a reading with optimal values
    recordWaterReading(1, 70, 240, 80, 2, 1, 50, 'Optimal conditions');
    
    const qualityResult = checkWaterQuality(1);
    expect(qualityResult.value.phStatus).toBe('optimal');
    expect(qualityResult.value.tempStatus).toBe('optimal');
    expect(qualityResult.value.ammoniaStatus).toBe('optimal');
    expect(qualityResult.value.nitriteStatus).toBe('optimal');
    
    // Record a reading with critical values
    recordWaterReading(2, 55, 300, 40, 15, 15, 100, 'Critical conditions');
    
    const criticalResult = checkWaterQuality(2);
    expect(criticalResult.value.phStatus).toBe('critical');
    expect(criticalResult.value.tempStatus).toBe('critical');
    expect(criticalResult.value.ammoniaStatus).toBe('critical');
    expect(criticalResult.value.nitriteStatus).toBe('critical');
  });
});
