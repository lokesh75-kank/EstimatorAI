import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { IconButton } from '@/components/common/IconButton';
import { PencilIcon, ArrowPathIcon, PowerIcon } from '@heroicons/react/24/outline';
import type { DataSource } from '@/types/dataSources';

interface SourceCardProps {
  source: DataSource;
  onEdit?: (source: DataSource) => void;
  onResync?: (source: DataSource) => void;
  onToggle?: (source: DataSource) => void;
}

const SourceCard: React.FC<SourceCardProps> = ({ source, onEdit, onResync, onToggle }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{source.name}</h3>
          <Badge
            variant={source.status === 'active' ? 'success' : 'error'}
            className="mt-2"
          >
            {source.status}
          </Badge>
        </div>
        <div className="flex space-x-2">
          <IconButton
            icon={PencilIcon}
            onClick={() => onEdit?.(source)}
            aria-label="Edit source"
          />
          <IconButton
            icon={ArrowPathIcon}
            onClick={() => onResync?.(source)}
            aria-label="Resync source"
          />
          <IconButton
            icon={PowerIcon}
            onClick={() => onToggle?.(source)}
            aria-label="Toggle source"
          />
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <p>Last synced: {source.lastSynced}</p>
        <p>Record count: {source.recordCount}</p>
      </div>
    </motion.div>
  );
};

export default SourceCard; 