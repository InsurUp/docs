import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'InsurUp Docs',
  favicon: 'img/logo.svg',
  url: 'https://docs.insurup.com',
  baseUrl: '/',
  organizationName: 'insurup',
  projectName: 'docs',
  onBrokenLinks: 'throw',
  trailingSlash: false,
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'tr',
    locales: ['tr'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          editUrl: 'https://github.com/InsurUp/docs/blob/main/',
          includeCurrentVersion: false,
          routeBasePath: '/'
        },
        blog: false,
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    algolia: {
      appId: '0I029DQXAX',
      apiKey: '0d6ced51c9a10c943bf0933463d4e2ce',
      indexName: 'insurup',
      contextualSearch: true
    },
    navbar: {
      logo: {
        alt: 'InsurUp Logo',
        src: 'img/logo-light.svg',
        srcDark: 'img/logo-dark.svg',
      },
      items: [
        {
          href: 'https://github.com/insurup/docs',
          label: 'GitHub',
          position: 'right',
        },
        {
          href: 'https://app.insurup.com',
          label: 'InsurUp CRM',
          position: 'right',
        },
        {
          type: 'docsVersionDropdown',
        }
      ],
    },
    // footer: {
    //   style: 'dark',
    //   links: [
    //     {
    //       title: 'Docs',
    //       items: [
    //         {
    //           label: 'Tutorial',
    //           to: '/docs/intro',
    //         },
    //       ],
    //     },
    //     {
    //       title: 'Community',
    //       items: [
    //         {
    //           label: 'Stack Overflow',
    //           href: 'https://stackoverflow.com/questions/tagged/docusaurus',
    //         },
    //         {
    //           label: 'Discord',
    //           href: 'https://discordapp.com/invite/docusaurus',
    //         },
    //         {
    //           label: 'Twitter',
    //           href: 'https://twitter.com/docusaurus',
    //         },
    //       ],
    //     },
    //     {
    //       title: 'More',
    //       items: [
    //         {
    //           label: 'Blog',
    //           to: '/blog',
    //         },
    //         {
    //           label: 'GitHub',
    //           href: 'https://github.com/facebook/docusaurus',
    //         },
    //       ],
    //     },
    //   ],
    //   copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
    // },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    }
  } satisfies Preset.ThemeConfig,
};

export default config;