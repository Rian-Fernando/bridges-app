
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Progress } from './progress';

export function TaskBreakdown({ tasks }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between">
                <h3 className="font-medium">{task.name}</h3>
                <span>{task.completed}/{task.total} steps</span>
              </div>
              <Progress value={(task.completed/task.total) * 100} />
              <div className="pl-4 space-y-1">
                {task.steps.map((step, stepIndex) => (
                  <div 
                    key={stepIndex}
                    className={`text-sm ${step.completed ? 'text-green-600' : 'text-gray-600'}`}
                  >
                    • {step.description}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
