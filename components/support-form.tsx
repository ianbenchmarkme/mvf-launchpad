'use client';

import { useState, useRef } from 'react';
import { MessageSquare, Settings2, ArrowLeft, ArrowRight, Check, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import type { SupportRequestData } from '@/lib/validators';

const STEP_EASE = [0.25, 0.1, 0.25, 1] as const;

interface SupportFormProps {
  userApps: { id: string; name: string }[];
  onSubmit: (data: SupportRequestData) => Promise<void>;
}

const STEPS = [
  { title: "What's the issue?", subtitle: 'Tell us what you need help with', icon: MessageSquare },
  { title: 'A bit more detail', subtitle: 'Help us prioritise and respond', icon: Settings2 },
] as const;

type RequestType = 'bug_report' | 'feature_request' | 'feedback' | 'question';
type Priority = 'low' | 'medium' | 'high';

const REQUEST_TYPE_OPTIONS: { value: RequestType; label: string }[] = [
  { value: 'bug_report', label: 'Bug Report' },
  { value: 'feature_request', label: 'Feature Request' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'question', label: 'Question' },
];

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export function SupportForm({ userApps, onSubmit }: SupportFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const contentRef = useRef<HTMLDivElement>(null);

  // Form state
  const [requestType, setRequestType] = useState<RequestType | ''>('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [relatedAppId, setRelatedAppId] = useState<string>('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [wantsReply, setWantsReply] = useState<boolean>(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateCurrentStep(): boolean {
    const stepErrors: Record<string, string> = {};

    if (currentStep === 0) {
      if (!requestType) stepErrors.request_type = 'Please select a request type';
      if (!subject || subject.length < 5) stepErrors.subject = 'Subject must be at least 5 characters';
      if (!description || description.length < 20) stepErrors.description = 'Description must be at least 20 characters';
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }

  function goNext() {
    if (!validateCurrentStep()) return;
    setDirection(1);
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
    contentRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }

  function goBack() {
    setDirection(-1);
    setErrors({});
    setCurrentStep((s) => Math.max(s - 1, 0));
    contentRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }

  async function handleSubmit() {
    if (!validateCurrentStep()) return;
    if (!requestType) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        request_type: requestType,
        subject,
        description,
        related_app_id: relatedAppId || null,
        priority,
        wants_reply: wantsReply,
      });
      toast.success('Thanks for your request — the support team will be in touch soon.');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div ref={contentRef} className="w-full">
      {/* ── Progress Indicator ──────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        {STEPS.map((_step, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div
              className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold transition-all duration-200 ${
                i === currentStep
                  ? 'bg-mvf-purple text-white shadow-lg shadow-mvf-purple/30 scale-110'
                  : i < currentStep
                  ? 'bg-mvf-light-blue text-white'
                  : 'border-2 border-muted-foreground/30 text-muted-foreground'
              }`}
            >
              {i < currentStep ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-2 transition-colors duration-300 ${
                i < currentStep ? 'bg-mvf-light-blue' : 'bg-muted-foreground/20'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* ── Step Header + Content ───────────────────────────── */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          variants={{
            enter: (d: number) => ({ opacity: 0, x: d * 24 }),
            center: { opacity: 1, x: 0 },
            exit: (d: number) => ({ opacity: 0, x: d * -24 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: STEP_EASE }}
        >
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-0.5">
              {(() => {
                const Icon = STEPS[currentStep].icon;
                return <Icon className="h-4 w-4 text-mvf-purple" />;
              })()}
              <h2 className="text-[18px] font-semibold tracking-tight">{STEPS[currentStep].title}</h2>
            </div>
            <p className="text-[14px] text-muted-foreground ml-6">{STEPS[currentStep].subtitle}</p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); isLastStep ? handleSubmit() : goNext(); }}>
            {/* ── Step 1: What's the issue? ── */}
            {currentStep === 0 && (
              <div className="space-y-5">
                {/* Request Type */}
                <div className="space-y-2">
                  <label className="block text-[15px] font-medium">Request Type</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {REQUEST_TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => { setRequestType(opt.value); setErrors((e) => ({ ...e, request_type: '' })); }}
                        className={`rounded-[6px] border px-3 py-2.5 text-[13px] font-medium transition-all duration-150 ${
                          requestType === opt.value
                            ? 'border-mvf-purple bg-mvf-purple text-white'
                            : 'border-input bg-background hover:border-mvf-purple/40'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {errors.request_type && (
                    <p className="text-[13px] text-red-500 mt-1">{errors.request_type}</p>
                  )}
                </div>

                {/* Subject */}
                <div className="space-y-1">
                  <label htmlFor="support-subject" className="block text-[15px] font-medium">Subject</label>
                  <input
                    id="support-subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of your request"
                    className="w-full rounded-[6px] border bg-background px-4 h-[52px] text-[15px] transition-all duration-150 focus:border-mvf-purple/40 focus:ring-1 focus:ring-mvf-purple/20 outline-none placeholder:text-muted-foreground/50"
                  />
                  {errors.subject && <p className="text-[13px] text-red-500 mt-1">{errors.subject}</p>}
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label htmlFor="support-description" className="block text-[15px] font-medium">Description</label>
                  <textarea
                    id="support-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your issue or request in as much detail as helpful..."
                    rows={5}
                    className="w-full rounded-[6px] border bg-background px-4 py-4 text-[15px] transition-all duration-150 focus:border-mvf-purple/40 focus:ring-1 focus:ring-mvf-purple/20 outline-none placeholder:text-muted-foreground/50 resize-none"
                  />
                  {errors.description && <p className="text-[13px] text-red-500 mt-1">{errors.description}</p>}
                </div>
              </div>
            )}

            {/* ── Step 2: A bit more detail ── */}
            {currentStep === 1 && (
              <div className="space-y-5">
                {/* Related App */}
                <div className="space-y-1">
                  <label htmlFor="support-related-app" className="block text-[15px] font-medium">
                    Related App <span className="text-muted-foreground font-normal text-[13px]">(optional)</span>
                  </label>
                  <select
                    id="support-related-app"
                    value={relatedAppId}
                    onChange={(e) => setRelatedAppId(e.target.value)}
                    className="w-full rounded-[6px] border bg-background px-4 h-[52px] text-[15px] transition-all duration-150 focus:border-mvf-purple/40 focus:ring-1 focus:ring-mvf-purple/20 outline-none"
                  >
                    <option value="">Not app-specific</option>
                    {userApps.map((app) => (
                      <option key={app.id} value={app.id}>{app.name}</option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <label className="block text-[15px] font-medium">Priority</label>
                  <div className="flex gap-2">
                    {PRIORITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setPriority(opt.value)}
                        className={`flex-1 rounded-[6px] border px-4 py-3 text-[14px] font-medium transition-all duration-150 ${
                          priority === opt.value
                            ? 'border-mvf-purple bg-mvf-purple text-white'
                            : 'border-input bg-background hover:border-mvf-purple/40'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contact me back */}
                <div className="space-y-2">
                  <label className="block text-[15px] font-medium">Contact me back?</label>
                  <p className="text-[13px] text-muted-foreground -mt-1">
                    Should we follow up with a response once your request is resolved?
                  </p>
                  <div className="flex gap-2">
                    {([{ value: true, label: 'Yes' }, { value: false, label: 'No' }] as const).map((opt) => (
                      <button
                        key={String(opt.value)}
                        type="button"
                        onClick={() => setWantsReply(opt.value)}
                        className={`flex-1 rounded-[6px] border px-4 py-3 text-[14px] font-medium transition-all duration-150 ${
                          wantsReply === opt.value
                            ? 'border-mvf-purple bg-mvf-purple text-white'
                            : 'border-input bg-background hover:border-mvf-purple/40'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Navigation Buttons ── */}
            <div className={`flex mt-8 ${currentStep > 0 ? 'justify-between' : 'justify-end'}`}>
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={goBack}
                  data-testid="back-button"
                className="flex items-center gap-2 rounded-[6px] border border-input bg-background px-5 h-11 text-[14px] font-medium text-foreground hover:bg-muted transition-all duration-150"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-[6px] px-6 h-11 text-[14px] font-semibold text-white transition-all duration-150 disabled:opacity-60"
                style={{ backgroundColor: 'var(--mvf-pink)' }}
              >
                {isLastStep ? (
                  <>
                    {isSubmitting ? 'Submitting…' : 'Submit'}
                    {!isSubmitting && <Send className="h-4 w-4" />}
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
