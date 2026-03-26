import { describe, it, expect } from 'vitest';
import { TIER_WEIGHTS, CAPACITY_LIMIT, TIER_LABELS, LAYER_LABELS } from '@/lib/constants';

describe('TIER_WEIGHTS', () => {
  it('assigns 0.5 points to red tier', () => {
    expect(TIER_WEIGHTS.red).toBe(0.5);
  });

  it('assigns 1 point to amber tier', () => {
    expect(TIER_WEIGHTS.amber).toBe(1);
  });

  it('assigns 0 points to green tier (team-owned)', () => {
    expect(TIER_WEIGHTS.green).toBe(0);
  });
});

describe('CAPACITY_LIMIT', () => {
  it('is 5 points', () => {
    expect(CAPACITY_LIMIT).toBe(5);
  });
});

describe('TIER_LABELS', () => {
  it('maps red to Experimental', () => {
    expect(TIER_LABELS.red).toBe('Experimental');
  });

  it('maps amber to Verified', () => {
    expect(TIER_LABELS.amber).toBe('Verified');
  });

  it('maps green to Supported', () => {
    expect(TIER_LABELS.green).toBe('Supported');
  });
});

describe('LAYER_LABELS', () => {
  it('maps L1 to Engineering', () => {
    expect(LAYER_LABELS.L1).toBe('Engineering');
  });

  it('maps L2 to Product & Design', () => {
    expect(LAYER_LABELS.L2).toBe('Product & Design');
  });

  it('maps L3 to Makers Programme', () => {
    expect(LAYER_LABELS.L3).toBe('Makers Programme');
  });
});
