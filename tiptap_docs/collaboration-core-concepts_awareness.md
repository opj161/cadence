---
title: Awareness | Tiptap Collaboration Docs
source_url: https://tiptap.dev/docs/collaboration/core-concepts/awareness#page-title
og:description: Integrate real-time user activity tracking with Collaboration. Add user presence and cursor positions to your editor.
robots: index, follow
description: Integrate real-time user activity tracking with Collaboration. Add user presence and cursor positions to your editor.
og:type: website
ogLocale: en_US
ogTitle: Awareness | Tiptap Collaboration Docs
viewport: width=device-width, initial-scale=1
twitter:image: https://tiptap.dev/docs/api/og?title=Awareness%20in%20Collaboration&category=Collaboration
ogImage: https://tiptap.dev/docs/api/og?title=Awareness%20in%20Collaboration&category=Collaboration
twitter:card: summary_large_image
favicon: https://tiptap.dev/docs/favicon.png
og:title: Awareness | Tiptap Collaboration Docs
og:image: https://tiptap.dev/docs/api/og?title=Awareness%20in%20Collaboration&category=Collaboration
og:url: https://tiptap.dev/docs/collaboration/core-concepts/awareness
og:image:width: 1200
og:locale: en_US
og:image:height: 630
twitter:description: Integrate real-time user activity tracking with Collaboration. Add user presence and cursor positions to your editor.
ogUrl: https://tiptap.dev/docs/collaboration/core-concepts/awareness
language: en
docsearch:version: 2.x
twitter:title: Awareness | Tiptap Collaboration Docs
ogDescription: Integrate real-time user activity tracking with Collaboration. Add user presence and cursor positions to your editor.
scrapeId: 42b9a5df-cc7d-4e53-be4b-384981bd60c0
sourceURL: https://tiptap.dev/docs/collaboration/core-concepts/awareness#page-title
url: https://tiptap.dev/docs/collaboration/core-concepts/awareness#page-title
statusCode: 200
---

Awareness in Tiptap Collaboration, powered by Yjs, is helping you share real-time info on users' activities within a collaborative space. This can include details like user presence, cursor positions, and custom user states.

At its core, awareness utilizes its own Conflict-Free Replicated Data Type (CRDT) to ensure that this shared meta-information remains consistent and immediate across all users, without maintaining a historical record of these states.

You can read more about Awareness in the [Yjs documentation on awareness](https://docs.yjs.dev/getting-started/adding-awareness)
.

[](https://tiptap.dev/docs/collaboration/core-concepts/awareness#necessary-provider-events)
Necessary provider events
---------------------------------------------------------------------------------------------------------------------

Awareness updates trigger specific [provider events](https://tiptap.dev/docs/collaboration/provider/events)
 to develop interactive features based on user actions and presence:

*   `awarenessUpdate`: This event signals that a user is active. It triggers without actual state changes, serving as a 'heartbeat' to inform others the user is in the document.
*   `awarenessChange`: This event alerts you to any additions, updates, or deletions in the awareness state, reflecting both your local changes and those from remote users.

These events serve as hooks for integrating custom Awareness features.

[](https://tiptap.dev/docs/collaboration/core-concepts/awareness#integrate-awareness)
Integrate awareness
---------------------------------------------------------------------------------------------------------

With your [collaborative environment](https://tiptap.dev/docs/collaboration/getting-started/install)
 set up, you're all set to integrate Awareness, which is natively supported by the Collaboration Provider.

To kick things off, update the Awareness state with any relevant information. As an example we'll use a user's name, cursor color, and mouse position as examples.

### [](https://tiptap.dev/docs/collaboration/core-concepts/awareness#set-the-awareness-field)
Set the awareness field

Let's assign a name, color, and mouse position to the user. This is just an example; feel free to use any data relevant to your application.

    // Set the awareness field for the current user
    provider.setAwarenessField('user', {
      // Share any information you like
      name: 'Kevin James',
      color: '#ffcc00',
    })
    

### [](https://tiptap.dev/docs/collaboration/core-concepts/awareness#listen-for-changes)
Listen for changes

Set up an event listener to track changes in the Awareness states across all connected users:

    // Listen for updates to the states of all users
    provider.on('awarenessChange', ({ states }) => {
      console.log(states)
    })
    

You can now view these updates in your browser's console as you move on to the next step.

### [](https://tiptap.dev/docs/collaboration/core-concepts/awareness#track-mouse-movement)
Track mouse movement

Next, we'll add an event listener to our app to track mouse movements and update the awareness' information accordingly.

    document.addEventListener('mousemove', (event) => {
      // Share any information you like
      provider.setAwarenessField('user', {
        name: 'Kevin James',
        color: '#ffcc00',
        mouseX: event.clientX,
        mouseY: event.clientY,
      })
    })
    

Check your browser's console to see the stream of events as users move their mice.

[](https://tiptap.dev/docs/collaboration/core-concepts/awareness#add-cursors-and-carets)
Add cursors and carets
---------------------------------------------------------------------------------------------------------------

With basic Awareness in place, consider adding the [Collaboration Cursor](https://tiptap.dev/docs/editor/extensions/functionality/collaboration-cursor)
 extension to your editor. This extension adds cursor positions, text selections, and personalized details (such as names and colors) of all participating users to your editor.

On this page

[Introduction](https://tiptap.dev/docs/collaboration/core-concepts/awareness#page-title)
[Necessary provider events](https://tiptap.dev/docs/collaboration/core-concepts/awareness#necessary-provider-events)
 [Integrate awareness](https://tiptap.dev/docs/collaboration/core-concepts/awareness#integrate-awareness)
 [Add cursors and carets](https://tiptap.dev/docs/collaboration/core-concepts/awareness#add-cursors-and-carets)