import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock Framer Motion globally so animations resolve immediately in jsdom.
// AnimatePresence renders children without waiting for exit animations,
// and motion.* components render as plain divs/spans with no transition delay.
vi.mock('framer-motion', () => {
  const React = require('react');

  const AnimatePresence = ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children);

  // motion.div/span/etc → Fragment (no extra wrapper, events work on children)
  // motion.button/a/input → real element so click/submit handlers fire
  const INTERACTIVE_TAGS = new Set(['button', 'a', 'input', 'textarea', 'select', 'form', 'label']);

  const motion = new Proxy({}, {
    get: (_target, tag: string) => {
      if (INTERACTIVE_TAGS.has(tag)) {
        // Render as the real element, stripping Framer-only props
        return React.forwardRef(
          ({ children, initial, animate, exit, variants, transition, whileHover,
             whileTap, whileFocus, whileDrag, whileInView, layout, layoutId,
             custom, onAnimationStart, onAnimationComplete, onUpdate, ...domProps }:
            React.HTMLAttributes<HTMLElement> & { [key: string]: unknown },
            ref: React.Ref<HTMLElement>,
          ) => {
            void initial; void animate; void exit; void variants; void transition;
            void whileHover; void whileTap; void whileFocus; void whileDrag;
            void whileInView; void layout; void layoutId; void custom;
            void onAnimationStart; void onAnimationComplete; void onUpdate;
            return React.createElement(tag, { ...domProps, ref }, children as React.ReactNode);
          },
        );
      }
      // Layout wrappers: render children directly (no wrapper element)
      return ({ children }: { children?: React.ReactNode }) =>
        React.createElement(React.Fragment, null, children ?? null);
    },
  });

  return {
    motion,
    AnimatePresence,
    useReducedMotion: () => false,
    useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
    useMotionValue: (initial: unknown) => ({ get: () => initial, set: vi.fn() }),
    useTransform: () => ({ get: vi.fn() }),
  };
});
