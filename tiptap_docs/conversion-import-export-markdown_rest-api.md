---
title: Markdown REST API | Tiptap Conversion
source_url: https://tiptap.dev/docs/conversion/import-export/markdown/rest-api#page-title
ogUrl: https://tiptap.dev/docs/conversion/import-export/markdown/rest-api
ogDescription: Learn how to handle Markdown files in a Tiptap editor, including in-editor import/export and REST API usage.
twitter:title: Markdown REST API | Tiptap Conversion
twitter:image: https://tiptap.dev/docs/api/og?title=Convert%20Markdown%20via%20REST%20API&category=Conversion
og:image: https://tiptap.dev/docs/api/og?title=Convert%20Markdown%20via%20REST%20API&category=Conversion
twitter:card: summary_large_image
og:title: Markdown REST API | Tiptap Conversion
ogLocale: en_US
og:locale: en_US
twitter:description: Learn how to handle Markdown files in a Tiptap editor, including in-editor import/export and REST API usage.
og:type: website
language: en
ogImage: https://tiptap.dev/docs/api/og?title=Convert%20Markdown%20via%20REST%20API&category=Conversion
robots: index, follow
og:description: Learn how to handle Markdown files in a Tiptap editor, including in-editor import/export and REST API usage.
ogTitle: Markdown REST API | Tiptap Conversion
og:image:height: 630
og:image:width: 1200
favicon: https://tiptap.dev/docs/favicon.png
viewport: width=device-width, initial-scale=1
docsearch:version: 2.x
og:url: https://tiptap.dev/docs/conversion/import-export/markdown/rest-api
description: Learn how to handle Markdown files in a Tiptap editor, including in-editor import/export and REST API usage.
scrapeId: 499582a5-c733-4aa5-9f5d-ee3c136d1202
sourceURL: https://tiptap.dev/docs/conversion/import-export/markdown/rest-api#page-title
url: https://tiptap.dev/docs/conversion/import-export/markdown/rest-api#page-title
statusCode: 200
---

### Use Postman

Experiment with the Conversion API in our [Postman collection](https://www.postman.com/docking-module-explorer-14290287/workspace/tiptap-collaboration-public/collection/33042171-cc186a66-df41-4df8-9c6e-e91b20deffe5?action=share&creator=32651125)
.

[](https://tiptap.dev/docs/conversion/import-export/markdown/rest-api#import-api-endpoint)
Import API endpoint
--------------------------------------------------------------------------------------------------------------

`POST /import`

Converts .md files (or gfm) to Tiptap JSON.

    curl -X POST "https://api.tiptap.dev/v1/import?format=md" \
      -H "Authorization: Bearer <your-jwt-token>" \
      -H "X-App-Id: <your-app-id>" \
      -F "file=@/path/to/file.md"
    

### [](https://tiptap.dev/docs/conversion/import-export/markdown/rest-api#import-api-headers)
Import API Headers

| Header | Description |
| --- | --- |
| `Authorization` | `Bearer <your-jwt-token>` |
| `X-App-Id` | Convert App ID from [https://cloud.tiptap.dev/convert-settings](https://cloud.tiptap.dev/convert-settings) |

### [](https://tiptap.dev/docs/conversion/import-export/markdown/rest-api#import-api-fields)
Import API Fields

| Field | Description |
| --- | --- |
| `file` | The markdown file to convert |
| `imageUploadCallbackUrl` | Optional endpoint for handling images if the markdown file references local images |

[](https://tiptap.dev/docs/conversion/import-export/markdown/rest-api#export-api-endpoint)
Export API endpoint
--------------------------------------------------------------------------------------------------------------

`POST /export`

Converts Tiptap JSON to .md or .gfm.

    curl -X POST "https://api.tiptap.dev/v1/export" \
      -H "Authorization: Bearer <your-jwt-token>" \
      -H "X-App-Id: <your-app-id>" \
      -H "Content-Type: application/json" \
      -d '{"content":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Hello from Tiptap!"}]}]},"format":"md"}' \
      --output document.md
    

#### [](https://tiptap.dev/docs/conversion/import-export/markdown/rest-api#export-api-headers)
Export API Headers

| Header | Description |
| --- | --- |
| `Authorization` | `Bearer <your-jwt-token>` |
| `X-App-Id` | Convert App ID from [https://cloud.tiptap.dev/convert-settings](https://cloud.tiptap.dev/convert-settings) |

#### [](https://tiptap.dev/docs/conversion/import-export/markdown/rest-api#export-api-fields)
Export API Fields

| Field | Description |
| --- | --- |
| `content` | Tiptap JSON content |
| `format` | Target format, `md` or `gfm` for GitHub Flavored Markdown |

On this page

[Introduction](https://tiptap.dev/docs/conversion/import-export/markdown/rest-api#page-title)
[Import API endpoint](https://tiptap.dev/docs/conversion/import-export/markdown/rest-api#import-api-endpoint)
 [Export API endpoint](https://tiptap.dev/docs/conversion/import-export/markdown/rest-api#export-api-endpoint)