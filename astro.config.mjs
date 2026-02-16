import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import preact from '@astrojs/preact';

const base = process.env.ASTRO_BASE || '/Onboarding';

export default defineConfig({
  site: process.env.ASTRO_SITE || 'https://rchanda1392.github.io',
  base,
  integrations: [
    preact(),
    starlight({
      title: 'Onboarding Guide',
      customCss: ['./src/styles/custom.css'],
      description: 'A study plan for Product Managers joining Google\'s Core Data team',
      head: [
        {
          tag: 'script',
          attrs: { type: 'module', src: `${base === '/' ? '' : base}/chat-loader.js` },
        },
      ],
      sidebar: [
        { label: 'Dashboard', link: '/' },
        {
          label: 'Study Modules',
          items: [
            { label: 'Module 1: Data Pipelines & Observability', link: '/module-1-pipelines-and-observability/' },
            { label: 'Module 2: Industry Landscape', link: '/module-2-industry-landscape/' },
            { label: 'Module 3: Google\'s Data Ecosystem', link: '/module-3-google-ecosystem/' },
            { label: 'Module 4: ML/AI Infrastructure', link: '/module-4-ml-ai-infrastructure/' },
            { label: 'Module 5: AI-First Product Strategy', link: '/module-5-ai-first-strategy/' },
            { label: 'Module 6: AI + Data Observability', link: '/module-6-ai-observability/' },
            { label: 'Module 7: Developer Experience & IDE', link: '/module-7-developer-experience/' },
          ],
        },
        { label: 'Glossary', link: '/glossary/' },
      ],
    }),
  ],
});
