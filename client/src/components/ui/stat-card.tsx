import { StatCardProps } from "@/lib/types";

export function StatCard({ title, value, icon, change }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-5 transition-transform duration-200 ease-in-out hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-apple-gray-600 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold text-apple-gray-900 mt-1">{value}</h3>
        </div>
        <div className="bg-opacity-10 p-2 rounded-md">
          {icon}
        </div>
      </div>
      <div className="flex items-center mt-4">
        <span 
          className={`flex items-center text-sm font-medium ${
            change.isPositive ? 'text-apple-green' : 'text-apple-red'
          }`}
        >
          <i className={`fas fa-arrow-${change.isPositive ? 'up' : 'down'} mr-1 text-xs`}></i> 
          {change.value}
        </span>
        <span className="text-apple-gray-600 text-sm ml-2">{change.text}</span>
      </div>
    </div>
  );
}
