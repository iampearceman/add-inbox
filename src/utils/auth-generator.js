const { AUTH_PROVIDERS } = require('../constants');

function generateAuthProviderCode(detectedProviders, framework) {
  const hasProviders = detectedProviders.length > 0;
  
  // Generate imports based on detected providers
  const imports = [];
  if (detectedProviders.includes(AUTH_PROVIDERS.NEXTAUTH)) {
    imports.push("import { useSession } from 'next-auth/react';");
  }
  if (detectedProviders.includes(AUTH_PROVIDERS.SUPABASE)) {
    imports.push("import { useSupabaseClient } from '@supabase/auth-helpers-react';");
  }
  if (detectedProviders.includes(AUTH_PROVIDERS.AUTH0)) {
    imports.push("import { useAuth0 } from '@auth0/auth0-react';");
  }
  if (detectedProviders.includes(AUTH_PROVIDERS.CLERK)) {
    imports.push("import { useUser } from '@clerk/clerk-react';");
  }

  // Generate the getSubscriberId implementation
  const getSubscriberIdImplementation = hasProviders ? `
  // Detected auth providers: ${detectedProviders.join(', ')}
  ${detectedProviders.includes(AUTH_PROVIDERS.NEXTAUTH) ? `
  // NextAuth.js implementation
  const { data: session } = useSession();
  if (session?.user?.id) return session.user.id;` : ''}
  ${detectedProviders.includes(AUTH_PROVIDERS.SUPABASE) ? `
  // Supabase implementation
  const { user } = useSupabaseClient();
  if (user?.id) return user.id;` : ''}
  ${detectedProviders.includes(AUTH_PROVIDERS.AUTH0) ? `
  // Auth0 implementation
  const { user } = useAuth0();
  if (user?.sub) return user.sub;` : ''}
  ${detectedProviders.includes(AUTH_PROVIDERS.CLERK) ? `
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
  
  throw new Error('Please implement getSubscriberId based on your auth provider');`;

  return {
    imports,
    getSubscriberIdImplementation
  };
}

module.exports = {
  generateAuthProviderCode
}; 