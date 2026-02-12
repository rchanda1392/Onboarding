import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import preact from '@astrojs/preact';

export default defineConfig({
  site: 'https://rchanda1392.github.io',
  base: '/Onboarding',
  integrations: [
    preact(),
    starlight({
      title: 'Onboarding Resources',
      description: 'A study plan for Product Managers joining Google\'s Core Data team',
      head: [
        {
          tag: 'script',
          attrs: { type: 'module', src: '/Onboarding/chat-loader.js' },
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
            { label: 'Module 4: AI-First Product Strategy', link: '/module-4-ai-first-strategy/' },
            { label: 'Module 5: AI + Data Observability', link: '/module-5-ai-observability/' },
            { label: 'Module 6: Developer Experience & IDE', link: '/module-6-developer-experience/' },
          ],
        },
        { label: 'Glossary', link: '/glossary/' },
      ],
    }),
  ],
});
