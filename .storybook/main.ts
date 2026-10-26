import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  stories: ['../components/**/*.mdx', '../components/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  core: { disableTelemetry: true },
  framework: { name: '@storybook/nextjs-vite', options: {} },
};

export default config;
