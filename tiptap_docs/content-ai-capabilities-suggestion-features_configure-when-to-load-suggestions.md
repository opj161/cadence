---
title: Load Suggestions | Tiptap AI Suggestion
source_url: https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/configure-when-to-load-suggestions#page-title
ogDescription: Customize when the AI Suggestion extension loads suggestions with options like loadOnStart and reloadOnUpdate.
viewport: width=device-width, initial-scale=1
description: Customize when the AI Suggestion extension loads suggestions with options like loadOnStart and reloadOnUpdate.
og:image:width: 1200
language: en
og:image: https://tiptap.dev/docs/api/og?title=Configure%20when%20to%20load%20suggestions&category=Content%20AI
twitter:description: Customize when the AI Suggestion extension loads suggestions with options like loadOnStart and reloadOnUpdate.
og:description: Customize when the AI Suggestion extension loads suggestions with options like loadOnStart and reloadOnUpdate.
twitter:title: Load Suggestions | Tiptap AI Suggestion
ogUrl: https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/configure-when-to-load-suggestions
robots: index, follow
og:title: Load Suggestions | Tiptap AI Suggestion
og:image:height: 630
og:type: website
twitter:image: https://tiptap.dev/docs/api/og?title=Configure%20when%20to%20load%20suggestions&category=Content%20AI
docsearch:version: 2.x
og:url: https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/configure-when-to-load-suggestions
ogLocale: en_US
twitter:card: summary_large_image
ogImage: https://tiptap.dev/docs/api/og?title=Configure%20when%20to%20load%20suggestions&category=Content%20AI
ogTitle: Load Suggestions | Tiptap AI Suggestion
og:locale: en_US
favicon: https://tiptap.dev/docs/favicon.png
scrapeId: 264cad8a-1968-4269-8511-f8ee48dc848b
sourceURL: https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/configure-when-to-load-suggestions#page-title
url: https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/configure-when-to-load-suggestions#page-title
statusCode: 200
---

You can customize when the AI Suggestion extension calls the LLM to generate suggestions. This allows you to control when new suggestions are loaded, and how often they are reloaded.

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/configure-when-to-load-suggestions#load-suggestions-on-start)
Load Suggestions on Start
--------------------------------------------------------------------------------------------------------------------------------------------------------------

By default, the AI Suggestion extension will automatically load suggestions when the editor is ready. You can disable this behavior with the `loadOnStart` option.

    AiSuggestion.configure({
      // Disable automatic loading of suggestions
      loadOnStart: false,
    })
    

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/configure-when-to-load-suggestions#reload-suggestions-on-content-update)
Reload Suggestions on Content Update
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

By default, the AI Suggestion extension will reload suggestions when the editor's content changes. You can disable this behavior with the `reloadOnUpdate` option.

    AiSuggestion.configure({
      // Disable automatic loading of suggestions
      reloadOnUpdate: false,
    })
    

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/configure-when-to-load-suggestions#debounce-timeout)
Debounce Timeout
--------------------------------------------------------------------------------------------------------------------------------------------

By default, the AI Suggestion extension will wait 800 milliseconds after the user stops typing to reload suggestions. This prevents the API from being called too frequently. You can configure this timeout with the `debounceTimeout` option.

    AiSuggestion.configure({
      debounceTimeout: 1000,
    })
    

However, there are cases where you may want to force suggestions to reload. For example, you may want to reload suggestions when the user clicks a "refresh" button.

To reload suggestions manually, use the `loadAiSuggestions` command.

    editor.commands.loadAiSuggestions()
    

To load suggestions after a delay, use the `loadAiSuggestionsDebounced` command. The delay is determined by the `debounceTimeout` option.

This command is used internally to reload the suggestions after the editor content changes (for example, when the user types on the editor). The function is debounced so that, if called multiple times within the debounce timeout, only the last call will be executed.

    editor.commands.loadAiSuggestionsDebounced()
    

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/configure-when-to-load-suggestions#set-suggestions-programmatically)
Set Suggestions Programmatically
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

If you want to set the suggestions to a certain value, without loading them with the configured API, you can use the `setAiSuggestions` command. This is useful in the following scenarios:

*   When you have a list of suggestions that you want to display immediately.
*   When you want to clear the suggestions.
*   When you want to display suggestions from a different source than the API you configured in the extension's options.

    editor.commands.setAiSuggestions(suggestions)
    

To learn more about the data that a suggestion object should contain, check the [API reference](https://tiptap.dev/docs/content-ai/capabilities/suggestion/api-reference#proofreading-suggestions)
.

On this page

[Introduction](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/configure-when-to-load-suggestions#page-title)
[Load Suggestions on Start](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/configure-when-to-load-suggestions#load-suggestions-on-start)
 [Reload Suggestions on Content Update](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/configure-when-to-load-suggestions#reload-suggestions-on-content-update)
 [Debounce Timeout](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/configure-when-to-load-suggestions#debounce-timeout)
 [Set Suggestions Programmatically](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/configure-when-to-load-suggestions#set-suggestions-programmatically)