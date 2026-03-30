import { Code, Palette, Lightbulb } from 'lucide-react';

export type Layer = 'L1' | 'L2' | 'L3';
export type AppCategory = 'Marketing' | 'Sales' | 'Legal' | 'Tech' | 'Data' | 'Productivity' | 'AI';
export type TargetUsers = 'my_team' | 'department' | 'org_wide';
export type Tristate = 'yes' | 'no' | 'unsure';

export const LAYER_OPTIONS: { value: Layer; label: string; description: string; icon: typeof Code }[] = [
  { value: 'L1', label: 'Engineering', description: 'Core systems, production, strategic Rocks', icon: Code },
  { value: 'L2', label: 'Product & Design', description: 'Internal tools, CRO experiments, prototypes', icon: Palette },
  { value: 'L3', label: 'Makers Programme', description: 'Team tools, workflow improvements, automations', icon: Lightbulb },
];

export const TARGET_OPTIONS: { value: TargetUsers; label: string }[] = [
  { value: 'my_team', label: 'My Team' },
  { value: 'department', label: 'Department' },
  { value: 'org_wide', label: 'Organisation-wide' },
];

export const CATEGORY_OPTIONS: { value: AppCategory; label: string }[] = [
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Legal', label: 'Legal' },
  { value: 'Tech', label: 'Tech' },
  { value: 'Data', label: 'Data' },
  { value: 'Productivity', label: 'Productivity' },
  { value: 'AI', label: 'AI' },
];

export const TRISTATE_OPTIONS: { value: Tristate; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Unsure' },
];
