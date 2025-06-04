const { getReactVersion } = require('../react-version');

function generateReactComponent(subscriberId = null) {
  const reactVersion = getReactVersion();
  const isModernReact = reactVersion.startsWith('17.') || reactVersion.startsWith('18.');
  
  const componentCode = isModernReact 
    ? generateModernReactComponent(subscriberId)
    : generateLegacyReactComponent(subscriberId);

  return componentCode;
}

function generateModernReactComponent(subscriberId, region = 'us') {
  return `import { Inbox } from '@novu/react';

// import { dark } from '@novu/react/themes'; => To enable dark theme support, uncomment this line.

export function NovuInbox() {
  // Temporary subscriber ID - replace with your actual subscriber ID from your auth system
  const temporarySubscriberId = ${subscriberId ? `"${subscriberId}"` : '""'};

  const tabs = [
    // Basic tab with no filtering (shows all notifications)
    {
      label: 'All',
      filter: { tags: [] },
    },
    
    // Filter by tags - shows notifications from workflows tagged "promotions"
    {
      label: 'Promotions',
      filter: { tags: ['promotions'] },
    },
    
    // Filter by multiple tags - shows notifications with either "security" OR "alert" tags
    {
      label: 'Security',
      filter: { tags: ['security', 'alert'] },
    },
    
    // Filter by data attributes - shows notifications with priority="high" in payload
    {
      label: 'High Priority',
      filter: {
        data: { priority: 'high' },
      },
    },
    
    // Combined filtering - shows notifications that:
    // 1. Come from workflows tagged "alert" AND
    // 2. Have priority="high" in their data payload
    {
      label: 'Critical Alerts',
      filter: { 
        tags: ['alert'],
        data: { priority: 'high' }
      },
    },
  ];

  return <Inbox 
    applicationIdentifier={import.meta.env.VITE_NOVU_APP_ID || ''}
    subscriberId={temporarySubscriberId}
    ${region === 'eu' ? `
    socketUrl="https://eu.ws.novu.co"
    backendUrl="https://eu.api.novu.co"` : ''}
    tabs={tabs}
    appearance={{
      // To enable dark theme support, uncomment the following line:
      // baseTheme: dark,
      variables: {
        // The \`variables\` object allows you to define global styling properties that can be reused throughout the inbox.
        // Learn more: https://docs.novu.co/platform/inbox/react/styling#variables
      },
      elements: {
        // The \`elements\` object allows you to define styles for these components.
        // Learn more: https://docs.novu.co/platform/inbox/react/styling#elements
      },
      icons: {
        // The \`icons\` object allows you to define custom icons for the inbox.
      },
    }} 
  />;
}`;
}

function generateLegacyReactComponent(subscriberId, region = 'us') {
  return `// Legacy React component (React 16.x)
// React import is required for JSX in React 16.x
import React from 'react';

import { Inbox } from '@novu/react';

// import { dark } from '@novu/react/themes'; => To enable dark theme support, uncomment this line.

export function NovuInbox() {
  // Temporary subscriber ID - replace with your actual subscriber ID from your auth system
  const temporarySubscriberId = ${subscriberId ? `"${subscriberId}"` : '""'};

  const tabs = [
    // Basic tab with no filtering (shows all notifications)
    {
      label: 'All',
      filter: { tags: [] },
    },
    
    // Filter by tags - shows notifications from workflows tagged "promotions"
    {
      label: 'Promotions',
      filter: { tags: ['promotions'] },
    },
    
    // Filter by multiple tags - shows notifications with either "security" OR "alert" tags
    {
      label: 'Security',
      filter: { tags: ['security', 'alert'] },
    },
    
    // Filter by data attributes - shows notifications with priority="high" in payload
    {
      label: 'High Priority',
      filter: {
        data: { priority: 'high' },
      },
    },
    
    // Combined filtering - shows notifications that:
    // 1. Come from workflows tagged "alert" AND
    // 2. Have priority="high" in their data payload
    {
      label: 'Critical Alerts',
      filter: { 
        tags: ['alert'],
        data: { priority: 'high' }
      },
    },
  ];

  return <Inbox 
    applicationIdentifier={process.env.NOVU_APP_ID || ''}
    subscriberId={temporarySubscriberId}
    ${region === 'eu' ? `
    socketUrl="https://eu.ws.novu.co"
    backendUrl="https://eu.api.novu.co"` : ''}
    tabs={tabs}
    appearance={{
      // To enable dark theme support, uncomment the following line:
      // baseTheme: dark,
      variables: {
        // The \`variables\` object allows you to define global styling properties that can be reused throughout the inbox.
        // Learn more: https://docs.novu.co/platform/inbox/react/styling#variables
      },
      elements: {
        // The \`elements\` object allows you to define styles for these components.
        // Learn more: https://docs.novu.co/platform/inbox/react/styling#elements
      },
      icons: {
        // The \`icons\` object allows you to define custom icons for the inbox.
      },
    }} 
  />;
}`;
}

module.exports = {
  generateReactComponent,
};