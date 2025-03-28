---
title: Create extensions | Tiptap Editor Docs
source_url: https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new#share
viewport: width=device-width, initial-scale=1
description: Create a new extension for your Tiptap editor and create a unique editor experience from scratch. Learn more in the docs!
robots: index, follow
docsearch:version: 2.x
twitter:image: https://tiptap.dev/docs/api/og?title=Create%20a%20new%20extension&category=Editor
og:url: https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new
ogTitle: Create extensions | Tiptap Editor Docs
og:image:width: 1200
og:title: Create extensions | Tiptap Editor Docs
og:description: Create a new extension for your Tiptap editor and create a unique editor experience from scratch. Learn more in the docs!
ogDescription: Create a new extension for your Tiptap editor and create a unique editor experience from scratch. Learn more in the docs!
language: en
ogUrl: https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new
twitter:description: Create a new extension for your Tiptap editor and create a unique editor experience from scratch. Learn more in the docs!
favicon: https://tiptap.dev/docs/favicon.png
og:type: website
og:image: https://tiptap.dev/docs/api/og?title=Create%20a%20new%20extension&category=Editor
og:image:height: 630
ogImage: https://tiptap.dev/docs/api/og?title=Create%20a%20new%20extension&category=Editor
og:locale: en_US
twitter:card: summary_large_image
twitter:title: Create extensions | Tiptap Editor Docs
ogLocale: en_US
scrapeId: 6b07677e-214d-4195-89c4-506f4d2a324f
sourceURL: https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new#share
url: https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new#share
statusCode: 200
---

You can build your own extensions from scratch and you know what? It’s the same syntax as for extending existing extension described above.

### [](https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new#create-a-node)
Create a node

If you think of the document as a tree, then [nodes](https://tiptap.dev/docs/editor/extensions/nodes)
 are just a type of content in that tree. Good examples to learn from are [`Paragraph`](https://tiptap.dev/docs/editor/extensions/nodes/paragraph)
, [`Heading`](https://tiptap.dev/docs/editor/extensions/nodes/heading)
, or [`CodeBlock`](https://tiptap.dev/docs/editor/extensions/nodes/code-block)
.

    import { Node } from '@tiptap/core'
    
    const CustomNode = Node.create({
      name: 'customNode',
    
      // Your code goes here.
    })
    

Nodes don’t have to be blocks. They can also be rendered inline with the text, for example for [@mentions](https://tiptap.dev/docs/editor/extensions/nodes/mention)
.

### [](https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new#create-a-mark)
Create a mark

One or multiple marks can be applied to [nodes](https://tiptap.dev/docs/editor/extensions/nodes)
, for example to add inline formatting. Good examples to learn from are [`Bold`](https://tiptap.dev/docs/editor/extensions/marks/bold)
, [`Italic`](https://tiptap.dev/docs/editor/extensions/marks/italic)
 and [`Highlight`](https://tiptap.dev/docs/editor/extensions/marks/highlight)
.

    import { Mark } from '@tiptap/core'
    
    const CustomMark = Mark.create({
      name: 'customMark',
    
      // Your code goes here.
    })
    

### [](https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new#create-an-extension)
Create an extension

Extensions add new capabilities to Tiptap and you’ll read the word extension here very often, even for nodes and marks. But there are literal extensions. Those can’t add to the schema (like marks and nodes do), but can add functionality or change the behaviour of the editor.

A good example to learn from is probably [`TextAlign`](https://tiptap.dev/docs/editor/extensions/functionality/textalign)
.

    import { Extension } from '@tiptap/core'
    
    const CustomExtension = Extension.create({
      name: 'customExtension',
    
      // Your code goes here.
    })
    

[](https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new#publish-standalone-extensions)
Publish standalone extensions
--------------------------------------------------------------------------------------------------------------------------------------

If you want to create and publish your own extensions for Tiptap, you can use our CLI tool to bootstrap your project. Simply run `npm init tiptap-extension` and follow the instructions. The CLI will create a new folder with a pre-configured project for you including a build script running on Rollup.

If you want to test your extension locally, you can run `npm link` in the project folder and then `npm link YOUR_EXTENSION` in your project (for example a Vite app).

When everything is working fine, don’t forget to [share it with the community](https://github.com/ueberdosis/tiptap/issues/819)
 or in our [awesome-tiptap](https://github.com/ueberdosis/awesome-tiptap)
 repository.

On this page

[Introduction](https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new#page-title)
[Publish standalone extensions](https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new#publish-standalone-extensions)
 [Share](https://tiptap.dev/docs/editor/extensions/custom-extensions/create-new#share)