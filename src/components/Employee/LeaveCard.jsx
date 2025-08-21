import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function LeaveCard({ type, used, total, color,size }) {
  const percentage = Math.round((used / total) * 100);
  const remaining = total - used;

  return (
    <div className="flex flex-col items-center w-24 text-white">
      <div className="w-30 h-30">
        <CircularProgressbar
          value={percentage}
          text={`${percentage}%`}
          styles={buildStyles({
            textColor: 'white',
            pathColor: color,
            trailColor: '#d1d5db',
          })}
        />
      </div>
      <p className="text-sm mt-1 font-semibold">{type}</p>
      <p className="text-xs">{remaining} left</p>
    </div>
  );
}