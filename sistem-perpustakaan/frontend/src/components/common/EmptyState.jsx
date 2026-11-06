import { Inbox } from 'lucide-react';

const EmptyState = ({ title = 'Tidak ada data', description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Inbox className="text-gray-400" size={32} />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-gray-500 text-sm mb-4">{description}</p>}
      {action}
    </div>
  );
};

export default EmptyState;
