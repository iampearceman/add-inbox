const { detectAuthProviders } = require('../../utils/auth');

function generateReactComponent() {
  const detectedProviders = detectAuthProviders();
  const hasProviders = detectedProviders.length > 0;

  const imports = [
    "import React from 'react';",
    "import { Inbox, InboxProps } from '@novu/react';",
    "import { useNavigate } from 'react-router';",
  ];

  // Add auth provider imports if detected
  if (detectedProviders.includes('nextauth')) {
    imports.push("import { useSession } from 'next-auth/react';");
  }
  if (detectedProviders.includes('supabase')) {
    imports.push("import { useSupabaseClient } from '@supabase/auth-helpers-react';");
  }
  if (detectedProviders.includes('auth0')) {
    imports.push("import { useAuth0 } from '@auth0/auth0-react';");
  }
  if (detectedProviders.includes('clerk')) {
    imports.push("import { useUser } from '@clerk/clerk-react';");
  }

  return `${imports.join('\n')}

const appId = import.meta.env.VITE_NOVU_APP_ID;

if (!appId) {
  throw new Error('Novu app ID must be set');
}

// Get the subscriber ID based on the auth provider
const getSubscriberId = () => {
${hasProviders ? `
  // Detected auth providers: ${detectedProviders.join(', ')}
  ${detectedProviders.includes('nextauth') ? `
  // NextAuth.js implementation
  const { data: session } = useSession();
  if (session?.user?.id) return session.user.id;` : ''}
  ${detectedProviders.includes('supabase') ? `
  // Supabase implementation
  const { user } = useSupabaseClient();
  if (user?.id) return user.id;` : ''}
  ${detectedProviders.includes('auth0') ? `
  // Auth0 implementation
  const { user } = useAuth0();
  if (user?.sub) return user.sub;` : ''}
  ${detectedProviders.includes('clerk') ? `
  // Clerk implementation
  const { user } = useUser();
  if (user?.id) return user.id;` : ''}
  
  // If no auth provider is detected or user is not authenticated
  throw new Error('No authenticated user found');` : `
  // No auth providers detected. Please implement your own auth logic:
  // Example implementations:
  
  // For NextAuth.js:
  // const { data: session } = useSession();
  // return session?.user?.id;
  
  // For Supabase:
  // const { user } = useSupabaseClient();
  // return user?.id;
  
  // For Auth0:
  // const { user } = useAuth0();
  // return user?.sub;
  
  // For Clerk:
  // const { user } = useUser();
  // return user?.id;
  
  // For custom implementation:
  // return yourCustomAuthLogic();
  
  throw new Error('Please implement getSubscriberId based on your auth provider');`}
};

const inboxConfig: InboxProps = {
  applicationIdentifier: appId,
  subscriberId: getSubscriberId(),
  appearance: {
    variables: {
      // The \`variables\` object allows you to define global styling properties that can be reused throughout the inbox.
      // Learn more: https://docs.novu.co/platform/inbox/react/styling#variables
    },
    elements: {
      // The \`elements\` object allows you to define styles for these components.
      // Learn more: https://docs.novu.co/platform/inbox/react/styling#elements
    }
  },
};

export function NotificationCenter() {
  const navigate = useNavigate();
 
  return (
    <Inbox {...inboxConfig} 
      routerPush={(path: string) => navigate(path)}
    />
  );
}`;
}

module.exports = {
  generateReactComponent
}; 