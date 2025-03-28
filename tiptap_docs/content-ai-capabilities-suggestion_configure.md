---
title: Configure AI Suggestion | Tiptap AI Suggestion
source_url: https://tiptap.dev/docs/content-ai/capabilities/suggestion/configure#page-title
og:description: Configure the AI Suggestion extension with rules, initial suggestions, and custom styles.
og:locale: en_US
twitter:title: Configure AI Suggestion | Tiptap AI Suggestion
og:image: https://tiptap.dev/docs/api/og?title=AI%20Suggestion%20extension%20configuration%20options&category=Content%20AI
docsearch:version: 2.x
twitter:card: summary_large_image
twitter:image: https://tiptap.dev/docs/api/og?title=AI%20Suggestion%20extension%20configuration%20options&category=Content%20AI
ogDescription: Configure the AI Suggestion extension with rules, initial suggestions, and custom styles.
ogLocale: en_US
og:image:width: 1200
og:title: Configure AI Suggestion | Tiptap AI Suggestion
ogUrl: https://tiptap.dev/docs/content-ai/capabilities/suggestion/configure
ogTitle: Configure AI Suggestion | Tiptap AI Suggestion
ogImage: https://tiptap.dev/docs/api/og?title=AI%20Suggestion%20extension%20configuration%20options&category=Content%20AI
robots: index, follow
og:url: https://tiptap.dev/docs/content-ai/capabilities/suggestion/configure
og:image:height: 630
og:type: website
viewport: width=device-width, initial-scale=1
language: en
description: Configure the AI Suggestion extension with rules, initial suggestions, and custom styles.
twitter:description: Configure the AI Suggestion extension with rules, initial suggestions, and custom styles.
favicon: https://tiptap.dev/docs/favicon.png
scrapeId: 8e74f290-f34f-4e3d-b44b-90e5782a5741
sourceURL: https://tiptap.dev/docs/content-ai/capabilities/suggestion/configure#page-title
url: https://tiptap.dev/docs/content-ai/capabilities/suggestion/configure#page-title
statusCode: 200
---

The AI Suggestion extension for Tiptap accepts different settings to configure the global behavior of the extension and the commands.

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/configure#rules)
Rules
------------------------------------------------------------------------------------

An array of rules to be applied during proofreading. Each rule contains

*   A unique `id`
*   The `prompt` property, a text that will be read by the AI model to generate suggestions
*   Parameters that decide how the rule is displayed in the UI, like `title`, `color` and `backgroundColor`

You can change the rules at any time without having to reload the editor, by using the `setAiSuggestionRules` command

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
    

You can learn more about rules in this guide: [Define rules](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/define-rules)

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/configure#initial-suggestions)
Initial Suggestions
----------------------------------------------------------------------------------------------------------------

An array of initial suggestions to display before any proofreading is done. This can be used as a performance optimization to avoid waiting for the first suggestions to be generated.

    export const suggestions: Suggestion[] = [\
      {\
        id: '1',\
        deleteRange: { from: 1, to: 5 },\
        deleteText: 'Mistaek',\
        replacementOptions: [\
          {\
            id: '1',\
            addText: 'Mistake',\
          },\
        ],\
        rule: {\
          id: '1',\
          title: 'Spell Check',\
          prompt: 'Identify and correct any spelling mistakes',\
          color: '#DC143C',\
          backgroundColor: 'FFE6E6',\
        },\
        isRejected: false,\
      },\
    ]
    
    AiSuggestion.configure({
      initialSuggestions: suggestions,
    })
    

To learn more about the data that a suggestion object should contain, check the [API reference](https://tiptap.dev/docs/content-ai/capabilities/suggestion/api-reference#proofreading-suggestions)
.

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/configure#custom-suggestion-styles)
Custom Suggestion Styles
--------------------------------------------------------------------------------------------------------------------------

The `getCustomSuggestionDecoration` function allows you to control the appearance of suggestions and provide visual cues to the user. You can add custom CSS classes to the suggestions, and add custom elements before and after them. This is useful for adding popovers, tooltips, icons, or other elements to the suggestions.

The custom styles and elements are implemented with the [Prosemirror Decorations API](https://prosemirror.net/docs/ref/#view.Decorations)
.

To learn how to show a popover when you select a suggestion, follow [this guide](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/display-suggestions#show-a-popover-when-you-select-a-suggestion)
.

    AiSuggestion.configure({
      getCustomSuggestionDecoration({ suggestion, isSelected, getDefaultDecorations }) {
        // You can combine the default decorations of the AI Suggestion extension with your custom ones
        const decorations = getDefaultDecorations()
    
        // Add a custom element before the suggestion text
        Decoration.widget(suggestion.deleteRange.from, () => {
          const element = document.createElement('span')
          element.textContent = '⚠️'
          return element
        })
        return decorations
      },
    })
    

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/configure#customize-when-to-load-suggestions)
Customize When to Load Suggestions
----------------------------------------------------------------------------------------------------------------------------------------------

By default, the AI Suggestion extension will automatically load suggestions when the editor is ready. You can disable this behavior with the `loadOnStart` option

    AiSuggestion.configure({
      loadOnStart: false,
    })
    

By default, the AI Suggestion extension will reload suggestions when the editor's content changes. You can disable this behavior with the `reloadOnUpdate` option.

    AiSuggestion.configure({
      reloadOnUpdate: false,
    })
    

You can learn to configure when to load suggestions in [this guide](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/configure-when-to-load-suggestions)
.

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/configure#customize-the-debounce-timeout)
Customize the Debounce Timeout
--------------------------------------------------------------------------------------------------------------------------------------

By default, the AI Suggestion extension will wait 800ms after the user stops typing to reload suggestions. This prevents the API from being called too frequently. You can configure this timeout with the `debounceTimeout` option.

    AiSuggestion.configure({
      debounceTimeout: 1000,
    })
    

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/configure#handle-errors-when-loading-suggestions)
Handle Errors When Loading Suggestions
------------------------------------------------------------------------------------------------------------------------------------------------------

You can provide a callback for handling errors when loading suggestions. This allows you to log errors, display error messages to the user, or take other actions when an error occurs.

A complete guide on how to handle loading and error states in the UI can be found here:

    AiSuggestion.configure({
      onLoadSuggestionsError(error) {
        console.error('An error occurred while loading suggestions', error)
      },
    })
    

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/configure#tiptap-content-ai-cloud-options)
Tiptap Content AI Cloud Options
----------------------------------------------------------------------------------------------------------------------------------------

If you do not [provide your own backend](https://tiptap.dev/docs/content-ai/capabilities/suggestion/custom-llms)
, the AI Suggestion extension will use the Tiptap Content AI cloud to generate suggestions.

You can configure the OpenAI model to use for generating suggestions with the `model` option. The default model is `gpt-4o-mini`. We recommend it for most use cases, as it provides a good balance between speed, cost and accuracy.

    AiSuggestion.configure({
      // Your Tiptap Content AI app id
      appId: 'APP_ID_HERE',
      // This needs to be your generated JWT and MUST NOT be the OpenAI API key!
      token: 'YOUR_TOKEN',
      // The model to use for generating suggestions. Defaults to "gpt-4o-mini"
      model: 'gpt-4o',
    })
    

We currently support these OpenAI models:

*   `gpt-4o`
*   `gpt-4o-mini`

We will add support for more models in the next versions.

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/configure#integrate-your-own-backend-and-llms)
Integrate Your Own Backend and LLMs
------------------------------------------------------------------------------------------------------------------------------------------------

If you want to use your own backend and LLMs to generate suggestions, you can provide a custom `resolver` function. This function should return an array of suggestions based on the editor's content and rules.

You will find a more comprehensive guide on how to integrate your own backend and LLMs [in this guide](https://tiptap.dev/docs/content-ai/capabilities/suggestion/custom-llms)
.

    AiSuggestion.configure({
      resolver: async ({ content, rules }) => {
        // Your custom logic to generate suggestions
        return suggestions
      },
    })