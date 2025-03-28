---
title: Apply Suggestions | Tiptap AI Suggestion
source_url: https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/apply-suggestions#page-title
language: en
favicon: https://tiptap.dev/docs/favicon.png
og:description: Learn how to apply, reject, and highlight AI Suggestions in your Tiptap editor. More in the docs!
og:locale: en_US
twitter:description: Learn how to apply, reject, and highlight AI Suggestions in your Tiptap editor. More in the docs!
ogDescription: Learn how to apply, reject, and highlight AI Suggestions in your Tiptap editor. More in the docs!
og:image:width: 1200
og:image:height: 630
twitter:image: https://tiptap.dev/docs/api/og?title=Apply%20suggestions%20to%20the%20editor%27s%20content&category=Content%20AI
docsearch:version: 2.x
ogImage: https://tiptap.dev/docs/api/og?title=Apply%20suggestions%20to%20the%20editor%27s%20content&category=Content%20AI
twitter:title: Apply Suggestions | Tiptap AI Suggestion
og:image: https://tiptap.dev/docs/api/og?title=Apply%20suggestions%20to%20the%20editor%27s%20content&category=Content%20AI
og:type: website
og:url: https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/apply-suggestions
viewport: width=device-width, initial-scale=1
ogUrl: https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/apply-suggestions
description: Learn how to apply, reject, and highlight AI Suggestions in your Tiptap editor. More in the docs!
robots: index, follow
twitter:card: summary_large_image
ogTitle: Apply Suggestions | Tiptap AI Suggestion
og:title: Apply Suggestions | Tiptap AI Suggestion
ogLocale: en_US
scrapeId: 537f5904-2aec-4f08-8520-ae5a2c43a582
sourceURL: https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/apply-suggestions#page-title
url: https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/apply-suggestions#page-title
statusCode: 200
---

The AI Suggestion extension provides commands to apply suggestions to the editor's content. These commands allow you to accept or reject suggestions, and apply them to the editor's content.

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/apply-suggestions#apply-a-single-suggestion)
Apply a Single Suggestion
---------------------------------------------------------------------------------------------------------------------------------------------

To apply a suggestion to the editor's content, use the `applyAiSuggestion` command.

A suggestion can have multiple replacement options. To apply a specific replacement option, provide the `replacementOptionId` property. If you do not provide this property, the first replacement option will be applied.

Note: if you use the Tiptap Content AI Cloud API to generate suggestions, there will be only one replacement option per suggestion. However, if you use your own backend and LLMs, you can provide multiple replacement options.

You can customize the format of the replacement text by providing the `format` property. The default format is "plain-text". If you want the replacement text to be formatted as rich text, use the "rich-text" format. This is useful when the suggestion modifies the styles, such as bold or italic formatting.

    editor.commands.applyAiSuggestion({
      suggestionId: '1',
      replacementOptionId: '1',
      format: 'plain-text',
    })
    

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/apply-suggestions#apply-all-suggestions)
Apply All Suggestions
-------------------------------------------------------------------------------------------------------------------------------------

To apply all suggestions at once, use the `applyAllAiSuggestions` command.

    editor.commands.applyAllAiSuggestions()
    

This will apply the first replacement option of each suggestion to the editor's content.

If some suggestions overlap with each other, the AI Suggestion extension will automatically resolve the conflicts by ignoring the overlapping suggestions that are applied later. This is usually not a problem, as the suggestions are reloaded after each change, and the AI Suggestion extension will generate new suggestions based on the updated content.

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/apply-suggestions#reject-a-suggestion)
Reject a Suggestion
---------------------------------------------------------------------------------------------------------------------------------

You can reject a suggestion by using the `rejectAiSuggestion` command.

    editor.commands.rejectAiSuggestion('suggestionId')
    

When you reject a suggestion, it will not be displayed in the editor anymore. However, it will still be stored in the extension's storage object so you can retrieve it by calling `storage.getSuggestions()`. You can check if a suggestion is rejected by reading the `isRejected` property.

You can access the list of rejected suggestions by calling `storage.getRejections()`.

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/apply-suggestions#highlight-replaced-text-after-applying-a-suggestion)
Highlight Replaced Text After Applying a Suggestion
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

To highlight or add any mark to the text that was replaced by a suggestion, you can chain the `applyAiSuggestion` command with a command that sets the mark to the suggestion's range.

    editor
      .chain()
      // Apply suggestion
      .applyAiSuggestion({
        suggestionId: suggestion.id,
        replacementOptionId: option.id,
      })
      // Select the changed text
      .command(({ tr, commands }) => {
        // We need to map the positions of the change text, because they might have changed when applying the suggestion
        return commands.setTextSelection({
          from: tr.mapping.map(suggestion.deleteRange.from),
          to: tr.mapping.map(suggestion.deleteRange.to),
        })
      })
      // Apply styles to changed text. For example, bold styles
      .setBold()
      // Set the cursor at the end of the changed text.
      .command(({ tr, commands }) => {
        return commands.setTextSelection(tr.mapping.map(suggestion.deleteRange.to))
      })
      .focus()
      .run()
    

On this page

[Introduction](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/apply-suggestions#page-title)
[Apply a Single Suggestion](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/apply-suggestions#apply-a-single-suggestion)
 [Apply All Suggestions](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/apply-suggestions#apply-all-suggestions)
 [Reject a Suggestion](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/apply-suggestions#reject-a-suggestion)
 [Highlight Replaced Text After Applying a Suggestion](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/apply-suggestions#highlight-replaced-text-after-applying-a-suggestion)