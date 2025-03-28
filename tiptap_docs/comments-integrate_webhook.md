---
title: Webhook | Tiptap Comments Docs
source_url: https://tiptap.dev/docs/comments/integrate/webhook#page-title
og:description: Enable and manage webhooks for Comments in Tiptap to receive notifications on thread and comment activities. More in the docs!
og:locale: en_US
favicon: https://tiptap.dev/docs/favicon.png
og:title: Webhook | Tiptap Comments Docs
twitter:description: Enable and manage webhooks for Comments in Tiptap to receive notifications on thread and comment activities. More in the docs!
ogLocale: en_US
ogTitle: Webhook | Tiptap Comments Docs
twitter:card: summary_large_image
language: en
description: Enable and manage webhooks for Comments in Tiptap to receive notifications on thread and comment activities. More in the docs!
og:url: https://tiptap.dev/docs/comments/integrate/webhook
ogUrl: https://tiptap.dev/docs/comments/integrate/webhook
ogDescription: Enable and manage webhooks for Comments in Tiptap to receive notifications on thread and comment activities. More in the docs!
og:image:width: 1200
ogImage: https://tiptap.dev/docs/api/og?title=Comments%20webhook&category=Comments
viewport: width=device-width, initial-scale=1
robots: index, follow
docsearch:version: 2.x
og:type: website
twitter:title: Webhook | Tiptap Comments Docs
og:image:height: 630
og:image: https://tiptap.dev/docs/api/og?title=Comments%20webhook&category=Comments
twitter:image: https://tiptap.dev/docs/api/og?title=Comments%20webhook&category=Comments
scrapeId: 50c458d6-e6c3-4316-87ac-d5af47b92753
sourceURL: https://tiptap.dev/docs/comments/integrate/webhook#page-title
url: https://tiptap.dev/docs/comments/integrate/webhook#page-title
statusCode: 200
---

Set up and manage webhooks to improve your Comments integration. Common use cases for Comments webhooks include:

*   Sending notifications when a thread is created, resolved, updated, or deleted.
*   Notifying users when comments are added, updated, or deleted.
*   In conjunction with the [mention extension](https://tiptap.dev/docs/editor/extensions/nodes/mention)
    , sending emails or notifications to users when they are mentioned in comments.

[](https://tiptap.dev/docs/comments/integrate/webhook#enable-comment-events)
Enable comment events
--------------------------------------------------------------------------------------------------

For accounts created after March 1, 2024, Comments webhooks are enabled by default. Otherwise, you could still be using an older version of the webhook system and need to manually upgrade:

1.  In case you’ve previously implemented Collaboration webhooks, check the `type` and `trigger` fields when processing incoming webhooks. ([Documentation](https://tiptap.dev/docs/collaboration/core-concepts/webhooks)
    )
2.  Navigate to your [Collaboration settings](https://cloud.tiptap.dev/apps/settings)
    .
3.  In the Webhooks section, click **Upgrade**.

This upgrade is necessary to accommodate the introduction of multiple new events being routed to the same webhook endpoint, distinguished by a new `type` and `trigger` field.

[](https://tiptap.dev/docs/comments/integrate/webhook#configure-webhooks)
Configure webhooks
--------------------------------------------------------------------------------------------

To configure webhooks for Comments notifications:

1.  Navigate to the [Collaboration settings](https://cloud.tiptap.dev/apps/settings)
     in your account.
2.  In the Webhooks section, add your desired endpoint URL.

After adding your URL, the webhook is immediately live. You'll start receiving notifications for the specified events without any delay.

[](https://tiptap.dev/docs/comments/integrate/webhook#webhook-events)
Webhook events
------------------------------------------------------------------------------------

Comments webhooks trigger notifications for a variety of events related to threads and comments within the Comments extension. These events are triggered immediately as soon as their associated action occur within the comments.

*   `comment.added`
*   `comment.updated`
*   `comment.deleted`
*   `thread.created`
*   `thread.resolved`
*   `thread.updated`
*   `thread.deleted`

[](https://tiptap.dev/docs/comments/integrate/webhook#example-payloads)
Example payloads
----------------------------------------------------------------------------------------

Below are example payloads for different types of webhook events:

### [](https://tiptap.dev/docs/comments/integrate/webhook#threadcomment-created)
Thread/comment created

    {
      "trigger": "comment.added",
      "thread": {
        "id": "128ba3a9-c684-4956-8c9f-fe5dc147c7e5",
        "createdAt": "2024-03-02T22:17:51.304Z",
        "comments": [\
          {\
            "id": "0259e4cb-43ad-4eb2-a7e9-a7a7d5207a76",\
            "createdAt": "2024-03-02T22:17:51.307Z",\
            "updatedAt": "2024-03-02T22:17:51.307Z",\
            "data": {\
              "userName": "Cyndi Lauper",\
              "userAvatar": "https://api.dicebear.com/7.x/lorelei/svg?seed=Cyndi Lauper"\
            },\
            "content": "Threaderstellungskommentar"\
          }\
        ],
        "updatedAt": "2024-03-02T22:17:51.305Z"
      },
      "comment": {
        "id": "0259e4cb-43ad-4eb2-a7e9-a7a7d5207a76",
        "createdAt": "2024-03-02T22:17:51.307Z",
        "updatedAt": "2024-03-02T22:17:51.307Z",
        "data": {
          "userName": "Cyndi Lauper",
          "userAvatar": "https://api.dicebear.com/7.x/lorelei/svg?seed=Cyndi Lauper"
        },
        "content": "Threaderstellungskommentar"
      },
      "appName": "",
      "user": "",
      "name": "documentName",
      "type": "THREAD"
    }
    

### [](https://tiptap.dev/docs/comments/integrate/webhook#comment-updated)
Comment updated

    {
      "trigger": "comment.updated",
      "thread": [\
        {\
          "id": "0259e4cb-43ad-4eb2-a7e9-a7a7d5207a76",\
          "createdAt": "2024-03-02T22:17:51.307Z",\
          "updatedAt": "2024-03-02T22:18:04.246Z",\
          "data": {\
            "userName": "Cyndi Lauper",\
            "userAvatar": "https://api.dicebear.com/7.x/lorelei/svg?seed=Cyndi Lauper"\
          },\
          "content": "Threaderstellungskommentar (bearbeitet)"\
        }\
      ],
      "comment": {
        "id": "0259e4cb-43ad-4eb2-a7e9-a7a7d5207a76",
        "createdAt": "2024-03-02T22:17:51.307Z",
        "updatedAt": "2024-03-02T22:18:04.246Z",
        "data": {
          "userName": "Cyndi Lauper",
          "userAvatar": "https://api.dicebear.com/7.x/lorelei/svg?seed=Cyndi Lauper"
        },
        "content": "Threaderstellungskommentar (bearbeitet)"
      },
      "appName": "",
      "user": "",
      "name": "documentName",
      "type": "THREAD"
    }
    

### [](https://tiptap.dev/docs/comments/integrate/webhook#comment-deleted)
Comment deleted

    {
      "trigger": "comment.deleted",
      "thread": {
        "id": "128ba3a9-c684-4956-8c9f-fe5dc147c7e5",
        "createdAt": "2024-03-02T22:17:51.304Z",
        "comments": [\
          {\
            "id": "0259e4cb-43ad-4eb2-a7e9-a7a7d5207a76",\
            "createdAt": "2024-03-02T22:17:51.307Z",\
            "updatedAt": "2024-03-02T22:18:04.246Z",\
            "data": {\
              "userName": "Cyndi Lauper",\
              "userAvatar": "https://api.dicebear.com/7.x/lorelei/svg?seed=Cyndi Lauper"\
            },\
            "content": "Threaderstellungskommentar (bearbeitet)"\
          }\
        ],
        "updatedAt": "2024-03-02T22:17:51.305Z"
      },
      "comment": {
        "id": "1841e650-2202-42b6-a868-907fee42ccf7",
        "createdAt": "2024-03-02T22:18:20.974Z",
        "updatedAt": "2024-03-02T22:18:20.975Z",
        "data": {
          "userName": "Cyndi Lauper",
          "userAvatar": "https://api.dicebear.com/7.x/lorelei/svg?seed=Cyndi Lauper"
        },
        "content": "Zweites Kommentar, selber Thread"
      },
      "appName": "",
      "user": "",
      "name": "documentName",
      "type": "THREAD"
    }
    

### [](https://tiptap.dev/docs/comments/integrate/webhook#thread-deleted)
Thread deleted

    {
      "trigger": "thread.deleted",
      "thread": {
        "id": "128ba3a9-c684-4956-8c9f-fe5dc147c7e5",
        "createdAt": "2024-03-02T22:17:51.304Z",
        "comments": [\
          {\
            "id": "0259e4cb-43ad-4eb2-a7e9-a7a7d5207a76",\
            "createdAt": "2024-03-02T22:17:51.307Z",\
            "updatedAt": "2024-03-02T22:18:04.246Z",\
            "data": {\
              "userName": "Cyndi Lauper",\
              "userAvatar": "https://api.dicebear.com/7.x/lorelei/svg?seed=Cyndi Lauper"\
            },\
            "content": "Threaderstellungskommentar (bearbeitet)"\
          }\
        ],
        "updatedAt": "2024-03-02T22:18:52.050Z",
        "resolvedAt": null
      },
      "appName": "",
      "user": "",
      "name": "documentName",
      "type": "THREAD"
    }
    

### [](https://tiptap.dev/docs/comments/integrate/webhook#thread-resolved)
Thread resolved

    {
      "trigger": "thread.resolved",
      "thread": {
        "id": "128ba3a9-c684-4956-8c9f-fe5dc147c7e5",
        "createdAt": "2024-03-02T22:17:51.304Z",
        "comments": [\
          {\
            "id": "0259e4cb-43ad-4eb2-a7e9-a7a7d5207a76",\
            "createdAt": "2024-03-02T22:17:51.307Z",\
            "updatedAt": "2024-03-02T22:18:04.246Z",\
            "data": {\
              "userName": "Cyndi Lauper",\
              "userAvatar": "https://api.dicebear.com/7.x/lorelei/svg?seed=Cyndi Lauper"\
            },\
            "content": "Threaderstellungskommentar (bearbeitet)"\
          }\
        ],
        "updatedAt": "2024-03-02T22:18:48.531Z",
        "resolvedAt": "2024-03-02T22:18:48.531Z"
      },
      "appName": "",
      "user": "",
      "name": "documentName",
      "type": "THREAD"
    }
    

### [](https://tiptap.dev/docs/comments/integrate/webhook#thread-updated-ie-unresolved)
Thread updated (i.e., Unresolved)

    {
      "trigger": "thread.updated",
      "thread": {
        "id": "128ba3a9-c684-4956-8c9f-fe5dc147c7e5",
        "createdAt": "2024-03-02T22:17:51.304Z",
        "comments": [\
          {\
            "id": "0259e4cb-43ad-4eb2-a7e9-a7a7d5207a76",\
            "createdAt": "2024-03-02T22:17:51.307Z",\
            "updatedAt": "2024-03-02T22:18:04.246Z",\
            "data": {\
              "userName": "Cyndi Lauper",\
              "userAvatar": "https://api.dicebear.com/7.x/lorelei/svg?seed=Cyndi Lauper"\
            },\
            "content": "Threaderstellungskommentar (bearbeitet)"\
          }\
        ],
        "updatedAt": "2024-03-02T22:18:52.050Z",
        "resolvedAt": null
      },
      "appName": "",
      "user": "",
      "name": "documentName",
      "type": "THREAD"
    }
    

On this page

[Introduction](https://tiptap.dev/docs/comments/integrate/webhook#page-title)
[Enable comment events](https://tiptap.dev/docs/comments/integrate/webhook#enable-comment-events)
 [Configure webhooks](https://tiptap.dev/docs/comments/integrate/webhook#configure-webhooks)
 [Webhook events](https://tiptap.dev/docs/comments/integrate/webhook#webhook-events)
 [Example payloads](https://tiptap.dev/docs/comments/integrate/webhook#example-payloads)