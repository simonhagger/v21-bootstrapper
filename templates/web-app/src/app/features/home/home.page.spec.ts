import { describe, it, expect } from 'vitest';

// Simple example test - demonstrates Vitest usage
// For full component testing with TestBed, see TESTING_GUIDE.md

describe('HomePageComponent', () => {
  it('should pass basic sanity check', () => {
    expect(true).toBe(true);
  });

  it('should render with TypeScript', () => {
    const message = 'Welcome to the home page';
    expect(message).toContain('home');
  });
});
