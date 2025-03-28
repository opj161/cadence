---
title: Display Suggestions | Tiptap AI Suggestion
source_url: https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/display-suggestions#page-title
ogUrl: https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/display-suggestions
description: Customize how AI Suggestions are displayed in the editor with custom styles and popovers.
robots: index, follow
og:locale: en_US
ogTitle: Display Suggestions | Tiptap AI Suggestion
twitter:card: summary_large_image
twitter:description: Customize how AI Suggestions are displayed in the editor with custom styles and popovers.
favicon: https://tiptap.dev/docs/favicon.png
ogImage: https://tiptap.dev/docs/api/og?title=Customize%20how%20suggestions%20are%20displayed&category=Content%20AI
og:title: Display Suggestions | Tiptap AI Suggestion
viewport: width=device-width, initial-scale=1
ogLocale: en_US
og:description: Customize how AI Suggestions are displayed in the editor with custom styles and popovers.
docsearch:version: 2.x
og:image: https://tiptap.dev/docs/api/og?title=Customize%20how%20suggestions%20are%20displayed&category=Content%20AI
og:type: website
ogDescription: Customize how AI Suggestions are displayed in the editor with custom styles and popovers.
og:url: https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/display-suggestions
og:image:width: 1200
language: en
twitter:image: https://tiptap.dev/docs/api/og?title=Customize%20how%20suggestions%20are%20displayed&category=Content%20AI
og:image:height: 630
twitter:title: Display Suggestions | Tiptap AI Suggestion
scrapeId: 94d16265-1a68-4c88-86c5-bf7339ea215e
sourceURL: https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/display-suggestions#page-title
url: https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/display-suggestions#page-title
statusCode: 200
---

The AI Suggestion extension is headless and fully customizable. This means that you have full control over how suggestions are displayed in the editor.

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/display-suggestions#show-loadingerror-states-when-loading-suggestions)
Show Loading/Error States When Loading Suggestions
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

You can access the extension's current loading state by reading its extension storage object

    const storage = editor.extensionStorage.aiSuggestion
    if (storage.isLoading) {
      // Show a loading spinner
    } else if (storage.error) {
      // Show an error message.
    }
    

The `storage.error` property will contain the error object that was thrown while loading suggestions. You can use this object to display different error messages depending on the error type.

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/display-suggestions#default-suggestion-styles)
Default Suggestion Styles
-----------------------------------------------------------------------------------------------------------------------------------------------

By default, the AI Suggestion extension will apply the CSS class `tiptap-ai-suggestion` to each suggestion. It will also add a `style` attribute with these color variables: `--tiptap-ai-suggestion-color` and `--tiptap-ai-suggestion-background-color`. The `tiptap-ai-suggestion` class can be used to apply simple styles to the suggestions in the editor.

    .tiptap-ai-suggestion {
      border-bottom: 2px solid var(--tiptap-ai-suggestion-color);
      margin-bottom: -2px;
    }
    

For more advanced styles, use the `getCustomSuggestionDecoration` [configuration option](https://tiptap.dev/docs/content-ai/capabilities/suggestion/configure#custom-suggestion-styles)
.

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/display-suggestions#selected-suggestions)
Selected Suggestions
-------------------------------------------------------------------------------------------------------------------------------------

A suggestion is considered "selected" when the cursor is over it.

You can read the selected suggestion from the extension's storage object

    const storage = editor.extensionStorage.aiSuggestion
    const selectedSuggestion = storage.getSelectedSuggestion()
    

To select a suggestion programmatically, use the `selectAiSuggestion` command.

    editor.commands.selectAiSuggestion(suggestionId)
    

This will move the cursor to the beginning of the suggestion, so that it is considered "selected".

By default, the AI Suggestion extension will apply the CSS class `tiptap-ai-suggestion--selected` to the selected suggestion. This class can be used to style the selected suggestion in the editor.

    .tiptap-ai-suggestion--selected {
      background-color: var(--tiptap-ai-suggestion-background-color);
      transition: background-color 0.5s;
    }
    

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/display-suggestions#customize-the-suggestions-appearance)
Customize the Suggestion's Appearance
----------------------------------------------------------------------------------------------------------------------------------------------------------------------

The `getCustomSuggestionDecoration` option allows you to control the appearance of suggestions and provide visual cues to the user. You can add custom CSS classes to the suggestions, and add custom elements before/after them. This is useful for adding popovers, tooltips, icons, or other elements to the suggestions.

The function Custom suggestion styles are applied using the [Prosemirror Decorations API](https://prosemirror.net/docs/guide/#view.decorations)
.

To learn how to show a popover when you select a suggestion, [follow this guide](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/display-suggestions#show-a-popover-when-you-select-a-suggestion)
.

    AiSuggestion.configure({
      getCustomSuggestionDecoration({ suggestion, isSelected, getDefaultDecorations }) {
        // You can combine the default decorations of the AI Suggestion extension with your custom ones
        const decorations = getDefaultDecorations()
    
        // Add a custom element after the suggestion text
        Decoration.widget(suggestion.deleteRange.to, () => {
          const element = document.createElement('span')
          element.textContent = '⚠️'
          return element
        })
        return decorations
      },
    })
    

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/display-suggestions#show-a-popover-when-you-select-a-suggestion)
Show a Popover When You Select a Suggestion
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

An essential feature of modern AI Suggestions is the ability to show a popover or a tooltip when you select a suggestion. This popover usually provides extra information about the suggestion, and allows the user to accept or reject it.

To show a popover when you select a suggestion, you need to use the `getCustomSuggestionDecoration` option. This function allows you to add custom elements to the suggestions, including popovers.

Below is a simplified example on how to do it with the React UI library.

    // First, define a hook to store the HTML element where the popover will be rendered
    const [popoverElement, setPopoverElement] = useState<HTMLElement | null>(null)
    
    AiSuggestion.configure({
      getCustomSuggestionDecoration({ suggestion, isSelected, getDefaultDecorations }) {
        const decorations = getDefaultDecorations()
    
        // Then, create a Prosemirror decoration that contains the HTML element
        Decoration.widget(suggestion.deleteRange.to, () => {
          const element = document.createElement('span')
    
          return element
        })
        return decorations
      },
    })
    
    // Then, add the content to the custom element. In this example, we use React Portals to render the popover inside the editor.
    if (popoverElement) {
      ReactDOM.createPortal(<Popover suggestion={editor.selectedSuggestion} />, popoverElement)
    }
    

We recommend using the [Floating UI](https://floating-ui.com/)
 library to display the popover. You can see an example on how to do it [in the demo](https://tiptap.dev/docs/content-ai/capabilities/suggestion/overview)
.

When you render the suggestion in the popover, you might want to show the previous and next words of the sentence to give the user more context. We've created the `getNextWord` and `getPreviousWord` utility functions so that you don’t have to implement them yourself. You can import them from the `@tiptap-pro/extension-ai-suggestion` library.

    import { getNextWord, getPreviousWord } from '@tiptap-pro/extension-ai-suggestion'
    
    // Get the previous word in the sentence.
    const { previousWord } = getPreviousWord(editor, suggestion.deleteRange.from)
    // Get the next word in the sentence and the punctuation mark that follows it, if it's the end of the sentence.
    const { nextWord, punctuationMark } = getNextWord(editor, suggestion.deleteRange.to)
    

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/display-suggestions#display-suggestions-in-a-sidebar-outside-the-editor)
Display Suggestions in a Sidebar Outside the Editor
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

You can access the current suggestions from the extension's [storage object](https://tiptap.dev/docs/content-ai/capabilities/suggestion/api-reference#extension-storage)
.

    const storage = editor.extensionStorage.aiSuggestion
    const suggestions = storage.getSuggestions()
    

Then, you can use this data to render suggestions in the UI, outside the editor. Here is an example of how to do it with the React UI library

    // Get the suggestions from the Editor state.
    const storage = editor.extensionStorage.aiSuggestion
    const suggestions = storage.getSuggestions()
    
    // Render the suggestions in the UI
    return (
      <div>
        {suggestions.map((suggestion) => (
          <div key={suggestion.id}>
            <p>{suggestion.deleteText}</p>
            <ul>
              {suggestion.replacementOptions.map((option) => (
                <li key={option.id}>{option.addText}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    )
    

On this page

[Introduction](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/display-suggestions#page-title)
[Show Loading/Error States When Loading Suggestions](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/display-suggestions#show-loadingerror-states-when-loading-suggestions)
 [Default Suggestion Styles](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/display-suggestions#default-suggestion-styles)
 [Selected Suggestions](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/display-suggestions#selected-suggestions)
 [Customize the Suggestion's Appearance](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/display-suggestions#customize-the-suggestions-appearance)
 [Show a Popover When You Select a Suggestion](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/display-suggestions#show-a-popover-when-you-select-a-suggestion)
 [Display Suggestions in a Sidebar Outside the Editor](https://tiptap.dev/docs/content-ai/capabilities/suggestion/features/display-suggestions#display-suggestions-in-a-sidebar-outside-the-editor)