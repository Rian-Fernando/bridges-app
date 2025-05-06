import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MeetingDetailsModalProps, meetingTypeInfo, formatDate, formatTime } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

export function MeetingDetailsModal({
  isOpen,
  meeting,
  student,
  staff,
  subject,
  onClose,
  onEdit,
  onDuplicate,
  onCancel
}: MeetingDetailsModalProps) {
  if (!meeting) return null;
  
  const meetingInfo = meetingTypeInfo[meeting.meetingType];
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Meeting Details</DialogTitle>
          <DialogDescription>
            View details about this scheduled meeting.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="mb-4">
            <label className="block text-sm font-medium text-apple-gray-700 mb-1">Meeting Type</label>
            <div className="flex items-center">
              <div 
                className="w-4 h-4 rounded-full mr-2" 
                style={{ backgroundColor: meetingInfo.color }}
              ></div>
              <span className="font-medium">{meetingInfo.label}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-apple-gray-700 mb-1">Student</label>
              <p className="text-apple-gray-900">
                {student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-apple-gray-700 mb-1">Staff</label>
              <p className="text-apple-gray-900">
                {staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown Staff'}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-apple-gray-700 mb-1">Date</label>
              <p className="text-apple-gray-900">{formatDate(meeting.date)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-apple-gray-700 mb-1">Time</label>
              <p className="text-apple-gray-900">
                {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
              </p>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-apple-gray-700 mb-1">Location</label>
            <p className="text-apple-gray-900">
              {meeting.location || 'Location TBD'}
              {meeting.isVirtual && ' (Virtual)'}
            </p>
          </div>
          
          {subject && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-apple-gray-700 mb-1">Subject</label>
              <p className="text-apple-gray-900">{subject.name} - {subject.code}</p>
            </div>
          )}
          
          {meeting.notes && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-apple-gray-700 mb-1">Notes</label>
              <p className="text-apple-gray-900 text-sm">{meeting.notes}</p>
            </div>
          )}
        </div>
        
        <Separator />
        
        <DialogFooter className="flex justify-between space-x-3">
          <div className="flex-1 flex space-x-3">
            <Button className="flex-1" onClick={onEdit}>
              <i className="fas fa-edit mr-2"></i> Edit
            </Button>
            <Button variant="outline" className="flex-1" onClick={onDuplicate}>
              <i className="fas fa-copy mr-2"></i> Duplicate
            </Button>
          </div>
          <Button variant="destructive" onClick={onCancel}>
            <i className="fas fa-trash-alt"></i>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
