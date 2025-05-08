
import { db } from './db';
import { eq, and, or, not } from 'drizzle-orm';
import { users, staffExpertise, availability, meetings } from '@shared/schema';
import type { User, StaffExpertise, Availability } from '@shared/schema';

export async function findAlternativeStaff(
  meeting: Meeting,
  originalStaffId: number,
  modality?: 'VIRTUAL' | 'IN_PERSON'
): Promise<{
  success: boolean;
  alternativeStaff?: User[];
  message?: string;
}> {
  // Get required expertise
  const requiredExpertise = await db.query.staffExpertise.findFirst({
    where: eq(staffExpertise.userId, originalStaffId)
  });

  if (!requiredExpertise) {
    return { 
      success: false, 
      message: "Could not determine required expertise" 
    };
  }

  // Find staff with matching expertise
  const qualifiedStaff = await db.query.users.findMany({
    where: and(
      eq(users.role, 'PROFESSIONAL_STAFF'),
      not(eq(users.id, originalStaffId))
    ),
    with: {
      expertise: true,
      availability: true
    }
  });

  // Filter by expertise and availability
  const availableStaff = qualifiedStaff.filter(staff => {
    const hasExpertise = staff.expertise.some(exp => 
      exp.subjectId === requiredExpertise.subjectId && 
      exp.proficiencyLevel >= requiredExpertise.proficiencyLevel
    );

    const isAvailable = staff.availability.some(slot => 
      slot.dayOfWeek === new Date(meeting.date).getDay() &&
      slot.startTime <= meeting.startTime &&
      slot.endTime >= meeting.endTime
    );

    const matchesModality = !modality || 
      (modality === 'VIRTUAL' ? staff.isRemote : !staff.isRemote);

    return hasExpertise && isAvailable && matchesModality;
  });

  if (availableStaff.length === 0) {
    // Create notification for scheduling team
    await db.insert(notifications).values({
      type: 'PAIRING_ISSUE',
      message: `Unable to find alternative staff for meeting #${meeting.id}. Original staff: ${originalStaffId}`,
      priority: 'HIGH',
      relatedEntityType: 'MEETING',
      relatedEntityId: meeting.id,
      tags: ['scheduling-team', 'needs-review']
    });

    return {
      success: false,
      message: "No qualified and available staff found. Scheduling team has been notified."
    };
  }

  return {
    success: true,
    alternativeStaff: availableStaff
  };
}
