---
title: Export to JSON and HTML | Tiptap Editor Docs
source_url: https://tiptap.dev/docs/guides/output-json-html#page-title
ogImage: https://tiptap.dev/docs/api/og?title=Output%20and%20content%20handling%20with%20Tiptap&category=Editor
ogDescription: Manage content formats in Tiptap Editor and export to JSON and HTML, using Y.js for advanced features. More in the docs!
viewport: width=device-width, initial-scale=1
twitter:card: summary_large_image
og:url: https://tiptap.dev/docs/guides/output-json-html
twitter:title: Export to JSON and HTML | Tiptap Editor Docs
og:title: Export to JSON and HTML | Tiptap Editor Docs
twitter:description: Manage content formats in Tiptap Editor and export to JSON and HTML, using Y.js for advanced features. More in the docs!
og:type: website
ogTitle: Export to JSON and HTML | Tiptap Editor Docs
robots: index, follow
docsearch:version: 2.x
og:description: Manage content formats in Tiptap Editor and export to JSON and HTML, using Y.js for advanced features. More in the docs!
ogUrl: https://tiptap.dev/docs/guides/output-json-html
favicon: https://tiptap.dev/docs/favicon.png
description: Manage content formats in Tiptap Editor and export to JSON and HTML, using Y.js for advanced features. More in the docs!
language: en
ogLocale: en_US
og:image: https://tiptap.dev/docs/api/og?title=Output%20and%20content%20handling%20with%20Tiptap&category=Editor
og:image:width: 1200
og:locale: en_US
twitter:image: https://tiptap.dev/docs/api/og?title=Output%20and%20content%20handling%20with%20Tiptap&category=Editor
og:image:height: 630
scrapeId: 46bbb649-2c91-40f3-bf31-a2bcce4d0745
sourceURL: https://tiptap.dev/docs/guides/output-json-html#page-title
url: https://tiptap.dev/docs/guides/output-json-html#page-title
statusCode: 200
---

You can store your content as a JSON object or as a good old HTML string. Both work fine. And of course, you can pass both formats to the editor to restore your content. Here is an interactive example, that exports the content as HTML and JSON when the document is changed:

[](https://tiptap.dev/docs/guides/output-json-html#export)
Export
-----------------------------------------------------------------

### [](https://tiptap.dev/docs/guides/output-json-html#option-1-json)
Option 1: JSON

JSON is probably easier to loop through, for example to look for a mention and it’s more like what Tiptap uses under the hood. Anyway, if you want to use JSON to store the content we provide a method to retrieve the content as JSON:

    const json = editor.getJSON()
    

You can store that in your database (or send it to an API) and restore the document initially:

    new Editor({
      content: {
        type: 'doc',
        content: [\
          // …\
        ],
      },
    })
    

Or if you need to wait for something, you can do it later through the editor instance:

    editor.commands.setContent({
      type: 'doc',
      content: [\
        // …\
      ],
    })
    

Here is an interactive example where you can see that in action:

### [](https://tiptap.dev/docs/guides/output-json-html#option-2-html)
Option 2: HTML

HTML can be easily rendered in other places, for example in emails and it’s widely used, so it’s probably easier to switch the editor at some point. Anyway, every editor instance provides a method to get HTML from the current document:

    const html = editor.getHTML()
    

This can then be used to restore the document initially:

    new Editor({
      content: `<p>Example Text</p>`,
    })
    

Or if you want to restore the content later (e. g. after an API call has finished), you can do that too:

    editor.commands.setContent(`<p>Example Text</p>`)
    

Use this interactive example to fiddle around:

### [](https://tiptap.dev/docs/guides/output-json-html#option-3-yjs)
Option 3: Y.js

Our editor has top notch support for Y.js, which is amazing to add features like [realtime collaboration, offline editing, or syncing between devices](https://tiptap.dev/docs/collaboration/getting-started/overview)
.

Internally, Y.js stores a history of all changes. That can be in the browser, on a server, synced with other connected clients, or on a USB stick. But, it’s important to know that Y.js needs those stored changes. A simple JSON document is not enough to merge changes.

Sure, you can import existing JSON documents to get started and get a JSON out of Y.js, but that’s more like an import/export format. It won’t be your single source. That’s important to consider when adding Y.js for one of the mentioned use cases.

That said, it’s amazing and we’re about to provide an amazing backend, that makes all that a breeze.

### [](https://tiptap.dev/docs/guides/output-json-html#markdown)
Markdown

Tiptap already provides import, export, and REST API conversions for Markdown (including GitHub Flavored Markdown). This lets you:

*   **Import `.md` or GFM** files into a Tiptap editor, converting them to Tiptap JSON
*   **Export** Tiptap JSON to standard Markdown or GFM, letting you save or share your editor content as a `.md` file.
*   **Integrate server-side** (no editor required) by sending or retrieving `.md` content via our Conversion REST API.

See [Markdown Conversion](https://tiptap.dev/docs/conversion/import-export/markdown)
 for details on how to handle other Markdown features, plus examples for both in-editor workflows and server-side usage.

**Tiptap v3 will deepen Markdown support.** We’re committed to making Markdown more robust and easier to integrate for advanced (AI) use cases.

[](https://tiptap.dev/docs/guides/output-json-html#listen-for-changes)
Listen for changes
-----------------------------------------------------------------------------------------

If you want to continuously store the updated content while people write, you can [hook into events](https://tiptap.dev/docs/editor/api/events)
. Here is an example how that could look like:

    const editor = new Editor({
      // intial content
      content: `<p>Example Content</p>`,
    
      // triggered on every change
      onUpdate: ({ editor }) => {
        const json = editor.getJSON()
        // send the content to an API here
      },
    })
    

[](https://tiptap.dev/docs/guides/output-json-html#render)
Render
-----------------------------------------------------------------

### [](https://tiptap.dev/docs/guides/output-json-html#option-1-read-only-instance-of-tiptap)
Option 1: Read-only instance of Tiptap

To render the saved content, set the editor to read-only. That’s how you can achieve the exact same rendering as it’s in the editor, without duplicating your CSS and other code.

### [](https://tiptap.dev/docs/guides/output-json-html#option-2-generate-html-from-prosemirror-json)
Option 2: Generate HTML from ProseMirror JSON

If you need to render the content on the server side, for example to generate the HTML for a blog post, which has been written in Tiptap, you’ll probably want to do just that without an actual editor instance.

That’s what the `generateHTML()` is for. It’s a helper function which renders HTML without an actual editor instance.

By the way, the other way is possible, too. The below examples shows how to generate JSON from HTML.

[](https://tiptap.dev/docs/guides/output-json-html#migrate)
Migrate
-------------------------------------------------------------------

If you’re migrating existing content to Tiptap we would recommend to get your existing output to HTML. That’s probably the best format to get your initial content into Tiptap, because ProseMirror ensures there is nothing wrong with it. Even if there are some tags or attributes that aren’t allowed (based on your configuration), Tiptap just throws them away quietly.

We’re about to go through a few cases to help with that, for example we provide a PHP package to convert HTML to a compatible JSON structure: [ueberdosis/prosemirror-to-html](https://github.com/ueberdosis/html-to-prosemirror)
.

[Share your experiences with us!](mailto:humans@tiptap.dev)
 We’d like to add more information here.

[](https://tiptap.dev/docs/guides/output-json-html#security)
Security
---------------------------------------------------------------------

There is no reason to use one or the other because of security concerns. If someone wants to send malicious content to your server, it doesn’t matter if it’s JSON or HTML. It doesn’t even matter if you’re using Tiptap or not. You should always validate user input.

On this page

[Introduction](https://tiptap.dev/docs/guides/output-json-html#page-title)
[Export](https://tiptap.dev/docs/guides/output-json-html#export)
 [Listen for changes](https://tiptap.dev/docs/guides/output-json-html#listen-for-changes)
 [Render](https://tiptap.dev/docs/guides/output-json-html#render)
 [Migrate](https://tiptap.dev/docs/guides/output-json-html#migrate)
 [Security](https://tiptap.dev/docs/guides/output-json-html#security)

![Cookiebot session tracker icon loaded](https://imgsct.cookiebot.com/1.gif?dgi=73ee9606-0ee4-41ab-85ee-7626f8741637)