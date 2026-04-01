import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppCard } from '@/components/app-card';
import type { App } from '@/lib/supabase/types';

const mockApp: App = {
  id: '123',
  name: 'ArtyFish',
  problem_statement: 'Generate paid marketing wins using AI',
  layer: 'L2',
  category: 'Marketing',
  target_users: 'department',
  potential_roi: 'Saves 10h/week',
  needs_business_data: 'no',
  handles_pii: 'no',
  uses_api_keys: 'yes',
  api_key_services: 'OpenAI',
  app_url: null,
  icon_url: null,
  replaces_third_party: false,
  replaced_tool_name: null,
  replaced_tool_cost: null,
  tier: 'red',
  status: 'active',
  last_activity_at: null,
  created_by: 'user-1',
  created_at: '2026-03-01T00:00:00Z',
  updated_at: '2026-03-15T00:00:00Z',
};

describe('AppCard', () => {
  it('renders the app name', () => {
    render(<AppCard app={mockApp} />);
    expect(screen.getByText('ArtyFish')).toBeInTheDocument();
  });

  it('renders the tier badge', () => {
    render(<AppCard app={mockApp} />);
    expect(screen.getByText('Experimental')).toBeInTheDocument();
  });

  it('renders the status', () => {
    render(<AppCard app={mockApp} />);
    expect(screen.getByText('Stage: Active')).toBeInTheDocument();
  });

  it('renders the layer label', () => {
    render(<AppCard app={mockApp} />);
    // mockApp.layer = 'L2' → 'Product & Design'
    expect(screen.getByText('Product & Design')).toBeInTheDocument();
  });

  it('renders the correct label for L1 layer', () => {
    render(<AppCard app={{ ...mockApp, layer: 'L1' }} />);
    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });

  it('links to the app profile page', () => {
    render(<AppCard app={mockApp} />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/apps/123');
  });
});
