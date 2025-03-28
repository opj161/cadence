---
title: AI Generation editor commands | Tiptap Content AI
source_url: https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/built-in-commands#page-title
twitter:title: AI Generation editor commands | Tiptap Content AI
og:locale: en_US
twitter:image: https://tiptap.dev/docs/api/og?title=AI%20Generation%20editor%20commands&category=Content%20AI
robots: index, follow
viewport: width=device-width, initial-scale=1
ogTitle: AI Generation editor commands | Tiptap Content AI
ogDescription: Integrate AI into your Tiptap Editor to access preconfigured commands for text manipulation and image generation.
ogUrl: https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/built-in-commands
og:description: Integrate AI into your Tiptap Editor to access preconfigured commands for text manipulation and image generation.
description: Integrate AI into your Tiptap Editor to access preconfigured commands for text manipulation and image generation.
favicon: https://tiptap.dev/docs/favicon.png
language: en
og:title: AI Generation editor commands | Tiptap Content AI
og:image: https://tiptap.dev/docs/api/og?title=AI%20Generation%20editor%20commands&category=Content%20AI
og:type: website
twitter:card: summary_large_image
og:image:width: 1200
twitter:description: Integrate AI into your Tiptap Editor to access preconfigured commands for text manipulation and image generation.
ogImage: https://tiptap.dev/docs/api/og?title=AI%20Generation%20editor%20commands&category=Content%20AI
og:url: https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/built-in-commands
docsearch:version: 2.x
ogLocale: en_US
og:image:height: 630
scrapeId: a10a2185-682b-4326-85a9-4040f84ad297
sourceURL: https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/built-in-commands#page-title
url: https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/built-in-commands#page-title
statusCode: 200
---

The AI Generation extension for Tiptap Editor includes a set of preconfigured commands that you can integrate into your rich text editor. These commands allow you to adjust text tone, complete text, generate images, and more, enhancing your editor's functionality.

To see how these commands are used, check out the examples on the [overview](https://tiptap.dev/docs/content-ai/capabilities/generation/overview)
 page.

| Command | Description |
| --- | --- |
| [`aiAdjustTone(tone: Tone, options: TextOptions)`](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/built-in-commands#aiadjusttone) | Adjusts the tone of voice of the selected text to the specified [TONE](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/built-in-commands#aitone)<br>. |
| [`aiBloggify(options: TextOptions)`](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/built-in-commands#most-text-commands) | Rewrite the text into a blog format |
| [`aiComplete(options: TextOptions)`](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/built-in-commands#most-text-commands) | Completes the selected text |
| [`aiDeEmojify(options: TextOptions)`](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/built-in-commands#most-text-commands) | Removes emojis from the selected text |
| [`aiEmojify(options: TextOptions)`](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/built-in-commands#most-text-commands) | Adds emojis ✨ to your text |
| [`aiExtend(options: TextOptions)`](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/built-in-commands#most-text-commands) | Extends your text |
| [`aiFixSpellingAndGrammar(options: TextOptions)`](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/built-in-commands#most-text-commands) | Fixes spelling & grammar |
| [`aiKeypoints(options: TextOptions)`](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/built-in-commands#most-text-commands) | Summarizes your text to a list of key points |
| [`aiRephrase(options: TextOptions)`](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/built-in-commands#most-text-commands) | Rephrases the selected text |
| [`aiRestructure(options: TextOptions)`](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/built-in-commands#most-text-commands) | Restructures the selected text to use rich text formatting |
| [`aiShorten(options: TextOptions)`](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/built-in-commands#most-text-commands) | Shortens the selected text |
| [`aiSimplify(options: TextOptions)`](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/built-in-commands#most-text-commands) | Rephrases your text in simplified words |
| [`aiSummarize(options: TextOptions)`](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/built-in-commands#most-text-commands) | Summarizes your text |
| [`aiTextPrompt(options: TextOptions)`](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/built-in-commands#most-text-commands) | Runs your custom prompt |
| [`aiTldr(options: TextOptions)`](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/built-in-commands#most-text-commands) | Creates a "Too Long; Didn't Read" version text |
| [`aiTranslate(language: Language, options: TextOptions)`](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/built-in-commands#aitranslate) | Translates the selected text into the specified language |
| **Utility** |     |
| [`aiAccept(options: AcceptOptions)`](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/manage-responses#aiaccept) | [Accept the generated response](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/manage-responses)<br>, and insert it into the editor |
| [`aiReject(options: RejectOptions)`](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/manage-responses#aireject) | [Reject the generated Response](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/manage-responses)<br>, resetting ai.storage state |
| [`aiRegenerate(options: RegenerateOptions)`](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/manage-responses#airegenerate) | [Regenerate a response](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/manage-responses)<br> using the same parameters |

### [](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/built-in-commands#most-text-commands)
Most text commands

Most of the text commands accept the same options and their usage is similar. The following example demonstrates how to use the `aiBloggify` command:

    editor.chain().focus().aiBloggify(options: TextOptions)
    

### [](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/built-in-commands#aiadjusttone)
aiAdjustTone

    // Tone: 'default' | 'academic' | 'business' | 'casual' | 'childfriendly' | 'confident' | 'conversational' | 'creative' | 'emotional' | 'excited' | 'formal' | 'friendly' | 'funny' | 'humorous' | 'informative' | 'inspirational' | 'memeify' | 'narrative' | 'objective' | 'persuasive' | 'poetic' | string
    editor.chain().focus().aiAdjustTone(tone: Tone, options: TextOptions).run()
    

### [](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/built-in-commands#aitranslate)
aiTranslate

Translates the selected text content into the given output language.

It accepts two letter ISO 639-1 language codes.

    // Language: 'en' | 'de' | 'nl' | ...
    editor.chain().focus().aiTranslate(language: Language, options: TextOptions).run()
    

[](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/built-in-commands#text-command-options)
Text command options
------------------------------------------------------------------------------------------------------------------------------------------

On every command which supports `TextOptions`, you’re able to specify the following options:

| Setting | Type | Default | Definition |
| --- | --- | --- | --- |
| `modelName` | see [Supported text models](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/built-in-commands#supported-text-models) | `gpt-3.5-turbo` | The model used at OpenAI |
| `format` | `'rich-text' \| 'plain-text'` | `plain-text` | Determines the [format](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/format)<br> of how the model should respond |
| `stream` | `boolean` | `false` | Should the command stream characters to the editor? It’s like the **typewriter** behavior in ChatGPT. **This requires the newest extension version!** |
| `insertAt` | `undefined \| number \| {from: number; to: number}` | `undefined` | Where to insert the response into the editor, if `undefined` the response will be inserted at the current selection. If a number, the response will be inserted at that position. If an object it will replace that range. |
| `language` | `string` (e.g. `en`, `de`) | `null` | Although we do our best to prompt OpenAI for a response in the language of the input, sometimes it’s better to define it yourself. |
| `tone` | `string` | `null` | A [voice of tone](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/built-in-commands#ai-adjust-tone)<br> the response should be transformed to |
| `textLength` | `number` | `undefined` | The number of `textLengthUnit`s the AI should respond with (e.g. the `3` in "3 paragraphs") |
| `textLengthUnit` | `'paragraphs' \| 'words' \| 'characters'` | `undefined` | The unit of `textLength`s the AI should respond with (e.g. the `paragraphs` in "3 paragraphs") |
| `collapseToEnd` | `boolean` | `true` | Whether the cursor should be set to the end after the operation or the insertion should get selected. |
| `context` | `Array<{ type: 'text', text: string} \| { type: 'url', url: string }>` | `[]` | [Context](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/provide-context)<br> to provide the model for generating a Response. |
| `text` | `string` | `undefined` | An optional message to have the model respond to |
| `insert` | `boolean` | `true` | Allows disabling inserting content directly into the editor |
| `append` | `boolean` | `true` | If `true`, the response will be appended to the end of the current selection. If `false`, the response will replace the current selection. |

_Unfortunately the combination of **tone** and **language** sometimes leads to responses which are not in the desired language._

### [](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/built-in-commands#supported-text-models)
Supported text models

We currently support the following OpenAI chat models:

*   `gpt-4o`
*   `gpt-4o-2024-05-13`
*   `gpt-4`
*   `gpt-4-turbo-preview`
*   `gpt-4-0125-preview`
*   `gpt-4-1106-preview`
*   `gpt-4-0613`
*   `gpt-4-32k`
*   `gpt-4-32k-0613`
*   `gpt-3.5-turbo-0125`
*   `gpt-3.5-turbo`
*   `gpt-3.5-turbo-1106`
*   `gpt-3.5-turbo-16k`

[](https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/built-in-commands#choose-the-right-model)
Choose the right Model
----------------------------------------------------------------------------------------------------------------------------------------------

When configuring the Tiptap AI extension, consider the specific needs of your application:

*   **For Cost-Effective Operations:** Opt for GPT-3 or DALL-E 2 if the primary concern is budget and the tasks do not demand the most advanced capabilities.
*   **For Advanced Requirements:** Choose GPT-4o or DALL-E 3 when your application requires the highest level of language understanding or image generation quality, and budget is less of a constraint.

The Tiptap AI extension's flexible configuration allows you to tailor the AI integration to match your specific requirements and budgetary considerations.

_Note: The pricing details are not provided here due to variability and the need for up-to-date information. It's recommended to refer to the official OpenAI pricing page for the latest figures._