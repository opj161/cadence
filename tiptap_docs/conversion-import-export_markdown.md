---
title: Markdown | Tiptap Conversion
source_url: https://tiptap.dev/docs/conversion/import-export/markdown#page-title
og:url: https://tiptap.dev/docs/conversion/import-export/markdown/editor-extensions
robots: index, follow
ogImage: https://tiptap.dev/docs/api/og?title=Convert%20markdown%20with%20Tiptap&category=Conversion
ogUrl: https://tiptap.dev/docs/conversion/import-export/markdown/editor-extensions
language: en
og:image:height: 630
twitter:description: Learn how to handle Markdown files in a Tiptap editor, including in-editor import/export and REST API usage.
ogTitle: Markdown | Tiptap Conversion
twitter:card: summary_large_image
twitter:image: https://tiptap.dev/docs/api/og?title=Convert%20markdown%20with%20Tiptap&category=Conversion
twitter:title: Markdown | Tiptap Conversion
viewport: width=device-width, initial-scale=1
docsearch:version: 2.x
og:image:width: 1200
ogLocale: en_US
og:image: https://tiptap.dev/docs/api/og?title=Convert%20markdown%20with%20Tiptap&category=Conversion
favicon: https://tiptap.dev/docs/favicon.png
ogDescription: Learn how to handle Markdown files in a Tiptap editor, including in-editor import/export and REST API usage.
og:locale: en_US
og:description: Learn how to handle Markdown files in a Tiptap editor, including in-editor import/export and REST API usage.
og:type: website
description: Learn how to handle Markdown files in a Tiptap editor, including in-editor import/export and REST API usage.
og:title: Markdown | Tiptap Conversion
scrapeId: 50fd4e17-f187-4a54-9a77-3510eae9e98a
sourceURL: https://tiptap.dev/docs/conversion/import-export/markdown#page-title
url: https://tiptap.dev/docs/conversion/import-export/markdown#page-title
statusCode: 200
---

Tiptap’s Conversion tools support handling **Markdown** (`.md`) files in three ways:

*   **Editor Import** – Convert `.md` files directly into Tiptap JSON for in-editor editing.
*   **Editor Export** – Convert Tiptap content into `.md` (either standard Markdown or GitHub Flavored Markdown).
*   **REST API** – Integrate markdown conversion on the server with the [MD conversion REST API](https://tiptap.dev/docs/conversion/import-export/markdown/rest-api)
    , without using the Tiptap editor directly.

### Subscription required

These extensions require a valid Tiptap subscription. To install the extension, you need [access to our private registry](https://tiptap.dev/docs/guides/pro-extensions)
.

[](https://tiptap.dev/docs/conversion/import-export/markdown#editor-markdown-import)
Editor Markdown Import
-----------------------------------------------------------------------------------------------------------

**Install the Import extension:**

    npm i @tiptap-pro/extension-import
    

### [](https://tiptap.dev/docs/conversion/import-export/markdown#configure-the-extension-in-your-editor)
Configure the extension in your editor

    import { Import } from '@tiptap-pro/extension-import'
    
    const editor = new Editor({
      // ...
      extensions: [\
        // ...\
        Import.configure({\
          // Your Convert App ID from https://cloud.tiptap.dev/convert-settings\
          appId: 'your-app-id',\
    \
          // JWT token you generated\
          token: 'your-jwt',\
    \
          // If your markdown includes images, you can provide a URL for image upload\
          imageUploadCallbackUrl: 'https://your-image-upload-url.com',\
        }),\
      ],
    })
    

### [](https://tiptap.dev/docs/conversion/import-export/markdown#import-your-first-document)
Import your first document

    editor.chain().focus().import({ file }).run()
    

This uploads the chosen `.md` file to the Conversion API, converts it into Tiptap JSON, and replaces the current editor content.

### [](https://tiptap.dev/docs/conversion/import-export/markdown#customize-the-import-behavior)
Customize the import behavior

    editor.chain().import({
      file,
      onImport(context) {
        const { setEditorContent, content, error } = context
        if (error) {
          showErrorToast({ message: error.message })
        }
        // Example: add a paragraph before insertion
        content.doc.content.push({ type: 'paragraph', content: [{ type: 'text', text: 'Hello!' }] })
        isLoading = false
        editor.commands.setContent(content)
      },
    }).focus().run()
    

### [](https://tiptap.dev/docs/conversion/import-export/markdown#options)
Options

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `appId` | `string` | `undefined` | Convert App ID from [https://cloud.tiptap.dev/convert-settings](https://cloud.tiptap.dev/convert-settings) |
| `token` | `string` | `undefined` | JWT token generated on your server |
| `imageUploadCallbackUrl` | `string` | `undefined` | If not set, images in Markdown may be handled as external links or omitted (depending on the file’s structure) |

### [](https://tiptap.dev/docs/conversion/import-export/markdown#commands)
Commands

| Command | Description |
| --- | --- |
| `import` | Import a file into the editor content |

### [](https://tiptap.dev/docs/conversion/import-export/markdown#import-arguments)
`import` arguments

| Name | Type | Default | Options | Description |
| --- | --- | --- | --- | --- |
| `file` | `File` | `undefined` | Any file | The file to import |
| `format` | `string` | `undefined` | `gfm` (optional) | If set to `gfm`, the conversion treats the input as GitHub Flavored Markdown |
| `onImport` | `Function` | `undefined` | `fn(context)` | Callback to customize import. Receives a context with the Tiptap JSON `content`, any `error`, and `setEditorContent()`. |

[](https://tiptap.dev/docs/conversion/import-export/markdown#editor-markdown-export)
Editor Markdown Export
-----------------------------------------------------------------------------------------------------------

### [](https://tiptap.dev/docs/conversion/import-export/markdown#install-the-export-extension)
Install the Export extension:

    npm i @tiptap-pro/extension-export
    

### [](https://tiptap.dev/docs/conversion/import-export/markdown#configure-the-extension-in-your-editor)
Configure the extension in your editor

    import { Export } from '@tiptap-pro/extension-export'
    
    const editor = new Editor({
      // ...
      extensions: [\
        // ...\
        Export.configure({\
          appId: 'your-app-id',\
          token: 'your-jwt',\
        }),\
      ],
    })
    

### [](https://tiptap.dev/docs/conversion/import-export/markdown#export-a-document)
Export a document

    // Export the editor's content as markdown
    // Supported export formats: docx, odt, md, gfm
    editor.chain().focus().export({ format: 'md' }).run()
    

### [](https://tiptap.dev/docs/conversion/import-export/markdown#customize-the-export-behavior)
Customize the export behavior

    editor.chain().export({
      format: 'md',
      onExport(context) {
        const { blob, error, download, filename } = context
        if (error) {
          showErrorToast({ message: error.message })
        }
        isLoading = false
        // If needed, rename the file, handle the blob, or call download()
        download() // triggers a "document.md" download in the browser
      },
    }).run()
    

### [](https://tiptap.dev/docs/conversion/import-export/markdown#options)
Options

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `appId` | `string` | `undefined` | Convert App ID from [https://cloud.tiptap.dev/convert-settings](https://cloud.tiptap.dev/) |
| `token` | `string` | `undefined` | JWT token generated from your server |

### [](https://tiptap.dev/docs/conversion/import-export/markdown#commands)
Commands

| Command | Description |
| --- | --- |
| `export` | Export the editor content. |

### [](https://tiptap.dev/docs/conversion/import-export/markdown#export-arguments)
`export` arguments

| Name | Type | Default | Options | Description |
| --- | --- | --- | --- | --- |
| `format` | `string` | `undefined` | `docx,odt,md,gfm` | The target format (here, `md` or `gfm` for GitHub Flavored Markdown). |
| `content` | `JSONContent` | `undefined` | Any Tiptap JSON | Optional: Export different content than what's currently in the editor. |
| `onExport` | `Function` | `undefined` | `fn(context)` | Callback to customize the export. Receives a `blob`, potential `error`, a `download()` helper, and `filename`. Use `blob.text()` if you want raw text. |

On this page

[Introduction](https://tiptap.dev/docs/conversion/import-export/markdown#page-title)
[Editor Markdown Import](https://tiptap.dev/docs/conversion/import-export/markdown#editor-markdown-import)
 [Editor Markdown Export](https://tiptap.dev/docs/conversion/import-export/markdown#editor-markdown-export)