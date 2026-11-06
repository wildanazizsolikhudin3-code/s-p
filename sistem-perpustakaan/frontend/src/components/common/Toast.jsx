import { useNotification } from '../../context/NotificationContext';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Toast = () => {
  const { notifications, removeNotification } = useNotification();

  const icons = {
    success: <CheckCircle className="text-green-500" size={20} />,
    error: <AlertCircle className="text-red-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200'
  };

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] ${bgColors[n.type] || bgColors.info}`}
        >
          {icons[n.type] || icons.info}
          <p className="flex-1 text-sm">{n.message}</p>
          <button onClick={() => removeNotification(n.id)} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
