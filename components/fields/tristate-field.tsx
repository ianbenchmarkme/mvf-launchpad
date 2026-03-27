'use client';

import { Scale } from 'lucide-react';
import { TRISTATE_OPTIONS, type Tristate } from '@/lib/field-options';

interface TristateFieldProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: Tristate;
  onChange: (v: Tristate) => void;
  alert?: string;
}

export function TristateField({ icon: Icon, label, value, onChange, alert }: TristateFieldProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-[15px] font-medium flex items-center gap-2">
        <Icon className="h-4 w-4 text-mvf-purple" />
        {label}
      </legend>
      <div className="flex gap-2">
        {TRISTATE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 rounded border px-4 py-3 text-[15px] font-medium transition-all duration-200 ${
              value === opt.value
                ? 'border-mvf-purple bg-mvf-purple text-white'
                : 'border-input bg-background hover:border-mvf-purple/40'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {alert && (
        <p className="text-[13px] text-amber-600 bg-amber-50 rounded px-3 py-2 flex items-center gap-2">
          <Scale className="h-4 w-4 shrink-0" />
          {alert}
        </p>
      )}
    </fieldset>
  );
}
