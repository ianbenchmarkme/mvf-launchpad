'use client';

import { Pencil } from 'lucide-react';

interface EditableSectionProps {
  title: string;
  canEdit: boolean;
  isEditing: boolean;
  onEditStart: () => void;
  onCancel: () => void;
  onSave: () => Promise<void> | void;
  isSaving: boolean;
  children: React.ReactNode;
  readContent: React.ReactNode;
}

export function EditableSection({
  title,
  canEdit,
  isEditing,
  onEditStart,
  onCancel,
  onSave,
  isSaving,
  children,
  readContent,
}: EditableSectionProps) {
  return (
    <section className="rounded-lg border bg-card p-5 card-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
        {canEdit && !isEditing && (
          <button
            type="button"
            onClick={onEditStart}
            className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          {children}
          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="rounded px-4 py-2 text-[14px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-150 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-[6px] bg-mvf-pink px-4 py-2 text-[14px] font-medium text-white hover:bg-mvf-pink/85 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
            >
              {isSaving ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </div>
      ) : (
        readContent
      )}
    </section>
  );
}
