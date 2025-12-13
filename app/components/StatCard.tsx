'use client';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'pink' | 'blue' | 'green' | 'yellow';
}

export default function StatCard({
  title,
  value,
  icon,
  color = 'pink',
}: StatCardProps) {
  const colorClasses = {
    pink: 'bg-pink-100 text-pink-500',
    blue: 'bg-blue-100 text-blue-500',
    green: 'bg-green-100 text-green-500',
    yellow: 'bg-yellow-100 text-yellow-500',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-2">
        {icon && (
          <div
            className={`w-10 h-10 ${colorClasses[color]} rounded-lg flex items-center justify-center`}
          >
            {icon}
          </div>
        )}
        <h3 className="text-gray-600">{title}</h3>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
