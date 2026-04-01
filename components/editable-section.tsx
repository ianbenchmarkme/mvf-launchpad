'use client';

import { Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

const EASE = [0.25, 0.1, 0.25, 1] as const;

interface EditableSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
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
  description,
  icon: Icon,
  iconColor,
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
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[6px]" style={{ backgroundColor: iconColor ? `${iconColor}18` : undefined }}>
              <Icon className="h-3.5 w-3.5" style={{ color: iconColor }} />
            </div>
          )}
          <div>
            <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
            {description && (
              <p className="text-[12px] text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
        </div>
        <AnimatePresence>
          {canEdit && !isEditing && (
            <motion.button
              type="button"
              onClick={onEditStart}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15, ease: EASE }}
              className="flex items-center gap-1.5 rounded px-2.5 py-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editing"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="space-y-4"
          >
            {children}
            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSaving}
                className="rounded px-4 py-2 text-[14px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-[6px] bg-mvf-pink px-4 py-2 text-[14px] font-medium text-white hover:bg-mvf-pink/85 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
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
          </motion.div>
        ) : (
          <motion.div
            key="reading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: EASE }}
          >
            {readContent}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
