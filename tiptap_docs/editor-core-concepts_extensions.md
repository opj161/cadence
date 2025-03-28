---
title: Extensions | Tiptap Editor Docs
source_url: https://tiptap.dev/docs/editor/core-concepts/extensions#page-title
docsearch:version: 2.x
viewport: width=device-width, initial-scale=1
og:title: Extensions | Tiptap Editor Docs
og:description: Learn how to create, customize, and integrate extensions into Tiptap to improve your text editor's functionality.
language: en
twitter:image: https://tiptap.dev/docs/api/og?title=Extensions%20in%20Tiptap&category=
twitter:card: summary_large_image
ogLocale: en_US
og:url: https://tiptap.dev/docs/editor/core-concepts/extensions
og:locale: en_US
ogTitle: Extensions | Tiptap Editor Docs
robots: index, follow
og:image:width: 1200
og:image:height: 630
og:type: website
ogImage: https://tiptap.dev/docs/api/og?title=Extensions%20in%20Tiptap&category=
ogUrl: https://tiptap.dev/docs/editor/core-concepts/extensions
favicon: https://tiptap.dev/docs/favicon.png
description: Learn how to create, customize, and integrate extensions into Tiptap to improve your text editor's functionality.
ogDescription: Learn how to create, customize, and integrate extensions into Tiptap to improve your text editor's functionality.
og:image: https://tiptap.dev/docs/api/og?title=Extensions%20in%20Tiptap&category=
twitter:title: Extensions | Tiptap Editor Docs
twitter:description: Learn how to create, customize, and integrate extensions into Tiptap to improve your text editor's functionality.
scrapeId: b695e7aa-5e27-4135-8c62-2b27ffefb31c
sourceURL: https://tiptap.dev/docs/editor/core-concepts/extensions#page-title
url: https://tiptap.dev/docs/editor/core-concepts/extensions#page-title
statusCode: 200
---

Extensions enhance Tiptap by adding new capabilities or modifying the editor's behavior. Whether it is adding new types of content, customizing the editor's appearance, or extending its functionality, extensions are the building blocks of Tiptap.

To add new types of content into your editor you can use [nodes](https://tiptap.dev/docs/editor/api/nodes)
 and [marks](https://tiptap.dev/docs/editor/extensions/marks)
 which can render content in the editor.

The optional `@tiptap/starter-kit` includes the most commonly used extensions, simplifying setup. Read more about [`StarterKit`](https://tiptap.dev/docs/editor/getting-started/configure#default-extensions)
.

Expand your editor's functionality with extensions created by the Tiptap community. Discover a variety of custom features and tools in the [Awesome Tiptap Repository](https://github.com/ueberdosis/awesome-tiptap#community-extensions)
. For collaboration and support, engage with other developers in the [Discussion Thread](https://github.com/ueberdosis/tiptap/discussions/2973)
 on community-built extensions.

[](https://tiptap.dev/docs/editor/core-concepts/extensions#what-are-extensions)
What are extensions?
----------------------------------------------------------------------------------------------------

Although Tiptap tries to hide most of the complexity of ProseMirror, it’s built on top of its APIs and we recommend you to read through the [ProseMirror Guide](https://prosemirror.net/docs/guide/)
 for advanced usage. You’ll have a better understanding of how everything works under the hood and get more familiar with many terms and jargon used by Tiptap.

Existing [nodes](https://tiptap.dev/docs/editor/extensions/nodes)
, [marks](https://tiptap.dev/docs/editor/extensions/marks)
 and [functionality](https://tiptap.dev/docs/editor/extensions/functionality)
 can give you a good impression on how to approach your own extensions. To make it easier to switch between the documentation and the source code, we linked to the file on GitHub from every single extension documentation page.

We recommend to start with customizing existing extensions first, and create your own extensions with the gained knowledge later. That’s why all the examples below extend existing extensions, but all examples will work on newly created extensions as well.

[](https://tiptap.dev/docs/editor/core-concepts/extensions#create-a-new-extension)
Create a new extension
---------------------------------------------------------------------------------------------------------

You’re free to create your own extensions for Tiptap. Here is the boilerplate code that’s needed to create and register your own extension:

    import { Extension } from '@tiptap/core'
    
    const CustomExtension = Extension.create({
      // Your code here
    })
    
    const editor = new Editor({
      extensions: [\
        // Register your custom extension with the editor.\
        CustomExtension,\
        // … and don’t forget all other extensions.\
        Document,\
        Paragraph,\
        Text,\
        // …\
      ],
    })
    

You can easily bootstrap a new extension via our CLI.

    npm init tiptap-extension
    

Learn more about custom extensions in our [guide](https://tiptap.dev/docs/editor/extensions/custom-extensions)
.