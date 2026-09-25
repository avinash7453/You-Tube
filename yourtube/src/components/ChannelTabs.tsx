import React, { useState } from 'react';

const tabs = [
  { id: 'home', label: 'Home' },
  { id: 'videos', label: 'Videos' },
  { id: 'shorts', label: 'Shorts' },
  { id: 'live', label: 'Live' },
  { id: 'playlists', label: 'Playlists' },
  { id: 'community', label: 'Community' },
  { id: 'about', label: 'About' },
];

const ChannelTabs = () => {
  const [activeTab, setActiveTab] = useState('videos');

  return (
    <div className="flex gap-6 overflow-x-auto border-b border-gray-200 bg-white px-4 md:px-8">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => setActiveTab(tab.id)}
          className={`shrink-0 border-b-2 px-1 py-3 text-sm transition ${
            activeTab === tab.id
              ? 'border-violet-600 font-semibold text-violet-700'
              : 'border-transparent font-medium text-gray-500 hover:border-gray-300 hover:text-gray-900'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default ChannelTabs;
