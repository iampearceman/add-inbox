export const FRAMEWORKS = {
  NEXTJS: 'nextjs',
  REACT: 'react'
} as const;

export type FrameworkType = typeof FRAMEWORKS[keyof typeof FRAMEWORKS];

export const PACKAGE_MANAGERS = {
  NPM: 'npm',
  YARN: 'yarn',
  PNPM: 'pnpm'
} as const;

export type PackageManagerType = typeof PACKAGE_MANAGERS[keyof typeof PACKAGE_MANAGERS];

export const ENV_VARIABLES = {
  NEXTJS: {
    APP_ID: 'NEXT_PUBLIC_NOVU_APP_ID'
  },
  REACT: {
    APP_ID: 'VITE_NOVU_APP_ID'
  }
} as const;

module.exports = {
  FRAMEWORKS,
  PACKAGE_MANAGERS,
  ENV_VARIABLES
}; 