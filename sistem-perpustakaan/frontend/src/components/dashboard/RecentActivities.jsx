import { formatDate } from '../../utils/formatDate';

const statusBadge = {
  active: 'bg-blue-100 text-blue-700',
  returned: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700'
};

const RecentActivities = ({ data = [] }) => {
  if (!data.length) {
    return <p className="text-gray-400 text-sm text-center py-8">Belum ada aktivitas</p>;
  }

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.loan_code} className="flex items-center justify-between py-2 border-b last:border-0">
          <div>
            <p className="font-medium text-sm">{item.member_name}</p>
            <p className="text-xs text-gray-500">{item.loan_code} • {formatDate(item.loan_date)}</p>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[item.status] || 'bg-gray-100'}`}>
            {item.status}
          </span>
        </div>
      ))}
    </div>
  );
};

export default RecentActivities;
