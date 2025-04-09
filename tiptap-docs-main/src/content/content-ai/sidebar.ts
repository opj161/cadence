import { SidebarConfig } from '@/types'

export const sidebarConfig: SidebarConfig = {
  id: 'content-ai',
  rootHref: '/content-ai/getting-started/overview',
  title: 'Content AI',
  items: [
    {
      href: '/content-ai/getting-started/overview',
      title: 'Getting started',
      type: 'group',
      children: [
        {
          title: 'Overview',
          href: '/content-ai/getting-started/overview',
        },
      ],
    },
    {
      type: 'group',
      href: '/content-ai/capabilities',
      title: 'Capabilities',
      children: [
        {
          title: 'AI Generation',
          tags: ['Pro'],
          href: '/content-ai/capabilities/generation/',
          children: [
            {
              title: 'Overview',
              href: '/content-ai/capabilities/generation/overview',
            },
            {
              title: 'Install',
              href: '/content-ai/capabilities/generation/install',
            },
            {
              title: 'Text generation',
              href: '/content-ai/capabilities/generation/text-generation',
              children: [
                {
                  title: 'Built-in commands',
                  href: '/content-ai/capabilities/generation/text-generation/built-in-commands',
                },
                {
                  title: 'Autocompletion',
                  href: '/content-ai/capabilities/generation/text-generation/autocompletion',
                },
                {
                  title: 'Provide context',
                  href: '/content-ai/capabilities/generation/text-generation/provide-context',
                },
                {
                  title: 'Formatted responses',
                  href: '/content-ai/capabilities/generation/text-generation/format',
                },
                {
                  title: 'Manage responses',
                  href: '/content-ai/capabilities/generation/text-generation/manage-responses',
                },
                {
                  title: 'Custom commands',
                  href: '/content-ai/capabilities/generation/text-generation/custom-commands',
                },
                {
                  title: 'Stream content (Advanced)',
                  href: '/content-ai/capabilities/generation/text-generation/stream',
                },
              ],
            },
            {
              title: 'Image generation',
              href: '/content-ai/capabilities/generation/image-generation',
            },
            {
              title: 'Integrate your LLM',
              href: '/content-ai/capabilities/generation/custom-llms',
            },
            {
              title: 'Configure',
              href: '/content-ai/capabilities/generation/configure',
            },
          ],
        },
        {
          title: 'AI Suggestion',
          href: '/content-ai/capabilities/suggestion',
          tags: ['Pro', 'Beta'],
          children: [
            {
              title: 'Overview',
              href: '/content-ai/capabilities/suggestion/overview',
            },
            {
              title: 'Install',
              href: '/content-ai/capabilities/suggestion/install',
            },
            {
              title: 'Features',
              href: '/content-ai/capabilities/suggestion/features',
              children: [
                {
                  title: 'Define rules',
                  href: '/content-ai/capabilities/suggestion/features/define-rules',
                },
                {
                  title: 'Configure when to load suggestions',
                  href: '/content-ai/capabilities/suggestion/features/configure-when-to-load-suggestions',
                },
                {
                  title: 'Display suggestions',
                  href: '/content-ai/capabilities/suggestion/features/display-suggestions',
                },
                {
                  title: 'Apply and reject suggestions',
                  href: '/content-ai/capabilities/suggestion/features/apply-suggestions',
                },
                {
                  title: 'Lock content',
                  href: '/content-ai/capabilities/suggestion/features/lock-content',
                },
                {
                  title: 'Provide LLM Context',
                  href: '/content-ai/capabilities/suggestion/features/provide-llm-context',
                },
              ],
            },
            {
              title: 'Use with Content AI Cloud',
              href: '/content-ai/capabilities/suggestion/use-with-content-ai-cloud',
            },
            {
              title: 'Integrate your LLM',
              href: '/content-ai/capabilities/suggestion/custom-llms',
            },
            {
              title: 'Configure',
              href: '/content-ai/capabilities/suggestion/configure',
            },
            {
              title: 'API Reference',
              href: '/content-ai/capabilities/suggestion/api-reference',
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      href: '',
      title: 'Examples',
      children: [
        {
          title: 'Text Generation',
          isActive: false,
          href: '/content-ai/capabilities/generation/overview',
        },
        {
          title: 'Autocomplete',
          isActive: false,
          href: '/content-ai/capabilities/generation/text-generation/autocompletion',
        },
        {
          title: 'AI Suggestions',
          isActive: false,
          href: '/content-ai/capabilities/suggestion/overview',
        },
        {
          title: 'Starter templates',
          href: 'https://tiptap.dev/product/templates',
        },
      ],
    },
    {
      type: 'group',
      href: '/content-ai/custom-llms',
      title: 'Custom LLMs',
      children: [
        {
          title: 'Integrate your LLM',
          href: '/content-ai/custom-llms',
        },
      ],
    },
    {
      type: 'group',
      href: '/content-ai/resources',
      title: 'Resources',
      children: [
        {
          title: 'Privacy',
          href: '/content-ai/resources/privacy',
        },
      ],
    },
  ],
}
