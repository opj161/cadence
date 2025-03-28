---
title: REST API | Tiptap Collaboration Docs
source_url: https://tiptap.dev/docs/collaboration/documents/rest-api#page-title
og:image:width: 1200
og:locale: en_US
docsearch:version: 2.x
og:url: https://tiptap.dev/docs/collaboration/documents/rest-api
twitter:image: https://tiptap.dev/docs/api/og?title=Document%20management%20API&category=Collaboration
favicon: https://tiptap.dev/docs/favicon.png
og:description: Manage your Tiptap documents programmatically with the Collaboration Management API. Find out more in the documentation.
language: en
ogTitle: REST API | Tiptap Collaboration Docs
twitter:card: summary_large_image
twitter:title: REST API | Tiptap Collaboration Docs
ogDescription: Manage your Tiptap documents programmatically with the Collaboration Management API. Find out more in the documentation.
viewport: width=device-width, initial-scale=1
description: Manage your Tiptap documents programmatically with the Collaboration Management API. Find out more in the documentation.
robots: index, follow
og:image:height: 630
ogLocale: en_US
twitter:description: Manage your Tiptap documents programmatically with the Collaboration Management API. Find out more in the documentation.
ogUrl: https://tiptap.dev/docs/collaboration/documents/rest-api
og:type: website
ogImage: https://tiptap.dev/docs/api/og?title=Document%20management%20API&category=Collaboration
og:image: https://tiptap.dev/docs/api/og?title=Document%20management%20API&category=Collaboration
og:title: REST API | Tiptap Collaboration Docs
scrapeId: 7b915343-96c4-4aa5-bdc0-8f3ba5431749
sourceURL: https://tiptap.dev/docs/collaboration/documents/rest-api#page-title
url: https://tiptap.dev/docs/collaboration/documents/rest-api#page-title
statusCode: 200
---

The Collaboration Management API provides a suite of RESTful endpoints for managing documents. This API can be used for document creation, listing, retrieval, updates, deletion, and duplication.

You can experiment with the REST API by visiting our [Postman Collection](https://www.postman.com/docking-module-explorer-14290287/workspace/tiptap-collaboration-public/collection/33042171-cc186a66-df41-4df8-9c6e-e91b20deffe5?action=share&creator=32651125)
.

[](https://tiptap.dev/docs/collaboration/documents/rest-api#rate-limits)
Rate limits
------------------------------------------------------------------------------------

To maintain system integrity and protect from misconfigured clients, our infrastructure—including the management API and websocket connections through the `TiptapCollabProvider`—is subject to rate limits.

### [](https://tiptap.dev/docs/collaboration/documents/rest-api#default-rate-limits-per-source-ip)
Default rate limits (per source IP):

*   **Requests:** 100
*   **Time window:** 5 seconds
*   **Burst capacity:** Up to 200 requests

If you encounter these limits under normal operation, please [email us](mailto:humans@tiptap.dev)
.

[](https://tiptap.dev/docs/collaboration/documents/rest-api#access-the-api)
Access the API
------------------------------------------------------------------------------------------

The REST API is exposed directly from your Collaboration app at your custom URL:

    https://YOUR_APP_ID.collab.tiptap.cloud/
    

### [](https://tiptap.dev/docs/collaboration/documents/rest-api#authentication)
Authentication

Authenticate your API requests by including your API secret in the `Authorization` header. You can find your API secret in the [settings](https://cloud.tiptap.dev/apps/settings)
 of your Tiptap Cloud dashboard.

### [](https://tiptap.dev/docs/collaboration/documents/rest-api#document-identifiers)
Document identifiers

If your document identifier contains a slash (`/`), encode it as `%2F`, e.g., using `encodeURIComponent`.

[](https://tiptap.dev/docs/collaboration/documents/rest-api#api-endpoints-overview)
API endpoints overview
----------------------------------------------------------------------------------------------------------

Access the Collaboration Management API to manage your documents efficiently. For a comprehensive view of all endpoints across Tiptap products, explore our [Postman Collection](https://www.postman.com/docking-module-explorer-14290287/workspace/tiptap-collaboration-public/collection/33042171-cc186a66-df41-4df8-9c6e-e91b20deffe5?action=share&creator=32651125)
, which includes detailed examples and configurations.

| Operation | Method | Endpoint | Description |
| --- | --- | --- | --- |
| Create Document | POST | `/api/documents/:identifier` | Create a document using a `yjs` or `json` update message. |
| Batch Import Documents | PUT | `/api/admin/batch-import` | Import multiple documents in bulk. |
| Get Document | GET | `/api/documents/:identifier` | Export a document in `json` or `yjs` format. |
| List Documents | GET | `/api/documents` | Retrieve a list of all documents with pagination options. |
| Duplicate Document | POST + GET | `/api/documents/:identifier` (GET then POST) | Duplicate a document by retrieving it and then creating it with a new identifier. |
| Encrypt Document | POST | `/api/documents/:identifier/encrypt` | Encrypt a document using Base64. |
| Revert to Version | POST | `/api/documents/:identifier/versions` | Import multiple documents in bulk. |
| Update Document | PATCH | `/api/documents/:identifier` | Apply a Yjs update message to an existing document. |
| Delete Document | DELETE | `/api/documents/:identifier` | Delete a document from the server. |
| Search Documents | POST | `/api/search` | Execute a search on all documents. |

Take a look at the [metrics and statistics endpoints](https://tiptap.dev/docs/collaboration/operations/metrics)
 as well!

[](https://tiptap.dev/docs/collaboration/documents/rest-api#create-a-document)
Create a document
------------------------------------------------------------------------------------------------

    POST /api/documents/:identifier
    

This call lets you create a document using [binary Yjs](https://tiptap.dev/docs/collaboration/getting-started/overview#about-yjs)
 or JSON format (default: `yjs`). It can be used to seed documents before a user connects to the Tiptap Collaboration server.

The endpoint returns HTTP status `204` if the document is created successfully, or `409` if the document already exists. To overwrite an existing document, you must [delete it](https://tiptap.dev/docs/collaboration/documents/rest-api#delete-a-document)
 first.

*   **Yjs format**: To create a document using a Yjs binary update message, first encode the Yjs document using `Y.encodeStateAsUpdate`.

    curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/DOCUMENT_NAME' \
    --header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA' \
    --data '@yjsUpdate.binary.txt'
    

*   **JSON format**: To create a document using JSON, pass the query parameter `format=json` and include the document's content in the Tiptap JSON format.

    curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/DOCUMENT_NAME?format=json' \
    --header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA' \
    --header 'Content-Type: application/json' \
    --data '{
        "type": "doc",
        "content": [\
          {\
            "type": "paragraph",\
            "content": [\
              {\
                "type": "text",\
                "text": "This is your content."\
              }\
            ]\
          }\
        ]
    }'
    
    

[](https://tiptap.dev/docs/collaboration/documents/rest-api#batch-import-documents)
Batch import documents
----------------------------------------------------------------------------------------------------------

    PUT /api/admin/batch-import
    

This call lets you import multiple documents in bulk using a predefined JSON structure. Each document must include its metadata (such as created\_at, name, and version) and its content in the Tiptap JSON format.

The endpoint returns HTTP status `204` if the documents are imported successfully, or `400` if the request contains invalid data.

    curl --location --request PUT 'https://YOUR_APP_ID.collab.tiptap.cloud/api/admin/batch-import' \
    --header 'Content-Type: application/json' \
    --data '[\
        [\
            {\
                "created_at": "2024-05-01T10:00:00Z",\
                "version": 0,\
                "name": "document-1",\
                "tiptap_json": {"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Text of document-1: v0"}]}]}\
            },\
            {\
                "created_at": "2024-05-01T11:00:00Z",\
                "version": 1,\
                "name": "document-1",\
                "tiptap_json": {"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Text of document-1: v1"}]}]}\
            }\
        ],\
        [\
            {\
                "created_at": "2024-06-01T10:00:00Z",\
                "version": 0,\
                "name": "document-2",\
                "tiptap_json": {"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Text of document-2: v0"}]}]}\
            },\
            {\
                "created_at": "2024-06-01T11:00:00Z",\
                "version": 1,\
                "name": "document-2",\
                "tiptap_json": {"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Text of document-2: v1"}]}]}\
            }\
        ]\
    ]'
    
    

[](https://tiptap.dev/docs/collaboration/documents/rest-api#get-a-document)
Get a document
------------------------------------------------------------------------------------------

    GET /api/documents/:identifier?format=:format&fragment=:fragment
    

This call lets you export the specified document with all fragments in JSON or Yjs format. If the document is currently open on your server, we will return the in-memory version; otherwise, we read from the database.

*   `format` supports either `yjs`, `base64`, `text`, or `json` (default: `json`). If you choose the `yjs` format, you'll get the binary Yjs update message created with `Y.encodeStateAsUpdate`.
    
*   `fragment` can be an array (e.g., `fragment=a&fragment=b`) or a single fragment you want to export. By default, we only export the `default` fragment. This parameter is only applicable when using the `json` or `text`format; with `yjs`, you'll always get the entire Yjs document.
    

    curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/DOCUMENT_NAME' \
    --header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA'
    

When using `axios`, you need to specify `responseType: arraybuffer` in the request options.

    import * as Y from 'yjs'
    
    const ydoc = new Y.Doc()
    
    const axiosResult = await axios.get(
      'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/DOCUMENT_NAME?format=yjs',
      {
        headers: {
          Authorization: 'YOUR_SECRET_FROM_SETTINGS_AREA',
        },
        responseType: 'arraybuffer',
      },
    )
    
    Y.applyUpdate(ydoc, axiosResult.data)
    

When using `node-fetch`, you need to use `.arrayBuffer()` and create a Buffer from it:

    import * as Y from 'yjs'
    
    const ydoc = new Y.Doc()
    
    const fetchResult = await fetch(
      'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/DOCUMENT_NAME?format=yjs',
      {
        headers: {
          Authorization: 'YOUR_SECRET_FROM_SETTINGS_AREA',
        },
      },
    )
    
    Y.applyUpdate(ydoc, Buffer.from(await docUpdateAsBinaryResponse.arrayBuffer()))
    

[](https://tiptap.dev/docs/collaboration/documents/rest-api#list-documents)
List documents
------------------------------------------------------------------------------------------

    GET /api/documents?take=100&skip=0
    

This call returns a paginated list of all documents in storage. By default, we return the first 100 documents. Pass `take` and `skip` parameters to adjust pagination.

    curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents' \
    --header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA'
    

[](https://tiptap.dev/docs/collaboration/documents/rest-api#duplicate-a-document)
Duplicate a document
------------------------------------------------------------------------------------------------------

This call lets you copy or duplicate a document. First, retrieve the document using the `GET` endpoint and then create a new one with the `POST` call. Here's an example in typescript:

    const docUpdateAsBinaryResponse = await axios.get(
      'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/DOCUMENT_NAME?format=yjs',
      {
        headers: {
          Authorization: 'YOUR_SECRET_FROM_SETTINGS_AREA',
        },
        responseType: 'arraybuffer',
      },
    )
    
    await axios.post(
      'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/DOCUMENT_NAME-duplicated',
      docUpdateAsBinaryResponse.data,
      {
        headers: {
          Authorization: 'YOUR_SECRET_FROM_SETTINGS_AREA',
        },
      },
    )
    

[](https://tiptap.dev/docs/collaboration/documents/rest-api#encrypt-a-document)
Encrypt a document
--------------------------------------------------------------------------------------------------

    POST /api/documents/:identifier/encrypt
    

This call lets you encrypt a document with the specified identifier using Base64 encryption.

The endpoint returns HTTP status `204` if the document is successfully encrypted, or `404` if the document does not exist.

    curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/DOCUMENT_NAME/encrypt' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA' \
    --data '{
        "type": "doc",
        "content": [\
          {\
            "type": "paragraph",\
            "attrs": {\
              "indent": 0,\
              "textAlign": "left"\
            },\
            "content": [\
              {\
                "text": "the entire document is replaced by this (except if you changed the mode parameter to '\''append'\'')",\
                "type": "text"\
              }\
            ]\
          }\
        ]
      }'
    

[](https://tiptap.dev/docs/collaboration/documents/rest-api#revert-to-version)
Revert to version
------------------------------------------------------------------------------------------------

    POST /api/documents/:identifier/versions
    

This call lets you revert a document to a specific previous version by applying an update that corresponds to a prior state of the document. You must specify the version to revert to in the request body.

The endpoint returns HTTP status `204` if the document is successfully reverted, or `404` if the document or version is not found.

    curl --location --request POST 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/DOCUMENT_NAME/versions/VERSION_ID/revertTo' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA'
    
    

[](https://tiptap.dev/docs/collaboration/documents/rest-api#update-a-document)
Update a document
------------------------------------------------------------------------------------------------

    PATCH /api/documents/:identifier
    

This call accepts a Yjs update message and applies it to the existing document on the server.

The endpoint returns the HTTP status `204` if the document was updated successfully, `404` if the document does not exist, or `422` if the payload is invalid or the update cannot be applied.

    curl --location --request PATCH 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/DOCUMENT_NAME' \
    --header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA' \
    --data '@yjsUpdate.binary.txt'
    

The API endpoint also supports JSON document updates, document history for tracking changes without replacing the entire document, and node-specific updates.

For more detailed information on manipulating documents using JSON instead of Yjs, refer to our [Content injection](https://tiptap.dev/docs/collaboration/documents/content-injection)
 page.

[](https://tiptap.dev/docs/collaboration/documents/rest-api#delete-a-document)
Delete a document
------------------------------------------------------------------------------------------------

    DELETE /api/documents/:identifier
    

This call deletes a document from the server after closing any open connection to the document.

It returns either HTTP status `204` if the document was deleted successfully, or `404` if the document was not found.

    curl --location --request DELETE 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/DOCUMENT_NAME' \
    --header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA'
    

### Document persists after deletion

If the endpoint returns `204` but the document still exists, make sure that no user is re-creating the document from the provider. We close all connections before deleting a document, but your error handling might recreate the provider, thus creating the document again.

[](https://tiptap.dev/docs/collaboration/documents/rest-api#search-documents)
Search documents
----------------------------------------------------------------------------------------------

    POST /api/search
    

When [Tiptap Semantic Search](https://tiptap.dev/docs/collaboration/documents/semantic-search)
 is enabled, you can perform contextually aware searches across all your documents.

### Keeping your API key secret

Please handle the search requests in your backend to keep your API key secret. Consider enforcing rate limits in your application as necessary.

### [](https://tiptap.dev/docs/collaboration/documents/rest-api#query-parameters)
Query parameters

You can use the following query parameters to adjust the search results:

| Query parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `threshold` | float | `0.5` | Describes the similarity factor of documents. The value can be between `0` an `1`. |
| `limit` | int | `20` | Limit the number of results. The value can be between `1` an `100`. |

### [](https://tiptap.dev/docs/collaboration/documents/rest-api#body-parameters)
Body parameters

| Body parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `content` | string | \-  | Your search terms. |

    curl -X POST https://YOUR_APP_ID.collab.tiptap.cloud/api/search \
      -H "Authorization: YOUR_SECRET_FROM_SETTINGS_AREA" \
      -H "Content-Type: application/json" \
      -d '{"content": "Your search terms"}'
    

On this page

[Introduction](https://tiptap.dev/docs/collaboration/documents/rest-api#page-title)
[Rate limits](https://tiptap.dev/docs/collaboration/documents/rest-api#rate-limits)
 [Access the API](https://tiptap.dev/docs/collaboration/documents/rest-api#access-the-api)
 [API endpoints overview](https://tiptap.dev/docs/collaboration/documents/rest-api#api-endpoints-overview)
 [Create a document](https://tiptap.dev/docs/collaboration/documents/rest-api#create-a-document)
 [Batch import documents](https://tiptap.dev/docs/collaboration/documents/rest-api#batch-import-documents)
 [Get a document](https://tiptap.dev/docs/collaboration/documents/rest-api#get-a-document)
 [List documents](https://tiptap.dev/docs/collaboration/documents/rest-api#list-documents)
 [Duplicate a document](https://tiptap.dev/docs/collaboration/documents/rest-api#duplicate-a-document)
 [Encrypt a document](https://tiptap.dev/docs/collaboration/documents/rest-api#encrypt-a-document)
 [Revert to version](https://tiptap.dev/docs/collaboration/documents/rest-api#revert-to-version)
 [Update a document](https://tiptap.dev/docs/collaboration/documents/rest-api#update-a-document)
 [Delete a document](https://tiptap.dev/docs/collaboration/documents/rest-api#delete-a-document)
 [Search documents](https://tiptap.dev/docs/collaboration/documents/rest-api#search-documents)