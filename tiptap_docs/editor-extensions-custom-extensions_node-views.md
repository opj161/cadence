---
title: Node views | Tiptap Editor Docs
source_url: https://tiptap.dev/docs/editor/extensions/custom-extensions/node-views#page-title
og:type: website
twitter:description: Customize and create nodes in your Tiptap editor for editable and non-editable content with interactive node views. More in the docs!
viewport: width=device-width, initial-scale=1
og:image:width: 1200
og:image:height: 630
ogImage: https://tiptap.dev/docs/api/og?title=Create%20a%20custom%20node%20view&category=Editor
twitter:card: summary_large_image
og:url: https://tiptap.dev/docs/editor/extensions/custom-extensions/node-views
og:title: Node views | Tiptap Editor Docs
og:image: https://tiptap.dev/docs/api/og?title=Create%20a%20custom%20node%20view&category=Editor
description: Customize and create nodes in your Tiptap editor for editable and non-editable content with interactive node views. More in the docs!
ogDescription: Customize and create nodes in your Tiptap editor for editable and non-editable content with interactive node views. More in the docs!
favicon: https://tiptap.dev/docs/favicon.png
docsearch:version: 2.x
ogTitle: Node views | Tiptap Editor Docs
ogLocale: en_US
language: en
twitter:title: Node views | Tiptap Editor Docs
og:description: Customize and create nodes in your Tiptap editor for editable and non-editable content with interactive node views. More in the docs!
twitter:image: https://tiptap.dev/docs/api/og?title=Create%20a%20custom%20node%20view&category=Editor
robots: index, follow
ogUrl: https://tiptap.dev/docs/editor/extensions/custom-extensions/node-views
og:locale: en_US
scrapeId: 6aa0391c-4720-4fb9-a191-4e073c215611
sourceURL: https://tiptap.dev/docs/editor/extensions/custom-extensions/node-views#page-title
url: https://tiptap.dev/docs/editor/extensions/custom-extensions/node-views#page-title
statusCode: 200
---

Node views are the best thing since sliced bread, at least if you are a fan of customization (and bread). With node views you can add interactive nodes to your editor. That can literally be everything. If you can write it in JavaScript, you can use it in your editor.

Node views are amazing to improve the in-editor experience, but can also be used in a read-only instance of Tiptap. They are unrelated to the HTML output by design, so you have full control about the in-editor experience _and_ the output.

[](https://tiptap.dev/docs/editor/extensions/custom-extensions/node-views#different-types-of-node-views)
Different types of node views
--------------------------------------------------------------------------------------------------------------------------------------

Depending on what you would like to build, node views work a little bit different and can have their very specific capabilities, but also pitfalls. The main question is: How should your custom node look like?

### [](https://tiptap.dev/docs/editor/extensions/custom-extensions/node-views#editable-text)
Editable text

Yes, node views can have editable text, just like a regular node. That’s simple. The cursor will exactly behave like you would expect it from a regular node. Existing commands work very well with those nodes.

    <div class="Prosemirror" contenteditable="true">
      <p>text</p>
      <node-view>text</node-view>
      <p>text</p>
    </div>
    

That’s how the [`TaskItem`](https://tiptap.dev/docs/editor/extensions/nodes/task-item)
 node works.

### [](https://tiptap.dev/docs/editor/extensions/custom-extensions/node-views#non-editable-text)
Non-editable text

Nodes can also have text, which is not editable. The cursor can’t jump into those, but you don’t want that anyway.

Tiptap adds a `contenteditable="false"` to those by default.

    <div class="Prosemirror" contenteditable="true">
      <p>text</p>
      <node-view contenteditable="false">text</node-view>
      <p>text</p>
    </div>
    

That’s how you could render mentions, which shouldn’t be editable. Users can add or delete them, but not delete single characters.

Statamic uses those for their Bard editor, which renders complex modules inside Tiptap, which can have their own text inputs.

### [](https://tiptap.dev/docs/editor/extensions/custom-extensions/node-views#mixed-content)
Mixed content

You can even mix non-editable and editable text. That’s great to build complex things, and still use marks like bold and italic inside the editable content.

**BUT**, if there are other elements with non-editable text in your node view, the cursor can jump there. You can improve that with manually adding `contenteditable="false"` to the specific parts of your node view.

    <div class="Prosemirror" contenteditable="true">
      <p>text</p>
      <node-view>
        <div contenteditable="false">non-editable text</div>
        <div>editable text</div>
      </node-view>
      <p>text</p>
    </div>
    

[](https://tiptap.dev/docs/editor/extensions/custom-extensions/node-views#markup)
Markup
----------------------------------------------------------------------------------------

But what happens if you [access the editor content](https://tiptap.dev/docs/guides/output-json-html)
? If you’re working with HTML, you’ll need to tell Tiptap how your node should be serialized.

The editor **does not** export the rendered JavaScript node, and for a lot of use cases you wouldn’t want that anyway.

Let’s say you have a node view which lets users add a video player and configure the appearance (autoplay, controls, …). You want the interface to do that in the editor, not in the output of the editor. The output of the editor should probably only have the video player.

I know, I know, it’s not that easy. Just keep in mind, that you‘re in full control of the rendering inside the editor and of the output.

### What if you store JSON?

That doesn’t apply to JSON. In JSON, everything is stored as an object. There is no need to configure the “translation” to and from JSON.

### [](https://tiptap.dev/docs/editor/extensions/custom-extensions/node-views#render-html)
Render HTML

Okay, you’ve set up your node with an interactive node view and now you want to control the output. Even if your node view is pretty complex, the rendered HTML can be simple:

    renderHTML({ HTMLAttributes }) {
      return ['my-custom-node', mergeAttributes(HTMLAttributes)]
    },
    
    // Output: <my-custom-node count="1"></my-custom-node>
    

Make sure it’s something distinguishable, so it’s easier to restore the content from the HTML. If you just need something generic markup like a `<div>` consider to add a `data-type="my-custom-node"`.

### [](https://tiptap.dev/docs/editor/extensions/custom-extensions/node-views#parse-html)
Parse HTML

The same applies to restoring the content. You can configure what markup you expect, that can be something completely unrelated to the node view markup. It just needs to contain all the information you want to restore.

Attributes are automagically restored, if you registered them through [`addAttributes`](https://tiptap.dev/docs/editor/extensions/custom-extensions/extend-existing#attributes)
.

    // Input: <my-custom-node count="1"></my-custom-node>
    
    parseHTML() {
      return [{\
        tag: 'my-custom-node',\
      }]
    },
    

### [](https://tiptap.dev/docs/editor/extensions/custom-extensions/node-views#render-javascriptvuereact)
Render JavaScript/Vue/React

But what if you want to render your actual JavaScript/Vue/React code? Consider using Tiptap to render your output. Just set the editor to `editable: false` and no one will notice you’re using an editor to render the content. :-)

On this page

[Introduction](https://tiptap.dev/docs/editor/extensions/custom-extensions/node-views#page-title)
[Different types of node views](https://tiptap.dev/docs/editor/extensions/custom-extensions/node-views#different-types-of-node-views)
 [Markup](https://tiptap.dev/docs/editor/extensions/custom-extensions/node-views#markup)