---
title: Custom LLM | Tiptap Content AI
source_url: https://tiptap.dev/docs/content-ai/capabilities/generation/custom-llms#page-title
docsearch:version: 2.x
twitter:description: Implement custom LLMs with the Generative AI extension and override resolver functions in your editor. Learn more in the docs!
og:title: Custom LLM | Tiptap Content AI
ogUrl: https://tiptap.dev/docs/content-ai/capabilities/generation/custom-llms
og:url: https://tiptap.dev/docs/content-ai/capabilities/generation/custom-llms
robots: index, follow
og:locale: en_US
og:image:width: 1200
language: en
ogLocale: en_US
ogImage: https://tiptap.dev/docs/api/og?title=Integrate%20a%20custom%20LLM&category=Content%20AI
description: Implement custom LLMs with the Generative AI extension and override resolver functions in your editor. Learn more in the docs!
favicon: https://tiptap.dev/docs/favicon.png
ogTitle: Custom LLM | Tiptap Content AI
og:description: Implement custom LLMs with the Generative AI extension and override resolver functions in your editor. Learn more in the docs!
og:image:height: 630
og:image: https://tiptap.dev/docs/api/og?title=Integrate%20a%20custom%20LLM&category=Content%20AI
ogDescription: Implement custom LLMs with the Generative AI extension and override resolver functions in your editor. Learn more in the docs!
og:type: website
twitter:title: Custom LLM | Tiptap Content AI
twitter:image: https://tiptap.dev/docs/api/og?title=Integrate%20a%20custom%20LLM&category=Content%20AI
viewport: width=device-width, initial-scale=1
twitter:card: summary_large_image
scrapeId: f607796d-db70-4937-af64-9dd8e599bdd2
sourceURL: https://tiptap.dev/docs/content-ai/capabilities/generation/custom-llms#page-title
url: https://tiptap.dev/docs/content-ai/capabilities/generation/custom-llms#page-title
statusCode: 200
---

If you want to use a your own backend which provides access to a custom LLM, you can override the resolver functions defined below on the extension configuration.

Make sure you’re returning the correct type of response and that you handle errors correctly.

### Heads up!

We strongly advise you not to call OpenAI directly in your frontend, as this could lead to API token leakage! You should use a proxy on your backend to keep your API tokens secret.

[](https://tiptap.dev/docs/content-ai/capabilities/generation/custom-llms#install-the-advanced-extension)
Install the advanced extension
----------------------------------------------------------------------------------------------------------------------------------------

In order to use customized resolver functions, you need to install the advanced version of our Tiptap AI extension.

### Pro Extension

This extension requires a valid subscription in an eligible plan and [access to our private registry](https://tiptap.dev/docs/guides/pro-extensions)
, set this up first.

**You need to be a business customer, to use the advanced extension.**

    npm install @tiptap-pro/extension-ai-advanced
    

### [](https://tiptap.dev/docs/content-ai/capabilities/generation/custom-llms#use-both-custom-llm-and-tiptap-ai-cloud)
Use both custom LLM and Tiptap AI Cloud

If you want to rely on our cloud in some cases, make sure that you [setup your team as described here](https://tiptap.dev/docs/content-ai/capabilities/generation/install#set-up-tiptap-ai-for-your-team)
.

[](https://tiptap.dev/docs/content-ai/capabilities/generation/custom-llms#resolver-functions)
Resolver Functions
----------------------------------------------------------------------------------------------------------------

You can define custom resolver functions on the extension options. Be aware that they expect the following return types.

| Type | Method name | Return Type |
| --- | --- | --- |
| completion | `aiCompletionResolver` | `Promise<string \| null>` |
| streaming | `aiStreamResolver` | `Promise<ReadableStream<Uint8Array> \| null>` |
| image | `aiImageResolver` | `Promise<string \| null>` |

Use `aiCompletionResolver` to add text to the editor in a non-streaming manner.

Use the `aiStreamResolver` to stream content directly into the editor. This gives the editor typewritter effect.

Make sure that the stream returns HTML to allow Tiptap to render the content directly as rich text. This approach removes the need for a Markdown parser and keeps the frontend lightweight.

[](https://tiptap.dev/docs/content-ai/capabilities/generation/custom-llms#examples)
Examples
--------------------------------------------------------------------------------------------

### [](https://tiptap.dev/docs/content-ai/capabilities/generation/custom-llms#override-a-specific-command-resolution-in-completion-mode)
Override a specific command resolution in completion mode

In this example we want to call our custom backend when the `rephrase` action/command is called. Everything else should be handled by the default backend in the Tiptap Cloud.

    // ...
    import Ai from '@tiptap-pro/extension-ai-advanced'
    // ...
    
    Ai.configure({
      appId: 'APP_ID_HERE',
      token: 'TOKEN_HERE',
      // ...
      onError(error, context) {
        // handle error
      },
      // Define the resolver function for completions (attention: streaming and image have to be defined separately!)
      aiCompletionResolver: async ({
        editor,
        action,
        text,
        textOptions,
        extensionOptions,
        defaultResolver,
      }) => {
        // Check against action, text, whatever you like
        // Decide to use custom endpoint
        if (action === 'rephrase') {
          const response = await fetch('https://dummyjson.com/quotes/random')
          const json = await response?.json()
    
          if (!response.ok) {
            throw new Error(`${response.status} ${json?.message}`)
          }
    
          return json?.quote
        }
    
        // Everything else is routed to the Tiptap AI service
        return defaultResolver({
          editor,
          action,
          text,
          textOptions,
          extensionOptions,
          defaultResolver,
        })
      },
    })
    

### [](https://tiptap.dev/docs/content-ai/capabilities/generation/custom-llms#register-a-new-ai-command-and-call-a-custom-backend-action)
Register a new AI command and call a custom backend action

In this example, we register a new editor command named `aiCustomTextCommand`, use the Tiptap `runAiTextCommand` function to let Tiptap do the rest, and add a custom command resolution to call a custom backend (in completion mode).

    // …
    import { Ai, runAiTextCommand } from '@tiptap-pro/extension-ai-advanced'
    // …
    
    // Declare typings if TypeScript is used:
    //
    // declare module '@tiptap/core' {
    //   interface Commands<ReturnType> {
    //     ai: {
    //       aiCustomTextCommand: () => ReturnType,
    //     }
    //   }
    // }
    
    const AiExtended = Ai.extend({
      addCommands() {
        return {
          ...this.parent?.(),
    
          aiCustomTextCommand:
            (options = {}) =>
            (props) => {
              // Do whatever you want; e.g. get the selected text and pass it to the specific command resolution
              return runAiTextCommand(props, 'customCommand', options)
            },
        }
      },
    })
    
    // … this is where you initialize your Tiptap editor instance and register the extended extension
    
    const editor = new Editor{
      extensions: [\
        /* … add other extension */\
        AiExtended.configure({\
          /* … add configuration here (appId, token etc.) */\
          onError(error, context) {\
            // handle error\
          },\
          aiCompletionResolver: async ({\
            action,\
            text,\
            textOptions,\
            extensionOptions,\
            defaultResolver,\
            editor,\
          }) => {\
            if (action === 'customCommand') {\
              const response = await fetch('https://dummyjson.com/quotes/random')\
              const json = await response?.json()\
    \
              if (!response.ok) {\
                throw new Error(`${response.status} ${json?.message}`)\
              }\
    \
              return json?.quote\
            }\
    \
            return defaultResolver({\
              editor,\
              action,\
              text,\
              textOptions,\
              extensionOptions,\
              defaultResolver,\
            })\
          },\
        }),\
      ],
      content: '',
    })
    
    // … use this to run your new command:
    // editor.chain().focus().aiCustomTextCommand().run()
    

### [](https://tiptap.dev/docs/content-ai/capabilities/generation/custom-llms#use-your-custom-backend-in-streaming-mode)
Use your custom backend in streaming mode

We’re entirely relying on a custom backend in this example.

Make sure that the function `aiStreamResolver` returns a `ReadableStream<Uint8Array>`.

And remember: If you want to use both streaming and the traditional completion mode (non-streaming way), you’ll need to define a `aiCompletionResolver`, too!

    // ...
    import Ai from '@tiptap-pro/extension-ai-advanced'
    // ...
    
    Ai.configure({
      appId: 'APP_ID_HERE',
      token: 'TOKEN_HERE',
      // ...
      onError(error, context) {
        // handle error
      },
      // Define the resolver function for streams
      aiStreamResolver: async ({ action, text, textOptions }) => {
        const fetchOptions = {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            ...textOptions,
            text,
          }),
        }
    
        const response = await fetch(`<YOUR_STREAMED_BACKEND_ENDPOINT>`, fetchOptions)
        const json = await response?.json()
    
        if (!response.ok) {
          throw new Error(`${json?.error} ${json?.message}`)
        }
    
        return response?.body
      },
    })
    

On this page

[Introduction](https://tiptap.dev/docs/content-ai/capabilities/generation/custom-llms#page-title)
[Install the advanced extension](https://tiptap.dev/docs/content-ai/capabilities/generation/custom-llms#install-the-advanced-extension)
 [Resolver Functions](https://tiptap.dev/docs/content-ai/capabilities/generation/custom-llms#resolver-functions)
 [Examples](https://tiptap.dev/docs/content-ai/capabilities/generation/custom-llms#examples)