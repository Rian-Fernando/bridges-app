import { ActivityCardProps, getRelativeTime } from "@/lib/types";

export function ActivityCard({ activity, user }: ActivityCardProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'meeting_scheduled':
        return <i className="fas fa-calendar-plus text-apple-blue"></i>;
      case 'user_added':
        return <i className="fas fa-user-plus text-apple-green"></i>;
      case 'meeting_updated':
      case 'meeting_rescheduled':
        return <i className="fas fa-exchange-alt text-apple-orange"></i>;
      case 'conflict_resolved':
        return <i className="fas fa-exclamation-circle text-apple-red"></i>;
      default:
        return <i className="fas fa-info-circle text-apple-blue"></i>;
    }
  };

  const getActivityBgClass = (type: string) => {
    switch (type) {
      case 'meeting_scheduled':
        return 'bg-apple-blue bg-opacity-10';
      case 'user_added':
        return 'bg-apple-green bg-opacity-10';
      case 'meeting_updated':
      case 'meeting_rescheduled':
        return 'bg-apple-orange bg-opacity-10';
      case 'conflict_resolved':
        return 'bg-apple-red bg-opacity-10';
      default:
        return 'bg-apple-blue bg-opacity-10';
    }
  };

  return (
    <div className="flex items-start mb-4">
      <div className={`${getActivityBgClass(activity.activityType)} p-2 rounded-md mr-3`}>
        {getActivityIcon(activity.activityType)}
      </div>
      <div>
        <p className="text-sm font-medium">
          {activity.activityType.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
        </p>
        <p className="text-xs text-apple-gray-600">{activity.description}</p>
        <p className="text-xs text-apple-gray-500 mt-1">{getRelativeTime(activity.createdAt)}</p>
      </div>
    </div>
  );
}
