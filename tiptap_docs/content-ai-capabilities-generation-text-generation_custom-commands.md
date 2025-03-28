---
title: Custom command | Tiptap Content AI
source_url: https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/custom-commands
favicon: https://tiptap.dev/docs/favicon.png
og:image:width: 1200
ogImage: https://tiptap.dev/docs/api/og?title=Register%20a%20custom%20command%20and%20prompt&category=Content%20AI
viewport: width=device-width, initial-scale=1
og:type: website
og:description: Extend the AI extension to create a custom editor command and prompt for your Tiptap editor. Learn more in the docs!
ogLocale: en_US
og:locale: en_US
twitter:card: summary_large_image
og:title: Custom command | Tiptap Content AI
ogDescription: Extend the AI extension to create a custom editor command and prompt for your Tiptap editor. Learn more in the docs!
og:image:height: 630
twitter:description: Extend the AI extension to create a custom editor command and prompt for your Tiptap editor. Learn more in the docs!
twitter:image: https://tiptap.dev/docs/api/og?title=Register%20a%20custom%20command%20and%20prompt&category=Content%20AI
og:image: https://tiptap.dev/docs/api/og?title=Register%20a%20custom%20command%20and%20prompt&category=Content%20AI
docsearch:version: 2.x
language: en
ogUrl: https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/custom-commands
og:url: https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/custom-commands
description: Extend the AI extension to create a custom editor command and prompt for your Tiptap editor. Learn more in the docs!
robots: index, follow
ogTitle: Custom command | Tiptap Content AI
twitter:title: Custom command | Tiptap Content AI
scrapeId: dcdbb90b-1455-4ba2-a0f4-dd0513ff069f
sourceURL: https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/custom-commands
url: https://tiptap.dev/docs/content-ai/capabilities/generation/text-generation/custom-commands
statusCode: 200
---

To register your own AI commands, simply extend the AI Generation extension, add your command in `addCommands()` (don't forget to inherit the predefined commands in `this.parent?.()`), and execute `aiTextPrompt()` to run your individual prompt.

Please note that this example uses your prompt on the client-side, which means that users could read it. If you're looking to use a custom Language Model (LLM) or a prompt on your backend, please refer to the [example provided here](https://tiptap.dev/docs/content-ai/custom-llms)
.

    import { Ai, getHTMLContentBetween } from '@tiptap-pro/extension-ai'
    
    // … other imports
    
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
            () =>
            ({ editor, state }) => {
              const { from, to } = state.selection
              const selectedText = getHTMLContentBetween(editor, from, to)
    
              return editor.commands.aiTextPrompt({
                text: `Translate the following text to French and add some emojis: ${selectedText}`,
              })
            },
        }
      },
    })
    
    // … this is where you initialize your Tiptap editor instance and register the extended extension
    
    const editor = new Editor{
      extensions: [\
        StarterKit,\
        AiExtended.configure({\
          /* … */\
        }),\
      ],
      content: '',
    })
    
    // … use this to run your new command:
    // editor.chain().focus().aiCustomTextCommand().run()