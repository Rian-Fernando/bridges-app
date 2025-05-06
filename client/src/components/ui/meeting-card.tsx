import { MeetingCardProps, meetingTypeInfo, formatTime } from "@/lib/types";

export function MeetingCard({ meeting, student, staff, subject, onClick }: MeetingCardProps) {
  const meetingInfo = meetingTypeInfo[meeting.meetingType];
  const formattedStartTime = formatTime(meeting.startTime);
  const formattedEndTime = formatTime(meeting.endTime);
  
  const meetingClass = `meeting-${meetingInfo.shortLabel.toLowerCase().replace(' ', '-')}`;
  const bgColorClass = `${meetingInfo.bgColor} bg-opacity-10`;
  
  return (
    <div 
      className={`absolute inset-0 m-1 ${bgColorClass} rounded ${meetingClass} p-2 cursor-pointer`}
      onClick={onClick}
    >
      <p className="text-xs font-medium">{meetingInfo.label}</p>
      <p className="text-xs">
        {student?.firstName || 'Student'} {student?.lastName || ''} & {' '}
        {staff?.firstName || 'Staff'} {staff?.lastName || ''}
      </p>
      <p className="text-xs text-apple-gray-600">
        {meeting.location || (subject ? subject.name : 'Location TBD')}
      </p>
    </div>
  );
}
