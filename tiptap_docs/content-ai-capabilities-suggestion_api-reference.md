---
title: API Reference | Tiptap AI Suggestion
source_url: https://tiptap.dev/docs/content-ai/capabilities/suggestion/api-reference#page-title
og:url: https://tiptap.dev/docs/content-ai/capabilities/suggestion/api-reference
twitter:description: API reference for the Tiptap AI Suggestion extension.
ogLocale: en_US
robots: index, follow
og:locale: en_US
og:type: website
twitter:title: API Reference | Tiptap AI Suggestion
language: en
og:image: https://tiptap.dev/docs/api/og?title=AI%20Suggestion%20extension%20API%20reference&category=Content%20AI
favicon: https://tiptap.dev/docs/favicon.png
og:title: API Reference | Tiptap AI Suggestion
twitter:image: https://tiptap.dev/docs/api/og?title=AI%20Suggestion%20extension%20API%20reference&category=Content%20AI
viewport: width=device-width, initial-scale=1
ogTitle: API Reference | Tiptap AI Suggestion
ogImage: https://tiptap.dev/docs/api/og?title=AI%20Suggestion%20extension%20API%20reference&category=Content%20AI
og:description: API reference for the Tiptap AI Suggestion extension.
ogUrl: https://tiptap.dev/docs/content-ai/capabilities/suggestion/api-reference
og:image:width: 1200
docsearch:version: 2.x
og:image:height: 630
description: API reference for the Tiptap AI Suggestion extension.
ogDescription: API reference for the Tiptap AI Suggestion extension.
twitter:card: summary_large_image
scrapeId: 6566ed7a-bbce-4ef2-9e14-34ca49563269
sourceURL: https://tiptap.dev/docs/content-ai/capabilities/suggestion/api-reference#page-title
url: https://tiptap.dev/docs/content-ai/capabilities/suggestion/api-reference#page-title
statusCode: 200
---

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/api-reference#extension-options)
Extension Options
----------------------------------------------------------------------------------------------------------------

    /**
     * Configuration options for the AI Suggestion extension.
     */
    export interface AiSuggestionOptions {
      /** Rules to be applied during proofreading
       * @default []
       */
      rules: AiSuggestionRule[]
      /** Initial suggestions to display before any proofreading is done
       * @default []
       */
      initialSuggestions: Suggestion[]
      /** Initial rejections to apply before any proofreading is done
       * @default []
       */
      initialRejections: AiSuggestionRejection[]
      /** Function to customize the decoration of suggestions in the editor
       * @default `getDefaultDecorations()`
       * @param args - Options for customizing suggestion decorations.
       * @return An array of `Decoration` objects.
       */
      getCustomSuggestionDecoration: (args: GetCustomSuggestionDecorationOptions) => Decoration[]
      /** Time in milliseconds to wait before reloading suggestions after content changes.
       * @default 800
       */
      debounceTimeout: number
      /** Whether to load suggestions when the editor is initialized
       * @default true
       */
      loadOnStart: boolean
      /** Whether to reload suggestions when the editor content changes
       * @default true
       */
      reloadOnUpdate: boolean
      /** Callback for handling errors when loading suggestions
       * @param error - The error that occurred during suggestion loading.
       * @default console.error
       */
      onLoadSuggestionsError: (error: unknown) => void
      /**
       * The AI model used to proofread the content and generate suggestions.
       * @default "gpt-4o-mini"
       */
      modelName: AiSuggestionModelName
      /**
       * Function to load suggestions from an external source, based
       * on the current editor content and rules. Lets you analyze the
       * content with your own AI model and return suggestions.
       *
       * @param options - Options for resolving suggestions.
       * @return A list of suggestions that should be applied.
       */
      resolver: (options: AiSuggestionCustomResolverOptions) => Promise<Suggestion[]>
      /**
       * The Tiptap AI app ID.
       */
      appId: string
      /**
       * The Tiptap AI token.
       */
      token: string
      /**
       * The base URL for the Tiptap AI API.
       */
      baseUrl: string
    }
    

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/api-reference#extension-commands)
Extension Commands
------------------------------------------------------------------------------------------------------------------

    declare module '@tiptap/core' {
      interface Commands<ReturnType> {
        aiSuggestion: {
          /**
           * Load AI suggestions immediately.
           *
           * @param rules Custom rules to use for the suggestions. If not provided,
           * the rules defined in the extension options will be used.
           */
          loadAiSuggestions: (rules?: AiSuggestionRule[]) => ReturnType
          /**
           * Load AI suggestions after a debounce timeout defined in the
           * extension options.
           *
           * @param rules Custom rules to use for the suggestions. If not provided,
           * the rules defined in the extension options will be used.
           */
          loadAiSuggestionsDebounced: (rules?: AiSuggestionRule[]) => ReturnType
          /**
           * Set the AI suggestions to be displayed.
           *
           * @param suggestions The suggestions to be displayed.
           */
          setAiSuggestions: (suggestions: Suggestion[]) => ReturnType
          /**
           * Set a suggestion as selected. The selected suggestion will have a
           * different style in the editor.
           * */
          selectAiSuggestion: (suggestionId: string) => ReturnType
          /**
           * Apply a suggestion to the editor, modifying its content.
           *
           * @param options The id of the suggestion and the selected replacement
           * option. If the replacement option is not provided, the first option
           * will be used. The format of the replaced content can also be
           * customized.
           */
          applyAiSuggestion: (options: ApplyAiSuggestionOptions) => ReturnType
          /**
           * Marks a suggestion as rejected, removing it from the list of suggestions.
           *
           * @param suggestionId The id of the rejected suggestion
           */
          rejectAiSuggestion: (suggestionId: string) => ReturnType
    
          /**
           * Sets the suggestions to be rejected. This command is useful for undoing
           * rejections or for clearing all rejections.
           *
           * @param rejections The rejections to be set.
           */
          setAiSuggestionRejections: (rejections: AiSuggestionRejection[]) => ReturnType
    
          /**
           * Applies all Ai Suggestions that have not been rejected. Applies
           * the first replacement option for each suggestion.
           */
          applyAllAiSuggestions: (options?: ApplyAllAiSuggestionOptions) => ReturnType
          /**
           * Sets the AI suggestion rules. Lets you update the rules used for
           * proofreading without having to reload the editor.
           *
           * This command does not reload the suggestions. To reload the suggestions
           * with the new rules, call the `loadAiSuggestions` command, like this:
           *
           * ```js
           * editor.chain().setAiSuggestionRules(newRules).loadAiSuggestions().run()
           * ```
           */
          setAiSuggestionRules: (rules?: AiSuggestionRule[]) => ReturnType
        }
      }
    }
    
    export interface ApplyAiSuggestionOptions {
      /**
       * The suggestion identifier to be applied. If the suggestion is not found, the
       * method will do nothing.
       */
      suggestionId: string
      /**
       * The replacement option identifier to be applied. If `undefined`,
       * the method will default to the first replacement option.
       */
      replacementOptionId?: string
      /**
       * Determines how the suggestion will applied
       * If `rich-text`, the suggestion will be formatted as HTML.
       * If `plain-text`, the suggestion will be formatted as plain text.
       * @default "plain-text"
       */
      format?: 'rich-text' | 'plain-text'
    }
    
    export interface ApplyAllAiSuggestionOptions {
      /**
       * Determines how the suggestion will applied
       * If `rich-text`, the suggestion will be formatted as HTML.
       * If `plain-text`, the suggestion will be formatted as plain text.
       * @default "plain-text"
       */
      format?: 'rich-text' | 'plain-text'
    }
    

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/api-reference#extension-storage)
Extension Storage
----------------------------------------------------------------------------------------------------------------

    /**
     * Internal storage for the AI Suggestion extension.
     */
    export interface AiSuggestionStorage {
      /** Key for the ProseMirror plugin used by the extension */
      pluginKey: PluginKey<AiSuggestionProsemirrorPluginState>
      /** Rules to be applied during proofreading */
      rules: AiSuggestionRule[]
      /** Function to get the current suggestions */
      getSuggestions: () => Suggestion[]
      /** Function to get the rejected suggestions */
      getRejections: () => AiSuggestionRejection[]
      /** Function to get the currently selected suggestion */
      getSelectedSuggestion: () => Suggestion | null
      /** Whether suggestions are currently being loaded */
      isLoading: boolean
      /** Whether suggestions have been loaded at least once */
      firstLoad: boolean
      /** Error that occurred during the last load attempt, if any */
      error: unknown | null
      /** Debounced function for loading suggestions */
      debouncedFunction: DebouncedFunction<(rules?: AiSuggestionRule[]) => void>
      /** Controller to abort loading suggestions */
      abortController: AbortController
    }
    
    /**
     * Arguments for creating decoration for suggestions in the editor.
     */
    export interface GetCustomSuggestionDecorationOptions {
      /** The suggestion being decorated */
      suggestion: Suggestion
      /** Whether this suggestion is currently selected */
      isSelected: boolean
      /** Function to get the default decoration styles provided by the extension */
      getDefaultDecorations: () => Decoration[]
    }
    

[](https://tiptap.dev/docs/content-ai/capabilities/suggestion/api-reference#extension-types)
Extension types
------------------------------------------------------------------------------------------------------------

### [](https://tiptap.dev/docs/content-ai/capabilities/suggestion/api-reference#rules)
Rules

    /**
     * A rule to be applied during proofreading.
     */
    export interface AiSuggestionRule {
      /**
       * Unique identifier for the rule.
       */
      id: string
      /**
       * The title of the rule. Will not be used for proofreading, but for display
       * purposes.
       */
      title: string
      /**
       * The prompt of the rule. Will be sent to the AI model for proofreading.
       */
      prompt: string
      /**
       * The color of the rule. Will be used to underline the content that must
       * be replaced to apply the rule.
       */
      color: string
      /**
       * The background color of the rule. Will be used to highlight the content
       * when the suggestion is selected.
       */
      backgroundColor: string
      /**
       * Extra metadata for the rule, that can be used to store additional
       * information about it (e.g. its source or its category). It is not used
       * internally by the extension but it may help developers customize how a
       * rule is displayed in the UI.
       */
      metadata?: any
    }
    

### [](https://tiptap.dev/docs/content-ai/capabilities/suggestion/api-reference#proofreading-suggestions)
Proofreading Suggestions

    import { Range } from '@tiptap/core'
    import { Slice } from '@tiptap/pm/model'
    
    import { AiSuggestionRule } from './ai-suggestion-rule'
    
    /**
     * A replacement option for a suggestion. It contains the text to be added and
     * the slice to be replaced.
     */
    export interface AiSuggestionReplacementOption {
      id: string
      /**
       * The text to be added when the replacement format is `plain-text`.
       */
      addText: string
      /**
       * The content to be added when the replacement format is `rich-text`.
       */
      addSlice: Slice
    }
    
    /**
     * A suggestion from the AI Suggeston extension. It contains the range to be replaced,
     * the text to be deleted, the replacement options, and the rule that must be
     * applied.
     *
     * A suggestion can have multiple replacement options. The user can choose one
     * of them to apply the suggestion.
     */
    export interface Suggestion {
      /**
       * A unique identifier for the suggestion.
       */
      id: string
      /**
       * The range of content from the editor that should be replaced.
       */
      deleteRange: Range
      /**
       * The text to be deleted from the editor, in plain text format
       */
      deleteText: string
      /**
       * The content to be deleted from the editor, as a Prosemirror slice.
       */
      deleteSlice: Slice
      /**
       * Multiple replacement options for the suggestion. The user can choose one
       * of them to apply the suggestion.
       */
      replacementOptions: AiSuggestionReplacementOption[]
      /**
       * The proofreading rule that is followed by applying this suggestion.
       */
      rule: AiSuggestionRule
      /**
       * Whether the suggestion was rejected by the user.
       */
      isRejected: boolean
      /**
       * Extra metadata for the suggestion, that can be used to store additional
       * information about it (e.g. its source or its category). It is not used
       * internally by the extension but it may help developers customize how a
       * suggestion is displayed in the UI.
       */
      metadata?: any
    }
    

### [](https://tiptap.dev/docs/content-ai/capabilities/suggestion/api-reference#rejected-suggestions)
Rejected Suggestions

    import { AiSuggestionRule } from './ai-suggestion-rule'
    
    /**
     * Represents a rejected suggestion. These are stored in the AI Suggestion extension's
     * storage so that the suggestion is not generated again.
     */
    export interface AiSuggestionRejection {
      /**
       * The rule of the suggestion that was rejected.
       */
      rule: AiSuggestionRule
      /**
       * The text that was about to be deleted by the rejected suggestion.
       */
      deleteText: string
    }
    

On this page

[Introduction](https://tiptap.dev/docs/content-ai/capabilities/suggestion/api-reference#page-title)
[Extension Options](https://tiptap.dev/docs/content-ai/capabilities/suggestion/api-reference#extension-options)
 [Extension Commands](https://tiptap.dev/docs/content-ai/capabilities/suggestion/api-reference#extension-commands)
 [Extension Storage](https://tiptap.dev/docs/content-ai/capabilities/suggestion/api-reference#extension-storage)
 [Extension types](https://tiptap.dev/docs/content-ai/capabilities/suggestion/api-reference#extension-types)