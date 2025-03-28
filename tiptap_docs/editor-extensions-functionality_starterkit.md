---
title: StarterKit extension | Tiptap Editor Docs
source_url: https://tiptap.dev/docs/editor/extensions/functionality/starterkit#page-title
language: en
ogImage: https://tiptap.dev/docs/api/og?title=StarterKit%20extension&category=Editor
viewport: width=device-width, initial-scale=1
ogTitle: StarterKit extension | Tiptap Editor Docs
ogUrl: https://tiptap.dev/docs/editor/extensions/functionality/starterkit
twitter:title: StarterKit extension | Tiptap Editor Docs
description: All the popular extensions in one extension with StarterKit. Perfect for getting started with Tiptap. More in the docs!
og:type: website
og:url: https://tiptap.dev/docs/editor/extensions/functionality/starterkit
twitter:image: https://tiptap.dev/docs/api/og?title=StarterKit%20extension&category=Editor
favicon: https://tiptap.dev/docs/favicon.png
ogDescription: All the popular extensions in one extension with StarterKit. Perfect for getting started with Tiptap. More in the docs!
og:title: StarterKit extension | Tiptap Editor Docs
og:description: All the popular extensions in one extension with StarterKit. Perfect for getting started with Tiptap. More in the docs!
og:image:height: 630
ogLocale: en_US
og:image:width: 1200
og:locale: en_US
robots: index, follow
og:image: https://tiptap.dev/docs/api/og?title=StarterKit%20extension&category=Editor
twitter:card: summary_large_image
docsearch:version: 2.x
twitter:description: All the popular extensions in one extension with StarterKit. Perfect for getting started with Tiptap. More in the docs!
scrapeId: cb41abb1-84e6-466b-b1f1-13d5cc26014e
sourceURL: https://tiptap.dev/docs/editor/extensions/functionality/starterkit#page-title
url: https://tiptap.dev/docs/editor/extensions/functionality/starterkit#page-title
statusCode: 200
---

The `StarterKit` is a collection of the most popular Tiptap extensions. If you’re just getting started, this extension is for you.

[](https://tiptap.dev/docs/editor/extensions/functionality/starterkit#install)
Install
--------------------------------------------------------------------------------------

    npm install @tiptap/starter-kit
    

[](https://tiptap.dev/docs/editor/extensions/functionality/starterkit#included-extensions)
Included extensions
--------------------------------------------------------------------------------------------------------------

### [](https://tiptap.dev/docs/editor/extensions/functionality/starterkit#nodes)
Nodes

*   [`Blockquote`](https://tiptap.dev/docs/editor/extensions/nodes/blockquote)
    
*   [`BulletList`](https://tiptap.dev/docs/editor/extensions/nodes/bullet-list)
    
*   [`CodeBlock`](https://tiptap.dev/docs/editor/extensions/nodes/code-block)
    
*   [`Document`](https://tiptap.dev/docs/editor/extensions/nodes/document)
    
*   [`HardBreak`](https://tiptap.dev/docs/editor/extensions/nodes/hard-break)
    
*   [`Heading`](https://tiptap.dev/docs/editor/extensions/nodes/heading)
    
*   [`HorizontalRule`](https://tiptap.dev/docs/editor/extensions/nodes/horizontal-rule)
    
*   [`ListItem`](https://tiptap.dev/docs/editor/extensions/nodes/list-item)
    
*   [`OrderedList`](https://tiptap.dev/docs/editor/extensions/nodes/ordered-list)
    
*   [`Paragraph`](https://tiptap.dev/docs/editor/extensions/nodes/paragraph)
    
*   [`Text`](https://tiptap.dev/docs/editor/extensions/nodes/text)
    

### [](https://tiptap.dev/docs/editor/extensions/functionality/starterkit#marks)
Marks

*   [`Bold`](https://tiptap.dev/docs/editor/extensions/marks/bold)
    
*   [`Code`](https://tiptap.dev/docs/editor/extensions/marks/code)
    
*   [`Italic`](https://tiptap.dev/docs/editor/extensions/marks/italic)
    
*   [`Strike`](https://tiptap.dev/docs/editor/extensions/marks/strike)
    

### [](https://tiptap.dev/docs/editor/extensions/functionality/starterkit#extensions)
Extensions

*   [`Dropcursor`](https://tiptap.dev/docs/editor/extensions/functionality/dropcursor)
    
*   [`Gapcursor`](https://tiptap.dev/docs/editor/extensions/functionality/gapcursor)
    
*   [`History`](https://tiptap.dev/docs/collaboration/documents/history)
    

[](https://tiptap.dev/docs/editor/extensions/functionality/starterkit#source-code)
Source code
----------------------------------------------------------------------------------------------

[packages/starter-kit/](https://github.com/ueberdosis/tiptap/blob/main/packages/starter-kit/)

[](https://tiptap.dev/docs/editor/extensions/functionality/starterkit#using-the-starterkit-extension)
Using the StarterKit extension
------------------------------------------------------------------------------------------------------------------------------------

Pass `StarterKit` to the editor to load all included extension at once.

    import { Editor } from '@tiptap/core'
    import StarterKit from '@tiptap/starter-kit'
    
    const editor = new Editor({
      content: '<p>Example Text</p>',
      extensions: [StarterKit],
    })
    

You can configure the included extensions, or even disable a few of them, like shown below.

    import { Editor } from '@tiptap/core'
    import StarterKit from '@tiptap/starter-kit'
    
    const editor = new Editor({
      content: '<p>Example Text</p>',
      extensions: [\
        StarterKit.configure({\
          // Disable an included extension\
          history: false,\
    \
          // Configure an included extension\
          heading: {\
            levels: [1, 2],\
          },\
        }),\
      ],
    })
    

On this page

[Introduction](https://tiptap.dev/docs/editor/extensions/functionality/starterkit#page-title)
[Install](https://tiptap.dev/docs/editor/extensions/functionality/starterkit#install)
 [Included extensions](https://tiptap.dev/docs/editor/extensions/functionality/starterkit#included-extensions)
 [Source code](https://tiptap.dev/docs/editor/extensions/functionality/starterkit#source-code)
 [Using the StarterKit extension](https://tiptap.dev/docs/editor/extensions/functionality/starterkit#using-the-starterkit-extension)