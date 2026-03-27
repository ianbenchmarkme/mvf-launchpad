'use client';

import { motion } from 'framer-motion';

export function PulseBadge({ count }: { count: number }) {
  return (
    <motion.span
      animate={{ scale: [1, 1.15, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      ({count})
    </motion.span>
  );
}
