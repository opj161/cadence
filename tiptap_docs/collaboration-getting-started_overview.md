---
title: Collaboration | Tiptap Collaboration Docs
source_url: https://tiptap.dev/docs/collaboration/getting-started/overview#page-title
og:type: website
og:locale: en_US
ogImage: https://tiptap.dev/docs/api/og?title=Make%20your%20editor%20collaborative&category=Collaboration
ogTitle: Collaboration | Tiptap Collaboration Docs
og:image:height: 630
robots: index, follow
viewport: width=device-width, initial-scale=1
ogUrl: https://tiptap.dev/docs/collaboration/getting-started/overview
og:image: https://tiptap.dev/docs/api/og?title=Make%20your%20editor%20collaborative&category=Collaboration
favicon: https://tiptap.dev/docs/favicon.png
twitter:image: https://tiptap.dev/docs/api/og?title=Make%20your%20editor%20collaborative&category=Collaboration
twitter:title: Collaboration | Tiptap Collaboration Docs
ogLocale: en_US
og:title: Collaboration | Tiptap Collaboration Docs
og:url: https://tiptap.dev/docs/collaboration/getting-started/overview
og:image:width: 1200
og:description: Make your editor collaborative with Tiptap Collaboration on your premises or in our cloud. Learn more in our docs!
description: Make your editor collaborative with Tiptap Collaboration on your premises or in our cloud. Learn more in our docs!
ogDescription: Make your editor collaborative with Tiptap Collaboration on your premises or in our cloud. Learn more in our docs!
twitter:card: summary_large_image
twitter:description: Make your editor collaborative with Tiptap Collaboration on your premises or in our cloud. Learn more in our docs!
docsearch:version: 2.x
language: en
scrapeId: 8ef51da7-c8e5-496f-a2a7-1ca4136b79c0
sourceURL: https://tiptap.dev/docs/collaboration/getting-started/overview#page-title
url: https://tiptap.dev/docs/collaboration/getting-started/overview#page-title
statusCode: 200
---

Tiptap Collaboration turns standard text editors into collaborative platforms, enabling simultaneous editing similar to Google Docs or Notion. Built on our open source Hocuspocus WebSocket backend, it facilitates real-time and asynchronous updates through WebSocket technology, with Y.js ensuring consistent synchronization of changes.

Built for performance and scalability, Tiptap Collaboration is tested by hundreds of thousands of users every day. Enhancing the robust Hocuspocus foundation, Tiptap Collaboration introduces more performance, scalability, and security.

It integrates functionalities such as commenting, document version history, and secure authentication, suitable for both cloud services and on your premises installations.

Collaboration features
----------------------

Fasten your seatbelts! Make your rich text editor collaborative with Tiptap Collaboration.

*   Real-time and offline change merging without conflicts
*   Compatible with various editors
*   Handle multiple documents over one WebSocket connection
*   Integrates with webhooks for change notifications
*   Scales efficiently with Redis for high user volumes
*   Built with TypeScript for type safety and scalability.

[Create free account](https://cloud.tiptap.dev/)

[](https://tiptap.dev/docs/collaboration/getting-started/overview#store-your-documents)
Store your documents
------------------------------------------------------------------------------------------------------------

If you're using our on-premises solutions, you can choose where to store your documents in your own infrastructure. However, for users of our Collaboration Cloud service, we've partnered with Hetzner, renowned for their dependable cloud infrastructure, to guarantee stable and efficient performance, especially during periods of heavy traffic and collaborative activities.

Your document storage location depends on your subscription plan:

*   **Entry Plan:** Your documents are stored in GDPR-compliant data centers in Europe, ensuring your data's privacy and security.
*   **Business Plan:** You have the option to store your documents in data centers on the US East or West Coast, or in Europe, according to your preference.
*   **Enterprise Plan:** Choose dedicated cloud storage in your preferred location, or opt for on-premises storage to manage your documents yourself.

Regardless of your plan, you have the flexibility to create your own backups of all documents and associated information using our document management API.

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

[](https://tiptap.dev/docs/collaboration/getting-started/overview#about-yjs)
About Y.js
---------------------------------------------------------------------------------------

Y.js is a library that enables real-time, conflict-free merging of changes made by multiple users. It stands out for its high performance among Conflict-Free Replicated Data Types (CRDTs), offering significant efficiency advantages over similar technologies.

As a CRDT, Y.js ensures that the sequence of changes does not impact the final state of the document, similar to how Git operates with commits. This guarantees that all copies of the data remain consistent across different environments.

The technology supports the development of highly responsive real-time applications, enabling collaborative features in existing software, managing synchronization states, and catering to offline-first scenarios with easy data integration upon reconnection.

### [](https://tiptap.dev/docs/collaboration/getting-started/overview#yjs-document-compatibility)
Y.js Document Compatibility

Y.js uses a special Y.doc binary format to work efficiently, but you don't need to worry about changing how you create documents in Tiptap Editor. You can keep using common formats like JSON or HTML, and the Collaboration server will take care of converting them for use with Y.js.

Thanks to Y.js's binary format, it handles data quickly and keeps everything in sync. If you need the binary format, you can get the Y.doc through the document management API. However, you have the option to retrieve your documents in the more familiar JSON or HTML formats. While direct markup output isn't provided, you can achieve it by converting from HTML, offering versatility in how you handle document formats.

[](https://tiptap.dev/docs/collaboration/getting-started/overview#migrate-from-hocuspocus-or-collaboration-cloud)
Migrate from Hocuspocus or Collaboration Cloud
----------------------------------------------------------------------------------------------------------------------------------------------------------------

Migrating your application from Hocuspocus to either an on-premises solution or the Tiptap Collaboration Cloud involves a simple switch from the `HocuspocusProvider` to the `TiptapCollabProvider`, or the other way around.

This doesn't require any other updates to your setup, and the way you interact with the API won't change as well. The `TiptapCollabProvider` acts as a go-between, managing how your application connects to the server and handles login details.

This migration approach is also applicable when migrating from the Tiptap Collaboration Cloud to an on-premises configuration.

[](https://tiptap.dev/docs/collaboration/getting-started/overview#schema-management)
Schema management
------------------------------------------------------------------------------------------------------

Tiptap enforces strict schema adherence, discarding any elements not defined in the active schema. This can cause issues when clients using different schema versions concurrently edit a document.

For instance, imagine adding a task list feature in an update. Users on the previous schema won't see these task lists, and any added by a user on the new schema will disappear from their view due to schema discrepancies. This occurs because Tiptap synchronizes changes across clients, removing unrecognized elements based on the older schema.

To mitigate these issues, consider implementing [Invalid Schema Handling](https://tiptap.dev/docs/editor/core-concepts/schema#invalid-schema-handling)
 as outlined in the Tiptap Editor docs.

On this page

[Introduction](https://tiptap.dev/docs/collaboration/getting-started/overview#page-title)
[Store your documents](https://tiptap.dev/docs/collaboration/getting-started/overview#store-your-documents)
 [About Y.js](https://tiptap.dev/docs/collaboration/getting-started/overview#about-yjs)
 [Migrate from Hocuspocus or Collaboration Cloud](https://tiptap.dev/docs/collaboration/getting-started/overview#migrate-from-hocuspocus-or-collaboration-cloud)
 [Schema management](https://tiptap.dev/docs/collaboration/getting-started/overview#schema-management)