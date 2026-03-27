'use client';

import { motion, useReducedMotion } from 'framer-motion';

export function PulseBadge({ count }: { count: number }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.span
      animate={reducedMotion ? undefined : { scale: [1, 1.15, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      ({count})
    </motion.span>
  );
}
