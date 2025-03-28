---
title: Configure AI Generation | Tiptap Content AI
source_url: https://tiptap.dev/docs/content-ai/capabilities/generation/configure
favicon: https://tiptap.dev/docs/favicon.png
viewport: width=device-width, initial-scale=1
description: Configure the AI Generation extension in your editor and learn more about all the options possible with AI.
og:title: Configure AI Generation | Tiptap Content AI
ogDescription: Configure the AI Generation extension in your editor and learn more about all the options possible with AI.
og:url: https://tiptap.dev/docs/content-ai/capabilities/generation/configure
og:image:width: 1200
og:image: https://tiptap.dev/docs/api/og?title=Configure%20the%20AI%20Generation%20extension&category=Content%20AI
og:description: Configure the AI Generation extension in your editor and learn more about all the options possible with AI.
ogTitle: Configure AI Generation | Tiptap Content AI
twitter:title: Configure AI Generation | Tiptap Content AI
ogLocale: en_US
ogImage: https://tiptap.dev/docs/api/og?title=Configure%20the%20AI%20Generation%20extension&category=Content%20AI
twitter:image: https://tiptap.dev/docs/api/og?title=Configure%20the%20AI%20Generation%20extension&category=Content%20AI
language: en
twitter:card: summary_large_image
robots: index, follow
og:type: website
og:locale: en_US
ogUrl: https://tiptap.dev/docs/content-ai/capabilities/generation/configure
og:image:height: 630
twitter:description: Configure the AI Generation extension in your editor and learn more about all the options possible with AI.
docsearch:version: 2.x
scrapeId: aaefb824-ab01-44b4-871d-bd4e9b24b275
sourceURL: https://tiptap.dev/docs/content-ai/capabilities/generation/configure
url: https://tiptap.dev/docs/content-ai/capabilities/generation/configure
statusCode: 200
---

The Content AI extension for Tiptap accepts different settings to configure the global behavior of the extension and the commands.

| Setting | Type | Default | Definition |
| --- | --- | --- | --- |
| `appId` | `string` | `''` | Your Application ID which can be obtained by [visiting the AI settings in Tiptap Cloud](https://collab.tiptap.dev/ai-settings) |
| `token` | `string` | `''` | In order to authenticate against our AI backend service, you’ll need to generate a JWT (with HS256) using your JWT secret, which you also [obtain in your team’s AI settings page](https://cloud.tiptap.dev/ai-settings) |
| `autocompletion` | `boolean` | `false` | Enables the autocompletion feature. When writing text, just hit **Tab** to trigger the autocompletion and another **Tab** to accept the completion. We’re using a portion of your already written text to build a prompt for OpenAI. |
| `autocompletionOptions` | `object` | `{ trigger: 'Tab', accept: 'Tab', debounce: 0, inputLength: 4000, modelName: 'gpt-3.5-turbo' }` | Defines the trigger and length of text used to generate autocompletion suggestion. Accept defaults to trigger, if not set explicitly. Debounce in ms the request after trigger pressed. You can also choose the OpenAI model to run the autocompletion task. |
| `onLoading` | `(context: { editor: Editor, action: TextAction \| 'image', isStreaming: boolean }) => void` | `undefined` | Callback for when the AI has begun generating a response. |
| `onSuccess` | `(context: { editor: Editor, action: TextAction \| 'image', isStreaming: boolean, response: string }) => void` | `undefined` | Callback for when the AI has successfully finished generating a response. |
| `onChunk` | `(context: { editor: Editor, action: TextAction \| 'image', isStreaming: boolean, response: string, chunk: string }) => void` | `undefined` | Callback for when a chunk of the response is generated. chunk being the new string partial response being the generated response so far (including the chunk) |
| `onError` | `(error: Error, context: { editor: Editor, action: TextAction \| 'image', isStreaming: boolean}) => void` | `undefined` | Callback for when an error occurs while generating a response. |
| `showDecorations` | `boolean` | `true` | If `false`, will not attempt to decorate AI suggestions in streaming mode. This reduces your ability to style suggestions but can fix issues with undo history |