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
    <div style={{ display: 'flex', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb', overflowX: 'auto' }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => setActiveTab(tab.id)}
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === tab.id ? '2px solid #111827' : '2px solid transparent',
            color: activeTab === tab.id ? '#111827' : '#6b7280',
            padding: '0.5rem 0.25rem',
            fontWeight: activeTab === tab.id ? 600 : 500,
            cursor: 'pointer',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default ChannelTabs;
