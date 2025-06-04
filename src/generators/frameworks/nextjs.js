function generateNextJsComponent(subscriberId = null, region = 'us') {
  const componentCode = `'use client';

// The Novu inbox component is a React component that allows you to display a notification inbox.
// Learn more: https://docs.novu.co/platform/inbox/overview

import { Inbox } from '@novu/nextjs';

// import { dark } from '@novu/nextjs/themes'; => To enable dark theme support, uncomment this line.

// Get the subscriber ID based on the auth provider
// const getSubscriberId = () => {};

export default function NovuInbox() {
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
    applicationIdentifier={process.env.NEXT_PUBLIC_NOVU_APP_ID as string}
    subscriberId={temporarySubscriberId} 
    tabs={tabs}
    ${region === 'eu' ? `
    socketUrl="https://eu.ws.novu.co"
    backendUrl="https://eu.api.novu.co"` : ''}
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

  return componentCode;
}

module.exports = {
  generateNextJsComponent,
};