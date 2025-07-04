import React from 'react';
import { FaCheckCircle, FaShareAlt, FaLaptop } from 'react-icons/fa';

const getActivityIcon = (type) => {
  switch (type) {
    case 'credential_issued':
      return <FaCheckCircle className="text-gray-600 text-base" />;
    case 'credential_shared':
      return <FaShareAlt className="text-gray-600 text-base" />;
    case 'wallet_connected':
      return <FaLaptop className="text-gray-600 text-base" />;
    default:
      return null;
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  });
};

const ActivityTimeline = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600 bg-gray-50 rounded-lg">
        <p className="m-0">No recent activity to display</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex mb-6 relative last:mb-0">
          {/* Vertical line */}
          <div className="absolute left-4 top-[30px] bottom-[-30px] w-0.5 bg-gray-200 last:hidden" />
          
          {/* Icon */}
          <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center mr-4 flex-shrink-0 border-2 border-gray-200 relative z-10">
            {getActivityIcon(activity.type)}
          </div>
          
          {/* Content */}
          <div className="flex-1">
            <h4 className="text-slate-800 text-base font-semibold mb-2">
              {activity.title}
            </h4>
            <p className="text-gray-600 text-sm mb-2">
              {activity.details}
            </p>
            <span className="text-gray-400 text-xs">
              {formatDate(activity.timestamp)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityTimeline; 