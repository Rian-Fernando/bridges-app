import { useState } from 'react';
import { Meeting, User, Subject } from '../types';

interface UseMeetingModalResult {
  isOpen: boolean;
  meeting?: Meeting;
  student?: User;
  staff?: User;
  subject?: Subject;
  openModal: (meeting: Meeting, student?: User, staff?: User, subject?: Subject) => void;
  closeModal: () => void;
}

export const useMeetingModal = (): UseMeetingModalResult => {
  const [isOpen, setIsOpen] = useState(false);
  const [meeting, setMeeting] = useState<Meeting | undefined>(undefined);
  const [student, setStudent] = useState<User | undefined>(undefined);
  const [staff, setStaff] = useState<User | undefined>(undefined);
  const [subject, setSubject] = useState<Subject | undefined>(undefined);

  const openModal = (
    meetingData: Meeting,
    studentData?: User,
    staffData?: User,
    subjectData?: Subject
  ) => {
    setMeeting(meetingData);
    setStudent(studentData);
    setStaff(staffData);
    setSubject(subjectData);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    // Clear data after animation completes
    setTimeout(() => {
      setMeeting(undefined);
      setStudent(undefined);
      setStaff(undefined);
      setSubject(undefined);
    }, 300);
  };

  return {
    isOpen,
    meeting,
    student,
    staff,
    subject,
    openModal,
    closeModal
  };
};
