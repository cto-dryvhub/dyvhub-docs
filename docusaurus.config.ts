import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// Runs in Node.js — no browser APIs here.

const config: Config = {
  title: 'DryvHub Guide',
  tagline: 'How DryvHub Dealer and DryvHub Marketplace work — for executives, teams, and developers.',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: process.env.DOCS_SITE_URL ?? 'http://localhost:3000',
  baseUrl: process.env.DOCS_BASE_URL ?? '/',

  onBrokenLinks: 'throw',
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  themes: [
    '@docusaurus/theme-mermaid',
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        indexBlog: false,
        docsRouteBasePath: '/docs',
        highlightSearchTermsOnTargetPage: true,
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          showLastUpdateTime: false,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'DryvHub Guide',
      logo: {
        alt: 'DryvHub',
        src: 'img/logo.svg',
      },
      items: [
        {type: 'docSidebar', sidebarId: 'startSidebar', position: 'left', label: 'Start here'},
        {type: 'docSidebar', sidebarId: 'executiveSidebar', position: 'left', label: 'For executives'},
        {type: 'docSidebar', sidebarId: 'dealerSidebar', position: 'left', label: 'Dealer app'},
        {type: 'docSidebar', sidebarId: 'marketplaceSidebar', position: 'left', label: 'Marketplace'},
        {type: 'docSidebar', sidebarId: 'developerSidebar', position: 'left', label: 'For developers'},
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Guides',
          items: [
            {label: 'Start here', to: '/docs/start/welcome'},
            {label: 'Executive overview', to: '/docs/executive/overview'},
            {label: 'Glossary', to: '/docs/start/glossary'},
          ],
        },
        {
          title: 'Products',
          items: [
            {label: 'Dealer app', to: '/docs/dealer/overview'},
            {label: 'Marketplace', to: '/docs/marketplace/overview'},
          ],
        },
        {
          title: 'Engineering',
          items: [
            {label: 'Architecture', to: '/docs/developers/architecture'},
            {label: 'Local setup', to: '/docs/developers/local-setup'},
          ],
        },
      ],
      copyright: `Internal use only. © ${new Date().getFullYear()} DryvHub.`,
    },
    mermaid: {
      theme: {light: 'neutral', dark: 'dark'},
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'typescript'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
