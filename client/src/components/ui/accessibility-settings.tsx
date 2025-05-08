
import React from 'react';
import { Slider } from './slider';
import { Switch } from './switch';
import { Card, CardContent, CardHeader, CardTitle } from './card';

export function AccessibilitySettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalize Your Experience</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Visual Comfort</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm">Reduce Motion</label>
              <Switch />
            </div>
            <div>
              <label className="text-sm">High Contrast Mode</label>
              <Switch />
            </div>
            <div>
              <label className="text-sm">Font Size</label>
              <Slider defaultValue={[16]} max={24} min={12} step={1} />
            </div>
            <div>
              <label className="text-sm">Line Spacing</label>
              <Slider defaultValue={[1.5]} max={2.5} min={1} step={0.1} />
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">Focus & Organization</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm">Reading Guide</label>
              <Switch />
            </div>
            <div>
              <label className="text-sm">Timer Notifications</label>
              <Switch />
            </div>
            <div>
              <label className="text-sm">Break Reminders</label>
              <Switch />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
