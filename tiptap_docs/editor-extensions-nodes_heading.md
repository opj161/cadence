---
title: Heading extension | Tiptap Editor Docs
source_url: https://tiptap.dev/docs/editor/extensions/nodes/heading#page-title
language: en
robots: index, follow
og:type: website
description: Use the Heading extension in Tiptap to add support for headings of different levels with <h> HTML tags. Learn more in our docs!
twitter:title: Heading extension | Tiptap Editor Docs
twitter:description: Use the Heading extension in Tiptap to add support for headings of different levels with <h> HTML tags. Learn more in our docs!
viewport: width=device-width, initial-scale=1
og:locale: en_US
ogDescription: Use the Heading extension in Tiptap to add support for headings of different levels with <h> HTML tags. Learn more in our docs!
twitter:card: summary_large_image
og:image: https://tiptap.dev/docs/api/og?title=Heading%20extension&category=Editor
og:image:width: 1200
og:url: https://tiptap.dev/docs/editor/extensions/nodes/heading
ogLocale: en_US
favicon: https://tiptap.dev/docs/favicon.png
docsearch:version: 2.x
og:image:height: 630
ogTitle: Heading extension | Tiptap Editor Docs
ogImage: https://tiptap.dev/docs/api/og?title=Heading%20extension&category=Editor
ogUrl: https://tiptap.dev/docs/editor/extensions/nodes/heading
og:title: Heading extension | Tiptap Editor Docs
twitter:image: https://tiptap.dev/docs/api/og?title=Heading%20extension&category=Editor
og:description: Use the Heading extension in Tiptap to add support for headings of different levels with <h> HTML tags. Learn more in our docs!
scrapeId: 1ea5b5db-1e21-485e-9a97-fef17acb35b5
sourceURL: https://tiptap.dev/docs/editor/extensions/nodes/heading#page-title
url: https://tiptap.dev/docs/editor/extensions/nodes/heading#page-title
statusCode: 200
---

The Heading extension adds support for headings of different levels. Headings are rendered with `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>` or `<h6>` HTML tags. By default all six heading levels (or styles) are enabled, but you can pass an array to only allow a few levels. Check the usage example to see how this is done.

Type `#` at the beginning of a new line and it will magically transform to a heading, same for `##` , `###` , `####` , `#####` and `######` .

[](https://tiptap.dev/docs/editor/extensions/nodes/heading#install)
Install
---------------------------------------------------------------------------

    npm install @tiptap/extension-heading
    

[](https://tiptap.dev/docs/editor/extensions/nodes/heading#settings)
Settings
-----------------------------------------------------------------------------

### [](https://tiptap.dev/docs/editor/extensions/nodes/heading#htmlattributes)
HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

    Heading.configure({
      HTMLAttributes: {
        class: 'my-custom-class',
      },
    })
    

### [](https://tiptap.dev/docs/editor/extensions/nodes/heading#levels)
levels

Specifies which heading levels are supported.

Default: `[1, 2, 3, 4, 5, 6]`

    Heading.configure({
      levels: [1, 2],
    })
    

[](https://tiptap.dev/docs/editor/extensions/nodes/heading#commands)
Commands
-----------------------------------------------------------------------------

### [](https://tiptap.dev/docs/editor/extensions/nodes/heading#setheading)
setHeading()

Creates a heading node with the specified level.

    editor.commands.setHeading({ level: 1 })
    

### [](https://tiptap.dev/docs/editor/extensions/nodes/heading#toggleheading)
toggleHeading()

Toggles a heading node with the specified level.

    editor.commands.toggleHeading({ level: 1 })
    

[](https://tiptap.dev/docs/editor/extensions/nodes/heading#keyboard-shortcuts)
Keyboard shortcuts
-------------------------------------------------------------------------------------------------

| Command | Windows/Linux | macOS |
| --- | --- | --- |
| toggleHeading( level: 1 ) | Control + Alt + 1 | Cmd + Alt + 1 |
| toggleHeading( level: 2 ) | Control + Alt + 2 | Cmd + Alt + 2 |
| toggleHeading( level: 3 ) | Control + Alt + 3 | Cmd + Alt + 3 |
| toggleHeading( level: 4 ) | Control + Alt + 4 | Cmd + Alt + 4 |
| toggleHeading( level: 5 ) | Control + Alt + 5 | Cmd + Alt + 5 |
| toggleHeading( level: 6 ) | Control + Alt + 6 | Cmd + Alt + 6 |

[](https://tiptap.dev/docs/editor/extensions/nodes/heading#source-code)
Source code
-----------------------------------------------------------------------------------

[packages/extension-heading/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-heading/)

On this page

[Introduction](https://tiptap.dev/docs/editor/extensions/nodes/heading#page-title)
[Install](https://tiptap.dev/docs/editor/extensions/nodes/heading#install)
 [Settings](https://tiptap.dev/docs/editor/extensions/nodes/heading#settings)
 [Commands](https://tiptap.dev/docs/editor/extensions/nodes/heading#commands)
 [Keyboard shortcuts](https://tiptap.dev/docs/editor/extensions/nodes/heading#keyboard-shortcuts)
 [Source code](https://tiptap.dev/docs/editor/extensions/nodes/heading#source-code)

![Cookiebot session tracker icon loaded](https://imgsct.cookiebot.com/1.gif?dgi=73ee9606-0ee4-41ab-85ee-7626f8741637)