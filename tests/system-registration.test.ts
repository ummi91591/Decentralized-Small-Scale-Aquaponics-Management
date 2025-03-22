import { describe, it, expect, beforeEach } from 'vitest';

// Mock implementation for testing Clarity contracts
const mockPrincipal = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const mockBlockHeight = 100;

// Mock state
let lastId = 0;
const systems = new Map();

// Mock contract functions
const registerSystem = (name, location, systemType, tankVolume, growBedArea) => {
  const newId = lastId + 1;
  lastId = newId;
  
  systems.set(newId, {
    owner: mockPrincipal,
    name,
    location,
    systemType,
    tankVolume,
    growBedArea,
    registrationDate: mockBlockHeight
  });
  
  return { value: newId };
};

const getSystem = (id) => {
  const system = systems.get(id);
  return system ? { value: system } : { error: 404 };
};

const updateSystem = (id, name, location, systemType, tankVolume, growBedArea) => {
  const system = systems.get(id);
  if (!system) return { error: 404 };
  if (system.owner !== mockPrincipal) return { error: 403 };
  
  systems.set(id, {
    ...system,
    name,
    location,
    systemType,
    tankVolume,
    growBedArea
  });
  
  return { value: id };
};

describe('System Registration Contract', () => {
  beforeEach(() => {
    // Reset state before each test
    lastId = 0;
    systems.clear();
  });
  
  it('should register a new system', () => {
    const result = registerSystem(
        'Backyard Aquaponics',
        'Home Garden',
        'Media Bed',
        500,
        10
    );
    
    expect(result.value).toBe(1);
    expect(systems.size).toBe(1);
    
    const systemResult = getSystem(1);
    expect(systemResult.value).not.toBeNull();
    expect(systemResult.value.name).toBe('Backyard Aquaponics');
    expect(systemResult.value.location).toBe('Home Garden');
    expect(systemResult.value.systemType).toBe('Media Bed');
    expect(systemResult.value.tankVolume).toBe(500);
    expect(systemResult.value.growBedArea).toBe(10);
  });
  
  it('should update an existing system', () => {
    // First register a system
    registerSystem('Backyard Aquaponics', 'Home Garden', 'Media Bed', 500, 10);
    
    // Then update it
    const updateResult = updateSystem(
        1,
        'Updated Aquaponics',
        'Greenhouse',
        'NFT',
        600,
        15
    );
    
    expect(updateResult.value).toBe(1);
    
    const systemResult = getSystem(1);
    expect(systemResult.value.name).toBe('Updated Aquaponics');
    expect(systemResult.value.location).toBe('Greenhouse');
    expect(systemResult.value.systemType).toBe('NFT');
    expect(systemResult.value.tankVolume).toBe(600);
    expect(systemResult.value.growBedArea).toBe(15);
  });
  
  it('should fail to update a non-existent system', () => {
    const result = updateSystem(
        999,
        'Updated Aquaponics',
        'Greenhouse',
        'NFT',
        600,
        15
    );
    
    expect(result.error).toBe(404);
  });
});
