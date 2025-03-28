---
title: REST API | Tiptap Comments Docs
source_url: https://tiptap.dev/docs/comments/integrate/rest-api#page-title
favicon: https://tiptap.dev/docs/favicon.png
robots: index, follow
twitter:description: Use the Tiptap Comments REST API to manage threads and comments from outside the editor. More in the docs!
og:image:width: 1200
ogTitle: REST API | Tiptap Comments Docs
docsearch:version: 2.x
og:image: https://tiptap.dev/docs/api/og?title=Comments%20REST%20API&category=Comments
og:locale: en_US
description: Use the Tiptap Comments REST API to manage threads and comments from outside the editor. More in the docs!
language: en
og:image:height: 630
twitter:card: summary_large_image
ogLocale: en_US
viewport: width=device-width, initial-scale=1
ogImage: https://tiptap.dev/docs/api/og?title=Comments%20REST%20API&category=Comments
og:title: REST API | Tiptap Comments Docs
og:description: Use the Tiptap Comments REST API to manage threads and comments from outside the editor. More in the docs!
og:url: https://tiptap.dev/docs/comments/integrate/rest-api
og:type: website
twitter:title: REST API | Tiptap Comments Docs
ogUrl: https://tiptap.dev/docs/comments/integrate/rest-api
twitter:image: https://tiptap.dev/docs/api/og?title=Comments%20REST%20API&category=Comments
ogDescription: Use the Tiptap Comments REST API to manage threads and comments from outside the editor. More in the docs!
scrapeId: 5775ce19-e6c3-4936-b8ea-b042bef3ef3a
sourceURL: https://tiptap.dev/docs/comments/integrate/rest-api#page-title
url: https://tiptap.dev/docs/comments/integrate/rest-api#page-title
statusCode: 200
---

The Comments REST API lets users manage comment threads and individual comments from outside the Tiptap Editor. It supports creating, updating, deleting, and retrieving threads and comments.

Use the [Comments Postman Collection](https://www.postman.com/docking-module-explorer-14290287/workspace/tiptap-collaboration-public/folder/33042171-01d1c110-e913-4d99-b47a-fc95aad877c9?ctx=documentation)
 for hands-on experimentation.

[](https://tiptap.dev/docs/comments/integrate/rest-api#access-the-api)
Access the API
-------------------------------------------------------------------------------------

The REST API is exposed directly from your Collaboration app, available at your custom URL:

    https://YOUR_APP_ID.collab.tiptap.cloud/
    

Authentication is done using an API secret which you can find in the [settings](https://cloud.tiptap.dev/apps/settings)
 of your Collaboration app. The secret must be sent as an `Authorization` header.

If your document identifier contains a slash (`/`), encode it as `%2F`, e.g. using `encodeURIComponent`.

[](https://tiptap.dev/docs/comments/integrate/rest-api#review-all-api-endpoints)
Review all API endpoints
---------------------------------------------------------------------------------------------------------

| Operation | Method | Endpoint | Description |
| --- | --- | --- | --- |
| Create thread | POST | /api/documents/:identifier/threads | Create a new thread within a document |
| Get threads | GET | /api/documents/:identifier/threads | List all threads and view their details |
| Get thread | GET | /api/documents/:identifier/threads/:threadIdentifier | Retrieve a specific thread |
| Update thread | PATCH | /api/documents/:identifier/threads/:threadIdentifier | Modify attributes of an existing thread |
| Update comment | PATCH | /api/documents/:identifier/threads/:threadIdentifier/comments/:commentIdentifier | Update the content or metadata of a comment |
| Delete thread | DELETE | /api/documents/:identifier/threads/:threadIdentifier | Remove a specific thread from a document |
| Delete comment | DELETE | /api/documents/:identifier/threads/:threadIdentifier/comments/:commentIdentifier | Remove a specific comment from a thread |

[](https://tiptap.dev/docs/comments/integrate/rest-api#thread-rest-api-endpoints)
Thread REST API endpoints
-----------------------------------------------------------------------------------------------------------

### [](https://tiptap.dev/docs/comments/integrate/rest-api#get-threads)
Get threads

    GET /api/documents/:identifier/threads
    

Retrieve all comment threads associated with a specific document. Use this endpoint to list all threads and view their details.

    curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/{document_id}/threads' \
    --header 'Authorization: {{Authorization}}'
    

### [](https://tiptap.dev/docs/comments/integrate/rest-api#get-thread)
Get thread

    GET /api/documents/:identifier/threads/:threadIdentifier
    

Fetch details of a specific thread using its unique identifier within a document. This is useful for retrieving specific discussion threads.

    curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/{document_id}/threads/{thread_id}' \
    --header 'Authorization: {{Authorization}}'
    

### [](https://tiptap.dev/docs/comments/integrate/rest-api#create-thread)
Create thread

    POST /api/documents/:identifier/threads
    

Create a new thread within a document. You can specify the initial content and additional data like user metadata.

    curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/{document_id}/threads' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: {{Authorization}}' \
    --data '{
        "content": "moin",
        "data": { "key": "ttt"}
    }'
    

### [](https://tiptap.dev/docs/comments/integrate/rest-api#update-thread)
Update thread

    PATCH /api/documents/:identifier/threads/:threadIdentifier
    

Modify attributes of an existing thread, such as marking it as resolved or updating its metadata.

    curl --location --request PATCH 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/{document_id}/threads/{thread_id}' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: {{Authorization}}' \
    --data '{
        "resolvedAt": null
    }'
    

### [](https://tiptap.dev/docs/comments/integrate/rest-api#delete-thread)
Delete thread

    DELETE /api/documents/:identifier/threads/:threadIdentifier
    

Remove a specific thread from a document, effectively deleting all nested comments.

    curl --location --request DELETE 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/{document_id}/threads/{thread_id}' \
    --header 'Authorization: {{Authorization}}'
    

[](https://tiptap.dev/docs/comments/integrate/rest-api#comment-rest-api-endpoints)
Comment REST API endpoints
-------------------------------------------------------------------------------------------------------------

### [](https://tiptap.dev/docs/comments/integrate/rest-api#create-comment)
Create comment

    POST /api/documents/:identifier/threads/:threadIdentifier/comments
    

Add a new comment to an existing thread. Specify the content and any associated data.

    curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/{document_id}/threads/{thread_id}/comments' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: {{Authorization}}' \
    --data '{
        "content": "test",
        "data": { "key": "ttt"}
    }'
    

### [](https://tiptap.dev/docs/comments/integrate/rest-api#update-comment)
Update comment

    PATCH /api/documents/:identifier/threads/:threadIdentifier/comments/:commentIdentifier
    

Update the content or metadata of an existing comment within a thread.

    curl --location --request PATCH 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/{document_id}/threads/{thread_id}/comments/{comment_id}' \
    --header 'Content-Type: application/json' \
    --header 'Authorization: {{Authorization}}' \
    --data '{
        "content": "UPDATED!"
    }'
    

### [](https://tiptap.dev/docs/comments/integrate/rest-api#delete-comment)
Delete comment

    DELETE /api/documents/:identifier/threads/:threadIdentifier/comments/:commentIdentifier
    

Remove a specific comment from a thread. Use this to manage individual comments.

    curl --location --request DELETE 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/{document_id}/threads/{thread_id}/comments/{comment_id}' \
    --header 'Authorization: {{Authorization}}'
    

[](https://tiptap.dev/docs/comments/integrate/rest-api#review-postman-collection)
Review Postman Collection
-----------------------------------------------------------------------------------------------------------

Use the [Comments Postman Collection](https://www.postman.com/docking-module-explorer-14290287/workspace/tiptap-collaboration-public/folder/33042171-01d1c110-e913-4d99-b47a-fc95aad877c9?ctx=documentation)
 for hands-on experimentation.

On this page

[Introduction](https://tiptap.dev/docs/comments/integrate/rest-api#page-title)
[Access the API](https://tiptap.dev/docs/comments/integrate/rest-api#access-the-api)
 [Review all API endpoints](https://tiptap.dev/docs/comments/integrate/rest-api#review-all-api-endpoints)
 [Thread REST API endpoints](https://tiptap.dev/docs/comments/integrate/rest-api#thread-rest-api-endpoints)
 [Comment REST API endpoints](https://tiptap.dev/docs/comments/integrate/rest-api#comment-rest-api-endpoints)
 [Review Postman Collection](https://tiptap.dev/docs/comments/integrate/rest-api#review-postman-collection)