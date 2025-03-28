---
title: Provider events | Tiptap Collaboration Docs
source_url: https://tiptap.dev/docs/collaboration/provider/events#page-title
ogImage: https://tiptap.dev/docs/api/og?title=State%20and%20change%20events&category=Collaboration
ogDescription: Use event listeners with Tiptap Collaboration providers to manage real-time states and changes effectively. Learn more in the docs!
ogUrl: https://tiptap.dev/docs/collaboration/provider/events
ogLocale: en_US
viewport: width=device-width, initial-scale=1
og:description: Use event listeners with Tiptap Collaboration providers to manage real-time states and changes effectively. Learn more in the docs!
docsearch:version: 2.x
twitter:description: Use event listeners with Tiptap Collaboration providers to manage real-time states and changes effectively. Learn more in the docs!
og:url: https://tiptap.dev/docs/collaboration/provider/events
og:image: https://tiptap.dev/docs/api/og?title=State%20and%20change%20events&category=Collaboration
og:type: website
twitter:title: Provider events | Tiptap Collaboration Docs
twitter:image: https://tiptap.dev/docs/api/og?title=State%20and%20change%20events&category=Collaboration
og:locale: en_US
favicon: https://tiptap.dev/docs/favicon.png
og:title: Provider events | Tiptap Collaboration Docs
language: en
og:image:width: 1200
ogTitle: Provider events | Tiptap Collaboration Docs
og:image:height: 630
robots: index, follow
description: Use event listeners with Tiptap Collaboration providers to manage real-time states and changes effectively. Learn more in the docs!
twitter:card: summary_large_image
scrapeId: d79d858c-1b2e-4116-84ff-3b2d083e2fa6
sourceURL: https://tiptap.dev/docs/collaboration/provider/events#page-title
url: https://tiptap.dev/docs/collaboration/provider/events#page-title
statusCode: 200
---

Events in Collaboration providers let you respond to various states and changes, such as successful connections or authentication updates. You can attach event listeners during provider initialization or add them later based on your application's needs.

[](https://tiptap.dev/docs/collaboration/provider/events#use-provider-events)
Use provider events
-------------------------------------------------------------------------------------------------

| Event | Description |
| --- | --- |
| `open` | Triggered when the WebSocket connection opens. |
| `connect` | Triggered when the provider connects to the server. |
| `authenticated` | Indicates successful client authentication. |
| `authenticationFailed` | Triggered when client authentication fails. |
| `status` | Tracks changes in connection status. |
| `close` | Triggered when the WebSocket connection closes. |
| `disconnect` | Triggered when the provider disconnects. |
| `destroy` | Signifies the impending destruction of the provider. |
| `message` | Triggered by incoming messages. |
| `outgoingMessage` | Triggered before a message is sent. |
| `synced` | Indicates the initial successful sync of the Yjs document. |
| `stateless` | Triggered when the stateless message is received. |
| `awarenessUpdate` | Triggered when user awareness information updates. |
| `awarenessChange` | Triggered when the awareness state changes. |

[](https://tiptap.dev/docs/collaboration/provider/events#configure-event-listeners)
Configure event listeners
-------------------------------------------------------------------------------------------------------------

To track events immediately, pass event listeners directly to the provider's constructor. This guarantees that listeners are active from the start.

    const provider = new TiptapCollabProvider({
      appId: '', // Use for cloud setups, replace with baseUrl in case of on-prem
      name: 'example-document', // Document identifier
      token: '', // Your authentication JWT token
      document: ydoc,
      onOpen() {
        console.log('WebSocket connection opened.')
      },
      onConnect() {
        console.log('Connected to the server.')
      },
      // See below for more event listeners...
    })
    

### [](https://tiptap.dev/docs/collaboration/provider/events#bind-events-dynamically)
Bind events dynamically

To add or remove listeners after initialization, the provider supports dynamic binding and unbinding of event handlers.

**Example:** Binding event listeners during provider initialization

    const provider = new TiptapCollabProvider({
      // …
    })
    
    provider.on('synced', () => {
      console.log('Document synced.')
    })
    

**Example:** Binding/unbinding event listeners after provider initialization

    const onMessage = () => {
      console.log('New message received.')
    }
    
    // Binding
    provider.on('message', onMessage)
    
    // Unbinding
    provider.off('message', onMessage)
    

[](https://tiptap.dev/docs/collaboration/provider/events#provider-event-examples)
Provider event examples
---------------------------------------------------------------------------------------------------------

### [](https://tiptap.dev/docs/collaboration/provider/events#display-connection-status)
Display connection status

Use `onConnect` and `onDisconnect` to provide users with real-time connection status feedback, enhancing the user experience.

    provider.on('connect', () => {
      showStatus('Connected')
    })
    
    provider.on('disconnect', () => {
      showStatus('Disconnected')
    })
    

### [](https://tiptap.dev/docs/collaboration/provider/events#sync-document-status)
Sync document status

Use `synced` to alert users when the document is fully synced initially, ensuring they start working with the latest version.

    provider.on('synced', () => {
      alert('Document initialized')
    })
    

### [](https://tiptap.dev/docs/collaboration/provider/events#handle-authentication-issues)
Handle authentication issues

Use `authenticationFailed` to catch authentication errors and prompt users to reauthenticate, ensuring secure access.

    provider.on('authenticationFailed', ({ reason }) => {
      console.error('Authentication failed:', reason)
      requestUserReauthentication()
    })
    

On this page

[Introduction](https://tiptap.dev/docs/collaboration/provider/events#page-title)
[Use provider events](https://tiptap.dev/docs/collaboration/provider/events#use-provider-events)
 [Configure event listeners](https://tiptap.dev/docs/collaboration/provider/events#configure-event-listeners)
 [Provider event examples](https://tiptap.dev/docs/collaboration/provider/events#provider-event-examples)