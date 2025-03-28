---
title: Events in Tiptap | Tiptap Editor Docs
source_url: https://tiptap.dev/docs/editor/api/events#page-title
twitter:image: https://tiptap.dev/docs/api/og?title=Events%20in%20Tiptap&category=Editor
og:image:width: 1200
docsearch:version: 2.x
language: en
twitter:card: summary_large_image
twitter:description: Use and handle various events in Tiptap, including creation, updates, focus, blur, and destruction. More in the docs!
og:image: https://tiptap.dev/docs/api/og?title=Events%20in%20Tiptap&category=Editor
og:title: Events in Tiptap | Tiptap Editor Docs
ogImage: https://tiptap.dev/docs/api/og?title=Events%20in%20Tiptap&category=Editor
ogTitle: Events in Tiptap | Tiptap Editor Docs
ogLocale: en_US
description: Use and handle various events in Tiptap, including creation, updates, focus, blur, and destruction. More in the docs!
favicon: https://tiptap.dev/docs/favicon.png
ogDescription: Use and handle various events in Tiptap, including creation, updates, focus, blur, and destruction. More in the docs!
robots: index, follow
viewport: width=device-width, initial-scale=1
og:url: https://tiptap.dev/docs/editor/api/events
ogUrl: https://tiptap.dev/docs/editor/api/events
og:image:height: 630
og:description: Use and handle various events in Tiptap, including creation, updates, focus, blur, and destruction. More in the docs!
og:locale: en_US
og:type: website
twitter:title: Events in Tiptap | Tiptap Editor Docs
scrapeId: d919743e-de61-47aa-9dfa-ff7075aa439a
sourceURL: https://tiptap.dev/docs/editor/api/events#page-title
url: https://tiptap.dev/docs/editor/api/events#page-title
statusCode: 200
---

The editor fires a few different events that you can hook into. Let’s have a look at all the available events first.

[](https://tiptap.dev/docs/editor/api/events#list-of-available-events)
List of available events
-----------------------------------------------------------------------------------------------

| Event Name | Description |
| --- | --- |
| `beforeCreate` | Before the editor view is created. |
| `create` | When the editor is fully initialized and ready. |
| `update` | When there is a change in the content. |
| `selectionUpdate` | When the selection changes within the editor. |
| `transaction` | When the editor state changes due to any operation. |
| `focus` | When the editor gains focus. |
| `blur` | When the editor loses focus. |
| `destroy` | When the editor instance is being destroyed. |
| `paste` | When content is pasted into the editor. |
| `drop` | When content is dropped into the editor. |
| `contentError` | The content does not match the schema. [Read more here](https://tiptap.dev/docs/editor/core-concepts/schema#invalid-schema-handling) |

[](https://tiptap.dev/docs/editor/api/events#register-event-listeners)
Register event listeners
-----------------------------------------------------------------------------------------------

There are three ways to register event listeners.

### [](https://tiptap.dev/docs/editor/api/events#option-1-configuration)
Option 1: Configuration

You can define your event listeners on a new editor instance right-away:

    const editor = new Editor({
      onBeforeCreate({ editor }) {
        // Before the view is created.
      },
      onCreate({ editor }) {
        // The editor is ready.
      },
      onUpdate({ editor }) {
        // The content has changed.
      },
      onSelectionUpdate({ editor }) {
        // The selection has changed.
      },
      onTransaction({ editor, transaction }) {
        // The editor state has changed.
      },
      onFocus({ editor, event }) {
        // The editor is focused.
      },
      onBlur({ editor, event }) {
        // The editor isn’t focused anymore.
      },
      onDestroy() {
        // The editor is being destroyed.
      },
      onPaste(event: ClipboardEvent, slice: Slice) {
        // The editor is being pasted into.
      },
      onDrop(event: DragEvent, slice: Slice, moved: boolean) {
        // The editor is being pasted into.
      },
      onContentError({ editor, error, disableCollaboration }) {
        // The editor content does not match the schema.
      },
    })
    

### [](https://tiptap.dev/docs/editor/api/events#option-2-binding)
Option 2: Binding

Or you can register your event listeners on a running editor instance:

#### [](https://tiptap.dev/docs/editor/api/events#bind-event-listeners)
Bind event listeners

    editor.on('beforeCreate', ({ editor }) => {
      // Before the view is created.
    })
    
    editor.on('create', ({ editor }) => {
      // The editor is ready.
    })
    
    editor.on('update', ({ editor }) => {
      // The content has changed.
    })
    
    editor.on('selectionUpdate', ({ editor }) => {
      // The selection has changed.
    })
    
    editor.on('transaction', ({ editor, transaction }) => {
      // The editor state has changed.
    })
    
    editor.on('focus', ({ editor, event }) => {
      // The editor is focused.
    })
    
    editor.on('blur', ({ editor, event }) => {
      // The editor isn’t focused anymore.
    })
    
    editor.on('destroy', () => {
      // The editor is being destroyed.
    })
    
    editor.on('paste', ({ event, slice, editor }) => {
      // The editor is being pasted into.
    })
    
    editor.on('drop', ({ editor, event, slice, moved }) => {
      // The editor is being destroyed.
    })
    
    editor.on('contentError', ({ editor, error, disableCollaboration }) => {
      // The editor content does not match the schema.
    })
    

#### [](https://tiptap.dev/docs/editor/api/events#unbind-event-listeners)
Unbind event listeners

If you need to unbind those event listeners at some point, you should register your event listeners with `.on()` and unbind them with `.off()` then.

    const onUpdate = () => {
      // The content has changed.
    }
    
    // Bind …
    editor.on('update', onUpdate)
    
    // … and unbind.
    editor.off('update', onUpdate)
    

### [](https://tiptap.dev/docs/editor/api/events#option-3-extensions)
Option 3: Extensions

Moving your event listeners to custom extensions (or nodes, or marks) is also possible. Here’s how that would look like:

    import { Extension } from '@tiptap/core'
    
    const CustomExtension = Extension.create({
      onBeforeCreate({ editor }) {
        // Before the view is created.
      },
      onCreate({ editor }) {
        // The editor is ready.
      },
      onUpdate({ editor }) {
        // The content has changed.
      },
      onSelectionUpdate({ editor }) {
        // The selection has changed.
      },
      onTransaction({ editor, transaction }) {
        // The editor state has changed.
      },
      onFocus({ editor, event }) {
        // The editor is focused.
      },
      onBlur({ editor, event }) {
        // The editor isn’t focused anymore.
      },
      onDestroy() {
        // The editor is being destroyed.
      },
      onContentError({ editor, error, disableCollaboration }) {
        // The editor content does not match the schema.
      },
    })