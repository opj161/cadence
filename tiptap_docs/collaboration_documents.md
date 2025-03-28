---
title: Documents | Tiptap Collaboration
source_url: https://tiptap.dev/docs/collaboration/documents#page-title
favicon: https://tiptap.dev/docs/favicon.png
docsearch:version: 2.x
viewport: width=device-width, initial-scale=1
og:description: Use Tiptap Collaboration to store, manage, and track documents. Integrate with our REST API and webhooks for real-time updates.
twitter:image: https://tiptap.dev/docs/api/og?title=Manage%20Documents%20with%20Tiptap&category=Collaboration
og:url: https://tiptap.dev/docs/collaboration/documents
og:image: https://tiptap.dev/docs/api/og?title=Manage%20Documents%20with%20Tiptap&category=Collaboration
ogLocale: en_US
language: en
ogDescription: Use Tiptap Collaboration to store, manage, and track documents. Integrate with our REST API and webhooks for real-time updates.
og:image:height: 630
ogTitle: Documents | Tiptap Collaboration
twitter:description: Use Tiptap Collaboration to store, manage, and track documents. Integrate with our REST API and webhooks for real-time updates.
og:title: Documents | Tiptap Collaboration
ogUrl: https://tiptap.dev/docs/collaboration/documents
robots: index, follow
twitter:card: summary_large_image
ogImage: https://tiptap.dev/docs/api/og?title=Manage%20Documents%20with%20Tiptap&category=Collaboration
description: Use Tiptap Collaboration to store, manage, and track documents. Integrate with our REST API and webhooks for real-time updates.
og:locale: en_US
og:image:width: 1200
og:type: website
twitter:title: Documents | Tiptap Collaboration
scrapeId: 6335eb38-cb01-4a7f-bc63-60a42b9764d2
sourceURL: https://tiptap.dev/docs/collaboration/documents#page-title
url: https://tiptap.dev/docs/collaboration/documents#page-title
statusCode: 200
---

Collaboration Documents form the backbone of Tiptap Collaboration, storing everything from content and comments to versions and metadata using the Yjs format.

Typically, users manage these documents using the REST API or track changes with the Collaboration Webhook, which sends detailed updates. Tiptap converts the documents into HTML or JSON for you, so you don't have to deal directly with the Yjs format.

*   **Host your documents:** Choose between cloud, dedicated cloud or on-premises deployment.
*   **Document REST API:** Create, update, and delete documents programmatically.
*   **Webhooks:** Automate responses to real-time document and comment events.
*   **Document versioning and comparison:** Track changes in documents through automatic or manual versioning, and visually compare differences between snapshots.
*   **Content injection:** Modify document content server-side with the REST API, even during active collaboration sessions.

Enterprise on-premises solution
-------------------------------

Integrate Collaboration and all other Tiptap features into your infrastructure.

*   On-premises:
    
    Deploy our docker images in your own stack
    
*   High availability cluster:
    
    Scale confidently to millions of users
    
*   Dedicated support:
    
    Custom development and integration support in Chat
    

[Let's talk](https://45pg7sjo8uw.typeform.com/to/DRCOgZGi)

[](https://tiptap.dev/docs/collaboration/documents#integrate-documents)
Integrate documents
-------------------------------------------------------------------------------------------

Integrating documents into your editor and application with Tiptap is straightforward. By adding the Tiptap Collaboration provider to your setup, documents are automatically stored and managed within the Tiptap Collaboration framework.

This integration immediately enables you to use all document features, like storing collaborative documents, managing version histories, using the REST API, and injecting content.

### Note

You can easily migrate your documents from our cloud to an on-premises server at a later time.

1.  **Integrate the Tiptap Editor:** Follow the [installation guide](https://tiptap.dev/docs/collaboration/getting-started/install)
     to setup an editor.
2.  **Create a Tiptap Account:** Set up your [Collaboration app](https://cloud.tiptap.dev/)
     to store you documents.
3.  **Integrate the Tiptap Collaboration Provider:** [Connect](https://tiptap.dev/docs/collaboration/getting-started/install#integrate-yjs-and-the-collaboration-extension)
     the Tiptap Editor with collaboration features to enable document management.
4.  **Create and Manage Documents:** Start creating your first documents.

And now, you are all set to use the document features 🙌🏻

[](https://tiptap.dev/docs/collaboration/documents#retrieve-and-manage-documents)
Retrieve and manage documents
---------------------------------------------------------------------------------------------------------------

Use the [REST API](https://tiptap.dev/docs/collaboration/documents/rest-api)
 to fetch documents in `JSON` or `HTML` format for easy integration with your system. For immediate updates on changes, configure [webhooks](https://tiptap.dev/docs/collaboration/core-concepts/webhooks)
 to receive real-time notifications.

**Track changes in documents:** The [document history](https://tiptap.dev/docs/collaboration/documents/history)
 extension in Tiptap Collaboration automatically captures and stores snapshots of documents at designated intervals. It also allows for manual versioning, enabling users to track detailed changes and document evolution.

**Compare snapshots:** The [compare snapshots](https://tiptap.dev/docs/collaboration/documents/snapshot-compare)
 extension lets you visually compare two versions of a document, highlighting changes and their authors, helping you see modifications over time.

**Inject content:** Update the content of active documents with an [Patch Document endpoint](https://tiptap.dev/docs/collaboration/documents/content-injection)
, which allows server-side modifications even during active user collaboration.

On this page

[Introduction](https://tiptap.dev/docs/collaboration/documents#page-title)
[Integrate documents](https://tiptap.dev/docs/collaboration/documents#integrate-documents)
 [Retrieve and manage documents](https://tiptap.dev/docs/collaboration/documents#retrieve-and-manage-documents)