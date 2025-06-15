import React from 'react';
import { motion } from 'framer-motion';

interface ConfidenceBadgeProps {
  confidence: number;
}

const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ confidence }) => {
  const getConfidenceColor = (value: number) => {
    if (value >= 85) return 'bg-green-100 text-green-700';
    if (value >= 70) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <motion.div
      className={`px-3 py-1 text-xs rounded-full font-semibold ${getConfidenceColor(confidence)}`}
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {confidence}% confidence
    </motion.div>
  );
};

export default ConfidenceBadge; 