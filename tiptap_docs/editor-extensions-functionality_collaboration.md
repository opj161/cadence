---
title: Collaboration extension | Tiptap Editor Docs
source_url: https://tiptap.dev/docs/editor/extensions/functionality/collaboration#page-title
ogUrl: https://tiptap.dev/docs/editor/extensions/functionality/collaboration
twitter:title: Collaboration extension | Tiptap Editor Docs
twitter:image: https://tiptap.dev/docs/api/og?title=Collaboration%20extension&category=Editor
language: en
ogImage: https://tiptap.dev/docs/api/og?title=Collaboration%20extension&category=Editor
og:url: https://tiptap.dev/docs/editor/extensions/functionality/collaboration
og:image:width: 1200
ogLocale: en_US
robots: index, follow
description: Learn how to set up and use collaborative editing with the Collaboration extension in Tiptap.
og:locale: en_US
og:image: https://tiptap.dev/docs/api/og?title=Collaboration%20extension&category=Editor
twitter:card: summary_large_image
docsearch:version: 2.x
twitter:description: Learn how to set up and use collaborative editing with the Collaboration extension in Tiptap.
og:title: Collaboration extension | Tiptap Editor Docs
ogTitle: Collaboration extension | Tiptap Editor Docs
ogDescription: Learn how to set up and use collaborative editing with the Collaboration extension in Tiptap.
viewport: width=device-width, initial-scale=1
og:description: Learn how to set up and use collaborative editing with the Collaboration extension in Tiptap.
favicon: https://tiptap.dev/docs/favicon.png
og:type: website
og:image:height: 630
scrapeId: cf464cd4-bad8-49ce-8581-ecda6b6acfe2
sourceURL: https://tiptap.dev/docs/editor/extensions/functionality/collaboration#page-title
url: https://tiptap.dev/docs/editor/extensions/functionality/collaboration#page-title
statusCode: 200
---

This small guide quickly shows how to integrate basic collaboration functionality into your editor. For a proper collaboration integration, review the documentation of [Tiptap Collaboration](https://tiptap.dev/docs/collaboration/getting-started/overview)
, which is a cloud and on-premises collaboration server solution.

[](https://tiptap.dev/docs/editor/extensions/functionality/collaboration#install)
Install
-----------------------------------------------------------------------------------------

### More details

For more detailed information on how to integrate, install, and configure the Collaboration extension with the Tiptap Collaboration product, please visit our [feature page](https://tiptap.dev/docs/collaboration/getting-started/overview)
.

    npm install @tiptap/extension-collaboration yjs y-websocket y-prosemirror
    

[](https://tiptap.dev/docs/editor/extensions/functionality/collaboration#settings)
Settings
-------------------------------------------------------------------------------------------

### [](https://tiptap.dev/docs/editor/extensions/functionality/collaboration#document)
document

An initialized Y.js document.

Default: `null`

    Collaboration.configure({
      document: new Y.Doc(),
    })
    

### [](https://tiptap.dev/docs/editor/extensions/functionality/collaboration#field)
field

Name of a Y.js fragment, can be changed to sync multiple fields with one Y.js document.

Default: `'default'`

    Collaboration.configure({
      document: new Y.Doc(),
      field: 'title',
    })
    

### [](https://tiptap.dev/docs/editor/extensions/functionality/collaboration#fragment)
fragment

A raw Y.js fragment, can be used instead of `document` and `field`.

Default: `null`

    Collaboration.configure({
      fragment: new Y.Doc().getXmlFragment('body'),
    })
    

[](https://tiptap.dev/docs/editor/extensions/functionality/collaboration#commands)
Commands
-------------------------------------------------------------------------------------------

The `Collaboration` extension comes with its own history extension. Make sure to disable the default extension, if you’re working with the `StarterKit`.

### [](https://tiptap.dev/docs/editor/extensions/functionality/collaboration#undo)
undo()

Undo the last change.

    editor.commands.undo()
    

### [](https://tiptap.dev/docs/editor/extensions/functionality/collaboration#redo)
redo()

Redo the last change.

    editor.commands.redo()
    

[](https://tiptap.dev/docs/editor/extensions/functionality/collaboration#keyboard-shortcuts)
Keyboard shortcuts
---------------------------------------------------------------------------------------------------------------

| Command | Windows/Linux | macOS |
| --- | --- | --- |
| undo() | Control + Z | Cmd + Z |
| redo() | Shift + Control + Z or Control + Y | Shift + Cmd + Z or Cmd + Y |

[](https://tiptap.dev/docs/editor/extensions/functionality/collaboration#source-code)
Source code
-------------------------------------------------------------------------------------------------

[packages/extension-collaboration/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-collaboration/)

[](https://tiptap.dev/docs/editor/extensions/functionality/collaboration#you-did-it)
You Did It!
------------------------------------------------------------------------------------------------

Your editor is now collaborative! Invite your friends and start typing together 🙌🏻 If you want to continue building out your collaborative editing features, make sure to check out the [Tiptap Collaboration Docs](https://tiptap.dev/docs/collaboration/getting-started/overview)
 for a fully hosted on on-premises collaboration server solution.

Collaboration
-------------

Fasten your seatbelts! Make your rich text editor collaborative with Tiptap Collaboration.

*   Real-time everything
*   Offline-first & conflict free
*   Managed and hosted by us or on your premises

[Learn more](https://tiptap.dev/docs/collaboration/getting-started/overview)

On this page

[Introduction](https://tiptap.dev/docs/editor/extensions/functionality/collaboration#page-title)
[Install](https://tiptap.dev/docs/editor/extensions/functionality/collaboration#install)
 [Settings](https://tiptap.dev/docs/editor/extensions/functionality/collaboration#settings)
 [Commands](https://tiptap.dev/docs/editor/extensions/functionality/collaboration#commands)
 [Keyboard shortcuts](https://tiptap.dev/docs/editor/extensions/functionality/collaboration#keyboard-shortcuts)
 [Source code](https://tiptap.dev/docs/editor/extensions/functionality/collaboration#source-code)
 [You Did It!](https://tiptap.dev/docs/editor/extensions/functionality/collaboration#you-did-it)

![Cookiebot session tracker icon loaded](https://imgsct.cookiebot.com/1.gif?dgi=73ee9606-0ee4-41ab-85ee-7626f8741637)