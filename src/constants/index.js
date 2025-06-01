const FRAMEWORKS = {
  NEXTJS: 'nextjs',
  REACT: 'react'
};

const PACKAGE_MANAGERS = {
  NPM: 'npm',
  YARN: 'yarn',
  PNPM: 'pnpm'
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
  ENV_VARIABLES
}; 