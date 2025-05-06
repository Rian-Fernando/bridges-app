import { ConflictCardProps } from "@/lib/types";

export function ConflictCard({ conflict, relatedUser, assignedTo, onResolve, onAssign }: ConflictCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-apple-red bg-apple-red';
      case 'medium':
        return 'border-apple-orange bg-apple-orange';
      case 'low':
        return 'border-apple-gray-400 bg-apple-gray-600';
      default:
        return 'border-apple-gray-400 bg-apple-gray-600';
    }
  };

  const priorityColorClass = getPriorityColor(conflict.priority);

  return (
    <div className={`border-l-4 bg-opacity-5 p-3 rounded-r mb-3 ${conflict.priority === 'low' ? 'bg-apple-gray-100' : `${priorityColorClass.split(' ')[1]} bg-opacity-5`} ${priorityColorClass.split(' ')[0]}`}>
      <div className="flex justify-between">
        <h4 className="text-sm font-medium">{conflict.description.split(':')[0] || 'Conflict'}</h4>
        <span className={`text-xs font-medium ${priorityColorClass} text-white px-2 py-0.5 rounded`}>
          {conflict.priority.charAt(0).toUpperCase() + conflict.priority.slice(1)}
        </span>
      </div>
      <p className="text-xs text-apple-gray-800 mt-1">
        {conflict.description.split(':')[1] || conflict.description}
      </p>
      <div className="flex justify-between mt-2">
        <span className="text-xs text-apple-gray-600">
          Assigned to: {assignedTo ? `${assignedTo.firstName} ${assignedTo.lastName}` : 'Unassigned'}
        </span>
        {conflict.status === 'open' && (
          <button 
            className="text-xs text-apple-blue font-medium"
            onClick={assignedTo ? onResolve : onAssign}
          >
            {assignedTo ? 'Resolve' : 'Assign'}
          </button>
        )}
      </div>
    </div>
  );
}
