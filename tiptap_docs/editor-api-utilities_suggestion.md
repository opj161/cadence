---
title: Suggestion utility | Tiptap Editor Docs
source_url: https://tiptap.dev/docs/editor/api/utilities/suggestion#page-title
ogUrl: https://tiptap.dev/docs/editor/api/utilities/suggestion
og:url: https://tiptap.dev/docs/editor/api/utilities/suggestion
favicon: https://tiptap.dev/docs/favicon.png
ogTitle: Suggestion utility | Tiptap Editor Docs
ogImage: https://tiptap.dev/docs/api/og?title=Suggestion%20utility&category=Editor
robots: index, follow
og:title: Suggestion utility | Tiptap Editor Docs
ogLocale: en_US
description: Customize autocomplete suggestions using nodes like Mention and Emoji. Explore settings and configurations in our docs.
og:locale: en_US
viewport: width=device-width, initial-scale=1
og:image: https://tiptap.dev/docs/api/og?title=Suggestion%20utility&category=Editor
og:image:width: 1200
ogDescription: Customize autocomplete suggestions using nodes like Mention and Emoji. Explore settings and configurations in our docs.
og:type: website
twitter:description: Customize autocomplete suggestions using nodes like Mention and Emoji. Explore settings and configurations in our docs.
twitter:card: summary_large_image
twitter:title: Suggestion utility | Tiptap Editor Docs
docsearch:version: 2.x
og:image:height: 630
twitter:image: https://tiptap.dev/docs/api/og?title=Suggestion%20utility&category=Editor
language: en
og:description: Customize autocomplete suggestions using nodes like Mention and Emoji. Explore settings and configurations in our docs.
scrapeId: 373964b0-4c5e-4b94-93b2-2f6595000132
sourceURL: https://tiptap.dev/docs/editor/api/utilities/suggestion#page-title
url: https://tiptap.dev/docs/editor/api/utilities/suggestion#page-title
statusCode: 200
---

This utility helps with all kinds of suggestions in the editor. Have a look at the [`Mention`](https://tiptap.dev/docs/editor/extensions/nodes/mention)
 or [`Emoji`](https://tiptap.dev/docs/editor/extensions/nodes/emoji)
 node to see it in action.

[](https://tiptap.dev/docs/editor/api/utilities/suggestion#settings)
Settings
-----------------------------------------------------------------------------

### [](https://tiptap.dev/docs/editor/api/utilities/suggestion#char)
char

The character that triggers the autocomplete popup.

Default: `'@'`

### [](https://tiptap.dev/docs/editor/api/utilities/suggestion#pluginkey)
pluginKey

A ProseMirror PluginKey.

Default: `SuggestionPluginKey`

### [](https://tiptap.dev/docs/editor/api/utilities/suggestion#allow)
allow

A function that returns a boolean to indicate if the suggestion should be active.

Default: `(props: { editor: Editor; state: EditorState; range: Range, isActive?: boolean }) => true`

### [](https://tiptap.dev/docs/editor/api/utilities/suggestion#allowspaces)
allowSpaces

Allows or disallows spaces in suggested items.

Default: `false`

### [](https://tiptap.dev/docs/editor/api/utilities/suggestion#allowedprefixes)
allowedPrefixes

The prefix characters that are allowed to trigger a suggestion. Set to `null` to allow any prefix character.

Default: `[' ']`

### [](https://tiptap.dev/docs/editor/api/utilities/suggestion#startofline)
startOfLine

Trigger the autocomplete popup at the start of a line only.

Default: `false`

### [](https://tiptap.dev/docs/editor/api/utilities/suggestion#decorationtag)
decorationTag

The HTML tag that should be rendered for the suggestion.

Default: `'span'`

### [](https://tiptap.dev/docs/editor/api/utilities/suggestion#decorationclass)
decorationClass

A CSS class that should be added to the suggestion.

Default: `'suggestion'`

### [](https://tiptap.dev/docs/editor/api/utilities/suggestion#command)
command

Executed when a suggestion is selected.

Default: `() => {}`

### [](https://tiptap.dev/docs/editor/api/utilities/suggestion#items)
items

Pass an array of filtered suggestions, can be async.

Default: `({ editor, query }) => []`

### [](https://tiptap.dev/docs/editor/api/utilities/suggestion#render)
render

A render function for the autocomplete popup.

Default: `() => ({})`

### [](https://tiptap.dev/docs/editor/api/utilities/suggestion#findsuggestionmatch)
findSuggestionMatch

Optional param to replace the built-in regex matching of editor content that triggers a suggestion. See [the source](https://github.com/ueberdosis/tiptap/blob/main/packages/suggestion/src/findSuggestionMatch.ts#L18)
 for more detail.

Default: `findSuggestionMatch(config: Trigger): SuggestionMatch`

[](https://tiptap.dev/docs/editor/api/utilities/suggestion#source-code)
Source code
-----------------------------------------------------------------------------------

[packages/suggestion/](https://github.com/ueberdosis/tiptap/blob/main/packages/suggestion/)