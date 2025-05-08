
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Checkbox } from './checkbox';

export function MeetingPrep({ meeting }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Meeting Preparation Guide</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-calm-blue p-4 rounded-lg">
            <h3 className="font-medium mb-2">What to Expect</h3>
            <ul className="space-y-2">
              <li>• Meeting Type: {meeting.type}</li>
              <li>• Duration: {meeting.duration} minutes</li>
              <li>• Location: {meeting.location}</li>
              <li>• Staff Member: {meeting.staffName}</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium">Preparation Checklist</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <Checkbox id="materials" />
                <label htmlFor="materials" className="ml-2">Materials ready</label>
              </div>
              <div className="flex items-center">
                <Checkbox id="questions" />
                <label htmlFor="questions" className="ml-2">Questions prepared</label>
              </div>
              <div className="flex items-center">
                <Checkbox id="schedule" />
                <label htmlFor="schedule" className="ml-2">Added to calendar</label>
              </div>
            </div>
          </div>
          
          <div className="bg-soft-neutral p-4 rounded-lg">
            <h3 className="font-medium mb-2">Communication Preferences</h3>
            <p>Let your mentor know your preferred:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Communication style</li>
              <li>Break frequency</li>
              <li>Sensory accommodations</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
