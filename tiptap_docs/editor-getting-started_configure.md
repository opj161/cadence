---
title: Configuration | Tiptap Editor Docs
source_url: https://tiptap.dev/docs/editor/getting-started/configure#page-title
language: en
og:type: website
twitter:title: Configuration | Tiptap Editor Docs
og:description: Configure your Tiptap Editor's elements, extensions, and content settings. Learn more in our documentation!
twitter:description: Configure your Tiptap Editor's elements, extensions, and content settings. Learn more in our documentation!
ogUrl: https://tiptap.dev/docs/editor/getting-started/configure
ogLocale: en_US
og:image:height: 630
docsearch:version: 2.x
ogImage: https://tiptap.dev/docs/api/og?title=Configure%20the%20Editor&category=Editor
og:image:width: 1200
favicon: https://tiptap.dev/docs/favicon.png
viewport: width=device-width, initial-scale=1
og:image: https://tiptap.dev/docs/api/og?title=Configure%20the%20Editor&category=Editor
robots: index, follow
ogDescription: Configure your Tiptap Editor's elements, extensions, and content settings. Learn more in our documentation!
og:title: Configuration | Tiptap Editor Docs
twitter:card: summary_large_image
twitter:image: https://tiptap.dev/docs/api/og?title=Configure%20the%20Editor&category=Editor
description: Configure your Tiptap Editor's elements, extensions, and content settings. Learn more in our documentation!
og:locale: en_US
ogTitle: Configuration | Tiptap Editor Docs
og:url: https://tiptap.dev/docs/editor/getting-started/configure
scrapeId: 5248fa47-8b3a-43b7-9511-b4655e8f9eac
sourceURL: https://tiptap.dev/docs/editor/getting-started/configure#page-title
url: https://tiptap.dev/docs/editor/getting-started/configure#page-title
statusCode: 200
---

To configure Tiptap, specify three key elements:

*   where it should be rendered (`element`)
*   which functionalities to enable (`extensions`)
*   what the initial document should contain (`content`)

While this setup works for most cases, you can configure additional options.

[](https://tiptap.dev/docs/editor/getting-started/configure#add-your-configuration)
Add your configuration
----------------------------------------------------------------------------------------------------------

To configure the editor, pass [an object with settings](https://tiptap.dev/docs/editor/api/editor)
 to the `Editor` class, as shown below:

    import { Editor } from '@tiptap/core'
    import Document from '@tiptap/extension-document'
    import Paragraph from '@tiptap/extension-paragraph'
    import Text from '@tiptap/extension-text'
    
    new Editor({
      // bind Tiptap to the `.element`
      element: document.querySelector('.element'),
      // register extensions
      extensions: [Document, Paragraph, Text],
      // set the initial content
      content: '<p>Example Text</p>',
      // place the cursor in the editor after initialization
      autofocus: true,
      // make the text editable (default is true)
      editable: true,
      // prevent loading the default CSS (which isn't much anyway)
      injectCSS: false,
    })
    

[](https://tiptap.dev/docs/editor/getting-started/configure#nodes-marks-and-extensions)
Nodes, marks, and extensions
--------------------------------------------------------------------------------------------------------------------

Most editing features are packaged as [nodes](https://tiptap.dev/docs/editor/extensions/nodes)
, [marks](https://tiptap.dev/docs/editor/extensions/marks)
, or [functionality](https://tiptap.dev/docs/editor/extensions/functionality)
. Import what you need and pass them as an array to the editor.

Here's the minimal setup with only three extensions:

    import { Editor } from '@tiptap/core'
    import Document from '@tiptap/extension-document'
    import Paragraph from '@tiptap/extension-paragraph'
    import Text from '@tiptap/extension-text'
    
    new Editor({
      element: document.querySelector('.element'),
      extensions: [Document, Paragraph, Text],
    })
    

### [](https://tiptap.dev/docs/editor/getting-started/configure#configure-extensions)
Configure extensions

Many extensions can be configured with the `.configure()` method. You can pass an object with specific settings.

For example, to limit the heading levels to 1, 2, and 3, configure the [`Heading`](https://tiptap.dev/docs/editor/extensions/nodes/heading)
 extension as shown below:

    import { Editor } from '@tiptap/core'
    import Document from '@tiptap/extension-document'
    import Paragraph from '@tiptap/extension-paragraph'
    import Text from '@tiptap/extension-text'
    import Heading from '@tiptap/extension-heading'
    
    new Editor({
      element: document.querySelector('.element'),
      extensions: [\
        Document,\
        Paragraph,\
        Text,\
        Heading.configure({\
          levels: [1, 2, 3],\
        }),\
      ],
    })
    

Refer to the extension's documentation for available settings.

### [](https://tiptap.dev/docs/editor/getting-started/configure#a-bundle-with-the-most-common-extensions)
A bundle with the most common extensions

We have bundled a few of the most common extensions into the [`StarterKit`](https://tiptap.dev/docs/editor/extensions/functionality/starterkit)
. Here's how to use it:

    import StarterKit from '@tiptap/starter-kit'
    
    new Editor({
      extensions: [StarterKit],
    })
    

You can configure all extensions included in the [StarterKit](https://tiptap.dev/docs/editor/extensions/functionality/starterkit)
 by passing an object. To target specific extensions, prefix their configuration with the name of the extension. For example, to limit heading levels to 1, 2, and 3:

    import StarterKit from '@tiptap/starter-kit'
    
    new Editor({
      extensions: [\
        StarterKit.configure({\
          heading: {\
            levels: [1, 2, 3],\
          },\
        }),\
      ],
    })
    

### [](https://tiptap.dev/docs/editor/getting-started/configure#disable-specific-starterkit-extensions)
Disable specific StarterKit extensions

To exclude certain extensions [StarterKit](https://tiptap.dev/docs/editor/extensions/functionality/starterkit)
, you can set them to `false` in the configuration. For example, to disable the [`Undo/Redo History`](https://tiptap.dev/docs/editor/extensions/functionality/undo-redo)
 extension:

    import StarterKit from '@tiptap/starter-kit'
    
    new Editor({
      extensions: [\
        StarterKit.configure({\
          history: false,\
        }),\
      ],
    })
    

When using Tiptap's [`Collaboration`](https://tiptap.dev/docs/editor/extensions/functionality/collaboration)
, which comes with its own history extension, you must disable the `Undo/Redo History` extension included in the [StarterKit](https://tiptap.dev/docs/editor/extensions/functionality/starterkit)
 to avoid conflicts.

### [](https://tiptap.dev/docs/editor/getting-started/configure#additional-extensions)
Additional extensions

The [StarterKit](https://tiptap.dev/docs/editor/extensions/functionality/starterkit)
 doesn't include all available extensions. To add more features to your editor, list them in the `extensions` array. For example, to add the [`Strike`](https://tiptap.dev/docs/editor/extensions/marks/strike)
 extension:

    import StarterKit from '@tiptap/starter-kit'
    import Strike from '@tiptap/extension-strike'
    
    new Editor({
      extensions: [StarterKit, Strike],
    })