---
title: Install AI Generation | Tiptap Content AI
source_url: https://tiptap.dev/docs/content-ai/capabilities/generation/install#page-title
og:image:width: 1200
og:image:height: 630
og:type: website
ogImage: https://tiptap.dev/docs/api/og?title=Install%20the%20AI%20Generation%20extension&category=Content%20AI
twitter:image: https://tiptap.dev/docs/api/og?title=Install%20the%20AI%20Generation%20extension&category=Content%20AI
og:locale: en_US
og:image: https://tiptap.dev/docs/api/og?title=Install%20the%20AI%20Generation%20extension&category=Content%20AI
og:url: https://tiptap.dev/docs/content-ai/capabilities/generation/install
ogTitle: Install AI Generation | Tiptap Content AI
docsearch:version: 2.x
og:description: Set up Tiptap AI Generation in your editor, including configuring OpenAI keys and JWT authentication. More in the docs!
twitter:title: Install AI Generation | Tiptap Content AI
twitter:card: summary_large_image
ogUrl: https://tiptap.dev/docs/content-ai/capabilities/generation/install
ogDescription: Set up Tiptap AI Generation in your editor, including configuring OpenAI keys and JWT authentication. More in the docs!
twitter:description: Set up Tiptap AI Generation in your editor, including configuring OpenAI keys and JWT authentication. More in the docs!
favicon: https://tiptap.dev/docs/favicon.png
og:title: Install AI Generation | Tiptap Content AI
viewport: width=device-width, initial-scale=1
language: en
ogLocale: en_US
description: Set up Tiptap AI Generation in your editor, including configuring OpenAI keys and JWT authentication. More in the docs!
robots: index, follow
scrapeId: 9037d8a9-b057-4d93-8915-78475af51f2f
sourceURL: https://tiptap.dev/docs/content-ai/capabilities/generation/install#page-title
url: https://tiptap.dev/docs/content-ai/capabilities/generation/install#page-title
statusCode: 200
---

Please follow the next steps closely in order to prevent any missing settings before you start using Tiptap AI.

Unless you’re an business customer who wants to use [custom resolver functions](https://tiptap.dev/docs/content-ai/custom-llms)
, you’ll need to set up your OpenAI keys in your [Tiptap account](https://cloud.tiptap.dev/ai-settings)
.

[](https://tiptap.dev/docs/content-ai/capabilities/generation/install#set-up-tiptap-ai-for-your-team)
Set up Tiptap AI for your team
------------------------------------------------------------------------------------------------------------------------------------

This extension relies on using our Content AI backend service. You'll need a valid Entry, Business or Enterprise subscription. [Just head over to our pricing page to learn more.](https://tiptap.dev/pricing)

1.  You’ll need to provide an [OpenAI API token](https://platform.openai.com/docs/quickstart/account-setup)
     yourself, which we’re using in order to send requests to the OpenAI API. Your token is stored well encrypted and is only used on a per-request basis. [Add the OpenAI API Key to your team](https://cloud.tiptap.dev/ai-settings)
    .
2.  Generate a JWT (HS256 algorithm) with our provided secret to authenticate the extension against our service. [Get your JWT secret.](https://cloud.tiptap.dev/ai-settings)
    
3.  Set up the extension as described below.

[](https://tiptap.dev/docs/content-ai/capabilities/generation/install#install-the-extension)
Install the extension
------------------------------------------------------------------------------------------------------------------

### Subscription required

This extension requires a valid Entry, Business or Enterprise subscription. To install the extension you need access to our [private registry](https://tiptap.dev/docs/guides/pro-extensions)
, set this up first.

Once done, you can install the extension from our private registry:

    npm install @tiptap-pro/extension-ai
    

[](https://tiptap.dev/docs/content-ai/capabilities/generation/install#initialize-the-extension)
Initialize the extension
------------------------------------------------------------------------------------------------------------------------

The integration into your editor instance is done like every other Tiptap extension. This is an example on how it could look like:

    import { Editor } from '@tiptap/core'
    import StarterKit from '@tiptap/starter-kit'
    import Ai from '@tiptap-pro/extension-ai'
    
    const editor = new Editor{
      extensions: [\
        StarterKit,\
        Ai.configure({\
          // Your Tiptap Content AI app id\
          appId: 'APP_ID_HERE',\
          // This needs to be your generated JWT and MUST NOT be the OpenAI API key!\
          token: 'TOKEN_HERE',\
          autocompletion: true,\
          // … other options (see below)\
        }),\
        // … more extensions\
      ],
    })
    

At this point you're good to go to use OpenAI in your Tiptap editor. Have a look at the [configuration options](https://tiptap.dev/docs/content-ai/capabilities/generation/configure)
 to customize your experience.

On this page

[Introduction](https://tiptap.dev/docs/content-ai/capabilities/generation/install#page-title)
[Set up Tiptap AI for your team](https://tiptap.dev/docs/content-ai/capabilities/generation/install#set-up-tiptap-ai-for-your-team)
 [Install the extension](https://tiptap.dev/docs/content-ai/capabilities/generation/install#install-the-extension)
 [Initialize the extension](https://tiptap.dev/docs/content-ai/capabilities/generation/install#initialize-the-extension)