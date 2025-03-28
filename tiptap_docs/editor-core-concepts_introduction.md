---
title: Tiptap Concepts | Tiptap Editor Docs
source_url: https://tiptap.dev/docs/editor/core-concepts/introduction#vocabulary
ogTitle: Tiptap Concepts | Tiptap Editor Docs
og:url: https://tiptap.dev/docs/editor/core-concepts/introduction
og:image: https://tiptap.dev/docs/api/og?title=Tiptap%20Concepts&category=Editor
ogDescription: Learn how to integrate Tiptap's document schema, transaction-based state management, and editor extensions in our docs.
ogLocale: en_US
twitter:description: Learn how to integrate Tiptap's document schema, transaction-based state management, and editor extensions in our docs.
language: en
ogUrl: https://tiptap.dev/docs/editor/core-concepts/introduction
og:description: Learn how to integrate Tiptap's document schema, transaction-based state management, and editor extensions in our docs.
twitter:title: Tiptap Concepts | Tiptap Editor Docs
og:locale: en_US
favicon: https://tiptap.dev/docs/favicon.png
robots: index, follow
og:image:width: 1200
og:image:height: 630
viewport: width=device-width, initial-scale=1
ogImage: https://tiptap.dev/docs/api/og?title=Tiptap%20Concepts&category=Editor
twitter:image: https://tiptap.dev/docs/api/og?title=Tiptap%20Concepts&category=Editor
og:type: website
description: Learn how to integrate Tiptap's document schema, transaction-based state management, and editor extensions in our docs.
og:title: Tiptap Concepts | Tiptap Editor Docs
twitter:card: summary_large_image
docsearch:version: 2.x
scrapeId: 4f399d30-a1f5-4d00-b8e3-45b31dd78b9d
sourceURL: https://tiptap.dev/docs/editor/core-concepts/introduction#vocabulary
url: https://tiptap.dev/docs/editor/core-concepts/introduction#vocabulary
statusCode: 200
---

[](https://tiptap.dev/docs/editor/core-concepts/introduction#structure)
Structure
---------------------------------------------------------------------------------

ProseMirror works with a strict [Schema](https://tiptap.dev/docs/editor/core-concepts/schema)
, which defines the allowed structure of a document. A document is a tree of headings, paragraphs and others elements, so called nodes. Marks can be attached to a node, e. g. to emphasize part of it. [Commands](https://tiptap.dev/docs/editor/api/commands)
 change that document programmatically.

[](https://tiptap.dev/docs/editor/core-concepts/introduction#content)
Content
-----------------------------------------------------------------------------

The document is stored in a state. All changes are applied as transactions to the state. The state has details about the current content, cursor position and selection. You can hook into a few different [events](https://tiptap.dev/docs/editor/api/events)
, for example to alter transactions before they get applied.

[](https://tiptap.dev/docs/editor/core-concepts/introduction#extensions)
Extensions
-----------------------------------------------------------------------------------

Extensions add [nodes](https://tiptap.dev/docs/editor/extensions/nodes)
, [marks](https://tiptap.dev/docs/editor/extensions/marks)
 and/or [functionalities](https://tiptap.dev/docs/editor/extensions/functionality)
 to the editor. A lot of those extensions bound their commands to common [keyboard shortcuts](https://tiptap.dev/docs/editor/core-concepts/keyboard-shortcuts)
.

[](https://tiptap.dev/docs/editor/core-concepts/introduction#vocabulary)
Vocabulary
-----------------------------------------------------------------------------------

ProseMirror has its own vocabulary and you’ll stumble upon all those words now and then. Here is a short overview of the most common words we use in the documentation.

| Word | Description |
| --- | --- |
| Schema | Configures the structure your content can have. |
| Document | The actual content in your editor. |
| State | Everything to describe the current content and selection of your editor. |
| Transaction | A change to the state (updated selection, content, …) |
| Extension | Registers new functionality. |
| Node | A type of content, for example a heading or a paragraph. |
| Mark | Can be applied to nodes, for example for inline formatting. |
| Command | Execute an action inside the editor, that somehow changes the state. |
| Decoration | Styling on top of the document, for example to highlight mistakes. |