---
title: Provider | Tiptap Collaboration Docs
source_url: https://tiptap.dev/docs/collaboration/provider/integration#page-title
favicon: https://tiptap.dev/docs/favicon.png
ogImage: https://tiptap.dev/docs/api/og?title=Integrate%20the%20Collaboration%20provider&category=Collaboration
viewport: width=device-width, initial-scale=1
description: Set up and configure the Collaboration provider to manage real-time document synchronization across users.
og:description: Set up and configure the Collaboration provider to manage real-time document synchronization across users.
og:locale: en_US
og:url: https://tiptap.dev/docs/collaboration/provider/integration
ogLocale: en_US
og:image: https://tiptap.dev/docs/api/og?title=Integrate%20the%20Collaboration%20provider&category=Collaboration
og:image:height: 630
twitter:card: summary_large_image
twitter:description: Set up and configure the Collaboration provider to manage real-time document synchronization across users.
og:type: website
og:image:width: 1200
ogTitle: Provider | Tiptap Collaboration Docs
ogUrl: https://tiptap.dev/docs/collaboration/provider/integration
docsearch:version: 2.x
twitter:image: https://tiptap.dev/docs/api/og?title=Integrate%20the%20Collaboration%20provider&category=Collaboration
robots: index, follow
twitter:title: Provider | Tiptap Collaboration Docs
og:title: Provider | Tiptap Collaboration Docs
language: en
ogDescription: Set up and configure the Collaboration provider to manage real-time document synchronization across users.
scrapeId: 3bca8668-fa35-4083-a118-1731574ee7db
sourceURL: https://tiptap.dev/docs/collaboration/provider/integration#page-title
url: https://tiptap.dev/docs/collaboration/provider/integration#page-title
statusCode: 200
---

Together with the Collaboration backend, providers serve as the backbone for real-time collaborative editing. They establish and manage the communication channels between users, ensuring that updates and changes to documents are synchronized across all participants.

Providers handle the complexities of real-time data exchange, including conflict resolution, network reliability, and user presence awareness.

The `TiptapCollabProvider` adds advanced features tailored for collaborative environments, such as WebSocket message authentication, debug modes, and flexible connection strategies.

[](https://tiptap.dev/docs/collaboration/provider/integration#set-up-the-provider)
Set up the provider
------------------------------------------------------------------------------------------------------

First, install the provider package in your project using:

    npm install @hocuspocus/provider
    

For a basic setup, connect to the Collaboration backend by specifying the document's name, your app's ID (for cloud setups), or the base URL (for on-premises), along with your JWT.

Depending on your framework, register a callback to the Collaboration backend, such as `useEffect()` in React or `onMounted()` in Vue.js.

    const doc = new Y.Doc()
    
    useEffect(() => {
      const provider = new TiptapCollabProvider({
        name: note.id, // Document identifier
        appId: 'YOUR_APP_ID', // replace with YOUR_APP_ID from Cloud dashboard
        token: 'YOUR_JWT', // Authentication token
        document: doc,
        user: userId,
      })
    }, [])
    

### Note for On-Premises Customers

If you are hosting your collaboration environment on-premises, replace the `appId` parameter with `baseUrl` in your provider configuration to connect to your server.

[](https://tiptap.dev/docs/collaboration/provider/integration#configure-the-collaboration-provider)
Configure the collaboration provider
----------------------------------------------------------------------------------------------------------------------------------------

The Tiptap Collaboration provider offers several settings for custom configurations. Review the tables below for all parameters, practical use cases, and key concepts like "[awareness](https://tiptap.dev/docs/collaboration/core-concepts/awareness)
".

| Setting | Default Value | Description |
| --- | --- | --- |
| `appId` | `''` (empty) | App ID for Collaboration Cloud setups |
| `baseUrl` | `''` (empty) | URL for connecting to on-premises servers. Used as an alternative to `appId` for on-prem setups |
| `name` | `''` (empty) | The document's name |
| `token` | `''` (empty) | Authentication token for secure connections. Supports strings, functions, and Promises |
| `document` | `new Y.Doc()` | The Yjs document instance. Defaults to a new document if none is provided |
| `user` | `null` | User ID or name for attributing changes to the document. |
| `connect` | `true` | Connects to the server after initialization |
| `preserveConnection` | `true` | Keeps the WebSocket connection open after closing the provider |
| `broadcast` | `true` | Enables document syncing across browser tabs |
| `forceSyncInterval` | `false` | Forces server sync at regular intervals, in milliseconds |
| `quiet` | `false` | Suppresses warning outputs |
| `WebSocketPolyfill` | `WebSocket` | WebSocket implementation for Node.js environments. Use `ws` or another implementation |

### [](https://tiptap.dev/docs/collaboration/provider/integration#optimize-reconnection-timings)
Optimize reconnection timings

The provider’s reconnection settings are preset for optimal performance in production settings. If you need to adjust these settings for specific scenarios, you can do so with our delay configurations.

Adjust initial delays, apply exponential backoff, or set maximum wait times to fine-tune your application's reconnection behavior, balancing responsiveness with server efficiency.

| Setting | Default Value | Description |
| --- | --- | --- |
| `delay` | `1000` | Base delay between reconnection attempts, in milliseconds |
| `factor` | `2` | Multiplier applied to the delay, increasing it exponentially after each attempt |
| `initialDelay` | `0` | Time in milliseconds before the first reconnection attempt |
| `maxAttempts` | `0` | Maximum number of reconnection attempts. `0` means unlimited attempts |
| `jitter` | `true` | Adds variability to the delay by randomly selecting a value between `minDelay` and the calculated delay for each attempt |
| `minDelay` | `1000` | Minimum delay when jitter is enabled. Has no effect if jitter is disabled |
| `maxDelay` | `30000` | Maximum delay allowed between reconnection attempts. Set to `0` to allow the delay to increase indefinitely using exponential backoff (`factor`). |
| `timeout` | `0` | Time limit, in milliseconds, for each reconnection attempt before stopping |
| `messageReconnectTimeout` | `30000` | Time in milliseconds to wait for a server message before terminating the connection. If no message is received, the connection is closed automatically |

[](https://tiptap.dev/docs/collaboration/provider/integration#rate-limits)
Rate limits
--------------------------------------------------------------------------------------

To maintain system integrity and protect from misconfigured clients, our infrastructure—including the management API and websocket connections through the `TiptapCollabProvider`—is subject to rate limits.

### [](https://tiptap.dev/docs/collaboration/provider/integration#default-rate-limits-per-source-ip)
Default rate limits (per source IP):

*   **Requests:** 100
*   **Time window:** 5 seconds
*   **Burst capacity:** Up to 200 requests

If you encounter these limits under normal operation, please [email us](mailto:humans@tiptap.dev)
.

On this page

[Introduction](https://tiptap.dev/docs/collaboration/provider/integration#page-title)
[Set up the provider](https://tiptap.dev/docs/collaboration/provider/integration#set-up-the-provider)
 [Configure the collaboration provider](https://tiptap.dev/docs/collaboration/provider/integration#configure-the-collaboration-provider)
 [Rate limits](https://tiptap.dev/docs/collaboration/provider/integration#rate-limits)