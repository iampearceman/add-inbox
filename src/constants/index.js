const FRAMEWORKS = {
  NEXTJS: 'nextjs',
  REACT: 'react'
};

const PACKAGE_MANAGERS = {
  NPM: 'npm',
  YARN: 'yarn',
  PNPM: 'pnpm'
};

const AUTH_PROVIDERS = {
  NEXTAUTH: 'nextauth',
  SUPABASE: 'supabase',
  AUTH0: 'auth0',
  CLERK: 'clerk'
};

const ENV_VARIABLES = {
  NEXTJS: {
    APP_ID: 'NEXT_PUBLIC_NOVU_APP_ID'
  },
  REACT: {
    APP_ID: 'VITE_NOVU_APP_ID'
  }
};

module.exports = {
  FRAMEWORKS,
  PACKAGE_MANAGERS,
  AUTH_PROVIDERS,
  ENV_VARIABLES
}; 