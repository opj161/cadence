---
title: Define Rules | Tiptap AI Suggestion
source_url: https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/define-rules#page-title
ogUrl: https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/define-rules
robots: index, follow
docsearch:version: 2.x
og:url: https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/define-rules
og:title: Define Rules | Tiptap AI Suggestion
viewport: width=device-width, initial-scale=1
ogDescription: Configure the AI Suggestion extension with a list of rules to generate suggestions.
ogTitle: Define Rules | Tiptap AI Suggestion
favicon: https://tiptap.dev/docs/favicon.png
og:image: https://tiptap.dev/docs/api/og?title=Define%20rules%20for%20the%20AI%20Suggestion%20extension&category=Content%20AI
og:type: website
og:image:height: 630
twitter:card: summary_large_image
ogImage: https://tiptap.dev/docs/api/og?title=Define%20rules%20for%20the%20AI%20Suggestion%20extension&category=Content%20AI
og:image:width: 1200
twitter:title: Define Rules | Tiptap AI Suggestion
twitter:image: https://tiptap.dev/docs/api/og?title=Define%20rules%20for%20the%20AI%20Suggestion%20extension&category=Content%20AI
twitter:description: Configure the AI Suggestion extension with a list of rules to generate suggestions.
ogLocale: en_US
og:locale: en_US
description: Configure the AI Suggestion extension with a list of rules to generate suggestions.
og:description: Configure the AI Suggestion extension with a list of rules to generate suggestions.
language: en
scrapeId: debca113-ca0e-4297-9c5c-df7153a746b0
sourceURL: https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/define-rules#page-title
url: https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/define-rules#page-title
statusCode: 200
---

The AI Suggestion extension must be configured with a list of rules to help the LLM analyze the editor's content and generate suggestions.

    AiSuggestion.configure({
      rules: [\
        {\
          id: '1',\
          title: 'Spell Check',\
          prompt: 'Identify and correct any spelling mistakes',\
          color: '#DC143C',\
          backgroundColor: 'FFE6E6',\
        },\
      ],
    })
    

Each suggestion is associated with a rule. If no rules are provided, the AI Suggestion extension will not generate any suggestions.

Each rule must have a unique string id, so that each suggestion can be matched with its corresponding rule.

The prompt property is a string that describes the rule. It is provided to the AI model to help it generate suggestions.

Only the id and the prompt are sent to the AI model. The title, color and backgroundColor properties are used to style and display the suggestions in the editor.

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/define-rules#are-rules-stored-in-tiptap-cloud)
Are Rules Stored in Tiptap Cloud?
-------------------------------------------------------------------------------------------------------------------------------------------------------

If you use Tiptap Content AI Cloud to generate suggestions for your content, rules are not stored in the cloud. They are sent on each request.

Because we do not store your rules, you can change them at any time and enable them based on your own application-specific logic. For example, you can have rules that apply to all documents, document-specific rules, rules that apply to certain users, or even have the user define their own rules.

If you want rules to persist across sessions, you should store them in your own database.

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/define-rules#how-to-change-rules-after-the-editor-is-loaded)
How to Change Rules After the Editor Is Loaded
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

You can change the rules at any time without having to reload the editor. Use the `setAiSuggestionRules` command to update the rules.

    const newRules = [\
      {\
        id: '2',\
        title: 'Grammar Check',\
        prompt: 'Identify and correct any grammar mistakes',\
        color: '#FFA500',\
        backgroundColor: 'FFF5E6',\
      },\
    ]
    
    editor.commmands.setAiSuggestionRules(newRules)
    

Warning: the `setAiSuggestionRules` command will not automatically reload the suggestions. You need to call the `loadAiSuggestions` command to update the suggestions based on the new rules. A common pattern is to chain the two commands together.

    editor.chain().setAiSuggestionRules(newRules).loadAiSuggestions().run()
    

On this page

[Introduction](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/define-rules#page-title)
[Are Rules Stored in Tiptap Cloud?](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/define-rules#are-rules-stored-in-tiptap-cloud)
 [How to Change Rules After the Editor Is Loaded](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/define-rules#how-to-change-rules-after-the-editor-is-loaded)