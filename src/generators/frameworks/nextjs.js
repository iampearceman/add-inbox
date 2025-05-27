const { detectAuthProviders } = require('../../utils/auth');

function generateNextJsComponent() {
  const detectedProviders = detectAuthProviders();
  const hasProviders = detectedProviders.length > 0;

  const imports = [
    "'use client';",
    "",
    "// The Novu inbox component is a React component that allows you to display a notification inbox.",
    "// Learn more: https://docs.novu.co/platform/inbox/overview",
    "",
    "import { Inbox } from '@novu/nextjs';",
    "",
    "// import { dark } from '@novu/nextjs/themes'; => To enable dark theme support, uncomment this line.",
    "",
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
// Get the subscriber ID based on the auth provider
${hasProviders ? `const getSubscriberId = () => {
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
  // No matching auth provider implementation found. Please implement your own auth logic.
  return null;
};` : `// const getSubscriberId = () => {}; => No auth providers detected. Please implement your own auth logic.`}

export default function NovuInbox() {
  return <Inbox 
    // applicationIdentifier={process.env.NEXT_PUBLIC_NOVU_APP_ID as string}
    // subscriberId={getSubscriberId()} // Uncomment this line to enable subscriberId
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
  generateNextJsComponent
}; 