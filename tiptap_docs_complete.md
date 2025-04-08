# collaboration\core-concepts\awareness.mdx

```mdx
---
title: Awareness in Collaboration
meta:
  title: Awareness | Tiptap Collaboration Docs
  description: Integrate real-time user activity tracking with Collaboration. Add user presence and cursor positions to your editor.
  category: Collaboration
---

Awareness in Tiptap Collaboration, powered by Yjs, is helping you share real-time info on users' activities within a collaborative space. This can include details like user presence, cursor positions, and custom user states.

At its core, awareness utilizes its own Conflict-Free Replicated Data Type (CRDT) to ensure that this shared meta-information remains consistent and immediate across all users, without maintaining a historical record of these states.

You can read more about Awareness in the [Yjs documentation on awareness](https://docs.yjs.dev/getting-started/adding-awareness).

## Necessary provider events

Awareness updates trigger specific [provider events](/collaboration/provider/events) to develop interactive features based on user actions and presence:

- `awarenessUpdate`: This event signals that a user is active. It triggers without actual state changes, serving as a 'heartbeat' to inform others the user is in the document.
- `awarenessChange`: This event alerts you to any additions, updates, or deletions in the awareness state, reflecting both your local changes and those from remote users.

These events serve as hooks for integrating custom Awareness features.

## Integrate awareness

With your [collaborative environment](/collaboration/getting-started/install) set up, you're all set to integrate Awareness, which is natively supported by the Collaboration Provider.

To kick things off, update the Awareness state with any relevant information. As an example we'll use a user's name, cursor color, and mouse position as examples.

### Set the awareness field

Let's assign a name, color, and mouse position to the user. This is just an example; feel free to use any data relevant to your application.

\`\`\`typescript
// Set the awareness field for the current user
provider.setAwarenessField('user', {
  // Share any information you like
  name: 'Kevin James',
  color: '#ffcc00',
})
\`\`\`

### Listen for changes

Set up an event listener to track changes in the Awareness states across all connected users:

\`\`\`typescript
// Listen for updates to the states of all users
provider.on('awarenessChange', ({ states }) => {
  console.log(states)
})
\`\`\`

You can now view these updates in your browser's console as you move on to the next step.

### Track mouse movement

Next, we'll add an event listener to our app to track mouse movements and update the awareness' information accordingly.

\`\`\`typescript
document.addEventListener('mousemove', (event) => {
  // Share any information you like
  provider.setAwarenessField('user', {
    name: 'Kevin James',
    color: '#ffcc00',
    mouseX: event.clientX,
    mouseY: event.clientY,
  })
})
\`\`\`

Check your browser's console to see the stream of events as users move their mice.

## Add cursors and carets

With basic Awareness in place, consider adding the [Collaboration Cursor](/editor/extensions/functionality/collaboration-cursor) extension to your editor. This extension adds cursor positions, text selections, and personalized details (such as names and colors) of all participating users to your editor.

```

# collaboration\core-concepts\webhooks.mdx

```mdx
---
title: Webhooks in Collaboration
meta:
  title: Webhooks | Tiptap Collaboration Docs
  description: Set up and understand webhook payloads, and manage settings to integrate advanced features. Learn more in the docs!
  category: Collaboration
---

import { Callout } from '@/components/ui/Callout'

You can define a URL and we will call it every time a document has changed. This is useful for getting the JSON representation of the Yjs document in your own application.

We call your webhook URL when the document is saved to our database. This operation is debounced by 2-10 seconds. So your application won't be flooded by us. Right now we're only exporting the fragment `default` of the Yjs document.

## Configure Webhooks

To configure webhooks for document and comments notifications:

1. Navigate to the [Collaboration settings](https://cloud.tiptap.dev/apps/settings) in your account.
2. Find the webhooks section and add your desired endpoint URL.

After adding your URL, the webhook is immediately live. You'll start receiving notifications for the specified events without any delay.

<Callout title="Add Comments support to your webhook" variant="warning">
  If you want to add webhook support for the comments feature and your collaboration app was created
  before March 2024, please upgrade your webhook as described [below](#enable-the-comments-webhook).
</Callout>

## Example payload

All requests to your webhook URL will contain a header called `X-Hocuspocus-Signature-256` that signs the entire message with your secret. You can find it in the [settings](https://collab.tiptap.dev/apps/settings) of your Tiptap Collab app.

\`\`\`json
{
  "appName": '', // name of your app
  "name": '', // name of the document (URI encoded if necessary)
  "time": // current time as ISOString (new Date()).toISOString())
  "tiptapJson": {}, // JSON output from Tiptap (see https://tiptap.dev/guide/output#option-1-json): TiptapTransformer.fromYdoc()
  "ydocState"?: {}, // optionally contains the entire yDoc as base64. Contact us to enable this property!
  "clientsCount": 100,// number of currently connected clients
  "type": '', // the payload type (if the document was changed, this is DOCUMENT) ; only available if you are on webhooks v2
  "trigger": '', // what triggered the event (usually "document.saved") ; only available if you are on webhooks v2
  "users": [] // list of users who changed the content since the last webhook ("sub" field from the JWT)
}
\`\`\`

## Retries

Webhooks are not retried by default, but you can enable retries by setting `webhook_retries` to `1` (see [Configure Runtime](/collaboration/operations/configure)).
The retry schedule is as follows:

- 1st retry: 5 seconds after the initial attempt
- 2nd retry: 15 seconds after the last attempt
- 3rd retry: 2 minutes after the last attempt
- 4th retry: 10 minute after the last attempt
- 5th retry: 30 minutes after the last attempt
- 6th retry: 3 hours after the last attempt

All retries include a header `X-Hocuspocus-Retry` with the current retry count. The `time` property in the payload is the timestamp of the initial attempt.

## Enable the Comments webhook

The webhook that supports comments is automatically enabled for all users that have created their account after March, 2024.

If your account was created before March, 2024 and you're using an older version of the webhook system, you'll need to manually enable the new comments webhooks. Here's how:

1. In case you’ve already implemented a previous Collaboration webhook, make sure to check the `type` and `trigger` fields when processing incoming webhooks.
2. Navigate to the [Collaboration settings](https://cloud.tiptap.dev/apps/settings) in your account.
3. Locate the Webhook section and click on the "Update" button.

This upgrade is necessary to accommodate the introduction of multiple new events being routed to the same webhook endpoint, distinguished by a new `type` and `trigger` field.

If you do not wish to use the comments webhook, no upgrade is necessary.

## Loader Webhook

In order to initialize documents, you can use the `webhook_loader_url` setting (see [configure runtime](/collaboration/operations/configure)). This URL will be called if a new document is requested.
The webhook will contain a header `Authorization` with your secret, and `document-name` with the name of the requested document.

If you return a yjs update (Y.encodeStateAsUpdate on your side), it will be applied to the document. If you return anything else, the document will be initialized with an empty document.
Note that the loader webhook is called only once when the document is created.
```

# collaboration\documents\content-injection.mdx

```mdx
---
title: Inject content REST API
meta:
  title: Inject content API | Tiptap Collaboration Docs
  description: Manage your Collaboration documents with JSON updates using the Inject Content API. Learn more in our docs!
  category: Collaboration
---

import { Callout } from '@/components/ui/Callout'

To inject content into documents server-side, use the PATCH endpoint described in this document. This feature supports version history, tracking changes as well as content added through this endpoint.

The update document endpoint also allows JSON updates to modify documents on your Collaboration server, both On-Premises and Cloud:

- Add `json`, `binary`, or `base64` content to any document server-side.
- Inject content into specific nodes using the [UniqueID extension](/editor/extensions/functionality/uniqueid).
- Users can still collaborate in real-time as content is injected.
- Track user and injected content changes, fully compatible with [document history](/collaboration/documents/history).

### Use cases

The content injection REST API enables a couple of handy but sophisticated use cases:

- Live translation of document content.
- Programmatically tagging or manipulating document content server-side.
- Integrating server-side components, like executing SQL queries and displaying results.
- Version history integration and conflict-free merging of concurrent edits.

<Callout title="Subscription required" variant="warning">

    This feature requires a valid Business or Enterprise subscription and a running [Tiptap Cloud instance](https://collab.tiptap.dev/).

</Callout>

## Update a document

To update an existing document on the Collaboration server, you can use the `PATCH` method with the following API endpoint:

\`\`\`bash
PATCH /api/documents/:identifier?format=:format
\`\`\`

This endpoint accepts a Yjs update message and applies it to the specified document. The `format` query parameter specifies the format of the update and can be one of the following:

- `json`: Updates the document using JSON format (with some caveats, [see below](#update-via-json)).
- `binary`: Directly using Yjs's `Y.encodeStateAsUpdate` method.
- `base64`: The binary state encoded as a Base64 string.

Upon successful update, the server will return HTTP status `204`. If the document does not exist, it will return `404`, and if the payload is invalid or the update cannot be applied, it will return `422`.

**Example:** `curl` command to update a document

\`\`\`bash
curl --location --request PATCH 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/DOCUMENT_NAME' \\
--header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA' \\
--data '@yjsUpdate.binary.txt'
\`\`\`

## Update via JSON

When updating via JSON, the server computes the difference between the current document state and the provided JSON, then internally calculates the required Yjs update to reach the target state.

To ensure precise updates, especially for node-specific changes, it is recommended to use the `nodeAttributeName` and `nodeAttributeValue` parameters. These can be generated by Tiptap's [UniqueID Extension](/editor/extensions/functionality/uniqueid) or a custom implementation.
Note that this only works for top level nodes.

- `nodeAttributeName`: Configured as `attributeName` in the [UniqueID extension](/editor/extensions/functionality/uniqueid).
- `nodeAttributeValue`: The unique value generated for the node being updated. You can pass multiple values with `?nodeAttributeValue=a&=nodeAttributeValue=b`.

You can use `?mode=append` to append nodes to the document's JSON representation without altering existing nodes.

Omitting these parameters may result in overwriting any updates made between fetching the document and issuing the update call. The `get document` call returns a header `x-${fragmentName}-checksum` which can be used to detect conflicts by passing
it to the update call as `?checksum=${checksum}`. If the document has been updated since the last fetch, the update will fail with a `409 Checksum mismatch.` status.

**Example:** Updating a document using JSON

\`\`\`typescript
// Define the document name, secret, and application ID
const docName = '' // URI-encoded if necessary
const secret = ''
const appId = '';

// Construct the base URL
const url = `https://${appId}.collab.tiptap.cloud`

// Fetch the current document's JSON representation
const docJson = await axios.get(`${url}/api/documents/${docName}?format=json`, {
    headers: {
    Authorization: secret
  },
})

// Extract the document's JSON content
const tiptapJson = docJson.data
const nodes = tiptapJson.content

// Find and log specific nodes using their unique identifiers
const query = nodes.find(n => n.attrs?.identifier === 'fe5c0789-85d9-4877-a2c3-bccf5d874866').content[0].text
const resultTable = nodes.find(n => n.attrs?.identifier === '246368b6-0746-4ca1-a16f-8d964aff4041')

console.log(`Query: ${query}`)
console.log(JSON.stringify(resultTable.content))

// Append new content to the result table node
resultTable.content.push({
  // New table row content here
  {
    "type": "tableRow",
    "content": [
      {
        "type": "tableCell",
        "attrs": {
          "colspan": 1,
          "rowspan": 1
        },
        "content": [
          {
            "type": "paragraph",
            "attrs": {
              "textAlign": "left"
            },
            "content": [
              {
                "type": "text",
                "text": "Jan"
              }
            ]
          }
        ]
      },
      {
        "type": "tableCell",
        "attrs": {
          "colspan": 1,
          "rowspan": 1
        },
        "content": [
          {
            "type": "paragraph",
            "attrs": {
              "textAlign": "left"
            },
            "content": [
              {
                "type": "text",
                "text": "Thurau"
              }
            ]
          }
        ]
      },
      {
        "type": "tableCell",
        "attrs": {
          "colspan": 1,
          "rowspan": 1
        },
        "content": [
          {
            "type": "paragraph",
            "attrs": {
              "textAlign": "left"
            },
            "content": [
              {
                "type": "text",
                "text": "jan@janthurau.de"
              }
            ]
          }
        ]
      }
    ]
  }
})

// Send the updated JSON back to the server to apply the changes
await axios.patch(`${url}/api/documents/${docName}?format=json`, tiptapJson, {
  headers: {
    Authorization: secret
  }
})
\`\`\`

### Update only node attrs

If you want to only update attributes of a node, you can use the `?mode=attrs` query parameter. This will only update the attributes of the node and not its content. 
In this mode, the `nodeAttributeName` and `nodeAttributeValue` parameters work for any (not just top level) nodes.

Note that we're deleting all attrs on that node and then setting only the ones specified in the payload of the request. Not specifying a node filter (nodeAttributeName, nodeAttributeValue) will result in all nodes being updated.

\`\`\`
curl --location --request PATCH '/api/documents/:identifier?format=json&nodeAttributeName=id&nodeAttributeValue=12&mode=attrs' \
--data '{
  "indent": 12,
  "textAlign": "right"
}'
\`\`\`

## Create a document

To seed a new document on the Tiptap Collab server, use the `POST` method with the following endpoint:

\`\`\`bash
POST /api/documents/:identifier?format=:format
\`\`\`

The server will return HTTP status `204` for successful creation, `409` if the document already exists (you must delete it first to overwrite), and `422` if the action failed.

The `format` parameter accepts the same values as the update endpoint (`binary`, `base64`, or `json`).

```

# collaboration\documents\history.mdx

```mdx
---
title: Integrate document history
meta:
  title: History extension | Tiptap Editor Docs
  description: Editor History for manual and automatic versioning of your documents. Learn how to set up and use it here in the Docs!
  category: Collaboration
extension:
  name: History
  description: 'Document version history for manual and automatic versioning of your documents.'
  type: extension
  icon: FileStack
  isPro: true
  isNew: true
  isCloud: true
---

import { Callout } from '@/components/ui/Callout'
import { CodeDemo } from '@/components/CodeDemo'

This extension introduces a document version history feature, allowing you to manually or automatically generate document versions.

You can restore previous iterations, and you can also create new versions from older ones.

<Callout title="Public Demo" variant="warning">
  The content of this editor is shared with other users.
</Callout>

<CodeDemo isPro path="/Extensions/CollaborationHistory" />

## Install

<Callout title="Set up access to Tiptap’s private repository" variant="info">
  Gain access to this pro extension by registering for a free [Tiptap
  account](https://cloud.tiptap.dev/register) and following our [access
  guide](/guides/pro-extensions) to Tiptap’s private repository.
</Callout>

\`\`\`bash

npm install @tiptap-pro/extension-collaboration-history @hocuspocus/transformer

\`\`\`

**Note**:
The `@hocuspocus/transformer` package is required for transforming Y.js binary into Tiptap JSON. It also requires Y.js installed for collaboration. 
If you don't have it installed, run `npm install yjs` in your project. This should happen automatically if you use NPM (as it automatically resolves peer dependencies).

## Settings

| Setting  | Type                   | Default    |
| -------- | ---------------------- | ---------- |
| provider | `TiptapCollabProvider` | `null`     |
| onUpdate | `function`             | `() => {}` |

## Autoversioning

The autoversioning feature automatically creates new versions of your document at regular intervals. This ensures that you have a comprehensive change history without manual intervention.

You can toggle this feature using the `toggleVersioning` command (default: disabled).

When you enable autoversioning, Tiptap creates new versions at regular intervals (30 seconds by default, only if the document has changed). This can create many versions, so you may want to increase the interval.
To customize the interval, you can do the following:

\`\`\`typescript
// Set the interval (in seconds) between autoversions
const ydoc = provider.configuration.document
ydoc.getMap<number>('__tiptapcollab__config').set('intervalSeconds', 900)
\`\`\`

## Revert to a version

When you revert to a previous version:

1. If there are unsaved changes, Tiptap automatically creates a version to preserve those changes.
2. Tiptap creates a new version at the top of the history with the content from the version you select.
3. All users can continue working from this new version.

Note that reverting only affects the `default` fragment in the ydoc. When you revert the Tiptap content, the comments don't change (unless you specify a different `field` in the TiptapCollabProvider).

You can integrate the [compare snapshots](/collaboration/documents/snapshot-compare) extension to highlight differences between versions, ensuring you choose the right version to restore.

## Storage

| Key               | Type                   | Description                                                                     |
| ----------------- | ---------------------- | ------------------------------------------------------------------------------- |
| currentVersion    | `number`               | The current version.                                                            |
| lastSaved         | `Date`                 | The last saved timestamp                                                        |
| latestVersion     | `number`               | The latest version.                                                             |
| provider          | `TiptapCollabProvider` | The Collaboration provider instance                                             |
| status            | `string`               | The status of the provider - can be `connecting`, `connected` or `disconnected` |
| synced            | `boolean`              | Is the version history synced with the server                                   |
| versioningEnabled | `boolean`              | Is versioning enabled                                                           |
| versions          | `array<Version>`       | The array of versions that are stored in the history.                           |

## Commands

| Command          | Description                                                                       |
| ---------------- | --------------------------------------------------------------------------------- |
| saveVersion      | Creates a new version with a given title                                          |
| toggleVersioning | Toggles autoversioning for this document                                         |
| revertToVersion  | Revert to a specific version, can create a new revert version with optional title |

## Examples

### Basic setup

\`\`\`js
const provider = new TiptapCollabProvider({
  // ...
})

const editor = new Editor({
  // ...
  extensions: [
    // ...
    CollabHistory.configure({
      provider,
    }),
  ],
})
\`\`\`

### Store version updates

In this example we retrieve the data of a version update and save it into a variable

\`\`\`js
let currentVersion = 0
let latestVersion = 0
let autoversioningEnabled = false
let versions = []

const provider = new TiptapCollabProvider({
  // ...
})

const editor = new Editor({
  // ...
  extensions: [
    // ...
    CollabHistory.configure({
      provider,
      onUpdate(payload) {
        currentVersion = payload.currentVersion
        latestVersion = payload.version
        versions = payload.versions
        autoversioningEnabled = payload.autoVersioning
      },
    }),
  ],
})
\`\`\`

### Access version data directly from storage

\`\`\`js
const provider = new TiptapCollabProvider({
  // ...
})

const editor = new Editor({
  // ...
  extensions: [
    // ...
    CollabHistory.configure({
      provider,
    }),
  ],
})

const latestVersion = editor.storage.collabHistory.latestVersion
const currentVersion = editor.storage.collabHistory.currentVersion
const versions = editor.storage.collabHistory.versions
const autoversioningEnabled = editor.storage.collabHistory.versioningEnabled
\`\`\`

### Create a new version manually

\`\`\`js
editor.commands.saveVersion('My new custom version')
\`\`\`

### Toggle autoversioning on document

\`\`\`js
editor.commands.toggleVersioning()
\`\`\`

### Revert with version ID

\`\`\`js
editor.commands.revertToVersion(4)
\`\`\`

### Revert with version ID with custom name

In this example, the editor command helps you go back to version 4. When you use this command, it takes you back to how things were in version 4, and it also saves this old version as a new version called 'Revert to version'. This way, you can continue working from version 4, but it's now saved as the latest version.

\`\`\`js
editor.commands.revertToVersion(4, 'Revert to version')
\`\`\`

### Revert, name, and back up

In this example, when you revert to version 4 of your document, the editor automatically creates two new versions. The first new version captures and saves your document’s state just before reverting, serving as a backup. The second new version restores the document to version 4, allowing you to continue from here as your new starting point.

\`\`\`js
editor.commands.revertToVersion(4, 'Revert to version', 'Unversioned changes before revert')
\`\`\`

### Implementing version previews for your editor

The examples above directly modify the document and do not provide local-only previews of the version. Therefore, you must create your own frontend solution for this requirement. You can leverage the stateless messaging system of the `TiptapCloudProvider` to request a specific version from the server.

Start by attaching a listener to the provider:

\`\`\`js
// Import the getPreviewContentFromVersionPayload helper function (refer to details below)
import { watchPreviewContent } from '@tiptap-pro/extension-collaboration-history'

// Configure the provider
const provider = new TiptapCollabProvider({ ... })

// Use the watchPreviewContent util function to watch for content changes on the provider
const unbindWatchContent = watchPreviewContent(provider, content => {
  // set your editors content
  editor.commands.setContent(content)
})
\`\`\`

If you want to unbind the watcher, you can call the returned `unbindWatchContent` function like this:

\`\`\`js
const unbindWatchContent = watchPreviewContent(provider, (content) => {
  // set your editors content
  editor.commands.setContent(content)
})

// unwatch
unbindWatchContent()
\`\`\`

Following this setup, you can trigger `version.preview` requests like so:

\`\`\`js
// Define a function that sends a version.preview request to the provider
const requestVersion = (version) => {
  provider.sendStateless(
    JSON.stringify({
      action: 'version.preview',
      // Include your version number here
      version,
    }),
  )
}

// Trigger the request
requestVersion(1)

// You can then link this function to button clicks or other UI elements to trigger the request.
\`\`\`

To go beyond previews and compare different versions visually, the [compare snapshots](/collaboration/documents/snapshot-compare) extension provides an easy way to see the changes between any two versions within the editor.

## Utility functions

### getPreviewContentFromVersionPayload

This function turns the payload from the Collaboration provider into Tiptap JSON content.

| Argument | Description                                          |
| -------- | ---------------------------------------------------- |
| payload  | The Hocuspocus payload for the version preview event |
| field    | The field you want to parse. Default: `default`      |

\`\`\`js
const myContent = getPreviewContentFromVersionPayload(payload, 'default')
\`\`\`

### watchPreviewContent

This function sets up a watcher on your provider that watches the necessary events to react to version content changes. It also returns a new function that you can use to unwatch those events.

| Argument | Description                                                                   |
| -------- | ----------------------------------------------------------------------------- |
| provider | The Collaboration provider                                                    |
| callback | The callback function that is called, the argument is the Tiptap JSON content |
| field    | The watched field - defaults to `default`                                     |

\`\`\`js
const unwatchContent = watchPreviewContent(provider, editor.commands.setContent, 'default')

// unwatch the version preview content
unwatchContent()
\`\`\`

## Possible provider payloads

Here is a list of payloads that can be sent or received from the provider:

### Outgoing

#### `document.revert`

Request a document revert to a given version with optional title settings.

\`\`\`js
provider.sendStateless(
  JSON.stringify({
    action: 'document.revert',
    version: 1,
    currentVersionName: 'Before reverting to version 1',
    newVersionName: 'Revert to version 1',
  }),
)
\`\`\`

#### `version.create`

Creates a new version with an optional title.

\`\`\`js
this.options.provider.sendStateless(
  JSON.stringify({ action: 'version.create', name: 'My custom version' }),
)
\`\`\`

### Incoming

#### `saved`

This stateless message can be used to retrieve the last saved timestamp.

\`\`\`js
provider.on('stateless', (data) => {
  const payload = JSON.parse(data.payload)

  if (payload.action === 'saved') {
    const lastSaved = new Date()
  }
})
\`\`\`

#### `version.created`

This stateless message includes information about newly created versions.

\`\`\`js
provider.on('stateless', (data) => {
  const payload = JSON.parse(data.payload)

  if (payload.action === 'version.created') {
    const latestVersion = payload.version
    const currentVersion = payload.version
  }
})
\`\`\`

#### `document.reverted`

This stateless message includes information about a document revert.

\`\`\`js
provider.on('stateless', (data) => {
  const payload = JSON.parse(data.payload)

  if (payload.action === 'document.reverted') {
    const currentVersion = payload.version
  }
})
\`\`\`

```

# collaboration\documents\index.mdx

```mdx
---
title: Manage Documents with Tiptap
meta:
  title: Documents | Tiptap Collaboration
  description: Use Tiptap Collaboration to store, manage, and track documents. Integrate with our REST API and webhooks for real-time updates.
  category: Collaboration
---

import { ArrowRightIcon } from 'lucide-react'
import Link from '@/components/Link'
import * as CtaBox from '@/components/CtaBox'
import { Button } from '@/components/ui/Button'
import { Callout } from '@/components/ui/Callout'

Collaboration Documents form the backbone of Tiptap Collaboration, storing everything from content and comments to versions and metadata using the Yjs format.

Typically, users manage these documents using the REST API or track changes with the Collaboration Webhook, which sends detailed updates. Tiptap converts the documents into HTML or JSON for you, so you don't have to deal directly with the Yjs format.

- **Host your documents:** Choose between cloud, dedicated cloud or on-premises deployment.
- **Document REST API:** Create, update, and delete documents programmatically.
- **Webhooks:** Automate responses to real-time document and comment events.
- **Document versioning and comparison:** Track changes in documents through automatic or manual versioning, and visually compare differences between snapshots.
- **Content injection:** Modify document content server-side with the REST API, even during active collaboration sessions.

<CtaBox.Wrapper className="mt-12">
  <CtaBox.Title>Enterprise on-premises solution</CtaBox.Title>
  <CtaBox.Description>
    Integrate Collaboration and all other Tiptap features into your infrastructure.
  </CtaBox.Description>
  <CtaBox.List>
    <CtaBox.ListItem title="On-premises: ">
      Deploy our docker images in your own stack
    </CtaBox.ListItem>
    <CtaBox.ListItem title="High availability cluster: ">
      Scale confidently to millions of users
    </CtaBox.ListItem>
    <CtaBox.ListItem title="Dedicated support: ">
      Custom development and integration support in Chat
    </CtaBox.ListItem>
  </CtaBox.List>
  <CtaBox.Actions className="-mx-3">
    <Button className="text-white/80 hover:text-white/100" variant="tertiary" asChild>
      <Link href="https://45pg7sjo8uw.typeform.com/to/DRCOgZGi">
        Let's talk
        <ArrowRightIcon className="w-4 h-4" />
      </Link>
    </Button>
  </CtaBox.Actions>
</CtaBox.Wrapper>

## Integrate documents

Integrating documents into your editor and application with Tiptap is straightforward. By adding the Tiptap Collaboration provider to your setup, documents are automatically stored and managed within the Tiptap Collaboration framework.

This integration immediately enables you to use all document features, like storing collaborative documents, managing version histories, using the REST API, and injecting content.

<Callout title="Note" variant="hint">
  You can easily migrate your documents from our cloud to an on-premises server at a later time.
</Callout>

1. **Integrate the Tiptap Editor:** Follow the [installation guide](/collaboration/getting-started/install) to setup an editor.
2. **Create a Tiptap Account:** Set up your [Collaboration app](https://cloud.tiptap.dev/) to store you documents.
3. **Integrate the Tiptap Collaboration Provider:** [Connect](/collaboration/getting-started/install#integrate-yjs-and-the-collaboration-extension) the Tiptap Editor with collaboration features to enable document management.
4. **Create and Manage Documents:** Start creating your first documents.

And now, you are all set to use the document features 🙌🏻

## Retrieve and manage documents

Use the [REST API](/collaboration/documents/rest-api) to fetch documents in `JSON` or `HTML` format for easy integration with your system. For immediate updates on changes, configure [webhooks](/collaboration/core-concepts/webhooks) to receive real-time notifications.

**Track changes in documents:** The [document history](/collaboration/documents/history) extension in Tiptap Collaboration automatically captures and stores snapshots of documents at designated intervals. It also allows for manual versioning, enabling users to track detailed changes and document evolution.

**Compare snapshots:** The [compare snapshots](/collaboration/documents/snapshot-compare) extension lets you visually compare two versions of a document, highlighting changes and their authors, helping you see modifications over time.

**Inject content:** Update the content of active documents with an [Patch Document endpoint](/collaboration/documents/content-injection), which allows server-side modifications even during active user collaboration.

```

# collaboration\documents\rest-api.mdx

```mdx
---
title: Document management API
meta:
  title: REST API | Tiptap Collaboration Docs
  description: Manage your Tiptap documents programmatically with the Collaboration Management API. Find out more in the documentation.
  category: Collaboration
---

import { Callout } from '@/components/ui/Callout'

The Collaboration Management API provides a suite of RESTful endpoints for managing documents. This API can be used for document creation, listing, retrieval, updates, deletion, and duplication.

You can experiment with the REST API by visiting our [Postman Collection](https://www.postman.com/docking-module-explorer-14290287/workspace/tiptap-collaboration-public/collection/33042171-cc186a66-df41-4df8-9c6e-e91b20deffe5?action=share&creator=32651125).

## Rate limits

To maintain system integrity and protect from misconfigured clients, our infrastructure&mdash;including the management API and websocket connections through the `TiptapCollabProvider`&mdash;is subject to rate limits.

### Default rate limits (per source IP):

  - **Requests:** 100
  - **Time window:** 5 seconds
  - **Burst capacity:** Up to 200 requests

If you encounter these limits under normal operation, please [email us](mailto:humans@tiptap.dev).

## Access the API

The REST API is exposed directly from your Collaboration app at your custom URL:

\`\`\`bash
https://YOUR_APP_ID.collab.tiptap.cloud/
\`\`\`
### Authentication
Authenticate your API requests by including your API secret in the `Authorization` header. You can find your API secret in
the [settings](https://cloud.tiptap.dev/apps/settings) of your Tiptap Cloud dashboard.

### Document identifiers
If your document identifier contains a slash (`/`), encode it as `%2F`, e.g., using `encodeURIComponent`.

## API endpoints overview

Access the Collaboration Management API to manage your documents efficiently. For a comprehensive view of all endpoints across Tiptap products, explore our [Postman Collection](https://www.postman.com/docking-module-explorer-14290287/workspace/tiptap-collaboration-public/collection/33042171-cc186a66-df41-4df8-9c6e-e91b20deffe5?action=share&creator=32651125), which includes detailed examples and configurations.

| Operation          | Method     | Endpoint                                     | Description                                                                    |
| ------------------ | ---------- | -------------------------------------------- | ------------------------------------------------------------------------------ |
| Create Document    | POST       | `/api/documents/:identifier`                 | Create a document using a `yjs` or `json` update message.                                  |
| Batch Import Documents | PUT    | `/api/admin/batch-import`                    | Import multiple documents in bulk.                                             |
| Get Document       | GET        | `/api/documents/:identifier`                 | Export a document in `json` or `yjs` format.                                   |
| List Documents     | GET        | `/api/documents`                             | Retrieve a list of all documents with pagination options.                      |
| Duplicate Document | POST + GET | `/api/documents/:identifier` (GET then POST) | Duplicate a document by retrieving it and then creating it with a new identifier. |
| Encrypt Document   | POST       | `/api/documents/:identifier/encrypt`         | Encrypt a document using Base64.                                               |
| Revert to Version  | POST       | `/api/documents/:identifier/versions`        | Import multiple documents in bulk.                                             |
| Update Document    | PATCH      | `/api/documents/:identifier`                 | Apply a Yjs update message to an existing document.                            |
| Delete Document    | DELETE     | `/api/documents/:identifier`                 | Delete a document from the server.                                             |
| Search Documents     | POST     | `/api/search`                                | Execute a search on all documents.                                             |

Take a look at the [metrics and statistics endpoints](/collaboration/operations/metrics) as well!

## Create a document

\`\`\`bash
POST /api/documents/:identifier
\`\`\`

This call lets you create a document using [binary Yjs](/collaboration/getting-started/overview#about-yjs) or JSON format (default: `yjs`). It can be used to seed documents before a user connects to the Tiptap Collaboration server.

The endpoint returns HTTP status `204` if the document is created successfully, or `409`
if the document already exists. To overwrite an existing document, you must [delete it](/collaboration/documents/rest-api#delete-a-document) first.

- **Yjs format**: To create a document using a Yjs binary update message, first encode the Yjs document using `Y.encodeStateAsUpdate`. 

\`\`\`bash
curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/DOCUMENT_NAME' \
--header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA' \
--data '@yjsUpdate.binary.txt'
\`\`\`

- **JSON format**: To create a document using JSON, pass the query parameter `format=json` and include the document's content in the Tiptap JSON format.

\`\`\`bash
curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/DOCUMENT_NAME?format=json' \
--header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA' \
--header 'Content-Type: application/json' \
--data '{
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "This is your content."
          }
        ]
      }
    ]
}'

\`\`\`

## Batch import documents

\`\`\`bash
PUT /api/admin/batch-import
\`\`\`

This call lets you import multiple documents in bulk using a predefined JSON structure. Each document must include its metadata (such as created_at, name, and version) and its content in the Tiptap JSON format.

The endpoint returns HTTP status `204` if the documents are imported successfully, or `400` if the request contains invalid data.

\`\`\`bash
curl --location --request PUT 'https://YOUR_APP_ID.collab.tiptap.cloud/api/admin/batch-import' \
--header 'Content-Type: application/json' \
--data '[
    [
        {
            "created_at": "2024-05-01T10:00:00Z",
            "version": 0,
            "name": "document-1",
            "tiptap_json": {"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Text of document-1: v0"}]}]}
        },
        {
            "created_at": "2024-05-01T11:00:00Z",
            "version": 1,
            "name": "document-1",
            "tiptap_json": {"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Text of document-1: v1"}]}]}
        }
    ],
    [
        {
            "created_at": "2024-06-01T10:00:00Z",
            "version": 0,
            "name": "document-2",
            "tiptap_json": {"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Text of document-2: v0"}]}]}
        },
        {
            "created_at": "2024-06-01T11:00:00Z",
            "version": 1,
            "name": "document-2",
            "tiptap_json": {"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Text of document-2: v1"}]}]}
        }
    ]
]'

\`\`\`

## Get a document

\`\`\`bash
GET /api/documents/:identifier?format=:format&fragment=:fragment
\`\`\`

This call lets you export the specified document with all fragments in JSON or Yjs format. If the document is currently open on your
server, we will return the in-memory version; otherwise, we read from the database.

- `format` supports either `yjs`, `base64`, `text`, or `json` (default: `json`). If you choose the `yjs` format, you'll get the binary Yjs update message created
with `Y.encodeStateAsUpdate`.

- `fragment` can be an array (e.g., `fragment=a&fragment=b`) or a single fragment you want to
export. By default, we only export the `default` fragment. This parameter is only applicable when using
the `json` or `text`format; with `yjs`, you'll always get the entire Yjs document.

\`\`\`bash
curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/DOCUMENT_NAME' \
--header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA'
\`\`\`

  When using `axios`, you need to specify `responseType: arraybuffer` in the request options.

\`\`\`typescript
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
\`\`\`

When using `node-fetch`, you need to use `.arrayBuffer()` and create a Buffer from it:

\`\`\`typescript
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
\`\`\`

## List documents

\`\`\`bash
GET /api/documents?take=100&skip=0
\`\`\`

This call returns a paginated list of all documents in storage. By default, we return the first
100 documents. Pass `take` and `skip` parameters to adjust pagination.

\`\`\`bash
curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents' \
--header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA'
\`\`\`


## Duplicate a document

This call lets you copy or duplicate a document. First, retrieve the document using the `GET` endpoint and then create a new one with the
`POST` call. Here's an example in typescript:

\`\`\`typescript
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
\`\`\`

## Encrypt a document

\`\`\`bash
POST /api/documents/:identifier/encrypt
\`\`\`

This call lets you encrypt a document with the specified identifier using Base64 encryption.

The endpoint returns HTTP status `204` if the document is successfully encrypted, or `404` if the document does not exist.

\`\`\`bash
curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/DOCUMENT_NAME/encrypt' \
--header 'Content-Type: application/json' \
--header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA' \
--data '{
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "attrs": {
          "indent": 0,
          "textAlign": "left"
        },
        "content": [
          {
            "text": "the entire document is replaced by this (except if you changed the mode parameter to '\''append'\'')",
            "type": "text"
          }
        ]
      }
    ]
  }'
\`\`\`

## Revert to version

\`\`\`bash
POST /api/documents/:identifier/versions
\`\`\`

This call lets you revert a document to a specific previous version by applying an update that corresponds to a prior state of the document. You must specify the version to revert to in the request body.

The endpoint returns HTTP status `204` if the document is successfully reverted, or `404` if the document or version is not found.

\`\`\`bash
curl --location --request POST 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/DOCUMENT_NAME/versions/VERSION_ID/revertTo' \
--header 'Content-Type: application/json' \
--header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA'

\`\`\`


## Update a document

\`\`\`bash
PATCH /api/documents/:identifier
\`\`\`

This call accepts a Yjs update message and applies it to the existing document on the server.

The endpoint returns the HTTP status `204` if the document was updated successfully, `404` if
the document does not exist, or `422` if the payload is invalid or the update cannot be applied.

\`\`\`bash
curl --location --request PATCH 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/DOCUMENT_NAME' \
--header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA' \
--data '@yjsUpdate.binary.txt'
\`\`\`

The API endpoint also supports JSON document updates, document history for tracking changes without replacing the entire document, and node-specific updates.

For more detailed information on manipulating documents using JSON instead of Yjs, refer to our [Content injection](/collaboration/documents/content-injection) page.

## Delete a document

\`\`\`bash
DELETE /api/documents/:identifier
\`\`\`

This call deletes a document from the server after closing any open connection to the document.

It returns either HTTP status `204` if the document was deleted successfully, or `404` if the
document was not found.

\`\`\`bash
curl --location --request DELETE 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/DOCUMENT_NAME' \
--header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA'
\`\`\`

<Callout title="Document persists after deletion" variant="hint">
  If the endpoint returns `204` but the document still exists, make sure that no user is re-creating the document from the provider. We close all connections before deleting a document, but your error handling might recreate the provider, thus creating the document again.
</Callout>


## Search documents

\`\`\`bash
POST /api/search
\`\`\`

When [Tiptap Semantic Search](/collaboration/documents/semantic-search) is enabled, you can perform contextually aware searches across all your documents.

<Callout title="Keeping your API key secret" variant="hint">
  Please handle the search requests in your backend to keep your API
  key secret. Consider enforcing rate limits in your application as necessary.
</Callout>

### Query parameters

You can use the following query parameters to adjust the search results:

| Query parameter | Type  | Default | Description                                                                       |
| --------------- | ----- | ------- | --------------------------------------------------------------------------------- |
| `threshold`     | float | `0.5`   | Describes the similarity factor of documents. The value can be between `0` an `1`. |
| `limit`         | int   | `20`    | Limit the number of results. The value can be between `1` an `100`.                |

### Body parameters

| Body parameter | Type   | Default | Description      |
| -------------- | ------ | ------- | ---------------- |
| `content`      | string | -       | Your search terms. |

\`\`\`bash
curl -X POST https://YOUR_APP_ID.collab.tiptap.cloud/api/search \
  -H "Authorization: YOUR_SECRET_FROM_SETTINGS_AREA" \
  -H "Content-Type: application/json" \
  -d '{"content": "Your search terms"}'
\`\`\`
```

# collaboration\documents\semantic-search.mdx

```mdx
---
title: Semantic Search
meta:
  title: Semantic Search | Tiptap Editor Docs
  description: Semantic Search across your documents. Learn how to set up and use it here in the Docs!
  category: Collaboration
---

import { Callout } from '@/components/ui/Callout'
import { CodeDemo } from '@/components/CodeDemo'

Tiptap Semantic Search brings AI-native search capabilities to your document library, making it easy to discover relationships and connections across all your documents through contextual understanding provided by large language models.

Searching through large document archives can be challenging, especially if you miss the exact keywords. Semantic Search addresses this by interpreting the intent behind the search query and the contextual meaning within your documents. 

The LLM’s interpretation is encoded as numerical representations, known as vectors or embeddings, which capture the semantic meaning of both new and existing content. These embeddings can then be easily compared to retrieve the most relevant documents.

<Callout title="Private Beta" variant="hint">
  This feature is currently in private beta and available by invite only. Tell us about your use case at [humans@tiptap.dev](mailto:humans@tiptap.dev) to be considered for early access to Tiptap Semantic Search.
</Callout>

## Live demo

Below is an interactive demo of Tiptap Semantic Search. Type into the editor on the left, and watch as the search results update in real time with the most contextually relevant pages from our public documentation. Discover more details about the demo in our [examples](https://ai-demo.tiptap.dev/preview/Examples/SemanticSearch). 

<CodeDemo src="https://ai-demo.tiptap.dev/preview/Examples/SemanticSearch?hideSource=1" />

## Getting started

### Prerequisites

- Tiptap Collaboration
- Access to private beta (request an invite [here](mailto:humans@tiptap.dev))

### How it works

When you input a query, the following things happen:
1. **Embedding**: Your query is transformed into a high-dimensional vector using a model optimized for similarity search.
2. **Vector search**: This vector is compared with the existing vectors of your document library. The comparison process is based on similarity metrics to identify the most relevant documents.
3. **Context-aware results**: Documents are ranked according to their semantic similarity to the query, so that even if the words don't match, the most relevant content is surfaced.

We have configured these operations in the background, making the complex process transparent to you as you set up and use this new Tiptap feature. With Tiptap Semantic Search, you can: 

- **Improve search relevance**: Retrieve documents that match the intent of a query, not just keywords.
- **Understand context**: Recognize synonyms, related concepts, and varying word order to find the most pertinent results.
- **Enhance user experience**: Deliver more accurate and meaningful search results, improving their interaction with content.

This is particularly valuable for knowledge management systems, document retrieval, idea generation, or any application where precise, context-aware search results are critical.

### Perform a search

To perform a search, use the search endpoint as described [in the REST API documentation](/collaboration/documents/rest-api#search-documents).

\`\`\`bash
curl -X POST https://YOUR_APP_ID.collab.tiptap.cloud/api/search \
  -H "Authorization: YOUR_SECRET_FROM_SETTINGS_AREA" \
  -H "Content-Type: application/json" \
  -d '{"content": "Your search terms"}'
\`\`\`

<Callout title="Keeping your API key secret" variant="hint">
  Please make sure that you handle the requests in your own backend in order to keep your API key
  secret.
</Callout>


## Using Retrieval-Augmented Generation (RAG)

Use RAG to pull relevant information from your library and feed it into large language models, improving the quality of AI-generated content with contextually accurate data. Discover more details about the demo in our [examples](https://ai-demo.tiptap.dev/preview/Examples/RAG). 

<CodeDemo src="https://ai-demo.tiptap.dev/preview/Examples/RAG?hideSource=1" />

```

# collaboration\documents\snapshot-compare.mdx

```mdx
---
title: Visually compare snapshots of your documents
meta:
  title: Snapshot Compare extension | Tiptap Editor Docs
  description: Compare snapshots of your documents to see changes made between two versions.
  category: Collaboration
extension:
  name: SnapshotCompare
  description: 'Compare snapshots of your documents to see changes made between two versions.'
  type: extension
  icon: FileStack
  isPro: true
  isNew: true
  isCloud: true
---

import { Callout } from '@/components/ui/Callout'
import { CodeDemo } from '@/components/CodeDemo'

Tired of playing "spot the difference" with your document versions?

The Snapshot Compare extension adds extra functionality to the [Document History](/collaboration/documents/history) by allowing you to visually compare changes made between two versions of a document so you can track what’s been added, removed, or modified. These comparisons are called _diffs_.

Whether you're collaborating with a team or editing solo, this helps you track changes over time and understand who made specific edits. By highlighting differences within the editor and attributing them to their authors, Snapshot Compare brings transparency and efficiency to the document lifecycle.

<CodeDemo isPro path="/Extensions/SnapshotCompare" />

## Install

<Callout title="Subscription required" variant="warning">
  This extension requires a valid Entry, Business or Enterprise subscription and a running [Tiptap
  Cloud instance](https://cloud.tiptap.dev/). To install the extension you need [access to our
  private registry](/guides/pro-extensions), set this up first.
</Callout>

Install the extension from our private registry:

\`\`\`bash
npm install @tiptap-pro/extension-snapshot-compare
\`\`\`

## Settings

You can configure the `SnapshotCompare` extension with the following options:

| Setting              | Type                   | Default    | Description                                                       |
| -------------------- | ---------------------- | ---------- | ----------------------------------------------------------------- |
| provider             | `TiptapCollabProvider` | `null`     | The Collaboration provider instance                               |
| mapDiffToDecorations | `function`             | `() => {}` | Control mapping a diff into a decoration to display their content |

\`\`\`js
const provider = new TiptapCollabProvider({
  // ...
})

const editor = new Editor({
  // ...
  extensions: [
    // ...
    SnapshotCompare.configure({
      provider,
    }),
  ],
})
\`\`\`

#### Using `mapDiffToDecorations` for diff decorations

The extension has a default mapping (`defaultMapDiffToDecorations`) to represent diffs as ProseMirror decorations.
For more complex integrations and control, you can customize this mapping with the `mapDiffToDecorations` option.

**Example:** Applying custom predefined background colors to inline inserts

\`\`\`ts
SnapshotCompare.configure({
  mapDiffToDecorations: ({ diff, tr, editor, defaultMapDiffToDecorations }) => {
    if (diff.type === 'inline-insert') {
      // return prosemirror decoration(s) or null
      return Decoration.inline(
        diff.from,
        diff.to,
        {
          class: 'diff',
          style: {
            backgroundColor: diff.attribution.color.backgroundColor,
          },
        },
        // pass the diff as the decoration's spec, this is required for `extractAttributeChanges`
        { diff },
      )
    }

    // fallback to the default mapping
    return defaultMapDiffToDecorations({
      diff,
      tr,
      editor,
      attributes: {
        // add custom attributes to the decorations
        'data-tiptap-user-id': myUserIdMapping[diff.attribution.userId],
      },
    })
  },
})
\`\`\`

## Storage

The `SnapshotCompare` storage object contains the following properties:

| Key             | Type                  | Description                                   |
| --------------- | --------------------- | --------------------------------------------- |
| isPreviewing    | `boolean`             | Indicates whether the diff view is active     |
| diffs           | `Diff[]`              | The diffs that are displayed in the diff view |
| previousContent | `JSONContent \| null` | The content before the diff view was applied  |

Use the `isPreviewing` property to check if the diff view is currently active:

\`\`\`ts
if (editor.storage.snapshotCompare.isPreviewing) {
  // The diff view is currently active
}
\`\`\`

Use the `diffs` property to access the diffs displayed in the diff view:

\`\`\`ts
editor.storage.snapshotCompare.diffs
\`\`\`

The property `previousContent` is used internally by the extension to restore the content when exiting the diff view. Typically, you do not need to interact with it directly.

## Commands

| Command           | Description                                                        |
| ----------------- | ------------------------------------------------------------------ |
| `compareVersions` | Diffs two versions and renders the diff within the editor          |
| `showDiff`        | Given a change tracking transform, show the diff within the editor |
| `hideDiff`        | Hide the diff and restore the previous content                     |

### compareVersions

Use the `compareVersions` command to compute and display the differences between two document versions.

\`\`\`ts
editor.chain().compareVersions({
  fromVersion: 1,
})
\`\`\`

#### Options

You can pass in additional options for more control over the diffing process:

| Key               | Description                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------- |
| `fromVersion`     | The version to compare from. The order between `fromVersion` and `toVersion` is flexible |
| `toVersion`       | The version to compare to (default: latest version)                                      |
| `hydrateUserData` | Add contextual data to each user's changes                                               |
| `onCompare`       | Handle the diffing result manually                                                       |
| `enableDebugging` | Enable verbose logging for troubleshooting                                               |

#### Using `hydrateUserData` to add metadata

Each diff has an `attribution` field, which allows you to add additional metadata with the `hydrateUserData` callback function.

<Callout title="Note" variant="info">
  Do note that the `userId` is populated by the `TiptapCollabProvider` and should be used to
  identify the user who made the change. Without the `user` field provided by the provider, the
  `userId` will be `null`. [See more information in the TiptapCollabProvider
  documentation](/collaboration/provider/integration).
</Callout>

**Example:** Color-coding diffs based on user

\`\`\`ts
const colorMapping = new Map([
  ['user-1', '#ff0000'],
  ['user-2', '#00ff00'],
  ['user-3', '#0000ff'],
])

editor.chain().compareVersions({
  fromVersion: 1,
  toVersion: 3,
  hydrateUserData: ({ userId }) => {
    return {
      color: {
        backgroundColor: colorMapping.get(userId),
      },
    }
  },
})

editor.storage.snapshotCompare.diffs[0].attribution.color.backgroundColor // '#ff0000'
\`\`\`

#### Using `onCompare` to customize the diffing process

If you need more control over the diffing process, use the `onCompare` option to receive the result and handle it yourself.

**Example:** Filtering diffs by user

\`\`\`ts
editor.chain().compareVersions({
  fromVersion: 1,
  toVersion: 3,
  onCompare: (ctx) => {
    if (ctx.error) {
      // handle errors that occurred in the diffing process
      console.error(ctx.error)
      return
    }

    // filter the diffs to display only the changes made by a specific user
    const diffsToDisplay = ctx.diffSet.filter((diff) => diff.attribution.userId === 'user-1')

    editor.commands.showDiff(ctx.tr, { diffs: diffsToDisplay })
  },
})
\`\`\`

### showDiff

Use the `showDiff` command to display the diff within the editor using a change tracking transform (`tr`). This represents all of the changes made to the document since the last snapshot. You can use this transform to show the diff in the editor.

Typically, you use this command after customizing or filtering diffs with `compareVersions`, `onCompare`.

The `showDiff` command temporarily replaces the current editor content with the diff view, showing the differences between versions. It also stashes the content currently displayed in editor so that you can restore it later.

\`\`\`ts
// This will display the changes that change tracking transform recorded in the editor
editor.commands.showDiff(tr)
\`\`\`

### Options

You can pass additional options to control how the diffs are displayed:

| Key   | Description                    |
| ----- | ------------------------------ |
| diffs | An array of diffs to visualize |

**Example:** Displaying specific diffs

\`\`\`ts
// This will display only the diffs made by the user with the ID 'user-1'
const diffsToDisplay = tr.toDiff().filter((diff) => diff.attribution.userId === 'user-1')

editor.commands.showDiff(tr, { diffs: diffsToDisplay })
\`\`\`

### hideDiff

Use the `hideDiff` command to hide the diff and restore the previous content.

\`\`\`ts
// This will hide the diff view and restore the previous content
editor.commands.hideDiff()
\`\`\`

## Working with NodeView (Advanced)

When using [custom node views](/editor/extensions/custom-extensions/node-views), the default diff mapping may not work as expected. You can customize the mapping and render the diffs directly within the custom node view.

Use the `extractAttributeChanges` helper to extract attribute changes in nodes. This allows you to access the previous and current attributes of a node, making it possible to highlight attribute changes within your custom node views.

<Callout title="Note" variant="info">
  When mapping the diffs into decorations yourself, you need to pass the `diff` as the
  decoration&apos;s `spec`. This is required for `extractAttributeChanges` to work correctly.
</Callout>

**Example:** Customizing a heading node view to display changes

\`\`\`ts
import { extractAttributeChanges } from '@tiptap-pro/extension-snapshot-compare'

const Heading = BaseHeading.extend({
  addNodeView() {
    return ReactNodeViewRenderer(({ node, decorations }) => {
      const { before, after, isDiffing } = extractAttributeChanges(decorations)

      return (
        <NodeViewWrapper style={{ position: 'relative' }}>
          {isDiffing && before.level !== after.level && (
            <span
              style={{
                position: 'absolute',
                right: '100%',
                fontSize: '14px',
                color: '#999',
                backgroundColor: '#f0f0f070',
              }}
              // Display the difference in level attribute
            >
              #<s>{before.level}</s>
              {after.level}
            </span>
          )}
          <NodeViewContent as={`h${node.attrs.level ?? 1}`} />
        </NodeViewWrapper>
      )
    })
  },
})
\`\`\`

## Technical details

### Diff

A `Diff` is an object that represents a change made to the document. It contains the following properties:

| Property              | Type                                                                                                                    | Description                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `type`                | `'inline-insert'` \| `'inline-delete'` \| `'block-insert'` \| `'block-delete'` \| `'inline-update'` \| `'block-update'` | The type of change made                                                                               |
| `from`                | `number`                                                                                                                | The start position of the change                                                                      |
| `to`                  | `number`                                                                                                                | The end position of the change                                                                        |
| `content`             | `Fragment`                                                                                                              | The content that was added or removed                                                                 |
| `attribution`         | `Attribution`                                                                                                           | Metadata about the change, such as the user who made the change                                       |
| `attributes?`         | `Record<string, any>`                                                                                                   | The attributes **after** the change; only available for `'inline-update'` and `'block-update'` diffs  |
| `previousAttributes?` | `Record<string, any>`                                                                                                   | The attributes **before** the change; only available for `'inline-update'` and `'block-update'` diffs |

### DiffSet

A `DiffSet` is an array of `Diff` objects, each corresponding to a specific change, like insertion, deletion, or update. You can iterate over the array to inspect individual changes or apply custom logic based on the diff types.

\`\`\`ts
const diffsToDisplay = diffSet.filter((diff) => diff.attribution.userId === 'user-1')

// Show the filtered diffs in the editor
editor.commands.showDiff(tr, { diffs: diffsToDisplay })
\`\`\`

### Attribution

The `Attribution` object contains metadata about a change. It includes the following properties:

| Property | Type                     | Description                                        |
| -------- | ------------------------ | -------------------------------------------------- |
| `type`   | `'added'` \| `'removed'` | Indicates the type of change made                  |
| `userId` | `string` \| `undefined`  | The ID of the user who made the change             |
| `id`     | `Y.ID` \| `undefined`    | The Y.js client ID of the user who made the change |

You can extend the `Attribution` interface to include additional properties:

\`\`\`ts
declare module '@tiptap-pro/extension-snapshot-compare' {
  interface Attribution {
    userName: string
  }
}
\`\`\`

### ChangeTrackingTransform

The `ChangeTrackingTransform` is a class that records changes made to the document (based on ProseMirror's `Transform`).
It represents a transform whose steps describe all of the changes made to go from one version of the document to another. It has the following properties:

| Property | Type                   | Description                                                       |
| -------- | ---------------------- | ----------------------------------------------------------------- |
| `steps`  | `ChangeTrackingStep[]` | An array of steps that represent the changes made to the document |
| `doc`    | `Node`                 | The document **after** the changes have been applied              |
| `before` | `Node`                 | The document **before** the changes have been applied             |

### ChangeTrackingStep

The `ChangeTrackingStep` is a class that represents a single change made to the document, based on ProseMirror's `ReplaceStep` class. It has the following property:

| Property      | Type          | Description                                             |
| ------------- | ------------- | ------------------------------------------------------- |
| `attribution` | `Attribution` | Metadata about the change, such as the user who made it |

### Types

Here is the full TypeScript definition for the `SnapshotCompare` extension:

\`\`\`ts
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    snapshotCompare: {
      /**
       * Given a change tracking transform, show the diff within the editor
       */
      showDiff: (tr: ChangeTrackingTransform, options?: { diffs?: DiffSet }) => ReturnType
      /**
       * Hide the diff and restore the previous content
       */
      hideDiff: () => ReturnType
      /**
       * Diffs two versions and renders the diff into the editor
       */
      compareVersions: <
        T extends Pick<Attribution, 'color'> & Record<string, any> = Pick<Attribution, 'color'> &
          Record<string, any>,
      >(options: {
        /**
         * The version to start the diff from
         */
        fromVersion: number
        /**
         * The version to end the diff at
         * If not provided, the latest snapshot will be used
         */
        toVersion?: number
        /**
         * Allows adding contextual data to each users changes
         */
        hydrateUserData?: (context: {
          /**
           * The type of event
           */
          type: 'added' | 'removed'
          /**
           * The userId that manipulated this content
           */
          userId: string | undefined
          /**
           * The yjs identifier of the content
           */
          id?: y.ID
        }) => T
        /**
         * If provided, allows customizing the behavior of rendering the diffs to the editor.
         * @note The default behavior would be to just display the diff immediately.
         */
        onCompare?: (
          context:
            | {
                error?: undefined
                /**
                 * The editor instance
                 */
                editor: Editor
                /**
                 * All of the changes as a transform with attribution metadata
                 */
                tr: ChangeTrackingTransform<Attribution & T>
                /**
                 * The changes represented as an array of diffs
                 */
                diffSet: DiffSet<Attribution & T>
              }
            | {
                error: Error
              },
        ) => void
        /**
         * Verbosely log the diffing process to help track down where things went wrong
         */
        enableDebugging?: boolean
      }) => ReturnType
    }
  }
}

export type SnapshotCompareOptions = {
  /**
   * The tiptap provider instance. This is required for the extension to compute the diffs, but not to display them.
   * It is also possible to pass a TiptapCollabProvider instance.
   */
  provider: TiptapCollabProvider | null
  /**
   * This allows you to control mapping of a diff into a decoration to display the content of that diff
   */
  mapDiffToDecorations?: (options: {
    /**
     * The diff to map to a decoration
     */
    diff: Diff
    /**
     * The editor instance
     */
    editor: Editor
    /**
     * The change tracking transform
     */
    tr: ChangeTrackingTransform
    /**
     * The default implementation of how to map a diff to a decoration
     */
    defaultMapDiffToDecorations: typeof defaultMapDiffToDecorations
  }) => ReturnType<typeof defaultMapDiffToDecorations>
}

export type SnapshotCompareStorageInactive = {
  /**
   * Whether the diff view is currently active
   */
  isPreviewing: false
  /**
   * The content before the diff view was applied
   */
  previousContent: null
  /**
   * The change tracking transform that was applied
   * It is currently empty because the diff view is not active
   */
  diffs: DiffSet
  /**
   * The change tracking transform that was applied
   */
  tr: null
}

export type SnapshotCompareStorageActive = {
  /**
   * Whether the diff view is currently active
   */
  isPreviewing: true
  /**
   * The content before the diff view was applied
   */
  previousContent: JSONContent
  /**
   * The change tracking transform that was applied
   */
  diffs: DiffSet
  /**
   * The change tracking transform that was applied
   */
  tr: ChangeTrackingTransform
}

export type SnapshotCompareStorage = SnapshotCompareStorageInactive | SnapshotCompareStorageActive
\`\`\`

```

# collaboration\getting-started\authenticate.mdx

```mdx
---
title: Authenticate and authorize in Collaboration
meta:
  title: Auth Guide | Tiptap Collaboration Docs
  description: Secure and manage access in your collaborative editor with JWTs, covering setup, testing, and production integration.
  category: Collaboration
---

import { Callout } from '@/components/ui/Callout'

After setting up a collaborative editor in the installation guide, it's crucial to address authentication for longer-term use. The temporary JWT provided in your [Tiptap account](https://cloud.tiptap.dev/apps/settings) is only suitable for brief testing sessions.

<Callout title="Need help with JWT?" variant="hint">
  If you need assistance with setting up server-side JWT authentication, you can find guidance at
  the [bottom of the page](#integrate-jwt-server-side).
</Callout>

## Set up authorization

Setting up the right access controls is important for keeping your documents secure and workflows smooth in Tiptap Collaboration.

This part of the guide walks you through how to use JSON Web Tokens (JWTs) to fine-tune who gets to see and edit what. Whether you need to give someone full access, restrict them to certain documents, or block access entirely, we've got you covered with minimalistic examples.

<Callout title="Caution" variant="warning">
  If you exclude the `allowedDocumentNames` property from your JWT setup, users can access all
  documents in your system!
</Callout>

### Allow full access to every document

Omitting the `allowedDocumentNames` property from the JWT payload grants the user access to all documents. This is useful for users who need unrestricted access.

\`\`\`typescript
import jsonwebtoken from 'jsonwebtoken'

const data = { sub: 'your_local_user_identifier' }

const jwt = jsonwebtoken.sign(data, 'your_secret')
\`\`\`

### Limit access to specific documents

To restrict a user's access to specific documents, include those document names in the `allowedDocumentNames` array within the JWT payload. This ensures the user can only access the listed documents.

\`\`\`typescript
import jsonwebtoken from 'jsonwebtoken'

const data = {
  sub: 'your_local_user_identifier',
  allowedDocumentNames: ['user-specific-document-1', 'user-specific-document-2'],
}

const jwt = jsonwebtoken.sign(data, 'your_secret')
\`\`\`

### Block access to all documents

To prohibit a user from accessing any documents, provide an empty array for `allowedDocumentNames` in the JWT payload. This effectively blocks access to all documents.

\`\`\`typescript
import jsonwebtoken from 'jsonwebtoken'

const data = {
  sub: 'your_local_user_identifier',
  allowedDocumentNames: [],
}

const jwt = jsonwebtoken.sign(data, 'your_secret')
\`\`\`

## Set Read-Only access

The `readonlyDocumentNames` property in your JWT setup plays a crucial role when you need to allow users to view documents without the ability to edit them. This feature is particularly useful in scenarios where you want to share information with team members for review or reference purposes but need to maintain the integrity of the original document.

By specifying document names in the `readonlyDocumentNames` array, you grant users read-only access to those documents. Users can open and read the documents, but any attempts to modify the content will be restricted. This ensures that sensitive or critical information remains unchanged while still being accessible for necessary personnel.

In this example, we grant read-only access to two documents, `annual-report-2024` and `policy-document-v3`. Users with this JWT can view these documents but cannot make any edits.

\`\`\`typescript
import jsonwebtoken from 'jsonwebtoken'

const data = {
  sub: 'your_local_user_identifier',
  readonlyDocumentNames: ['annual-report-2024', 'policy-document-v3'],
}

const jwt = jsonwebtoken.sign(data, 'your_secret')
\`\`\`

Incorporating the `readonlyDocumentNames` property into your JWT strategy improves document security by ensuring that only authorized edits are made, preserving the integrity of your critical documents.

## Authorize with Wildcards

Wildcards in JWTs offer a dynamic way to manage document access, allowing for broader permissions within specific criteria without listing each document individually. This method is particularly useful in scenarios where documents are grouped by certain attributes, such as projects or teams.

### Manage project-specific documents

For teams working on multiple projects, it's essential to ensure that members have access only to the documents relevant to their current projects. By using project identifiers with wildcards, you can streamline access management.

\`\`\`typescript
import jsonwebtoken from 'jsonwebtoken'

const data = {
  sub: 'your_local_user_identifier',
  allowedDocumentNames: ['project-alpha/*', 'project-beta/*'],
}

const jwt = jsonwebtoken.sign(data, 'your_secret')
\`\`\`

In this example, users will have access to all documents under 'project-alpha' and 'project-beta', making it easier to manage permissions as new documents are added to these projects.

## Integrate JWT server side

JWT, or JSON Web Token, is a compact, URL-safe means of representing claims to be transferred between two parties. The information in a JWT is digitally signed using a cryptographic algorithm to ensure that the claims cannot be altered after the token is issued. This digital signature makes the JWT a reliable vehicle for secure information exchange in web applications, providing a method to authenticate and exchange information.

### Create a static JWT for testing

For testing purposes, you might not want to set up a complete backend system to generate JWTs. In such cases, using online tools like http://jwtbuilder.jamiekurtz.com/ can be a quick workaround. These tools allow you to create a JWT by inputting the necessary payload and signing it with a secret key.

When using these tools, ensure that the "Key" field is replaced with the secret key from your [Collaboration settings](https://collab.tiptap.dev/apps/settings) page. You don’t need to change any other information.

Remember, this approach is only recommended for testing due to security risks associated with exposing your secret key.

### Generate JWTs server side

For production-level applications, generating JWTs on the server side is a necessity to maintain security. Exposing your secret key in client-side code would compromise the security of your application. Here’s an example using NodeJS for creating JWTs server-side:

\`\`\`bash
npm install jsonwebtoken
\`\`\`

\`\`\`typescript
import jsonwebtoken from 'jsonwebtoken'

const payload = {
  // The payload contains claims like the user ID, which can be used to identify the user and their permissions.
  sub: 'your_local_user_identifier',
}

// The 'sign' method creates the JWT, with the payload and your secret key as inputs.
const jwt = jsonwebtoken.sign(payload, 'your_secret_key_here')
// The resulting JWT is used for authentication in API requests, ensuring secure access.
// Important: Never expose your secret key in client-side code!
\`\`\`

This JWT should be incorporated into API requests within the `token` field of your authentication provider, safeguarding user sessions and data access.

To fully integrate JWT into your application, consider setting up a dedicated server or API endpoint, such as `GET /getCollabToken`. This endpoint would dynamically generate JWTs based on a secret stored securely on the server and user-specific information, like document access permissions.

This setup not only increases security but also provides a scalable solution for managing user sessions and permissions in your collaborative application.

Ensure the secret key is stored as an environment variable on the server, or define it directly in the server code. Avoid sending it from the client side.

A full server / API example is available [here](https://github.com/ueberdosis/tiptap-collab-replit/tree/main/src).

```

# collaboration\getting-started\install.mdx

```mdx
---
title: Install Collaboration
meta:
  title: Install Collaboration | Tiptap Collaboration Docs
  description: Set up collaborative editing in your Tiptap Editor by following this installation guide. Learn more in our docs!
  category: Collaboration
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

This guide will get you started with collaborative editing in the Tiptap Editor. If you're already using Tiptap Editor, feel free to skip ahead to the "Adding Collaboration" section.

### Install Tiptap Editor

If Tiptap Editor isn't installed yet, run the following command in your CLI for React to install the basic editor and necessary extensions for this example:

\`\`\`bash
npm install @tiptap/extension-document @tiptap/extension-paragraph @tiptap/extension-text @tiptap/react
\`\`\`

Once installed, you can get your Tiptap Editor up and running with this basic setup. Just add the following code snippets to your project:

<CodeDemo path="/Examples/Minimal" />

## Add Collaboration

To introduce team collaboration features into your Tiptap Editor, integrate the Yjs library and Editor Collaboration extension into your frontend. This setup uses Y.Doc, a shared document model, rather than just handling plain text.
Afterwards we will connect Y.Doc to the TiptapCollabProvider to synchronize user interactions.

### Integrate Yjs and the Collaboration Extension

Add the Editor Collaboration extension and Yjs library to your frontend:

\`\`\`bash
npm install @tiptap/extension-collaboration yjs y-prosemirror y-protocols
\`\`\`

Then, update your index.jsx to include these new imports:

\`\`\`tsx
import './styles.scss'

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

import Collaboration from '@tiptap/extension-collaboration'
import * as Y from 'yjs'

const doc = new Y.Doc() // Initialize Y.Doc for shared editing

export default () => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Collaboration.configure({
        document: doc, // Configure Y.Doc for collaboration
      }),
    ],
    content: `
      <p>
        This is a radically reduced version of Tiptap. It has support for a document, with paragraphs and text. That’s it. It’s probably too much for real minimalists though.
      </p>
      <p>
        The paragraph extension is not really required, but you need at least one node. Sure, that node can be something different.
      </p>
    `,
  })

  return <EditorContent editor={editor} />
}
\`\`\`

Your editor is now almost prepared for collaborative editing!

### Connect to the Collaboration Server

For collaborative functionality, install the `@hocuspocus/provider` package:

\`\`\`bash
npm install @hocuspocus/provider
\`\`\`

Next, configure the Hocuspocus provider in your index.jsx file with your server details:

- **name**: Serves as the document identifier for synchronization.
- **appID**: Found in your [Cloud account](https://cloud.tiptap.dev/apps) after you started your app. For on-premises setups replace `appID` with `baseUrl`.
- **token**: Use the JWT from your [Cloud interface](https://cloud.tiptap.dev/apps/settings) for testing, but generate your own JWT for production.

<Callout title="Adding initial content" variant="hint">
  When integrating the Editor in a non-collaborative setting, using the method shown here to set
  content is perfectly acceptable. However, if you transition to a collaborative environment, you
  will need to modify how you add initial content as shown after the next headline.
</Callout>

Incorporate the following code to complete the setup:

\`\`\`tsx
import './styles.scss'

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

import Collaboration from '@tiptap/extension-collaboration'
import * as Y from 'yjs'

// Importing the provider and useEffect
import { useEffect } from 'react'
import { TiptapCollabProvider } from '@hocuspocus/provider'

const doc = new Y.Doc()

export default () => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Collaboration.configure({
        document: doc,
      }),
    ],
    content: `
      <p>
        This is a radically reduced version of Tiptap. It has support for a document, with paragraphs and text. That’s it. It’s probably too much for real minimalists though.
      </p>
      <p>
        The paragraph extension is not really required, but you need at least one node. Sure, that node can be something different.
      </p>
    `,
  })

  // Connect to your Collaboration server
  useEffect(() => {
    const provider = new TiptapCollabProvider({
      name: 'document.name', // Unique document identifier for syncing. This is your document name.
      appId: '7j9y6m10', // Your Cloud Dashboard AppID or `baseURL` for on-premises
      token: 'notoken', // Your JWT token
      document: doc,
    })
  }, [])

  return <EditorContent editor={editor} />
}
\`\`\`

After following these steps, you should be able to open two different browsers and connect to the same document simultaneously through separate WebSocket connections.

For a clear test of the collaboration features, using two different browsers is recommended to guarantee unique websocket connections.

### Initialize Content Properly

Upon implementing collaboration in your Tiptap Editor, you might notice that the initial content is repeatedly added each time the editor loads. To prevent this, use the `.setContent()` method to set the initial content only once.

\`\`\`tsx
import './styles.scss'

import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'
import React from 'react'

import * as Y from 'yjs'
import Collaboration from '@tiptap/extension-collaboration'
import { useEffect } from 'react'

import { TiptapCollabProvider } from '@hocuspocus/provider'

const doc = new Y.Doc()

export default () => {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Collaboration.configure({
        document: doc,
      }),
    ],
    // Remove the automatic content addition on editor initialization.
  })

  useEffect(() => {
    const provider = new TiptapCollabProvider({
      name: 'document.name', // Unique document identifier for syncing. This is your document name.
      appId: '7j9y6m10', // Your Cloud Dashboard AppID or `baseURL` for on-premises
      token: 'notoken', // Your JWT token
      document: doc,

      // The onSynced callback ensures initial content is set only once using editor.setContent(), preventing repetitive content loading on editor syncs.
      onSynced() {
        if (!doc.getMap('config').get('initialContentLoaded') && editor) {
          doc.getMap('config').set('initialContentLoaded', true)

          editor.commands.setContent(`
          <p>This is a radically reduced version of Tiptap. It has support for a document, with paragraphs and text. That’s it. It’s probably too much for real minimalists though.</p>
          <p>The paragraph extension is not really required, but you need at least one node. Sure, that node can be something different.</p>
          `)
        }
      },
    })
  }, [])

  return <EditorContent editor={editor} />
}
\`\`\`

This ensures the initial content is set only once. To test with new initial content, create a new document by changing the `name` parameter (e.g., from `document.name` to `document.name2`).

## Disable Default Undo/Redo

If you're integrating collaboration into an editor **other than the one provided in this demo**, you may need to disable the default history function of your Editor. This is necessary to avoid conflicts with the collaborative history management: You wouldn't want to revert someone else's changes.

This action is only required if your project includes the Tiptap [StarterKit](/editor/extensions/functionality/starterkit) or [Undo/Redo](/editor/extensions/functionality/undo-redo) extension.

\`\`\`ts
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      history: false, // Disables default history to use Collaboration's history management
    }),
  ],
})
\`\`\`

Following this guide will set up a basic, yet functional collaborative Tiptap Editor, synchronized through either the Collaboration Cloud or an on-premises backend.

## Authenticate your users

Learn how to secure your collaborative Tiptap editor with JSON Web Tokens (JWTs). The next guide provides step-by-step instructions on creating and managing JWTs for both testing and production, ensuring controlled access with detailed examples. Read more about [authentication](/collaboration/getting-started/authenticate).

```

# collaboration\getting-started\overview.mdx

```mdx
---
title: Make your editor collaborative
meta:
  title: Collaboration | Tiptap Collaboration Docs
  description: Make your editor collaborative with Tiptap Collaboration on your premises or in our cloud. Learn more in our docs!
  category: Collaboration
---

import { ArrowRightIcon } from 'lucide-react'
import Link from '@/components/Link'
import * as CtaBox from '@/components/CtaBox'
import { Button } from '@/components/ui/Button'

Tiptap Collaboration turns standard text editors into collaborative platforms, enabling simultaneous editing similar to Google Docs or Notion. Built on our open source Hocuspocus WebSocket backend, it facilitates real-time and asynchronous updates through WebSocket technology, with Y.js ensuring consistent synchronization of changes.

Built for performance and scalability, Tiptap Collaboration is tested by hundreds of thousands of users every day. Enhancing the robust Hocuspocus foundation, Tiptap Collaboration introduces more performance, scalability, and security.

It integrates functionalities such as commenting, document version history, and secure authentication, suitable for both cloud services and on your premises installations.

<CtaBox.Wrapper variant="light">
  <CtaBox.Title>Collaboration features</CtaBox.Title>
  <CtaBox.Description>
    Fasten your seatbelts! Make your rich text editor collaborative with Tiptap Collaboration.
  </CtaBox.Description>
  <CtaBox.List>
    <CtaBox.ListItem>Real-time and offline change merging without conflicts</CtaBox.ListItem>
    <CtaBox.ListItem>Compatible with various editors</CtaBox.ListItem>
    <CtaBox.ListItem>Handle multiple documents over one WebSocket connection</CtaBox.ListItem>
    <CtaBox.ListItem>Integrates with webhooks for change notifications</CtaBox.ListItem>
    <CtaBox.ListItem>Scales efficiently with Redis for high user volumes</CtaBox.ListItem>
    <CtaBox.ListItem>Built with TypeScript for type safety and scalability.</CtaBox.ListItem>
  </CtaBox.List>
  <CtaBox.Actions className="-mx-3">
    <Button variant="tertiary" asChild>
      <Link href="https://cloud.tiptap.dev/">
        Create free account
        <ArrowRightIcon className="w-4 h-4" />
      </Link>
    </Button>
  </CtaBox.Actions>
</CtaBox.Wrapper>

## Store your documents

If you're using our on-premises solutions, you can choose where to store your documents in your own infrastructure. However, for users of our Collaboration Cloud service, we've partnered with Hetzner, renowned for their dependable cloud infrastructure, to guarantee stable and efficient performance, especially during periods of heavy traffic and collaborative activities.

Your document storage location depends on your subscription plan:

- **Entry Plan:** Your documents are stored in GDPR-compliant data centers in Europe, ensuring your data's privacy and security.
- **Business Plan:** You have the option to store your documents in data centers on the US East or West Coast, or in Europe, according to your preference.
- **Enterprise Plan:** Choose dedicated cloud storage in your preferred location, or opt for on-premises storage to manage your documents yourself.

Regardless of your plan, you have the flexibility to create your own backups of all documents and associated information using our document management API.

<CtaBox.Wrapper className="mt-12">
  <CtaBox.Title>Enterprise on-premises solution</CtaBox.Title>
  <CtaBox.Description>
    Integrate Collaboration and all other Tiptap features into your infrastructure.
  </CtaBox.Description>
  <CtaBox.List>
    <CtaBox.ListItem title="On-premises: ">
      Deploy our docker images in your own stack
    </CtaBox.ListItem>
    <CtaBox.ListItem title="High availability cluster: ">
      Scale confidently to millions of users
    </CtaBox.ListItem>
    <CtaBox.ListItem title="Dedicated support: ">
      Custom development and integration support in Chat
    </CtaBox.ListItem>
  </CtaBox.List>
  <CtaBox.Actions className="-mx-3">
    <Button className="text-white/80 hover:text-white/100" variant="tertiary" asChild>
      <Link href="https://45pg7sjo8uw.typeform.com/to/DRCOgZGi">
        Let's talk
        <ArrowRightIcon className="w-4 h-4" />
      </Link>
    </Button>
  </CtaBox.Actions>
</CtaBox.Wrapper>

## About Y.js

Y.js is a library that enables real-time, conflict-free merging of changes made by multiple users. It stands out for its high performance among Conflict-Free Replicated Data Types (CRDTs), offering significant efficiency advantages over similar technologies.

As a CRDT, Y.js ensures that the sequence of changes does not impact the final state of the document, similar to how Git operates with commits. This guarantees that all copies of the data remain consistent across different environments.

The technology supports the development of highly responsive real-time applications, enabling collaborative features in existing software, managing synchronization states, and catering to offline-first scenarios with easy data integration upon reconnection.

### Y.js Document Compatibility

Y.js uses a special Y.doc binary format to work efficiently, but you don't need to worry about changing how you create documents in Tiptap Editor. You can keep using common formats like JSON or HTML, and the Collaboration server will take care of converting them for use with Y.js.

Thanks to Y.js's binary format, it handles data quickly and keeps everything in sync. If you need the binary format, you can get the Y.doc through the document management API. However, you have the option to retrieve your documents in the more familiar JSON or HTML formats. While direct markup output isn't provided, you can achieve it by converting from HTML, offering versatility in how you handle document formats.

## Migrate from Hocuspocus or Collaboration Cloud

Migrating your application from Hocuspocus to either an on-premises solution or the Tiptap Collaboration Cloud involves a simple switch from the `HocuspocusProvider` to the `TiptapCollabProvider`, or the other way around.

This doesn't require any other updates to your setup, and the way you interact with the API won't change as well. The `TiptapCollabProvider` acts as a go-between, managing how your application connects to the server and handles login details.

This migration approach is also applicable when migrating from the Tiptap Collaboration Cloud to an on-premises configuration.

## Schema management

Tiptap enforces strict schema adherence, discarding any elements not defined in the active schema. This can cause issues when clients using different schema versions concurrently edit a document.

For instance, imagine adding a task list feature in an update. Users on the previous schema won't see these task lists, and any added by a user on the new schema will disappear from their view due to schema discrepancies. This occurs because Tiptap synchronizes changes across clients, removing unrecognized elements based on the older schema.

To mitigate these issues, consider implementing [Invalid Schema Handling](/editor/core-concepts/schema#invalid-schema-handling) as outlined in the Tiptap Editor docs.
```

# collaboration\operations\configure.mdx

```mdx
---
title: Runtime configuration
meta:
  title: Configure runtime | Tiptap Collaboration Docs
  description: Dynamically adjust collaboration settings in your app with straightforward API calls. Adjust secrets, webhook URLs, and more.
  category: Collaboration
---

import { Callout } from '@/components/ui/Callout'

Configure runtime settings in Tiptap Collaboration to manage your collaboration environment directly via the REST API.

These settings let you modify secrets, webhook URLs, and more, particularly when adapting to changes in your project requirements or security protocols, without restarting your application.

## Settings overview

Several settings can be adjusted dynamically:

| Key                            | Description                                                                                                                                                                 |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `secret`                       | [JWT token secret](/collaboration/getting-started/authenticate), auto-generated on the first launch                                                                                                           |
| `api_secret`                   | API secret to use in the Authorization header, auto-generated on the first launch                                                                               |
| `allowed_origins`              | Validates `Origin` headers against the provided values (comma separated), e.g., `https://test.tiptap.dev,https://prod.tiptap.dev`; If not set, validation is disabled           |
| `authentication_disabled`      | Set to `1` to disable authentication, `0` to enable (default: `0`)                                                                                                          |
| `webhook_url`                  | URL for receiving webhook callbacks                                                                                                                                |
| `webhook_loader_url`           | Optional webhook URL for initially loading documents. See [webhooks](/collaboration/core-concepts/webhooks#loader-webhook) for more information. | 
| `webhook_version`              | Version of the webhook                                                                                                                                 |
| `webhook_awareness`            | Enable awareness webhooks for user activity, tracking `user.connected` and `user.disconnected` events (`1` for enabled, `0` for disabled)                                    |
| `webhook_log_errors_only`      | Log only webhook errors; successful webhook logs are disabled                                                                                            |
| `default_auto_versioning`      | Set to `1` to enable auto versioning, `0` to disable (default: `0`)                                                                                                    |
| `default_auto_versioning_interval` | Interval for auto versioning in seconds (default: `30` seconds)                                                                                               |
| `name`                         | Instance name for identification                                                                                                                       |

## Managing settings via API

The collaboration platform offers a straightforward API for managing these settings. Replace `:key` with the setting key you wish to update.

### Create or overwrite settings

Use this call to add or update settings:

\`\`\`bash
curl --location --request PUT 'https://YOUR_APP_ID.collab.tiptap.cloud/api/admin/settings/:key' \
--header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA' --header 'Content-Type: text/plain' \
-d 'your value'
\`\`\`

### List current settings

Use this call to retrieve a list of all current settings:

\`\`\`bash
curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/admin/settings' \
--header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA'
\`\`\`

### Retrieve a specific setting

Use this call to retrieve the value of a particular setting:

\`\`\`bash
curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/admin/settings/:key' \
--header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA'
\`\`\`

### Delete a setting

Use this call to delete a setting:

\`\`\`bash
curl --location --request DELETE 'https://YOUR_APP_ID.collab.tiptap.cloud/api/admin/settings/:key' \
--header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA'
\`\`\`

## Server performance metrics

Use the `/api/statistics` endpoint to gather server performance data, including total document count, peak concurrent connections, total connections over the last 30 days, and lifetime connection counts.
Review the [metrics](/collaboration/operations/metrics) page for additional information.

\`\`\`bash
curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/statistics' \
--header 'Authorization: YOUR_SECRET_FROM_SETTINGS_AREA'
\`\`\`
```

# collaboration\operations\metrics.mdx

```mdx
---
title: Server metrics and statistics
meta:
  title: Metrics | Tiptap Collaboration Docs
  description: Access server and document statistics of your Tiptap Collaboration application. Learn more in our docs!
  category: API
---

import { Callout } from '@/components/ui/Callout'

The Tiptap Collaboration API offers several endpoints to access real-time statistics and health information for both the server and individual documents. A simplified version of the metrics is also available in the cloud dashboard.

These endpoints help to troubleshoot issues, monitor server performance, or build analytics dashboards for insights into user interactions and system status. Integrating statistics into your monitoring systems allows you to proactively manage your collaboration environment's health.

<Callout title="Review the postman collection" variant="hint">
  Experiment with the REST API by visiting our [Postman
  Collection](https://www.postman.com/docking-module-explorer-14290287/workspace/tiptap-collaboration-public/collection/33042171-cc186a66-df41-4df8-9c6e-e91b20deffe5?action=share&creator=32651125).
</Callout>

## Access the API

The REST API is exposed directly from your Collaboration app at your custom URL:

\`\`\`bash
https://YOUR_APP_ID.collab.tiptap.cloud/
\`\`\`

### Authentication
Authenticate your API requests by including your API secret in the `Authorization` header. You can find your API secret in
the [settings](https://cloud.tiptap.dev/apps/settings) of your Tiptap Cloud dashboard.

### Document identifiers
If your document identifier contains a slash (`/`), encode it as `%2F`, e.g., using `encodeURIComponent`.

## Server statistics endpoint

This endpoint provides basic statistics about the Tiptap Collaboration server, offering insights into overall activity and usage metrics.

\`\`\`bash
GET /api/statistics
\`\`\`

<Callout title="Caution" variant="hint">
  The total number of connections in the last 30 days and the lifetime connection count are
  presented as strings due to their internal representation as BigInt values.
</Callout>

**Example:** Server statistics
\`\`\`json
{
  "totalDocuments": 4,
  "totalConnections30d": "3",
  "maxConcurrentConnections30d": 3,
  "lifetimeConnections": "144",
  "currentConnectionsCount": 3,
  "currentLoadedDocumentsCount": 1,
  "openDocuments": ["testdocument"],
  "connectionsPerDocument": {
    "testdocument": 3
  },
  "version": "3.33.0"
}
\`\`\`

## Document statistics endpoint

Retrieve statistics for a specific document by its identifier. Use this endpoint to monitor real-time user engagement with a document.

\`\`\`bash
GET /api/documents/:identifier/statistics
\`\`\`

**Example:** Statistics of a document named :identifier

\`\`\`json
{
  "currentConnections": 2,
  "connectedIps": ["127.0.0.1", "10.100.1.23"]
}
\`\`\`

## Server health endpoint

Use this call to check liveness, readiness, and cconnectivity to essential components like the database and Redis.

\`\`\`bash
GET /health
\`\`\`

**Example:** Issue with Redis

\`\`\`bash
HTTP 500:

DB:ok
REDIS:fail
\`\`\`

**Example:** No Redis detected
\`\`\`bash
HTTP 200:

DB:ok
REDIS:inactive
\`\`\`
```

# collaboration\provider\events.mdx

```mdx
---
title: State and change events
meta:
  title: Provider events | Tiptap Collaboration Docs
  description: Use event listeners with Tiptap Collaboration providers to manage real-time states and changes effectively. Learn more in the docs!
  category: Collaboration
---

Events in Collaboration providers let you respond to various states and changes, such as successful connections or authentication updates. You can attach event listeners during provider initialization or add them later based on your application's needs.

## Use provider events

| Event                | Description                                                   |
| -------------------- | ------------------------------------------------------------- |
| `open`               | Triggered when the WebSocket connection opens.                |
| `connect`            | Triggered when the provider connects to the server.           |
| `authenticated`      | Indicates successful client authentication.                   |
| `authenticationFailed` | Triggered when client authentication fails.                |
| `status`             | Tracks changes in connection status.                          |
| `close`              | Triggered when the WebSocket connection closes.               |
| `disconnect`         | Triggered when the provider disconnects.                      |
| `destroy`            | Signifies the impending destruction of the provider.          |
| `message`            | Triggered by incoming messages.                               |
| `outgoingMessage`    | Triggered before a message is sent.                           |
| `synced`             | Indicates the initial successful sync of the Yjs document.    |
| `stateless`          | Triggered when the stateless message is received.             |
| `awarenessUpdate`    | Triggered when user awareness information updates.            |
| `awarenessChange`    | Triggered when the awareness state changes.                   |

## Configure event listeners

To track events immediately, pass event listeners directly to the provider's constructor. This guarantees that listeners are active from the start.

\`\`\`ts
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
\`\`\`

### Bind events dynamically

To add or remove listeners after initialization, the provider supports dynamic binding and unbinding of event handlers.

**Example:** Binding event listeners during provider initialization

\`\`\`ts
const provider = new TiptapCollabProvider({
  // …
})

provider.on('synced', () => {
  console.log('Document synced.')
})
\`\`\`

**Example:** Binding/unbinding event listeners after provider initialization

\`\`\`typescript
const onMessage = () => {
  console.log('New message received.')
}

// Binding
provider.on('message', onMessage)

// Unbinding
provider.off('message', onMessage)
\`\`\`

## Provider event examples

### Display connection status

Use `onConnect` and `onDisconnect` to provide users with real-time connection status feedback, enhancing the user experience.

\`\`\`tsx
provider.on('connect', () => {
  showStatus('Connected')
})

provider.on('disconnect', () => {
  showStatus('Disconnected')
})
\`\`\`

### Sync document status

Use `synced` to alert users when the document is fully synced initially, ensuring they start working with the latest version.

\`\`\`tsx
provider.on('synced', () => {
  alert('Document initialized')
})
\`\`\`

### Handle authentication issues

Use `authenticationFailed` to catch authentication errors and prompt users to reauthenticate, ensuring secure access.

\`\`\`tsx
provider.on('authenticationFailed', ({ reason }) => {
  console.error('Authentication failed:', reason)
  requestUserReauthentication()
})
\`\`\`

```

# collaboration\provider\integration.mdx

```mdx
---
title: Integrate the Collaboration provider
meta:
  title: Provider | Tiptap Collaboration Docs
  description: Set up and configure the Collaboration provider to manage real-time document synchronization across users.
  category: Collaboration
---

import { Callout } from '@/components/ui/Callout'

Together with the Collaboration backend, providers serve as the backbone for real-time collaborative editing. They establish and manage the communication channels between users, ensuring that updates and changes to documents are synchronized across all participants.

Providers handle the complexities of real-time data exchange, including conflict resolution, network reliability, and user presence awareness.

The `TiptapCollabProvider` adds advanced features tailored for collaborative environments, such as WebSocket message authentication, debug modes, and flexible connection strategies.

## Set up the provider

First, install the provider package in your project using:

\`\`\`bash
npm install @hocuspocus/provider
\`\`\`

For a basic setup, connect to the Collaboration backend by specifying the document's name, your app's ID (for cloud setups), or the base URL (for on-premises), along with your JWT.

Depending on your framework, register a callback to the Collaboration backend, such as `useEffect()` in React or `onMounted()` in Vue.js.

\`\`\`ts
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
\`\`\`

<Callout title="Note for On-Premises Customers" variant="hint">
  If you are hosting your collaboration environment on-premises, replace the `appId` parameter with
  `baseUrl` in your provider configuration to connect to your server.
</Callout>

## Configure the collaboration provider

The Tiptap Collaboration provider offers several settings for custom configurations. Review the tables below for all parameters, practical use cases, and key concepts like "[awareness](/collaboration/core-concepts/awareness)".

| Setting              | Default Value | Description                                                                                     |
| -------------------- | ------------- | ----------------------------------------------------------------------------------------------- |
| `appId`              | `''` (empty)  | App ID for Collaboration Cloud setups                                                           |
| `baseUrl`            | `''` (empty)  | URL for connecting to on-premises servers. Used as an alternative to `appId` for on-prem setups |
| `name`               | `''` (empty)  | The document's name                                                                             |
| `token`              | `''` (empty)  | Authentication token for secure connections. Supports strings, functions, and Promises          |
| `document`           | `new Y.Doc()` | The Yjs document instance. Defaults to a new document if none is provided                       |
| `user`               | `null`        | User ID or name for attributing changes to the document.                                        |
| `connect`            | `true`        | Connects to the server after initialization                                                     |
| `preserveConnection` | `true`        | Keeps the WebSocket connection open after closing the provider                                  |
| `broadcast`          | `true`        | Enables document syncing across browser tabs                                                    |
| `forceSyncInterval`  | `false`       | Forces server sync at regular intervals, in milliseconds                                        |
| `quiet`              | `false`       | Suppresses warning outputs                                                                      |
| `WebSocketPolyfill`  | `WebSocket`   | WebSocket implementation for Node.js environments. Use `ws` or another implementation           |

### Optimize reconnection timings

The provider’s reconnection settings are preset for optimal performance in production settings. If you need to adjust these settings for specific scenarios, you can do so with our delay configurations.

Adjust initial delays, apply exponential backoff, or set maximum wait times to fine-tune your application's reconnection behavior, balancing responsiveness with server efficiency.

| Setting                   | Default Value | Description                                                                                                                                            |
| ------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `delay`                   | `1000`        | Base delay between reconnection attempts, in milliseconds                                                                                              |
| `factor`                  | `2`           | Multiplier applied to the delay, increasing it exponentially after each attempt                                                                        |
| `initialDelay`            | `0`           | Time in milliseconds before the first reconnection attempt                                                                                             |
| `maxAttempts`             | `0`           | Maximum number of reconnection attempts. `0` means unlimited attempts                                                                                  |
| `jitter`                  | `true`        | Adds variability to the delay by randomly selecting a value between `minDelay` and the calculated delay for each attempt                               |
| `minDelay`                | `1000`        | Minimum delay when jitter is enabled. Has no effect if jitter is disabled                                                                              |
| `maxDelay`                | `30000`       | Maximum delay allowed between reconnection attempts. Set to `0` to allow the delay to increase indefinitely using exponential backoff (`factor`).      |
| `timeout`                 | `0`           | Time limit, in milliseconds, for each reconnection attempt before stopping                                                                             |
| `messageReconnectTimeout` | `30000`       | Time in milliseconds to wait for a server message before terminating the connection. If no message is received, the connection is closed automatically |

## Rate limits

To maintain system integrity and protect from misconfigured clients, our infrastructure—including the management API and websocket connections through the `TiptapCollabProvider`—is subject to rate limits.

### Default rate limits (per source IP):

- **Requests:** 100
- **Time window:** 5 seconds
- **Burst capacity:** Up to 200 requests

If you encounter these limits under normal operation, please [email us](mailto:humans@tiptap.dev).

```

# collaboration\sidebar.ts

```ts
import { SidebarConfig } from '@/types'

export const sidebarConfig: SidebarConfig = {
  id: 'collaboration',
  rootHref: '/collaboration/getting-started/overview',
  title: 'Collaboration',
  items: [
    {
      type: 'group',
      href: '/collaboration/getting-started',
      title: 'Getting started',
      children: [
        {
          title: 'Overview',
          href: '/collaboration/getting-started/overview',
        },
        {
          title: 'Install',
          href: '/collaboration/getting-started/install',
        },
        {
          title: 'Authenticate',
          href: '/collaboration/getting-started/authenticate',
        },
      ],
    },
    {
      type: 'group',
      href: '/collaboration/provider',
      title: 'Provider',
      children: [
        {
          title: 'Integration',
          href: '/collaboration/provider/integration',
        },
        {
          title: 'Events',
          href: '/collaboration/provider/events',
        },
      ],
    },
    {
      type: 'group',
      href: '/collaboration/core-concepts',
      title: 'Features',
      children: [
        {
          title: 'Awareness',
          href: '/collaboration/core-concepts/awareness',
        },
        {
          title: 'Webhooks',
          href: '/collaboration/core-concepts/webhooks',
        },
      ],
    },
    {
      type: 'group',
      href: '/collaboration/documents',
      title: 'Documents',
      children: [
        {
          title: 'Overview',
          href: '/collaboration/documents',
        },
        {
          title: 'REST API',
          href: '/collaboration/documents/rest-api',
        },
        {
          title: 'History',
          href: '/collaboration/documents/history',
        },
        {
          title: 'Compare Snapshots',
          href: '/collaboration/documents/snapshot-compare',
        },
        {
          title: 'Inject content',
          href: '/collaboration/documents/content-injection',
        },
        {
          title: 'Semantic Search',
          href: '/collaboration/documents/semantic-search',
          tags: ['Beta'],
        },
      ],
    },
    {
      type: 'group',
      href: '/collaboration/operations',
      title: 'Ops',
      children: [
        {
          title: 'Configure runtime',
          href: '/collaboration/operations/configure',
        },
        {
          title: 'Metrics',
          href: '/collaboration/operations/metrics',
        },
      ],
    },
  ],
}

```

# comments\core-concepts\configure.mdx

```mdx
---
title: Configure comments
meta:
  title: Configure | Tiptap Comments Docs
  description: Configure TiptapCollabProvider and customize thread classes in your Tiptap editor. More in the docs!
  category: Comments
---

import { Callout } from '@/components/ui/Callout'

Comments are embedded within documents in the Collaboration Cloud. To enable comments, integrate the TiptapCollabProvider and configure your setup to support comment functionality.

## Provider

The `TiptapCollabProvider` instance

Default: `null`

\`\`\`js
const tiptapCollabProvider = new TiptapCollabProvider({
  // your provider options
})

Comments.configure({
  provider: tiptapCollabProvider,
})
\`\`\`

## Classes

The classes used for the threads.

Default:

\`\`\`js
{
  thread: 'tiptap-thread',
  threadInline: 'tiptap-thread--inline',
  threadBlock: 'tiptap-thread--block',
  threadHovered: 'tiptap-thread--hovered',
  threadSelected: 'tiptap-thread--selected',
  threadResolved: 'tiptap-thread--resolved',
  threadUnresolved: 'tiptap-thread--unresolved',
}
\`\`\`

\`\`\`js
Comments.configure({
  classes: {
    thread: 'my-thread',
    threadInline: 'my-thread-inline',
    threadBlock: 'my-thread-block',
    threadHovered: 'my-thread-hovered',
    threadSelected: 'my-thread-selected',
    threadResolved: 'my-thread-resolved',
    threadUnresolved: 'my-thread-unresolved',
  },
})
\`\`\`

## onClickThread

A callback that is called when a thread is clicked. If the thread is clicked, the thread ID is passed to the callback. If no thread is clicked, `null` is passed.

Default: `undefined`

\`\`\`js
Comments.configure({
  // ID can be a string or null
  onClickThread: (id) => console.log('Thread clicked', id),
})
\`\`\`

## useLegacyWrapping

<Callout title="Warning" variant="warning">
  The new wrapping mechanism uses a different schema for threads on block nodes, which is not
  compatible with the previous wrapping behavior. If this is set to `false` without mapping existing
  thread nodes to the new schema, the threads content will be stripped from the document.
</Callout>

A boolean option that controls whether to use the legacy wrapping mechanism for multi-line comments. We suggest for new implementations to set this to `false`, and existing integrations can stay on the previous behavior. This is only required for backwards compatibility with existing comments, and it will
be removed in the future.

The new wrapping mechanism is more flexible, allowing to wrap content more precise and supports mixed wrapping of inline and block nodes.

**Default:** `true`

\`\`\`js
Comments.configure({
  // enable new flexible block wrapping
  useLegacyWrapping: false,
})
\`\`\`

```

# comments\core-concepts\manage-threads.mdx

```mdx
---
title: Manage threads in your editor
meta:
  title: Manage threads | Tiptap Comments Docs
  description: Manage discussions in Tiptap Editor using threads and comments with editor commands. More in our docs!
  category: Comments
---

import { Callout } from '@/components/ui/Callout'

Use this guide to integrate comments directly into your editor. For a complete list of all Comments editor commands, see the [Editor Commands](/comments/integrate/editor-commands) page.

You can also interact with comments from outside your editor via our [Comments REST API](/comments/integrate/rest-api).

## Learn about threads

Tiptap's Comments feature organizes discussions into threads, enabling clear and context-relevant collaboration by distinguishing between threads and individual comments.

Threads serve as containers for discussions related to specific document sections, while comments represent individual contributions within those threads.

## Create a new thread

Let's assume you have a button to create a new thread. You can use the `setThread` command to create a new thread at the current selection.

\`\`\`js
const createThread = () => {
  editor
    .chain()
    .setThread({
      content: 'This is a new thread', // the content of the threads first inital comment
    })
    .run()
}
\`\`\`

This will create a new thread at the current selection and add a comment with the given content. By default comments and threads don't have a user or any other metadata assigned. Let's say you want to add the author to the thread **and** the comment. You can do this by passing through the `data` and `commentData` property to the `setThread` command.

\`\`\`js
const createThread = () => {
  const user = {
    id: '123', // the user id of the author
    name: 'John Doe', // the name of the author
    avatarUrl: 'https://example.com/avatar.jpg', // the avatar of the author
  }

  editor
    .chain()
    .setThread({
      content: 'This is a new thread', // the content of the threads first inital comment
      data: {
        user,
      },
      commentData: {
        user,
      },
    })
    .run()
}
\`\`\`

Now the thread and comment will have a user assigned to it.

## Receive and watch threads and comments

Receiving and watching the threads on your current document can easily be done by using the `subscribeToThreads` function. This function will register a watcher, fetch the first initial list of threads and keep the list up to date.

To unsubscribe from the threads, you can call the callback function returned by the `subscribeToThreads` function.

\`\`\`js
// Subscribe to threads
const unsubscribe = subscribeToThreads({
  provider: yourTiptapCollabProvider,
  callback: (threads) => {
    // do something with threads, store in a state or variable from here
  },
  // optional options
  getThreadsOptions: {
    // only threads with the specific type will be fetched/watched, possible values are 'archived' and 'unarchived',
    // if not set, only unarchived threads will be handled
    // archived and unarchived threads represent soft-deleted threads
    types: ['archived', 'unarchived'],
  },
})
\`\`\`

## Receive and render threads manually

To receive the list of threads on your current document manually, you can simply call `provider.getThreads()`. This will return an array of threads on the document connected to your provider.

This is a static array which won't update on its own. If you want to keep the list of threads up to date, you can listen to changes via the `provider.watchThreads` and `provider.unwatchThreads` functions.

\`\`\`js
// let's save threads in a variable
let threads = []

// this function is called whenever the threads change
const getThreads = () => {
  threads = provider.getThreads()
}

// initial call to get the threads
getThreads()

// watch for changes
provider.watchThreads(getThreads)
\`\`\`

To unwatch the threads you can call `provider.unwatchThreads(getThreads)`.

\`\`\`js
provider.unwatchThreads(getThreads)
\`\`\`

Let's say you want to write a react hook to get the threads and keep them up to date, you could write a hook like this.

\`\`\`jsx
const useThreads = (provider) => {
  const [threads, setThreads] = useState([])

  useEffect(() => {
    if (!provider) {
      return () => null
    }

    const getThreads = () => {
      setThreads(provider.getThreads())
    }

    getThreads()

    provider.watchThreads(getThreads)

    return () => {
      provider.unwatchThreads(getThreads)
    }
  }, [provider])

  return threads
}
\`\`\`

Now those threads will be reactive and can be used to render the threads in your UI.

## Update a thread

To update a thread you can use the `updateThread` command. This command will update the thread with the given id and update the content of the thread.

\`\`\`js
editor.commands.updateThread({
  id: '123',
  {
    data: {
      seen: true,
    }
  }
})
\`\`\`

This will update the thread with the ID `123` and set the `seen` property to `true`.

## Delete a thread

To delete a thread you can use the `removeThread` command. This command will delete the thread with the given ID.

<Callout title="How to delete threads" variant="default">
  By default, threads removed won't be deleted from the yjs document. To do this, you can pass
  through the `deleteThread` option to the `removeThread` command.
</Callout>

\`\`\`js
editor.commands.removeThread({
  id: '123',
  deleteThread: true,
})
\`\`\`

## Create, update and delete comments

Comments can be added, edited, and removed within threads but cannot be marked as resolved, as they are considered parts of the thread discussions.

To create a comment on a thread you can use the `createComment` command. This command will create a new comment on the thread with the given ID.

\`\`\`js
editor.commands.createComment({
  threadId: '123',
  content: 'This is a new comment', // this could also be tiptap JSON or any other type of content
  data: {
    user, // pass through any meta data you want - in this case the user
  },
})
\`\`\`

This will create a new comment on the thread with the ID `123` and set the content to `This is a new comment`. You can also pass through any metadata you want to the comment.

To update a comment you can use the `updateComment` command. This command will update the comment with the given ID and update the content of the comment.

\`\`\`js
editor.commands.updateComment({
  threadId: '123', // the thread ID
  id: '456', // the comment ID
  content: 'Now this is the new content', // the new content of the comment
  data: {
    edited: true, // set the edited property to true
  },
})
\`\`\`

This will update the comment with the ID `456` on the thread with the ID `123` and set the content to `Now this is the new content`. You can also pass through any metadata you want to the comment.

Finally you can delete a comment by using the `deleteComment` command. This command will delete the comment with the given ID.

\`\`\`js
editor.commands.deleteComment({
  threadId: '123',
  id: '456',
})
\`\`\`

## Resolve and unresolve threads

To resolve a thread you can use the `resolveThread` command. This command will resolve the thread with the given ID.

\`\`\`js
editor.commands.resolveThread({
  id: '123',
})
\`\`\`

This will resolve the thread with the ID `123`. To unresolve a thread you can use the `unresolveThread` command. This command will unresolve the thread with the given ID.

If you want to resolve a thread and add information on which user resolved the thread, you can set the threads data to include the user who resolved the thread. Be sure to clear the data when unresolving the thread.

\`\`\`js
editor.commands.unresolveThread({
  id: '123',
})
\`\`\`

## Select a thread

To select a thread you can use the `selectThread` command. This command selects the thread with the specified ID.

\`\`\`js
editor.commands.selectThread({
  id: '123',
})
\`\`\`

This will move the cursor to the thread with the ID `123`.

To deselect a thread you can use the `unselectThread` command. This command deselects the thread with the specified ID.

\`\`\`js
editor.commands.unselectThread({
  id: '123',
})
\`\`\`

You can also select or unselect threads without ID. In that case, the editor will select or unselect the thread at the current selection.

```

# comments\core-concepts\style-threads.mdx

```mdx
---
title: Style comments in your editor
meta:
  title: Style threads | Tiptap Comments Docs
  description: Style and manage thread visibility in your Tiptap editor using CSS decoration classes for inline and block threads.
  category: Comments
---

To style threads in your Tiptap editor, we use decoration classes that are wrapped around the threads. Since threads can include block nodes, we have two types of decorations: one for inline threads, which are wrapped around the text, and one for block threads, which are wrapped around the block node.

By default, the following css classes are used for the threads:

\`\`\`css
.tiptap-thread {} // the thread class for any type of thread
.tiptap-thread--inline {} // the thread class for inline threads
.tiptap-thread--block {} // the thread class for block threads
.tiptap-thread--hovered {} // the thread class for hovered threads
.tiptap-thread--selected {} // the thread class for selected threads
.tiptap-thread--resolved {} // the thread class for resolved threads
.tiptap-thread--unresolved {} // the thread class for unresolved threads
\`\`\`

Those classes can also be overwritten by passing through the classes to the `ThreadsKit` extension.

\`\`\`js
const editor = new Editor({
  ...
  extensions: [
    ...,
    ThreadsKit.configure({
      classes: {
        thread: 'my-thread',
        threadInline: 'my-thread-inline',
        threadBlock: 'my-thread-block',
        threadHovered: 'my-thread-hovered',
        threadSelected: 'my-thread-selected',
        threadResolved: 'my-thread-resolved',
        threadUnresolved: 'my-thread-unresolved',
      },
    }),
  ]
})
\`\`\`

## Handling hover events

Let's say you have a sidebar with a list of threads, and you want to highlight the thread currently hovered in your sidebar inside the editor. You can dispatch a transaction to the editor with the meta `threadMouseOver` or `threadMouseOut` to indicate which thread is currently hovered.

\`\`\`jsx
const onHoverThread = (threadId) => {
  const { tr } = editor.state

  tr.setMeta('threadMouseOver', threadId)
  editor.view.dispatch(tr)
}

const onUnhoverThread = (threadId) => {
  const { tr } = editor.state

  tr.setMeta('threadMouseOut', threadId)
  editor.view.dispatch(tr)
}

;<div onMouseEnter={() => onHoverThread('123')} onMouseLeave={() => onUnhoverThread('123')}>
  Thread 123
</div>
\`\`\`

```

# comments\getting-started\install.mdx

```mdx
---
title: Install the Comments extension
meta:
  title: Install comments | Tiptap Comments Docs
  description: Install the comments extension in Tiptap to add threaded discussions to your editor and app. Learn more in the docs!
  category: Comments
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

<Callout title="Subscription required" variant="warning">
  This extension requires a valid subscription and a running [Tiptap
  Cloud instance](https://cloud.tiptap.dev/). To install the extension, you need [access to our
  private registry](/guides/pro-extensions).
</Callout>

\`\`\`bash
npm install @tiptap-pro/extension-comments
\`\`\`

## Integrating the Comments extension

After installing the `comments` extension via npm or any other package manager, you can use it in your editor by registering the extension in the `extensions` property of your editor instance.

The Comments extension consists of multiple components, including nodes and plugins. To include all the required features, use the `CommentsKit` extension.

\`\`\`js
import { ThreadsKit } from '@tiptap-pro/extension-comments'

const editor = new Editor({
  ...
  extensions: [
    ...,
    CommentsKit,
  ]
})
\`\`\`

This will add all required extensions to your editor. Since Threads are a **cloud** or **on premises** feature you will need to also pass through a `TiptapCollabProvider` instance to your comments extension.

\`\`\`js
const collabProvider = new TiptapCollabProvider({
  // your provider options
})

const editor = new Editor({
  ...
  extensions: [
    ...,
    CommentsKit.configure({
      provider: collabProvider,
      useLegacyWrapping: false, // optional, will be the default in the future
    }),
  ]
})
\`\`\`

Your editor is now ready to support threads.

<Callout title="Important" variant="warning">
  The new `useLegacyWrapping` option can be set to false to use a new block wrapping mechanism for
  multi-line comments. This **will become the default** in the future.
</Callout>

<hr />

See a full example of how to use the Comments extension in the following example:

<CodeDemo isPro path="/Extensions/Comments?inline=false&hideSource=false" />

```

# comments\getting-started\overview.mdx

```mdx
---
title: Integrate Comments into your app
meta:
  title: Comments | Tiptap Comments Docs
  description: Use the comments extension in Tiptap to add and manage comments in your Editor or via the REST API or Webhooks. More in the docs!
  category: Comments
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

The `Comments` extension lets users create threads and comments in the editor. Threads can be used to discuss specific parts of the document, while individual comments can be added to particular sections.

Comments can be accessed and manipulated through the [Comments REST API](/comments/integrate/rest-api) or received via [webhooks](/comments/integrate/webhook), enabling the creation of notification systems and the ability to add comments from outside the Editor.

<Callout title="Subscription required" variant="warning">
  This extension requires a valid Entry, Business or Enterprise subscription and a running [Tiptap
  Cloud instance](https://cloud.tiptap.dev/). To install the extension, you need [access to our
  private registry](/guides/pro-extensions). Set this up before proceeding.
</Callout>

<CodeDemo isPro path="/Extensions/Comments?inline=false&hideSource=false" />
For simpler use cases, start with the [install](/comments/getting-started/install) section.

## Comments features

- Add inline, document, or sidebar comments
- Comments on text, nodes, custom nodes, or across a selection of nodes
- Rich text support within comments (e.g., bold, emojis)
- Resolve, edit, or delete comments
- Offline commenting support
- Handle overlapping comments
- Mention users directly within comments
- Webhooks to  trigger custom notifications services when users are mentioned
- Programmatically manage comments using the Comments API

```

# comments\integrate\editor-commands.mdx

```mdx
---
title: Comments editor commands
meta:
  title: Editor commands | Tiptap Comments Docs
  description: Use editor commands to integrate comments and threads into your Tiptap Editor. Learn more in the docs!
  category: Comments
---

The Comments Editor API focuses on the client-side interactions for managing comments within the editor, enabling direct manipulation and customization of comment threads.

For server-side operations, use the [Comments REST API](/comments/integrate/rest-api) to manage thread and comments outside the editor.

## All editor commands for comments

| Command           | Description                                                            |
| ----------------- | ---------------------------------------------------------------------- |
| `setThread`       | Creates a new thread with optional user and content data               |
| `removeThread`    | Deletes a specified thread, with an option to remove it from the Yjs document |
| `updateThread`    | Updates specific thread properties like 'seen' status                  |
| `selectThread`    | Focuses the editor on a specified thread                               |
| `unselectThread`  | Removes focus from the selected thread                                   |
| `resolveThread`   | Marks a thread as resolved                                             |
| `unresolveThread` | Reverts a thread from resolved status                                  |
| `createComment`   | Adds a new comment to a thread with details like content and user data |
| `updateComment`   | Modifies an existing comment's content and metadata                    |
| `removeComment`   | Deletes a specified comment from a thread                              |

## Interact with threads

### setThread( content, data, commentData )

Creates a new thread at your current selection.

\`\`\`js
editor.commands.setThread({
  content: 'This is a new thread',
  data: { authorId: '123' },
  commentData: { authorId: '123' },
})
\`\`\`

### removeThread( id, deleteThread )

Deletes a thread with the given ID. If no ID is provided, the thread at the current selection will be deleted. If `deleteThread` is set to `true`, the thread will also be deleted from the Yjs document.

\`\`\`js
editor.commands.removeThread({
  id: '101',
  deleteThread: true,
})
\`\`\`

### updateThread( id, data )

Updates the properties of a thread with the specified ID.

\`\`\`js
editor.commands.updateThread({
  id: '101',
  data: { seen: true },
})
\`\`\`

### selectThread( id, selectAround )

Selects a thread with the specified ID. If `selectAround` is set to `true`, the editor will create a selection range spanning the entire thread.

\`\`\`js
editor.commands.selectThread({
  id: '101',
  selectAround: true,
})
\`\`\`

### unselectThread()

Deselects the currently selected thread.

\`\`\`js
editor.commands.unselectThread()
\`\`\`

### resolveThread( id )

Marks the thread with the specified ID as resolved.

\`\`\`js
editor.commands.resolveThread({
  id: '101',
})
\`\`\`

### unresolveThread( id )

Reverts the thread with the specified ID to unresolved status.

\`\`\`js
editor.commands.unresolveThread({
  id: '101',
})
\`\`\`

## Handle comments

### createComment( threadId, content, data )

Creates a new comment on the thread with the specified thread ID.

\`\`\`js
editor.commands.createComment({
  threadId: '101',
  content: 'This is a new comment',
  data: { authorId: '123' },
})
\`\`\`

### updateComment( threadId, id, content, data )

Updates a comment with the specified ID on the thread identified by a given thread ID.

\`\`\`js
editor.commands.updateComment({
  threadId: '101',
  id: '456',
  content: 'Now this is the new content',
  data: { edited: true },
})
\`\`\`

### removeComment( threadId, id )

Deletes a comment with the specified ID from the thread identified by a given thread ID.

\`\`\`js
editor.commands.removeComment({
  threadId: '101',
  id: '456',
})
\`\`\`

```

# comments\integrate\rest-api.mdx

```mdx
---
title: Comments REST API
meta:
  title: REST API | Tiptap Comments Docs
  description: Use the Tiptap Comments REST API to manage threads and comments from outside the editor. More in the docs!
  category: Comments
---

The Comments REST API lets users manage comment threads and individual comments from outside the Tiptap Editor. It supports creating, updating, deleting, and retrieving threads and comments.

Use the [Comments Postman Collection](https://www.postman.com/docking-module-explorer-14290287/workspace/tiptap-collaboration-public/folder/33042171-01d1c110-e913-4d99-b47a-fc95aad877c9?ctx=documentation) for hands-on experimentation.

## Access the API

The REST API is exposed directly from your Collaboration app, available at your custom URL:

\`\`\`bash
https://YOUR_APP_ID.collab.tiptap.cloud/
\`\`\`

Authentication is done using an API secret which you can find in
the [settings](https://cloud.tiptap.dev/apps/settings) of your Collaboration app. The secret must be sent as
an `Authorization` header.

If your document identifier contains a slash (`/`), encode it as `%2F`, e.g.
using `encodeURIComponent`.

## Review all API endpoints

| Operation      | Method | Endpoint                                                                         | Description                                 |
|----------------|--------|----------------------------------------------------------------------------------|---------------------------------------------|
| Create thread  | POST   | /api/documents/:identifier/threads                                               | Create a new thread within a document       |
| Get threads    | GET    | /api/documents/:identifier/threads                                               | List all threads and view their details     |
| Get thread     | GET    | /api/documents/:identifier/threads/:threadIdentifier                             | Retrieve a specific thread                  |
| Update thread  | PATCH  | /api/documents/:identifier/threads/:threadIdentifier                             | Modify attributes of an existing thread     |
| Update comment | PATCH  | /api/documents/:identifier/threads/:threadIdentifier/comments/:commentIdentifier | Update the content or metadata of a comment |
| Delete thread  | DELETE | /api/documents/:identifier/threads/:threadIdentifier                             | Remove a specific thread from a document    |
| Delete comment | DELETE | /api/documents/:identifier/threads/:threadIdentifier/comments/:commentIdentifier | Remove a specific comment from a thread     |

## Thread REST API endpoints

### Get threads

\`\`\`bash
GET /api/documents/:identifier/threads
\`\`\`

Retrieve all comment threads associated with a specific document. Use this endpoint to list all threads and view their details.

\`\`\`bash
curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/{document_id}/threads' \
--header 'Authorization: {{Authorization}}'
\`\`\`

### Get thread

\`\`\`bash
GET /api/documents/:identifier/threads/:threadIdentifier
\`\`\`

Fetch details of a specific thread using its unique identifier within a document. This is useful for retrieving specific discussion threads.

\`\`\`bash
curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/{document_id}/threads/{thread_id}' \
--header 'Authorization: {{Authorization}}'
\`\`\`

### Create thread

\`\`\`bash
POST /api/documents/:identifier/threads
\`\`\`

Create a new thread within a document. You can specify the initial content and additional data like user metadata.

\`\`\`bash
curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/{document_id}/threads' \
--header 'Content-Type: application/json' \
--header 'Authorization: {{Authorization}}' \
--data '{
    "content": "moin",
    "data": { "key": "ttt"}
}'
\`\`\`

### Update thread

\`\`\`bash
PATCH /api/documents/:identifier/threads/:threadIdentifier
\`\`\`

Modify attributes of an existing thread, such as marking it as resolved or updating its metadata.

\`\`\`bash
curl --location --request PATCH 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/{document_id}/threads/{thread_id}' \
--header 'Content-Type: application/json' \
--header 'Authorization: {{Authorization}}' \
--data '{
    "resolvedAt": null
}'
\`\`\`

### Delete thread

\`\`\`bash
DELETE /api/documents/:identifier/threads/:threadIdentifier
\`\`\`

Remove a specific thread from a document, effectively deleting all nested comments.

\`\`\`bash
curl --location --request DELETE 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/{document_id}/threads/{thread_id}' \
--header 'Authorization: {{Authorization}}'
\`\`\`

## Comment REST API endpoints

### Create comment

\`\`\`bash
POST /api/documents/:identifier/threads/:threadIdentifier/comments
\`\`\`

Add a new comment to an existing thread. Specify the content and any associated data.

\`\`\`bash
curl --location 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/{document_id}/threads/{thread_id}/comments' \
--header 'Content-Type: application/json' \
--header 'Authorization: {{Authorization}}' \
--data '{
    "content": "test",
    "data": { "key": "ttt"}
}'
\`\`\`

### Update comment

\`\`\`bash
PATCH /api/documents/:identifier/threads/:threadIdentifier/comments/:commentIdentifier
\`\`\`

Update the content or metadata of an existing comment within a thread.

\`\`\`bash
curl --location --request PATCH 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/{document_id}/threads/{thread_id}/comments/{comment_id}' \
--header 'Content-Type: application/json' \
--header 'Authorization: {{Authorization}}' \
--data '{
    "content": "UPDATED!"
}'
\`\`\`

### Delete comment

\`\`\`bash 
DELETE /api/documents/:identifier/threads/:threadIdentifier/comments/:commentIdentifier
\`\`\`

Remove a specific comment from a thread. Use this to manage individual comments.

\`\`\`bash
curl --location --request DELETE 'https://YOUR_APP_ID.collab.tiptap.cloud/api/documents/{document_id}/threads/{thread_id}/comments/{comment_id}' \
--header 'Authorization: {{Authorization}}'
\`\`\`

## Review Postman Collection

Use the [Comments Postman Collection](https://www.postman.com/docking-module-explorer-14290287/workspace/tiptap-collaboration-public/folder/33042171-01d1c110-e913-4d99-b47a-fc95aad877c9?ctx=documentation) for hands-on experimentation.

```

# comments\integrate\webhook.mdx

```mdx
---
title: Comments webhook
meta:
  title: Webhook | Tiptap Comments Docs
  description: Enable and manage webhooks for Comments in Tiptap to receive notifications on thread and comment activities. More in the docs!
  category: Comments
---

Set up and manage webhooks to improve your Comments integration. Common use cases for Comments webhooks include:

- Sending notifications when a thread is created, resolved, updated, or deleted.
- Notifying users when comments are added, updated, or deleted.
- In conjunction with the [mention extension](/editor/extensions/nodes/mention), sending emails or notifications to users when they are mentioned in comments.

## Enable comment events

For accounts created after March 1, 2024, Comments webhooks are enabled by default. Otherwise, you could still be using an older version of the webhook system and need to manually upgrade:

1. In case you’ve previously implemented Collaboration webhooks, check the `type` and `trigger` fields when processing incoming webhooks. ([Documentation](/collaboration/core-concepts/webhooks))
2. Navigate to your [Collaboration settings](https://cloud.tiptap.dev/apps/settings).
3. In the Webhooks section, click **Upgrade**.

This upgrade is necessary to accommodate the introduction of multiple new events being routed to the same webhook endpoint, distinguished by a new `type` and `trigger` field.

## Configure webhooks

To configure webhooks for Comments notifications:

1. Navigate to the [Collaboration settings](https://cloud.tiptap.dev/apps/settings) in your account.
2. In the Webhooks section, add your desired endpoint URL.

After adding your URL, the webhook is immediately live. You'll start receiving notifications for the specified events without any delay.

## Webhook events

Comments webhooks trigger notifications for a variety of events related to threads and comments within the Comments extension. These events are triggered immediately as soon as their associated action occur within the comments.

- `comment.added`
- `comment.updated`
- `comment.deleted`
- `thread.created`
- `thread.resolved`
- `thread.updated`
- `thread.deleted`

## Example payloads

Below are example payloads for different types of webhook events:

### Thread/comment created

\`\`\`json
{
  "trigger": "comment.added",
  "thread": {
    "id": "128ba3a9-c684-4956-8c9f-fe5dc147c7e5",
    "createdAt": "2024-03-02T22:17:51.304Z",
    "comments": [
      {
        "id": "0259e4cb-43ad-4eb2-a7e9-a7a7d5207a76",
        "createdAt": "2024-03-02T22:17:51.307Z",
        "updatedAt": "2024-03-02T22:17:51.307Z",
        "data": {
          "userName": "Cyndi Lauper",
          "userAvatar": "https://api.dicebear.com/7.x/lorelei/svg?seed=Cyndi Lauper"
        },
        "content": "Threaderstellungskommentar"
      }
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
\`\`\`

### Comment updated

\`\`\`json
{
  "trigger": "comment.updated",
  "thread": [
    {
      "id": "0259e4cb-43ad-4eb2-a7e9-a7a7d5207a76",
      "createdAt": "2024-03-02T22:17:51.307Z",
      "updatedAt": "2024-03-02T22:18:04.246Z",
      "data": {
        "userName": "Cyndi Lauper",
        "userAvatar": "https://api.dicebear.com/7.x/lorelei/svg?seed=Cyndi Lauper"
      },
      "content": "Threaderstellungskommentar (bearbeitet)"
    }
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
\`\`\`

### Comment deleted

\`\`\`json
{
  "trigger": "comment.deleted",
  "thread": {
    "id": "128ba3a9-c684-4956-8c9f-fe5dc147c7e5",
    "createdAt": "2024-03-02T22:17:51.304Z",
    "comments": [
      {
        "id": "0259e4cb-43ad-4eb2-a7e9-a7a7d5207a76",
        "createdAt": "2024-03-02T22:17:51.307Z",
        "updatedAt": "2024-03-02T22:18:04.246Z",
        "data": {
          "userName": "Cyndi Lauper",
          "userAvatar": "https://api.dicebear.com/7.x/lorelei/svg?seed=Cyndi Lauper"
        },
        "content": "Threaderstellungskommentar (bearbeitet)"
      }
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
\`\`\`

### Thread deleted

\`\`\`json
{
  "trigger": "thread.deleted",
  "thread": {
    "id": "128ba3a9-c684-4956-8c9f-fe5dc147c7e5",
    "createdAt": "2024-03-02T22:17:51.304Z",
    "comments": [
      {
        "id": "0259e4cb-43ad-4eb2-a7e9-a7a7d5207a76",
        "createdAt": "2024-03-02T22:17:51.307Z",
        "updatedAt": "2024-03-02T22:18:04.246Z",
        "data": {
          "userName": "Cyndi Lauper",
          "userAvatar": "https://api.dicebear.com/7.x/lorelei/svg?seed=Cyndi Lauper"
        },
        "content": "Threaderstellungskommentar (bearbeitet)"
      }
    ],
    "updatedAt": "2024-03-02T22:18:52.050Z",
    "resolvedAt": null
  },
  "appName": "",
  "user": "",
  "name": "documentName",
  "type": "THREAD"
}
\`\`\`

### Thread resolved

\`\`\`json
{
  "trigger": "thread.resolved",
  "thread": {
    "id": "128ba3a9-c684-4956-8c9f-fe5dc147c7e5",
    "createdAt": "2024-03-02T22:17:51.304Z",
    "comments": [
      {
        "id": "0259e4cb-43ad-4eb2-a7e9-a7a7d5207a76",
        "createdAt": "2024-03-02T22:17:51.307Z",
        "updatedAt": "2024-03-02T22:18:04.246Z",
        "data": {
          "userName": "Cyndi Lauper",
          "userAvatar": "https://api.dicebear.com/7.x/lorelei/svg?seed=Cyndi Lauper"
        },
        "content": "Threaderstellungskommentar (bearbeitet)"
      }
    ],
    "updatedAt": "2024-03-02T22:18:48.531Z",
    "resolvedAt": "2024-03-02T22:18:48.531Z"
  },
  "appName": "",
  "user": "",
  "name": "documentName",
  "type": "THREAD"
}
\`\`\`

### Thread updated (i.e., Unresolved)

\`\`\`json
{
  "trigger": "thread.updated",
  "thread": {
    "id": "128ba3a9-c684-4956-8c9f-fe5dc147c7e5",
    "createdAt": "2024-03-02T22:17:51.304Z",
    "comments": [
      {
        "id": "0259e4cb-43ad-4eb2-a7e9-a7a7d5207a76",
        "createdAt": "2024-03-02T22:17:51.307Z",
        "updatedAt": "2024-03-02T22:18:04.246Z",
        "data": {
          "userName": "Cyndi Lauper",
          "userAvatar": "https://api.dicebear.com/7.x/lorelei/svg?seed=Cyndi Lauper"
        },
        "content": "Threaderstellungskommentar (bearbeitet)"
      }
    ],
    "updatedAt": "2024-03-02T22:18:52.050Z",
    "resolvedAt": null
  },
  "appName": "",
  "user": "",
  "name": "documentName",
  "type": "THREAD"
}
\`\`\`

```

# comments\sidebar.ts

```ts
import { SidebarConfig } from '@/types'

export const sidebarConfig: SidebarConfig = {
  id: 'comments',
  rootHref: '/comments/getting-started/overview',
  title: 'Comments',
  items: [
    {
      type: 'group',
      href: '/comments/getting-started',
      title: 'Getting started',
      children: [
        {
          title: 'Overview',
          href: '/comments/getting-started/overview',
        },
        {
          title: 'Install',
          href: '/comments/getting-started/install',
        },
      ],
    },
    {
      type: 'group',
      href: '/comments/core-concepts',
      title: 'Core concepts',
      children: [
        {
          title: 'Manage threads',
          href: '/comments/core-concepts/manage-threads',
        },
        {
          title: 'Style threads',
          href: '/comments/core-concepts/style-threads',
        },
        {
          title: 'Configure',
          href: '/comments/core-concepts/configure',
        },
      ],
    },
    {
      type: 'group',
      href: '/comments/integrate',
      title: 'Integrate',
      children: [
        {
          title: 'Editor commands',
          href: '/comments/integrate/editor-commands',
        },
        {
          title: 'REST API',
          href: '/comments/integrate/rest-api',
        },
        {
          title: 'Webhook',
          href: '/comments/integrate/webhook',
        },
      ],
    },
  ],
}

```

# content-ai\capabilities\generation\configure.mdx

```mdx
---
title: Configure the AI Generation extension
meta:
  title: Configure AI Generation | Tiptap Content AI
  description: Configure the AI Generation extension in your editor and learn more about all the options possible with AI.
  category: Content AI
---

The Content AI extension for Tiptap accepts different settings to configure the global behavior of the extension and the commands.

| Setting                 | Type                                                                                                                          | Default                                                                                         | Definition                                                                                                                                                                                                                                                   |
|-------------------------|-------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `appId`                 | `string`                                                                                                                      | `''`                                                                                            | Your Application ID which can be obtained by [visiting the AI settings in Tiptap Cloud](https://collab.tiptap.dev/ai-settings)                                                                                                                               |
| `token`                 | `string`                                                                                                                      | `''`                                                                                            | In order to authenticate against our AI backend service, you’ll need to generate a JWT (with HS256) using your JWT secret, which you also [obtain in your team’s AI settings page](https://cloud.tiptap.dev/ai-settings)                                     |
| `autocompletion`        | `boolean`                                                                                                                     | `false`                                                                                         | Enables the autocompletion feature. When writing text, just hit **Tab** to trigger the autocompletion and another **Tab** to accept the completion. We’re using a portion of your already written text to build a prompt for OpenAI.                         |
| `autocompletionOptions` | `object`                                                                                                                      | `{ trigger: 'Tab', accept: 'Tab', debounce: 0, inputLength: 4000, modelName: 'gpt-3.5-turbo' }` | Defines the trigger and length of text used to generate autocompletion suggestion. Accept defaults to trigger, if not set explicitly. Debounce in ms the request after trigger pressed. You can also choose the OpenAI model to run the autocompletion task. |
| `onLoading`             | `(context: { editor: Editor, action: TextAction \| 'image', isStreaming: boolean }) => void`                                  | `undefined`                                                                                     | Callback for when the AI has begun generating a response.                                                                                                                                                                                                    |
| `onSuccess`             | `(context: { editor: Editor, action: TextAction \| 'image', isStreaming: boolean, response: string }) => void`                | `undefined`                                                                                     | Callback for when the AI has successfully finished generating a response.                                                                                                                                                                                    |
| `onChunk`               | `(context: { editor: Editor, action: TextAction \| 'image', isStreaming: boolean, response: string, chunk: string }) => void` | `undefined`                                                                                     | Callback for when a chunk of the response is generated. chunk being the new string partial response being the generated response so far (including the chunk)                                                                                                |
| `onError`               | `(error: Error, context: { editor: Editor, action: TextAction \| 'image', isStreaming: boolean}) => void`                     | `undefined`                                                                                     | Callback for when an error occurs while generating a response.                                                                                                                                                                                               |
| `showDecorations`       | `boolean`                                                                                                                     | `true`                                                                                          | If `false`, will not attempt to decorate AI suggestions in streaming mode. This reduces your ability to style suggestions but can fix issues with undo history                                                                                               |

```

# content-ai\capabilities\generation\custom-llms.mdx

```mdx
---
title: Integrate a custom LLM
meta:
  title: Custom LLM | Tiptap Content AI
  description: Implement custom LLMs with the Generative AI extension and override resolver functions in your editor. Learn more in the docs!
  category: Content AI
---

import { Callout } from '@/components/ui/Callout'

If you want to use a your own backend which provides access to a custom LLM, you can override the resolver functions defined below on the extension configuration.

Make sure you’re returning the correct type of response and that you handle errors correctly.

<Callout title="Heads up!" variant="hint">

We strongly advise you not to call OpenAI directly in your frontend, as this could lead to API token leakage! You should use a proxy on your backend to keep your API tokens secret.

</Callout>

## Install the advanced extension

In order to use customized resolver functions, you need to install the advanced version of our Tiptap AI extension.

<Callout title="Pro Extension" variant="warning">

    This extension requires a valid subscription in an eligible plan and [access to our private registry](/guides/pro-extensions), set this up first.

    **You need to be a business customer, to use the advanced extension.**

</Callout>

\`\`\`bash
npm install @tiptap-pro/extension-ai-advanced
\`\`\`

### Use both custom LLM and Tiptap AI Cloud

If you want to rely on our cloud in some cases, make sure that you [setup your team as described here](/content-ai/capabilities/generation/install#set-up-tiptap-ai-for-your-team).

## Resolver Functions

You can define custom resolver functions on the extension options. Be aware that they expect the following return types.

| Type       | Method name            | Return Type                                   |
| ---------- | ---------------------- | --------------------------------------------- |
| completion | `aiCompletionResolver` | `Promise<string \| null>`                     |
| streaming  | `aiStreamResolver`     | `Promise<ReadableStream<Uint8Array> \| null>` |
| image      | `aiImageResolver`      | `Promise<string \| null>`                     |

Use `aiCompletionResolver` to add text to the editor in a non-streaming manner.

Use the `aiStreamResolver` to stream content directly into the editor. This gives the editor typewritter effect.

Make sure that the stream returns HTML to allow Tiptap to render the content directly as rich text. This approach removes the need for a Markdown parser and keeps the frontend lightweight.

## Examples

### Override a specific command resolution in completion mode

In this example we want to call our custom backend when the `rephrase` action/command is called.
Everything else should be handled by the default backend in the Tiptap Cloud.

\`\`\`js
// ...
import Ai from '@tiptap-pro/extension-ai-advanced'
// ...

Ai.configure({
  appId: 'APP_ID_HERE',
  token: 'TOKEN_HERE',
  // ...
  onError(error, context) {
    // handle error
  },
  // Define the resolver function for completions (attention: streaming and image have to be defined separately!)
  aiCompletionResolver: async ({
    editor,
    action,
    text,
    textOptions,
    extensionOptions,
    defaultResolver,
  }) => {
    // Check against action, text, whatever you like
    // Decide to use custom endpoint
    if (action === 'rephrase') {
      const response = await fetch('https://dummyjson.com/quotes/random')
      const json = await response?.json()

      if (!response.ok) {
        throw new Error(`${response.status} ${json?.message}`)
      }

      return json?.quote
    }

    // Everything else is routed to the Tiptap AI service
    return defaultResolver({
      editor,
      action,
      text,
      textOptions,
      extensionOptions,
      defaultResolver,
    })
  },
})
\`\`\`

### Register a new AI command and call a custom backend action

In this example, we register a new editor command named `aiCustomTextCommand`, use the Tiptap `runAiTextCommand` function to let Tiptap do the rest, and add a custom command resolution to call a custom backend (in completion mode).

\`\`\`js
// …
import { Ai, runAiTextCommand } from '@tiptap-pro/extension-ai-advanced'
// …

// Declare typings if TypeScript is used:
//
// declare module '@tiptap/core' {
//   interface Commands<ReturnType> {
//     ai: {
//       aiCustomTextCommand: () => ReturnType,
//     }
//   }
// }

const AiExtended = Ai.extend({
  addCommands() {
    return {
      ...this.parent?.(),

      aiCustomTextCommand:
        (options = {}) =>
        (props) => {
          // Do whatever you want; e.g. get the selected text and pass it to the specific command resolution
          return runAiTextCommand(props, 'customCommand', options)
        },
    }
  },
})

// … this is where you initialize your Tiptap editor instance and register the extended extension

const editor = new Editor{
  extensions: [
    /* … add other extension */
    AiExtended.configure({
      /* … add configuration here (appId, token etc.) */
      onError(error, context) {
        // handle error
      },
      aiCompletionResolver: async ({
        action,
        text,
        textOptions,
        extensionOptions,
        defaultResolver,
        editor,
      }) => {
        if (action === 'customCommand') {
          const response = await fetch('https://dummyjson.com/quotes/random')
          const json = await response?.json()

          if (!response.ok) {
            throw new Error(`${response.status} ${json?.message}`)
          }

          return json?.quote
        }

        return defaultResolver({
          editor,
          action,
          text,
          textOptions,
          extensionOptions,
          defaultResolver,
        })
      },
    }),
  ],
  content: '',
})

// … use this to run your new command:
// editor.chain().focus().aiCustomTextCommand().run()
\`\`\`

### Use your custom backend in streaming mode

We’re entirely relying on a custom backend in this example.

Make sure that the function `aiStreamResolver` returns a `ReadableStream<Uint8Array>`.

And remember: If you want to use both streaming and the traditional completion mode (non-streaming way), you’ll need to define a `aiCompletionResolver`, too!

\`\`\`js
// ...
import Ai from '@tiptap-pro/extension-ai-advanced'
// ...

Ai.configure({
  appId: 'APP_ID_HERE',
  token: 'TOKEN_HERE',
  // ...
  onError(error, context) {
    // handle error
  },
  // Define the resolver function for streams
  aiStreamResolver: async ({ action, text, textOptions }) => {
    const fetchOptions = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        ...textOptions,
        text,
      }),
    }

    const response = await fetch(`<YOUR_STREAMED_BACKEND_ENDPOINT>`, fetchOptions)
    const json = await response?.json()

    if (!response.ok) {
      throw new Error(`${json?.error} ${json?.message}`)
    }

    return response?.body
  },
})
\`\`\`

```

# content-ai\capabilities\generation\image-generation.mdx

```mdx
---
title: AI image generation editor command
meta:
    title: Generate images | Tiptap Content AI Docs
    description: Integrate the aiImagePrompt into your editor to generate images with AI with a custom prompt and style. More in the docs!
    category: Content AI
---

The `aiImagePrompt` command in Tiptap Content AI enables you to generate images directly within the editor. You can use different OpenAI models and customize the style of the generated images.

To see how this command is used, check out the [notion-like template](https://templates.tiptap.dev/).

## Integrate aiImagePrompt

Generates an image based on your prompt and the desired style.

Make sure to load the image extension (`'@tiptap/extension-image'`) in your editor instance.

\`\`\`js
editor.chain().focus().aiImagePrompt(options: ImageOptions).run()
\`\`\`

## Image command options

With these settings you can control how the image is generated:

| Setting   | Type                                                                                            | Default          | Definition               |
| --------- | ----------------------------------------------------------------------------------------------- | ---------------- | ------------------------ |
| modelName | `dall-e-2`, `dall-e-3`, `null`                                                                  | `dall-e-3`       | The model used at OpenAI |
| style     | `photorealistic`, `digital_art`, `comic_book`, `neon_punk`, `isometric`, `line_art`, `3d_model` | `photorealistic` | Define the image style   |
| size      | `256x256`, `512x512`, `1024x1024`                                                               | `null`           |

```

# content-ai\capabilities\generation\install.mdx

```mdx
---
title: Install the AI Generation extension
meta:
  title: Install AI Generation | Tiptap Content AI
  description: Set up Tiptap AI Generation in your editor, including configuring OpenAI keys and JWT authentication. More in the docs!
  category: Content AI
---

import { Callout } from '@/components/ui/Callout'

Please follow the next steps closely in order to prevent any missing settings before you start using Tiptap AI.

Unless you’re an business customer who wants to use [custom resolver functions](/content-ai/custom-llms), you’ll need to set up your OpenAI keys in your [Tiptap account](https://cloud.tiptap.dev/ai-settings).

## Set up Tiptap AI for your team

This extension relies on using our Content AI backend service. You'll need a valid Entry, Business or Enterprise subscription. [Just head over to our pricing page to learn more.](https://tiptap.dev/pricing)

1.  You’ll need to provide an [OpenAI API token](https://platform.openai.com/docs/quickstart/account-setup) yourself, which we’re using in order to send requests to the OpenAI API. Your token is stored well encrypted and is only used on a per-request basis. [Add the OpenAI API Key to your team](https://cloud.tiptap.dev/ai-settings).
2.  Generate a JWT (HS256 algorithm) with our provided secret to authenticate the extension against our service. [Get your JWT secret.](https://cloud.tiptap.dev/ai-settings)
3.  Set up the extension as described below.

## Install the extension

<Callout title="Subscription required" variant="warning">

This extension requires a valid Entry, Business or Enterprise subscription. To install the extension you need access to our [private registry](/guides/pro-extensions), set this up first.

</Callout>

Once done, you can install the extension from our private registry:

\`\`\`bash
npm install @tiptap-pro/extension-ai
\`\`\`

## Initialize the extension

The integration into your editor instance is done like every other Tiptap extension. This is an example on how it could look like:

\`\`\`js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Ai from '@tiptap-pro/extension-ai'

const editor = new Editor{
  extensions: [
    StarterKit,
    Ai.configure({
      // Your Tiptap Content AI app id
      appId: 'APP_ID_HERE',
      // This needs to be your generated JWT and MUST NOT be the OpenAI API key!
      token: 'TOKEN_HERE',
      autocompletion: true,
      // … other options (see below)
    }),
    // … more extensions
  ],
})
\`\`\`

At this point you're good to go to use OpenAI in your Tiptap editor. Have a look at the [configuration options](/content-ai/capabilities/generation/configure) to customize your experience.

```

# content-ai\capabilities\generation\overview.mdx

```mdx
---
title: Integrate AI into your editor
meta:
  title: AI Generation | Tiptap Content AI
  description: Integrate AI features into your editor like smart autocompletion, image generation and more. Read about it in our docs.
  category: Content AI
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

Integrate the AI Generation extension into your Tiptap Editor with just a couple of lines of code. This extension equips you with a set of AI-enhanced features including pre-built commands, prompt customization, image generation, and smart autocompletion.

Add your own custom commands on top and even integrate your own proprietary LLM to create a unique user experience.

<CodeDemo isPro path="/Extensions/AiCommands" />

<Callout title="Subscription required" variant="warning">
    This extension requires a valid subscription. To install the extension, you need [access to our
    private registry](/guides/pro-extensions).
</Callout>

## AI Generation features

- [Pre-configured default commands](/content-ai/capabilities/generation/text-generation)
- [Autocompletion for efficient editing](/content-ai/capabilities/generation/text-generation/autocompletion)
- Real-time streaming for commands
- Compatibility with various OpenAI models (e.g., gpt-3.5-turbo, gpt-4, gpt-4o, dall-e-3)
- [Create your own prompts and commands](/content-ai/capabilities/generation/text-generation/custom-commands)
- [Custom LLM integration for business accounts](/content-ai/capabilities/generation/custom-llms)

## How it works

Integrate [OpenAI](/content-ai/capabilities/generation/install) or your own [Custom LLM](/content-ai/capabilities/generation/custom-llms) with your Tiptap Editor. The extension covers both, the client and server-side implementations. Here’s the user experience:

1. Highlight text in the editor and apply an AI command.
2. Your selection, the chosen action, and any options are sent to our cloud service.
3. We generate a prompt and engage OpenAI on your behalf.
4. The AI's response is then directly inserted or streamed into your editor.

By default, this utilizes our backend service, but there are options for advanced scenarios including custom backends and LLMs.

```

# content-ai\capabilities\generation\text-generation\autocompletion.mdx

```mdx
---
title: Autocompletion in Content AI
meta:
  title: Autocompletion | Tiptap Content AI
  description: Set up your AI Generation extension to autocomplete and stream text when a user hits tab in your editor. More in the docs!
  category: Content AI
---

import { CodeDemo } from '@/components/CodeDemo'

When you enable autocompletion, the system uses a segment of the text you've already written to generate suggestions.

To trigger autocompletion, simply press the `Tab` key while writing. Press `Tab` again to accept the suggested completion.

If you want to see it in action, hit the `Tab` key after any line of text in this demo.

<CodeDemo isPro path="/Extensions/AiAutocompletion" />

## Configure autocompletion

When you're integrating the Content AI extension you can specify that you want to enable autocompletion,
how the autocompletion feature should behave and what context it should consider.

| Setting                 | Type      | Default                                                                                         | Definition                                                                                                                                                                                                                                                   |
| ----------------------- | --------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `autocompletion`        | `boolean` | `false`                                                                                         | Enables the autocompletion feature. When writing text, just hit **Tab** to trigger the autocompletion and another **Tab** to accept the completion. We’re using a portion of your already written text to build a prompt for OpenAI.                         |
| `autocompletionOptions` | `object`  | `{ trigger: 'Tab', accept: 'Tab', debounce: 0, inputLength: 4000, modelName: 'gpt-3.5-turbo' }` | Defines the trigger and length of text used to generate autocompletion suggestion. Accept defaults to trigger, if not set explicitly. Debounce in ms the request after trigger pressed. You can also choose the OpenAI model to run the autocompletion task. |

To see all other Content AI extension configuration option, head over to the [install](/content-ai/capabilities/generation/install#configure-the-extension) page.

## Enable autocompletion

\`\`\`js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Ai from '@tiptap-pro/extension-ai'

const editor = new Editor{
  extensions: [
    StarterKit,
    Ai.configure({
      appId: 'APP_ID_HERE',
      token: 'TOKEN_HERE',
      autocompletion: true,
      // … other options (see above)
    }),
    // … more extensions
  ],
})
\`\`\`

```

# content-ai\capabilities\generation\text-generation\built-in-commands.mdx

```mdx
---
title: AI Generation editor commands
meta:
  title: AI Generation editor commands | Tiptap Content AI
  description: Integrate AI into your Tiptap Editor to access preconfigured commands for text manipulation and image generation.
  category: Content AI
---

The AI Generation extension for Tiptap Editor includes a set of preconfigured commands that you can integrate into your rich text editor. These commands allow you to adjust text tone, complete text, generate images, and more, enhancing your editor's functionality.

To see how these commands are used, check out the examples on the [overview](/content-ai/capabilities/generation/overview) page.

| Command                                                                                                                         | Description                                                                                                                          |
|---------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| [`aiAdjustTone(tone: Tone, options: TextOptions)`](#aiadjusttone)                                                               | Adjusts the tone of voice of the selected text to the specified [TONE](#aitone).                                                     |
| [`aiBloggify(options: TextOptions)`](#most-text-commands)                                                                       | Rewrite the text into a blog format                                                                                                  |
| [`aiComplete(options: TextOptions)`](#most-text-commands)                                                                       | Completes the selected text                                                                                                          |
| [`aiDeEmojify(options: TextOptions)`](#most-text-commands)                                                                      | Removes emojis from the selected text                                                                                                |
| [`aiEmojify(options: TextOptions)`](#most-text-commands)                                                                        | Adds emojis ✨ to your text                                                                                                           |
| [`aiExtend(options: TextOptions)`](#most-text-commands)                                                                         | Extends your text                                                                                                                    |
| [`aiFixSpellingAndGrammar(options: TextOptions)`](#most-text-commands)                                                          | Fixes spelling & grammar                                                                                                             |
| [`aiKeypoints(options: TextOptions)`](#most-text-commands)                                                                      | Summarizes your text to a list of key points                                                                                         |
| [`aiRephrase(options: TextOptions)`](#most-text-commands)                                                                       | Rephrases the selected text                                                                                                          |
| [`aiRestructure(options: TextOptions)`](#most-text-commands)                                                                    | Restructures the selected text to use rich text formatting                                                                           |
| [`aiShorten(options: TextOptions)`](#most-text-commands)                                                                        | Shortens the selected text                                                                                                           |
| [`aiSimplify(options: TextOptions)`](#most-text-commands)                                                                       | Rephrases your text in simplified words                                                                                              |
| [`aiSummarize(options: TextOptions)`](#most-text-commands)                                                                      | Summarizes your text                                                                                                                 |
| [`aiTextPrompt(options: TextOptions)`](#most-text-commands)                                                                     | Runs your custom prompt                                                                                                              |
| [`aiTldr(options: TextOptions)`](#most-text-commands)                                                                           | Creates a "Too Long; Didn't Read" version text                                                                                       |
| [`aiTranslate(language: Language, options: TextOptions)`](#aitranslate)                                                         | Translates the selected text into the specified language                                                                             |
| **Utility**                                                                                                                     |
| [`aiAccept(options: AcceptOptions)`](/content-ai/capabilities/generation/text-generation/manage-responses#aiaccept)             | [Accept the generated response](/content-ai/capabilities/generation/text-generation/manage-responses), and insert it into the editor |
| [`aiReject(options: RejectOptions)`](/content-ai/capabilities/generation/text-generation/manage-responses#aireject)             | [Reject the generated Response](/content-ai/capabilities/generation/text-generation/manage-responses), resetting ai.storage state    |
| [`aiRegenerate(options: RegenerateOptions)`](/content-ai/capabilities/generation/text-generation/manage-responses#airegenerate) | [Regenerate a response](/content-ai/capabilities/generation/text-generation/manage-responses) using the same parameters              |

### Most text commands

Most of the text commands accept the same options and their usage is similar. The following example demonstrates how to use the `aiBloggify` command:

\`\`\`js
editor.chain().focus().aiBloggify(options: TextOptions)
\`\`\`

### aiAdjustTone

\`\`\`js
// Tone: 'default' | 'academic' | 'business' | 'casual' | 'childfriendly' | 'confident' | 'conversational' | 'creative' | 'emotional' | 'excited' | 'formal' | 'friendly' | 'funny' | 'humorous' | 'informative' | 'inspirational' | 'memeify' | 'narrative' | 'objective' | 'persuasive' | 'poetic' | string
editor.chain().focus().aiAdjustTone(tone: Tone, options: TextOptions).run()
\`\`\`

### aiTranslate

Translates the selected text content into the given output language.

It accepts two letter ISO 639-1 language codes.

\`\`\`js
// Language: 'en' | 'de' | 'nl' | ...
editor.chain().focus().aiTranslate(language: Language, options: TextOptions).run()
\`\`\`

## Text command options

On every command which supports `TextOptions`, you’re able to specify the following options:

| Setting          | Type                                                                   | Default         | Definition                                                                                                                                                                                                                 |
| ---------------- | ---------------------------------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelName`      | see [Supported text models](#supported-text-models)                    | `gpt-3.5-turbo` | The model used at OpenAI                                                                                                                                                                                                   |
| `format`         | `'rich-text' \| 'plain-text'`                                          | `plain-text`    | Determines the [format](/content-ai/capabilities/generation/text-generation/format) of how the model should respond                                                                                                        |
| `stream`         | `boolean`                                                              | `false`         | Should the command stream characters to the editor? It’s like the **typewriter** behavior in ChatGPT. **This requires the newest extension version!**                                                                      |
| `insertAt`       | `undefined \| number \| {from: number; to: number}`                    | `undefined`     | Where to insert the response into the editor, if `undefined` the response will be inserted at the current selection. If a number, the response will be inserted at that position. If an object it will replace that range. |
| `language`       | `string` (e.g. `en`, `de`)                                             | `null`          | Although we do our best to prompt OpenAI for a response in the language of the input, sometimes it’s better to define it yourself.                                                                                         |
| `tone`           | `string`                                                               | `null`          | A [voice of tone](#ai-adjust-tone) the response should be transformed to                                                                                                                                                   |
| `textLength`     | `number`                                                               | `undefined`     | The number of `textLengthUnit`s the AI should respond with (e.g. the `3` in "3 paragraphs")                                                                                                                                |
| `textLengthUnit` | `'paragraphs' \| 'words' \| 'characters'`                              | `undefined`     | The unit of `textLength`s the AI should respond with (e.g. the `paragraphs` in "3 paragraphs")                                                                                                                             |
| `collapseToEnd`  | `boolean`                                                              | `true`          | Whether the cursor should be set to the end after the operation or the insertion should get selected.                                                                                                                      |
| `context`        | `Array<{ type: 'text', text: string} \| { type: 'url', url: string }>` | `[]`            | [Context](/content-ai/capabilities/generation/text-generation/provide-context) to provide the model for generating a Response.                                                                                             |
| `text`           | `string`                                                               | `undefined`     | An optional message to have the model respond to                                                                                                                                                                           |
| `insert`         | `boolean`                                                              | `true`          | Allows disabling inserting content directly into the editor                                                                                                                                                                |
| `append`         | `boolean`                                                              | `true`          | If `true`, the response will be appended to the end of the current selection. If `false`, the response will replace the current selection.                                                                                 |

_Unfortunately the combination of **tone** and **language** sometimes leads to responses which are not in the desired language._

### Supported text models

We currently support the following OpenAI chat models:

- `gpt-4o`
- `gpt-4o-2024-05-13`
- `gpt-4`
- `gpt-4-turbo-preview`
- `gpt-4-0125-preview`
- `gpt-4-1106-preview`
- `gpt-4-0613`
- `gpt-4-32k`
- `gpt-4-32k-0613`
- `gpt-3.5-turbo-0125`
- `gpt-3.5-turbo`
- `gpt-3.5-turbo-1106`
- `gpt-3.5-turbo-16k`

## Choose the right Model

When configuring the Tiptap AI extension, consider the specific needs of your application:

- **For Cost-Effective Operations:** Opt for GPT-3 or DALL-E 2 if the primary concern is budget and the tasks do not demand the most advanced capabilities.
- **For Advanced Requirements:** Choose GPT-4o or DALL-E 3 when your application requires the highest level of language understanding or image generation quality, and budget is less of a constraint.

The Tiptap AI extension's flexible configuration allows you to tailor the AI integration to match your specific requirements and budgetary considerations.

_Note: The pricing details are not provided here due to variability and the need for up-to-date information. It's recommended to refer to the official OpenAI pricing page for the latest figures._

```

# content-ai\capabilities\generation\text-generation\custom-commands.mdx

```mdx
---
title: Register a custom command and prompt
meta:
  title: Custom command | Tiptap Content AI
  description: Extend the AI extension to create a custom editor command and prompt for your Tiptap editor. Learn more in the docs!
  category: Content AI
---

To register your own AI commands, simply extend the AI Generation extension, add your command in `addCommands()` (don't forget to inherit the predefined commands in `this.parent?.()`), and execute `aiTextPrompt()` to run your individual prompt.

Please note that this example uses your prompt on the client-side, which means that users could read it. If you're looking to use a custom Language Model (LLM) or a prompt on your backend, please refer to the [example provided here](/content-ai/custom-llms).

\`\`\`js
import { Ai, getHTMLContentBetween } from '@tiptap-pro/extension-ai'

// … other imports

// Declare typings if TypeScript is used:
//
// declare module '@tiptap/core' {
//   interface Commands<ReturnType> {
//     ai: {
//       aiCustomTextCommand: () => ReturnType,
//     }
//   }
// }

const AiExtended = Ai.extend({
  addCommands() {
    return {
      ...this.parent?.(),

      aiCustomTextCommand:
        () =>
        ({ editor, state }) => {
          const { from, to } = state.selection
          const selectedText = getHTMLContentBetween(editor, from, to)

          return editor.commands.aiTextPrompt({
            text: `Translate the following text to French and add some emojis: ${selectedText}`,
          })
        },
    }
  },
})

// … this is where you initialize your Tiptap editor instance and register the extended extension

const editor = new Editor{
  extensions: [
    StarterKit,
    AiExtended.configure({
      /* … */
    }),
  ],
  content: '',
})

// … use this to run your new command:
// editor.chain().focus().aiCustomTextCommand().run()
\`\`\`

```

# content-ai\capabilities\generation\text-generation\format.mdx

```mdx
---
title: Rich text AI responses
meta:
  title: Format | Tiptap Content AI Docs
  description: Enable AI to automatically format generated content in your Tiptap editor with rich text, lists, and more. Learn how in our docs!
  category: Content AI
---

import { CodeDemo } from '@/components/CodeDemo'

<CodeDemo isPro path="/Extensions/AiFormattedResponse" />

With the `format: 'rich-text'` option, you can generate AI responses that apply formatting to the content. This is especially useful when you want to generate content that includes rich text formatting like bold, italic, links, and more.

\`\`\`ts
// Steams the response as rich text into the editor
editor
  .chain()
  .aiTextPrompt({
    text: 'Write a list of popular programming languages',
    stream: true,
    format: 'rich-text',
  })
  .run()
\`\`\`

```

# content-ai\capabilities\generation\text-generation\index.mdx

```mdx
---
title: Integrate Content AI text commands
meta:
    title: Text commands | Tiptap Content AI Docs
    description: Pick from preconfigured Content AI text commands and learn how to extend them with context and custom prompts. More in the docs!
    category: Editor
---


```

# content-ai\capabilities\generation\text-generation\manage-responses.mdx

```mdx
---
title: Store and regenerate responses
meta:
  title: Manage responses | Tiptap Content AI
  description: Use the Content AI storage to save, regenerate and insert AI responses into your Tiptap editor. More in our docs!
  category: Content AI
---

import { CodeDemo } from '@/components/CodeDemo'

The AI Generation extension stores the current state in it’s extension storage under `editor.storage.ai || editor.storage.aiAdvanced` (depending on if you are using the extension-ai or extension-ai-advanced extension). This storage is used to keep track of the current state of the AI response, as well as any past responses.

<CodeDemo isPro path="/Extensions/AiStorage" />

| key           | type                                                                                    | definition                                                                                                                                                                                                                                                                                                   |
| ------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| state         | `'loading' \| 'error' \| 'idle'`                                                        | While the AI is generating a response, the state is set to `loading`. After the response is generated, the state is set to `idle`. When there is an error, the state is set to `error`                                                                                                                       |
| response      | `string \| undefined`                                                                   | The most recent message generated by the AI. When `idle`, if this is a string, it is the previous generated message, if `undefined`, no message has been generated. When `loading`, this will be a string of what the AI has generated so far (if streaming the response). When `error`, this is `undefined` |
| error         | `Error \| undefined`                                                                    | The error generated, only ever set in the error state                                                                                                                                                                                                                                                        |
| generatedWith | `{ action: TextAction; options: TextOptions; range: undefined \| Range; } \| undefined` | The options that describe what the last generated response was generated with range is only ever set if inserting the content into the editor                                                                                                                                                                |
| pastResponses | `string[]`                                                                              | Stores previously generated responses (on success), most recent first. Cleared when the response is accepted/rejected.                                                                                                                                                                                       |

You can use this storage to read out the current state of AI responses like:

\`\`\`ts
const aiStorage = editor.storage.ai || editor.storage.aiAdvanced

if (aiStorage.response.state === 'error') {
  // The error that occurred
  aiStorage.response.error
}

if (aiStorage.response.state === 'loading') {
  // The message that is currently being processed
  aiStorage.response.message
}

if (aiStorage.response.state === 'idle') {
  if (aiStorage.response.message) {
    // The successful response
    aiStorage.response.message
  } else {
    // No response has been requested yet
  }
}
\`\`\`

## Using AI Storage

Want to leverage the Tiptap Content AI's ability to generate results but, not have the results available outside of the editor? You can use `insert: false` on any AI [TextOption](/content-ai/capabilities/generation/text-generation/built-in-commands#text-command-options) and it will store the result into the extension.

\`\`\`ts
const chatMessage = 'Hello, how are you?'

editor
  .chain()
  .aiTextPrompt({
    text: chatMessage,
    stream: true,
    insert: false,
    format: 'rich-text',
  })
  .run()
\`\`\`

From there, you can use the `aiAccept`, `aiReject`, and `aiRegenerate` commands

### aiAccept

This command is meant to be ran when the user has accepted the AI response, it will insert the response into the editor by default and it’s behavior changes depending on the provided options.

| key      | type                                     | definition                                                                                                                                                                                                               |
| -------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| insertAt | `number \| { from: number, to: number }` | When a `number`, accept the response and insert it into the start of the editor. When `{ from: number, to: number }`, accept the response and replace the content from position from to position to with the AI response |
| append   | `boolean`                                | If `true`, instead of replacing the current selection, append to it                                                                                                                                                      |

The default behavior with no provided options is to, accept the response and insert it into the editor, replacing the current selection

\`\`\`ts
// Accept the response and insert it into the editor
editor.chain().aiAccept().run()

// Accept the response and insert it into the editor at the start
editor.chain().aiAccept({ insertAt: 0 }).run()

// Accept the response and insert it into the editor at the end
editor.chain().aiAccept({ insertAt: editor.state.doc.content.size }).run()

// Accept the response and append it to the current selection
editor.chain().aiAccept({ append: true }).run()
\`\`\`

### aiRegenerate

This command is meant to be ran when the user wants the to retry the AI response, it will use all the same options as the previous AI text operation and add to the `(editor.storage.ai || editor.storage.aiAdvanced).pastResponses` array

| key      | type                                     | definition                                                                                                                                                                                                                                                                                                                   |
| -------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| insert   | `boolean`                                | Whether to insert the regenerated response into the editor                                                                                                                                                                                                                                                                   |
| insertAt | `number \| { from: number, to: number }` | If not specified,the regenerated response will be inserted where the previous response was. When a `number`, regenerate the response and insert it into the start of the editor. When `{ from: number, to: number }`, regenerate the response and replace the content from position from to position to with the AI response |

The default behavior with no provided options is to, regenerate the response and insert it into the editor, replacing the current selection

\`\`\`ts
// Regenerate the response and insert it into the editor
editor.chain().aiRegenerate().run()

// Regenerate the response and insert it into the editor at the start
editor.chain().aiRegenerate({ insertAt: 0 }).run()

// Regenerate the response and insert it into the editor at the end
editor.chain().aiRegenerate({ insertAt: editor.state.doc.content.size }).run()

// Regenerate the response and append it to the current selection
editor.chain().aiRegenerate({ append: true }).run()
\`\`\`

### aiReject

This command is meant to be ran when the user has rejected the AI response, it will reset the extension’s state to the initial idle state and clear all `(editor.storage.ai || editor.storage.aiAdvanced).pastResponses`

| key  | type               | definition                                                                                          |
| ---- | ------------------ | --------------------------------------------------------------------------------------------------- |
| type | 'reset' \| 'pause' | Whether to reset the AI to the idle state. Or just pause the current response. Default is `'reset'` |

\`\`\`ts
editor.chain().aiReject().run()

// Will not clear out editor.storage.ai || editor.storage.aiAdvanced, useful for keeping current response in the editor storage
editor.chain().aiReject({ type: 'pause' }).run()
\`\`\`

## Advanced Example

One use-case of extension storage could be to render a preview of the AI generated content.

To render a preview of what a chat would look like in your editor, we can use your editor’s schema to generate the html that would be generated. With this HTML you can display a preview of that content in an element

\`\`\`tsx
// Display the response as HTML
import { tryParseToTiptapHTML } from '@tiptap-pro/extension-ai'

// try to parse the current message as HTML, and null if it could not be parsed
tryToParseToHTML((editor.storage.ai || editor.storage.aiAdvanced).response.message, editor)

// try to parse a previous response as HTML, and null if it could not be parsed
tryToParseToHTML((editor.storage.ai || editor.storage.aiAdvanced).pastResponses[0], editor)

// For example in React
function PreviewComponent({ editor }) {
  const htmlResponse = tryToParseToHTML(
    (editor.storage.ai || editor.storage.aiAdvanced).response.message,
    editor,
  )
  /* This is safe since we've parsed the content with prose-mirror first */
  return <div dangerouslySetInnerHTML={{ __html: htmlResponse }}></div>
}
\`\`\`

See our demo below for a full example of how a chat preview could work.

<CodeDemo isPro path="/Extensions/AiPrompt" />

```

# content-ai\capabilities\generation\text-generation\provide-context.mdx

```mdx
---
title: Provide more context to your prompts
meta:
    title: Context | Tiptap Content AI
    description: Add more context to your prompts and editor commands to fine-tune your AI's response. Learn more in our docs.
    category: Content AI
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

With the `context` option, you can provide additional information to the AI model to help it generate more relevant content. This can be useful when you want to generate content that is more aligned with the context of the conversation.

<CodeDemo isPro path="/Extensions/AiContext" />

## Context option

Context can be provided in two formats, `text` and `url`. The `text` format is used to provide additional text context to the AI model, while the `url` format is used to provide a URL context.

<Callout title="URL requirements" variant="warning">
    The url provided must be a valid URL that is accessible by Tiptap Content AI. This is useful when
    you want to provide additional context to the AI model that is referencing a third-party source.
</Callout>

\`\`\`ts
// Steams the response as rich text into the editor
editor
  .chain()
  .aiTextPrompt({
    text: 'What does Alice do for a living?',
    stream: true,
    format: 'rich-text',
    context: [
      { type: 'text', text: 'John & Alice are a software engineers.' },
      { type: 'url', url: 'https://company.example.com/team' },
    ],
  })
  .run()
\`\`\`

```

# content-ai\capabilities\generation\text-generation\stream.mdx

```mdx
---
title: Stream content into the editor
meta:
  title: Stream Content | Tiptap Content AI
  description: Low-level API for streaming content directly into the editor content. Learn more in our docs.
  category: Content AI
---

import { Callout } from '@/components/ui/Callout'

The `streamContent` command is a low-level API to stream content into the editor. It supports both appending content and replacing a specified range of content. This command is useful when you need to stream something like an LLM model response into the editor.

<Callout title="Advanced Integration">
  This command is useful for advanced integrations where you need to stream content into the editor
  from a URL or a response body.
</Callout>

### Parameters

**range**: Either a single position to insert from or an object specifying the range to replace, with `from` and `to` properties. <br/>
**callback**: An asynchronous function that receives a write function to stream content into the editor.

### `callback` Arguments

**getWritableStream**: A function that returns a writable stream object that can be used to write chunks of data into the editor. <br/>
**write**: A function that takes an object with the following properties:

- `partial`: The content to insert into the editor.
- `transform`: An optional function that takes an object with the following properties:
  - `buffer`: The accumulated content of the stream.
  - `partial`: The current partial content.
  - `editor`: The editor instance.
  - `defaultTransform`: The default transform function. This function takes the accumulated content and inserts it into the editor.
- `appendToChain`: An optional function which can be used to append commands to the chain.

## Example Usage

### Using the `write` API

This example shows the flexibility of the `streamContent` command by fetching a large data stream from a URL and streaming it chunk-by-chunk into the editor.

\`\`\`ts
editor.commands.streamContent({ from: 0, to: 10 }, async ({ write }) => {
  const response = await fetch('https://example.com/stream')
  const reader = response.body?.getReader()
  const decoder = new TextDecoder('utf-8')

  if (!reader) {
    throw new Error('Failed to get reader from response body.')
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    write({ partial: chunk })
  }
})
\`\`\`

### Using the `getWritableStream` API

This example demonstrates an alternative way to stream content using a `WritableStream` object which can be used to write chunks of data into the editor.

\`\`\`ts
editor.commands.streamContent({ from: 0, to: 10 }, async ({ getWritableStream }) => {
  const response = await fetch('https://example.com/stream')
  // This will pipe the response body content directly into the editor
  await response.body?.pipeTo(getWritableStream())
})
\`\`\`

### Using transformations

You can also use the `transform` function to modify the content before streaming it into the editor. This example demonstrates how to transform the content before streaming it into the editor.

\`\`\`ts
editor.commands.streamContent({ from: 0, to: 10 }, async ({ write }) => {
  const response = await fetch('https://example.com/stream')
  const reader = response.body?.getReader()
  const decoder = new TextDecoder('utf-8')

  if (!reader) {
    throw new Error('Failed to get reader from response body.')
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })

    write({
      partial: transformedChunk,
      transform: ({ buffer, partial, editor, defaultTransform }) => {
        // This will use the default transform function to take the whole buffer and insert it into the editor as uppercase
        return defaultTransform(buffer.toUpperCase())
      },
    })
  }
})
\`\`\`

**Use case:** Parsing markdown content from a URL and streaming it into the editor.

\`\`\`ts
import { marked } from 'marked'

editor.commands.streamContent({ from: 0, to: 10 }, async ({ write }) => {
  const response = await fetch('https://example.com/stream')
  const reader = response.body?.getReader()
  const decoder = new TextDecoder('utf-8')

  if (!reader) {
    throw new Error('Failed to get reader from response body.')
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })

    write({
      partial: chunk,
      transform: ({ buffer, partial, editor, defaultTransform }) => {
        // This will parse the markdown content into an HTML string and insert it into the editor
        return defaultTransform(marked.parse(buffer))
      },
    })
  }
})
\`\`\`

### Using `appendToChain` option

The `appendToChain` function allows you to append commands to the chain before it is executed. This example demonstrates how to append a command to the chain before it is executed.

\`\`\`ts
import { selectionToInsertionEnd } from '@tiptap/core'

editor.commands.streamContent({ from: 0, to: 10 }, async ({ write }) => {
  write({
    partial: token,
    appendToChain: (chain) =>
      chain
        // Move the selection to the end of the inserted content
        .command(({ tr }) => {
          selectionToInsertionEnd(tr, tr.steps.length - 1, -1)
          return true
        })
        // Scroll the editor to the end of the inserted content
        .scrollIntoView(),
  })
})
\`\`\`

### Using `respondInline` option of `streamContent`

By default `respondInline` is `true`. When inserting block content into the editor, sometimes you may want to insert it as a sibling instead of as a block directly. You can use the `respondInline` option to insert the content at the same depth as the `from` position.

\`\`\`ts
editor.commands.setContent('<p>123</p>')
editor.commands.streamContent(
  4,
  async ({ write }) => {
    await new Promise((resolve) => {
      setTimeout(() => resolve(), 10)
    })
    write({ partial: '<p>hello ' })
    await new Promise((resolve) => {
      setTimeout(() => resolve(), 10)
    })
    write({ partial: 'world</p><p>ok</p>' })
  },
  { respondInline: true },
)
// Output: <p>123hello world</p><p>ok</p>
// As opposed to: <p>123</p><p>hello work</p><p>ok</p> when `respondInline` is `false`
\`\`\`

## Technical details

Here is the full TypeScript definition for the `streamContent` command:

\`\`\`ts
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    streamContent: {
      streamContent: (
        /**
         * The position to insert the content at.
         */
        position: number | Range,
        /**
         * The callback to write the content into the editor.
         */
        callback: (options: StreamContentAPI) => Promise<any>,
        /**
         * The options to pass to the `insertContentAt` command.
         */
        options?: {
          parseOptions?: NonNullable<
            Parameters<RawCommands['insertContentAt']>['2']
          >['parseOptions']
          /**
           * This will insert the content at the same depth as the `from` position.
           * Effectively, this will insert the content as a sibling of the node at the `from` position.
           * @default true
           */
          respondInline?: boolean
        },
      ) => ReturnType
    }
  }
}

type StreamContentAPI = {
  /**
   * The function to write content into the editor.
   */
  write: (ctx: {
    /**
     * The partial content of the stream to insert.
     */
    partial: string
    /**
     * This function allows you to transform the content before inserting it into the editor.
     * It must return a Prosemirror `Fragment` or `Node`.
     */
    transform?: (ctx: {
      /**
       * The accumulated content of the stream.
       */
      buffer: string
      /**
       * The current partial content of the stream.
       */
      partial: string
      editor: Editor
      /**
       * Allows you to use the default transform function.
       */
      defaultTransform: (
        /**
         * The content to insert as an HTML string.
         * @default ctx.buffer
         */
        htmlString?: string,
      ) => Fragment
    }) => Fragment | Node | Node[]
    /**
     * Allows you to append commands to the chain before it is executed.
     */
    appendToChain?: (chain: ChainedCommands) => ChainedCommands
  }) => {
    /**
     * The buffer that is being written to.
     */
    buffer: string
    /**
     * The start of the inserted content in the editor.
     */
    from: number
    /**
     * The end of the inserted content in the editor.
     */
    to: number
  }
  /**
   * A writable stream to write content into the editor.
   * @example fetch('https://example.com/stream').then(response => response.body.pipeTo(ctx.getWritableStream()))
   */
  getWritableStream: () => WritableStream
}
\`\`\`

```

# content-ai\capabilities\suggestion\api-reference.mdx

```mdx
---
title: AI Suggestion extension API reference
meta:
  title: API Reference | Tiptap AI Suggestion
  description: API reference for the Tiptap AI Suggestion extension.
  category: Content AI
---

## Extension Options

\`\`\`ts
/**
 * Configuration options for the AI Suggestion extension.
 */
export interface AiSuggestionOptions {
  /** Rules to be applied during proofreading
   * @default []
   */
  rules: AiSuggestionRule[]
  /** Initial suggestions to display before any proofreading is done
   * @default []
   */
  initialSuggestions: Suggestion[]
  /** Initial rejections to apply before any proofreading is done
   * @default []
   */
  initialRejections: AiSuggestionRejection[]
  /** Function to customize the decoration of suggestions in the editor
   * @default `getDefaultDecorations()`
   * @param args - Options for customizing suggestion decorations.
   * @return An array of `Decoration` objects.
   */
  getCustomSuggestionDecoration: (args: GetCustomSuggestionDecorationOptions) => Decoration[]
  /** Time in milliseconds to wait before reloading suggestions after content changes.
   * @default 800
   */
  debounceTimeout: number
  /** Whether to load suggestions when the editor is initialized
   * @default true
   */
  loadOnStart: boolean
  /** Whether to reload suggestions when the editor content changes
   * @default true
   */
  reloadOnUpdate: boolean
  /** Callback for handling errors when loading suggestions
   * @param error - The error that occurred during suggestion loading.
   * @default console.error
   */
  onLoadSuggestionsError: (error: unknown) => void
  /**
   * The AI model used to proofread the content and generate suggestions.
   * @default "gpt-4o-mini"
   */
  modelName: AiSuggestionModelName
  /**
   * Function to load suggestions from an external source, based
   * on the current editor content and rules. Lets you analyze the
   * content with your own AI model and return suggestions.
   *
   * @param options - Options for resolving suggestions.
   * @return A list of suggestions that should be applied.
   */
  resolver: (options: AiSuggestionCustomResolverOptions) => Promise<Suggestion[]>
  /**
   * The Tiptap AI app ID.
   */
  appId: string
  /**
   * The Tiptap AI token.
   */
  token: string
  /**
   * The base URL for the Tiptap AI API.
   */
  baseUrl: string
}
\`\`\`

## Extension Commands

\`\`\``ts
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    aiSuggestion: {
      /**
       * Load AI suggestions immediately.
       *
       * @param rules Custom rules to use for the suggestions. If not provided,
       * the rules defined in the extension options will be used.
       */
      loadAiSuggestions: (rules?: AiSuggestionRule[]) => ReturnType
      /**
       * Load AI suggestions after a debounce timeout defined in the
       * extension options.
       *
       * @param rules Custom rules to use for the suggestions. If not provided,
       * the rules defined in the extension options will be used.
       */
      loadAiSuggestionsDebounced: (rules?: AiSuggestionRule[]) => ReturnType
      /**
       * Set the AI suggestions to be displayed.
       *
       * @param suggestions The suggestions to be displayed.
       */
      setAiSuggestions: (suggestions: Suggestion[]) => ReturnType
      /**
       * Set a suggestion as selected. The selected suggestion will have a
       * different style in the editor.
       * */
      selectAiSuggestion: (suggestionId: string) => ReturnType
      /**
       * Apply a suggestion to the editor, modifying its content.
       *
       * @param options The id of the suggestion and the selected replacement
       * option. If the replacement option is not provided, the first option
       * will be used. The format of the replaced content can also be
       * customized.
       */
      applyAiSuggestion: (options: ApplyAiSuggestionOptions) => ReturnType
      /**
       * Marks a suggestion as rejected, removing it from the list of suggestions.
       *
       * @param suggestionId The id of the rejected suggestion
       */
      rejectAiSuggestion: (suggestionId: string) => ReturnType

      /**
       * Sets the suggestions to be rejected. This command is useful for undoing
       * rejections or for clearing all rejections.
       *
       * @param rejections The rejections to be set.
       */
      setAiSuggestionRejections: (rejections: AiSuggestionRejection[]) => ReturnType

      /**
       * Applies all Ai Suggestions that have not been rejected. Applies
       * the first replacement option for each suggestion.
       */
      applyAllAiSuggestions: (options?: ApplyAllAiSuggestionOptions) => ReturnType
      /**
       * Sets the AI suggestion rules. Lets you update the rules used for
       * proofreading without having to reload the editor.
       *
       * This command does not reload the suggestions. To reload the suggestions
       * with the new rules, call the `loadAiSuggestions` command, like this:
       *
       * \`\`\`js
       * editor.chain().setAiSuggestionRules(newRules).loadAiSuggestions().run()
       * \`\`\`
       */
      setAiSuggestionRules: (rules?: AiSuggestionRule[]) => ReturnType
    }
  }
}

export interface ApplyAiSuggestionOptions {
  /**
   * The suggestion identifier to be applied. If the suggestion is not found, the
   * method will do nothing.
   */
  suggestionId: string
  /**
   * The replacement option identifier to be applied. If `undefined`,
   * the method will default to the first replacement option.
   */
  replacementOptionId?: string
  /**
   * Determines how the suggestion will applied
   * If `rich-text`, the suggestion will be formatted as HTML.
   * If `plain-text`, the suggestion will be formatted as plain text.
   * @default "plain-text"
   */
  format?: 'rich-text' | 'plain-text'
}

export interface ApplyAllAiSuggestionOptions {
  /**
   * Determines how the suggestion will applied
   * If `rich-text`, the suggestion will be formatted as HTML.
   * If `plain-text`, the suggestion will be formatted as plain text.
   * @default "plain-text"
   */
  format?: 'rich-text' | 'plain-text'
}
\`\`\``

## Extension Storage

\`\`\`ts
/**
 * Internal storage for the AI Suggestion extension.
 */
export interface AiSuggestionStorage {
  /** Key for the ProseMirror plugin used by the extension */
  pluginKey: PluginKey<AiSuggestionProsemirrorPluginState>
  /** Rules to be applied during proofreading */
  rules: AiSuggestionRule[]
  /** Function to get the current suggestions */
  getSuggestions: () => Suggestion[]
  /** Function to get the rejected suggestions */
  getRejections: () => AiSuggestionRejection[]
  /** Function to get the currently selected suggestion */
  getSelectedSuggestion: () => Suggestion | null
  /** Whether suggestions are currently being loaded */
  isLoading: boolean
  /** Whether suggestions have been loaded at least once */
  firstLoad: boolean
  /** Error that occurred during the last load attempt, if any */
  error: unknown | null
  /** Debounced function for loading suggestions */
  debouncedFunction: DebouncedFunction<(rules?: AiSuggestionRule[]) => void>
  /** Controller to abort loading suggestions */
  abortController: AbortController
}

/**
 * Arguments for creating decoration for suggestions in the editor.
 */
export interface GetCustomSuggestionDecorationOptions {
  /** The suggestion being decorated */
  suggestion: Suggestion
  /** Whether this suggestion is currently selected */
  isSelected: boolean
  /** Function to get the default decoration styles provided by the extension */
  getDefaultDecorations: () => Decoration[]
}
\`\`\`

## Extension types

### Rules

\`\`\`ts
/**
 * A rule to be applied during proofreading.
 */
export interface AiSuggestionRule {
  /**
   * Unique identifier for the rule.
   */
  id: string
  /**
   * The title of the rule. Will not be used for proofreading, but for display
   * purposes.
   */
  title: string
  /**
   * The prompt of the rule. Will be sent to the AI model for proofreading.
   */
  prompt: string
  /**
   * The color of the rule. Will be used to underline the content that must
   * be replaced to apply the rule.
   */
  color: string
  /**
   * The background color of the rule. Will be used to highlight the content
   * when the suggestion is selected.
   */
  backgroundColor: string
  /**
   * Extra metadata for the rule, that can be used to store additional
   * information about it (e.g. its source or its category). It is not used
   * internally by the extension but it may help developers customize how a
   * rule is displayed in the UI.
   */
  metadata?: any
}
\`\`\`

### Proofreading Suggestions

\`\`\`ts
import { Range } from '@tiptap/core'
import { Slice } from '@tiptap/pm/model'

import { AiSuggestionRule } from './ai-suggestion-rule'

/**
 * A replacement option for a suggestion. It contains the text to be added and
 * the slice to be replaced.
 */
export interface AiSuggestionReplacementOption {
  id: string
  /**
   * The text to be added when the replacement format is `plain-text`.
   */
  addText: string
  /**
   * The content to be added when the replacement format is `rich-text`.
   */
  addSlice: Slice
}

/**
 * A suggestion from the AI Suggeston extension. It contains the range to be replaced,
 * the text to be deleted, the replacement options, and the rule that must be
 * applied.
 *
 * A suggestion can have multiple replacement options. The user can choose one
 * of them to apply the suggestion.
 */
export interface Suggestion {
  /**
   * A unique identifier for the suggestion.
   */
  id: string
  /**
   * The range of content from the editor that should be replaced.
   */
  deleteRange: Range
  /**
   * The text to be deleted from the editor, in plain text format
   */
  deleteText: string
  /**
   * The content to be deleted from the editor, as a Prosemirror slice.
   */
  deleteSlice: Slice
  /**
   * Multiple replacement options for the suggestion. The user can choose one
   * of them to apply the suggestion.
   */
  replacementOptions: AiSuggestionReplacementOption[]
  /**
   * The proofreading rule that is followed by applying this suggestion.
   */
  rule: AiSuggestionRule
  /**
   * Whether the suggestion was rejected by the user.
   */
  isRejected: boolean
  /**
   * Extra metadata for the suggestion, that can be used to store additional
   * information about it (e.g. its source or its category). It is not used
   * internally by the extension but it may help developers customize how a
   * suggestion is displayed in the UI.
   */
  metadata?: any
}
\`\`\`

### Rejected Suggestions

\`\`\`ts
import { AiSuggestionRule } from './ai-suggestion-rule'

/**
 * Represents a rejected suggestion. These are stored in the AI Suggestion extension's
 * storage so that the suggestion is not generated again.
 */
export interface AiSuggestionRejection {
  /**
   * The rule of the suggestion that was rejected.
   */
  rule: AiSuggestionRule
  /**
   * The text that was about to be deleted by the rejected suggestion.
   */
  deleteText: string
}
\`\`\`

```

# content-ai\capabilities\suggestion\configure.mdx

```mdx
---
title: AI Suggestion extension configuration options
meta:
  title: Configure AI Suggestion | Tiptap AI Suggestion
  description: Configure the AI Suggestion extension with rules, initial suggestions, and custom styles.
  category: Content AI
---

The AI Suggestion extension for Tiptap accepts different settings to configure the global behavior of the extension and the commands.

## Rules

An array of rules to be applied during proofreading. Each rule contains

- A unique `id`
- The `prompt` property, a text that will be read by the AI model to generate suggestions
- Parameters that decide how the rule is displayed in the UI, like `title`, `color` and `backgroundColor`

You can change the rules at any time without having to reload the editor, by using the `setAiSuggestionRules` command

\`\`\`ts
AiSuggestion.configure({
  rules: [
    {
      id: '1',
      title: 'Spell Check',
      prompt: 'Identify and correct any spelling mistakes',
      color: '#DC143C',
      backgroundColor: 'FFE6E6',
    },
  ],
})
\`\`\`

You can learn more about rules in this guide: [Define rules](/content-ai/capabilities/suggestion/features/define-rules)

## Initial Suggestions

An array of initial suggestions to display before any proofreading is done. This can be used as a performance optimization to avoid waiting for the first suggestions to be generated.

\`\`\`ts
export const suggestions: Suggestion[] = [
  {
    id: '1',
    deleteRange: { from: 1, to: 5 },
    deleteText: 'Mistaek',
    replacementOptions: [
      {
        id: '1',
        addText: 'Mistake',
      },
    ],
    rule: {
      id: '1',
      title: 'Spell Check',
      prompt: 'Identify and correct any spelling mistakes',
      color: '#DC143C',
      backgroundColor: 'FFE6E6',
    },
    isRejected: false,
  },
]

AiSuggestion.configure({
  initialSuggestions: suggestions,
})
\`\`\`

To learn more about the data that a suggestion object should contain, check the [API reference](/content-ai/capabilities/suggestion/api-reference#proofreading-suggestions).

## Custom Suggestion Styles

The `getCustomSuggestionDecoration` function allows you to control the appearance of suggestions and provide visual cues to the user. You can add custom CSS classes to the suggestions, and add custom elements before and after them. This is useful for adding popovers, tooltips, icons, or other elements to the suggestions.

The custom styles and elements are implemented with the [Prosemirror Decorations API](https://prosemirror.net/docs/ref/#view.Decorations).

To learn how to show a popover when you select a suggestion, follow [this guide](/content-ai/capabilities/suggestion/features/display-suggestions#show-a-popover-when-you-select-a-suggestion).

\`\`\`ts
AiSuggestion.configure({
  getCustomSuggestionDecoration({ suggestion, isSelected, getDefaultDecorations }) {
    // You can combine the default decorations of the AI Suggestion extension with your custom ones
    const decorations = getDefaultDecorations()

    // Add a custom element before the suggestion text
    Decoration.widget(suggestion.deleteRange.from, () => {
      const element = document.createElement('span')
      element.textContent = '⚠️'
      return element
    })
    return decorations
  },
})
\`\`\`

## Customize When to Load Suggestions

By default, the AI Suggestion extension will automatically load suggestions when the editor is ready. You can disable this behavior with the `loadOnStart` option

\`\`\`ts
AiSuggestion.configure({
  loadOnStart: false,
})
\`\`\`

By default, the AI Suggestion extension will reload suggestions when the editor's content changes. You can disable this behavior with the `reloadOnUpdate` option.

\`\`\`ts
AiSuggestion.configure({
  reloadOnUpdate: false,
})
\`\`\`

You can learn to configure when to load suggestions in [this guide](/content-ai/capabilities/suggestion/features/configure-when-to-load-suggestions).

## Customize the Debounce Timeout

By default, the AI Suggestion extension will wait 800ms after the user stops typing to reload suggestions. This prevents the API from being called too frequently. You can configure this timeout with the `debounceTimeout` option.

\`\`\`ts
AiSuggestion.configure({
  debounceTimeout: 1000,
})
\`\`\`

## Handle Errors When Loading Suggestions

You can provide a callback for handling errors when loading suggestions. This allows you to log errors, display error messages to the user, or take other actions when an error occurs.

A complete guide on how to handle loading and error states in the UI can be found here:

\`\`\`ts
AiSuggestion.configure({
  onLoadSuggestionsError(error) {
    console.error('An error occurred while loading suggestions', error)
  },
})
\`\`\`

## Tiptap Content AI Cloud Options

If you do not [provide your own backend](/content-ai/capabilities/suggestion/custom-llms), the AI Suggestion extension will use the Tiptap Content AI cloud to generate suggestions.

You can configure the OpenAI model to use for generating suggestions with the `model` option. The default model is `gpt-4o-mini`. We recommend it for most use cases,
as it provides a good balance between speed, cost and accuracy.

\`\`\`ts
AiSuggestion.configure({
  // Your Tiptap Content AI app id
  appId: 'APP_ID_HERE',
  // This needs to be your generated JWT and MUST NOT be the OpenAI API key!
  token: 'YOUR_TOKEN',
  // The model to use for generating suggestions. Defaults to "gpt-4o-mini"
  model: 'gpt-4o',
})
\`\`\`

We currently support these OpenAI models:

- `gpt-4o`
- `gpt-4o-mini`

We will add support for more models in the next versions.

## Integrate Your Own Backend and LLMs

If you want to use your own backend and LLMs to generate suggestions, you can provide a custom `resolver` function. This function should return an array of suggestions based on the editor's content and rules.

You will find a more comprehensive guide on how to integrate your own backend and LLMs [in this guide](/content-ai/capabilities/suggestion/custom-llms).

\`\`\`ts
AiSuggestion.configure({
  resolver: async ({ content, rules }) => {
    // Your custom logic to generate suggestions
    return suggestions
  },
})
\`\`\`

```

# content-ai\capabilities\suggestion\custom-llms.mdx

```mdx
---
title: Integrate your custom backend and LLMs
meta:
  title: Custom LLM | Tiptap AI Suggestion
  description: Integrate your own backend and LLMs with the AI Suggestion extension for custom suggestions.
  category: Content AI
---

By default, the AI Suggestion extension uses the Tiptap Content AI Cloud to generate suggestions for your content. This lets you use its capabilities with minimal setup. However, you can integrate your own backend and LLMs to generate suggestions.

The AI Suggestion extension supports different degrees of customization. You can:

1. Use the Tiptap Content AI Cloud, but customize the OpenAI model.
2. Replace the API endpoint to get the suggestions data with your own LLM and backend, but let the extension handle how suggestions are displayed and applied. **This is the recommended approach** for most use cases, as we handle most of the complexity for you: comparing the old and new editor content, displaying the diff in a pleasant way, and handling conflicts.
3. Implement your own resolver function entirely. This gives you total flexibility to decide how suggestions are displayed in the editor. It is only recommended in advanced scenarios.

## Customize the OpenAI Model in Tiptap Cloud

You can configure the OpenAI model to use for generating suggestions with the `model` option. The default model is `gpt-4o-mini`. We recommend it for most use cases, as it provides a good balance between speed, cost and accuracy.

If you want to improve the suggestions' quality, you can use a larger model like `gpt-4o`. Bear in mind that larger models tend to be more expensive, slower, and have a higher latency.

\`\`\`ts
AiSuggestion.configure({
  // The model to use for generating suggestions. Defaults to "gpt-4o-mini"
  model: 'gpt-4o',
})
\`\`\`

## Replace the API Endpoint (Recommended)

If you want to use your own backend and LLMs to generate suggestions, you can provide a custom `apiResolver` function. This function should call your backend and return an array of suggestions based on the editor's content and rules.

\`\`\`tsx
AiSuggestion.configure({
  async resolver({ defaultResolver, ...options }) {
    const suggestions = defaultResolver({
      ...options,
      apiResolver: async ({ html, rules }) => {
        // Generate the response by calling your custom backend and LLMs
        const response = await claudeSonnetApi({ html, rules })

        // Return the response in the correct format (see details below)
        return { format: 'fullHtml', content: response }
      },
    })

    return suggestions
  },
})
\`\`\`

To provide maximum flexibility, the `apiResolver` accepts the response in two formats:

- `replacements`: The response is an array of replacements that will be applied to the editor's content. This is useful when you want to replace specific parts of the content with the suggestions. This is the format that we use with the Tiptap Content AI Cloud, which has given us the best results so far.

  Here is an example response in the `replacements` format.

  \`\`\`json
  {
    "format": "replacements",
    "content": {
      "items": [
        {
          "paragraph": 1,
          "ruleId": "2",
          "deleteHtml": "aplication",
          "insertHtml": "application"
        },
        {
          "paragraph": 2,
          "ruleId": "1",
          "deleteHtml": "Hola, estamos <bold>emocionados</bold> de tenerte aquí.",
          "insertHtml": "Hello, we are <bold>excited</bold> to have you here."
        },
        {
          "paragraph": 3,
          "ruleId": "2",
          "deleteHtml": "fetures",
          "insertHtml": "features"
        },
        {
          "paragraph": 3,
          "ruleId": "1",
          "deleteHtml": "Si tienes dudas, no dudes en preguntar.",
          "insertHtml": "If you have questions, do not hesitate to ask."
        }
      ]
    }
  }
  \`\`\`

- `fullHtml`: The response is a full HTML string that will replace the editor's content. This is useful when you want to replace the entire content with the suggestions. We've found this format to perform very well when there is only one rule to apply, but less so when there are multiple rules.

  \`\`\`json
  {
    "format": "fullHtml",
    "content": {
      "items": [
        {
          "ruleId": "1",
          "fullHtml": "<p>Hello, welcome to our awesome app! We hope you guys will love it. Our aplication offers unique features that enhance your cooking experience. You can explore various cuisines and share your food momentts.</p><p>Hello, we are excited to have you here. Our app is not just about recipes but also about building a community. We believe this will transform how you cook.</p><p>Please check out our cool fetures and enjoy cooking with us. If you have doubts, do not hesitate to ask.</p>"
        },
        {
          "ruleId": "2",
          "fullHtml": "<p>Hello, welcome to our awesome app! We hope you guys will love it. Our application offers unique features that enhance your cooking experience. You can explore various cuisines and share your food moments.</p><p>Hola, estamos emocionados de tenerte aquí. Our app is not just about recipes but also about building a community. We believe this will transform how you cook.</p><p>Please check out our cool features and enjoy cooking with us. Si tienes dudas, no dudes en preguntar.</p>"
        }
      ]
    }
  }
  \`\`\`

LLMs can make mistakes, so it can be difficult to ensure that the LLM response is in the desired format. To improve the accuracy and performance of your custom models, we recommend following these best practices and prompt engineering techniques.

- If you use the `replacements` format, you can use [OpenAI structured outputs](https://platform.openai.com/docs/guides/structured-outputs) (or the equivalent feature in other LLM providers) to ensure that the response is a JSON object that complies to a specific schema.
- If you use the `fullHml` format, you can use [OpenAI predicted outputs](https://platform.openai.com/docs/guides/predicted-outputs) (or the equivalent feature in other LLM providers) to improve the latency and speed of the model.
- Structure your prompt so that you can benefit from [partial caching](https://platform.openai.com/docs/guides/prompt-caching). Alternatively, you can implement your own caching mechanism so that you can reuse the LLM response for the same or similar prompts.
- LLM providers have official guides on [best practices](https://platform.openai.com/docs/guides/prompt-engineering), improving [latency](https://platform.openai.com/docs/guides/latency-optimization), and [accuracy](https://platform.openai.com/docs/guides/optimizing-llm-accuracy).
- Evaluate your custom endpoint's responses and measure their performance and accuracy. Use an evaluation framework like [Evalite](https://www.evalite.dev/). This will help you iterate on your prompt to improve it over time, and compare alternative prompts to see which one performs better.
- Different proofreading rules work best with different prompting approaches and response formats. You do not need to choose between the `replacements` or the `fullHtml` format. You can use both! Define an API endpoint that returns the suggestions in the `replacements` format, and another that generates them in the `fullHtml` format. Here is an example:

  \`\`\`tsx
  AiSuggestion.configure({
    async resolver({ defaultResolver, rules, ...options }) {
     // Split the rules into two groups
     const {
     rulesForFirstApi,
     rulesForSecondApi,
    } = splitRules(rules)

    // Send the first group of rules to the first api endpoint
      const suggestions1 = await defaultResolver({
        ...options,
        rules: rulesForFirstApiEndpoint
        apiResolver: async ({ html, rules }) => {
          const response = await firstApi({ html, rules });
          return { format: "replacements", content: response };
        },
      });

      // Send the second group of rules to the second api endpoint
      const suggestions2 = await defaultResolver({
        ...options,
        rules: rulesForSecondApiEndpoint
        apiResolver: async ({ html, rules }) => {
          const response = await secondApi({ html, rules });
          return { format: "fullHtml", content: response };
        },
      });

    // Merge both lists of suggestions
      return [...suggestions1, ...suggestions2]
    },
  \`\`\`

## Replace the Resolver Function Entirely (Advanced)

If you want to have total control over how the editor suggestions are generated, including their exact position in the document, you can do so by providing a custom `resolver` function. This function should return an array of suggestions based on the editor's content and rules.

To generate valid suggestion objects, your code needs to compute [their positions in the editor](https://prosemirror.net/docs/guide/#doc.indexing). This will most likely involve comparing the editor's current content with the content that has been generated by the LLM. To see an example on how to do this, you can check the default resolver function in the extension's source code.

To learn more about the data that each suggestion object should contain, check the [API reference](/content-ai/capabilities/suggestion/api-reference#proofreading-suggestions).

\`\`\`tsx
AiSuggestion.configure({
  async resolver({ defaultResolver, ...options }) {
    const suggestions = await customResolver(options)
    return suggestions
  },
})
\`\`\`

Overall, the approach of implementing your custom resolver will take more work to implement, but it will give you more flexibility. We only recommend it for advanced use cases.

## Combine the Tiptap Content AI Cloud With Your Own Backend

You do not have to choose between using the Tiptap Content AI Cloud or your own backend. You can combine the two, and get the best of both worlds.

\`\`\`tsx
AiSuggestion.configure({
  async resolver({ defaultResolver, rules, ...options }) {
    // Split the rules into two groups
    const { rulesForDefaultSuggestions, rulesForCustomSuggestions } = splitRules(rules)

    // Get suggestions from Tiptap Cloud API
    const defaultSuggestions = await defaultResolver({
      ...options,
      rules: rulesForDefaultSuggestions,
    })
    // Get suggestions from your own backend
    const customSuggestions = await customResolver({
      ...options,
      rules: rulesForCustomSuggestions,
    })

    // merge both lists of suggestions
    return [...defaultSuggestions, ...customSuggestions]
  },
})
\`\`\`

## Generate Proofreading Suggestions Without AI

You don’t need to use AI to generate proofreading suggestions. You can combine AI models with classic proofreading techniques. For example, you can check for certain words and replace them. Here is an example of a resolver that generates suggestions that replace the word “hello” with “goodbye”.

\`\`\`tsx
AiSuggestion.configure({
  rules: [
    {
      id: '1',
      title: 'Replace hello with goodbye',
      // The prompt will not be used because we do not use an LLM to generate suggestions for this rule
      prompt: 'Replace hello with goodbye',
      color: '#DC143C',
      backgroundColor: 'FFE6E6',
    },
  ],
  async resolver({ defaultResolver, ...options }) {
    const suggestions = await defaultResolver({
      ...options,
      apiResolver: async ({ html, rules }) => {
        // Generate the response without needing to call an LLM
        return {
          format: 'fullHtml',
          content: {
            items: [
              {
                ruleId: '1',
                // return the new document html after replacing "hello" with "goodbye"
                fullHtml: html.replaceAll('hello', 'goodbye'),
              },
            ],
          },
        }
      },
    })

    return suggestions
  },
})
\`\`\`

```

# content-ai\capabilities\suggestion\features\apply-suggestions.mdx

```mdx
---
title: Apply suggestions to the editor's content
meta:
  title: Apply Suggestions | Tiptap AI Suggestion
  description: Learn how to apply, reject, and highlight AI Suggestions in your Tiptap editor. More in the docs!
  category: Content AI
---

The AI Suggestion extension provides commands to apply suggestions to the editor's content. These commands allow you to accept or reject suggestions, and apply them to the editor's content.

## Apply a Single Suggestion

To apply a suggestion to the editor's content, use the `applyAiSuggestion` command.

A suggestion can have multiple replacement options. To apply a specific replacement option, provide the `replacementOptionId` property. If you do not provide this property, the first replacement option will be applied.

Note: if you use the Tiptap Content AI Cloud API to generate suggestions, there will be only one replacement option per suggestion. However, if you use your own backend and LLMs, you can provide multiple replacement options.

You can customize the format of the replacement text by providing the `format` property. The default format is "plain-text". If you want the replacement text to be formatted as rich text, use the "rich-text" format. This is useful when the suggestion modifies the styles, such as bold or italic formatting.

\`\`\`ts
editor.commands.applyAiSuggestion({
  suggestionId: '1',
  replacementOptionId: '1',
  format: 'plain-text',
})
\`\`\`

## Apply All Suggestions

To apply all suggestions at once, use the `applyAllAiSuggestions` command.

\`\`\`ts
editor.commands.applyAllAiSuggestions()
\`\`\`

This will apply the first replacement option of each suggestion to the editor's content.

If some suggestions overlap with each other, the AI Suggestion extension will automatically resolve the conflicts by ignoring the overlapping suggestions that are applied later. This is usually not a problem, as the suggestions are reloaded after each change, and the AI Suggestion extension will generate new suggestions based on the updated content.

## Reject a Suggestion

You can reject a suggestion by using the `rejectAiSuggestion` command.

\`\`\`ts
editor.commands.rejectAiSuggestion('suggestionId')
\`\`\`

When you reject a suggestion, it will not be displayed in the editor anymore. However, it will still be stored in the extension's storage object so you can retrieve it by calling `storage.getSuggestions()`. You can check if a suggestion is rejected by reading the `isRejected` property.

You can access the list of rejected suggestions by calling `storage.getRejections()`.

## Highlight Replaced Text After Applying a Suggestion

To highlight or add any mark to the text that was replaced by a suggestion, you can chain the `applyAiSuggestion` command with a command that sets the mark to the suggestion's range.

\`\`\`ts
editor
  .chain()
  // Apply suggestion
  .applyAiSuggestion({
    suggestionId: suggestion.id,
    replacementOptionId: option.id,
  })
  // Select the changed text
  .command(({ tr, commands }) => {
    // We need to map the positions of the change text, because they might have changed when applying the suggestion
    return commands.setTextSelection({
      from: tr.mapping.map(suggestion.deleteRange.from),
      to: tr.mapping.map(suggestion.deleteRange.to),
    })
  })
  // Apply styles to changed text. For example, bold styles
  .setBold()
  // Set the cursor at the end of the changed text.
  .command(({ tr, commands }) => {
    return commands.setTextSelection(tr.mapping.map(suggestion.deleteRange.to))
  })
  .focus()
  .run()
\`\`\`

```

# content-ai\capabilities\suggestion\features\configure-when-to-load-suggestions.mdx

```mdx
---
title: Configure when to load suggestions
meta:
  title: Load Suggestions | Tiptap AI Suggestion
  description: Customize when the AI Suggestion extension loads suggestions with options like loadOnStart and reloadOnUpdate.
  category: Content AI
---

You can customize when the AI Suggestion extension calls the LLM to generate suggestions. This allows you to control when new suggestions are loaded, and how often they are reloaded.

## Load Suggestions on Start

By default, the AI Suggestion extension will automatically load suggestions when the editor is ready. You can disable this behavior with the `loadOnStart` option.

\`\`\`ts
AiSuggestion.configure({
  // Disable automatic loading of suggestions
  loadOnStart: false,
})
\`\`\`

## Reload Suggestions on Content Update

By default, the AI Suggestion extension will reload suggestions when the editor's content changes. You can disable this behavior with the `reloadOnUpdate` option.

\`\`\`ts
AiSuggestion.configure({
  // Disable automatic loading of suggestions
  reloadOnUpdate: false,
})
\`\`\`

## Debounce Timeout

By default, the AI Suggestion extension will wait 800 milliseconds after the user stops typing to reload suggestions. This prevents the API from being called too frequently. You can configure this timeout with the `debounceTimeout` option.

\`\`\`ts
AiSuggestion.configure({
  debounceTimeout: 1000,
})
\`\`\`

However, there are cases where you may want to force suggestions to reload. For example, you may want to reload suggestions when the user clicks a "refresh" button.

To reload suggestions manually, use the `loadAiSuggestions` command.

\`\`\`ts
editor.commands.loadAiSuggestions()
\`\`\`

To load suggestions after a delay, use the `loadAiSuggestionsDebounced` command. The delay is determined by the `debounceTimeout` option.

This command is used internally to reload the suggestions after the editor content changes (for example, when the user types on the editor). The function is debounced so that, if called multiple times within the debounce timeout, only the last call will be executed.

\`\`\`ts
editor.commands.loadAiSuggestionsDebounced()
\`\`\`

## Set Suggestions Programmatically

If you want to set the suggestions to a certain value, without loading them with the configured API, you can use the `setAiSuggestions` command. This is useful in the following scenarios:

- When you have a list of suggestions that you want to display immediately.
- When you want to clear the suggestions.
- When you want to display suggestions from a different source than the API you configured in the extension's options.

\`\`\`ts
editor.commands.setAiSuggestions(suggestions)
\`\`\`

To learn more about the data that a suggestion object should contain, check the [API reference](/content-ai/capabilities/suggestion/api-reference#proofreading-suggestions).

```

# content-ai\capabilities\suggestion\features\define-rules.mdx

```mdx
---
title: Define rules for the AI Suggestion extension
meta:
  title: Define Rules | Tiptap AI Suggestion
  description: Configure the AI Suggestion extension with a list of rules to generate suggestions.
  category: Content AI
---

The AI Suggestion extension must be configured with a list of rules to help the LLM analyze the editor's content and generate suggestions.

\`\`\`ts
AiSuggestion.configure({
  rules: [
    {
      id: '1',
      title: 'Spell Check',
      prompt: 'Identify and correct any spelling mistakes',
      color: '#DC143C',
      backgroundColor: 'FFE6E6',
    },
  ],
})
\`\`\`

Each suggestion is associated with a rule. If no rules are provided, the AI Suggestion extension will not generate any suggestions.

Each rule must have a unique string id, so that each suggestion can be matched with its corresponding rule.

The prompt property is a string that describes the rule. It is provided to the AI model to help it generate suggestions.

Only the id and the prompt are sent to the AI model. The title, color and backgroundColor properties are used to style and display the suggestions in the editor.

## Are Rules Stored in Tiptap Cloud?

If you use Tiptap Content AI Cloud to generate suggestions for your content, rules are not stored in the cloud. They are sent on each request.

Because we do not store your rules, you can change them at any time and enable them based on your own application-specific logic. For example, you can have rules that apply to all documents, document-specific rules, rules that apply to certain users, or even have the user define their own rules.

If you want rules to persist across sessions, you should store them in your own database.

## How to Change Rules After the Editor Is Loaded

You can change the rules at any time without having to reload the editor. Use the `setAiSuggestionRules` command to update the rules.

\`\`\`ts
const newRules = [
  {
    id: '2',
    title: 'Grammar Check',
    prompt: 'Identify and correct any grammar mistakes',
    color: '#FFA500',
    backgroundColor: 'FFF5E6',
  },
]

editor.commmands.setAiSuggestionRules(newRules)
\`\`\`

Warning: the `setAiSuggestionRules` command will not automatically reload the suggestions. You need to call the `loadAiSuggestions` command to update the suggestions based on the new rules. A common pattern is to chain the two commands together.

\`\`\`ts
editor.chain().setAiSuggestionRules(newRules).loadAiSuggestions().run()
\`\`\`

```

# content-ai\capabilities\suggestion\features\display-suggestions.mdx

```mdx
---
title: Customize how suggestions are displayed
meta:
  title: Display Suggestions | Tiptap AI Suggestion
  description: Customize how AI Suggestions are displayed in the editor with custom styles and popovers.
  category: Content AI
---

The AI Suggestion extension is headless and fully customizable. This means that you have full control over how suggestions are displayed in the editor.

## Show Loading/Error States When Loading Suggestions

You can access the extension's current loading state by reading its extension storage object

\`\`\`ts
const storage = editor.extensionStorage.aiSuggestion
if (storage.isLoading) {
  // Show a loading spinner
} else if (storage.error) {
  // Show an error message.
}
\`\`\`

The `storage.error` property will contain the error object that was thrown while loading suggestions. You can use this object to display different error messages depending on the error type.

## Default Suggestion Styles

By default, the AI Suggestion extension will apply the CSS class `tiptap-ai-suggestion` to each suggestion. It will also add a `style` attribute with these color variables: `--tiptap-ai-suggestion-color` and `--tiptap-ai-suggestion-background-color`. The `tiptap-ai-suggestion` class can be used to apply simple styles to the suggestions in the editor.

\`\`\`css
.tiptap-ai-suggestion {
  border-bottom: 2px solid var(--tiptap-ai-suggestion-color);
  margin-bottom: -2px;
}
\`\`\`

For more advanced styles, use the `getCustomSuggestionDecoration` [configuration option](/content-ai/capabilities/suggestion/configure#custom-suggestion-styles).

## Selected Suggestions

A suggestion is considered "selected" when the cursor is over it.

You can read the selected suggestion from the extension's storage object

\`\`\`ts
const storage = editor.extensionStorage.aiSuggestion
const selectedSuggestion = storage.getSelectedSuggestion()
\`\`\`

To select a suggestion programmatically, use the `selectAiSuggestion` command.

\`\`\`ts
editor.commands.selectAiSuggestion(suggestionId)
\`\`\`

This will move the cursor to the beginning of the suggestion, so that it is considered "selected".

By default, the AI Suggestion extension will apply the CSS class `tiptap-ai-suggestion--selected` to the selected suggestion. This class can be used
to style the selected suggestion in the editor.

\`\`\`css
.tiptap-ai-suggestion--selected {
  background-color: var(--tiptap-ai-suggestion-background-color);
  transition: background-color 0.5s;
}
\`\`\`

## Customize the Suggestion's Appearance

The `getCustomSuggestionDecoration` option allows you to control the appearance of suggestions and provide visual cues to the user. You can add custom CSS classes to the suggestions, and add custom elements before/after them. This is useful for adding popovers, tooltips, icons, or other elements to the suggestions.

The function Custom suggestion styles are applied using the [Prosemirror Decorations API](https://prosemirror.net/docs/guide/#view.decorations).

To learn how to show a popover when you select a suggestion, [follow this guide](/content-ai/capabilities/suggestion/features/display-suggestions#show-a-popover-when-you-select-a-suggestion).

\`\`\`ts
AiSuggestion.configure({
  getCustomSuggestionDecoration({ suggestion, isSelected, getDefaultDecorations }) {
    // You can combine the default decorations of the AI Suggestion extension with your custom ones
    const decorations = getDefaultDecorations()

    // Add a custom element after the suggestion text
    Decoration.widget(suggestion.deleteRange.to, () => {
      const element = document.createElement('span')
      element.textContent = '⚠️'
      return element
    })
    return decorations
  },
})
\`\`\`

## Show a Popover When You Select a Suggestion

An essential feature of modern AI Suggestions is the ability to show a popover or a tooltip when you select a suggestion. This popover usually provides extra information about the suggestion, and allows the user to accept or reject it.

To show a popover when you select a suggestion, you need to use the `getCustomSuggestionDecoration` option. This function allows you to add custom elements to the suggestions, including popovers.

Below is a simplified example on how to do it with the React UI library.

\`\`\`tsx
// First, define a hook to store the HTML element where the popover will be rendered
const [popoverElement, setPopoverElement] = useState<HTMLElement | null>(null)

AiSuggestion.configure({
  getCustomSuggestionDecoration({ suggestion, isSelected, getDefaultDecorations }) {
    const decorations = getDefaultDecorations()

    // Then, create a Prosemirror decoration that contains the HTML element
    Decoration.widget(suggestion.deleteRange.to, () => {
      const element = document.createElement('span')

      return element
    })
    return decorations
  },
})

// Then, add the content to the custom element. In this example, we use React Portals to render the popover inside the editor.
if (popoverElement) {
  ReactDOM.createPortal(<Popover suggestion={editor.selectedSuggestion} />, popoverElement)
}
\`\`\`

We recommend using the [Floating UI](https://floating-ui.com/) library to display the popover. You can see an example on how to do it [in the demo](/content-ai/capabilities/suggestion/overview).

When you render the suggestion in the popover, you might want to show the previous and next words of the sentence to give the user more context. We've created the `getNextWord` and `getPreviousWord` utility functions so that you don’t have to implement them yourself. You can import them from the `@tiptap-pro/extension-ai-suggestion` library.

\`\`\`ts
import { getNextWord, getPreviousWord } from '@tiptap-pro/extension-ai-suggestion'

// Get the previous word in the sentence.
const { previousWord } = getPreviousWord(editor, suggestion.deleteRange.from)
// Get the next word in the sentence and the punctuation mark that follows it, if it's the end of the sentence.
const { nextWord, punctuationMark } = getNextWord(editor, suggestion.deleteRange.to)
\`\`\`

## Display Suggestions in a Sidebar Outside the Editor

You can access the current suggestions from the extension's [storage object](/content-ai/capabilities/suggestion/api-reference#extension-storage).

\`\`\`ts
const storage = editor.extensionStorage.aiSuggestion
const suggestions = storage.getSuggestions()
\`\`\`

Then, you can use this data to render suggestions in the UI, outside the editor. Here is an example of how to do it with the React UI library

\`\`\`tsx
// Get the suggestions from the Editor state.
const storage = editor.extensionStorage.aiSuggestion
const suggestions = storage.getSuggestions()

// Render the suggestions in the UI
return (
  <div>
    {suggestions.map((suggestion) => (
      <div key={suggestion.id}>
        <p>{suggestion.deleteText}</p>
        <ul>
          {suggestion.replacementOptions.map((option) => (
            <li key={option.id}>{option.addText}</li>
          ))}
        </ul>
      </div>
    ))}
  </div>
)
\`\`\`

```

# content-ai\capabilities\suggestion\features\lock-content.mdx

```mdx
---
title: Lock content from being proofread
meta:
  title: Lock Content | Tiptap AI Suggestion
  description: Prevent certain content from being proofread by filtering suggestions.
  category: Content AI
---

Because your document might have important information, you might not want to generate suggestions about all its content. You might want to mark certain content as “locked”, and prevent the suggestion from generating suggestions that modify it.

We are working on an extension that implements this feature with minimal hassle. If you are interested in this upcoming feature and think you would use it in your application, contact us at humans@tiptap.dev.

You can also prevent certain content from being proofread by filtering the suggestions generated by the resolver. Implement your custom filter function that removes the suggestions that are applied to certain positions of the document, or that contain a specific type of content.

\`\`\`ts
AiSuggestion.configure({
  async resolver({ defaultResolver, ...options }) {
    // Load suggestions
    const suggestions = await defaultResolver(options)
    // Remove suggestions that modify the locked content
    const filteredSuggestions = filterSuggestions(suggestions)
    return filteredSuggestions
  },
})

// Filter function that removes the suggestions that modify the content in positions between 10 and 20.
function filterSuggestions(suggestions) {
  return suggestions.filter(
    (suggestion) => suggestion.deleteRange.from > 20 || suggestion.deleteRange.to < 10,
  )
}
\`\`\`

```

# content-ai\capabilities\suggestion\install.mdx

```mdx
---
title: Install the AI Suggestion extension
meta:
  title: Install AI Suggestion | Tiptap AI Suggestion
  description: Integrate the AI Suggestion extension into your application with this setup guide. More in the docs.
  category: Content AI
---

import { Callout } from '@/components/ui/Callout'

This setup guide will help you integrate the AI Suggestion Extension from scratch into your application.

## Install the Extension

<Callout title="Subscription required" variant="warning">

This extension requires a valid Entry, Business or Enterprise subscription. To install the extension you need access to our [private registry](/guides/pro-extensions), set this up first.

</Callout>

Once done, you can install the extension from our private registry:

\`\`\`bash
npm install @tiptap-pro/extension-ai-suggestion
\`\`\`

## Import the Extension in Your Editor

Add the `AiSuggestion` to the list of extensions.

\`\`\`ts
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import AiSuggestion from '@tiptap-pro/extension-ai-suggestion'

// Initialize the editor
const editor = new Editor{
  extensions: [
    StarterKit,
    AiSuggestion.configure({
      // Define suggestion rules
      rules: [
        {
          id: '1',
          title: 'Spell Check',
          prompt: 'Identify and correct any spelling mistakes',
          color: '#DC143C',
          backgroundColor: 'FFE6E6',
        },
      ],
      // Configure Content AI Cloud (see next section)
      appId: 'APP_ID_HERE',
      token: 'TOKEN_HERE',
      // … other options
    }),
    // … more extensions
  ],
  // Recommended: disable spellcheck to avoid conflicts
  editorProps: {
    attributes: {
      spellcheck: false,
    },
  },
})
\`\`\`

## Decide How Suggestions Are Generated

The next step is to configure a way to generate the suggestions that will be displayed in the editor.

The easiest way to get started with the AI Suggestion extension is to use Tiptap Content AI Cloud. Our API will generate suggestions from your rules and content. Follow this setup guide: [Use Tiptap Content AI Cloud](/content-ai/capabilities/suggestion/use-with-content-ai-cloud).

You can also use your own backend and LLMs to generate proofreading suggestions. You can find a guide here: [Integrate your own backend and LLMs](/content-ai/capabilities/suggestion/custom-llms).

## Customize the User Interface

Finally, you’ll need to configure the editor styles so that the suggestions are displayed in the UI.

By default, the AI Suggestions have CSS classes and color attributes to help you style them. Use these CSS styles to show a colored underline below the suggestions.

\`\`\`css
.tiptap-ai-suggestion {
  border-bottom: 2px solid var(--tiptap-ai-suggestion-color);
  margin-bottom: -2px;
}

.tiptap-ai-suggestion--selected {
  background-color: var(--tiptap-ai-suggestion-background-color);
  transition: background-color 0.5s;
}
\`\`\`

You can customize the suggestions' appearance even more by providing custom decorations. To show a tooltip or a popover when you select a suggestion, [follow this guide](/content-ai/capabilities/suggestion/features/display-suggestions#show-a-popover-when-you-select-a-suggestion).

```

# content-ai\capabilities\suggestion\overview.mdx

```mdx
---
title: Show AI Suggestions in your editor
meta:
  title: AI Suggestion | Tiptap Content AI
  description: Get an overview of the AI Suggestion extension, its features, and how it works.
  category: Content AI
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

The AI Suggestion extension analyzes the document and shows suggestions that users can accept and reject. It works out-of-the-box with Content AI Cloud, and can be easily extended to work with your own backend and LLMs.

<CodeDemo
  isPro
  path="/Extensions/AiSuggestion"
  src="https://develop--tiptap-pro.netlify.app/preview/Extensions/AiSuggestion"
/>


<Callout title="Subscription required" variant="warning">
    This extension requires a valid´ subscription. To install the extension, you need [access to our
    private registry](/guides/pro-extensions).
</Callout>

## Features

- [Define your own rules](/content-ai/capabilities/suggestion/features/define-rules) to enforce your style guide, improve readability, and ensure that your users' content follows best practices.
- [Apply suggestions](/content-ai/capabilities/suggestion/features/apply-suggestions): Replace words, phrases, or sentences with suggestions generated by the AI Suggestion extension.
- Rich text support in suggestions, so you can enforce style rules like formatting keywords in bold or italic.
- [Integrate your own backend and LLMs](/content-ai/capabilities/suggestion/custom-llms)
- [Customize the user interface](/content-ai/capabilities/suggestion/features/display-suggestions): Full control over how suggestions are displayed on the editor.

## How It Works

The AI Suggestion extension uses Tiptap Cloud's OpenAI models (or your custom backend) to generate proofreading suggestions from your rules and the editor's content. The extension covers both the client and server-side implementations. Here is the user experience:

1. When the editor loads, the AI Suggestion extension generates suggestions based on its initial content and rules.
2. If the user edits the rules or content, the extension's suggestions are updated in real-time.
3. The user can review and accept suggestions, or reject them.
4. When a suggestion is accepted, the editor's content is updated with the new text.

```

# content-ai\capabilities\suggestion\use-with-content-ai-cloud.mdx

```mdx
---
title: Use the AI Suggestion extension with Tiptap Content AI Cloud
meta:
  title: Content AI Cloud | Tiptap AI Suggestion
  description: Get started with the AI Suggestion extension by generating suggestions with the Tiptap Content AI Cloud API.
  category: Content AI
---

The fastest way to get started with the AI Suggestion extension is to let the suggestions be generated with the Tiptap Content AI Cloud API. This works out of the box, you only need to provide the authentication credentials to the extension.

## Set Up Tiptap AI for Your Team

This extension relies on using our Content AI backend service. You'll need a valid Entry, Business or Enterprise subscription. [Just head over to our pricing page to learn more.](https://tiptap.dev/pricing)

1. You'll need to provide an [OpenAI API token](https://platform.openai.com/docs/quickstart/account-setup) yourself, which we're using in order to send requests to the OpenAI API. Your token is stored well encrypted and is only used on a per-request basis. [Add the OpenAI API Key to your team](https://cloud.tiptap.dev/ai-settings).
2. Generate a JWT (HS256 algorithm) with our provided secret to authenticate the extension against our service. [Get your JWT secret](https://cloud.tiptap.dev/ai-settings).
3. Copy your App ID and JWT Token, you'll use them to configure your application.

## Add Your Authentication Credentials to the Extension

Import the extension and configure it with your Tiptap Content AI app id and token.

\`\`\`tsx
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import AiSuggestion from '@tiptap-pro/extension-ai-suggestion'

// Initialize the editor
const editor = new Editor{
  extensions: [
    StarterKit,
    AiSuggestion.configure({
      // Your Tiptap Content AI app id
      appId: 'APP_ID_HERE',
      // This needs to be your generated JWT and MUST NOT be the OpenAI API key!
      token: 'TOKEN_HERE',
      // Other configuration options...
    }),
  ],
})
\`\`\`

Now, when the editor loads, the suggestions will be fetched from the Tiptap Content AI API.

```

# content-ai\custom-llms\index.mdx

```mdx
---
title: Integrate a custom LLM
meta:
  title: Custom LLM | Tiptap Content AI
  description: Integrate the Tiptap AI extensions with your custom backend and AI models. Read about it in our docs.
  category: Content AI
---

import contentAIIcon from '@/assets/content-ai.png'
import { ProductCard } from '@/components/ProductCard'

Our AI extensions are designed to work with your custom LLMs. You can integrate them with your backend to provide advanced AI features to your users: AI agents, RAG pipelines, custom models, and more.

## Extensions

We provide detailed guides on how to integrate your backend and LLMs in each of our extensions.

<div className="grid sm:grid-cols-2 gap-5">
  <ProductCard
    title="AI Generation"
    description="Generate text and images and edit content with your custom AI models."
    tags={['Cloud', 'On premises']}
    documentationUrl="/content-ai/capabilities/generation/custom-llms"
    icon={contentAIIcon.src}
  />
  <ProductCard
    title="AI Suggestion"
    description="Generate proofreadeing suggestions with your custom AI models."
    tags={['Beta', 'Cloud', 'On premises']}
    documentationUrl="/content-ai/capabilities/suggestion/custom-llms"
    icon={contentAIIcon.src}
  />
</div>

```

# content-ai\getting-started\overview.mdx

```mdx
---
title: Integrate AI into your editor
meta:
  title: AI | Tiptap Content AI
  description: Integrate AI features into your editor like AI suggestions, autocompletion, stream responses… more in our docs.
  category: Content AI
---

import { ArrowRightIcon } from 'lucide-react'
import contentAIIcon from '@/assets/content-ai.png'
import contentTemplatesImage from '@/assets/content-templates.png'
import * as ImageCard from '@/components/ImageCard'
import Link from '@/components/Link'
import { ProductCard } from '@/components/ProductCard'
import { Button } from '@/components/ui/Button'

Add AI features to your Tiptap Editor with just a couple of lines of code. Our Content AI extensions provide a seamless integration of AI features like smart autocompletion, proofreading, image generation, and more.

import { Callout } from '@/components/ui/Callout'

<Callout title="Subscription required" variant="warning">
    These extensions require a valid Tiptap subscription. To install the extension, you need [access to our
private registry](/guides/pro-extensions).
</Callout>

## Extensions

Our AI extensions work out-of-the-box with Tiptap Cloud, so you can deploy them without a backend. They are also easily extendable to work with your custom backend and LLMs.

<div className="grid sm:grid-cols-2 gap-5">
  <ProductCard
    title="AI Generation"
    description="In-line content generation and manipulation with your custom LLM or OpenAI."
    tags={['Cloud', 'On premises']}
    documentationUrl="/content-ai/capabilities/generation/overview"
    icon={contentAIIcon.src}
  />
  <ProductCard
    title="AI Suggestion"
    description="Show proofreading suggestions in your editor."
    tags={['Beta', 'Cloud', 'On premises']}
    documentationUrl="/content-ai/capabilities/suggestion/overview"
    icon={contentAIIcon.src}
  />
</div>

## Start with a template

To get started quickly, we provide a Notion-inspired editor template. It includes AI-powered features like smart autocompletion and text and image generation.

<ImageCard.Card>
  <ImageCard.Image src={contentTemplatesImage.src} alt="User interface templates for Tiptap" />
  <ImageCard.Content>
    <ImageCard.Title>Notion-like editor</ImageCard.Title>
    {/* eslint-disable-next-line react/no-children-prop */}
    <ImageCard.Paragraph children="Make content creation easier for your users with a block-based editor with AI features included." />
    <div className="flex items-center gap-2 mt-8">
      <Button asChild variant="secondary">
        <Link href="https://templates.tiptap.dev/">
          Show demo
          <ArrowRightIcon className="size-4" />
        </Link>
      </Button>
      <Button asChild variant="tertirary">
        <Link href="https://cloud.tiptap.dev/react-templates">
          Get access
          <ArrowRightIcon className="size-4" />
        </Link>
      </Button>
    </div>
  </ImageCard.Content>
</ImageCard.Card>

## Examples and demos

We provide examples for integrating AI features into your editor. Check our demos:

- [AI Text Generation](/content-ai/capabilities/generation/overview)
- [AI Autocompletion](/content-ai/capabilities/generation/text-generation/autocompletion)
- [AI Suggestion](/content-ai/capabilities/suggestion/overview)

```

# content-ai\resources\privacy.mdx

```mdx
---
title: Content AI privacy
meta:
  title: Privacy | Tiptap Content AI
  description: Explore how Tiptap Content AI prioritizes your privacy with robust cloud integration and on-premise options. More in the docs!
  category: Content AI
---

At Tiptap we value your privacy. So when using Tiptap Content AI that topic may raise some questions which we like to address in detail below.

## Cloud integration

The Tiptap Content AI Cloud Version **acts as a proxy** between your client (the Tiptap Editor) and OpenAI. This is done to protect your OpenAI secret from the client, as it is an anti-pattern to share secrets publicly and user-facing.

When using our cloud service, you’ll need to enter your OpenAI secret in your AI settings page. This key is then encrypted and stored in our database. We use this key to perform requests against the OpenAI API on your behalf.

### Data Flow

The general flow of data looks like this:

1. Your client (the Editor) performs an AI command like `translate`
2. The AI extension sends a request to our backend service
3. The backend performs a lookup of your given App ID and ensures that the provided token (the generated JWT) is valid and continuous the request or aborts with an error code
4. After the authorization process the backend builds a prompt based on the desired command and uses your OpenAI API key to send the request to the OpenAI API
5. Once the request is processed, the response is send back to the client

### What we record

During the process described above, we record the following data on a regular basis to ensure that our services works correctly and reliable:

- HTTP logs including timestamps, a correlation ID, the referrer, user agent and IP including the relevant request headers and portion of the request body in order to ensure that the service is operational and prevent any abuse
- Performed operation mapped to your team including the timestamp, the correlation ID, the command (e.g. “translate”) and a timestamp in order to track the usage of your plan limits

To be able to help you in case there’s something off, we implemented a mechanism called “enhanced logging”.

**Only when asked to do so (e.g. for debugging) and with your permission** we may enable enhanced logging. To be clear: This is NOT the default. However, this leads to the following additional fields recorded:

- Input text and options, the built prompt of our backend and the response of OpenAI

Those data points help us to trace errors on each side and help you sort out any issues you may experience. After debugging is complete, we immediately disable the enhanced logging.

### Encryption

As mentioned above, we’re storing the following values encrypted in our database:

- Your OpenAI API Key
- Your JWT Secret

Those secrets are only decrypted when needed to authorize or fulfill a request.

All traffic between the client, the backend and OpenAI is encrypted using the latest SSL standards.

## On your premises

The on-premise version works technically the same as the cloud version. It acts as a proxy between the client and OpenAI, too.

Some things are different for obvious reasons:

- The OpenAI API key is stored in your desired location and is never sent to us
- We do **not** get any usage information on the performed requests
- The logs are sent to stdout and you’re able to use them as you’d need and like

Therefore, the on-prem version gives you full control over the gathered data and metrics.

```

# content-ai\sidebar.ts

```ts
import { SidebarConfig } from '@/types'

export const sidebarConfig: SidebarConfig = {
  id: 'content-ai',
  rootHref: '/content-ai/getting-started/overview',
  title: 'Content AI',
  items: [
    {
      href: '/content-ai/getting-started/overview',
      title: 'Getting started',
      type: 'group',
      children: [
        {
          title: 'Overview',
          href: '/content-ai/getting-started/overview',
        },
      ],
    },
    {
      type: 'group',
      href: '/content-ai/capabilities',
      title: 'Capabilities',
      children: [
        {
          title: 'AI Generation',
          tags: ['Pro'],
          href: '/content-ai/capabilities/generation/',
          children: [
            {
              title: 'Overview',
              href: '/content-ai/capabilities/generation/overview',
            },
            {
              title: 'Install',
              href: '/content-ai/capabilities/generation/install',
            },
            {
              title: 'Text generation',
              href: '/content-ai/capabilities/generation/text-generation',
              children: [
                {
                  title: 'Built-in commands',
                  href: '/content-ai/capabilities/generation/text-generation/built-in-commands',
                },
                {
                  title: 'Autocompletion',
                  href: '/content-ai/capabilities/generation/text-generation/autocompletion',
                },
                {
                  title: 'Provide context',
                  href: '/content-ai/capabilities/generation/text-generation/provide-context',
                },
                {
                  title: 'Formatted responses',
                  href: '/content-ai/capabilities/generation/text-generation/format',
                },
                {
                  title: 'Manage responses',
                  href: '/content-ai/capabilities/generation/text-generation/manage-responses',
                },
                {
                  title: 'Custom commands',
                  href: '/content-ai/capabilities/generation/text-generation/custom-commands',
                },
                {
                  title: 'Stream content (Advanced)',
                  href: '/content-ai/capabilities/generation/text-generation/stream',
                },
              ],
            },
            {
              title: 'Image generation',
              href: '/content-ai/capabilities/generation/image-generation',
            },
            {
              title: 'Integrate your LLM',
              href: '/content-ai/capabilities/generation/custom-llms',
            },
            {
              title: 'Configure',
              href: '/content-ai/capabilities/generation/configure',
            },
          ],
        },
        {
          title: 'AI Suggestion',
          href: '/content-ai/capabilities/suggestion',
          tags: ['Pro', 'Beta'],
          children: [
            {
              title: 'Overview',
              href: '/content-ai/capabilities/suggestion/overview',
            },
            {
              title: 'Install',
              href: '/content-ai/capabilities/suggestion/install',
            },
            {
              title: 'Features',
              href: '/content-ai/capabilities/suggestion/features',
              children: [
                {
                  title: 'Define rules',
                  href: '/content-ai/capabilities/suggestion/features/define-rules',
                },
                {
                  title: 'Configure when to load suggestions',
                  href: '/content-ai/capabilities/suggestion/features/configure-when-to-load-suggestions',
                },
                {
                  title: 'Display suggestions',
                  href: '/content-ai/capabilities/suggestion/features/display-suggestions',
                },
                {
                  title: 'Apply and reject suggestions',
                  href: '/content-ai/capabilities/suggestion/features/apply-suggestions',
                },
                {
                  title: 'Lock content',
                  href: '/content-ai/capabilities/suggestion/features/lock-content',
                },
              ],
            },
            {
              title: 'Use with Content AI Cloud',
              href: '/content-ai/capabilities/suggestion/use-with-content-ai-cloud',
            },
            {
              title: 'Integrate your LLM',
              href: '/content-ai/capabilities/suggestion/custom-llms',
            },
            {
              title: 'Configure',
              href: '/content-ai/capabilities/suggestion/configure',
            },
            {
              title: 'API Reference',
              href: '/content-ai/capabilities/suggestion/api-reference',
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      href: '',
      title: 'Examples',
      children: [
        {
          title: 'Text Generation',
          isActive: false,
          href: '/content-ai/capabilities/generation/overview',
        },
        {
          title: 'Autocomplete',
          isActive: false,
          href: '/content-ai/capabilities/generation/text-generation/autocompletion',
        },
        {
          title: 'AI Suggestions',
          isActive: false,
          href: '/content-ai/capabilities/suggestion/overview',
        },
        {
          title: 'Starter templates',
          href: 'https://tiptap.dev/product/templates',
        },
      ],
    },
    {
      type: 'group',
      href: '/content-ai/custom-llms',
      title: 'Custom LLMs',
      children: [
        {
          title: 'Integrate your LLM',
          href: '/content-ai/custom-llms',
        },
      ],
    },
    {
      type: 'group',
      href: '/content-ai/resources',
      title: 'Resources',
      children: [
        {
          title: 'Privacy',
          href: '/content-ai/resources/privacy',
        },
      ],
    },
  ],
}

```

# conversion\getting-started\install.mdx

```mdx
---
title: Authenticate your conversion service
meta:
    title: Authenticate | Tiptap Conversion
    description: Retrieve your credentials to authenticate your application with Tiptap's conversion service.
    category: Conversion
---

import { Callout } from '@/components/ui/Callout'

Tiptap Conversion lets you import and export Tiptap JSON to and from `DOCX`, `ODT`, and `Markdown`. You can integrate import/export directly in your Tiptap editor with dedicated extensions, or use the Conversion REST API on your server.

## Set up authorization

Most conversion operations require authentication. Generate a JWT (JSON Web Token) using the `secret key` from your Tiptap Cloud account. Include this JWT in requests or extension configs.

<Callout title="Export DOCX Extension" variant="info">
    The <code>extension-export-docx</code> package does not require authentication!
    Feel free to [skip](/conversion/import-export/docx/editor-export) these steps if you only need that extension.
</Callout>

1. **Get your App ID and secret key** on the [Convert settings](https://cloud.tiptap.dev/convert-settings) page.
2. **Generate a JWT** for testing using any JWT tool (e.g., JWT Builder). For production, always create JWTs **server-side** to keep your secret safe.
3. **Use the JWT** in your requests or extension config. For API calls, pass it in the `Authorization` header and the App ID in `X-App-Id`.

## Explore file-type integrations

Depending on which format you want to work with, each file type has its own guide to installing and configuring the relevant import and export extensions:

- [DOCX integration](/conversion/import-export/docx/)
- [ODT integration](/conversion/import-export/odt)
- [Markdown integration](/conversion/import-export/markdown)

These guides explain exactly how to integrate the respective extension and REST API endpoints into your application and configure any necessary options.
```

# conversion\getting-started\overview.mdx

```mdx
---
title: Import and export documents with Tiptap
meta:
    title: Conversion | Tiptap Conversion
    description: Use Tiptap to convert documents from DOCX, ODT or Markdown to Tiptap JSON format
    category: Conversion
---

import { Callout } from '@/components/ui/Callout'
import { CodeDemo } from '@/components/CodeDemo'

The Tiptap Conversion Service makes it easy to import and export content between Tiptap and document file formats. It offers:

<Callout title="Subscription required" variant="warning">
    These extensions require a valid Tiptap subscription. To install the extension, you need [access to our
    private registry](/guides/pro-extensions).
</Callout>

- **Import**: Convert files (Word DOCX, OpenOffice/LibreOffice ODT, or Markdown files) into Tiptap’s JSON document format.
- **Export**: Turn Tiptap JSON back into Word DOCX, OpenOffice/LibreOffice ODT, or Markdown files.
- **Editor Extensions**: Use built-in Tiptap Pro extensions to import/export directly within a Tiptap editor instance.
- **REST API**: Use HTTP endpoints to integrate our conversion services anywhere needed without a Tiptap editor being required.

<CodeDemo src="https://develop--tiptap-pro.netlify.app/preview/Extensions/ExportImportDocx" />

<Callout title="Conversion service">
    We are continuously improving the conversion service. Support for page breaks, headers/footers, references like footnotes, and other complex features are in active development.
</Callout>
```

# conversion\import-export\docx\custom-mark-conversion.mdx

```mdx
---
title: Import custom marks with .docx
meta:
    title: DOCX mark import | Tiptap Conversion
    description: Learn how to import custom marks from DOCX (Word) files using the Import extension in our docs.
    category: Conversion
---

import { Callout } from '@/components/ui/Callout'
import { CodeDemo } from '@/components/CodeDemo'

When importing a DOCX file, you can also define how custom marks should be converted back to Tiptap nodes. This is done by passing an array of custom mark definitions to the `import` command. You could use this feature to convert your custom stylings from Word into Titap with ease.

\`\`\`ts
import { Import } from '@tiptap-pro/extension-import'

const editor = new Editor({
  extensions: [
    // Other extensions ...
    Import.configure({
      appId: 'your-app-id',
      token: 'your-jwt',
      // ATTENTION: This is for demo purposes only
      endpoint: 'https://your-endpoint.com',
      imageUploadCallbackUrl: 'https://your-endpoint.com/image-upload',
      // Promisemirror custom mark mapping
      prosemirrorMarks: {
        bold: 'strong',
        italic: 'em',
      }
    }),
    // Other extensions ...
  ],
  // Other editor settings ...
})
\`\`\`

The latest version of the `@tiptap-pro/extension-import` has the `prosemirrorMarks` configuration option available.

This option allows you to map custom nodes from the DOCX to your Tiptap schema. In the example above, we are mapping the `bold` and `italic` nodes from the DOCX to the `strong` and `em` nodes in our Tiptap schema.

By doing so, whenever the DOCX contains a `bold` or `italic` node, it will be converted to a `strong` or `italic` node in Tiptap when imported.

<Callout title='DOCX, "prosemirrorNodes" and "prosemirrorMarks"' variant="info">
  Please note that the `promisemirrorNodes` and `prosemirrorMarks` options will only work if you're importing a `.docx` file. If you're importing another type of file, eg: an `.odt` file, the `/import` endpoint will be used instead of the `/import` endpoint, and the `promisemirrorNodes` and `prosemirrorMarks` options will not be available.
</Callout>


```

# conversion\import-export\docx\custom-node-conversion.mdx

```mdx
---
title: Import and export custom nodes with .docx
meta:
    title: Custom nodes in DOCX | Tiptap Conversion
    description: Learn how to export custom nodes to DOCX (Word) files using the Export extension.
    category: Conversion
---

import { Callout } from '@/components/ui/Callout'
import { CodeDemo } from '@/components/CodeDemo'

One of the biggest advantages of the `@tiptap-pro/extension-export-docx` and `@tiptap-pro/extension-import` extensions is the ability to define how custom nodes in your Tiptap schema should be rendered in DOCX.

This allows you to preserve application-specific content in the exported Word file.

<Callout title="Custom node conventions" variant="warning">
  Custom node converters must adhere to the underlying DOCX generation library’s requirements. In practice, a custom converter function for DOCX should return one of the allowed DOCX elements for that node: a `Paragraph` class (or an array of `Paragraph` classes), a `Table` class, or `null` if the node should be skipped in the output.
</Callout>

## Export custom nodes to .docx

<CodeDemo src="https://develop--tiptap-pro.netlify.app/preview/Extensions/ExportDocxCustomNode" />

When calling `editor.exportDocx()`, you can pass an array of custom node definitions in the `ExportDocxOptions` argument. Each definition specifies the node type and a render function.

For the sake of the example, suppose your editor has a custom node type `hintbox` (a callout-styled box). You can define how it should appear in DOCX.

Here's how the `Hintbox` extension's custom node might look like:

\`\`\`ts
import { mergeAttributes, Node } from '@tiptap/core'

export interface ParagraphOptions {
  /**
   * The HTML attributes for a paragraph node.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    hintbox: {
      /**
       * Set a hintbox
       * @example editor.commands.setHintbox()
       */
      setHintbox: () => ReturnType
      /**
       * Toggle a hintbox
       * @example editor.commands.toggleHintbox()
       */
      toggleHintbox: () => ReturnType
    }
  }
}

/**
 * This extension allows you to create hintboxes.
 * @see https://www.tiptap.dev/api/nodes/paragraph
 */
export const Hintbox = Node.create<ParagraphOptions>({
  name: 'hintbox',

  priority: 1000,

  addOptions() {
    return {
      HTMLAttributes: {
        style: 'padding: 20px; border: 1px solid #b8d8ff; border-radius: 5px; background-color: #e6f3ff;',
      },
    }
  },

  group: 'block',

  content: 'inline*',

  parseHTML() {
    return [{ tag: 'p' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['p', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setHintbox:
        () =>
        ({ commands }) => {
          return commands.setNode(this.name)
        },
      toggleHintbox:
        () =>
        ({ commands }) => {
          return commands.toggleNode(this.name, 'paragraph')
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-h': () => this.editor.commands.toggleHintbox(),
    }
  },
})
\`\`\`

And we will define how the `Hintbox` custom node should be rendered in the `DOCX`:

\`\`\`ts
// Import the ExportDocx extension
import {
  convertTextNode,
  Docx,
  ExportDocx,
  lineHeightToDocx,
  pixelsToHalfPoints,
  pointsToTwips,
} from '@tiptap-pro/extension-export-docx'

const editor = new Editor({
  extensions: [
    // Other extensions ...
    ExportDocx.configure({
      onCompleteExport: result => {
        setIsLoading(false)
        const blob = new Blob([result], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'export.docx'
        a.click()
        URL.revokeObjectURL(url)
      },
      exportType: 'blob',
      customNodes: [
        {
          type: 'hintbox',
          render: node => {
            // Here we define how our custom Hintbox node should be rendered in the DOCX.
            // Per the documentation, we should return a Docx node
            // that's either a Paragraph, an array of Paragraphs, or a Table.
            return new Docx.Paragraph({
              children: node.content.map(content => convertTextNode(content)),
              style: 'Hintbox', // Here we apply our custom style to the Paragraph node.
            })
            },
        },
      ], // Custom nodes
      styleOverrides: {
        paragraphStyles: [
          // Here we define our custom styles for our custom Hintbox node.
          {
            id: 'Hintbox',
            name: 'Hintbox',
            basedOn: 'Normal',
            next: 'Normal',
            quickFormat: false,
            run: {
              font: 'Aptos Light',
              size: pixelsToHalfPoints(16),
            },
            paragraph: {
              spacing: {
                before: pointsToTwips(12),
                after: pointsToTwips(12),
                line: lineHeightToDocx(1),
              },
              border: {
                // DOCX colors are in Hexadecimal without the leading #
                top: { style: Docx.BorderStyle.SINGLE, size: 1, color: 'b8d8ff', space: 5 },
                bottom: { style: Docx.BorderStyle.SINGLE, size: 1, color: 'b8d8ff', space: 5 },
                right: { style: Docx.BorderStyle.SINGLE, size: 1, color: 'b8d8ff', space: 5 },
                left: { style: Docx.BorderStyle.SINGLE, size: 1, color: 'b8d8ff', space: 5 },
              },
              shading: {
                type: Docx.ShadingType.SOLID,
                color: 'e6f3ff',
              },
            },
          },
        ],
      }, // Style overrides
    }),
    // Other extensions ...
  ],
  // Other editor settings ...
})
\`\`\`

Then, at a later point in your application, you can export the editor content to a `DOCX` file:


\`\`\`ts
editor
  .chain()
  .exportDocx()
  .run()
\`\`\`

You can construct any supported `DOCX` elements in the `render` function using the `Docx` library classes (`Paragraph`, `TextRun`, `Table`, etc.) that are provided via the `Docx` import from the `@tiptap-pro/extension-export-docx` package.

## Import custom nodes from .docx

<CodeDemo src="https://develop--tiptap-pro.netlify.app/preview/Extensions/ImportDocxCustomNode" />

When importing a DOCX file, you can also define how custom nodes should be converted back to Tiptap nodes. This is done by passing an array of custom node definitions to the `import` command.

\`\`\`ts
import { Import } from '@tiptap-pro/extension-import'

// ... inside your Editor or useEditor setup:
Import.configure({
  appId: 'your-app-id',
  token: 'your-jwt',
  // ATTENTION: This is for demo purposes only
  endpoint: 'https://your-endpoint.com',
  imageUploadCallbackUrl: 'https://your-endpoint.com/image-upload',
  // Promisemirror custom node mapping
  promisemirrorNodes: {
    Hintbox: 'hintbox',
  },
}),
\`\`\`

The latest version of the `@tiptap-pro/extension-import` has available the `promisemirrorNodes` configuration option. This option allows you to map custom nodes from the DOCX to your Tiptap schema. In the example above, we are mapping the `Hintbox` custom node from the DOCX to the `hintbox` custom node in our Tiptap schema. By doing so, whenever the DOCX contains a `Hintbox` custom node, it will be converted to a `hintbox` node in Tiptap when imported.

<Callout title='DOCX, "prosemirrorNodes" and "prosemirrorMarks"' variant="info">
  Please note that the `promisemirrorNodes` and `prosemirrorMarks` options will only work if you're importing a `.docx` file. If you're importing another type of file, eg: an `.odt` file, the `/import` endpoint will be used instead of the `/import-docx` endpoint, and the `promisemirrorNodes` and `prosemirrorMarks` options will not be available, and therefore you'd need to rely on the [custom node and mark mapping API](/conversion/import-export/docx/rest-api#custom-node-and-mark-mapping) for those endpoints.
</Callout>

```

# conversion\import-export\docx\editor-export.mdx

```mdx
---
title: Export .docx from your editor
meta:
    title: Export DOCX | Tiptap Conversion
    description: Learn how to export Tiptap editor content to DOCX (Word) files using the Export extension in our docs.
    category: Conversion
---

import { Callout } from '@/components/ui/Callout'
import { CodeDemo } from '@/components/CodeDemo'

<CodeDemo src="https://develop--tiptap-pro.netlify.app/preview/Extensions/ExportDocx" />

Use Tiptap’s `@tiptap-pro/extension-export-docx` to export the editor's content as a `.docx` file. This extension integrates `DOCX` export functionality into your editor.

You can use this extension under any JavaScript environment, including server-side applications due to the isomorphic nature of the `exportDocx` function.

You can also use the [REST API](/conversion/import-export/docx/rest-api) instead if you'd prefer to handle the conversion on our end.

By default, the extension maps Tiptap nodes to DOCX elements. If your content includes custom nodes, configure their [export behavior](/conversion/import-export/docx/custom-node-conversion) to ensure they’re properly converted.

<Callout title="Subscription required" variant="warning">
    This extension requires a valid Tiptap subscription. As a [paid subscriber](https://tiptap.dev/pricing) you can install the extension by [accessing our
    private registry](/guides/pro-extensions).
</Callout>

## Install the DOCX Export extension

Install and import the **Export DOCX** extension package

\`\`\`bash
npm i @tiptap-pro/extension-export-docx
\`\`\`

Using the export extension does not require any Tiptap Conversion credentials, since the conversion is handled right away in the extension.

\`\`\`js
import { ExportDocx } from '@tiptap-pro/extension-export-docx'
\`\`\`

## Configuring the extension

The `ExportDocx` extension can be configured with an `ExportDocxOptions` (`object`) as an argument to the `configure` method with the following properties:

\`\`\`ts
// Import the ExportDocx extension
import { ExportDocx } from '@tiptap-pro/extension-export-docx'

const editor = new Editor({
  extensions: [
    // Other extensions ...
    ExportDocx.configure({
      onCompleteExport: (result: string | Buffer<ArrayBufferLike> | Blob | Stream) => void, // required
      exportType: 'blob', // optional. Default: 'blob'
      customNodes: [], // optional. Default: []
      styleOverrides: {}, // optional. Default: {}
    }),
    // Other extensions ...
  ],
  // Other editor settings ...
})
\`\`\`

| Parameter | Description | Default |
|-----------|-------------|---------|
| onCompleteExport | A **required** callback function that receives the exported data. You can then handle the data as needed (e.g., prompt a file download) | `N/A` |
| options | An object to configure some parts of the export:<br/><br/>**exportType**: The type of data returned by the method:<br/>- **buffer**: Returns a Node.js `Buffer` (server-side only)<br/>- **stream**: Returns a Node.js `Stream` (server-side only)<br/>- **string**: Returns a `String`<br/>- **blob**: Returns a `Blob` | `blob` |
| customNodes | An array of custom node definitions. If your content includes custom nodes, pass their definitions here to ensure they're properly converted | `[]` |
| styleOverrides | An object with custom styles to apply to the exported document. Use this to override the default export styles | `{}` |


## Export a DOCX file
With the extension installed, you can convert your editor’s content to `.docx`.

Before diving into an example, let's take a look into the signature of the `exportDocx` method available in your editor's commands:

\`\`\`ts
/**
* Export the current document as a .docx file
*
* Notes: 'buffer' and 'stream' export types are only available in the server environment
* as they use the Node Buffer and Stream APIs respectively
*
* @param onCompleteExport - Callback function to handle the exported file
* @param options - Export options
* @param customNodes - Custom node definitions to ensure proper conversion
* @param styleOverrides - Custom styles to apply to the exported document
* @example editor.commands.exportDocx((result) => {}, { exportType: 'buffer' }, [])
*
*/
exportDocx: (options?: ExportDocxOptions) => Promise<string | Buffer<ArrayBufferLike> | Blob | Stream>
\`\`\`

The `exportDocx` method takes an optional `ExportDocxOptions` (`object`) as an argument with the following properties that you can use to *override* the ones that you have configured with the `ExportDocx.configure` method:

| Parameter | Description | Default |
|-----------|-------------|---------|
| onCompleteExport | A **required** callback function (if you haven't defined it in the configure extension call) that receives the exported data. You can then handle the data as needed (e.g., prompt a file download) | `N/A` |
| options | An object to configure some parts of the export:<br/><br/>**exportType**: The type of data returned by the method:<br/>- **buffer**: Returns a Node.js `Buffer` (server-side only)<br/>- **stream**: Returns a Node.js `Stream` (server-side only)<br/>- **string**: Returns a `String`<br/>- **blob**: Returns a `Blob` | `blob` |
| customNodes | An array of custom node definitions. If your content includes custom nodes, pass their definitions here to ensure they're properly converted | `[]` |
| styleOverrides | An object with custom styles to apply to the exported document. Use this to override the default export styles | `{}` |

\`\`\`js
// Import the ExportDocx extension
import { ExportDocx } from '@tiptap-pro/extension-export-docx'

// Setup you editor
const editor = new Editor({
  extensions: [
    // Other extensions ...
    ExportDocx.configure({
      onCompleteExport: (result: string | Buffer<ArrayBufferLike> | Blob | Stream) => {}, // required
      exportType: 'blob', // optional. Default: 'blob'
      customNodes: [], // optional. Default: []
      styleOverrides: {}, // optional. Default: {}
    }),
    // Other extensions ...
  ],
  // Other editor settings ...
})

// Declare some functions that will call the exportDocx method from your editor

function handleExportDocx() {
  // Call your editor's exportDocx method
  editor
    .chain()
    // Method call without any overrides
    // It will take the configuration set in the configure method
    .exportDocx()
    .run()
}

function handleExportDocxBuffer() {
  // Call your editor's exportDocx method
  editor
    .chain()
    // Method call with some overrides
    .exportDocx({
      // Override the onCompleteExport callback to handle the override exported type
      onCompleteExport: (result: Buffer) => {
        // Handle the exported file in a buffer format
      },
      // Override the export type
      exportType: 'Buffer',
    })
    .run()
}

// Call those functions at any point in your application
handleExportDocx()
handleExportDocxBuffer()
\`\`\`

### How it works

The above example runs entirely in the browser, generating a DOCX Blob via the ExportDocx extension since it's the default value for the `exportType` as we haven't override it. We then programmatically download the file. You can adjust this logic, for instance, to send the blob to a server instead of downloading.

| Parameter | Description |
|-----------|-------------|
| onCompleteExport | When the conversion completes, we will get the `result` of the conversion as the main and only argument to the callback function which, in this case, it would be a `Blob` since we've declared that we wanted this type in the `exportType` within the `options` parameter. You can then handle it however you prefer, e.g. prompting a file download, like we showcased in the example above. |
| exportType | We're using the default `blob` so the conversion returns a `Blob`. |
| customNodes | We won't provide any custom node mapping since we are not providing any custom nodes. |
| styleOverrides | We won't provide any style overrides, and therefore, a default `DOCX` style is set following some common guideliness from Microsoft Word defaults and they will be applied to the exported document. |

## Server-side export

For applications requiring complex document generation or to reduce client-side bundle size, you can export `.docx` files in your the server.

In order to do so, you'd need to import the `exportDocx` function from the `@tiptap-pro/extension-export-docx` package, pass it your Tiptap JSON content, and return the resulting conversion to the client.

Let's first take a look into the `exportDocx` function signature:

\`\`\`ts
/**
 * Export the current document as a .docx file
 *
 * Notes: 'buffer' and 'stream' export types are only available in the server environment
 * as they use the Node Buffer and Stream APIs respectively
 *
 * @param options.document - The JSON representation of the document
 * @param options.exportType - The type of export to perform
 * @param options.customNodes - Custom node definitions
 * @param options.styleOverrides - Style overrides for the exported document
 * @example exportDocx({ document: editor.getJSON(), exportType: 'blob', customNodes: [], styleOverrides: {} })
 */
async function exportDocx ({ document, exportType, customNodes, styleOverrides }: ExportDocxOptions) {}
\`\`\`

The `exportDocx` function will return a `docx` document ready and converted to any format that .

Here you have a simple example using `Express` and `@tiptap-pro/extension-export-docx` on the server-side:


\`\`\`ts
import { exportDocx } from '@tiptap-pro/extension-export-docx'
import express from 'express'

const app = express()

app.post('/export-docx', async (req, res) => {
  try {
    // Get Tiptap JSON content from the request or from your database
    const { content } = req.body

    // Convert Tiptap JSON to DOCX
    const docxBuffer = await exportDocx({ document: content })

    // Send as a downloadable file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    res.setHeader('Content-Disposition', 'attachment; filename="document.docx"')
    res.send(docxBuffer)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
\`\`\`

## Support & Limitations

Exporting `.docx` files from Tiptap JSON provides a way to handle most standard Word content, but **it’s not a one-to-one mapping** due to inherent differences between DOCX formatting and Tiptap’s CSS-based styles.

Currently supported features and known limitations:

| **Feature**                      | **Support**                                                                |
|----------------------------------|----------------------------------------------------------------------------|
| **Text content**                 | ✓ Basic text, spacing, punctuation                                         |
| **Text formatting**              | ✓ Bold, italic, underline, strikethrough, alignment, line height           |
| **Block elements**               | ✓ Paragraphs, headings (1–6), blockquotes, ordered and unordered lists     |
| **Tables**                       | ✓ Basic structure, header rows, colspan                                    |
| **Links**                        | ✓ Hyperlinks                                                               |
| **Media (Images)**               | ✓ Embedded images, size preserved                                          |
| **Styles**                       | ✓ Font families*, Font colors, font sizes, background colors, line heights |
| **Headers & Footers**            | ~ In development                                                           |
| **Sections & Page Breaks**       | ~ In development                                                           |
| **Footnotes & Endnotes**         | ~ In development                                                           |
| **Math**                         | ~ In development                                                           |
| **Comments & Revisions**         | ✗                                                                          |
| **Table of Contents**            | ✗                                                                          |
| **Advanced Formatting**          | ✗ Columns, text direction, forms, macros, embedded scripts                 |
| **Metadata**                     | ✗                                                                          |
| **Text Boxes, Shapes, SmartArt** | ✗                                                                          |

<span style={{fontSize: '1rem'}}>* Font families are supported as long as the target font is installed on the operative system when the `.docx` file is opened.</span>

```

# conversion\import-export\docx\editor-import.mdx

```mdx
---
title: Import .docx in your editor
meta:
    title: Import DOCX | Tiptap Conversion
    description: Learn how to import DOCX (Word) documents into a Tiptap editor using the Import extension in our docs.
    category: Conversion
---

import { Callout } from '@/components/ui/Callout'
import { CodeDemo } from '@/components/CodeDemo'

<CodeDemo src="https://develop--tiptap-pro.netlify.app/preview/Extensions/ImportDocx" />

Converting `.docx` files to Tiptap JSON is simple with the `@tiptap-pro/extension-import` editor extension,
which integrates directly into your Tiptap Editor.

If you need to import `.docx` content outside the Editor, use the [REST API](/conversion/import-export/docx/rest-api).

<Callout title="Subscription required" variant="warning">
    This extension requires a valid Tiptap subscription. As a [paid subscriber](https://tiptap.dev/pricing) you can install the extension by [accessing our
    private registry](/guides/pro-extensions).
</Callout>

## Install the DOCX Import extension

Install the Tiptap Import extension package:

\`\`\`bash
npm i @tiptap-pro/extension-import
\`\`\`

Ensure your editor includes all necessary Tiptap extensions to handle content from DOCX. For example, include the Image extension for inline images, and the Table extension for tables.

## Required extensions
In order to fully map DOCX content (e.g. images, tables, styled text) onto Tiptap’s schema, you must include the relevant Tiptap extensions. Without these extensions, certain DOCX elements may not be recognized or properly rendered by the editor.

\`\`\`js
import StarterKit from '@tiptap/starter-kit'
import Color from '@tiptap/extension-color'
import FontFamily from '@tiptap/extension-font-family'
import Highlight from '@tiptap/extension-highlight'
import { Image } from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Paragraph from '@tiptap/extension-paragraph'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
\`\`\`

## Configure
Add the Import extension to your editor setup.

\`\`\`ts
// Import the Import extension
import { Import } from '@tiptap-pro/extension-import'

const editor = new Editor({
  extensions: [
    // Other extensions ...
    Import.configure({
      appId: 'your-app-id', // Your Convert App ID (see Tiptap Cloud settings)
      token: 'your-jwt-token', // JWT for authentication (see Authentication documentation)
      imageUploadCallbackUrl: 'https://your-image-upload-endpoint.com', // Your upload images endpoint
    })
    // Other extensions ...
  ],
  // Other editor settings ...
})
\`\`\`

| Property | Description |
|--------|-------------|
| `appId` | The ID of your Tiptap Convert app (find this in your Tiptap account's [conversion settings](https://cloud.tiptap.dev/convert-settings)) |
| `token` | A JWT authentication token generated by your server for the Convert service. (See the [Authentication guide](https://cloud.tiptap.dev/convert-settings) for details on obtaining and using these credentials.) |
| `imageUploadCallbackUrl` | An endpoint to upload images found in the DOCX. The conversion service will send each embedded image to this URL and use the returned URL in the content. And any images that cannot be handled will be stripped out. |

## Import a DOCX file
Once the extension is configured, you can import a DOCX file selected by the user.

### Basic import
The simplest approach is to pass the file directly to the `import` command. Here it replaces the current editor content with the converted content and focuses the editor:
\`\`\`js
editor.chain().focus().import({ file }).run()
\`\`\`
In most cases, this one-liner is all you need to let users import `.docx` files. The extension handles sending the file to the conversion endpoint, retrieving the converted Tiptap JSON, and inserting it into the editor.

### Import handling
In order to have more control after the import process have finished, you would use the `onImport` callback to handle the conversion result. This callback provides the converted content, any errors that occurred, and a function called `setEditorContent` to insert the content from `context.content` into the editor. If you don't provide an `onImport` callback, the extension will automatically insert the content into the editor but you won't be able to handle anything else like errors or loading states.

\`\`\`js
editor
  .chain()
  .import({
    file,
    onImport(context) {
      const { setEditorContent, content, error } = context

      // Add error handling
      if (error) {
        showErrorToast({ message: error.message })
      }

      // You could also modify the content before inserting it
      content.doc.content.push({ type: 'paragraph', content: [{ type: 'text', text: 'Hello!' }] })

      // You can change the loading state of your application for example
      isLoading = false

      // Perform the insertion in the editor
      editor.commands.setEditorContent(content)
    },
  })
  .focus()
  .run()
\`\`\`

Operations that we have controlled in the example above:

| Operation            | Description                                                                                                                                                                                                                                                                         |
|----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Error Handling       | If the conversion fails, you can display a toast or log the error.                                                                                                                                                                                                                  |
| Content Modification | You can insert extra nodes, remove certain nodes, or otherwise adjust the converted Tiptap JSON as needed.                                                                                                                                                                          |
| Editor Insertion     | If you want to rely on the extension's default insertion behavior (replacing the editor content), you can call the `setEditorContent()` function provided in the callback. If you modify the content yourself, you must manually set it with `editor.commands.setContent(content)`. |

## Support & Limitations
Importing `.docx` files into Tiptap provides a way to handle most standard Word content, but **it’s not a one-to-one mapping** due to inherent differences between DOCX formatting and Tiptap’s CSS-based styles.

Currently supported features and known limitations:

| **Feature**                      | **Support**                                                                |
|----------------------------------|----------------------------------------------------------------------------|
| **Text content**                 | ✓ Basic text, spacing, punctuation                                         |
| **Text formatting**              | ✓ Bold, italic, underline, strikethrough, alignment, line height           |
| **Block elements**               | ✓ Paragraphs, headings (1–6), blockquotes, ordered and unordered lists     |
| **Tables**                       | ✓ Basic structure, header rows, colspan                                    |
| **Links**                        | ✓ Hyperlinks                                                               |
| **Media (Images)**               | ✓ Embedded images, size preserved                                          |
| **Styles**                       | ✓ Font families*, Font colors, font sizes, background colors, line heights |
| **Headers & Footers**            | ~ In development                                                           |
| **Sections & Page Breaks**       | ~ In development                                                           |
| **Footnotes & Endnotes**         | ~ In development                                                           |
| **Math**                         | ~ In development                                                           |
| **Comments & Revisions**         | ✗                                                                          |
| **Table of Contents**            | ✗                                                                          |
| **Advanced Formatting**          | ✗ Columns, text direction, forms, macros, embedded scripts                 |
| **Metadata**                     | ✗                                                                          |
| **Text Boxes, Shapes, SmartArt** | ✗                                                                          |

<span style={{fontSize: '1rem'}}>* Font families are supported as long as the target font is installed on the operative system when the `.docx` file is opened.</span>

```

# conversion\import-export\docx\export-styles.mdx

```mdx
---
title: Export custom styles to .docx
meta:
    title: Export styles | Tiptap Conversion
    description: Learn how to export custom styles from Tiptap JSON to DOCX in our documentation.
    category: Conversion
---

import { Callout } from '@/components/ui/Callout'
import { CodeDemo } from '@/components/CodeDemo'

When exporting to `DOCX`, you can define custom styles that will be applied to the exported document. This is useful when you want to have a consistent look and feel across your documents.

\`\`\`ts
// Import the ExportDocx extension
import { ExportDocx } from '@tiptap-pro/extension-export-docx'

const editor = new Editor({
  extensions: [
    // Other extensions ...
    ExportDocx.configure({
      onCompleteExport: (result: string | Buffer<ArrayBufferLike> | Blob | Stream) => {}, // required
      styleOverrides: { // Style overrides
        paragraphStyles: [
          // Heading 1 style override
          {
            id: 'Heading1',
            name: 'Heading 1',
            basedOn: 'Normal',
            next: 'Normal',
            quickFormat: true,
            run: {
              font: 'Aptos',
              size: pointsToHalfPoints(16),
              bold: true,
              color: 'FF0000',
            },
            paragraph: {
              spacing: {
                before: pointsToTwips(12),
                after: pointsToTwips(6),
                line: lineHeightToDocx(1.15),
              },
            },
          },
        ]
      }
    }),
    // Other extensions ...
  ],
  // Other editor settings ...
})
\`\`\`


In the example above ☝️ we are exporting a document with a custom `Heading 1` style. The style is based on the `Normal` style, has a red color, and uses the `Aptos` font. The spacing before the paragraph is set to `12pt`, and `6pt` after it. The line height is set to `1.15`.

You can also create custom styling for other elements like `Heading 2`, `Heading 3`, `List Bullet`, `List Number`, etc. The `paragraphStyles` array accepts an array of objects with the following properties:

### Paragraph style object

A `paragraphStyle` object accepts the following properties:

| Property      | Type    | Description                                                       |
|---------------|---------|-------------------------------------------------------------------|
| `id`          | `string`  | Unique identifier for the style.                                  |
| `name`        | `string`  | Display name of the style.                                        |
| `basedOn`     | `string`  | The base style (e.g., `Normal`) that this style builds upon.      |
| `next`        | `string`  | The style to apply to the following paragraph.                    |
| `quickFormat` | `boolean` | If `true`, the style appears in the quick format menu.            |
| `run`         | `object`  | Defines text formatting (font, size, color, bold, etc.).          |
| `paragraph`   | `object`  | Defines paragraph formatting (spacing, alignment, borders, etc.). |

### Run style properties

The `run` object from a `paragraphStyle` accepts the following properties:

| Property              | Type           | Description                                                             |
|-----------------------|----------------|-------------------------------------------------------------------------|
| `font`                | `string`         | Font family for the text.                                               |
| `size`                | `number`         | Font size in half-points (e.g., 16 points = 32).                        |
| `bold`                | `boolean`        | Set to `true` to make the text bold.                                    |
| `italics`             | `boolean`        | Set to `true` for italic text.                                          |
| `color`               | `string`         | Text color in hex format (e.g., `FF0000` for red. No # necessary).      |
| `kern`                | `number`         | Adjusts the spacing between characters in points.                       |
| `effect`              |                | Special text effects that can be applied.                               |
| `emphasisMark`        | `string`         | Emphasis marks that appear above or below text. (like `dot`)            |
| `smallCaps`           | `boolean`        | Set to `true` to display text in small capitals.                        |
| `allCaps`             | `boolean`        | Set to `true` to display text in all uppercase.                         |
| `strike`              | `boolean`        | Set to `true` to apply a single strikethrough.                          |
| `doubleStrike`        | `boolean`        | Set to `true` to apply a double strikethrough.                          |
| `subScript`           | `boolean`        | Set to `true` for subscript text.                                       |
| `superScript`         | `boolean`        | Set to `true` for superscript text.                                     |
| `highlight`           |                | Highlight color (predefined values).                                    |
| `characterSpacing`    | `number`         | Adjusts spacing between characters in TWIPs (…we know, TWIPs right?     |
| `shading`             | `object`              | Applies background shading to the text.                                 |
| `shading` → `type`    | `ShadingType`         | The shading type (`clear`, `solid`, `horizontalStripe`, etc.).          |
| `shading` → `fill`    | `string`         | The shading fill color in hex format (e.g., `FF0000` for red).          |
| `shading` → `color`   | `string`         | The shading color in hex format (e.g., `FF0000` for red).               |
| `scale`               | `number`         | Adjusts the width of the text (as a percentage).                        |
| `underline`           | `object` | Underline style, specify properties like `color` and `type` or and empty object for a simple underline.  |
| `underline` → `color` | `string`         | Underline color in hex format (e.g., `FF0000` for red. No # necessary). |
| `underline` → `type`  | `UnderlineType`         | The underline type (`single`, `double` or `thick`)                      |

For more advanced styling options and detailed usage you can refer to the `IRunStylePropertiesOptions` type exposed from our package, or refer to the [docx documentation](https://docx.js.org/#/usage/styling-with-js).

### Paragraph style properties

The `paragraph` object from a `paragraphStyle` accepts the following properties:

| Property                  | Type    | Description                                                              |
|---------------------------|---------|--------------------------------------------------------------------------|
| `spacing`                 | `object`  | Controls spacing: properties like `before`, `after`, and `line`.         |
| `alignment`               | `string`  | Sets paragraph alignment (`left`, `center`, `right`, or `justify`).      |
| `border`                  | `object`  | Defines borders around the paragraph (top, bottom, left, right).         |
| `shading`                 | `object`  | Applies background shading to the paragraph.                             |
| `indent`                  | `object`  | Specifies indentation (first line, hanging, left, right).                |
| `contextualSpacing`       | `boolean` | If `true`, reduces spacing between paragraphs of the same style.         |
| `keepNext`                | `boolean` | Keeps this paragraph on the same page as the next.                       |
| `keepLines`               | `boolean` | Keeps all lines of the paragraph together on the same page.              |
| `outlineLevel`            | `number`  | Sets the outline level for document organization (typically 1–9).        |
| `thematicBreak`           | `number`  | Adds a horizontal line break when set to `true`.                         |
| `rightTabStop`            | `number`  | Sets the position of the right tab stop in twips.                        |
| `leftTabStop`             | `number`  | Sets the position of the left tab stop in twips.                         |
| `numbering`               | `object`  | Controls numbering settings (e.g., reference, level, custom formatting). |
| `numbering` → `reference` | `string`       | The numbering style reference ID.                                        |
| `numbering` → `level`     | `number`        | The level in the numbering hierarchy (0-based).                          |
| `spacing`                 | `object`        | Controls the spacing of the paragraph.                                   |
| `spacing` → `before`      | `number`        | Space before the paragraph.                                              |
| `spacing` → `after`       | `number`        | Space after the paragraph.                                               |
| `spacing` → `line`        | `number`        | Line spacing within the paragraph.                                       |
| `spacing` → `lineRule`    | `LineRuleType`       | Defines how the line spacing is calculated.                              |

For more advanced styling options and detailed usage you can refer to the `IParagraphStylePropertiesOptions` type exposed from our package, or refer to the [docx documentation](https://docx.js.org/#/usage/styling-with-js).

## Tiptap's export default styles

Tiptap offers a sensible default styling for the exported document, but you can override these styles by providing your own custom styles. This allows you to create a consistent look and feel across your documents. 

\`\`\`ts
{
  paragraphStyles: [
    // Normal style (default for most paragraphs)
    {
      id: 'Normal',
      name: 'Normal',
      run: {
        font: 'Aptos',
        size: pointsToHalfPoints(11),
      },
      paragraph: {
        spacing: {
          before: 0,
          after: pointsToTwips(10),
          line: lineHeightToDocx(1.15),
        },
      },
    },
    // List Paragraph style (used for bullets and numbering)
    {
      id: 'ListParagraph',
      name: 'List Paragraph',
      basedOn: 'Normal',
      quickFormat: true,
      run: {
        font: 'Aptos',
        size: pointsToHalfPoints(11),
      },
      paragraph: {
        spacing: {
          before: 0,
          after: pointsToTwips(2),
          line: lineHeightToDocx(1),
        },
      },
    },
    // Heading 1 style
    {
      id: 'Heading1',
      name: 'Heading 1',
      basedOn: 'Normal',
      next: 'Normal',
      quickFormat: true,
      run: {
        font: 'Aptos Light',
        size: pointsToHalfPoints(16),
        bold: true,
        color: '2E74B5',
      },
      paragraph: {
        spacing: {
          before: pointsToTwips(12),
          after: pointsToTwips(6),
          line: lineHeightToDocx(1.15),
        },
      },
    },
    // Heading 2 style
    {
      id: 'Heading2',
      name: 'Heading 2',
      basedOn: 'Normal',
      next: 'Normal',
      quickFormat: true,
      run: {
        font: 'Aptos Light',
        size: pointsToHalfPoints(14),
        bold: true,
        color: '2E74B5',
      },
      paragraph: {
        spacing: {
          before: pointsToTwips(12),
          after: pointsToTwips(6),
          line: lineHeightToDocx(1.15),
        },
      },
    },
    // Heading 3 style
    {
      id: 'Heading3',
      name: 'Heading 3',
      basedOn: 'Normal',
      next: 'Normal',
      quickFormat: true,
      run: {
        font: 'Aptos',
        size: pointsToHalfPoints(13),
        bold: true,
        color: '2E74B5',
      },
      paragraph: {
        spacing: {
          before: pointsToTwips(12),
          after: pointsToTwips(6),
          line: lineHeightToDocx(1.15),
        },
      },
    },
    // Heading 4 style
    {
      id: 'Heading4',
      name: 'Heading 4',
      basedOn: 'Normal',
      next: 'Normal',
      quickFormat: true,
      run: {
        font: 'Aptos',
        size: pointsToHalfPoints(12),
        bold: true,
        color: '2E74B5',
      },
      paragraph: {
        spacing: {
          before: pointsToTwips(12),
          after: pointsToTwips(6),
          line: lineHeightToDocx(1.15),
        },
      },
    },
    // Heading 5 style
    {
      id: 'Heading5',
      name: 'Heading 5',
      basedOn: 'Normal',
      next: 'Normal',
      quickFormat: true,
      run: {
        font: 'Aptos',
        size: pointsToHalfPoints(11),
        bold: true,
        color: '2E74B5',
      },
      paragraph: {
        spacing: {
          before: pointsToTwips(12),
          after: pointsToTwips(6),
          line: lineHeightToDocx(1.15),
        },
      },
    },
    // Title style
    {
      id: 'Title',
      name: 'Title',
      basedOn: 'Normal',
      next: 'Normal',
      quickFormat: true,
      run: {
        font: 'Aptos Light',
        size: pointsToHalfPoints(22),
        bold: true,
        color: '000000',
      },
      paragraph: {
        alignment: AlignmentType.CENTER,
        spacing: {
          before: 0,
          after: 0,
          line: lineHeightToDocx(1.15),
        },
      },
    },
    // Subtitle style
    {
      id: 'Subtitle',
      name: 'Subtitle',
      basedOn: 'Normal',
      next: 'Normal',
      quickFormat: true,
      run: {
        font: 'Aptos Light',
        size: pointsToHalfPoints(16),
        italics: true,
        color: '666666',
      },
      paragraph: {
        alignment: AlignmentType.CENTER,
        spacing: {
          before: 0,
          after: 0,
          line: lineHeightToDocx(1.15),
        },
      },
    },
    // Quote style (typically for indented, italic text)
    {
      id: 'Quote',
      name: 'Quote',
      basedOn: 'Normal',
      quickFormat: true,
      run: {
        font: 'Aptos',
        italics: true,
      },
      paragraph: {
        alignment: AlignmentType.CENTER,
        spacing: {
          before: pointsToTwips(10),
          after: pointsToTwips(10),
          line: lineHeightToDocx(1.15),
        },
      },
    },
    // Intense Quote style (more pronounced indentation)
    {
      id: 'IntenseQuote',
      name: 'Intense Quote',
      basedOn: 'Normal',
      quickFormat: true,
      run: {
        font: 'Aptos',
        italics: true,
        color: '444444',
      },
      paragraph: {
        alignment: AlignmentType.CENTER,
        spacing: {
          before: pointsToTwips(10),
          after: pointsToTwips(10),
          line: lineHeightToDocx(1.15),
        },
      },
    },
    // No Spacing style (no extra space before or after paragraphs)
    {
      id: 'NoSpacing',
      name: 'No Spacing',
      basedOn: 'Normal',
      quickFormat: true,
      paragraph: {
        spacing: {
          before: 0,
          after: 0,
          line: lineHeightToDocx(1),
        },
      },
    },
    // Hyperlink style
    {
      id: 'Hyperlink',
      name: 'Hyperlink',
      basedOn: 'Normal',
      run: {
        color: '0563C1',
        underline: {
          type: 'single',
        },
      },
    },
  ],
}
\`\`\`

```

# conversion\import-export\docx\index.mdx

```mdx
---
title: Import & export DOCX with Tiptap
meta:
    title: DOCX | Tiptap Conversion
    description: Review DOCX import and export options, REST API usage, and customizations for Tiptap in our docs.
    category: Conversion
---

import { Callout } from '@/components/ui/Callout'

Integrating `DOCX` (Microsoft Word) conversion with Tiptap can be done in several ways, from adding in-editor “Import/Export DOCX” buttons to using the REST API for server-side workflows.

<Callout title="Subscription required" variant="warning">
    These extensions and endpoints require a valid Tiptap subscription. As a [paid subscriber](https://tiptap.dev/pricing) you can install the extensions by [accessing our
    private registry](/guides/pro-extensions).
</Callout>

| Method                    | Description                                                                                                                                                                                        | Documentation                                                                                                                                          |
|---------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Editor Import**         | Let users upload `.docx` files directly in the editor (e.g., “Import DOCX” button), converting them to Tiptap JSON for editing. This extension makes a request to our REST API for the conversion. | [DOCX Editor import](/conversion/import-export/docx/editor-import)                                                                                     |
| **Editor Export**         | Provides the functionality to generate `.docx` from Tiptap content. You can use this extension both on client and on server  and it also supports **custom nodes**.                                | [DOCX Editor export](/conversion/import-export/docx/editor-export)                                                                                     |
| **REST API**              | Ideal for server-side or external `.docx` conversions (batch processing, no in-editor interaction). Sends `.docx` to get Tiptap JSON or vice versa. **Cannot handle custom nodes.**                | [DOCX conversion REST API](/conversion/import-export/docx/rest-api)                                                                                    |
| **Custom nodes & styles** | If you have custom Tiptap extensions or need deeper style control, you can override defaults or provide custom renderers for `.docx` output.                                                       | [Export styles for DOCX](/conversion/import-export/docx/export-styles), [Custom nodes for DOCX](/conversion/import-export/docx/custom-node-conversion) |

<Callout title="Information related to custom nodes" variant="hint">
    The REST API can’t handle custom node conversions. For that, implement the Editor Export extension on your own server or on the client so you can define how those nodes convert.
</Callout>

```

# conversion\import-export\docx\preserve-images.mdx

```mdx
---
title: Preserve images during conversion
meta:
    title: Preserve images | Tiptap Conversion
    description: Preserve images in your converted documents by providing an image upload callback url. Learn more in the docs.
    category: Conversion
---

import { Callout } from '@/components/ui/Callout'

Some documents that you're importing may include images that you may want to preserve in the converted document.

<Callout title="Note" variant="info">
    Tiptap does not provide an image upload service. You will need to implement your own server to
    handle image uploads.
</Callout>

## Import images

If you import a DOCX file that has images, the conversion service can include those images in the resulting Tiptap JSON only if you provide an image upload callback URL.

This is a URL endpoint on your server that the conversion service will use to offload images during the import process.

\`\`\`js
 import { Editor } from '@tiptap/core'
 import { Import } from '@tiptap-pro/extension-import'

 const editor = new Editor({
   // ... other editor options,
   extensions: [
     Import.configure({
       appId: '<your-app-id>',
       token: '<your-jwt>',
       imageUploadCallbackUrl: 'https://your-server.com/upload-image'
     })
   ]
 })
 \`\`\`
In this configuration, `imageUploadCallbackUrl` is set to an endpoint (e.g., on your server) that will handle receiving image files. If this is not provided, the importer will strip out images from the document.

When an import is triggered, the conversion service will upload each embedded image to the URL you provided.

### Callback process
This endpoint can be implemented with any web framework or cloud function. The key steps you need to integrate are:

1. **Receive the file:** The request will contain the image file data which you will need to parse on your server.
2. **Store the image:** Save the image to a location that is accessible via URL. This could be an AWS S3 bucket, a storage service like Cloudinary, or a public folder on your server. Generate a public URL or path for the saved file.
3. **Return the URL:** Send back a JSON response containing the image’s URL. For example: `{ "url": "https://my-cdn.com/uploads/unique-image-name.png" }`. Make sure to send an HTTP 200 status. The converter will use the provided URL in the editor content.

The Tiptap conversion service then takes that URL and inserts it into the Tiptap JSON as the `src` of an image node.

### Important considerations
- **Public accessibility:** The endpoint URL you provide must be reachable from the internet, since Tiptap’s cloud service will call it. It cannot be localhost or behind a firewall. Likewise, the returned image URL should be publicly accessible (or at least accessible to anyone who needs to view the document)
- **Correct response format:** Your endpoint should return a JSON object with a url field exactly. If the conversion service cannot parse the response or doesn’t find a URL, the image won’t be inserted.
- **Security:** Tiptap doesn’t restrict what endpoint you use. You can include tokens or keys in the URL (e.g., https://your-server.com/upload-image?key=123) to control access. The conversion service will simply call that URL. Implement any necessary auth on your side (for instance, verifying a secret token in the request headers or URL).
- **Persistence of images:** The URLs you return will be used in your editor’s content going forward. For example, after import, your editor will have image nodes with src: "https://my-cdn.com/uploads/unique-image-name.png". Anyone who later exports or views that content will attempt to load that URL. Make sure the images remain available at those URLs (don’t delete them immediately)​

### Server implementation example
This example shows a simple server implementation that accepts image uploads & uploads them to an S3 bucket configured by environment variables.

\`\`\`ts
 import { serve } from '@hono/node-server'
 import { Hono } from 'hono'
 import { Upload } from '@aws-sdk/lib-storage'
 import { S3Client } from '@aws-sdk/client-s3'

 const {
   AWS_ACCESS_KEY_ID,
   AWS_SECRET_ACCESS_KEY,
   AWS_REGION,
   AWS_S3_BUCKET,
   PORT = '3011',
   AWS_ENDPOINT,
   AWS_FORCE_STYLE,
 } = process.env

 if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_S3_BUCKET) {
   console.error('Please provide AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET')
   process.exit(1)
 }

 const s3 = new S3Client({
   credentials: {
     accessKeyId: AWS_ACCESS_KEY_ID,
     secretAccessKey: AWS_SECRET_ACCESS_KEY,
   },

   region: AWS_REGION,
   endpoint: AWS_ENDPOINT,
   forcePathStyle: AWS_FORCE_STYLE === 'true',
 })

 const app = new Hono() as Hono<any>

 app.post('/upload', async (c) => {
   const body = await c.req.parseBody()
   const file = body['file']

   if (!file || typeof file === 'string') {
     return c.json({ error: 'No file uploaded' }, 400)
   }

   try {
     const data = await new Upload({
       client: s3,
       params: {
         Bucket: AWS_S3_BUCKET,
         // file.name is just current timestamp & file extension
         Key: file.name,
         Body: file,
         ContentType: file.type,
       },
     }).done()

     return c.json({ url: data.Location })
   } catch (error) {
     console.error(error)
     return c.json({ error: 'Failed to upload file' }, 500)
   }
 })

 serve({
   fetch: app.fetch,
   port: Number(PORT) || 3000,
 })
\`\`\`

Here is another implementation using bun with no dependencies:

\`\`\`ts
 const s3Client = new Bun.S3Client({
   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
   region: process.env.AWS_REGION,
   bucket: process.env.AWS_BUCKET,
   endpoint: process.env.AWS_ENDPOINT,
 })

 Bun.serve({
   port: 8081,
   async fetch(req) {
     const url = new URL(req.url)

     // Handle file uploads on the /upload endpoint
     if (url.pathname === '/upload') {
       const formdata = await req.formData()
       const file = formdata.get('file')

       if (!file || typeof file === 'string') {
         return new Response(JSON.stringify({ error: 'No file uploaded' }), {
           status: 400,
           headers: {
             'content-type': 'application/json',
           },
         })
       }

       try {
         // The file already has a name and type, so we can use it directly
         const s3File = s3Client.file(file.name, { type: file.type })
         // Write the file to S3
         await s3File.write(file)

         return new Response(
           JSON.stringify({
             // Send the URL of the uploaded file back to the client to insert it into the editor
             url: new Response(s3File).headers.get('location'),
           }),
           {
             headers: {
               'content-type': 'application/json',
             },
           },
         )
       } catch (error) {
         return new Response(
           JSON.stringify({
             error: error instanceof Error ? error.message : 'Failed to upload file',
           }),
           {
             status: 500,
             headers: {
               'content-type': 'application/json',
             },
           },
         )
       }
     }

     return new Response(JSON.stringify({ error: 'Not found' }), {
       status: 404,
     })
   },
 })
\`\`\`

```

# conversion\import-export\docx\rest-api.mdx

```mdx
---
title: Convert .docx via REST API
meta:
    title: DOCX REST API | Tiptap Conversion
    description: Learn how to integrate import and export functionality via REST API for docx files in our documentation.
    category: Conversion
---

import { Callout } from '@/components/ui/Callout'
import { CodeDemo } from '@/components/CodeDemo'

The `DOCX` document conversion API supports conversion from and to Tiptap’s `JSON` format.

<Callout title="Review the postman collection" variant="hint">
    You can also experiment with the Document Conversion API by heading over to our [Postman
    Collection](https://www.postman.com/docking-module-explorer-14290287/workspace/tiptap-collaboration-public/collection/33042171-cc186a66-df41-4df8-9c6e-e91b20deffe5?action=share&creator=32651125).
</Callout>


## Import DOCX

`POST /v2/convert/import`

The `/v2/convert/import` endpoint converts `docx` files into Tiptap’s JSON format. Users can `POST` documents to this endpoint and use various parameters to customize how different document elements are handled during the conversion process.

### Example (cURL)
\`\`\`bash
curl -X POST "https://api.tiptap.dev/v2/convert/import" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "X-App-Id: YOUR_APP_ID" \
    -F "file=@/path/to/your/file.docx" \
    -F "imageUploadCallbackUrl=https://your-image-upload-endpoint.com" \
    -F "promisemirrorNodes={\"nodeKey\":\"nodeValue\"}" \
    -F "prosemirrorMarks={\"markKey\":\"markValue\"}"
\`\`\`

<Callout title="Subscription required" variant="warning">
    This endpoint requires a valid Tiptap subscription. For more details review our [pricing page](https://tiptap.dev/pricing).
</Callout>

### Required headers

| Name            | Description                                                                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `Authorization` | The JWT token to authenticate the request. Example: `Bearer your-jwt-token`                                                                     |
| `X-App-Id`      | The Convert App-ID from the Collaboration settings page: [https://cloud.tiptap.dev/convert-settings](https://cloud.tiptap.dev/convert-settings) |

### Body

| Name                     | Type     | Description                                                                                                                  |
| ------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `file`                   | `File`   | The file to convert                                                                                                          |
| `imageUploadCallbackUrl` | `string` | The callback endpoint to upload images that were encountered within the uploaded document, [see more info](#image-uploading) |
| `prosemirrorNodes`       | `Object string` | Custom node mapping for the conversion, [see more info](/conversion/import-export/docx/custom-node-conversion).       |
| `prosemirrorMarks`       | `Object string` | Custom mark mapping for the conversion, [see more info](/conversion/import-export/docx/custom-mark-conversion)        |

### Custom node and mark mapping

You can override the default `node/mark` types used during import by specifying them in the body of your request within `prosemirrorNodes` and `prosemirrorMarks` respectively. You would need to provide these if your editor uses custom `nodes/marks` and you want the imported `JSON` to use those.

For example, if your schema uses a custom node type called `textBlock` instead of the default paragraph, you can include `"{\"paragraph\":\"textBlock\"}"` in the request body.

You can similarly adjust headings, lists, marks like bold or italic, and more.

#### Default nodes

| Name             | Description                                                          |
| ---------------- | -------------------------------------------------------------------- |
| `paragraph`      | Defines which prosemirror type is used for paragraph conversion      |
| `heading`        | Defines which prosemirror type is used for heading conversion        |
| `blockquote`     | Defines which prosemirror type is used for blockquote conversion     |
| `codeblock`      | Defines which prosemirror type is used for codeblock conversion      |
| `bulletlist`     | Defines which prosemirror type is used for bulletList conversion     |
| `orderedlist`    | Defines which prosemirror type is used for orderedList conversion    |
| `listitem`       | Defines which prosemirror type is used for listItem conversion       |
| `hardbreak`      | Defines which prosemirror type is used for hardbreak conversion      |
| `horizontalrule` | Defines which prosemirror type is used for horizontalRule conversion |
| `table`          | Defines which prosemirror type is used for table conversion          |
| `tablecell`      | Defines which prosemirror type is used for tableCell conversion      |
| `tableheader`    | Defines which prosemirror type is used for tableHeader conversion    |
| `tablerow`       | Defines which prosemirror type is used for tableRow conversion       |
| `image`          | Defines which prosemirror mark is used for image conversion          |

#### Default marks

| Name             | Description                                                          |
| ---------------- | -------------------------------------------------------------------- |
| `bold`           | Defines which prosemirror mark is used for bold conversion           |
| `italic`         | Defines which prosemirror mark is used for italic conversion         |
| `underline`      | Defines which prosemirror mark is used for underline conversion      |
| `strikethrough`  | Defines which prosemirror mark is used for strikethrough conversion  |
| `link`           | Defines which prosemirror mark is used for link conversion           |
| `code`           | Defines which prosemirror mark is used for code conversion           |


## Export DOCX

`POST /v2/convert/export`

The `/v2/convert/export` endpoint converts Tiptap documents into `DOCX` format. Users can `POST` documents to this endpoint and use various parameters to customize how different document elements are handled during the conversion process.


<Callout title="Export customization support" variant="info">
    The `/v2/convert/export` endpoint does not support custom node conversions as functions cannot be serialized, but it does support [custom style overrides](/conversion/import-export/docx/export-styles). If you wish to convert your documents on the server on your own premises to have this option available, you can follow the [server side export guide](/conversion/import-export/docx/editor-export#server-side-export).
</Callout>

### Example (cURL)
\`\`\`bash
curl --output example.docx -X POST https://api.tiptap.dev/v2/convert/export \
    -H "Authorization: Bearer <your-jwt-token>" \
    -H "X-App-Id: <your-app-id>" \
    -F 'doc={"type":"doc","content":[{"type":"paragraph","attrs":{"textAlign":"left"},"content":[{"type":"text","text":"Welcome to this demonstration of our editor'\''s ability to export a wide array of formatting options to DOCX, ensuring that your content retains its intended appearance in Word."}]}]}' \
    -F 'exportType=blob' \
    -F 'styleOverrides={}'
\`\`\`

<Callout title="Subscription required" variant="warning">
    This endpoint requires a valid Tiptap subscription. For more details review our [pricing page](https://tiptap.dev/pricing).
</Callout>

### Required headers

| Name            | Description                                                                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `Authorization` | The JWT token to authenticate the request. Example: `Bearer your-jwt-token`                                                                     |
| `X-App-Id`      | The Convert App-ID from the Collaboration settings page: [https://cloud.tiptap.dev/convert-settings](https://cloud.tiptap.dev/convert-settings) |

### Body

| Name                     | Type     | Description              | Default |
| ------------------------ | -------- | -------------------------|---------|
| `doc`                    | `String` | Tiptap's JSON            | `N/A`   |
| `exportType`             | `string` | The expected export type | `blob`  |
| `styleOverrides`         | `Object` | Style overrides          | `{}`    |

```

# conversion\import-export\markdown\editor-extensions.mdx

```mdx
---
title: Convert markdown with Tiptap
meta:
    title: Markdown | Tiptap Conversion
    description: Learn how to handle Markdown files in a Tiptap editor, including in-editor import/export and REST API usage.
    category: Conversion
---

import { Callout } from '@/components/ui/Callout'

Tiptap’s Conversion tools support handling **Markdown** (`.md`) files in three ways:

- **Editor Import** – Convert `.md` files directly into Tiptap JSON for in-editor editing.
- **Editor Export** – Convert Tiptap content into `.md` (either standard Markdown or GitHub Flavored Markdown).
- **REST API** – Integrate markdown conversion on the server with the [MD conversion REST API](/conversion/import-export/markdown/rest-api), without using the Tiptap editor directly.

<Callout title="Subscription required" variant="warning">
    These extensions require a valid Tiptap subscription. To install the extension, you need [access to our
    private registry](/guides/pro-extensions).
</Callout>

## Editor Markdown Import

**Install the Import extension:**

\`\`\`bash
npm i @tiptap-pro/extension-import
\`\`\`

### Configure the extension in your editor
\`\`\`js
import { Import } from '@tiptap-pro/extension-import'

const editor = new Editor({
  // ...
  extensions: [
    // ...
    Import.configure({
      // Your Convert App ID from https://cloud.tiptap.dev/convert-settings
      appId: 'your-app-id',

      // JWT token you generated
      token: 'your-jwt',

      // If your markdown includes images, you can provide a URL for image upload
      imageUploadCallbackUrl: 'https://your-image-upload-url.com',
    }),
  ],
})
\`\`\`

### Import your first document
\`\`\`js
editor.chain().focus().import({ file }).run()
\`\`\`
This uploads the chosen `.md` file to the Conversion API, converts it into Tiptap JSON, and replaces the current editor content.

### Customize the import behavior

\`\`\`js
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
\`\`\`

### Options
| Name                     | Type       | Default     | Description                                                                                                         |
| ------------------------ | ---------- | ----------- | ------------------------------------------------------------------------------------------------------------------- |
| `appId`                  | `string`   | `undefined` | Convert App ID from [https://cloud.tiptap.dev/convert-settings](https://cloud.tiptap.dev/convert-settings)          |
| `token`                  | `string`   | `undefined` | JWT token generated on your server                                                                                  |
| `imageUploadCallbackUrl` | `string`   | `undefined` | If not set, images in Markdown may be handled as external links or omitted (depending on the file’s structure)       |

### Commands
| Command   | Description                           |
| --------- | ------------------------------------- |
| `import`  | Import a file into the editor content |

### `import` arguments
| Name       | Type       | Default     | Options           | Description                                                                                                               |
| ---------- | ---------- | ----------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `file`     | `File`     | `undefined` | Any file          | The file to import                                                                                                        |
| `format`   | `string`   | `undefined` | `gfm` (optional)  | If set to `gfm`, the conversion treats the input as GitHub Flavored Markdown                                              |
| `onImport` | `Function` | `undefined` | `fn(context)`     | Callback to customize import. Receives a context with the Tiptap JSON `content`, any `error`, and `setEditorContent()`.   |

## Editor Markdown Export

### Install the Export extension:
\`\`\`bash
npm i @tiptap-pro/extension-export
\`\`\`

### Configure the extension in your editor

\`\`\`js
import { Export } from '@tiptap-pro/extension-export'

const editor = new Editor({
  // ...
  extensions: [
    // ...
    Export.configure({
      appId: 'your-app-id',
      token: 'your-jwt',
    }),
  ],
})
\`\`\`

### Export a document
\`\`\`js
// Export the editor's content as markdown
// Supported export formats: docx, odt, md, gfm
editor.chain().focus().export({ format: 'md' }).run()
\`\`\`

### Customize the export behavior

\`\`\`js
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
\`\`\`

### Options
| Name    | Type     | Default     | Description                                                                                |
|---------|----------|-------------|--------------------------------------------------------------------------------------------|
| `appId` | `string` | `undefined` | Convert App ID from [https://cloud.tiptap.dev/convert-settings](https://cloud.tiptap.dev/) |
| `token` | `string` | `undefined` | JWT token generated from your server                                                       |

### Commands
| Command  | Description                |
|----------|----------------------------|
| `export` | Export the editor content. |

### `export` arguments
| Name       | Type          | Default     | Options           | Description                                                                                                                                             |
| ---------- | ------------- | ----------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `format`   | `string`      | `undefined` | `docx,odt,md,gfm` | The target format (here, `md` or `gfm` for GitHub Flavored Markdown).                                                                                   |
| `content`  | `JSONContent` | `undefined` | Any Tiptap JSON   | Optional: Export different content than what's currently in the editor.                                                                                 |
| `onExport` | `Function`    | `undefined` | `fn(context)`     | Callback to customize the export. Receives a `blob`, potential `error`, a `download()` helper, and `filename`. Use `blob.text()` if you want raw text. |


```

# conversion\import-export\markdown\rest-api.mdx

```mdx
---
title: Convert Markdown via REST API
meta:
    title: Markdown REST API | Tiptap Conversion
    description: Learn how to handle Markdown files in a Tiptap editor, including in-editor import/export and REST API usage.
    category: Conversion
---

import { Callout } from '@/components/ui/Callout'

<Callout title="Use Postman" variant="hint"> Experiment with the Conversion API in our <a href="https://www.postman.com/docking-module-explorer-14290287/workspace/tiptap-collaboration-public/collection/33042171-cc186a66-df41-4df8-9c6e-e91b20deffe5?action=share&creator=32651125">Postman collection</a>. </Callout>

## Import API endpoint
`POST /import`

Converts .md files (or gfm) to Tiptap JSON.

\`\`\`bash
curl -X POST "https://api.tiptap.dev/v1/import?format=md" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "X-App-Id: <your-app-id>" \
  -F "file=@/path/to/file.md"
\`\`\`

### Import API Headers
| Header          | Description                                                                                                |
|-----------------|------------------------------------------------------------------------------------------------------------|
| `Authorization` | `Bearer <your-jwt-token>`                                                                                  |
| `X-App-Id`      | Convert App ID from [https://cloud.tiptap.dev/convert-settings](https://cloud.tiptap.dev/convert-settings) |

### Import API Fields
| Field                    | Description                                                                        |
|--------------------------|------------------------------------------------------------------------------------|
| `file`                   | The markdown file to convert                                                       |
| `imageUploadCallbackUrl` | Optional endpoint for handling images if the markdown file references local images |

## Export API endpoint
`POST /export`

Converts Tiptap JSON to .md or .gfm.

\`\`\`bash
curl -X POST "https://api.tiptap.dev/v1/export" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "X-App-Id: <your-app-id>" \
  -H "Content-Type: application/json" \
  -d '{"content":{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Hello from Tiptap!"}]}]},"format":"md"}' \
  --output document.md
\`\`\`

#### Export API Headers
| Header          | Description                                                                                                |
|-----------------|------------------------------------------------------------------------------------------------------------|
| `Authorization` | `Bearer <your-jwt-token>`                                                                                  |
| `X-App-Id`      | Convert App ID from [https://cloud.tiptap.dev/convert-settings](https://cloud.tiptap.dev/convert-settings) |

#### Export API Fields
| Field     | Description                                               |
|-----------|-----------------------------------------------------------|
| `content` | Tiptap JSON content                                       |
| `format`  | Target format, `md` or `gfm` for GitHub Flavored Markdown |
```

# conversion\import-export\odt\editor-extensions.mdx

```mdx
---
title: Convert ODT with Tiptap
meta:
    title: ODT | Tiptap Conversion
    description: Learn how to handle ODT files (OpenDocument Text) in a Tiptap editor, including in-editor import/export and REST API usage.
    category: Conversion
---

import { Callout } from '@/components/ui/Callout'

OpenDocument Text `.odt` is a widely used format in LibreOffice and OpenOffice. Tiptap’s Conversion tools provide three ways to work with ODT files:

- **Editor Import** – Convert `.odt` files directly into Tiptap JSON for in-editor editing.
- **Editor Export** – Convert the current Tiptap editor content into an `.odt` file.
- **REST API** – Integrate ODT conversions on the server side or from external services with the [ODT Conversion REST API](/conversion/import-export/odt/rest-api).

<Callout title="Subscription required" variant="warning">
    These extensions require a valid Tiptap subscription. To install the extension, you need [access to our
    private registry](/guides/pro-extensions).
</Callout>

## Editor ODT Import
To import `.odt` documents into your editor install the Import extension

\`\`\`bash
npm i @tiptap-pro/extension-import
\`\`\`

Add and configure the extension in your editor setup

### Configure the extension

\`\`\`js
// Start with importing the extension
import { Import } from '@tiptap-pro/extension-import'

const editor = new Editor({
  // ...
  extensions: [
    // ...
    Import.configure({
      // The Convert App-ID from the Convert settings page: https://cloud.tiptap.dev/convert-settings
      appId: 'your-app-id',

      // The JWT token you generated in the previous step
      token: 'your-jwt',

      // The URL to upload images to, if not provided, images will be stripped from the document
      imageUploadCallbackUrl: 'https://your-image-upload-url.com',
    }),
  ],
})
\`\`\`

### Import your first document

\`\`\`js
// The most simple way to import a file
// This will import the uploaded file, replace the editor content
// and focus the editor
editor.chain().focus().import({ file }).run()
\`\`\`

### Customize the import behavior

\`\`\`js
// You can also use the onImport callback to customize the import behavior
editor
  .chain()
  .import({
    file,
    onImport(context) {
      const { setEditorContent, content, error } = context

      // add error handling
      if (error) {
        showErrorToast({ message: error.message })
      }

      // You could also modify the content before inserting it
      content.doc.content.push({ type: 'paragraph', content: [{ type: 'text', text: 'Hello!' }] })

      // you can change the loading state of your application for example
      isLoading = false

      // make sure you call the setEditorContent function if you want to run
      // the default insertion behavior of the extension
      // setEditorContent()
      // but since we modified the content, we need to do the insertion manually
      editor.commands.setContent(content)
    },
  })
  .focus()
  .run()
\`\`\`

### Options

| Name                     | Type       | Default     | Description                                                                                                                                                                                     |
| ------------------------ | ---------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `appId`                  | `string`   | `undefined` | The convert app ID from the Convert settings page: [https://cloud.tiptap.dev/convert-settings](https://cloud.tiptap.dev/convert-settings)                                                       |
| `token`                  | `string`   | `undefined` | The JWT token generated from your server via secret                                                                                                                                             |
| `imageUploadCallbackUrl` | `string`   | `undefined` | The URL to upload images to, if not provided, images will be stripped from the document, [see more info](/conversion/import-export/docx/preserve-images)                                   |

### Commands

| Name     | Description                   |
| -------- | ----------------------------- |
| `import` | Import a file into the editor |

### `import`

#### Arguments

| Name       | Type       | Default     | Options       | Description                                                                                                                                                                   |
|------------|------------|-------------|---------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `file`     | `File`     | `undefined` | Any file      | The file to import                                                                                                                                                            |
| `format`   | `string`   | `undefined` | `gfm`         | Not relevant for the ODT file type                                                                                                                                            |
| `onImport` | `Function` | `undefined` | `fn(context)` | A callback used to customize the import behavior. The context argument includes information about the content, errors and a `setEditorContent` function to modify the content |

## Editor ODT Export
To use the convert extension, you need to install the `@tiptap-pro/extension-export` package:

\`\`\`bash
npm i @tiptap-pro/extension-export
\`\`\`

### Configure the extension

\`\`\`js
// Start with importing the extension
import { Export } from '@tiptap-pro/extension-export'

const editor = new Editor({
  // ...
  extensions: [
    // ...
    Export.configure({
      // The Convert App-ID from the convert settings page: https://cloud.tiptap.dev/convert-settings
      appId: 'your-app-id',

      // The JWT token you generated in the previous step
      token: 'your-jwt',
    }),
  ],
})
\`\`\`

### Export a document

\`\`\`js
// Do a simple export to docx
// Supported formats: docx, odt, md and gfm
editor.chain().focus().export({ format: 'docx' }).run()
\`\`\`

### Customize the export behavior

\`\`\`js
// You can also use the onExport callback to customize the export behavior
editor.chain().export({
  format: 'docx',
  onExport(context) {
    const { blob, error, download, filename } = context

    // add error handling
    if (error) {
      showErrorToast({ message: error.message })
    }

    // you can change the loading state of your application for example
    isLoading = false

    // you could modify the filename or handle the blob differently here
    // but we will keep them as they are

    // you can trigger a download directly by calling the download method
    download()

    // keep in mind that the download method will only work in the browser
    // and if the blob and filename was changed before must be managed manually
  },
})
\`\`\`

### Options

| Name    | Type     | Default     | Description                                                                                                                               |
| ------- | -------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `appId` | `string` | `undefined` | The convert app ID from the Convert settings page: [https://cloud.tiptap.dev/convert-settings](https://cloud.tiptap.dev/convert-settings) |
| `token` | `string` | `undefined` | The JWT token generated from your server via secret                                                                                       |

### Commands

| Name     | Description               |
| -------- | ------------------------- |
| `export` | Export the editor content |

#### `export`

#### Arguments

| Name       | Type          | Default     | Options           | Description                                                                                                                                                                              |
| ---------- | ------------- | ----------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `format`   | `string`      | `undefined` | `docx,odt,md,gfm` | The format you want to export to                                                                                                                                                         |
| `content`  | `JSONContent` | `undefined` | Any Tiptap JSON   | The Tiptap JSON content you want to export                                                                                                                                               |
| `onExport` | `Function`    | `undefined` | `fn(context)`     | A callback used to customize the export behavior. The context argument includes information about the blob, filename, errors and a `download` function to download the document directly |
```

# conversion\import-export\odt\rest-api.mdx

```mdx
---
title: Convert ODT files via REST API
meta:
    title: ODT REST API| Tiptap Conversion
    description: Learn how to handle ODT files (OpenDocument Text) in a Tiptap editor, including in-editor import/export and REST API usage.
    category: Conversion
---

import { Callout } from '@/components/ui/Callout'

The ODT document conversion API supports conversion from and to Tiptap’s JSON format.

<Callout title="Review the postman collection" variant="hint">
    You can also experiment with the Document Conversion API by heading over to our [Postman
    Collection](https://www.postman.com/docking-module-explorer-14290287/workspace/tiptap-collaboration-public/collection/33042171-cc186a66-df41-4df8-9c6e-e91b20deffe5?action=share&creator=32651125).
</Callout>

## Import API endpoint
`POST /import`

The `/import` endpoint enables the conversion of `ODT` files into Tiptap’s JSON format. Users can POST documents to this endpoint.

### Example (cURL)
 \`\`\`bash
 curl -X POST "https://api.tiptap.dev/v1/import" \
   -H "Authorization: Bearer <your-jwt-token>" \
   -H "X-App-Id: <your-app-id>" \
   -F "file=@/path/to/document.odt"
 \`\`\`
In this example, the request uploads an ODT file

### Required headers

| Name            | Description                                                                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `Authorization` | The JWT token to authenticate the request. Example: `Bearer your-jwt-token`                                                                     |
| `X-App-Id`      | The Convert App-ID from the Collaboration settings page: [https://cloud.tiptap.dev/convert-settings](https://cloud.tiptap.dev/convert-settings) |

### Body

| Name                     | Type     | Description                                                                                                                  |
| ------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `file`                   | `File`   | The file to convert                                                                                                          |
| `imageUploadCallbackUrl` | `string` | The callback endpoint to upload images that were encountered within the uploaded document, [see more info](#image-uploading) |

## Export API endpoint
`POST /export`

The `/export` endpoint converts Tiptap documents back into the `docx` format.

### Required headers

| Name            | Description                                                                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `Authorization` | The JWT token to authenticate the request. Example: `Bearer your-jwt-token`                                                                     |
| `X-App-Id`      | The Convert App-ID from the Collaboration settings page: [https://cloud.tiptap.dev/convert-settings](https://cloud.tiptap.dev/convert-settings) |

### Body

| Name      | Type     | Description                                |
|-----------|----------|--------------------------------------------|
| `content` | `Object` | The Tiptap document                        |
| `format`  | `string` | The format to convert to, should be `odt` |
```

# conversion\sidebar.ts

```ts
import { SidebarConfig } from '@/types'

export const sidebarConfig: SidebarConfig = {
  id: 'conversion',
  rootHref: '/conversion/getting-started/overview',
  title: 'Conversion',
  items: [
    {
      type: 'group',
      href: '/conversion/getting-started',
      title: 'Getting started',
      children: [
        {
          title: 'Overview',
          href: '/conversion/getting-started/overview',
        },
        {
          title: 'Authenticate',
          href: '/conversion/getting-started/install',
        },
      ],
    },
    {
      type: 'group',
      href: '/conversion/import-export',
      title: 'Import & Export',
      children: [
        {
          title: 'DOCX',
          href: '/conversion/import-export/docx',
          tags: ['Beta'],
          children: [
            {
              title: 'Editor import',
              href: '/conversion/import-export/docx/editor-import',
            },
            {
              title: 'Editor export',
              href: '/conversion/import-export/docx/editor-export',
            },
            {
              title: 'REST API',
              href: '/conversion/import-export/docx/rest-api',
            },
            {
              title: 'Convert custom nodes',
              href: '/conversion/import-export/docx/custom-node-conversion',
            },
            {
              title: 'Convert custom marks',
              href: '/conversion/import-export/docx/custom-mark-conversion',
            },
            {
              title: 'Export styles',
              href: '/conversion/import-export/docx/export-styles',
            },
            {
              title: 'Preserve images',
              href: '/conversion/import-export/docx/preserve-images',
            },
          ],
        },
        {
          href: '/conversion/import-export/odt',
          title: 'ODT',
          children: [
            {
              title: 'Editor extensions',
              href: '/conversion/import-export/odt/editor-extensions',
            },
            {
              title: 'REST API',
              href: '/conversion/import-export/odt/rest-api',
            },
          ],
        },
        {
          href: '/conversion/import-export/markdown',
          title: 'Markdown',
          children: [
            {
              title: 'Editor extensions',
              href: '/conversion/import-export/markdown/editor-extensions',
            },
            {
              title: 'REST API',
              href: '/conversion/import-export/markdown/rest-api',
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      href: '/conversion/resources',
      title: 'Resources',
      children: [
        {
          title: 'Legacy extensions',
          href: '/guides/legacy-conversion',
        },
      ],
    },
  ],
}

```

# editor\api\commands\content\clear-content.mdx

```mdx
---
title: clearContent command
meta:
  title: clearContent command | Tiptap Editor Docs
  description: Delete all content in the editor with the clearContent command in your Tiptap Editor. Learn more in the docs.
  category: Editor
---

The `clearContent` command deletes the current document.

Keep in mind that the editor will enforce the configured schema, and the document won’t be `null`. The default [`Document`](/editor/extensions/nodes/document) expects to have at least one block node, which is the paragraph by default. In other words: Even after running that command the document will have at least one (empty) paragraph.

See also: [setContent](/editor/api/commands/content/set-content), [insertContent](/editor/api/commands/content/insert-content)

## Parameters

`emitUpdate: boolean (false)`

By default, it doesn’t trigger the update event. Passing `true` doesn’t prevent triggering the update event.

## Use the clearContent command

\`\`\`js
// Remove all content from the document
editor.commands.clearContent()

// Remove all content, and trigger the `update` event
editor.commands.clearContent(true)
\`\`\`

```

# editor\api\commands\content\cut.mdx

```mdx
---
title: cut command
meta:
  title: cut command | Tiptap Editor Docs
  description: Use the cut command in Tiptap to cut out content from a range and place it at a given position. Learn more in our docs!
---

This command cuts out content and places it into the given position.

See also: [focus](/editor/api/commands/selection/focus)

## Use the cut command

\`\`\`js
const from = editor.state.selection.from
const to = editor.state.selection.to

const endPos = editor.state.doc.nodeSize - 2

// Cut out content from range and put it at the end of the document
editor.commands.cut({ from, to }, endPos)
\`\`\`

```

# editor\api\commands\content\index.mdx

```mdx
---
title: Content Editor commands
meta:
  title: Content commands | Tiptap Editor Docs
  description: Learn about the clearContent, insertContent, insertContentAt, and setContent commands to efficiently manage content in Tiptap.
  category: Editor
---

Use these commands to dynamically insert, replace, or remove content in your editor. Initialize new documents, update existing ones, or manage user selections, these commands provide you with tools to handle content manipulation.

## Use Cases

- **Initializing New Documents:** Start fresh with the [`setContent`](/editor/api/commands/content/set-content) command to initialize a clean document or predefined template.
- **Updating Existing Content:** Use the [`insertContent`](/editor/api/commands/content/insert-content) or [`insertContentAt](/editor/api/commands/content/insert-content-at) commands to add new content or update specific sections based on user interactions.
- **Clearing Content:** Remove all content with the [`clearContent`](/editor/api/commands/content/clear-content) command while maintaining a valid document structure.
- **Managing User Selections:** Insert or replace content at specific positions or ranges using [`insertContentAt`](/editor/api/commands/content/insert-content-at) according to user selections.

## List of content commands

| Command           | Description                                                         |
| ----------------- | ------------------------------------------------------------------- |
| `clearContent`    | Deletes the current document while adhering to the editor’s schema. |
| `insertContent`   | Adds content to the document using plain text, HTML, or JSON.       |
| `insertContentAt` | Inserts content at a specific position or range in the document.    |
| `setContent`      | Replaces the entire document with a new one using JSON or HTML.     |

```

# editor\api\commands\content\insert-content-at.mdx

```mdx
---
title: insertContentAt command
meta:
  title: insertContentAt command | Tiptap Editor Docs
  description: Add content to a specific position or range using plain text, HTML, or JSON with the insertContentAt command. More in the docs!
  category: Editor
---

The `insertContentAt` will insert an HTML string or a node at a given position or range. If a range is given, the new content will replace the content in the given range with the new content.

## Parameters

`position: number | Range`

The position or range the content will be inserted in.

`value: Content`

The content to be inserted. Can be plain text, an HTML string or JSON node(s).

`options: Record<string, any>`

- updateSelection: controls if the selection should be moved to the newly inserted content.
- parseOptions: Passed content is parsed by ProseMirror. To hook into the parsing, you can pass `parseOptions` which are then handled by [ProseMirror](https://prosemirror.net/docs/ref/#model.ParseOptions).

## Use the insertContentAt command

\`\`\`js
// Plain text
editor.commands.insertContentAt(12, 'Example Text')

// Plain text, replacing a range
editor.commands.insertContentAt({ from: 12, to: 16 }, 'Example Text')

// HTML
editor.commands.insertContentAt(12, '<h1>Example Text</h1>')

// HTML with trim white space
editor.commands.insertContentAt(12, '<p>Hello world</p>', {
  updateSelection: true,
  parseOptions: {
    preserveWhitespace: 'full',
  },
})

// JSON/Nodes
editor.commands.insertContentAt(12, {
  type: 'heading',
  attrs: {
    level: 1,
  },
  content: [
    {
      type: 'text',
      text: 'Example Text',
    },
  ],
})

// Multiple nodes at once
editor.commands.insertContentAt(12, [
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: 'First paragraph',
      },
    ],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: 'Second paragraph',
      },
    ],
  },
])
\`\`\`

```

# editor\api\commands\content\insert-content.mdx

```mdx
---
title: insertContent command
meta:
  title: insertContent command | Tiptap Editor Docs
  description: Use the insertContent command in Tiptap to add content to the document using plain text, HTML, or JSON. Learn more in our docs!
  category: Editor
---

The `insertContent` command adds the passed value to the document.

See also: [setContent](/editor/api/commands/content/set-content), [clearContent](/editor/api/commands/content/clear-content)

## Parameters

`value: Content`

The command is pretty flexible and takes plain text, HTML or even JSON as a value.

## Use the insertContent command

\`\`\`js
// Plain text
editor.commands.insertContent('Example Text')

// HTML
editor.commands.insertContent('<h1>Example Text</h1>')

// HTML with trim white space
editor.commands.insertContent('<h1>Example Text</h1>', {
  parseOptions: {
    preserveWhitespace: false,
  },
})

// JSON/Nodes
editor.commands.insertContent({
  type: 'heading',
  attrs: {
    level: 1,
  },
  content: [
    {
      type: 'text',
      text: 'Example Text',
    },
  ],
})

// Multiple nodes at once
editor.commands.insertContent([
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: 'First paragraph',
      },
    ],
  },
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: 'Second paragraph',
      },
    ],
  },
])
\`\`\`

```

# editor\api\commands\content\set-content.mdx

```mdx
---
title: setContent command
meta:
  title: setContent command | Tiptap Editor Docs
  description: Replace the document with a new one using JSON or HTML with the setContent command. Learn more in our docs!
  category: Editor
---

The `setContent` command replaces the document with a new one. You can pass JSON or HTML, both work fine. It’s basically the same as setting the `content` on initialization.

See also: [insertContent](/editor/api/commands/content/insert-content), [clearContent](/editor/api/commands/content/clear-content)

## Parameters

`content: string`

Pass a string (JSON or HTML) as [content](/guides/output-json-html). The editor will only render what’s allowed according to the [schema](/editor/core-concepts/schema).

`emitUpdate?: Boolean (false)`

By default, it doesn’t trigger the update event. Passing `true` doesn’t prevent triggering the update event.

`parseOptions?: Record<string, any>`

Options to configure the parsing can be passed during initialization and/or with setContent. Read more about parseOptions in the [ProseMirror documentation](https://prosemirror.net/docs/ref/#model.ParseOptions).

## Use the setContent command

\`\`\`js
// Plain text
editor.commands.setContent('Example Text')

// HTML
editor.commands.setContent('<p>Example Text</p>')

// JSON
editor.commands.setContent({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Example Text',
        },
      ],
    },
  ],
})
\`\`\`

```

# editor\api\commands\for-each.mdx

```mdx
---
title: forEach command
meta:
  title: forEach command | Tiptap Editor Docs
  description: Use the forEach command in Tiptap to loop through an array of items and insert content into the editor. Learn more in our docs!
  category: Editor
---

Loop through an array of items.

## Parameters

`items: any[]`

An array of items.

`fn: (item: any, props: CommandProps & { index: number }) => boolean`

A function to do anything with your item.

## Use the forEach command

\`\`\`js
const items = ['foo', 'bar', 'baz']

editor.commands.forEach(items, (item, { commands }) => {
  return commands.insertContent(item)
})
\`\`\`

```

# editor\api\commands\index.mdx

```mdx
---
title: Editor commands
meta:
  title: Commands | Tiptap Editor Docs
  description: Learn about command execution and chaining in Tiptap. Discover how to extend functionalities in the Editor command docs.
  category: Editor
---

import { Callout } from '@/components/ui/Callout'

The editor provides a ton of commands to programmatically add or change content or alter the selection. If you want to build your own editor you definitely want to learn more about them.

## Execute a command

All available commands are accessible through an editor instance. Let’s say you want to make text bold when a user clicks on a button. That’s how that would look like:

\`\`\`js
editor.commands.setBold()
\`\`\`

While that’s perfectly fine and does make the selected bold, you’d likely want to chain multiple commands in one run. Let’s have a look at how that works.

### Chain commands

Most commands can be combined to one call. That’s shorter than separate function calls in most cases. Here is an example to make the selected text bold:

\`\`\`js
editor.chain().focus().toggleBold().run()
\`\`\`

The `.chain()` is required to start a new chain and the `.run()` is needed to actually execute all the commands in between.

In the example above two different commands are executed at once. When a user clicks on a button outside of the content, the editor isn’t in focus anymore. That’s why you probably want to add a `.focus()` call to most of your commands. It brings back the focus to the editor, so the user can continue to type.

All chained commands are kind of queued up. They are combined to one single transaction. That means, the content is only updated once, also the `update` event is only triggered once.

<Callout title="Transaction mapping" variant="hint">
  By default Prosemirror **does not support chaining** which means that you need to update the
  positions between chained commands via [**Transaction
  mapping**](https://prosemirror.net/docs/ref/#transform.Mapping).
</Callout>

For example you want to chain a **delete** and **insert** command in one chain, you need to keep track of the position inside your chain commands. Here is an example:

\`\`\`js
// here we add two custom commands to the editor to demonstrate transaction mapping between two transaction steps
addCommands() {
  return {
    delete: () => ({ tr }) => {
      const { $from, $to } = tr.selection

      // here we use tr.mapping.map to map the position between transaction steps
      const from = tr.mapping.map($from.pos)
      const to = tr.mapping.map($to.pos)

      tr.delete(from, to)

      return true
    },
    insert: (content: string) => ({ tr }) => {
      const { $from } = tr.selection

      // here we use tr.mapping.map to map the position between transaction steps
      const pos = tr.mapping.map($from.pos)

      tr.insertText(content, pos)

      return true
    },
  }
}
\`\`\`

Now you can do the following without `insert` inserting the content into the wrong position:

\`\`\`js
editor.chain().delete().insert('foo').run()
\`\`\`

#### Chain inside custom commands

When chaining a command, the transaction is held back. If you want to chain commands inside your custom commands, you’ll need to use said transaction and add to it. Here is how you would do that:

\`\`\`js
addCommands() {
  return {
    customCommand: attributes => ({ chain }) => {
      // Doesn’t work:
      // return editor.chain() …

      // Does work:
      return chain()
        .insertContent('foo!')
        .insertContent('bar!')
        .run()
    },
  }
}
\`\`\`

### Inline commands

In some cases, it’s helpful to put some more logic in a command. That’s why you can execute commands in commands. I know, that sounds crazy, but let’s look at an example:

\`\`\`js
editor
  .chain()
  .focus()
  .command(({ tr }) => {
    // manipulate the transaction
    tr.insertText('hey, that’s cool!')

    return true
  })
  .run()
\`\`\`

### Dry run commands

Sometimes, you don’t want to actually run the commands, but only know if it would be possible to run commands, for example to show or hide buttons in a menu. That’s what we added `.can()` for. Everything coming after this method will be executed, without applying the changes to the document:

\`\`\`js
editor.can().toggleBold()
\`\`\`

And you can use it together with `.chain()`, too. Here is an example which checks if it’s possible to apply all the commands:

\`\`\`js
editor.can().chain().toggleBold().toggleItalic().run()
\`\`\`

Both calls would return `true` if it’s possible to apply the commands, and `false` in case it’s not.

In order to make that work with your custom commands, don’t forget to return `true` or `false`.

For some of your own commands, you probably want to work with the raw [transaction](/editor/core-concepts/introduction). To make them work with `.can()` you should check if the transaction should be dispatched. Here is how you can create a simple `.insertText()` command:

\`\`\`js
export default (value) =>
  ({ tr, dispatch }) => {
    if (dispatch) {
      tr.insertText(value)
    }

    return true
  }
\`\`\`

If you’re just wrapping another Tiptap command, you don’t need to check that, we’ll do it for you.

\`\`\`js
addCommands() {
  return {
    bold: () => ({ commands }) => {
      return commands.toggleMark('bold')
    },
  }
}
\`\`\`

If you’re just wrapping a plain ProseMirror command, you’ll need to pass `dispatch` anyway. Then there’s also no need to check it:

\`\`\`js
import { exitCode } from '@tiptap/pm/commands'

export default () =>
  ({ state, dispatch }) => {
    return exitCode(state, dispatch)
  }
\`\`\`

### Try commands

If you want to run a list of commands, but want only the first successful command to be applied, you can do this with the `.first()` method. This method runs one command after the other and stops at the first which returns `true`.

For example, the backspace key tries to undo an input rule first. If that was successful, it stops there. If no input rule has been applied and thus can’t be reverted, it runs the next command and deletes the selection, if there is one. Here is the simplified example:

\`\`\`js
editor.commands.first(({ commands }) => [
  () => commands.undoInputRule(),
  () => commands.deleteSelection(),
  // …
])
\`\`\`

Inside of commands you can do the same thing:

\`\`\`js
export default () =>
  ({ commands }) => {
    return commands.first([
      () => commands.undoInputRule(),
      () => commands.deleteSelection(),
      // …
    ])
  }
\`\`\`

## List of commands

Have a look at all of the core commands listed below. They should give you a good first impression of what’s possible.

### Content

| Command             | Description                                              |
| ------------------- | -------------------------------------------------------- |
| `clearContent()`    | Clear the whole document.                                |
| `insertContent()`   | Insert a node or an HTML string at the current position. |
| `insertContentAt()` | Insert a node or an HTML string at a specific position.  |
| `setContent()`      | Replace the whole document with new content.             |

### Nodes & Marks

| Command                 | Description                                               |
| ----------------------- | --------------------------------------------------------- |
| `clearNodes()`          | Normalize nodes to a simple paragraph.                    |
| `createParagraphNear()` | Create a paragraph nearby.                                |
| `deleteNode()`          | Delete a node.                                            |
| `extendMarkRange()`     | Extends the text selection to the current mark.           |
| `exitCode()`            | Exit from a code block.                                   |
| `joinBackward()`        | Join two nodes backward.                                  |
| `joinForward()`         | Join two nodes forward.                                   |
| `lift()`                | Removes an existing wrap.                                 |
| `liftEmptyBlock()`      | Lift block if empty.                                      |
| `newlineInCode()`       | Add a newline character in code.                          |
| `resetAttributes()`     | Resets some node or mark attributes to the default value. |
| `setMark()`             | Add a mark with new attributes.                           |
| `setNode()`             | Replace a given range with a node.                        |
| `splitBlock()`          | Forks a new node from an existing node.                   |
| `toggleMark()`          | Toggle a mark on and off.                                 |
| `toggleNode()`          | Toggle a node with another node.                          |
| `toggleWrap()`          | Wraps nodes in another node, or removes an existing wrap. |
| `undoInputRule()`       | Undo an input rule.                                       |
| `unsetAllMarks()`       | Remove all marks in the current selection.                |
| `unsetMark()`           | Remove a mark in the current selection.                   |
| `updateAttributes()`    | Update attributes of a node or mark.                      |

### Lists

| Command           | Description                                 |
| ----------------- | ------------------------------------------- |
| `liftListItem()`  | Lift the list item into a wrapping list.    |
| `sinkListItem()`  | Sink the list item down into an inner list. |
| `splitListItem()` | Splits one list item into two list items.   |
| `toggleList()`    | Toggle between different list types.        |
| `wrapInList()`    | Wrap a node in a list.                      |

### Selection

| Command                | Description                             |
| ---------------------- | --------------------------------------- |
| `blur()`               | Removes focus from the editor.          |
| `deleteRange()`        | Delete a given range.                   |
| `deleteSelection()`    | Delete the selection, if there is one.  |
| `enter()`              | Trigger enter.                          |
| `focus()`              | Focus the editor at the given position. |
| `keyboardShortcut()`   | Trigger a keyboard shortcut.            |
| `scrollIntoView()`     | Scroll the selection into view.         |
| `selectAll()`          | Select the whole document.              |
| `selectNodeBackward()` | Select a node backward.                 |
| `selectNodeForward()`  | Select a node forward.                  |
| `selectParentNode()`   | Select the parent node.                 |
| `setNodeSelection()`   | Creates a NodeSelection.                |
| `setTextSelection()`   | Creates a TextSelection.                |

## Write your own commands

All extensions can add additional commands (and most do), check out the specific [documentation for the provided nodes](/editor/extensions/nodes), [marks](/editor/extensions/marks), and [functionality](/editor/extensions/functionality) to learn more about those. And of course, you can [add your custom extensions](/editor/extensions/custom-extensions) with custom commands as well.
But how do you write those commands? There’s a little bit to learn about that.

```

# editor\api\commands\lists\index.mdx

```mdx
---
title: List commands
meta:
  title: List commands | Tiptap Editor Docs
  description: Manage lists in Tiptap with Editor commands like liftListItem, sinkListItem, splitListItem, toggleList, and wrapInList.
  category: Editor
---

Lists are a crucial part of structuring content in your Tiptap editor. Tiptap provides commands to manipulate list structures easily. Here’s an overview of the essential commands that help you create, update, and manage your lists.

## Use Cases

- **Creating and Toggling Lists:** Create or switch between list types using [`toggleList`](/editor/api/commands/lists/toggle-list).
- **Nesting and Unnesting List Items:** Lift or sink list items using commands like [`liftListItem`](/editor/api/commands/lists/lift-list-item) and [`sinkListItem`](/editor/api/commands/lists/sink-list-item).
- **Splitting and Wrapping List Items:** Split or wrap list items efficiently with [`splitListItem`](/editor/api/commands/lists/split-list-item) and [`wrapInList`](/editor/api/commands/lists/wrap-in-list).
- **Improving List Keyboard Behavior:** Use the [`List Keymap`](/editor/extensions/functionality/listkeymap) extension to refine list behavior with additional keymap handlers.

## List Keymap Extension

You might also want to include the [`List Keymap`](/editor/extensions/functionality/listkeymap) extension, which adds extra keymap handlers to change the default backspace and delete behavior for lists. It modifies the default behavior so that pressing backspace at the start of a list item lifts the content into the list item above.

## Here’s a list of… list commands

| Command         | Description                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------- |
| `liftListItem`  | Attempts to lift the list item around the current selection up into a wrapping parent list. |
| `sinkListItem`  | Sinks the list item around the current selection down into a wrapping child list.           |
| `splitListItem` | Splits one list item into two separate list items.                                          |
| `toggleList`    | Toggles between different types of lists.                                                   |
| `wrapInList`    | Wraps a node in the current selection in a list.                                            |

```

# editor\api\commands\lists\lift-list-item.mdx

```mdx
---
title: liftListItem command
meta:
  title: liftListItem command | Tiptap Editor Docs
  description: Use the liftListItem command in Tiptap to lift the list item into a wrapping parent list. Learn more in our docs!
  category: Editor
---

The `liftListItem` will try to lift the list item around the current selection up into a wrapping parent list.

## Using the liftListItem command

\`\`\`js
editor.commands.liftListItem()
\`\`\`

```

# editor\api\commands\lists\sink-list-item.mdx

```mdx
---
title: sinkListItem command
meta:
  title: sinkListItem command | Tiptap Editor Docs
  description: Use the sinkListItem command in Tiptap to sink the list item into a wrapping child list. Learn more in our docs!
  category: Editor
---

The `sinkListItem` will try to sink the list item around the current selection down into a wrapping child list.

## Use the sinkListItem command

\`\`\`js
editor.commands.sinkListItem()
\`\`\`

```

# editor\api\commands\lists\split-list-item.mdx

```mdx
---
title: splitListItem command
meta:
  title: splitListItem command | Tiptap Editor Docs
  description: Use the splitListItem command in Tiptap to split one list item into two separate list items. Learn more in our docs!
  category: Editor
---

`splitListItem` splits one list item into two separate list items. If this is a nested list, the wrapping list item should be split.

## Parameters

`typeOrName: string | NodeType`

The type of node that should be split into two separate list items.

## Use the splitListItem command

\`\`\`js
editor.commands.splitListItem('bulletList')
\`\`\`

```

# editor\api\commands\lists\toggle-list.mdx

```mdx
---
title: toggleList command
meta:
  title: toggleList command | Tiptap Editor Docs
  description: Use the toggleList command in Tiptap to toggle between different types of lists. Learn more in our docs!
  category: Editor
---

`toggleList` will toggle between different types of lists.

## Parameters

`listTypeOrName: string | NodeType`

The type of node that should be used for the wrapping list

`itemTypeOrName: string | NodeType`

The type of node that should be used for the list items

`keepMarks?: boolean`

If marks should be kept as list items or not

`attributes?: Record<string, any>`

The attributes that should be applied to the list. **This is optional.**

## Use the toggleList command

\`\`\`js
// toggle a bullet list with list items
editor.commands.toggleList('bulletList', 'listItem')

// toggle a numbered list with list items
editor.commands.toggleList('orderedList', 'listItem')
\`\`\`

```

# editor\api\commands\lists\wrap-in-list.mdx

```mdx
---
title: wrapInList command
meta:
  title: wrapInList command | Tiptap Editor Docs
  description: Use the wrapInList command in Tiptap to wrap a node in the current selection in a list. Learn more in our docs!
  category: Editor
---

`wrapInList` will wrap a node in the current selection in a list.

## Parameters

`typeOrName: string | NodeType`

The type of node that should be wrapped in a list.

`attributes?: Record<string, any>`

The attributes that should be applied to the list. **This is optional.**

## Use the wrapInList command

\`\`\`js
// wrap a paragraph in a bullet list
editor.commands.wrapInList('paragraph')
\`\`\`

```

# editor\api\commands\nodes-and-marks\clear-nodes.mdx

```mdx
---
title: clearNodes command
meta:
  title: clearNodes command | Tiptap Editor Docs
  description: Use the clearNodes command in Tiptap to normalize all nodes in the document to the default paragraph node. More in our docs!
  category: Editor
---

The `clearNodes` command normalizes nodes to the default node, which is the paragraph by default. It’ll even normalize all kind of lists. For advanced use cases it can come in handy, before applying a new node type.

If you wonder how you can define the default node: It depends on what’s in the `content` attribute of your [`Document`](/editor/extensions/nodes/document), by default that’s `block+` (at least one block node) and the [`Paragraph`](/editor/extensions/nodes/paragraph) node has the highest priority, so it’s loaded first and is therefore the default node.

## Use the clearNodes command

\`\`\`js
editor.commands.clearNodes()
\`\`\`

```

# editor\api\commands\nodes-and-marks\create-paragraph-near.mdx

```mdx
---
title: createParagraphNear command
meta:
  title: createParagraphNear command | Tiptap Editor Docs
  description: Use the createParagraphNear command in Tiptap to add paragraphs adjacent to the current block node selection. More in our docs!
  category: Editor
---

If a block node is currently selected, the `createParagraphNear` command creates an empty paragraph after the currently selected block node. If the selected block node is the first child of its parent, the new paragraph will be inserted before the current selection.

## Use the createParagraphNear command

\`\`\`js
editor.commands.createParagraphNear()
\`\`\`

```

# editor\api\commands\nodes-and-marks\delete-node.mdx

```mdx
---
title: deleteNode command
meta:
  title: deleteNode command | Tiptap Editor Docs
  description: Use the deleteNode command in Tiptap to selectively remove nodes from your document. Learn more in the docs.
  category: Editor
---

The `deleteNode` command deletes a node inside the current selection. It requires a `typeOrName` argument, which can be a string or a `NodeType` to find the node that needs to be deleted. After deleting the node, the view will automatically scroll to the cursors position.

## Parameters

`typeOrName: string | NodeType`

## Use the deleteNode command

\`\`\`js
// deletes a paragraph node
editor.commands.deleteNode('paragraph')

// or

// deletes a custom node
editor.commands.deleteNode(MyCustomNode)
\`\`\`

```

# editor\api\commands\nodes-and-marks\exit-code.mdx

```mdx
---
title: exitCode command
meta:
  title: exitCode command | Tiptap Editor Docs
  description: Use the exitCode command in Tiptap to exit code blocks and continue editing in a new default block. More in our docs!
  category: Editor
---

The `exitCode` command will create a default block after the current selection if the selection is a `code` element and move the cursor to the new block.

## Use the exitCode command

\`\`\`js
editor.commands.exitCode()
\`\`\`

```

# editor\api\commands\nodes-and-marks\extend-mark-range.mdx

```mdx
---
title: extendMarkRange command
meta:
  title: extendMarkRange command | Tiptap Editor Docs
  description: Use the extendMarkRange command in Tiptap to expand the current selection to include the specified mark. Learn more in our docs!
  category: Editor
---

The `extendMarkRange` command expands the current selection to encompass the current mark. If the current selection doesn’t have the specified mark, nothing changes.

## Parameters

`typeOrName: string | MarkType`

Name or type of the mark.

`attributes?: Record<string, any>`

Optionally, you can specify attributes that the extended mark must contain.

## Use the extendMarkRange command

\`\`\`js
// Expand selection to link marks
editor.commands.extendMarkRange('link')

// Expand selection to link marks with specific attributes
editor.commands.extendMarkRange('link', { href: 'https://google.com' })

// Expand selection to link mark and update attributes
editor
  .chain()
  .extendMarkRange('link')
  .updateAttributes('link', {
    href: 'https://duckduckgo.com',
  })
  .run()
\`\`\`

```

# editor\api\commands\nodes-and-marks\index.mdx

```mdx
---
title: Nodes and marks commands
meta:
  title: Nodes and Marks commands | Tiptap Editor Docs
  description: Easy-to-use commands for managing nodes and marks. Learn to manipulate paragraphs, headings, and inline styles in our docs.
  category: Editor
---

Tiptap provides commands to manipulate nodes and marks easily.

Nodes and marks are the building blocks of your Tiptap editor. Nodes represent content elements like paragraphs, headings, or images, while marks provide inline formatting, such as bold, italic, or links.

## Use Cases

- **Creating New Nodes:** Use [`createParagraphNear`](/editor/api/commands/nodes-and-marks/create-paragraph-near) or [`splitBlock`](/editor/api/commands/nodes-and-marks/split-block) to add new nodes near the selection.
- **Managing Node Structures:** Update, replace, or lift nodes using commands like [`setNode`](/editor/api/commands/nodes-and-marks/set-node), [`lift`](/editor/api/commands/nodes-and-marks/lift), or [`toggleNode`](/editor/api/commands/nodes-and-marks/toggle-node).
- **Mark Manipulation:** Toggle, set, or unset marks using commands like [`toggleMark`](/editor/api/commands/nodes-and-marks/toggle-mark), [`setMark`](/editor/api/commands/nodes-and-marks/set-mark), or [`unsetMark`](/editor/api/commands/nodes-and-marks/unset-mark).
- **Content Cleanup:** Remove unwanted marks or nodes using [`clearNodes`](/editor/api/commands/nodes-and-marks/clear-nodes), [`unsetAllMarks`](/editor/api/commands/nodes-and-marks/unset-all-marks), or [`resetAttributes`](/editor/api/commands/nodes-and-marks/reset-attributes).

## List of nodes and marks commands

| Command               | Description                                                                |
| --------------------- | -------------------------------------------------------------------------- |
| `clearNodes`          | Clears all nodes while adhering to the editor's schema.                    |
| `createParagraphNear` | Creates a new paragraph node near the current selection.                   |
| `deleteNode`          | Deletes the selected node.                                                 |
| `extendMarkRange`     | Expands the current selection to encompass the specified mark.             |
| `exitCode`            | Exits the current code block and continues editing in a new default block. |
| `joinBackward`        | Joins two nodes backwards from the current selection.                      |
| `joinForward`         | Joins two nodes forwards from the current selection.                       |
| `lift`                | Lifts a node up into its parent node.                                      |
| `liftEmptyBlock`      | Lifts the currently selected empty textblock.                              |
| `newlineInCode`       | Inserts a new line in the current code block.                              |
| `resetAttributes`     | Resets specified attributes of a node to its default values.               |
| `setMark`             | Adds a new mark at the current selection.                                  |
| `setNode`             | Replaces a given range with a specified node.                              |
| `splitBlock`          | Splits the current node into two nodes at the current selection.           |
| `toggleMark`          | Toggles a specific mark on and off at the current selection.               |
| `toggleNode`          | Toggles a node with another node.                                          |
| `toggleWrap`          | Wraps the current node with a new node or removes a wrapping node.         |
| `undoInputRule`       | Undoes the most recent input rule that was triggered.                      |
| `unsetAllMarks`       | Removes all marks from the current selection.                              |
| `unsetMark`           | Removes a specific mark from the current selection.                        |
| `updateAttributes`    | Sets attributes of a node or mark to new values.                           |

```

# editor\api\commands\nodes-and-marks\join-backward.mdx

```mdx
---
title: joinBackward command
meta:
  title: joinBackward command | Tiptap Editor Docs
  description: Join two nodes backwards from the current selection in your Tiptap Editor with the joinBackward command. Learn more in our docs!
  category: Editor
---

The `joinBackward` command joins two nodes backwards from the current selection. If the selection is empty and at the start of a textblock, `joinBackward` will try to reduce the distance between that block and the block before it. [See also](https://prosemirror.net/docs/ref/#commands.joinBackward)

## Use the joinBackward command

\`\`\`js
editor.commands.joinBackward()
\`\`\`

```

# editor\api\commands\nodes-and-marks\join-down.mdx

```mdx
---
title: joinDown command
meta:
  title: joinDown command | Tiptap Editor Docs
  description: Use the joinDown command in Tiptap to join the selected block with the sibling below it. Learn more in our docs!
  category: Editor
---

The `joinDown` command joins the selected block, or if there is a text selection, the closest ancestor block of the selection that can be joined, with the sibling below it. [See also](https://prosemirror.net/docs/ref/#commands.joinDown)

## Use the joinDown command

\`\`\`js
editor.commands.joinDown()
\`\`\`

```

# editor\api\commands\nodes-and-marks\join-forward.mdx

```mdx
---
title: joinForward command
meta:
  title: joinForward command | Tiptap Editor Docs
  description: Join two nodes forwards from the current selection in the Tiptap Editor with the joinForward command. Learn more in our docs!
  category: Editor
---

The `joinForward` command joins two nodes forwards from the current selection. If the selection is empty and at the end of a textblock, `joinForward` will try to reduce the distance between that block and the block after it. [See also](https://prosemirror.net/docs/ref/#commands.joinForward)

## Use the joinForward command

\`\`\`js
editor.commands.joinForward()
\`\`\`

```

# editor\api\commands\nodes-and-marks\join-textblock-backward.mdx

```mdx
---
title: joinTextblockBackward command
meta:
  title: joinTextblockBackward command | Tiptap Editor Docs
  description: Use the joinTextblockBackward command in Tiptap to join the current textblock to the one before it. Learn more in our docs!
---

A more limited form of joinBackward that only tries to join the current textblock to the one before it, if the cursor is at the start of a textblock. [See also](https://prosemirror.net/docs/ref/#commands.joinTextblockBackward)

## Using the joinTextblockBackward command

\`\`\`js
editor.commands.joinTextblockBackward()
\`\`\`

```

# editor\api\commands\nodes-and-marks\join-textblock-forward.mdx

```mdx
---
title: joinTextblockForward command
meta:
  title: joinTextblockForward command | Tiptap Editor Docs
  description: Use the joinTextblockForward command in Tiptap to join the current textblock to the one after it. Learn more in our docs!
---

A more limited form of joinForward that only tries to join the current textblock to the one after it, if the cursor is at the end of a textblock. [See also](https://prosemirror.net/docs/ref/#commands.joinTextblockForward)

## Using the joinTextblockForward command

\`\`\`js
editor.commands.joinTextblockForward()
\`\`\`

```

# editor\api\commands\nodes-and-marks\join-up.mdx

```mdx
---
title: joinUp command
meta:
  title: joinUp command | Tiptap Editor Docs
  description: Use the joinUp command in Tiptap to join the selected block with the sibling above it. Learn more in our docs!
  category: Editor
---

The `joinUp` command joins the selected block, or if there is a text selection, the closest ancestor block of the selection that can be joined, with the sibling above it. [See also](https://prosemirror.net/docs/ref/#commands.joinUp)

## Use the joinUp command

\`\`\`js
editor.commands.joinUp()
\`\`\`

```

# editor\api\commands\nodes-and-marks\lift-empty-block.mdx

```mdx
---
title: liftEmptyBlock command
meta:
  title: liftEmptyBlock command | Tiptap Editor Docs
  description: Lift the currently selected empty textblock in your Tiptap Editor with the liftEmptyBlock command. Learn more in our docs!
  category: Editor
---

If the currently selected block is an empty textblock, lift it if possible. **Lifting** means, that the block will be moved to the parent of the block it is currently in.

## Using the liftEmptyBlock command

\`\`\`js
editor.commands.liftEmptyBlock()
\`\`\`

```

# editor\api\commands\nodes-and-marks\lift.mdx

```mdx
---
title: lift command
meta:
  title: lift command | Tiptap Editor Docs
  description: Lift a node up into its parent node in your Tiptap Editor with the lift command. Learn more in our docs!
  category: Editor
---

The `lift` command lifts a given node up into it’s parent node. **Lifting** means, that the block will be moved to the parent of the block it is currently in.

## Parameters

`typeOrName: String | NodeType`

The node that should be lifted. If the node is not found in the current selection, ignore the command.

`attributes: Record<string, any>`

The attributes the node should have to be lifted. This is **optional**.

## Use the lift command

\`\`\`js
// lift any headline
editor.commands.lift('headline')

// lift only h2
editor.commands.lift('headline', { level: 2 })
\`\`\`

```

# editor\api\commands\nodes-and-marks\newline-in-code.mdx

```mdx
---
title: newlineInCode command
meta:
  title: newlineInCode command | Tiptap Editor Docs
  description: Use the newlineInCode command in Tiptap to insert a new line in the current code block. Learn more in our docs!
  category: Editor
---

`newlineInCode` inserts a new line in the current code block. If a selection is set, the selection will be replaced with a newline character.

## Use the newlineInCode command

\`\`\`js
editor.commands.newlineInCode()
\`\`\`

```

# editor\api\commands\nodes-and-marks\reset-attributes.mdx

```mdx
---
title: resetAttributes command
meta:
  title: resetAttributes command | Tiptap Editor Docs
  description: Use the resetAttributes command in Tiptap to reset a node's attributes to their default values. Learn more in our docs!
  category: Editor
---

`resetAttributes` resets some of the nodes attributes back to it's default attributes.

## Parameters

`typeOrName: string | Node`

The node that should be resetted. Can be a string or a Node.

`attributes: string | string[]`

A string or an array of strings that defines which attributes should be reset.

## Use the resetAttributes command

\`\`\`js
// reset the style and class attributes on the currently selected paragraph nodes
editor.commands.resetAttributes('paragraph', ['style', 'class'])
\`\`\`

```

# editor\api\commands\nodes-and-marks\set-mark.mdx

```mdx
---
title: setMark command
meta:
  title: setMark command | Tiptap Editor Docs
  description: Use the setMark command in Tiptap to add a new mark at the current selection. Learn more in our docs!
  category: Editor
---

The `setMark` command will add a new mark at the current selection.

## Parameters

`typeOrName: string | MarkType`

The type of a mark to add. Can be a string or a MarkType.

`attributes: Record<string, any>`

The attributes that should be applied to the mark. **This is optional.**

## Use the setMark command

\`\`\`js
editor.commands.setMark('bold', { class: 'bold-tag' })
\`\`\`

```

# editor\api\commands\nodes-and-marks\set-node.mdx

```mdx
---
title: setNode command
meta:
  title: setNode command | Tiptap Editor Docs
  description: Use the setNode command in Tiptap to replace a given range with a specified text block node. Learn more in our docs!
  category: Editor
---

The `setNode` command will replace a given range with a given node. The range depends on the current selection. **Important**: Currently `setNode` only supports text block nodes.

## Parameters

`typeOrName: string | NodeType`

The type of the node that will replace the range. Can be a string or a NodeType.

`attributes?: Record<string, any>`

The attributes that should be applied to the node. **This is optional.**

## Use the setNode command

\`\`\`js
editor.commands.setNode('paragraph', { id: 'paragraph-01' })
\`\`\`

```

# editor\api\commands\nodes-and-marks\split-block.mdx

```mdx
---
title: splitBlock command
meta:
  title: splitBlock Command | Tiptap Editor Docs
  description: Use the splitBlock command in Tiptap to split the current node into two at the current NodeSelection. Learn more in our docs!
  category: Editor
---

`splitBlock` will split the current node into two nodes at the current [NodeSelection](https://prosemirror.net/docs/ref/#state.NodeSelection). If the current selection is not splittable, the command will be ignored.

## Parameters

`options: Record<string, any>`

- `keepMarks: boolean` - Defines if the marks should be kept or removed. Defaults to `true`.

## Use the splitBlock command

\`\`\`js
// split the current node and keep marks
editor.commands.splitBlock()

// split the current node and don't keep marks
editor.commands.splitBlock({ keepMarks: false })
\`\`\`

```

# editor\api\commands\nodes-and-marks\toggle-mark.mdx

```mdx
---
title: toggleMark command
meta:
  title: toggleMark command | Tiptap Editor Docs
  description: Use the toggleMark command in Tiptap to toggle a specific mark on and off at the current selection. Learn more in our docs!
  category: Editor
---

The `toggleMark` command toggles a specific mark on and off at the current selection.

## Parameters

`typeOrName: string | MarkType`

The type of mark that should be toggled.

`attributes?: Record<string, any>`

The attributes that should be applied to the mark. **This is optional.**

`options?: Record<string, any>`

- `extendEmptyMarkRange: boolean` - Removes the mark even across the current selection. Defaults to `false`

## Use the toggleMark command

\`\`\`js
// toggles a bold mark
editor.commands.toggleMark('bold')

// toggles bold mark with a color attribute
editor.commands.toggleMark('bold', { color: 'red' })

// toggles a bold mark with a color attribute and removes the mark across the current selection
editor.commands.toggleMark('bold', { color: 'red' }, { extendEmptyMarkRange: true })
\`\`\`

```

# editor\api\commands\nodes-and-marks\toggle-node.mdx

```mdx
---
title: toggleNode command
meta:
  title: toggleNode command | Tiptap Editor Docs
  description: Use the toggleNode command in your Tiptap Editor to toggle one node with another. Learn more in our docs!
  category: Editor
---

`toggleNode` will toggle a node with another node.

## Parameters

`typeOrName: string | NodeType`

The type of node that should be toggled.

`toggleTypeOrName: string | NodeType`

The type of node that should be used for the toggling.

`attributes?: Record<string, any>`

The attributes that should be applied to the node. **This is optional.**

## Use the toggleNode command

\`\`\`js
// toggle a paragraph with a heading node
editor.commands.toggleNode('paragraph', 'heading', { level: 1 })

// toggle a paragraph with a image node
editor.commands.toggleNode('paragraph', 'image', { src: 'https://example.com/image.png' })
\`\`\`

```

# editor\api\commands\nodes-and-marks\toggle-wrap.mdx

```mdx
---
title: toggleWrap command
meta:
  title: toggleWrap command | Tiptap Editor Docs
  description: Use the toggleWrap command in Tiptap to wrap the current node with a new node or remove a wrapping node. Learn more in our docs!
  category: Editor
---

`toggleWrap` wraps the current node with a new node or removes a wrapping node.

## Parameters

`typeOrName: string | NodeType`

The type of node that should be used for the wrapping node.

`attributes?: Record<string, any>`

The attributes that should be applied to the node. **This is optional.**

## Use the toggleWrap command

\`\`\`js
// toggle wrap the current selection with a heading node
editor.commands.toggleWrap('heading', { level: 1 })
\`\`\`

```

# editor\api\commands\nodes-and-marks\undo-input-rule.mdx

```mdx
---
title: undoInputRule command
meta:
  title: undoInputRule command | Tiptap Editor Docs
  description: Use the undoInputRule command in Tiptap to undo the most recent input rule that was triggered. Learn more in our docs!
  category: Editor
---

`undoInputRule` will undo the most recent input rule that was triggered.

## Use the undoInputRule command

\`\`\`js
editor.commands.undoInputRule()
\`\`\`

```

# editor\api\commands\nodes-and-marks\unset-all-marks.mdx

```mdx
---
title: unsetAllMarks command
meta:
  title: unsetAllMarks command | Tiptap Editor Docs
  description: Use the unsetAllMarks command in Tiptap to remove all marks from the current selection. Learn more in our docs!
  category: Editor
---

`unsetAllMarks` will remove all marks from the current selection.

## Using the unsetAllMarks command

\`\`\`js
editor.commands.unsetAllMarks()
\`\`\`

```

# editor\api\commands\nodes-and-marks\unset-mark.mdx

```mdx
---
title: unsetMark command
meta:
  title: unsetMark command | Tiptap Editor Docs
  description: Use the unsetMark command in Tiptap to remove a specific mark from the current or across a selection. Learn more in our docs!
  category: Editor
---

`unsetMark` will remove the mark from the current selection. Can also remove all marks across the current selection.

## Parameters

`typeOrName: string | MarkType`

The type of mark that should be removed.

`options?: Record<string, any>`

- `extendEmptyMarkRange?: boolean` - Removes the mark even across the current selection. Defaults to `false`

## Use the unsetMark command

\`\`\`js
// removes a bold mark
editor.commands.unsetMark('bold')

// removes a bold mark across the current selection
editor.commands.unsetMark('bold', { extendEmptyMarkRange: true })
\`\`\`

```

# editor\api\commands\nodes-and-marks\update-attributes.mdx

```mdx
---
title: updateAttributes command
meta:
  title: updateAttributes command | Tiptap Editor Docs
  description: Use the updateAttributes command in Tiptap to set new attribute values for a node or mark. Learn more in our docs!
  category: Editor
---

The `updateAttributes` command sets attributes of a node or mark to new values. Not passed attributes won’t be touched.

See also: [extendMarkRange](/editor/api/commands/nodes-and-marks/extend-mark-range)

## Parameters

`typeOrName: string | NodeType | MarkType`

Pass the type you want to update, for example `'heading'`.

`attributes: Record<string, any>`

This expects an object with the attributes that need to be updated. It doesn’t need to have all attributes.

## Use the updateAttributes command

\`\`\`js
// Update node attributes
editor.commands.updateAttributes('heading', { level: 1 })

// Update mark attributes
editor.commands.updateAttributes('highlight', { color: 'pink' })
\`\`\`

```

# editor\api\commands\select-textblock-end.mdx

```mdx
---
title: selectTextblockEnd command
meta:
  title: selectTextblockEnd command | Tiptap Editor Docs
  description: Use the selectTextblockEnd command in Tiptap to move the cursor to the end of the current textblock. Learn more in our docs!
  category: Editor
---

The `selectTextblockEnd` will move the cursor to the end of the current textblock if the block is a valid textblock.

## Use the selectTextblockEnd command

\`\`\`js
editor.commands.selectTextblockEnd()
\`\`\`

```

# editor\api\commands\select-textblock-start.mdx

```mdx
---
title: selectTextblockStart command
meta:
  title: selectTextblockStart command | Tiptap Editor Docs
  description: Use the selectTextblockStart command in Tiptap to move the cursor to the start of the current textblock. Learn more in our docs!
  category: Editor
---

The `selectTextblockStart` will move the cursor to the start of the current textblock if the block is a valid textblock.

## Use the selectTextblockStart command

\`\`\`js
editor.commands.selectTextblockStart()
\`\`\`

```

# editor\api\commands\selection\blur.mdx

```mdx
---
title: blur command
meta:
  title: blur command | Tiptap Editor Docs
  description: Use the blur command in Tiptap to remove focus from your Tiptap editor. Learn more about it in the docs.
---

Understand the functionality of the blur command in Tiptap, which removes focus from the editor.

See also: [focus](/editor/api/commands/selection/focus)

## Use the blur command

\`\`\`js
// Remove the focus from the editor
editor.commands.blur()
\`\`\`

```

# editor\api\commands\selection\delete-range.mdx

```mdx
---
title: deleteRange commands
meta:
  title: deleteRange command | Tiptap Editor Docs
  description: Use the deleteRange command in Tiptap to remove content within a specific range in your document. Learn more in our docs!
  category: Editor
---

The `deleteRange` command deletes everything in a given range. It requires a `range` attribute of type `Range`.

## Parameters

`range: Range`

## Use the deleteRange command

\`\`\`js
editor.commands.deleteRange({ from: 0, to: 12 })
\`\`\`

```

# editor\api\commands\selection\delete-selection.mdx

```mdx
---
title: deleteSelection command
description: The deleteSelection command in Tiptap targets and removes any nodes or content that are currently selected within the editor.
meta:
  title: deleteSelection command | Tiptap Editor Docs
  description: The deleteSelection command in Tiptap removes any nodes or content that are currently selected. More in the docs.
  category: Editor
---

The `deleteSelection` command deletes the currently selected nodes. If no selection exists, nothing will be deleted.

## Use the deleteSelection command

\`\`\`js
editor.commands.deleteSelection()
\`\`\`

```

# editor\api\commands\selection\enter.mdx

```mdx
---
title: enter command
meta:
  title: enter command | Tiptap Editor Docs
  description: Use the enter command in Tiptap to trigger an enter key action for automated text entry and formatting. More in the docs.
  category: Editor
---

The `enter` command triggers an enter programmatically.

## Use the enter command

\`\`\`js
editor.commands.enter()
\`\`\`

```

# editor\api\commands\selection\focus.mdx

```mdx
---
title: focus command
meta:
  title: focus command | Tiptap Editor Docs
  description: Use the focus command in Tiptap to set the focus back to the editor at a specific position. Learn more in our docs!
  category: Editor
---

This command sets the focus back to the editor.

When a user clicks on a button outside the editor, the browser sets the focus to that button. In most scenarios you want to focus the editor then again. That’s why you’ll see that in basically every demo here.

See also: [setTextSelection](/editor/api/commands/selection/set-text-selection), [blur](/editor/api/commands/selection/blur)

## Parameters

`position: 'start' | 'end' | 'all' | number | boolean | null (false)`

By default, it’s restoring the cursor position (and text selection). Pass a position to move the cursor to.

`options: { scrollIntoView: boolean }`

Defines whether to scroll to the cursor when focusing. Defaults to `true`.

## Use the focus command

\`\`\`js
// Set the focus to the editor
editor.commands.focus()

// Set the cursor to the first position
editor.commands.focus('start')

// Set the cursor to the last position
editor.commands.focus('end')

// Selects the whole document
editor.commands.focus('all')

// Set the cursor to position 10
editor.commands.focus(10)
\`\`\`

```

# editor\api\commands\selection\index.mdx

```mdx
---
title: Selection commands
meta:
  title: Selection commands | Tiptap Editor Docs
  description: Manage selections in your Tiptap Editor with editor commands like blur, focus, deleteSelection, etc. More in our docs!
  category: Editor
---

The Tiptap editor provides editor commands for managing selection and focus within your documents. Here’s an overview of the essential selection commands that help you manage cursor movement, selections, and focus behavior.

## Use Cases

- **Managing Focus and Blur:** Control focus behavior using [`focus`](/editor/api/commands/selection/focus) and [`blur`](/editor/api/commands/selection/blur).
- **Deleting and Selecting Content:** Use commands like [`deleteSelection`](/editor/api/commands/selection/delete-selection) and [`selectAll`](/editor/api/commands/selection/select-all) to efficiently manage content.
- **Navigating the Document:** Scroll to a specific position or node using [`scrollIntoView`](/editor/api/commands/selection/scroll-into-view) and select specific nodes with [`selectNodeBackward`](/editor/api/commands/selection/select-node-backward), [`selectNodeForward`](/editor/api/commands/selection/select-node-forward), or [`selectParentNode`](/editor/api/commands/selection/select-parent-node).

## List of selection commands

| Command              | Description                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------- |
| `blur`               | Removes focus from the editor.                                                              |
| `deleteRange`        | Deletes everything in a range.                                                              |
| `deleteSelection`    | Deletes the current selection or cursor position.                                           |
| `enter`              | Simulates an Enter key press, creating a new line.                                          |
| `focus`              | Sets focus back to the editor and moves the cursor to a specified position.                 |
| `keyboardShortcut`   | Triggers a ShortcutEvent with a given name.                                                 |
| `scrollIntoView`     | Scrolls the view to the current selection or cursor position.                               |
| `selectAll`          | Selects the entire document.                                                                |
| `selectNodeBackward` | Selects the node before the current textblock if the cursor is at the start of a textblock. |
| `selectNodeForward`  | Selects the node after the current textblock if the cursor is at the end of a textblock.    |
| `selectParentNode`   | Moves the selection to the parent node of the currently selected node.                      |
| `setNodeSelection`   | Creates a new NodeSelection at a given position.                                            |
| `setTextSelection`   | Controls the text selection by setting it to a specified range or position.                 |

```

# editor\api\commands\selection\keyboard-shortcut.mdx

```mdx
---
title: keyboardShortcut command
meta:
  title: keyboardShortcut command | Tiptap Editor Docs
  description: Use the keyboardShortcut command in Tiptap to trigger a ShortcutEvent with a given name. Learn more in our docs!
  category: Editor
---

The `keyboardShortcut` command will try to trigger a ShortcutEvent with a given name.

## Parameters

`name: String`

The name of the shortcut to trigger.

## Use the keyboardShortcut command

\`\`\`js
editor.commands.keyboardShortcut('undo')
\`\`\`

```

# editor\api\commands\selection\scroll-into-view.mdx

```mdx
---
title: scrollIntoView command
meta:
  title: scrollIntoView command | Tiptap Editor Docs
  description: Use the scrollIntoView command in Tiptap to scroll the view to the current selection or cursor position. Learn more in our docs!
  category: Editor
---

`scrollIntoView` scrolls the view to the current selection or cursor position.

## Use the scrollIntoView command

\`\`\`js
editor.commands.scrollIntoView()
\`\`\`

```

# editor\api\commands\selection\select-all.mdx

```mdx
---
title: selectAll command
meta:
  title: selectAll command | Tiptap Editor Docs
  description: Use the selectAll command in your Tiptap Editor to select the whole document at once. Learn more in our docs!
  category: Editor
---

Selects the whole document at once.

## Use the selectAll command

\`\`\`js
// Select the whole document
editor.commands.selectAll()
\`\`\`

```

# editor\api\commands\selection\select-node-backward.mdx

```mdx
---
title: selectNodeBackward command
meta:
  title: selectNodeBackward command | Tiptap Editor Docs
  description: Use the selectNodeBackward command in Tiptap to select the node before the current textblock. Learn more in our docs!
  category: Editor
---

If the selection is empty and at the start of a textblock, `selectNodeBackward` will select the node before the current textblock if possible.

## Use the selectNodeBackward command

\`\`\`js
editor.commands.selectNodeBackward()
\`\`\`

```

# editor\api\commands\selection\select-node-forward.mdx

```mdx
---
title: selectNodeForward command
meta:
  title: selectNodeForward command | Tiptap Editor Docs
  description: Use the selectNodeForward command in Tiptap to select the node after the current textblock. Learn more in our docs!
  category: Editor
---

If the selection is empty and at the end of a textblock, `selectNodeForward` will select the node after the current textblock if possible.

## Use the selectNodeForward command

\`\`\`js
editor.commands.selectNodeForward()
\`\`\`

```

# editor\api\commands\selection\select-parent-node.mdx

```mdx
---
title: selectParentNode command
meta:
  title: selectParentNode command | Tiptap Editor Docs
  description: Use the selectParentNode command in Tiptap to move the selection to the parent node. Learn more in our docs!
  category: Editor
---

`selectParentNode` will try to get the parent node of the currently selected node and move the selection to that node.

## Use the selectParentNode command

\`\`\`js
editor.commands.selectParentNode()
\`\`\`

```

# editor\api\commands\selection\set-node-selection.mdx

```mdx
---
title: setNodeSelection command
meta:
  title: setNodeSelection command | Tiptap Editor Docs
  description: Use the setNodeSelection command in Tiptap to create a new NodeSelection at a given position. Learn more in our docs!
---

`setNodeSelection` creates a new NodeSelection at a given position. A node selection is a selection that points to a single node. [See more](https://prosemirror.net/docs/ref/#state.NodeSelection)

## Parameters

`position: number`

The position the NodeSelection will be created at.

## Use the setNodeSelection command

\`\`\`js
editor.commands.setNodeSelection(10)
\`\`\`

```

# editor\api\commands\selection\set-text-selection.mdx

```mdx
---
title: setTextSelection command
meta:
  title: setTextSelection command | Tiptap Editor Docs
  description: Use the setTextSelection command to control and set text selection to a specified range or position. Learn more in our docs!
  category: Editor
---

If you think of selection in the context of an editor, you’ll probably think of a text selection. With `setTextSelection` you can control that text selection and set it to a specified range or position.

See also: [focus](/editor/api/commands/selection/focus), [setNodeSelection](/editor/api/commands/selection/set-node-selection), [deleteSelection](/editor/api/commands/selection/delete-selection), [selectAll](/editor/api/commands/selection/select-all)

## Parameters

`position: number | Range`

Pass a number, or a Range, for example `{ from: 5, to: 10 }`.

## Use the setTextSelection command

\`\`\`js
// Set the cursor to the specified position
editor.commands.setTextSelection(10)

// Set the text selection to the specified range
editor.commands.setTextSelection({ from: 5, to: 10 })
\`\`\`

```

# editor\api\commands\set-meta.mdx

```mdx
---
title: setMeta command
meta:
  title: setMeta command | Tiptap Editor Docs
  description: Use the setMeta command in Tiptap to store a metadata property in the current transaction. Learn more in our docs!
  category: Editor
---

Store a metadata property in the current transaction.

## Parameters

`key: string`

The name of your metadata. You can get its value at any time with [getMeta](https://prosemirror.net/docs/ref/#state.Transaction.getMeta).

`value: any`

Store any value within your metadata.

## Use the setMeta command

\`\`\`js
// Prevent the update event from being triggered
editor.commands.setMeta('preventUpdate', true)

// Store any value in the current transaction.
// You can get this value at any time with tr.getMeta('foo').
editor.commands.setMeta('foo', 'bar')
\`\`\`

```

# editor\api\editor.mdx

```mdx
---
title: Editor Instance API
meta:
  title: Editor Class | Tiptap Editor Docs
  description: Learn how to use methods, getters and settings with the Editor class. Discover all you need to know in our detailed guide.
  category: Editor
---

The editor instance is a central building block of Tiptap. It does most of the heavy lifting of creating a working [ProseMirror](https://ProseMirror.net/) editor such as creating the [`EditorView`](https://ProseMirror.net/docs/ref/#view.EditorView), setting the initial [`EditorState`](https://ProseMirror.net/docs/ref/#state.Editor_State) and so on.

## Settings

The `Editor` class accepts a bunch of settings. Here is a list of all available settings:

### element

The `element` specifies the HTML element the editor will be binded to. The following code will integrate Tiptap with an element with the `.element` class:

\`\`\`js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

new Editor({
  element: document.querySelector('.element'),
  extensions: [StarterKit],
})
\`\`\`

You can even initiate your editor before mounting it to an element. This is useful when your DOM is not yet available. Just leave out the `element`, we’ll create one for you. Append it to your container at a later date:

\`\`\`js
yourContainerElement.append(editor.options.element)
\`\`\`

### extensions

It’s required to pass a list of extensions to the `extensions` property, even if you only want to allow paragraphs.

\`\`\`js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Highlight from '@tiptap/extension-highlight'

new Editor({
  // Use the default extensions
  extensions: [StarterKit],

  // … or use specific extensions
  extensions: [Document, Paragraph, Text],

  // … or both
  extensions: [StarterKit, Highlight],
})
\`\`\`

### content

With the `content` property you can provide the initial content for the editor. This can be HTML or JSON.

\`\`\`js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

new Editor({
  content: `<p>Example Text</p>`,
  extensions: [StarterKit],
})
\`\`\`

### editable

The `editable` property determines if users can write into the editor.

\`\`\`js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

new Editor({
  content: `<p>Example Text</p>`,
  extensions: [StarterKit],
  editable: false,
})
\`\`\`

### autofocus

With `autofocus` you can force the cursor to jump in the editor on initialization.

| Value    | Description                                            |
| -------- | ------------------------------------------------------ |
| `start`  | Sets the focus to the beginning of the document.       |
| `end`    | Sets the focus to the end of the document.             |
| `all`    | Selects the whole document.                            |
| `Number` | Sets the focus to a specific position in the document. |
| `true`   | Enables autofocus.                                     |
| `false`  | Disables autofocus.                                    |
| `null`   | Disables autofocus.                                    |

\`\`\`js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

new Editor({
  extensions: [StarterKit],
  autofocus: false,
})
\`\`\`

### enableInputRules

By default, Tiptap enables all [input rules](/editor/extensions/custom-extensions/extend-existing#input-rules). With `enableInputRules` you can control that.

\`\`\`js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

new Editor({
  content: `<p>Example Text</p>`,
  extensions: [StarterKit],
  enableInputRules: false,
})
\`\`\`

Alternatively you can allow only specific input rules.

\`\`\`js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'

new Editor({
  content: `<p>Example Text</p>`,
  extensions: [StarterKit, Link],
  // pass an array of extensions or extension names
  // to allow only specific input rules
  enableInputRules: [Link, 'horizontalRule'],
})
\`\`\`

### enablePasteRules

By default, Tiptap enables all [paste rules](/editor/extensions/custom-extensions/extend-existing#paste-rules). With `enablePasteRules` you can control that.

\`\`\`js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

new Editor({
  content: `<p>Example Text</p>`,
  extensions: [StarterKit],
  enablePasteRules: false,
})
\`\`\`

Alternatively you can allow only specific paste rules.

\`\`\`js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'

new Editor({
  content: `<p>Example Text</p>`,
  extensions: [StarterKit, Link],
  // pass an array of extensions or extension names
  // to allow only specific paste rules
  enablePasteRules: [Link, 'horizontalRule'],
})
\`\`\`

### injectCSS

By default, Tiptap injects [a little bit of CSS](https://github.com/ueberdosis/tiptap/tree/main/packages/core/src/style.ts). With `injectCSS` you can disable that.

\`\`\`js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

new Editor({
  extensions: [StarterKit],
  injectCSS: false,
})
\`\`\`

### injectNonce

When you use a [Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy) with `nonce`, you can specify a `nonce` to be added to dynamically created elements. Here is an example:

\`\`\`js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

new Editor({
  extensions: [StarterKit],
  injectCSS: true,
  injectNonce: 'your-nonce-here',
})
\`\`\`

### editorProps

For advanced use cases, you can pass `editorProps` which will be handled by [ProseMirror](https://prosemirror.net/docs/ref/#view.EditorProps). You can use it to override various editor events or change editor DOM element attributes, for example to add some Tailwind classes. Here is an example:

\`\`\`js
new Editor({
  // Learn more: https://prosemirror.net/docs/ref/#view.EditorProps
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
    },
    transformPastedText(text) {
      return text.toUpperCase()
    },
  },
})
\`\`\`

You can use that to hook into event handlers and pass - for example - a custom paste handler, too.

### parseOptions

Passed content is parsed by ProseMirror. To hook into the parsing, you can pass `parseOptions` which are then handled by [ProseMirror](https://prosemirror.net/docs/ref/#model.ParseOptions).

\`\`\`js
new Editor({
  // Learn more: https://prosemirror.net/docs/ref/#model.ParseOptions
  parseOptions: {
    preserveWhitespace: 'full',
  },
})
\`\`\`

## Methods

The editor instance will provide a bunch of public methods. Methods are regular functions and can return anything. They’ll help you to work with the editor.

Don’t confuse methods with [commands](/editor/api/commands). Commands are used to change the state of editor (content, selection, and so on) and only return `true` or `false`.

### can()

Check if a command or a command chain can be executed – without actually executing it. Can be very helpful to enable/disable or show/hide buttons.

\`\`\`js
// Returns `true` if the undo command can be executed
editor.can().undo()
\`\`\`

### chain()

Create a command chain to call multiple commands at once.

\`\`\`js
// Execute two commands at once
editor.chain().focus().toggleBold().run()
\`\`\`

### destroy()

Stops the editor instance and unbinds all events.

\`\`\`js
// Hasta la vista, baby!
editor.destroy()
\`\`\`

### getHTML()

Returns the current editor document as HTML

\`\`\`js
editor.getHTML()
\`\`\`

### getJSON()

Returns the current editor document as JSON.

\`\`\`js
editor.getJSON()
\`\`\`

### getText()

Returns the current editor document as plain text.

| Parameter | Type                                                                     | Description                    |
| --------- | ------------------------------------------------------------------------ | ------------------------------ |
| options   | blockSeparator?: string, textSerializers?: Record;string, TextSerializer | Options for the serialization. |

\`\`\`js
// Give me plain text!
editor.getText()
// Add two line breaks between nodes
editor.getText({ blockSeparator: '\n\n' })
\`\`\`

### getAttributes()

Get attributes of the currently selected node or mark.

| Parameter  | Type                           | Description              |
| ---------- | ------------------------------ | ------------------------ |
| typeOrName | string \| NodeType \| MarkType | Name of the node or mark |

\`\`\`js
editor.getAttributes('link').href
\`\`\`

### isActive()

Returns if the currently selected node or mark is active.

| Parameter  | Type                      | Description                    |
| ---------- | ------------------------- | ------------------------------ |
| name       | string \| null            | Name of the node or mark       |
| attributes | Record&lt;string, any&gt; | Attributes of the node or mark |

\`\`\`js
// Check if it’s a heading
editor.isActive('heading')
// Check if it’s a heading with a specific attribute value
editor.isActive('heading', { level: 2 })
// Check if it has a specific attribute value, doesn’t care what node/mark it is
editor.isActive({ textAlign: 'justify' })
\`\`\`

### registerPlugin()

Register a ProseMirror plugin.

| Parameter      | Type                                                 | Description                                               |
| -------------- | ---------------------------------------------------- | --------------------------------------------------------- |
| plugin         | `Plugin`                                             | A ProseMirror plugin                                      |
| handlePlugins? | `(newPlugin: Plugin, plugins: Plugin[]) => Plugin[]` | Control how to merge the plugin into the existing plugins |

### setOptions()

Update editor options.

| Parameter | Type                     | Description       |
| --------- | ------------------------ | ----------------- |
| options   | `Partial<EditorOptions>` | A list of options |

\`\`\`js
// Add a class to an existing editor instance
editor.setOptions({
  editorProps: {
    attributes: {
      class: 'my-custom-class',
    },
  },
})
\`\`\`

### setEditable()

Update editable state of the editor.

| Parameter  | Type      | Description                                                     |
| ---------- | --------- | --------------------------------------------------------------- |
| editable   | `boolean` | `true` when the user should be able to write into the editor.   |
| emitUpdate | `boolean` | Defaults to `true`. Determines whether `onUpdate` is triggered. |

\`\`\`js
// Make the editor read-only
editor.setEditable(false)
\`\`\`

### unregisterPlugin()

Unregister a ProseMirror plugin.

| Parameter       | Type                  | Description      |
| --------------- | --------------------- | ---------------- |
| nameOrPluginKey | `string \| PluginKey` | The plugins name |

### $node()

See the [NodePos class](/editor/api/node-positions).

## Properties

### isEditable

Returns whether the editor is editable or read-only.

\`\`\`js
editor.isEditable
\`\`\`

### isEmpty

Check if there is content.

\`\`\`js
editor.isEmpty
\`\`\`

### isFocused

Check if the editor is focused.

\`\`\`js
editor.isFocused
\`\`\`

### isDestroyed

Check if the editor is destroyed.

\`\`\`js
editor.isDestroyed
\`\`\`

### isCapturingTransaction

Check if the editor is capturing a transaction.

\`\`\`js
editor.isCapturingTransaction
\`\`\`

```

# editor\api\events.mdx

```mdx
---
title: Events in Tiptap
meta:
  title: Events in Tiptap | Tiptap Editor Docs
  description: Use and handle various events in Tiptap, including creation, updates, focus, blur, and destruction. More in the docs!
  category: Editor
---

The editor fires a few different events that you can hook into. Let’s have a look at all the available events first.

## List of available events

| Event Name        | Description                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| `beforeCreate`    | Before the editor view is created.                                                                            |
| `create`          | When the editor is fully initialized and ready.                                                               |
| `update`          | When there is a change in the content.                                                                        |
| `selectionUpdate` | When the selection changes within the editor.                                                                 |
| `transaction`     | When the editor state changes due to any operation.                                                           |
| `focus`           | When the editor gains focus.                                                                                  |
| `blur`            | When the editor loses focus.                                                                                  |
| `destroy`         | When the editor instance is being destroyed.                                                                  |
| `paste`           | When content is pasted into the editor.                                                                       |
| `drop`            | When content is dropped into the editor.                                                                      |
| `contentError`    | The content does not match the schema. [Read more here](/editor/core-concepts/schema#invalid-schema-handling) |

## Register event listeners

There are three ways to register event listeners.

### Option 1: Configuration

You can define your event listeners on a new editor instance right-away:

\`\`\`js
const editor = new Editor({
  onBeforeCreate({ editor }) {
    // Before the view is created.
  },
  onCreate({ editor }) {
    // The editor is ready.
  },
  onUpdate({ editor }) {
    // The content has changed.
  },
  onSelectionUpdate({ editor }) {
    // The selection has changed.
  },
  onTransaction({ editor, transaction }) {
    // The editor state has changed.
  },
  onFocus({ editor, event }) {
    // The editor is focused.
  },
  onBlur({ editor, event }) {
    // The editor isn’t focused anymore.
  },
  onDestroy() {
    // The editor is being destroyed.
  },
  onPaste(event: ClipboardEvent, slice: Slice) {
    // The editor is being pasted into.
  },
  onDrop(event: DragEvent, slice: Slice, moved: boolean) {
    // The editor is being pasted into.
  },
  onContentError({ editor, error, disableCollaboration }) {
    // The editor content does not match the schema.
  },
})
\`\`\`

### Option 2: Binding

Or you can register your event listeners on a running editor instance:

#### Bind event listeners

\`\`\`js
editor.on('beforeCreate', ({ editor }) => {
  // Before the view is created.
})

editor.on('create', ({ editor }) => {
  // The editor is ready.
})

editor.on('update', ({ editor }) => {
  // The content has changed.
})

editor.on('selectionUpdate', ({ editor }) => {
  // The selection has changed.
})

editor.on('transaction', ({ editor, transaction }) => {
  // The editor state has changed.
})

editor.on('focus', ({ editor, event }) => {
  // The editor is focused.
})

editor.on('blur', ({ editor, event }) => {
  // The editor isn’t focused anymore.
})

editor.on('destroy', () => {
  // The editor is being destroyed.
})

editor.on('paste', ({ event, slice, editor }) => {
  // The editor is being pasted into.
})

editor.on('drop', ({ editor, event, slice, moved }) => {
  // The editor is being destroyed.
})

editor.on('contentError', ({ editor, error, disableCollaboration }) => {
  // The editor content does not match the schema.
})
\`\`\`

#### Unbind event listeners

If you need to unbind those event listeners at some point, you should register your event listeners with `.on()` and unbind them with `.off()` then.

\`\`\`js
const onUpdate = () => {
  // The content has changed.
}

// Bind …
editor.on('update', onUpdate)

// … and unbind.
editor.off('update', onUpdate)
\`\`\`

### Option 3: Extensions

Moving your event listeners to custom extensions (or nodes, or marks) is also possible. Here’s how that would look like:

\`\`\`js
import { Extension } from '@tiptap/core'

const CustomExtension = Extension.create({
  onBeforeCreate({ editor }) {
    // Before the view is created.
  },
  onCreate({ editor }) {
    // The editor is ready.
  },
  onUpdate({ editor }) {
    // The content has changed.
  },
  onSelectionUpdate({ editor }) {
    // The selection has changed.
  },
  onTransaction({ editor, transaction }) {
    // The editor state has changed.
  },
  onFocus({ editor, event }) {
    // The editor is focused.
  },
  onBlur({ editor, event }) {
    // The editor isn’t focused anymore.
  },
  onDestroy() {
    // The editor is being destroyed.
  },
  onContentError({ editor, error, disableCollaboration }) {
    // The editor content does not match the schema.
  },
})
\`\`\`

```

# editor\api\node-positions.mdx

```mdx
---
title: Node Positions
meta:
  title: Node Positions | Tiptap Editor Docs
  description: Learn about Node Positions in Tiptap for document navigation and manipulation. Learn more in the docs!
  category: Editor
---

Node Positions (`NodePos`) describe the specific position of a node, its children, and its parent, providing easy navigation between them. Node Positions are heavily inspired by the DOM and are based on ProseMirror's [ResolvedPos](https://prosemirror.net/docs/ref/#model.ResolvedPos) implementation.

## Use Node Positions

The easiest way to create a new Node Position is by using the helper functions in the Editor instance. This way you always use the correct editor instance and have direct access to the API.

\`\`\`js
// set up your editor somewhere up here

// The NodePosition for the outermost document node
const $doc = editor.$doc

// Get all nodes of type 'heading' in the document
const $headings = editor.$nodes('heading')

// Filter by attributes
const $h1 = editor.$nodes('heading', { level: 1 })

// Pick nodes directly
const $firstHeading = editor.$node('heading', { level: 1 })

// Create a new NodePos via the $pos method when the type is unknown
const $myCustomPos = editor.$pos(30)
\`\`\`

You can also create your own NodePos instances:

\`\`\`js
// You need to have an editor instance
// and a position you want to map to
const myNodePos = new NodePos(100, editor)
\`\`\`

## What can I do with a NodePos?

`NodePos` lets you traverse the document similarly to the document DOM in your browser. You can access parent nodes, child nodes, and sibling nodes. 

**Example:** Get and update the content of a `codeBlock` node

\`\`\`js
// get the first codeBlock from your document
const $codeBlock = editor.$node('codeBlock')

// get the previous NodePos of your codeBlock node
const $previousItem = $codeBlock.before

// easily update the content
$previousItem.content = '<p>Updated content</p>'
\`\`\`

If you are familiar with the DOM, this example will look familiar:

**Example:** Select list items and insert a new item in a bullet list

\`\`\`js
// get a bullet list from your doc
const $bulletList = editor.$node('bulletList')

// get all listItems from your bulletList
const $listItems = $bulletList.querySelectorAll('listItem')

// get the last listItem
const $lastListItem = $listItems[0]

// insert a new listItem after the last one
editor.commands.insertContentAt($lastListItem.after, '<li>New item</li>')
\`\`\`

## API

### NodePos

The NodePos class is the main class you will work with. It describes a specific position of a node, its children, its parent and easy ways to navigate between them. They are heavily inspired by the DOM and are based on ProseMirror's [ResolvedPos](https://prosemirror.net/docs/ref/#model.ResolvedPos) implementation.

#### Methods

| Method           | Arguments                        | Returns               | Description                                                                                               |
| ---------------- | --------------------------------- | --------------------- | --------------------------------------------------------------------------------------------------------- |
| `constructor`    | `pos` (number), `editor` (object) | `NodePos`             | Creates a new `NodePos` instance at the given position (`pos`) within the specified `editor` instance     |
| `closest`        | `nodeType` (string)              | `NodePos` or `null`   | Finds the closest matching `NodePos` going up the document structure. Returns `null` if no match is found |
| `querySelector`  | `nodeType` (string), `attributes` (object) | `NodePos` or `null` | Finds the first matching `NodePos` going down the document structure. Can be filtered by attributes       |
| `querySelectorAll`| `nodeType` (string), `attributes` (object) | `Array<NodePos>`     | Finds all matching `NodePos` instances going down the document structure. Can be filtered by attributes   |
| `setAttribute`   | `attributes` (object)            | `NodePos`             | Sets the specified attributes on the current `NodePos`                                                    |

##### constructor

**Arguments**

- `pos` – The position you want to map to
- `editor` – The editor instance you want to use

**Returns** `NodePos`

\`\`\`js
const myNodePos = new NodePos(100, editor)
\`\`\`

##### closest

The closest NodePos instance of your NodePosition going up the depth. If there is no matching NodePos, it will return `null`.

**Returns** `NodePos | null`

\`\`\`js
const closest = myNodePos.closest('bulletList')
\`\`\`

##### querySelector

The first matching NodePos instance of your NodePosition going down the depth. If there is no matching NodePos, it will return `null`.

You can also filter by attributes via the second attribute.

**Returns** `NodePos | null`

\`\`\`js
const firstHeading = myNodePos.querySelector('heading')
const firstH1 = myNodePos.querySelector('heading', { level: 1 })
\`\`\`

##### querySelectorAll

All matching NodePos instances of your NodePosition going down the depth. If there is no matching NodePos, it will return an empty array.

You can also filter by attributes via the second attribute.

**Returns** `Array<NodePos>`

\`\`\`js
const headings = myNodePos.querySelectorAll('heading')
const h1s = myNodePos.querySelectorAll('heading', { level: 1 })
\`\`\`

##### setAttribute

Set attributes on the current NodePos.

**Returns** `NodePos`

\`\`\`js
myNodePos.setAttribute({ level: 1 })
\`\`\`

#### Properties

| Property        | Type             | Description                                                                                              |
| --------------- | ---------------- | -------------------------------------------------------------------------------------------------------- |
| `node`          | `Node` (ProseMirror Node) | The ProseMirror node at the current `NodePos`                                                           |
| `parent`        | `NodePos`         | The parent node of the current `NodePos`                                                                 |
| `children`      | `Array<NodePos>`  | The child nodes of the current `NodePos`                                                                 |
| `firstChild`    | `NodePos` or `null` | The first child node of the current `NodePos`, or `null` if none exists                                  |
| `lastChild`     | `NodePos` or `null` | The last child node of the current `NodePos`, or `null` if none exists                                   |
| `pos`           | `number`          | The position of the node in the document                                                                 |
| `from`          | `number`          | The starting position of the node                                                                        |
| `to`            | `number`          | The ending position of the node                                                                          |
| `range`         | `number`          | The range (from–to) of the node at the current `NodePos`                                                 |
| `content`       | `string`          | The content of the node at the current `NodePos`. You can set this to update the node's content           |
| `attributes`    | `Object`          | The attributes of the node at the current `NodePos`                                                      |
| `textContent`   | `string`          | The text content of the node at the current `NodePos`                                                    |
| `depth`         | `number`          | The depth (level) of the node in the document structure                                                  |
| `size`          | `number`          | The size of the node at the current `NodePos`                                                            |
| `before`        | `NodePos` or `null` | The previous node before the current `NodePos`, or `null` if none exists                                  |
| `after`         | `NodePos` or `null` | The next node after the current `NodePos`, or `null` if none exists                                       |

##### node

The ProseMirror Node at the current Node Position.

**Returns** `Node`

\`\`\`js
const node = myNodePos.node
node.type.name // 'paragraph'
\`\`\`

##### element

The DOM element at the current Node Position.

**Returns** `Element`

\`\`\`js
const element = myNodePos.element
element.tagName // 'P'
\`\`\`

##### content

The content of your NodePosition. You can set this to a new value to update the content of the node.

**Returns** `string`

\`\`\`js
const content = myNodePos.content
myNodePos.content = '<p>Updated content</p>'
\`\`\`

##### attributes

The attributes of your NodePosition.

**Returns** `Object`

\`\`\`js
const attributes = myNodePos.attributes
attributes.level // 1
\`\`\`

##### textContent

The text content of your NodePosition.

**Returns** `string`

\`\`\`js
const textContent = myNodePos.textContent
\`\`\`

##### depth

The depth of your NodePosition.

**Returns** `number`

\`\`\`js
const depth = myNodePos.depth
\`\`\`

##### pos

The position of your NodePosition.

**Returns** `number`

\`\`\`js
const pos = myNodePos.pos
\`\`\`

##### size

The size of your NodePosition.

**Returns** `number`

\`\`\`js
const size = myNodePos.size
\`\`\`

##### from

The from position of your NodePosition.

**Returns** `number`

\`\`\`js
const from = myNodePos.from
\`\`\`

##### to

The to position of your NodePosition.

**Returns** `number`

\`\`\`js
const to = myNodePos.to
\`\`\`

##### range

The range of your NodePosition.

**Returns** `number`

\`\`\`js
const range = myNodePos.range
\`\`\`

##### parent

The parent NodePos of your NodePosition.

**Returns** `NodePos`

\`\`\`js
const parent = myNodePos.parent
\`\`\`

##### before

The NodePos before your NodePosition. If there is no NodePos before, it will return `null`.

**Returns** `NodePos | null`

\`\`\`js
const before = myNodePos.before
\`\`\`

##### after

The NodePos after your NodePosition. If there is no NodePos after, it will return `null`.

**Returns** `NodePos | null`

\`\`\`js
const after = myNodePos.after
\`\`\`

##### children

The child NodePos instances of your NodePosition.

**Returns** `Array<NodePos>`

\`\`\`js
const children = myNodePos.children
\`\`\`

##### firstChild

The first child NodePos instance of your NodePosition. If there is no child, it will return `null`.

**Returns** `NodePos | null`

\`\`\`js
const firstChild = myNodePos.firstChild
\`\`\`

##### lastChild

The last child NodePos instance of your NodePosition. If there is no child, it will return `null`.

**Returns** `NodePos | null`

\`\`\`js
const lastChild = myNodePos.lastChild
\`\`\`

```

# editor\api\utilities\html.mdx

```mdx
---
title: HTML Utility
meta:
  title: HTML utility | Tiptap Editor Docs
  description: Use the HTML Utility in Tiptap to render JSON as HTML and convert HTML to JSON without an editor instance. More in the docs!
  category: Editor
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/html.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/html
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/html.svg?label=version
    url: https://npmcharts.com/compare/@tiptap/html
    label: Downloads
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

The HTML Utility helps render JSON content as HTML and generate JSON from HTML without an editor instance, suitable for server-side operations. All it needs is JSON or a HTML string, and a list of extensions.

## Generating HTML from JSON

Given a JSON object, representing a prosemirror document, the `generateHTML` function will return a `string` object representing the JSON content. The function takes two arguments: the JSON object and a list of extensions.

\`\`\`js
/* IN BROWSER ONLY - See below for server-side compatible package */
import { generateHTML } from '@tiptap/core'

// Generate HTML from JSON
generateHTML(
  {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'On the browser only' }] }],
  },
  [
    Document,
    Paragraph,
    Text,
    Bold,
    // other extensions …
  ],
)
// `<p>On the browser only</p>`

/* ON SERVER OR BROWSER - See above for browser only compatible package (ships less JS) */
import { generateHTML } from '@tiptap/html'

// Generate HTML from JSON
generateHTML(
  {
    type: 'doc',
    content: [
      { type: 'paragraph', content: [{ type: 'text', text: 'On the server, or the browser' }] },
    ],
  },
  [
    Document,
    Paragraph,
    Text,
    Bold,
    // other extensions …
  ],
)
// `<p>On the server, or the browser</p>`
\`\`\`

<Callout title="Caution" variant="warning">
  There are two exports available: `generateHTML` from `@tiptap/core` and from `@tiptap/html`. The
  former is only for use within the browser, the latter can be used on either the server or the
  browser. Make sure to use the correct one for your use case. On the server, a virtual DOM is used
  to generate the HTML. So using `@tiptap/core` can ship less code if you don&apos;t need the
  server-side functionality.
</Callout>

<CodeDemo path="/GuideContent/GenerateHTML" />

## Generating JSON from HTML

Given an HTML string, the `generateJSON` function will return a JSON object representing the HTML content as a prosemirror document. The function takes two arguments: the HTML string and a list of extensions.

\`\`\`js
/* IN BROWSER ONLY - See below for server-side compatible package */
import { generateJSON } from '@tiptap/core'

// Generate JSON from HTML
generateJSON(`<p>On the browser only</p>`, [
  Document,
  Paragraph,
  Text,
  Bold,
  // other extensions …
])
// { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'On the browser only' }] }] }

/* ON SERVER OR BROWSER - See above for browser only compatible package (ships less JS) */
import { generateJSON } from '@tiptap/html'

// Generate JSON from HTML
generateJSON(`<p>On the server, or the browser</p>`, [
  Document,
  Paragraph,
  Text,
  Bold,
  // other extensions …
])
// { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'On the server, or the browser' }] }] }
\`\`\`

<Callout title="Caution" variant="warning">
  There are two exports available: `generateJSON` from `@tiptap/core` and from `@tiptap/html`. The
  former is only for use within the browser, the latter can be used on either the server or the
  browser. Make sure to use the correct one for your use case. On the server, a virtual DOM is used
  to generate the HTML. So using `@tiptap/core` can ship less code if you don&apos;t need the
  server-side functionality.
</Callout>

<CodeDemo path="/GuideContent/GenerateJSON" />

## Source code

[packages/html/](https://github.com/ueberdosis/tiptap/blob/main/packages/html/)

```

# editor\api\utilities\index.mdx

```mdx
---
title: Tiptap Utilities
meta:
  title: Utilities | Tiptap Editor Docs
  description: Tiptap Utilities complement the Editor API, providing tools to help you with your editor and content. Learn more in the docs!
  category: Editor
---

Tiptap Utilities are complementing the Editor API, providing tools that improve and extend your interactions with the editor and content.

## All utilities

| Utility Name                                             | Description                                               |
| -------------------------------------------------------- | --------------------------------------------------------- |
| [`HTML Utility`](/editor/api/utilities/html)             | Handles JSON and HTML transformations server-side.        |
| [`Suggestion Utility`](/editor/api/utilities/suggestion) | Adds customizable autocomplete suggestions to the editor. |
| [`Tiptap for PHP`](/editor/api/utilities/tiptap-for-php) | Integrates Tiptap functionalities into PHP projects.      |

```

# editor\api\utilities\suggestion.mdx

```mdx
---
title: Suggestion utility
meta:
  title: Suggestion utility | Tiptap Editor Docs
  description: Customize autocomplete suggestions using nodes like Mention and Emoji. Explore settings and configurations in our docs.
  category: Editor
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/suggestion.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/suggestion
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/suggestion.svg?label=version
    url: https://npmcharts.com/compare/@tiptap/suggestion
    label: Downloads
---

This utility helps with all kinds of suggestions in the editor. Have a look at the [`Mention`](/editor/extensions/nodes/mention) or [`Emoji`](/editor/extensions/nodes/emoji) node to see it in action.

## Settings

### char

The character that triggers the autocomplete popup.

Default: `'@'`

### pluginKey

A ProseMirror PluginKey.

Default: `SuggestionPluginKey`

### allow

A function that returns a boolean to indicate if the suggestion should be active.

Default: `(props: { editor: Editor; state: EditorState; range: Range, isActive?: boolean }) => true`

### allowSpaces

Allows or disallows spaces in suggested items.

Default: `false`

### allowedPrefixes

The prefix characters that are allowed to trigger a suggestion. Set to `null` to allow any prefix character.

Default: `[' ']`

### startOfLine

Trigger the autocomplete popup at the start of a line only.

Default: `false`

### decorationTag

The HTML tag that should be rendered for the suggestion.

Default: `'span'`

### decorationClass

A CSS class that should be added to the suggestion.

Default: `'suggestion'`

### command

Executed when a suggestion is selected.

Default: `() => {}`

### items

Pass an array of filtered suggestions, can be async.

Default: `({ editor, query }) => []`

### render

A render function for the autocomplete popup.

Default: `() => ({})`

### findSuggestionMatch

Optional param to replace the built-in regex matching of editor content that triggers a suggestion.
See [the
source](https://github.com/ueberdosis/tiptap/blob/main/packages/suggestion/src/findSuggestionMatch.ts#L18)
for more detail.

Default: `findSuggestionMatch(config: Trigger): SuggestionMatch`

## Source code

[packages/suggestion/](https://github.com/ueberdosis/tiptap/blob/main/packages/suggestion/)

```

# editor\api\utilities\tiptap-for-php.mdx

```mdx
---
title: Tiptap for PHP utility
meta:
  title: PHP utility | Tiptap Editor Docs
  description: Use the Tiptap PHP package to convert Tiptap JSON to HTML, sanitize content, or modify it. More in the docs!
  category: Editor
tags:
  - type: image
    src: https://img.shields.io/packagist/v/ueberdosis/tiptap-php.svg
    url: https://packagist.org/packages/ueberdosis/tiptap-php
    label: Version
  - type: image
    src: https://img.shields.io/packagist/dt/ueberdosis/tiptap-php.svg
    url: https://packagist.org/packages/ueberdosis/tiptap-php
    label: Downloads
---

A PHP package to work with [Tiptap](https://tiptap.dev/) content. You can transform Tiptap-compatible JSON to HTML, and the other way around, sanitize your content, or just modify it.

## Install

You can install the package via composer:

\`\`\`bash
composer require ueberdosis/tiptap-php
\`\`\`

## Using the Tiptap PHP utility

The PHP package mimics large parts of the JavaScript package. If you know your way around Tiptap, the PHP syntax will feel familiar to you. Here is an easy example:

\`\`\`php
(new Tiptap\Editor)
    ->setContent('<p>Example Text</p>')
    ->getDocument();

// Returns:
// ['type' => 'doc', 'content' => …]
\`\`\`

## Documentation

There’s a lot more the PHP package can do. Check out the [repository on GitHub](https://github.com/ueberdosis/tiptap-php).

```

# editor\core-concepts\extensions.mdx

```mdx
---
title: Extensions in Tiptap
meta:
  title: Extensions | Tiptap Editor Docs
  description: Learn how to create, customize, and integrate extensions into Tiptap to improve your text editor's functionality.
---

Extensions enhance Tiptap by adding new capabilities or modifying the editor's behavior. Whether it is adding new types of content, customizing the editor's appearance, or extending its functionality, extensions are the building blocks of Tiptap.

To add new types of content into your editor you can use [nodes](/editor/api/nodes) and [marks](/editor/extensions/marks) which can render content in the editor.

The optional `@tiptap/starter-kit` includes the most commonly used extensions, simplifying setup. Read more about [`StarterKit`](/editor/getting-started/configure#default-extensions).

Expand your editor's functionality with extensions created by the Tiptap community. Discover a variety of custom features and tools in the [Awesome Tiptap Repository](https://github.com/ueberdosis/awesome-tiptap#community-extensions). For collaboration and support, engage with other developers in the [Discussion Thread](https://github.com/ueberdosis/tiptap/discussions/2973) on community-built extensions.

## What are extensions?

Although Tiptap tries to hide most of the complexity of ProseMirror, it’s built on top of its APIs and we recommend you to read through the [ProseMirror Guide](https://ProseMirror.net/docs/guide/) for advanced usage. You’ll have a better understanding of how everything works under the hood and get more familiar with many terms and jargon used by Tiptap.

Existing [nodes](/editor/extensions/nodes), [marks](/editor/extensions/marks) and [functionality](/editor/extensions/functionality) can give you a good impression on how to approach your own extensions. To make it easier to switch between the documentation and the source code, we linked to the file on GitHub from every single extension documentation page.

We recommend to start with customizing existing extensions first, and create your own extensions with the gained knowledge later. That’s why all the examples below extend existing extensions, but all examples will work on newly created extensions as well.

## Create a new extension

You’re free to create your own extensions for Tiptap. Here is the boilerplate code that’s needed to create and register your own extension:

\`\`\`js
import { Extension } from '@tiptap/core'

const CustomExtension = Extension.create({
  // Your code here
})

const editor = new Editor({
  extensions: [
    // Register your custom extension with the editor.
    CustomExtension,
    // … and don’t forget all other extensions.
    Document,
    Paragraph,
    Text,
    // …
  ],
})
\`\`\`

You can easily bootstrap a new extension via our CLI.

\`\`\`bash
npm init tiptap-extension
\`\`\`

Learn more about custom extensions in our [guide](/editor/extensions/custom-extensions).

```

# editor\core-concepts\introduction.mdx

```mdx
---
title: Tiptap Concepts
description: Explore the foundational elements of Tiptap's API, designed for intricate rich text editing based on ProseMirror's architecture.
meta:
  title: Tiptap Concepts | Tiptap Editor Docs
  description: Learn how to integrate Tiptap's document schema, transaction-based state management, and editor extensions in our docs.
  category: Editor
---

## Structure

ProseMirror works with a strict [Schema](/editor/core-concepts/schema), which defines the allowed structure of a document. A document is a tree of headings, paragraphs and others elements, so called nodes. Marks can be attached to a node, e. g. to emphasize part of it. [Commands](/editor/api/commands) change that document programmatically.

## Content

The document is stored in a state. All changes are applied as transactions to the state. The state has details about the current content, cursor position and selection. You can hook into a few different [events](/editor/api/events), for example to alter transactions before they get applied.

## Extensions

Extensions add [nodes](/editor/extensions/nodes), [marks](/editor/extensions/marks) and/or [functionalities](/editor/extensions/functionality) to the editor. A lot of those extensions bound their commands to common [keyboard shortcuts](/editor/core-concepts/keyboard-shortcuts).

## Vocabulary

ProseMirror has its own vocabulary and you’ll stumble upon all those words now and then. Here is a short overview of the most common words we use in the documentation.

| Word        | Description                                                              |
| ----------- | ------------------------------------------------------------------------ |
| Schema      | Configures the structure your content can have.                          |
| Document    | The actual content in your editor.                                       |
| State       | Everything to describe the current content and selection of your editor. |
| Transaction | A change to the state (updated selection, content, …)                    |
| Extension   | Registers new functionality.                                             |
| Node        | A type of content, for example a heading or a paragraph.                 |
| Mark        | Can be applied to nodes, for example for inline formatting.              |
| Command     | Execute an action inside the editor, that somehow changes the state.     |
| Decoration  | Styling on top of the document, for example to highlight mistakes.       |

```

# editor\core-concepts\keyboard-shortcuts.mdx

```mdx
---
title: Keyboard shortcuts in Tiptap
meta:
  title: Keyboard shortcuts | Tiptap Editor Docs
  description: Discover the predefined keyboard shortcuts for Tiptap and learn how to customize these shortcuts to fit your editing needs.
  category: Editor
---

Tiptap comes with sensible keyboard shortcut defaults. Depending on what you want to use it for, you’ll probably want to change those keyboard shortcuts to your liking. Let’s have a look at what we defined for you, and show you how to change it then!

## Predefined keyboard shortcuts

Most of the core extensions register their own keyboard shortcuts. Depending on what set of extension you use, not all of the below listed keyboard shortcuts work for your editor.

### Essentials

| Command                  | Windows/Linux                                                                  | macOS                                                                      |
| ------------------------ | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Copy                     | <kbd>Control</kbd> + <kbd>C</kbd>                                              | <kbd>Cmd</kbd> + <kbd>C</kbd>                                              |
| Cut                      | <kbd>Control</kbd> + <kbd>X</kbd>                                              | <kbd>Cmd</kbd> + <kbd>X</kbd>                                              |
| Paste                    | <kbd>Control</kbd> + <kbd>V</kbd>                                              | <kbd>Cmd</kbd> + <kbd>V</kbd>                                              |
| Paste without formatting | <kbd>Control</kbd> + <kbd>Shift</kbd> + <kbd>V</kbd>                           | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>V</kbd>                           |
| Undo                     | <kbd>Control</kbd> + <kbd>Z</kbd>                                              | <kbd>Cmd</kbd> + <kbd>Z</kbd>                                              |
| Redo                     | <kbd>Control</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd>                           | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd>                           |
| Add a line break         | <kbd>Shift</kbd> + <kbd>Enter</kbd><br /><kbd>Control</kbd> + <kbd>Enter</kbd> | <kbd>Shift</kbd> + <kbd>Enter</kbd><br /><kbd>Cmd</kbd> + <kbd>Enter</kbd> |

### Text Formatting

| Command       | Windows/Linux                                        | macOS                                            |
| ------------- | ---------------------------------------------------- | ------------------------------------------------ |
| Bold          | <kbd>Control</kbd> + <kbd>B</kbd>                    | <kbd>Cmd</kbd> + <kbd>B</kbd>                    |
| Italicize     | <kbd>Control</kbd> + <kbd>I</kbd>                    | <kbd>Cmd</kbd> + <kbd>I</kbd>                    |
| Underline     | <kbd>Control</kbd> + <kbd>U</kbd>                    | <kbd>Cmd</kbd> + <kbd>U</kbd>                    |
| Strikethrough | <kbd>Control</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> |
| Highlight     | <kbd>Control</kbd> + <kbd>Shift</kbd> + <kbd>H</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>H</kbd> |
| Code          | <kbd>Control</kbd> + <kbd>E</kbd>                    | <kbd>Cmd</kbd> + <kbd>E</kbd>                    |

### Paragraph Formatting

| Command                 | Windows/Linux                                        | macOS                                            |
| ----------------------- | ---------------------------------------------------- | ------------------------------------------------ |
| Apply normal text style | <kbd>Control</kbd> + <kbd>Alt</kbd> + <kbd>0</kbd>   | <kbd>Cmd</kbd> + <kbd>Alt</kbd> + <kbd>0</kbd>   |
| Apply heading style 1   | <kbd>Control</kbd> + <kbd>Alt</kbd> + <kbd>1</kbd>   | <kbd>Cmd</kbd> + <kbd>Alt</kbd> + <kbd>1</kbd>   |
| Apply heading style 2   | <kbd>Control</kbd> + <kbd>Alt</kbd> + <kbd>2</kbd>   | <kbd>Cmd</kbd> + <kbd>Alt</kbd> + <kbd>2</kbd>   |
| Apply heading style 3   | <kbd>Control</kbd> + <kbd>Alt</kbd> + <kbd>3</kbd>   | <kbd>Cmd</kbd> + <kbd>Alt</kbd> + <kbd>3</kbd>   |
| Apply heading style 4   | <kbd>Control</kbd> + <kbd>Alt</kbd> + <kbd>4</kbd>   | <kbd>Cmd</kbd> + <kbd>Alt</kbd> + <kbd>4</kbd>   |
| Apply heading style 5   | <kbd>Control</kbd> + <kbd>Alt</kbd> + <kbd>5</kbd>   | <kbd>Cmd</kbd> + <kbd>Alt</kbd> + <kbd>5</kbd>   |
| Apply heading style 6   | <kbd>Control</kbd> + <kbd>Alt</kbd> + <kbd>6</kbd>   | <kbd>Cmd</kbd> + <kbd>Alt</kbd> + <kbd>6</kbd>   |
| Ordered list            | <kbd>Control</kbd> + <kbd>Shift</kbd> + <kbd>7</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>7</kbd> |
| Bullet list             | <kbd>Control</kbd> + <kbd>Shift</kbd> + <kbd>8</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>8</kbd> |
| Task list               | <kbd>Control</kbd> + <kbd>Shift</kbd> + <kbd>9</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>9</kbd> |
| Blockquote              | <kbd>Control</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd> |
| Left align              | <kbd>Control</kbd> + <kbd>Shift</kbd> + <kbd>L</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>L</kbd> |
| Center align            | <kbd>Control</kbd> + <kbd>Shift</kbd> + <kbd>E</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>E</kbd> |
| Right align             | <kbd>Control</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd> |
| Justify                 | <kbd>Control</kbd> + <kbd>Shift</kbd> + <kbd>J</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>J</kbd> |
| Code block              | <kbd>Control</kbd> + <kbd>Alt</kbd> + <kbd>C</kbd>   | <kbd>Cmd</kbd> + <kbd>Alt</kbd> + <kbd>C</kbd>   |
| Subscript               | <kbd>Control</kbd> + <kbd>,</kbd>                    | <kbd>Cmd</kbd> + <kbd>,</kbd>                    |
| Superscript             | <kbd>Control</kbd> + <kbd>.</kbd>                    | <kbd>Cmd</kbd> + <kbd>.</kbd>                    |

### Text Selection

| Command                                 | Windows/Linux                     | macOS                           |
| --------------------------------------- | --------------------------------- | ------------------------------- |
| Select all                              | <kbd>Control</kbd> + <kbd>A</kbd> | <kbd>Cmd</kbd> + <kbd>A</kbd>   |
| Extend selection one character to left  | <kbd>Shift</kbd> + <kbd>←</kbd>   | <kbd>Shift</kbd> + <kbd>←</kbd> |
| Extend selection one character to right | <kbd>Shift</kbd> + <kbd>→</kbd>   | <kbd>Shift</kbd> + <kbd>→</kbd> |
| Extend selection one line up            | <kbd>Shift</kbd> + <kbd>↑</kbd>   | <kbd>Shift</kbd> + <kbd>↑</kbd> |
| Extend selection one line down          | <kbd>Shift</kbd> + <kbd>↓</kbd>   | <kbd>Shift</kbd> + <kbd>↓</kbd> |

## Overwrite keyboard shortcuts

Keyboard shortcuts may be strings like `'Shift-Control-Enter'`. Keys are based on the strings that can appear in `event.key`, concatenated with a `-`. There is a little tool called [keycode.info](https://keycode.info/), which shows the `event.key` interactively.

Use lowercase letters to refer to letter keys (or uppercase letters if you want shift to be held). You may use `Space` as an alias for the <code> </code>.

Modifiers can be given in any order. `Shift`, `Alt`, `Control` and `Cmd` are recognized. For characters that are created by holding shift, the `Shift` prefix is implied, and should not be added explicitly.

You can use `Mod` as a shorthand for `Cmd` on Mac and `Control` on other platforms.

Here is an example how you can overwrite the keyboard shortcuts for an existing extension:

\`\`\`js
// 1. Import the extension
import BulletList from '@tiptap/extension-bullet-list'

// 2. Overwrite the keyboard shortcuts
const CustomBulletList = BulletList.extend({
  addKeyboardShortcuts() {
    return {
      // ↓ your new keyboard shortcut
      'Mod-l': () => this.editor.commands.toggleBulletList(),
    }
  },
})

// 3. Add the custom extension to your editor
new Editor({
  extensions: [
    CustomBulletList(),
    // …
  ],
})
\`\`\`

```

# editor\core-concepts\nodes-and-marks.mdx

```mdx
---
title: Nodes and Marks
sidebars:
  hideSecondary: true
meta:
  title: Nodes and Marks | Tiptap Editor Docs
  description: Discover the different types of nodes in Tiptap, like paragraphs, headings, code blocks, and more. Learn more in our docs!
  category: Editor
---

If you think of the document as a tree, then nodes are just a type of content in that tree. Examples of nodes are paragraphs, headings, or code blocks. But nodes don’t have to be blocks. They can also be rendered inline with the text, for example for @mentions. Think of them as unique pieces of content that can be styled and manipulated in different ways.

Marks can be applied to specific parts of a node. That’s the case for **bold**, _italic_ or ~~striked~~ text. [Links](#) are marks, too. Think of them as a way to style or annotate text.

## Differences

Nodes and marks are similar in some ways, but they have different use cases. Nodes are the building blocks of your document. They define the structure and hierarchy of your content. Marks, on the other hand, are used to style or annotate text. They can be applied to any part of a node, but they don’t change the structure of the document.

```

# editor\core-concepts\prosemirror.mdx

```mdx
---
title: ProseMirror
meta:
  title: ProseMirror | Tiptap Editor Docs
  description: Access the ProseMirror API and functionality with the Tiptap PM package while developing your editor. Learn more in the docs!
  category: Editor
---

Tiptap is built on top of ProseMirror, which has a pretty powerful API. To access it, we provide the package `@tiptap/pm`. This package provides all important ProseMirror packages like `prosemirror-state`, `prosemirror-view` or `prosemirror-model`.

Using the package for custom development makes sure that you always have the same version of ProseMirror which is used by Tiptap as well. This way, we can make sure that Tiptap and all extensions are compatible with each other and prevent version clashes.

Another plus is that you don't need to install all ProseMirror packages manually, especially if you are not using npm or any other package manager that supports automatic peer dependency resolution.

## Install

\`\`\`bash
npm i @tiptap/pm
\`\`\`

After that you can access all internal ProseMirror packages like this:

\`\`\`js
// this example loads the EditorState class from the ProseMirror state package
import { EditorState } from '@tiptap/pm/state'
\`\`\`

## Integrate packages

The following packages are available:

- `@tiptap/pm/changeset`
- `@tiptap/pm/collab`
- `@tiptap/pm/commands`
- `@tiptap/pm/dropcursor`
- `@tiptap/pm/gapcursor`
- `@tiptap/pm/history`
- `@tiptap/pm/inputrules`
- `@tiptap/pm/keymap`
- `@tiptap/pm/markdown`
- `@tiptap/pm/menu`
- `@tiptap/pm/model`
- `@tiptap/pm/schema-basic`
- `@tiptap/pm/schema-list`
- `@tiptap/pm/state`
- `@tiptap/pm/tables`
- `@tiptap/pm/trailing-node`
- `@tiptap/pm/transform`
- `@tiptap/pm/view`

You can find out more about those libraries in the [ProseMirror documentation](https://prosemirror.net/docs/ref).

```

# editor\core-concepts\schema.mdx

```mdx
---
title: Tiptap Schemas
meta:
  title: Schema | Tiptap Editor Docs
  description: Learn how content is structured in Tiptap’s schema and control your nodes, marks and more in your documents. More in the docs!
  category: Editor
---

import { Callout } from '@/components/ui/Callout'

Unlike many other editors, Tiptap is based on a [schema](https://prosemirror.net/docs/guide/#schema) that defines how your content is structured. That enables you to define the kind of nodes that may occur in the document, its attributes and the way they can be nested.

This schema is _very_ strict. You can’t use any HTML element or attribute that is not defined in your schema.

Let me give you one example: If you paste something like `This is <strong>important</strong>` into Tiptap, but don’t have any extension that handles `strong` tags, you’ll only see `This is important` – without the strong tags.

If you want to know when this happens, you can listen to the [`contentError`](/editor/api/events#contenterror) event after enabling the `enableContentCheck` option.

## How a schema looks like

When you’ll work with the provided extensions only, you don’t have to care that much about the schema. If you’re building your own extensions, it’s probably helpful to understand how the schema works. Let’s look at the most simple schema for a typical ProseMirror editor:

\`\`\`js
// the underlying ProseMirror schema
{
  nodes: {
    doc: {
      content: 'block+',
    },
    paragraph: {
      content: 'inline*',
      group: 'block',
      parseDOM: [{ tag: 'p' }],
      toDOM: () => ['p', 0],
    },
    text: {
      group: 'inline',
    },
  },
}
\`\`\`

We register three nodes here. `doc`, `paragraph` and `text`. `doc` is the root node which allows one or more block nodes as children (`content: 'block+'`). Since `paragraph` is in the group of block nodes (`group: 'block'`) our document can only contain paragraphs. Our paragraphs allow zero or more inline nodes as children (`content: 'inline*'`) so there can only be `text` in it. `parseDOM` defines how a node can be parsed from pasted HTML. `toDOM` defines how it will be rendered in the DOM.

In Tiptap every node, mark and extension is living in its own file. This allows us to split the logic. Under the hood the whole schema will be merged together:

\`\`\`js
// the Tiptap schema API
import { Node } from '@tiptap/core'

const Document = Node.create({
  name: 'doc',
  topNode: true,
  content: 'block+',
})

const Paragraph = Node.create({
  name: 'paragraph',
  group: 'block',
  content: 'inline*',
  parseHTML() {
    return [{ tag: 'p' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['p', HTMLAttributes, 0]
  },
})

const Text = Node.create({
  name: 'text',
  group: 'inline',
})
\`\`\`

## Nodes and marks

### Differences

Nodes are like blocks of content, for example paragraphs, headings, code blocks, blockquotes and many more.

Marks can be applied to specific parts of a node. That’s the case for **bold**, _italic_ or ~~striked~~ text. [Links](#) are marks, too.

### The node schema

#### Content

The content attribute defines exactly what kind of content the node can have. ProseMirror is really strict with that. That means, content which doesn’t fit the schema is thrown away. It expects a name or group as a string. Here are a few examples:

\`\`\`js
Node.create({
  // must have one or more blocks
  content: 'block+',

  // must have zero or more blocks
  content: 'block*',

  // allows all kinds of 'inline' content (text or hard breaks)
  content: 'inline*',

  // must not have anything else than 'text'
  content: 'text*',

  // can have one or more paragraphs, or lists (if lists are used)
  content: '(paragraph|list?)+',

  // must have exact one heading at the top, and one or more blocks below
  content: 'heading block+',
})
\`\`\`

#### Marks

You can define which marks are allowed inside of a node with the `marks` setting of the schema. Add a one or more names or groups of marks, allow all or disallow all marks like this:

\`\`\`js
Node.create({
  // allows only the 'bold' mark
  marks: 'bold',

  // allows only the 'bold' and 'italic' marks
  marks: 'bold italic',

  // allows all marks
  marks: '_',

  // disallows all marks
  marks: '',
})
\`\`\`

#### Group

Add this node to a group of extensions, which can be referred to in the [content](#content) attribute of the schema.

\`\`\`js
Node.create({
  // add to 'block' group
  group: 'block',

  // add to 'inline' group
  group: 'inline',

  // add to 'block' and 'list' group
  group: 'block list',
})
\`\`\`

#### Inline

Nodes can be rendered inline, too. When setting `inline: true` nodes are rendered in line with the text. That’s the case for mentions. The result is more like a mark, but with the functionality of a node. One difference is the resulting JSON document. Multiple marks are applied at once, inline nodes would result in a nested structure.

\`\`\`js
Node.create({
  // renders nodes in line with the text, for example
  inline: true,
})
\`\`\`

For some cases where you want features that aren’t available in marks, for example a node view, try if an inline node would work:

\`\`\`js
Node.create({
  name: 'customInlineNode',
  group: 'inline',
  inline: true,
  content: 'text*',
})
\`\`\`

Inline nodes can be tricky to select, especially at line edges. A quick fix: add a zero-width space right after the element using CSS:

\`\`\`css
.customInlineNode::after {
  content: "\200B";
}
\`\`\`

#### Atom

Nodes with `atom: true` aren’t directly editable and should be treated as a single unit. It’s not so likely to use that in a editor context, but this is how it would look like:

\`\`\`js
Node.create({
  atom: true,
})
\`\`\`

One example is the [`Mention`](/editor/extensions/nodes/mention) extension, which somehow looks like text, but behaves more like a single unit. As this doesn’t have editable text content, it’s empty when you copy such node. Good news though, you can control that. Here is the example from the [`Mention`](/editor/extensions/nodes/mention) extension:

\`\`\`js
// Used to convert an atom node to plain text
renderText({ node }) {
  return `@${node.attrs.id}`
},
\`\`\`

#### Selectable

Besides the already visible text selection, there is an invisible node selection. If you want to make your nodes selectable, you can configure it like this:

\`\`\`js
Node.create({
  selectable: true,
})
\`\`\`

#### Draggable

All nodes can be configured to be draggable (by default they aren’t) with this setting:

\`\`\`js
Node.create({
  draggable: true,
})
\`\`\`

#### Code

Users expect code to behave very differently. For all kind of nodes containing code, you can set `code: true` to take this into account.

\`\`\`js
Node.create({
  code: true,
})
\`\`\`

#### Whitespace

Controls the way whitespace in this node is parsed.

\`\`\`js
Node.create({
  whitespace: 'pre',
})
\`\`\`

#### Defining

Nodes get dropped when their entire content is replaced (for example, when pasting new content) by default. If a node should be kept for such replace operations, configure them as `defining`.

Typically, that applies to [`Blockquote`](/editor/extensions/nodes/blockquote), [`CodeBlock`](/editor/extensions/nodes/code-block), [`Heading`](/editor/extensions/nodes/heading), and [`ListItem`](/editor/extensions/nodes/list-item).

\`\`\`js
Node.create({
  defining: true,
})
\`\`\`

#### Isolating

For nodes that should fence the cursor for regular editing operations like backspacing, for example a TableCell, set `isolating: true`.

\`\`\`js
Node.create({
  isolating: true,
})
\`\`\`

#### Allow gap cursor

The [`Gapcursor`](/editor/extensions/functionality/gapcursor) extension registers a new schema attribute to control if gap cursors are allowed everywhere in that node.

\`\`\`js
Node.create({
  allowGapCursor: false,
})
\`\`\`

#### Table roles

The [`Table`](/editor/extensions/nodes/table) extension registers a new schema attribute to configure which role an Node has. Allowed values are `table`, `row`, `cell`, and `header_cell`.

\`\`\`js
Node.create({
  tableRole: 'cell',
})
\`\`\`

### The mark schema

#### Inclusive

If you don’t want the mark to be active when the cursor is at its end, set inclusive to `false`. For example, that’s how it’s configured for [`Link`](/editor/extensions/marks/link) marks:

\`\`\`js
Mark.create({
  inclusive: false,
})
\`\`\`

#### Excludes

By default all marks can be applied at the same time. With the excludes attribute you can define which marks must not coexist with the mark. For example, the inline code mark excludes any other mark (bold, italic, and all others).

\`\`\`js
Mark.create({
  // must not coexist with the bold mark
  excludes: 'bold'
  // exclude any other mark
  excludes: '_',
})
\`\`\`

#### Exitable

By default a mark will "trap" the cursor, meaning the cursor can't get out of the mark except by moving the cursor left to right into text without a mark.
If this is set to true, the mark will be exitable when the mark is at the end of a node. This is handy for example using code marks.

\`\`\`js
Mark.create({
  // make this mark exitable - default is false
  exitable: true,
})
\`\`\`

#### Group

Add this mark to a group of extensions, which can be referred to in the content attribute of the schema.

\`\`\`js
Mark.create({
  // add this mark to the 'basic' group
  group: 'basic',
  // add this mark to the 'basic' and the 'foobar' group
  group: 'basic foobar',
})
\`\`\`

#### Code

Users expect code to behave very differently. For all kind of marks containing code, you can set `code: true` to take this into account.

\`\`\`js
Mark.create({
  code: true,
})
\`\`\`

#### Spanning

By default marks can span multiple nodes when rendered as HTML. Set `spanning: false` to indicate that a mark must not span multiple nodes.

\`\`\`js
Mark.create({
  spanning: false,
})
\`\`\`

## Get the underlying ProseMirror schema

There are a few use cases where you need to work with the underlying schema. You’ll need that if you’re using the Tiptap collaborative text editing features or if you want to manually render your content as HTML.

### Option 1: With an Editor

If you need this on the client side and need an editor instance anyway, it’s available through the editor:

\`\`\`js
import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

const editor = new Editor({
  extensions: [
    Document,
    Paragraph,
    Text,
    // add more extensions here
  ])
})

const schema = editor.schema
\`\`\`

### Option 2: Without an Editor

If you just want to have the schema _without_ initializing an actual editor, you can use the `getSchema` helper function. It needs an array of available extensions and conveniently generates a ProseMirror schema for you:

\`\`\`js
import { getSchema } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

const schema = getSchema([
  Document,
  Paragraph,
  Text,
  // add more extensions here
])
\`\`\`

## Invalid Schema Handling

To track and respond to content errors, Tiptap supports checking that the content provided matches the schema derived from the registered extensions.
To use this, set the `enableContentCheck` option to `true`, which activates checking the content and emitting `contentError` events.
These events can be listened to with the `onContentError` callback.
By default, this flag is set to `false` to maintain compatibility with previous versions.

<Callout title="Note" variant="warning">
  The content checking that Tiptap runs is 100% accurate on JSON content types. But, if you provide
  your content as HTML, we have done our best to try to alert on missing nodes but marks can be
  missed in certain situations, therefore, falling back to the default behavior of stripping that
  unrecognized content by default.
</Callout>

### contentError event

The `contentError` event is emitted when the initial `content` provided during editor setup is incompatible with the schema.

As part of the error context, you are provided with a `disableCollaboration` function. Invoking this function reinitializes the editor without the collaboration extension, ensuring that any removed content is not synchronized with other users.

This event can be handled either directly as an option through `onContentError` like:

\`\`\`jsx
new Editor({
  enableContentCheck: true,
  content: invalidContent,
  onContentError({ editor, error, disableCollaboration }) {
    // your handler here
  },
  ...options,
})
\`\`\`

Or, by attaching a listener to the `contentError` event on the editor instance.

\`\`\`jsx
const editor = new Editor({
  enableContentCheck: true,
  content: invalidContent,
  ...options,
})

editor.on('contentError', ({ editor, error, disableCollaboration }) => {
  // your handler here
})
\`\`\`

For more implementation examples, refer to the [events](/editor/api/events) section.

### Recommended Handling

How you handle schema errors will be specific to your application and requirements but, here are our suggestions:

#### Without collaborative editing

Depending on your use case, the default behavior of stripping unknown content keeps your content in a known valid state for future editing.

#### With collaborative editing

Depending on your use case, you may want to set the `enableContentCheck` flag and listen to `contentError` events. When this event is received, you may want to respond similarly to this example:

\`\`\`tsx
onContentError({ editor, error, disableCollaboration }) {
  // Removes the collaboration extension.
  disableCollaboration()

  // Since the content is invalid, we don't want to emit an update
  // Preventing synchronization with other editors or to a server
  const emitUpdate = false

  // Disable the editor to prevent further user input
  editor.setEditable(false, emitUpdate)

  // Maybe show a notification to the user that they need to refresh the app
}
\`\`\`

```

# editor\extensions\custom-extensions\create-new.mdx

```mdx
---
title: Create a new extension
meta:
  title: Create extensions | Tiptap Editor Docs
  description: Create a new extension for your Tiptap editor and create a unique editor experience from scratch. Learn more in the docs!
  category: Editor
---

You can build your own extensions from scratch and you know what? It’s the same syntax as for extending existing extension described above.

### Create a node

If you think of the document as a tree, then [nodes](/editor/extensions/nodes) are just a type of content in that tree. Good examples to learn from are [`Paragraph`](/editor/extensions/nodes/paragraph), [`Heading`](/editor/extensions/nodes/heading), or [`CodeBlock`](/editor/extensions/nodes/code-block).

\`\`\`js
import { Node } from '@tiptap/core'

const CustomNode = Node.create({
  name: 'customNode',

  // Your code goes here.
})
\`\`\`

Nodes don’t have to be blocks. They can also be rendered inline with the text, for example for [@mentions](/editor/extensions/nodes/mention).

### Create a mark

One or multiple marks can be applied to [nodes](/editor/extensions/nodes), for example to add inline formatting. Good examples to learn from are [`Bold`](/editor/extensions/marks/bold), [`Italic`](/editor/extensions/marks/italic) and [`Highlight`](/editor/extensions/marks/highlight).

\`\`\`js
import { Mark } from '@tiptap/core'

const CustomMark = Mark.create({
  name: 'customMark',

  // Your code goes here.
})
\`\`\`

### Create an extension

Extensions add new capabilities to Tiptap and you’ll read the word extension here very often, even for nodes and marks. But there are literal extensions. Those can’t add to the schema (like marks and nodes do), but can add functionality or change the behaviour of the editor.

A good example to learn from is probably [`TextAlign`](/editor/extensions/functionality/textalign).

\`\`\`js
import { Extension } from '@tiptap/core'

const CustomExtension = Extension.create({
  name: 'customExtension',

  // Your code goes here.
})
\`\`\`

## Publish standalone extensions

If you want to create and publish your own extensions for Tiptap, you can use our CLI tool to bootstrap your project.
Simply run `npm init tiptap-extension` and follow the instructions. The CLI will create a new folder with a pre-configured project for you including a build script running on Rollup.

If you want to test your extension locally, you can run `npm link` in the project folder and then `npm link YOUR_EXTENSION` in your project (for example a Vite app).

## Share

When everything is working fine, don’t forget to [share it with the community](https://github.com/ueberdosis/tiptap/issues/819) or in our [awesome-tiptap](https://github.com/ueberdosis/awesome-tiptap) repository.

```

# editor\extensions\custom-extensions\extend-existing.mdx

```mdx
---
title: Add to an existing extension
meta:
  title: Extend extensions | Tiptap Editor Docs
  description: Extend an already existing extension in Tiptap to add new features and functionalities to your editor. More in the docs!
  category: Editor
---

import { Callout } from '@/components/ui/Callout'

Every extension has an `extend()` method, which takes an object with everything you want to change or add to it.

Let’s say, you’d like to change the keyboard shortcut for the bullet list. You should start with looking at the source code of the extension, in that case [the `BulletList` node](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-bullet-list/src/bullet-list.ts). For the bespoken example to overwrite the keyboard shortcut, your code could look like this:

\`\`\`js
// 1. Import the extension
import BulletList from '@tiptap/extension-bullet-list'

// 2. Overwrite the keyboard shortcuts
const CustomBulletList = BulletList.extend({
  addKeyboardShortcuts() {
    return {
      'Mod-l': () => this.editor.commands.toggleBulletList(),
    }
  },
})

// 3. Add the custom extension to your editor
new Editor({
  extensions: [
    CustomBulletList(),
    // …
  ],
})
\`\`\`

The same applies to every aspect of an existing extension, except to the name. Let’s look at all the things that you can change through the extend method. We focus on one aspect in every example, but you can combine all those examples and change multiple aspects in one `extend()` call too.

## Name

The extension name is used in a whole lot of places and changing it isn’t too easy. If you want to change the name of an existing extension, you can copy the whole extension and change the name in all occurrences.

The extension name is also part of the JSON. If you [store your content as JSON](/guides/output-json-html#option-1-json), you need to change the name there too.

## Priority

The priority defines the order in which extensions are registered. The default priority is `100`, that’s what most extension have. Extensions with a higher priority will be loaded earlier.

\`\`\`js
import Link from '@tiptap/extension-link'

const CustomLink = Link.extend({
  priority: 1000,
})
\`\`\`

The order in which extensions are loaded influences two things:

1. ### Plugin order

ProseMirror plugins of extensions with a higher priority will run first.

2. ### Schema order

The [`Link`](/editor/extensions/marks/link) mark for example has a higher priority, which means it will be rendered as `<a href="…"><strong>Example</strong></a>` instead of `<strong><a href="…">Example</a></strong>`.

## Settings

All settings can be configured through the extension anyway, but if you want to change the default settings, for example to provide a library on top of Tiptap for other developers, you can do it like this:

\`\`\`js
import Heading from '@tiptap/extension-heading'

const CustomHeading = Heading.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      levels: [1, 2, 3],
    }
  },
})
\`\`\`

## Storage

At some point you probably want to save some data within your extension instance. This data is mutable. You can access it within the extension under `this.storage`.

\`\`\`js
import { Extension } from '@tiptap/core'

const CustomExtension = Extension.create({
  name: 'customExtension',

  addStorage() {
    return {
      awesomeness: 100,
    }
  },

  onUpdate() {
    this.storage.awesomeness += 1
  },
})
\`\`\`

Outside the extension you have access via `editor.storage`. Make sure that each extension has a unique name.

\`\`\`js
const editor = new Editor({
  extensions: [CustomExtension],
})

const awesomeness = editor.storage.customExtension.awesomeness
\`\`\`

## Schema

Tiptap works with a strict schema, which configures how the content can be structured, nested, how it behaves and many more things. You [can change all aspects of the schema](/editor/core-concepts/schema) for existing extensions. Let’s walk through a few common use cases.

The default `Blockquote` extension can wrap other nodes, like headings. If you want to allow nothing but paragraphs in your blockquotes, set the `content` attribute accordingly:

\`\`\`js
// Blockquotes must only include paragraphs
import Blockquote from '@tiptap/extension-blockquote'

const CustomBlockquote = Blockquote.extend({
  content: 'paragraph*',
})
\`\`\`

The schema even allows to make your nodes draggable, that’s what the `draggable` option is for. It defaults to `false`, but you can override that.

\`\`\`js
// Draggable paragraphs
import Paragraph from '@tiptap/extension-paragraph'

const CustomParagraph = Paragraph.extend({
  draggable: true,
})
\`\`\`

That’s just two tiny examples, but [the underlying ProseMirror schema](https://prosemirror.net/docs/ref/#model.SchemaSpec) is really powerful.

## Attributes

You can use attributes to store additional information in the content. Let’s say you want to extend the default `Paragraph` node to have different colors:

\`\`\`js
const CustomParagraph = Paragraph.extend({
  addAttributes() {
    // Return an object with attribute configuration
    return {
      color: {
        default: 'pink',
      },
    },
  },
})

// Result:
// <p color="pink">Example Text</p>
\`\`\`

That is already enough to tell Tiptap about the new attribute, and set `'pink'` as the default value. All attributes will be rendered as a HTML attribute by default, and parsed from the content when initiated.

Let’s stick with the color example and assume you want to add an inline style to actually color the text. With the `renderHTML` function you can return HTML attributes which will be rendered in the output.

This examples adds a style HTML attribute based on the value of `color`:

\`\`\`js
const CustomParagraph = Paragraph.extend({
  addAttributes() {
    return {
      color: {
        default: null,
        // Take the attribute values
        renderHTML: (attributes) => {
          // … and return an object with HTML attributes.
          return {
            style: `color: ${attributes.color}`,
          }
        },
      },
    }
  },
})

// Result:
// <p style="color: pink">Example Text</p>
\`\`\`

You can also control how the attribute is parsed from the HTML. Maybe you want to store the color in an attribute called `data-color` (and not just `color`), here’s how you would do that:

\`\`\`js
const CustomParagraph = Paragraph.extend({
  addAttributes() {
    return {
      color: {
        default: null,
        // Customize the HTML parsing (for example, to load the initial content)
        parseHTML: (element) => element.getAttribute('data-color'),
        // … and customize the HTML rendering.
        renderHTML: (attributes) => {
          return {
            'data-color': attributes.color,
            style: `color: ${attributes.color}`,
          }
        },
      },
    }
  },
})

// Result:
// <p data-color="pink" style="color: pink">Example Text</p>
\`\`\`

You can completely disable the rendering of attributes with `rendered: false`.

### Extend existing attributes

If you want to add an attribute to an extension and keep existing attributes, you can access them through `this.parent()`.

In some cases, it is undefined, so make sure to check for that case, or use optional chaining `this.parent?.()`

\`\`\`js
const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      myCustomAttribute: {
        // …
      },
    }
  },
})
\`\`\`

## Global attributes

Attributes can be applied to multiple extensions at once. That’s useful for text alignment, line height, color, font family, and other styling related attributes.

Take a closer look at [the full source code](https://github.com/ueberdosis/tiptap/tree/main/packages/extension-text-align) of the [`TextAlign`](/editor/extensions/functionality/textalign) extension to see a more complex example. But here is how it works in a nutshell:

\`\`\`js
import { Extension } from '@tiptap/core'

const TextAlign = Extension.create({
  addGlobalAttributes() {
    return [
      {
        // Extend the following extensions
        types: ['heading', 'paragraph'],
        // … with those attributes
        attributes: {
          textAlign: {
            default: 'left',
            renderHTML: (attributes) => ({
              style: `text-align: ${attributes.textAlign}`,
            }),
            parseHTML: (element) => element.style.textAlign || 'left',
          },
        },
      },
    ]
  },
})
\`\`\`

## Render HTML

With the `renderHTML` function you can control how an extension is rendered to HTML. We pass an attributes object to it, with all local attributes, global attributes, and configured CSS classes. Here is an example from the `Bold` extension:

\`\`\`js
renderHTML({ HTMLAttributes }) {
  return ['strong', HTMLAttributes, 0]
},
\`\`\`

The first value in the array should be the name of HTML tag. If the second element is an object, it’s interpreted as a set of attributes. Any elements after that are rendered as children.

The number zero (representing a hole) is used to indicate where the content should be inserted. Let’s look at the rendering of the `CodeBlock` extension with two nested tags:

\`\`\`js
renderHTML({ HTMLAttributes }) {
  return ['pre', ['code', HTMLAttributes, 0]]
},
\`\`\`

If you want to add some specific attributes there, import the `mergeAttributes` helper from `@tiptap/core`:

\`\`\`js
import { mergeAttributes } from '@tiptap/core'

// ...

renderHTML({ HTMLAttributes }) {
  return ['a', mergeAttributes(HTMLAttributes, { rel: this.options.rel }), 0]
},
\`\`\`

## Parse HTML

The `parseHTML()` function tries to load the editor document from HTML. The function gets the HTML DOM element passed as a parameter, and is expected to return an object with attributes and their values. Here is a simplified example from the [`Bold`](/editor/extensions/marks/bold) mark:

\`\`\`js
parseHTML() {
  return [
    {
      tag: 'strong',
    },
  ]
},
\`\`\`

This defines a rule to convert all `<strong>` tags to `Bold` marks. But you can get more advanced with this, here is the full example from the extension:

\`\`\`js
parseHTML() {
  return [
    // <strong>
    {
      tag: 'strong',
    },
    // <b>
    {
      tag: 'b',
      getAttrs: node => node.style.fontWeight !== 'normal' && null,
    },
    // <span style="font-weight: bold"> and <span style="font-weight: 700">
    {
      style: 'font-weight',
      getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value as string) && null,
    },
  ]
},
\`\`\`

This checks for `<strong>` and `<b>` tags, and any HTML tag with an inline style setting the `font-weight` to bold.

As you can see, you can optionally pass a `getAttrs` callback, to add more complex checks, for example for specific HTML attributes. The callback gets passed the HTML DOM node, except when checking for the `style` attribute, then it’s the value.

You are wondering what’s that `&& null` doing? [ProseMirror expects `null` or `undefined` if the check is successful.](https://prosemirror.net/docs/ref/version/0.18.0.html#model.ParseRule.getAttrs)

[Pass `priority` to a rule](https://prosemirror.net/docs/ref/version/0.18.0.html#model.ParseRule.priority) to resolve conflicts with other extensions, for example if you build a custom extension which looks for paragraphs with a class attribute, but you already use the default paragraph extension.

### Using getAttrs

The `getAttrs` function you’ve probably noticed in the example has two purposes:

1. Check the HTML attributes to decide whether a rule matches (and a mark or node is created from that HTML). When the function returns `false`, it’s not matching.
2. Get the DOM Element and use the HTML attributes to set your mark or node attributes accordingly:

\`\`\`js
parseHTML() {
  return [
    {
      tag: 'span',
      getAttrs: element => {
        // Check if the element has an attribute
        element.hasAttribute('style')
        // Get an inline style
        element.style.color
        // Get a specific attribute
        element.getAttribute('data-color')
      },
    },
  ]
},
\`\`\`

You can return an object with the attribute as the key and the parsed value to set your mark or node attribute. We would recommend to use the `parseHTML` inside `addAttributes()`, though. That will keep your code cleaner.

\`\`\`js
addAttributes() {
  return {
    color: {
      // Set the color attribute according to the value of the `data-color` attribute
      parseHTML: element => element.getAttribute('data-color'),
    }
  }
},
\`\`\`

Read more about `getAttrs` and all other `ParseRule` properties in the [ProseMirror reference](https://prosemirror.net/docs/ref/#model.ParseRule).

## Commands

\`\`\`js
import Paragraph from '@tiptap/extension-paragraph'

const CustomParagraph = Paragraph.extend({
  addCommands() {
    return {
      paragraph:
        () =>
        ({ commands }) => {
          return commands.setNode('paragraph')
        },
    }
  },
})
\`\`\`

<Callout title="Use the commands parameter inside of addCommands" variant="warning">
  To access other commands inside `addCommands` use the `commands` parameter that’s passed to it.
</Callout>

## Keyboard shortcuts

Most core extensions come with sensible keyboard shortcut defaults. Depending on what you want to build, you’ll likely want to change them though. With the `addKeyboardShortcuts()` method you can overwrite the predefined shortcut map:

\`\`\`js
// Change the bullet list keyboard shortcut
import BulletList from '@tiptap/extension-bullet-list'

const CustomBulletList = BulletList.extend({
  addKeyboardShortcuts() {
    return {
      'Mod-l': () => this.editor.commands.toggleBulletList(),
    }
  },
})
\`\`\`

## Input rules

With input rules you can define regular expressions to listen for user inputs. They are used for markdown shortcuts, or for example to convert text like `(c)` to a `©` (and many more) with the [`Typography`](/editor/extensions/functionality/typography) extension. Use the `markInputRule` helper function for marks, and the `nodeInputRule` for nodes.

By default text between two tildes on both sides is transformed to ~~striked text~~. If you want to think one tilde on each side is enough, you can overwrite the input rule like this:

\`\`\`js
// Use the ~single tilde~ markdown shortcut
import Strike from '@tiptap/extension-strike'
import { markInputRule } from '@tiptap/core'

// Default:
// const inputRegex = /(?:^|\s)((?:~~)((?:[^~]+))(?:~~))$/

// New:
const inputRegex = /(?:^|\s)((?:~)((?:[^~]+))(?:~))$/

const CustomStrike = Strike.extend({
  addInputRules() {
    return [
      markInputRule({
        find: inputRegex,
        type: this.type,
      }),
    ]
  },
})
\`\`\`

## Paste rules

Paste rules work like input rules (see above) do. But instead of listening to what the user types, they are applied to pasted content.

There is one tiny difference in the regular expression. Input rules typically end with a `$` dollar sign (which means “asserts position at the end of a line”), paste rules typically look through all the content and don’t have said `$` dollar sign.

Taking the example from above and applying it to the paste rule would look like the following example.

\`\`\`js
// Check pasted content for the ~single tilde~ markdown syntax
import Strike from '@tiptap/extension-strike'
import { markPasteRule } from '@tiptap/core'

// Default:
// const pasteRegex = /(?:^|\s)((?:~~)((?:[^~]+))(?:~~))/g

// New:
const pasteRegex = /(?:^|\s)((?:~)((?:[^~]+))(?:~))/g

const CustomStrike = Strike.extend({
  addPasteRules() {
    return [
      markPasteRule({
        find: pasteRegex,
        type: this.type,
      }),
    ]
  },
})
\`\`\`

## Events

You can even move your [event listeners](/editor/api/events) to a separate extension. Here is an example with listeners for all events:

\`\`\`js
import { Extension } from '@tiptap/core'

const CustomExtension = Extension.create({
  onCreate() {
    // The editor is ready.
  },
  onUpdate() {
    // The content has changed.
  },
  onSelectionUpdate({ editor }) {
    // The selection has changed.
  },
  onTransaction({ transaction }) {
    // The editor state has changed.
  },
  onFocus({ event }) {
    // The editor is focused.
  },
  onBlur({ event }) {
    // The editor isn’t focused anymore.
  },
  onDestroy() {
    // The editor is being destroyed.
  },
})
\`\`\`

## What’s available in this?

Those extensions aren’t classes, but you still have a few important things available in `this` everywhere in the extension.

\`\`\`js
// Name of the extension, for example 'bulletList'
this.name

// Editor instance
this.editor

// ProseMirror type
this.type

// Object with all settings
this.options

// Everything that’s in the extended extension
this.parent
\`\`\`

## ProseMirror Plugins (Advanced)

After all, Tiptap is built on ProseMirror and ProseMirror has a pretty powerful plugin API, too. To access that directly, use `addProseMirrorPlugins()`.

### Existing plugins

You can wrap existing ProseMirror plugins in Tiptap extensions like shown in the example below.

\`\`\`js
import { history } from '@tiptap/pm/history'

const History = Extension.create({
  addProseMirrorPlugins() {
    return [
      history(),
      // …
    ]
  },
})
\`\`\`

### Access the ProseMirror API

To hook into events, for example a click, double click or when content is pasted, you can pass [event handlers](https://prosemirror.net/docs/ref/#view.EditorProps) to `editorProps` on the [editor](/editor/api/events).

Or you can add them to a Tiptap extension like shown in the below example.

\`\`\`js
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

export const EventHandler = Extension.create({
  name: 'eventHandler',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('eventHandler'),
        props: {
          handleClick(view, pos, event) {
            /* … */
          },
          handleDoubleClick(view, pos, event) {
            /* … */
          },
          handlePaste(view, event, slice) {
            /* … */
          },
          // … and many, many more.
          // Here is the full list: https://prosemirror.net/docs/ref/#view.EditorProps
        },
      }),
    ]
  },
})
\`\`\`

## Node views (Advanced)

For advanced use cases, where you need to execute JavaScript inside your nodes, for example to render a sophisticated interface around an image, you need to learn about node views.

They are really powerful, but also complex. In a nutshell, you need to return a parent DOM element, and a DOM element where the content should be rendered in. Look at the following, simplified example:

\`\`\`js
import Image from '@tiptap/extension-image'

const CustomImage = Image.extend({
  addNodeView() {
    return () => {
      const container = document.createElement('div')

      container.addEventListener('click', (event) => {
        alert('clicked on the container')
      })

      const content = document.createElement('div')
      container.append(content)

      return {
        dom: container,
        contentDOM: content,
      }
    }
  },
})
\`\`\`

There is a whole lot to learn about node views, so head over to the [dedicated section in our guide about node views](/editor/extensions/custom-extensions/node-views) for more information. If you are looking for a real-world example, look at the source code of the [`TaskItem`](/editor/extensions/nodes/task-item) node. This is using a node view to render the checkboxes.

```

# editor\extensions\custom-extensions\index.mdx

```mdx
---
title: How to develop a custom extension
meta:
  title: Custom extension | Tiptap Editor Docs
  description: Customize and create extensions in Tiptap to extend your editor with new features and functionalities. More in the docs!
  category: Editor
---

import Link from '@/components/Link'
import * as CardGrid from '@/components/CardGrid'
import { Tag } from '@/components/ui/Tag'
import { Section } from '@/components/ui/Section'

One of the strengths of Tiptap is its extendability. You don’t depend on the provided extensions, it is intended to extend the editor to your liking.

With custom extensions you can add new content types and new functionalities, on top of what already exists or from scratch. Let’s start with a few common examples of how you can extend existing nodes, marks and extensions.

You’ll learn how you start from scratch in the [Create new](/editor/extensions/custom-extensions/create-new) page, but you’ll need the same knowledge for extending existing and creating new extensions.

### Customize and create extensions

<CardGrid.Wrapper className="sm:grid-cols-3">
  <CardGrid.Item asChild>
    <Link href="/editor/extensions/custom-extensions/extend-existing">
      <CardGrid.Subtitle size="sm">Extend extensions</CardGrid.Subtitle>
      <div>
        <CardGrid.ItemTitle>Customize and add to an existing extension</CardGrid.ItemTitle>
      </div>
      <CardGrid.ItemFooter>
        <Tag>Extensions</Tag>
      </CardGrid.ItemFooter>
    </Link>
  </CardGrid.Item>
  <CardGrid.Item asChild>
    <Link href="/editor/extensions/custom-extensions/create-new">
      <CardGrid.Subtitle size="sm">Create extension</CardGrid.Subtitle>
      <div>
        <CardGrid.ItemTitle>Create a new extensions from scratch</CardGrid.ItemTitle>
      </div>
      <CardGrid.ItemFooter>
        <Tag>Extensions</Tag>
      </CardGrid.ItemFooter>
    </Link>
  </CardGrid.Item>
  <CardGrid.Item asChild>
    <Link href="/editor/extensions/custom-extensions/node-views">
      <CardGrid.Subtitle size="sm">Create nodes</CardGrid.Subtitle>
      <div>
        <CardGrid.ItemTitle>Create custom and interactive nodes</CardGrid.ItemTitle>
      </div>
      <CardGrid.ItemFooter>
        <Tag>Nodes</Tag>
      </CardGrid.ItemFooter>
    </Link>
  </CardGrid.Item>
  <CardGrid.Item asChild>
    <Link href="/editor/extensions/custom-extensions/node-views/examples">
      <CardGrid.Subtitle size="sm">Node examples</CardGrid.Subtitle>
      <div>
        <CardGrid.ItemTitle>Learn from custom node view examples</CardGrid.ItemTitle>
      </div>
      <CardGrid.ItemFooter>
        <Tag>Nodes</Tag>
      </CardGrid.ItemFooter>
    </Link>
  </CardGrid.Item>
</CardGrid.Wrapper>

```

# editor\extensions\custom-extensions\node-views\examples.mdx

```mdx
---
title: Node view examples
meta:
  title: Node view examples | Tiptap Editor Docs
  description: Review customizable node view examples and create drag handles, dynamic tables of contents, and interactive drawing tools. More in the docs!
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'

Node views enable you to fully customize your nodes. We are collecting a few different examples here. Feel free to copy them and start building on them.

Keep in mind that those are just examples to get you started, not officially supported extensions. We don’t have tests for them, and don’t plan to maintain them with the same attention as we do with official extensions.

## Drag handles

Drag handles aren’t that easy to add. We are still on the lookout what’s the best way to add them. Official support will come at some point, but there’s no timeline yet.

<CodeDemo path="/GuideNodeViews/DragHandle" />

## Drawing in the editor

The drawing example shows a SVG that enables you to draw inside the editor.

<CodeDemo path="/Examples/Drawing" />

It’s not working very well with the Collaboration extension. It’s sending all data on every change, which can get pretty huge with Y.js. If you plan to use those two in combination, you need to improve it or your WebSocket backend will melt.

```

# editor\extensions\custom-extensions\node-views\index.mdx

```mdx
---
title: Create a custom node view
meta:
  description: Customize and create nodes in your Tiptap editor for editable and non-editable content with interactive node views. More in the docs!
  title: Node views | Tiptap Editor Docs
  category: Editor
---

import { Callout } from '@/components/ui/Callout'

Node views are the best thing since sliced bread, at least if you are a fan of customization (and bread). With node views you can add interactive nodes to your editor. That can literally be everything. If you can write it in JavaScript, you can use it in your editor.

Node views are amazing to improve the in-editor experience, but can also be used in a read-only instance of Tiptap. They are unrelated to the HTML output by design, so you have full control about the in-editor experience _and_ the output.

## Different types of node views

Depending on what you would like to build, node views work a little bit different and can have their very specific capabilities, but also pitfalls. The main question is: How should your custom node look like?

### Editable text

Yes, node views can have editable text, just like a regular node. That’s simple. The cursor will exactly behave like you would expect it from a regular node. Existing commands work very well with those nodes.

\`\`\`html
<div class="Prosemirror" contenteditable="true">
  <p>text</p>
  <node-view>text</node-view>
  <p>text</p>
</div>
\`\`\`

That’s how the [`TaskItem`](/editor/extensions/nodes/task-item) node works.

### Non-editable text

Nodes can also have text, which is not editable. The cursor can’t jump into those, but you don’t want that anyway.

Tiptap adds a `contenteditable="false"` to those by default.

\`\`\`html
<div class="Prosemirror" contenteditable="true">
  <p>text</p>
  <node-view contenteditable="false">text</node-view>
  <p>text</p>
</div>
\`\`\`

That’s how you could render mentions, which shouldn’t be editable. Users can add or delete them, but not delete single characters.

Statamic uses those for their Bard editor, which renders complex modules inside Tiptap, which can have their own text inputs.

### Mixed content

You can even mix non-editable and editable text. That’s great to build complex things, and still use marks like bold and italic inside the editable content.

**BUT**, if there are other elements with non-editable text in your node view, the cursor can jump there. You can improve that with manually adding `contenteditable="false"` to the specific parts of your node view.

\`\`\`html
<div class="Prosemirror" contenteditable="true">
  <p>text</p>
  <node-view>
    <div contenteditable="false">non-editable text</div>
    <div>editable text</div>
  </node-view>
  <p>text</p>
</div>
\`\`\`

## Markup

But what happens if you [access the editor content](/guides/output-json-html)? If you’re working with HTML, you’ll need to tell Tiptap how your node should be serialized.

The editor **does not** export the rendered JavaScript node, and for a lot of use cases you wouldn’t want that anyway.

Let’s say you have a node view which lets users add a video player and configure the appearance (autoplay, controls, …). You want the interface to do that in the editor, not in the output of the editor. The output of the editor should probably only have the video player.

I know, I know, it’s not that easy. Just keep in mind, that you‘re in full control of the rendering inside the editor and of the output.

<Callout title="What if you store JSON?" variant="warning">
  That doesn’t apply to JSON. In JSON, everything is stored as an object. There is no need to
  configure the “translation” to and from JSON.
</Callout>

### Render HTML

Okay, you’ve set up your node with an interactive node view and now you want to control the output. Even if your node view is pretty complex, the rendered HTML can be simple:

\`\`\`js
renderHTML({ HTMLAttributes }) {
  return ['my-custom-node', mergeAttributes(HTMLAttributes)]
},

// Output: <my-custom-node count="1"></my-custom-node>
\`\`\`

Make sure it’s something distinguishable, so it’s easier to restore the content from the HTML. If you just need something generic markup like a `<div>` consider to add a `data-type="my-custom-node"`.

### Parse HTML

The same applies to restoring the content. You can configure what markup you expect, that can be something completely unrelated to the node view markup. It just needs to contain all the information you want to restore.

Attributes are automagically restored, if you registered them through [`addAttributes`](/editor/extensions/custom-extensions/extend-existing#attributes).

\`\`\`js
// Input: <my-custom-node count="1"></my-custom-node>

parseHTML() {
  return [{
    tag: 'my-custom-node',
  }]
},
\`\`\`

### Render JavaScript/Vue/React

But what if you want to render your actual JavaScript/Vue/React code? Consider using Tiptap to render your output. Just set the editor to `editable: false` and no one will notice you’re using an editor to render the content. :-)

```

# editor\extensions\custom-extensions\node-views\javascript.mdx

```mdx
---
title: Node views with JavaScript
meta:
  title: JavaScript node views | Tiptap Editor Docs
  description: Use Vanilla JavaScript to build custom node views in Tiptap. Direct manipulation of node properties and interactive content.
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'

Using frameworks like Vue or React can feel too complex, if you’re used to work without those two. Good news: You can use Vanilla JavaScript in your node views. There is just a little bit you need to know, but let’s go through this one by one.

## Render a node view with JavaScript

Here is what you need to do to render a node view inside your editor:

1. [Create a node extension](/editor/extensions/custom-extensions/create-new)
2. Register a new node view with `addNodeView()`
3. Write your render function
4. [Configure Tiptap to use your new node extension](/editor/getting-started/configure)

This is how your node extension could look like:

\`\`\`js
import { Node } from '@tiptap/core'

export default Node.create({
  // configuration …

  addNodeView() {
    return ({ editor, node, getPos, HTMLAttributes, decorations, extension }) => {
      const dom = document.createElement('div')

      dom.innerHTML = 'Hello, I’m a node view!'

      return {
        dom,
      }
    }
  },
})
\`\`\`

Got it? Let’s see it in action. Feel free to copy the below example to get started.

<CodeDemo path="/GuideNodeViews/JavaScript" />

That node view even interacts with the editor. Time to see how that is wired up.

## Access node attributes

The editor passes a few helpful things to your render function. One of them is the `node` prop. This one enables you to access node attributes in your node view. Let’s say you have [added an attribute](/editor/extensions/custom-extensions/extend-existing#attributes) named `count` to your node extension. You could access the attribute like this:

\`\`\`js
addNodeView() {
  return ({ node }) => {
    console.log(node.attrs.count)

    // …
  }
}
\`\`\`

## Update node attributes

You can even update node attributes from your node view, with the help of the `getPos` prop passed to your render function. Dispatch a new transaction with an object of the updated attributes:

\`\`\`js
addNodeView() {
  return ({ editor, node, getPos }) => {
    const { view } = editor

    // Create a button …
    const button = document.createElement('button')
    button.innerHTML = `This button has been clicked ${node.attrs.count} times.`

    // … and when it’s clicked …
    button.addEventListener('click', () => {
      if (typeof getPos === 'function') {
        // … dispatch a transaction, for the current position in the document …
        view.dispatch(view.state.tr.setNodeMarkup(getPos(), undefined, {
          count: node.attrs.count + 1,
        }))

        // … and set the focus back to the editor.
        editor.commands.focus()
      }
    })

    // …
  }
}
\`\`\`

Does seem a little bit too complex? Consider using [React](/editor/extensions/custom-extensions/node-views/react) or [Vue](/editor/extensions/custom-extensions/node-views/vue), if you have one of those in your project anyway. It get’s a little bit easier with those two.

## Adding a content editable

To add editable content to your node view, you need to pass a `contentDOM`, a container element for the content. Here is a simplified version of a node view with non-editable and editable text content:

\`\`\`js
// Create a container for the node view
const dom = document.createElement('div')

// Give other elements containing text `contentEditable = false`
const label = document.createElement('span')
label.innerHTML = 'Node view'
label.contentEditable = false

// Create a container for the content
const content = document.createElement('div')

// Append all elements to the node view container
dom.append(label, content)

return {
  // Pass the node view container …
  dom,
  // … and the content container:
  contentDOM: content,
}
\`\`\`

Got it? You’re free to do anything you like, as long as you return a container for the node view and another one for the content. Here is the above example in action:

<CodeDemo path="/GuideNodeViews/JavaScriptContent" />

Keep in mind that this content is rendered by Tiptap. That means you need to tell what kind of content is allowed, for example with `content: 'inline*'` in your node extension (that’s what we use in the above example).

```

# editor\extensions\custom-extensions\node-views\react.mdx

```mdx
---
title: Node views with React
meta:
  title: React node views | Tiptap Editor Docs
  description: Use React to build custom node views in Tiptap. Direct manipulation of node properties and interactive content.
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'

Using Vanilla JavaScript can feel complex if you are used to work in React. Good news: You can use regular React components in your node views, too. There is just a little bit you need to know, but let’s go through this one by one.

## Render a React component

Here is what you need to do to render React components inside your editor:

1. [Create a node extension](/editor/extensions/custom-extensions)
2. Create a React component
3. Pass that component to the provided `ReactNodeViewRenderer`
4. Register it with `addNodeView()`
5. [Configure Tiptap to use your new node extension](/editor/getting-started/configure)

This is how your node extension could look like:

\`\`\`js
import { Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import Component from './Component.jsx'

export default Node.create({
  // configuration …

  addNodeView() {
    return ReactNodeViewRenderer(Component)
  },
})
\`\`\`

There is a little bit of magic required to make this work. But don’t worry, we provide a wrapper component you can use to get started easily. Don’t forget to add it to your custom React component, like shown below:

\`\`\`html
<NodeViewWrapper className="react-component"> React Component </NodeViewWrapper>
\`\`\`

Got it? Let’s see it in action. Feel free to copy the below example to get started.

<CodeDemo path="/GuideNodeViews/ReactComponent?inline=false&hideSource=false" />

That component doesn’t interact with the editor, though. Time to wire it up.

## Access node attributes

The `ReactNodeViewRenderer` which you use in your node extension, passes a few very helpful props to your custom React component. One of them is the `node` prop. Let’s say you have [added an attribute](/editor/extensions/custom-extensions/extend-existing#attributes) named `count` to your node extension (like we did in the above example) you could access it like this:

\`\`\`js
props.node.attrs.count
\`\`\`

## Update node attributes

You can even update node attributes from your node, with the help of the `updateAttributes` prop passed to your component. Pass an object with updated attributes to the `updateAttributes` prop:

\`\`\`js
export default (props) => {
  const increase = () => {
    props.updateAttributes({
      count: props.node.attrs.count + 1,
    })
  }

  // …
}
\`\`\`

And yes, all of that is reactive, too. A pretty seamless communication, isn’t it?

## Adding a content editable

There is another component called `NodeViewContent` which helps you adding editable content to your node view. Here is an example:

\`\`\`jsx
import React from 'react'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'

export default () => {
  return (
    <NodeViewWrapper className="react-component">
      <span className="label" contentEditable={false}>
        React Component
      </span>

      <NodeViewContent className="content" />
    </NodeViewWrapper>
  )
}
\`\`\`

You don’t need to add those `className` attributes, feel free to remove them or pass other class names. Try it out in the following example:

<CodeDemo path="/GuideNodeViews/ReactComponentContent?inline=false&hideSource=false" />

Keep in mind that this content is rendered by Tiptap. That means you need to tell what kind of content is allowed, for example with `content: 'inline*'` in your node extension (that’s what we use in the above example).

The `NodeViewWrapper` and `NodeViewContent` components render a `<div>` HTML tag (`<span>` for inline nodes), but you can change that. For example `<NodeViewContent as="p">` should render a paragraph. One limitation though: That tag must not change during runtime.

## Changing the default content tag for a node view

By default a node view rendered by `ReactNodeViewRenderer` will always have a wrapping `div` inside. If you want to change the type of this node, you can the `contentDOMElementTag` to the `ReactNodeViewRenderer` options:

\`\`\`js
// this will turn the div into a header tag
return ReactNodeViewRenderer(Component, { contentDOMElementTag: 'header' })
\`\`\`

## Changing the wrapping DOM element

To change the wrapping DOM elements tag, you can use the `contentDOMElementTag` option on the `ReactNodeViewRenderer` function to change the default tag name.

\`\`\`js
import { Node } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import Component from './Component.jsx'

export default Node.create({
  // configuration …

  addNodeView() {
    return ReactNodeViewRenderer(Component, { contentDOMElementTag: 'main' })
  },
})
\`\`\`

## All available props

Here is the full list of what props you can expect:

| Prop               | Description                                                     |
| ------------------ | --------------------------------------------------------------- |
| editor             | The editor instance                                             |
| node               | The current node                                                |
| decorations        | An array of decorations                                         |
| selected           | `true` when there is a `NodeSelection` at the current node view |
| extension          | Access to the node extension, for example to get options        |
| getPos()           | Get the document position of the current node                   |
| updateAttributes() | Update attributes of the current node                           |
| deleteNode()       | Delete the current node                                         |

## Dragging

To make your node views draggable, set `draggable: true` in the extension and add `data-drag-handle` to the DOM element that should function as the drag handle.

```

# editor\extensions\custom-extensions\node-views\vue.mdx

```mdx
---
title: Node views with Vue
meta:
  title: Vue node views | Tiptap Editor Docs
  description: Use Vue to build custom node views in Tiptap. Direct manipulation of node properties and interactive content.
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'

Using Vanilla JavaScript can feel complex if you are used to work in Vue. Good news: You can use regular Vue components in your node views, too. There is just a little bit you need to know, but let’s go through this one by one.

## Render a Vue component

Here is what you need to do to render Vue components inside your editor:

1. [Create a node extension](/editor/extensions/custom-extensions)
2. Create a Vue component
3. Pass that component to the provided `VueNodeViewRenderer`
4. Register it with `addNodeView()`
5. [Configure Tiptap to use your new node extension](/editor/getting-started/configure)

This is how your node extension could look like:

\`\`\`js
import { Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-2'
import Component from './Component.vue'

export default Node.create({
  // configuration …

  addNodeView() {
    return VueNodeViewRenderer(Component)
  },
})
\`\`\`

There is a little bit of magic required to make this work. But don’t worry, we provide a wrapper component you can use to get started easily. Don’t forget to add it to your custom Vue component, like shown below:

\`\`\`html
<template>
  <node-view-wrapper> Vue Component </node-view-wrapper>
</template>
\`\`\`

Got it? Let’s see it in action. Feel free to copy the below example to get started.

<CodeDemo path="/GuideNodeViews/VueComponent" />

That component doesn’t interact with the editor, though. Time to wire it up.

## Access node attributes

The `VueNodeViewRenderer` which you use in your node extension, passes a few very helpful props to your custom Vue component. One of them is the `node` prop. Add this snippet to your Vue component to directly access the node:

\`\`\`js
props: {
  node: {
    type: Object,
    required: true,
  },
},
\`\`\`

That enables you to access node attributes in your Vue component. Let’s say you have [added an attribute](/editor/extensions/custom-extensions/extend-existing#attributes) named `count` to your node extension (like we did in the above example) you could access it like this:

\`\`\`js
this.node.attrs.count
\`\`\`

## Update node attributes

You can even update node attributes from your node, with the help of the `updateAttributes` prop passed to your component. Just add this snippet to your component:

\`\`\`js
props: {
  updateAttributes: {
    type: Function,
    required: true,
  },
},
\`\`\`

Pass an object with updated attributes to the function:

\`\`\`js
this.updateAttributes({
  count: this.node.attrs.count + 1,
})
\`\`\`

And yes, all of that is reactive, too. A pretty seamless communication, isn’t it?

## Adding a content editable

There is another component called `NodeViewContent` which helps you adding editable content to your node view. Here is an example:

\`\`\`html
<template>
  <node-view-wrapper class="dom">
    <node-view-content class="content-dom" />
  </node-view-wrapper>
</template>

<script>
  import { NodeViewWrapper, NodeViewContent } from '@tiptap/vue-2'

  export default {
    components: {
      NodeViewWrapper,
      NodeViewContent,
    },
  }
</script>
\`\`\`

You don’t need to add those `class` attributes, feel free to remove them or pass other class names. Try it out in the following example:

<CodeDemo path="/GuideNodeViews/VueComponentContent" />

Keep in mind that this content is rendered by Tiptap. That means you need to tell what kind of content is allowed, for example with `content: 'inline*'` in your node extension (that’s what we use in the above example).

The `NodeViewWrapper` and `NodeViewContent` components render a `<div>` HTML tag (`<span>` for inline nodes), but you can change that. For example `<node-view-content as="p">` should render a paragraph. One limitation though: That tag must not change during runtime.

## All available props

For advanced use cases, we pass a few more props to the component.

### editor

The editor instance.

### node

Access the current node.

### decorations

An array of decorations.

### selected

`true` when there is a `NodeSelection` at the current node view.

### extension

Access to the node extension, for example to get options.

### getPos()

Get the document position of the current node.

### updateAttributes()

Update attributes of the current node.

### deleteNode()

Delete the current node.

Here is the full list of what props you can expect:

\`\`\`html
<template>
  <node-view-wrapper />
</template>

<script>
  import { NodeViewWrapper } from '@tiptap/vue-2'

  export default {
    components: {
      NodeViewWrapper,
    },

    props: {
      // the editor instance
      editor: {
        type: Object,
      },

      // the current node
      node: {
        type: Object,
      },

      // an array of decorations
      decorations: {
        type: Array,
      },

      // `true` when there is a `NodeSelection` at the current node view
      selected: {
        type: Boolean,
      },

      // access to the node extension, for example to get options
      extension: {
        type: Object,
      },

      // get the document position of the current node
      getPos: {
        type: Function,
      },

      // update attributes of the current node
      updateAttributes: {
        type: Function,
      },

      // delete the current node
      deleteNode: {
        type: Function,
      },
    },
  }
</script>
\`\`\`

If you just want to have all (and TypeScript support) you can import all props:

\`\`\`js
// Vue 3
import { defineComponent } from 'src/content/editor/extensions/custom-extensions/node-views/vue.mdx'
import { nodeViewProps } from '@tiptap/vue-3'
export default defineComponent({
  props: nodeViewProps,
})

// Vue 2
import Vue from 'src/content/editor/extensions/custom-extensions/node-views/vue.mdx'
import { nodeViewProps } from '@tiptap/vue-2'
export default Vue.extend({
  props: nodeViewProps,
})
\`\`\`

## Dragging

To make your node views draggable, set `draggable: true` in the extension and add `data-drag-handle` to the DOM element that should function as the drag handle.

<CodeDemo path="/GuideNodeViews/DragHandle" />

```

# editor\extensions\functionality\ai-generation.mdx

```mdx
---
title: Integrate AI into your editor
tags:
  - type: pro
  - type: new
meta:
  category: Editor
extension:
  name: AI Generation
  description: Enhance your editor with AI-powered content generation and assistance features.
  type: extension
  icon: Pencil
  isPro: true
  isNew: true
  isCloud: true
---

import { Callout } from '@/components/ui/Callout'
import { CodeDemo } from '@/components/CodeDemo'

Integrate AI-powered editor commands and content generation using the AI Generation extension. This extension add advanced AI text and image generation tools directly within your editor interface.

<Callout title="More details" variant="hint">
  For more detailed information on how to integrate, install, and configure the AI Generation
  extension, please visit our [feature page](/content-ai/capabilities/generation/overview).
</Callout>

<CodeDemo isPro path="/Extensions/AiCommands" />

```

# editor\extensions\functionality\ai-suggestion.mdx

```mdx
---
title: AI Suggestion
tags:
  - type: pro
  - type: beta
meta:
  category: Editor
extension:
  name: AI Suggestion
  description: Enhance your editor with AI-powered proofreading suggestions.
  type: extension
  icon: Pencil
  isPro: true
  isNew: true
  isBeta: true
  isCloud: true
---

import { Callout } from '@/components/ui/Callout'
import { CodeDemo } from '@/components/CodeDemo'

Integrate AI-powered proofreading into your editor using the AI Suggestion extension. This extension adds advanced AI suggestions directly within your editor interface, helping users improve their writing.

<Callout title="More details" variant="hint">
  For more detailed information on how to integrate, install, and configure the AI Suggestion
  extension, please visit our [feature page](/content-ai/capabilities/suggestion/overview).
</Callout>

<CodeDemo isPro path="/Extensions/AiSuggestion" />

```

# editor\extensions\functionality\bubble-menu.mdx

```mdx
---
title: BubbleMenu extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-bubble-menu.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-bubble-menu
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-bubble-menu.svg
    url: https://npmcharts.com/compare/@tiptap/extension-bubble-menu?minimal=true
    label: Downloads
meta:
  title: BubbleMenu extension | Tiptap Editor Docs
  description: Add a menu toolbar that pops up above your Tiptap editor’s text content. Learn more in our Documentation!
  category: Editor
extension:
  name: Bubble Menu
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-bubble-menu
  description: Add a toolbar that pops up above the text. Great to apply inline formatting.
  type: extension
  icon: MessageCircle
---

import { CodeDemo } from '@/components/CodeDemo'

This extension will make a contextual menu appear near a selection of text. Use it to let users apply [marks](/editor/extensions/marks) to their text selection.

As always, the markup and styling is totally up to you.

<CodeDemo path="/Extensions/BubbleMenu" />

## Install

\`\`\`bash
npm install @tiptap/extension-bubble-menu
\`\`\`

## Settings

### element

The DOM element that contains your menu.

Type: `HTMLElement`

Default: `null`

### updateDelay

The `BubbleMenu` debounces the `update` method to allow the bubble menu to not be updated on every selection update. This can be controlled in milliseconds.
The BubbleMenuPlugin will come with a default delay of 250ms. This can be deactivated, by setting the delay to `0` which deactivates the debounce.

Type: `Number`

Default: `undefined`

### tippyOptions

Under the hood, the `BubbleMenu` uses [tippy.js](https://atomiks.github.io/tippyjs/v6/all-props/). You can directly pass options to it.

Type: `Object`

Default: `{}`

### pluginKey

The key for the underlying ProseMirror plugin. Make sure to use different keys if you add more than one instance.

Type: `string | PluginKey`

Default: `'bubbleMenu'`

### shouldShow

A callback to control whether the menu should be shown or not.

Type: `(props) => boolean`

## Source code

[packages/extension-bubble-menu/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-bubble-menu/)

## Use the extension

### JavaScript

\`\`\`js
import { Editor } from '@tiptap/core'
import BubbleMenu from '@tiptap/extension-bubble-menu'

new Editor({
  extensions: [
    BubbleMenu.configure({
      element: document.querySelector('.menu'),
    }),
  ],
})
\`\`\`

### Other frameworks

Check out the demo at the [top of this page](#) to see how to integrate the bubble menu extension with React or Vue.

### Custom logic

Customize the logic for showing the menu with the `shouldShow` option. For components, `shouldShow` can be passed as a prop.

\`\`\`js
BubbleMenu.configure({
  shouldShow: ({ editor, view, state, oldState, from, to }) => {
    // only show the bubble menu for images and links
    return editor.isActive('image') || editor.isActive('link')
  },
})
\`\`\`

### Multiple menus

Use multiple menus by setting an unique `pluginKey`.

\`\`\`js
import { Editor } from '@tiptap/core'
import BubbleMenu from '@tiptap/extension-bubble-menu'

new Editor({
  extensions: [
    BubbleMenu.configure({
      pluginKey: 'bubbleMenuOne',
      element: document.querySelector('.menu-one'),
    }),
    BubbleMenu.configure({
      pluginKey: 'bubbleMenuTwo',
      element: document.querySelector('.menu-two'),
    }),
  ],
})
\`\`\`

Alternatively you can pass a ProseMirror `PluginKey`.

\`\`\`js
import { Editor } from '@tiptap/core'
import BubbleMenu from '@tiptap/extension-bubble-menu'
import { PluginKey } from '@tiptap/pm/state'

new Editor({
  extensions: [
    BubbleMenu.configure({
      pluginKey: new PluginKey('bubbleMenuOne'),
      element: document.querySelector('.menu-one'),
    }),
    BubbleMenu.configure({
      pluginKey: new PluginKey('bubbleMenuTwo'),
      element: document.querySelector('.menu-two'),
    }),
  ],
})
\`\`\`

```

# editor\extensions\functionality\character-count.mdx

```mdx
---
title: CharacterCount extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-character-count.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-character-count
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-character-count.svg
    url: https://npmcharts.com/compare/@tiptap/extension-character-count?minimal=true
    label: Downloads
meta:
  title: CharacterCount extension | Tiptap Editor Docs
  description: Count and limit the number of characters in your editor with the Character Count extension. Learn more in our docs!
  category: Editor
extension:
  name: Character Count
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-character-count
  description: Limit the number of characters in your editor, or at least count them.
  type: extension
  icon: Calculator
---

import { CodeDemo } from '@/components/CodeDemo'

The `CharacterCount` extension limits the number of allowed characters to a specific length and is able to return the number of characters and words. That’s it, that’s all.

<CodeDemo path="/Extensions/CharacterCount" />

## Install

\`\`\`bash
npm install @tiptap/extension-character-count
\`\`\`

## Settings

### limit

The maximum number of characters that should be allowed.

Default: `null`

\`\`\`js
CharacterCount.configure({
  limit: 240,
})
\`\`\`

### mode

The mode by which the size is calculated.

Default: `'textSize'`

\`\`\`js
CharacterCount.configure({
  mode: 'nodeSize',
})
\`\`\`

### textCounter

The text counter function to use. Defaults to a simple character count.

Default: `(text) => text.length`

\`\`\`js
CharacterCount.configure({
  textCounter: (text) => [...new Intl.Segmenter().segment(text)].length,
})
\`\`\`

### wordCounter

The word counter function to use. Defaults to a simple word count.

Default: `(text) => text.split(' ').filter((word) => word !== '').length`

\`\`\`js
CharacterCount.configure({
  wordCounter: (text) => text.split(/\s+/).filter((word) => word !== '').length,
})
\`\`\`

## Storage

### characters()

Get the number of characters for the current document.

\`\`\`js
editor.storage.characterCount.characters()

// Get the size of a specific node.
editor.storage.characterCount.characters({ node: someCustomNode })

// Overwrite the default `mode`.
editor.storage.characterCount.characters({ mode: 'nodeSize' })
\`\`\`

### words()

Get the number of words for the current document.

\`\`\`js
editor.storage.characterCount.words()

// Get the number of words for a specific node.
editor.storage.characterCount.words({ node: someCustomNode })
\`\`\`

## Source code

[packages/extension-character-count/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-character-count/)

```

# editor\extensions\functionality\collaboration-cursor.mdx

```mdx
---
title: CollaborationCursor extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-collaboration-cursor.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-collaboration-cursor
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-collaboration-cursor.svg
    url: https://npmcharts.com/compare/@tiptap/extension-collaboration-cursor?minimal=true
    label: Downloads
meta:
  title: CollaborationCursor extension | Tiptap Editor Docs
  description: Use the Collaboration Cursor extension in Tiptap to show other user’s cursors and their names while they type. More in the docs!
  category: Editor
extension:
  name: Collaboration Cursor
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-collaboration-cursor
  description: 'See other users’ cursors and names while they type.'
  type: extension
  icon: MousePointer2
---

import { ArrowRightIcon } from 'lucide-react'
import Link from '@/components/Link'
import * as CtaBox from '@/components/CtaBox'
import { Button } from '@/components/ui/Button'
import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

This extension adds information about all connected users (like their name and a specified color), their current cursor position and their text selection (if there’s one).

It requires a collaborative Editor, so make sure to check out the [Tiptap Collaboration Docs](/collaboration/getting-started/overview) for a fully hosted or on-premises collaboration server solution.

<Callout title="Public Demo" variant="warning">
  The content of this editor is shared with other users.
</Callout>

<CodeDemo path="/Extensions/CollaborationCursor?hideSource" />
<CodeDemo path="/Extensions/CollaborationCursor" />

Open this page in multiple browser windows to test it.

## Install

\`\`\`bash
npm install @tiptap/extension-collaboration-cursor
\`\`\`

This extension requires the [`Collaboration`](/collaboration/getting-started/overview) extension.

## Settings

### provider

A Y.js network provider, for example a [Tiptap Collaboration](/collaboration/getting-started/overview) instance.

Default: `null`

### user

Attributes of the current user, assumes to have a name and a color, but can be used with any attribute. The values are synced with all other connected clients.

Default: `{ user: null, color: null }`

### render

A render function for the cursor, look at [the extension source code](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-collaboration-cursor/) for an example.

### selectionRender

A render function for the selection, look at [the extension source code](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-collaboration-cursor/) for an example.

## Commands

### updateUser()

Pass an object with updated attributes of the current user. It expects a `name` and a `color`, but you can add additional fields, too.

\`\`\`js
editor.commands.updateUser({
  name: 'John Doe',
  color: '#000000',
  avatar: 'https://unavatar.io/github/ueberdosis',
})
\`\`\`

## Source code

[packages/extension-collaboration-cursor/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-collaboration-cursor/)

<CtaBox.Wrapper>
  <CtaBox.Title>Collaboration</CtaBox.Title>
  <CtaBox.Description>
    Fasten your seatbelts! Make your rich text editor collaborative with Tiptap Collaboration.
  </CtaBox.Description>
  <CtaBox.List>
    <CtaBox.ListItem>Real-time everything</CtaBox.ListItem>
    <CtaBox.ListItem>Offline-first & conflict free</CtaBox.ListItem>
    <CtaBox.ListItem>Managed and hosted by us or on your premises</CtaBox.ListItem>
  </CtaBox.List>
  <CtaBox.Actions className="-mx-3">
    <Button className="text-white/80 hover:text-white/100" variant="tertiary" asChild>
      <Link href="/collaboration/getting-started/overview">
        Learn more
        <ArrowRightIcon className="w-4 h-4" />
      </Link>
    </Button>
  </CtaBox.Actions>
</CtaBox.Wrapper>

```

# editor\extensions\functionality\collaboration.mdx

```mdx
---
title: Collaboration extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-collaboration.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-collaboration
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-collaboration.svg
    url: https://npmcharts.com/compare/@tiptap/extension-collaboration?minimal=true
    label: Downloads
meta:
  category: Editor
  title: Collaboration extension | Tiptap Editor Docs
  description: Learn how to set up and use collaborative editing with the Collaboration extension in Tiptap.
extension:
  name: Collaboration
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-collaboration
  description: Collaborative text editing can be fricking complex, but it doesn’t have to be that way.
  type: extension
  icon: Radio
---

import { ArrowRightIcon } from 'lucide-react'
import Link from '@/components/Link'
import * as CtaBox from '@/components/CtaBox'
import { Button } from '@/components/ui/Button'
import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

This small guide quickly shows how to integrate basic collaboration functionality into your editor. For a proper collaboration integration, review the documentation of [Tiptap Collaboration](/collaboration/getting-started/overview), which is a cloud and on-premises collaboration server solution.

<CodeDemo path="/Demos/CollaborationSplitPane" />

## Install
<Callout title="More details" variant="hint">
    For more detailed information on how to integrate, install, and configure the Collaboration extension with the Tiptap Collaboration product, please visit our [feature page](/collaboration/getting-started/overview).
</Callout>

\`\`\`bash
npm install @tiptap/extension-collaboration yjs y-websocket y-prosemirror
\`\`\`

## Settings

### document

An initialized Y.js document.

Default: `null`

\`\`\`js
Collaboration.configure({
  document: new Y.Doc(),
})
\`\`\`

### field

Name of a Y.js fragment, can be changed to sync multiple fields with one Y.js document.

Default: `'default'`

\`\`\`js
Collaboration.configure({
  document: new Y.Doc(),
  field: 'title',
})
\`\`\`

### fragment

A raw Y.js fragment, can be used instead of `document` and `field`.

Default: `null`

\`\`\`js
Collaboration.configure({
  fragment: new Y.Doc().getXmlFragment('body'),
})
\`\`\`

## Commands

The `Collaboration` extension comes with its own history extension. Make sure to disable the default extension, if you’re working with the `StarterKit`.

### undo()

Undo the last change.

\`\`\`js
editor.commands.undo()
\`\`\`

### redo()

Redo the last change.

\`\`\`js
editor.commands.redo()
\`\`\`

## Keyboard shortcuts

| Command | Windows/Linux                                                                             | macOS                                                                             |
| ------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| undo()  | <kbd>Control</kbd> + <kbd>Z</kbd>                                                         | <kbd>Cmd</kbd> + <kbd>Z</kbd>                                                     |
| redo()  | <kbd>Shift</kbd> + <kbd>Control</kbd> + <kbd>Z</kbd> or <kbd>Control</kbd> + <kbd>Y</kbd> | <kbd>Shift</kbd> + <kbd>Cmd</kbd> + <kbd>Z</kbd> or <kbd>Cmd</kbd> + <kbd>Y</kbd> |

## Source code

[packages/extension-collaboration/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-collaboration/)

## You Did It!

Your editor is now collaborative! Invite your friends and start typing together 🙌🏻 If you want to continue building out your collaborative editing features, make sure to check out the [Tiptap Collaboration Docs](/collaboration/getting-started/overview) for a fully hosted on on-premises collaboration server solution.

<CtaBox.Wrapper>
  <CtaBox.Title>Collaboration</CtaBox.Title>
  <CtaBox.Description>
    Fasten your seatbelts! Make your rich text editor collaborative with Tiptap Collaboration.
  </CtaBox.Description>
  <CtaBox.List>
    <CtaBox.ListItem>Real-time everything</CtaBox.ListItem>
    <CtaBox.ListItem>Offline-first & conflict free</CtaBox.ListItem>
    <CtaBox.ListItem>Managed and hosted by us or on your premises</CtaBox.ListItem>
  </CtaBox.List>
  <CtaBox.Actions className="-mx-3">
    <Button className="text-white/80 hover:text-white/100" variant="tertiary" asChild>
      <Link href="/collaboration/getting-started/overview">
        Learn more
        <ArrowRightIcon className="w-4 h-4" />
      </Link>
    </Button>
  </CtaBox.Actions>
</CtaBox.Wrapper>

```

# editor\extensions\functionality\color.mdx

```mdx
---
title: Color extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-color.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-color
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-color.svg
    url: https://npmcharts.com/compare/@tiptap/extension-color?minimal=true
    label: Downloads
meta:
  title: Color extension | Tiptap Editor Docs
  description: Add text color support to your Tiptap editor with the Color extension. Learn more in our documentation.
  category: Editor
extension:
  name: Color
  link:
  description: Add text color support to your editor (comes with unlimited colors).
  type: extension
  icon: Palette
---

import { CodeDemo } from '@/components/CodeDemo'

This extension enables you to set the font color in the editor. It uses the [`TextStyle`](/editor/extensions/marks/text-style) mark, which renders a `<span>` tag (and only that). The font color is applied as inline style then, for example `<span style="color: #958DF1">`.

<CodeDemo path="/Extensions/Color" />

## Install

\`\`\`bash
npm install @tiptap/extension-text-style @tiptap/extension-color
\`\`\`

This extension requires the [`TextStyle`](/editor/extensions/marks/text-style) mark.

## Settings

### types

A list of marks to which the color attribute should be applied to.

Default: `['textStyle']`

\`\`\`js
Color.configure({
  types: ['textStyle'],
})
\`\`\`

## Commands

### setColor()

Applies the given font color as inline style.

\`\`\`js
editor.commands.setColor('#ff0000')
\`\`\`

### unsetColor()

Removes any font color.

\`\`\`js
editor.commands.unsetColor()
\`\`\`

## Source code

[packages/extension-color/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-color/)

```

# editor\extensions\functionality\comments.mdx

```mdx
---
title: Integrate Comments into your editor
tags:
  - type: pro
  - type: new
meta:
    category: Editor
extension:
    name: Comments
    description: Enable discussions in your collaborative documents—the way you want them.
    type: extension
    icon: MessageCircleMore
    isPro: true
    isNew: true
    isCloud: true
---
import { Callout } from '@/components/ui/Callout'
import { CodeDemo } from '@/components/CodeDemo'

Integrate and manage comments within your editor using the Tiptap Comments extension. Create threads and comments in your editor or via REST API.

<Callout title="More details" variant="hint">
    For more detailed information on how to integrate, install, and configure the Tiptap Comments extension, please visit our [feature page](/comments/getting-started/overview).
</Callout>


<CodeDemo isPro path="/Extensions/Comments" />

```

# editor\extensions\functionality\drag-handle-react.mdx

```mdx
---
title: Drag Handle React extension
tags:
  - type: pro
meta:
  category: Editor
  title: Drag Handle React | Tiptap Editor Docs
  description: Enable dragging nodes around your React-based Tiptap Editor with the Drag Handle React Extension. Learn how to set it up here in the Docs!
extension:
  name: Drag Handle React
  description: Have you ever wanted to drag nodes around your react-based editor? Well, we did too.
  type: extension
  icon: GripVertical
  isPro: true
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

Have you ever wanted to drag nodes around your react-based editor? Well, we did too—so here’s an extension for that.

The `DragHandleReact` component allows you to easily handle dragging nodes around in the editor. You can define custom render functions, placement, and more.
It essentially wraps the [DragHandle](/editor/extensions/functionality/drag-handle) extension in a React component that will automatically register/unregister the extension with the editor.

<CodeDemo isPro path="/Extensions/DragHandle/" />

## Install

<Callout title="Set up access to Tiptap's private repository" variant="info">
  Integrate this pro extension by registering for a free [Tiptap
  account](https://cloud.tiptap.dev/register) and following our [access
  guide](/guides/pro-extensions) to Tiptap’s private repository.
</Callout>

\`\`\`bash
npm install @tiptap-pro/extension-drag-handle-react @tiptap-pro/extension-drag-handle @tiptap-pro/extension-node-range @tiptap/extension-collaboration y-prosemirror yjs y-protocols
\`\`\`

## Props

All props follow the same structure as the [DragHandle](/editor/extensions/functionality/drag-handle) extension.

### children

The content that should be displayed inside of the drag handle.

\`\`\`jsx
<DragHandle>
  <div>Drag Me!</div>
</DragHandle>
\`\`\`

### tippyOptions

Options for tippy.js. You can pass any options that are available in the [tippy.js documentation](https://atomiks.github.io/tippyjs/v6/all-props/).

Default: `undefined`

\`\`\`jsx
<DragHandle
  tippyOptions={{
    placement: 'left',
  }}
>
  <div>Drag Me!</div>
</DragHandle>
\`\`\`

### onNodeChange

Returns a node or null when a node is hovered over. This can be used to highlight the node that is currently hovered over.

Default: `undefined`

\`\`\`jsx
function Component() {
  const [selectedNode, setSelectedNode] = useState(null)

  return (
    <DragHandle
      onNodeChange={({ node, editor, pos }) => {
        setSelectedNode(node)
        // do something with the node
      }}
    >
      <div>Drag Me!</div>
    </DragHandle>
  )
}
\`\`\`

### pluginKey

The key that should be used to store the plugin in the editor. This is useful if you have multiple drag handles in the same editor.

Default: `undefined`

\`\`\`jsx
<DragHandle pluginKey="myCustomDragHandle">
  <div>Drag Me!</div>
</DragHandle>
\`\`\`

### Commands

See the [DragHandle](/editor/extensions/functionality/drag-handle) extension for available editor commands.

```

# editor\extensions\functionality\drag-handle-vue.mdx

```mdx
---
title: Drag Handle vue extension
tags:
  - type: pro
meta:
  category: Editor
  title: Drag Handle Vue | Tiptap Editor Docs
  description: Enable dragging nodes around your vue-based Tiptap Editor with the Drag Handle vue Extension. Learn how to set it up here in the Docs!
extension:
  name: Drag Handle Vue
  description: Have you ever wanted to drag nodes around your vue-based editor? Well, we did too.
  type: extension
  icon: GripVertical
  isPro: true
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

Have you ever wanted to drag nodes around your vue-based editor? Well, we did too—so here’s an extension for that.

The `DragHandleVue` component allows you to easily handle dragging nodes around in the editor. You can define custom render functions, placement, and more.
It essentially wraps the [DragHandle](/editor/extensions/functionality/drag-handle) extension in a vue component that will automatically register/unregister the extension with the editor.

<CodeDemo isPro path="/Extensions/DragHandle?selectedTab=Vue" />

## Install

<Callout title="Set up access to Tiptap's private repository" variant="info">
  Integrate this pro extension by registering for a free [Tiptap
  account](https://cloud.tiptap.dev/register) and following our [access
  guide](/guides/pro-extensions) to Tiptap’s private repository.
</Callout>

\`\`\`bash
npm install @tiptap-pro/extension-drag-handle-vue-3 @tiptap-pro/extension-drag-handle @tiptap-pro/extension-node-range @tiptap/extension-collaboration y-prosemirror yjs y-protocols
\`\`\`

<Callout title="Vue 2 vs. Vue 3" variant="info">
  There are two versions of the DragHandle extension available. Make sure to install the correct
  version for your Vue version. `@tiptap-pro/extension-drag-handle-vue-2` and
  `@tiptap-pro/extension-drag-handle-vue-3`
</Callout>

## Props

All props follow the same structure as the [DragHandle](/editor/extensions/functionality/drag-handle) extension.

### children

The content that should be displayed inside of the drag handle.

\`\`\`vue
<drag-handle>
  <div>Drag Me!</div>
</drag-handle>
\`\`\`

### tippyOptions

Options for tippy.js. You can pass any options that are available in the [tippy.js documentation](https://atomiks.github.io/tippyjs/v6/all-props/).

Default: `undefined`

\`\`\`vue
<drag-handle :tippy-options="{ placement: 'left' }">
  <div>Drag Me!</div>
</drag-handle>
\`\`\`

### onNodeChange

Returns a node or null when a node is hovered over. This can be used to highlight the node that is currently hovered over.

Default: `undefined`

\`\`\`vue
<template>
  <drag-handle @nodeChange="handleNodeChange">
    <div>Drag Me!</div>
  </drag-handle>
</template>

<script>
import { ref } from 'vue'
import { DragHandle } from '@tiptap-pro/extension-drag-handle-vue-3'

export default {
  components: {
    DragHandle,
  },
  setup() {
    const selectedNode = ref(null)

    const handleNodeChange = ({ node, editor, pos }) => {
      selectedNode.value = node
      // do something with the node
    }

    return {
      selectedNode,
      handleNodeChange,
    }
  },
}
</script>
\`\`\`

### pluginKey

The key that should be used to store the plugin in the editor. This is useful if you have multiple drag handles in the same editor.

Default: `undefined`

\`\`\`vue
<drag-handle pluginKey="myCustomDragHandle">
  <div>Drag Me!</div>
</drag-handle>
\`\`\`

### Commands

See the [DragHandle](/editor/extensions/functionality/drag-handle) extension for available editor commands.

```

# editor\extensions\functionality\drag-handle.mdx

```mdx
---
title: Drag Handle extension
tags:
  - type: pro
meta:
  category: Editor
  title: Drag Handle extension | Tiptap Editor Docs
  description: Enable dragging nodes around your Tiptap Editor with the Drag Handle Extension. Learn how to set it up here in the Docs!
extension:
  name: Drag Handle
  description: Have you ever wanted to drag nodes around your editor? Well, we did too.
  type: extension
  icon: GripVertical
  isPro: true
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

Have you ever wanted to drag nodes around your editor? Well, we did too—so here’s an extension for that.

The `DragHandle` extension allows you to easily handle dragging nodes around in the editor. You can define custom render functions, placement, and more.

<CodeDemo isPro path="/Extensions/DragHandle" />

## Install

<Callout title="Set up access to Tiptap's private repository" variant="info">
  Integrate this pro extension by registering for a free [Tiptap
  account](https://cloud.tiptap.dev/register) and following our [access
  guide](/guides/pro-extensions) to Tiptap’s private repository.
</Callout>

\`\`\`bash
npm install @tiptap-pro/extension-drag-handle
\`\`\`

## Settings

### render

Renders an element that is positioned with tippy.js. This is the element that will be displayed as the handle when dragging a node around.

\`\`\`js
DragHandle.configure({
  render: () => {
    const element = document.createElement('div')

    // Use as a hook for CSS to insert an icon
    element.classList.add('custom-drag-handle')

    return element
  },
})
\`\`\`

### tippyOptions

Options for tippy.js. You can pass any options that are available in the [tippy.js documentation](https://atomiks.github.io/tippyjs/v6/all-props/).

Default: `undefined`

\`\`\`js
DragHandle.configure({
  tippyOptions: {
    placement: 'left',
  },
})
\`\`\`

### onNodeChange

Returns a node or null when a node is hovered over. This can be used to highlight the node that is currently hovered over.

Default: `undefined`

\`\`\`js
DragHandle.configure({
  onNodeChange: ({ node, editor, pos }) => {
    if (!node) {
      selectedNode = null
      return
    }
    // Do something with the node
    selectedNode = node
  },
})
\`\`\`

## Commands

### lockDragHandle()

Locks the draghandle in place and visibility. If the drag handle was visible, it will remain visible until unlocked. If it was hidden, it will remain hidden until unlocked.

This can be useful if you want to have a menu inside of the drag handle and want it to remain visible whether the drag handle is moused over or not.

\`\`\`js
editor.commands.lockDragHandle()
\`\`\`

### unlockDragHandle()

Unlocks the draghandle. Resets to default visibility and behavior.

\`\`\`js
editor.commands.unlockDragHandle()
\`\`\`

### toggleDragHandle()

Toggle draghandle lock state. If the drag handle is locked, it will be unlocked and vice versa.

\`\`\`js
editor.commands.toggleDragHandle()
\`\`\`

```

# editor\extensions\functionality\dropcursor.mdx

```mdx
---
title: Dropcursor extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-dropcursor.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-dropcursor
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-dropcursor.svg
    url: https://npmcharts.com/compare/@tiptap/extension-dropcursor?minimal=true
    label: Downloads
meta:
  title: Dropcursor extension | Tiptap Editor Docs
  description: Add a cursor when dragging items inside the editor with the Dropcursor extension. Learn how to use it here in the Docs!
  category: Editor
extension:
  name: Dropcursor
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-dropcursor
  description: Adds a cursor when something is dragged inside the editor.
  type: extension
  icon: FoldVertical
---

import { CodeDemo } from '@/components/CodeDemo'

This extension loads the [ProseMirror Dropcursor plugin](https://github.com/ProseMirror/prosemirror-dropcursor) by Marijn Haverbeke, which shows a cursor at the drop position when something is dragged into the editor.

Note that Tiptap is headless, but the dropcursor needs CSS for its appearance. There are settings for the color and width, and you’re free to add a custom CSS class.

<CodeDemo path="/Extensions/Dropcursor" />

## Install

\`\`\`bash
npm install @tiptap/extension-dropcursor
\`\`\`

## Settings

### color

Color of the dropcursor.

Default: `'currentColor'`

\`\`\`js
Dropcursor.configure({
  color: '#ff0000',
})
\`\`\`

### width

Width of the dropcursor.

Default: `1`

\`\`\`js
Dropcursor.configure({
  width: 2,
})
\`\`\`

### class

One or multiple CSS classes that should be applied to the dropcursor.

\`\`\`js
Dropcursor.configure({
  class: 'my-custom-class',
})
\`\`\`

## Source code

[packages/extension-dropcursor/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-dropcursor/)

```

# editor\extensions\functionality\export.mdx

```mdx
---
title: Export
tags:
  - type: pro
  - type: new
meta:
  category: Editor
extension:
  name: Export
  description: Export Tiptap content to docx, odt, or markdown.
  type: extension
  icon: Download
  isPro: true
  isNew: true
  isBeta: true
  isCloud: true
---

import { Callout } from '@/components/ui/Callout'
import { CodeDemo } from '@/components/CodeDemo'

Export Tiptap's editor content to various formats like docx, odt, and markdown.

<Callout title="More details" variant="hint">
    For more detailed information on how to integrate, install, and configure the Conversion feature, please visit our [feature page](/conversion/getting-started/overview).
</Callout>

<CodeDemo isPro path="/Extensions/Export" />
```

# editor\extensions\functionality\filehandler.mdx

```mdx
---
title: FileHandler extension
tags:
  - type: pro
meta:
  category: Editor
  title: FileHandler extension | Tiptap Editor Docs
  description: Handle file drops and pastes in your Tiptap editor with the FileHandler extension. Learn how to set it up here in the Docs!
extension:
  name: File Handler
  description: Have you ever wanted to drag and drop or paste files into your editor? Well, we did too.
  type: extension
  icon: File
  isPro: true
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

Have you ever wanted to drag and drop or paste files into your editor? Well, we did too—so here’s an extension for that.

The `FileHandler` extension allows you to easily handle file drops and pastes in the editor. You can define custom handlers for both events & manage allowed file types.

By default, the extension does not display the uploaded file when it is pasted or dropped. Instead, it triggers an event that you can respond to by inserting a new Node into the editor. For example, to display the uploaded image file, use the [image extension](/editor/extensions/nodes/image).

<Callout title="No Server Upload Functionality" variant="info">
  This extension is only responsible for handling the event of dropping or pasting a file into the
  editor. It does not implement server file uploads.
</Callout>

<CodeDemo isPro path="/Extensions/FileHandler" />

## Install

<Callout title="Set up access to Tiptap's private repository" variant="info">
  Integrate this pro extension by registering for a free [Tiptap
  account](https://cloud.tiptap.dev/register) and following our [access
  guide](/guides/pro-extensions) to Tiptap’s private repository.
</Callout>

\`\`\`bash
npm install @tiptap-pro/extension-file-handler
\`\`\`

## Settings

### onPaste

The callback function that will be called when a file is pasted into the editor. You will have access to the editor instance & the files pasted.

Default: `undefined`

\`\`\`js
FileHandler.configure({
  onPaste: (editor, files, htmlContent) => {
    // do something with the files
    // and insert the file into the editor
    // in some cases (for example copy / pasted gifs from other apps) you should probably not use the file directly
    // as the file parser will only have a single gif frame as png
    // in this case, you can extract the url from the htmlContent and use it instead, let other inputRules handle insertion
    // or do anything else with the htmlContent pasted into here
  },
})
\`\`\`

### onDrop

The callback function that will be called when a file is dropped into the editor. You will have access to the editor instance, the files dropped and the position the file was dropped at.

Default: `undefined`

\`\`\`js
FileHandler.configure({
  onDrop: (editor, files, pos) => {
    // do something with the files
    // and insert the file into the editor
  },
})
\`\`\`

### allowedMimeTypes

This option controls which file types are allowed to be dropped or pasted into the editor. You can define a list of mime types or a list of file extensions. If no mime types or file extensions are defined, all files will be allowed.

Default: `undefined`

\`\`\`js
FileHandler.configure({
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
})
\`\`\`

```

# editor\extensions\functionality\floatingmenu.mdx

```mdx
---
title: FloatingMenu extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-floating-menu.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-floating-menu
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-floating-menu.svg
    url: https://npmcharts.com/compare/@tiptap/extension-floating-menu?minimal=true
    label: Downloads
meta:
  title: FloatingMenu extension | Tiptap Editor Docs
  description: Use the Floating Menu extension in Tiptap to add a menu that appears on empty lines. Learn more in the docs.
  category: Editor
extension:
  name: Floating Menu
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-floating-menu
  description: Make a toolbar appear automagically on empty lines.
  type: extension
  icon: Cloud
---

import { CodeDemo } from '@/components/CodeDemo'

Use the Floating Menu extension in Tiptap to make a menu appear on an empty line.

<CodeDemo path="/Extensions/FloatingMenu" />

## Install the extension

\`\`\`bash
npm install @tiptap/extension-floating-menu
\`\`\`

## Settings

### element

The DOM element that contains your menu.

Type: `HTMLElement`

Default: `null`

### tippyOptions

Under the hood, the `FloatingMenu` uses [tippy.js](https://atomiks.github.io/tippyjs/v6/all-props/). You can directly pass options to it.

Type: `Object`

Default: `{}`

### pluginKey

The key for the underlying ProseMirror plugin. Make sure to use different keys if you add more than one instance.

Type: `string | PluginKey`

Default: `'floatingMenu'`

### shouldShow

A callback to control whether the menu should be shown or not.

Type: `(props) => boolean`

## Source code

[packages/extension-floating-menu/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-floating-menu/)

## Use in Vanilla JavaScript

\`\`\`js
import { Editor } from '@tiptap/core'
import FloatingMenu from '@tiptap/extension-floating-menu'

new Editor({
  extensions: [
    FloatingMenu.configure({
      element: document.querySelector('.menu'),
    }),
  ],
})
\`\`\`

### Other frameworks

Check out the demo at the [top of this page](#) to see how to integrate the floating menu extension with React or Vue.

### Custom logic

Customize the logic for showing the menu with the `shouldShow` option. For components, `shouldShow` can be passed as a prop.

\`\`\`js
FloatingMenu.configure({
  shouldShow: ({ editor, view, state, oldState }) => {
    // show the floating within any paragraph
    return editor.isActive('paragraph')
  },
})
\`\`\`

### Multiple menus

Use multiple menus by setting an unique `pluginKey`.

\`\`\`js
import { Editor } from '@tiptap/core'
import FloatingMenu from '@tiptap/extension-floating-menu'

new Editor({
  extensions: [
    FloatingMenu.configure({
      pluginKey: 'floatingMenuOne',
      element: document.querySelector('.menu-one'),
    }),
    FloatingMenu.configure({
      pluginKey: 'floatingMenuTwo',
      element: document.querySelector('.menu-two'),
    }),
  ],
})
\`\`\`

Alternatively you can pass a ProseMirror `PluginKey`.

\`\`\`js
import { Editor } from '@tiptap/core'
import FloatingMenu from '@tiptap/extension-floating-menu'
import { PluginKey } from '@tiptap/pm/state'

new Editor({
  extensions: [
    FloatingMenu.configure({
      pluginKey: new PluginKey('floatingMenuOne'),
      element: document.querySelector('.menu-one'),
    }),
    FloatingMenu.configure({
      pluginKey: new PluginKey('floatingMenuOne'),
      element: document.querySelector('.menu-two'),
    }),
  ],
})
\`\`\`

```

# editor\extensions\functionality\focus.mdx

```mdx
---
title: Focus extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-focus.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-focus
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-focus.svg
    url: https://npmcharts.com/compare/@tiptap/extension-focus?minimal=true
    label: Downloads
meta:
  title: Focus extension | Tiptap Editor Docs
  description: Use the Focus extension in Tiptap to track and highlight the cursor's position. Learn more in our docs!
  category: Editor
extension:
  name: Focus
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-focus
  description: Keep track of where the cursor is, and let the user know you know it.
  type: extension
  icon: Focus
---

import { CodeDemo } from '@/components/CodeDemo'

The Focus extension adds a CSS class to focused nodes. By default it adds `.has-focus`, but you can change that.

Note that it’s only a class, the styling is totally up to you. The usage example below has some CSS for that class.

<CodeDemo path="/Extensions/Focus" />

## Install

\`\`\`bash
npm install @tiptap/extension-focus
\`\`\`

## Settings

### className

The class that is applied to the focused element.

Default: `'has-focus'`

\`\`\`js
Focus.configure({
  className: 'focus',
})
\`\`\`

### mode

Apply the class to `'all'`, the `'shallowest'` or the `'deepest'` node.

Default: `'all'`

\`\`\`js
Focus.configure({
  mode: 'deepest',
})
\`\`\`

## Source code

[packages/extension-focus/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-focus/)

```

# editor\extensions\functionality\fontfamily.mdx

```mdx
---
title: FontFamily extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-font-family.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-font-family
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-font-family.svg
    url: https://npmcharts.com/compare/@tiptap/extension-font-family?minimal=true
    label: Downloads
meta:
  title: FontFamily extension | Tiptap Editor Docs
  description: Set custom font families using the Font Family extension in your Tiptap Editor. Learn more in our documentation.
  category: Editor
extension:
  name: Font Family
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-font-family
  description: Doesn’t have support for Comic Sans, but for all other fonts.
  type: extension
  icon: Type
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

This extension enables you to set the font family in the editor. It uses the [`TextStyle`](/editor/extensions/marks/text-style) mark, which renders a `<span>` tag. The font family is applied as inline style, for example `<span style="font-family: Arial">`.

<CodeDemo path="/Extensions/FontFamily" />

<Callout title="Heads-up!" variant="hint">
  Be aware that `editor.isActive('textStyle', { fontFamily: 'Font Family' })` will return the font family as set by the [browser's CSS rules](https://developer.mozilla.org/en-US/docs/Web/CSS/font-family#family-name) and not as you would have expected when setting the font family.
</Callout>

## Install

\`\`\`bash
npm install @tiptap/extension-text-style @tiptap/extension-font-family
\`\`\`

This extension requires the [`TextStyle`](/editor/extensions/marks/text-style) mark.

## Settings

### types

A list of marks to which the font family attribute should be applied to.

Default: `['textStyle']`

\`\`\`js
FontFamily.configure({
  types: ['textStyle'],
})
\`\`\`

## Commands

### setFontFamily()

Applies the given font family as inline style.

\`\`\`js
editor.commands.setFontFamily('Inter')
\`\`\`

### unsetFontFamily()

Removes any font family.

\`\`\`js
editor.commands.unsetFontFamily()
\`\`\`

## Source code

[packages/extension-font-family/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-font-family/)

```

# editor\extensions\functionality\gapcursor.mdx

```mdx
---
title: Gapcursor extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-gapcursor.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-gapcursor
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-gapcursor.svg
    url: https://npmcharts.com/compare/@tiptap/extension-gapcursor?minimal=true
    label: Downloads
meta:
  title: Gapcursor extension | Tiptap Editor Docs
  description: Prevent your cursor from getting stuck with the Gapcursor extension in Tiptap. Learn more in our documentation.
  category: Editor
extension:
  name: Gapcursor
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-gapcursor
  description: The gapcursor prevents the cursor from getting stuck… in a gap.
  type: extension
  icon: TextCursor
---

import { CodeDemo } from '@/components/CodeDemo'

This extension loads the [ProseMirror Gapcursor plugin](https://github.com/ProseMirror/prosemirror-gapcursor) by Marijn Haverbeke, which adds a gap for the cursor in places that don’t allow regular selection. For example, after a table at the end of a document.

Note that Tiptap is headless, but the gapcursor needs CSS for its appearance. The [default CSS](https://github.com/ueberdosis/tiptap/tree/main/packages/core/src/style.ts) is loaded through the Editor class.

<CodeDemo path="/Extensions/Gapcursor" />

## Install

\`\`\`bash
npm install @tiptap/extension-gapcursor
\`\`\`

## Source code

[packages/extension-gapcursor/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-gapcursor/)

```

# editor\extensions\functionality\history.mdx

```mdx
---
title: Integrate Document History into your editor
tags:
  - type: pro
  - type: new
extension:
  name: History
  description: Document version history for manual and automatic versioning of your documents.
  type: extension
  icon: FileStack
  isPro: true
  isNew: true
  isCloud: true
---

import { Callout } from '@/components/ui/Callout'
import { CodeDemo } from '@/components/CodeDemo'

Integrate and manage document revisions using the History extension. This extension enables tracking of all changes, allowing users to view previous document versions and revert changes as needed.

<Callout title="More details" variant="hint">
    For more detailed information on how to integrate, install, and configure the History extension, please visit our [feature page](/collaboration/documents/history).
</Callout>

<CodeDemo isPro path="/Extensions/CollaborationHistory" />

```

# editor\extensions\functionality\import.mdx

```mdx
---
title: Import
tags:
  - type: pro
  - type: beta
meta:
  category: Editor
extension:
  name: Import
  description: Import documents from docx, odt, or markdown to Tiptap.
  type: extension
  icon: Upload
  isPro: true
  isBeta: true
  isCloud: true
---

import { Callout } from '@/components/ui/Callout'
import { CodeDemo } from '@/components/CodeDemo'

Import documents from various formats like docx, odt, and markdown and convert them to Tiptap's JSON format.

<Callout title="More details" variant="hint">
    For more detailed information on how to integrate, install, and configure the Conversion feature, please visit our [feature page](/conversion/getting-started/overview).
</Callout>

<CodeDemo isPro path="/Extensions/Import" />
```

# editor\extensions\functionality\index.mdx

```mdx
---
title: Functionality extensions
meta:
  title: Functionality extensions | Tiptap Editor Docs
  meta: Overview of Tiptap Editor functionality extensions, including tools for collaboration, text editing, and more.
  category: Editor
sidebars:
  hideSecondary: true
---

import { Extensions } from '@/components/Extensions'

Extensions do not always render content, but can also provide additional functionality to the editor. This includes tools for collaboration, text editing, and more.

<Extensions path="content/editor/extensions/functionality" />

```

# editor\extensions\functionality\invisiblecharacters.mdx

```mdx
---
tags:
  - type: pro
title: InvisibleCharacters extensions
meta:
  title: InvisibleCharacters extension | Tiptap Editor Docs
  description: Allow your users to see invisible characters like spaces, hard breaks, and paragraphs. More in the docs!
  category: Editor
extension:
  name: Invisible Characters
  description: 'Allow your users to see invisible characters like spaces, hard breaks, and paragraphs.'
  type: extension
  icon: Asterisk
  isPro: true
---

import { Callout } from '@/components/ui/Callout'
import { CodeDemo } from '@/components/CodeDemo'

This extension adds decorators to show non-printable characters and help you increase accessibility.

<CodeDemo isPro path="/Extensions/InvisibleCharacters" />

## Install

<Callout title="Set up access to Tiptap's private repository" variant="info">
  Integrate this pro extension by registering for a free [Tiptap
  account](https://cloud.tiptap.dev/register) and following our [access
  guide](/guides/pro-extensions) to Tiptap’s private repository.
</Callout>

\`\`\`bash
npm install @tiptap-pro/extension-invisible-characters
\`\`\`

## Settings

### visible

Define default visibility.

Default: `true`

\`\`\`js
InvisibleCharacters.configure({
  visible: false,
})
\`\`\`

### builders

An array of invisible characters – by default it contains: spaces, hard breaks and paragraphs.

Default: `[new SpaceCharacter(), new HardBreakNode(), new ParagraphNode()]`

\`\`\`js
import InvisibleCharacters, { SpaceCharacter } from '@tiptap-pro/extension-invisible-characters'

// [...]

InvisibleCharacters.configure({
  builders: [new SpaceCharacter(), new YourCustomInvisibleCharacter()],
})
\`\`\`

### injectCSS

By default, the extension injects some CSS. With `injectCSS` you can disable that.

Default: `true`

\`\`\`js
InvisibleCharacters.configure({
  injectCSS: false,
})
\`\`\`

### injectNonce

When you use a [Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy) with `nonce`, you can specify a `nonce` to be added to dynamically created elements. Here is an example:

Default: `undefined`

\`\`\`js
InvisibleCharacters.configure({
  injectCSS: false,
  injectNonce: 'your-nonce-here',
})
\`\`\`

## Storage

### visibility()

Find out whether the visibility of invisible characters is active or not.

\`\`\`js
editor.storage.invisibleCharacters.visibility()
\`\`\`

## Commands

### showInvisibleCharacters()

Show invisible characters. You can also pass `false` to use the same command to hide them.

\`\`\`js
editor.commands.showInvisibleCharacters()
\`\`\`

### hideInvisibleCharacters()

Hide invisible characters.

\`\`\`js
editor.commands.hideInvisibleCharacters()
\`\`\`

### toggleInvisibleCharacters()

Toggle visibility of invisible characters.

\`\`\`js
editor.commands.toggleInvisibleCharacters()
\`\`\`

## Custom invisible characters

To create a custom invisible characters, you can extend the classes provided by the package.

### InvisibleCharacter

\`\`\`js
import InvisibleCharacters, { InvisibleCharacter } from '@tiptap-pro/extension-invisible-characters'

class MyInvisibleCharacter extends InvisibleCharacter {
  constructor() {
    super({
      type: 'my-invisible-character',
      predicate: (value) => value === '+',
    })
  }
}

// … use it like this
new Editor({
  extensions: [InvisibleCharacters.configure({ builders: [new MyInvisibleCharacter()] })],
})
\`\`\`

To select the decoration within CSS, we can use the following selector:

\`\`\`css
.Tiptap-invisible-character.Tiptap-invisible-character--my-invisible-character {
  // …
}
\`\`\`

### InvisibleNode

\`\`\`js
import InvisibleCharacters, { InvisibleNode } from '@tiptap-pro/extension-invisible-characters'

class MyInvisibleNode extends InvisibleNode {
  constructor() {
    super({
      type: 'my-invisible-node',
      predicate: (node) => node.type === node.type.schema.nodes.listItem,
    })
  }
}

// … use it like this
new Editor({
  extensions: [InvisibleCharacters.configure({ builders: [new MyInvisibleNode()] })],
})
\`\`\`

To select the decoration within CSS, we can use the following selector:

\`\`\`css
.Tiptap-invisible-character.Tiptap-invisible-character--my-invisible-node {
  // …
}
\`\`\`

```

# editor\extensions\functionality\listkeymap.mdx

```mdx
---
title: List Keymap extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-list-keymap.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-list-keymap
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-list-keymap.svg
    url: https://npmcharts.com/compare/@tiptap/extension-list-keymap?minimal=true
    label: Downloads
extension:
  name: List Keymap
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-list-keymap
  description: Lists’ behavior can be tricky, so we made this small extension to make them easier to work with.
  type: extension
  icon: Keyboard
meta:
  title: List Keymap extension | Tiptap Editor Docs
  description: Add extra keymap handlers to change the default backspace and delete behavior for lists. Learn more in our docs!
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'

The List Keymap extension modifies the default ProseMirror and Tiptap behavior. Without this extension, pressing backspace at the start of a list item keeps the list item content on the same line. With the List Keymap, the content is lifted into the list item above.

<CodeDemo path="/Extensions/ListKeymap" />

## Install

\`\`\`bash
npm install @tiptap/extension-list-keymap
\`\`\`

## Settings

### listTypes

A array of list items and their parent wrapper node types.

Default:

\`\`\`js
;[
  {
    itemName: 'listItem',
    wrapperNames: ['bulletList', 'orderedList'],
  },
  {
    itemName: 'taskItem',
    wrapperNames: ['taskList'],
  },
]
\`\`\`

\`\`\`js
ListKeymap.configure({
  listTypes: [
    {
      itemName: 'taskItem',
      wrapperNames: ['customTaskList'],
    },
  ],
})
\`\`\`

## Source code

[packages/extension-list-keymap/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-list-keymap/)

```

# editor\extensions\functionality\mathematics.mdx

```mdx
---
title: Mathematics extension
tags:
  - type: pro
meta:
  title: Mathematics extension | Tiptap Editor Docs
  description: This extension allows your users to write and visualize mathematical formulas via LaTeX. Learn how to set it up in the docs!
  category: Editor
extension:
  name: Mathematics
  description: This extension allows your users to write and visualize mathematical formulas via LaTeX.
  type: extension
  icon: SquareDivide
  isPro: true
---

import { Callout } from '@/components/ui/Callout'
import { CodeDemo } from '@/components/CodeDemo'

This extension allows you to write and visualize even complex mathematical formulas or equations in your editor. Please note that the current version is still in a very basic stage.

<CodeDemo isPro path="/Extensions/Mathematics" />

## Install

<Callout title="Set up access to Tiptap's private repository" variant="info">
  Integrate this pro extension by registering for a free [Tiptap
  account](https://cloud.tiptap.dev/register) and following our [access
  guide](/guides/pro-extensions) to Tiptap’s private repository.
</Callout>

\`\`\`bash
npm install @tiptap-pro/extension-mathematics katex
\`\`\`

### Additional Setup

You are free to style the rendering element and the editor input.

**Import of KaTeX styling (needed).**

\`\`\`js
import 'katex/dist/katex.min.css'
\`\`\`

**The following classes allow you to select and style the math-decorations. For an example, see demonstration code at the end of this page.**

\`\`\`css
/* Decoration containing the actual text */
.Tiptap-mathematics-editor {
  // …
}

/* Container of the KaTeX rendering */
.Tiptap-mathematics-render {
  // …
}
\`\`\`

### Control when to render LaTeX decorations

By default LaTeX decorations for mathematical expressions are rendered when said expression is not inside a code block. If you want to customize this behavior, you can do so by passing a function to the `shouldRender` option. This function should return a boolean value indicating whether the LaTeX decorations should be rendered or not.

\`\`\`js
import Mathematics from '@tiptap-pro/extension-mathematics'

// [...]

Mathematics.configure({
  shouldRender: (state, pos, node) => {
    const $pos = state.doc.resolve(pos)
    return node.type.name === 'text' && $pos.parent.type.name !== 'codeBlock'
  }
})
\`\`\`

You can also import the default `shouldRender` function to extend the default behavior:

\`\`\`js

import Mathematics, { shouldRender } from '@tiptap-pro/extension-mathematics'

// [...]

Mathematics.configure({
  shouldRender: (state, pos, node) => {
    // this will disable rendering for headings & code blocks
    return shouldRender(state, pos, node) && node.type.name !== 'heading'
  }
})
\`\`\`

## Settings

### regex

Tiptap needs to know when the text is mathematical. Therefor a regular expression pattern allows us to define this shorthand. E.g. using the TeX shorthand `$ … $` (see default below). Matches become decorated – they are not stored as own nodes or marks!

Default: `/\$([^\$]*)\$/gi`

### katexOptions

For the math typesetting the extension uses the third party library [KaTeX](https://katex.org). To adjust its behaviour, you can pass KaTeX options to it. Find all of them [here](https://katex.org/docs/options.html).

Default: `undefined`

\`\`\`js
import Mathematics from '@tiptap-pro/extension-mathematics'

// [...]

Mathematics.configure({
  katexOptions: {
    maxSize: 300,
  },
})
\`\`\`
### shouldRender

By default LaTeX decorations for mathematical expressions are rendered when said expression is not inside a code block. If you want to customize this behavior, you can do so by passing a function to the `shouldRender` option. This function should return a boolean value indicating whether the LaTeX decorations should be rendered or not.

Default: `() => true`

\`\`\`js
import Mathematics from '@tiptap-pro/extension-mathematics'

// [...]

Mathematics.configure({
  shouldRender: (state, pos, node) => {
    const $pos = state.doc.resolve(pos)
    return node.type.name === 'text' && $pos.parent.type.name !== 'codeBlock'
  }
})
\`\`\`
```

# editor\extensions\functionality\placeholder.mdx

```mdx
---
title: Placeholder extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-placeholder.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-placeholder
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-placeholder.svg
    url: https://npmcharts.com/compare/@tiptap/extension-placeholder?minimal=true
    label: Downloads
meta:
  title: Placeholder extension | Tiptap Editor Docs
  description: Configure a helpful placeholder to fill the emptiness in your Tiptap editor. Learn how to set up and use it here in the Docs!
  category: Editor
extension:
  name: Placeholder
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-placeholder
  description: Configure a helpful placeholder to fill the emptiness.
  type: extension
  icon: Ghost
---

import { CodeDemo } from '@/components/CodeDemo'

This extension provides placeholder support. Give your users an idea what they should write with a tiny hint. There is a handful of things to customize, if you feel like it.

<CodeDemo path="/Extensions/Placeholder" />

## Install

\`\`\`bash
npm install @tiptap/extension-placeholder
\`\`\`

### Additional Setup

Placeholders are displayed with the help of CSS.

**Display a Placeholder only for the first line in an empty editor.**

\`\`\`
.tiptap p.is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
\`\`\`

**Display Placeholders on every new line.**

\`\`\`
.tiptap p.is-empty::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
\`\`\`

## Settings

### emptyEditorClass

The added CSS class if the editor is empty.

Default: `'is-editor-empty'`

\`\`\`js
Placeholder.configure({
  emptyEditorClass: 'is-editor-empty',
})
\`\`\`

### emptyNodeClass

The added CSS class if the node is empty.

Default: `'is-empty'`

\`\`\`js
Placeholder.configure({
  emptyNodeClass: 'my-custom-is-empty-class',
})
\`\`\`

### placeholder

The placeholder text added as `data-placeholder` attribute.

Default: `'Write something …'`

\`\`\`js
Placeholder.configure({
  placeholder: 'My Custom Placeholder',
})
\`\`\`

You can even use a function to add placeholder depending on the node:

\`\`\`js
Placeholder.configure({
  placeholder: ({ node }) => {
    if (node.type.name === 'heading') {
      return 'What’s the title?'
    }

    return 'Can you add some further context?'
  },
})
\`\`\`

### showOnlyWhenEditable

Show decorations only when editor is editable.

Default: `true`

\`\`\`js
Placeholder.configure({
  showOnlyWhenEditable: false,
})
\`\`\`

### showOnlyCurrent

Show decorations only in currently selected node.

Default: `true`

\`\`\`js
Placeholder.configure({
  showOnlyCurrent: false,
})
\`\`\`

### includeChildren

Show decorations also for nested nodes.

Default: `false`

\`\`\`js
Placeholder.configure({
  includeChildren: true,
})
\`\`\`

## Source code

[packages/extension-placeholder/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-placeholder/)

```

# editor\extensions\functionality\snapshot-compare.mdx

```mdx
---
title: Snapshot Compare Extension
tags:
  - type: pro
  - type: new
extension:
  name: Snapshot Compare
  description: Compare snapshots of versions of your documents to see changes made between two versions.
  type: extension
  icon: Diff
  isPro: true
  isNew: true
  isCloud: true
---

import { Callout } from '@/components/ui/Callout'
import { CodeDemo } from '@/components/CodeDemo'

Use the Snapshot Compare extension to visualize changes between two document versions. Whether you're collaborating with a team or editing individually, it highlights the differences between snapshots, showing what changed and who made the changes.

<Callout title="More details" variant="hint">
  For more detailed information on how to integrate, install, and configure the Snapshot Compare
  extension, please visit our [feature page](/collaboration/documents/snapshot-compare).
</Callout>

<CodeDemo isPro path="/Extensions/SnapshotCompare" />

```

# editor\extensions\functionality\starterkit.mdx

```mdx
---
title: StarterKit extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/starter-kit.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/starter-kit
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/starter-kit.svg
    url: https://npmcharts.com/compare/@tiptap/starter-kit?minimal=true
    label: Downloads
meta:
  title: StarterKit extension | Tiptap Editor Docs
  description: All the popular extensions in one extension with StarterKit. Perfect for getting started with Tiptap. More in the docs!
  category: Editor
extension:
  name: StarterKit
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/starter-kit
  description: All the popular extensions in a one. It doesn’t get much better than this.
  type: extension
  icon: Package
---

The `StarterKit` is a collection of the most popular Tiptap extensions. If you’re just getting started, this extension is for you.

## Install

\`\`\`bash
npm install @tiptap/starter-kit
\`\`\`

## Included extensions

### Nodes

- [`Blockquote`](/editor/extensions/nodes/blockquote)
- [`BulletList`](/editor/extensions/nodes/bullet-list)
- [`CodeBlock`](/editor/extensions/nodes/code-block)
- [`Document`](/editor/extensions/nodes/document)
- [`HardBreak`](/editor/extensions/nodes/hard-break)
- [`Heading`](/editor/extensions/nodes/heading)
- [`HorizontalRule`](/editor/extensions/nodes/horizontal-rule)
- [`ListItem`](/editor/extensions/nodes/list-item)
- [`OrderedList`](/editor/extensions/nodes/ordered-list)
- [`Paragraph`](/editor/extensions/nodes/paragraph)
- [`Text`](/editor/extensions/nodes/text)

### Marks

- [`Bold`](/editor/extensions/marks/bold)
- [`Code`](/editor/extensions/marks/code)
- [`Italic`](/editor/extensions/marks/italic)
- [`Strike`](/editor/extensions/marks/strike)

### Extensions

- [`Dropcursor`](/editor/extensions/functionality/dropcursor)
- [`Gapcursor`](/editor/extensions/functionality/gapcursor)
- [`History`](/collaboration/documents/history)

## Source code

[packages/starter-kit/](https://github.com/ueberdosis/tiptap/blob/main/packages/starter-kit/)

## Using the StarterKit extension

Pass `StarterKit` to the editor to load all included extension at once.

\`\`\`js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

const editor = new Editor({
  content: '<p>Example Text</p>',
  extensions: [StarterKit],
})
\`\`\`

You can configure the included extensions, or even disable a few of them, like shown below.

\`\`\`js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

const editor = new Editor({
  content: '<p>Example Text</p>',
  extensions: [
    StarterKit.configure({
      // Disable an included extension
      history: false,

      // Configure an included extension
      heading: {
        levels: [1, 2],
      },
    }),
  ],
})
\`\`\`

```

# editor\extensions\functionality\table-of-contents.mdx

```mdx
---
title: Table of Contents extension
tags:
  - type: pro
meta:
  title: Contents extension | Tiptap Editor Docs
  description: Integrate a list of anchors to your document and collect all headlines in a nice TOC (Table of Contents). Learn more in the docs!
  category: Editor
extension:
  name: Table of contents
  description: Add a table of contents listing all your anchors or headlines.
  type: extension
  icon: List
  isPro: true
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

The `TableOfContents` extension lets you get a list of anchors from your document and passes on important information about each anchor (for example the depth, the content and a unique ID for each heading but also the active state and scroll states for each anchor). This can be used to render the table of content on your own.

<CodeDemo isPro path="/Extensions/TableOfContents" />

## Install

<Callout title="Set up access to Tiptap's private repository" variant="info">
  Integrate this pro extension by registering for a free [Tiptap
  account](https://cloud.tiptap.dev/register) and following our [access
  guide](/guides/pro-extensions) to Tiptap’s private repository.
</Callout>

Once done, you can install the extension from our private registry:

\`\`\`bash
npm install @tiptap-pro/extension-table-of-contents
\`\`\`

## Settings

### anchorTypes

The types of the nodes you want to use for your Table of Content. By default this is `["heading"]` but in case you create your own custom Heading extension OR extend the existing one and use a different name, you can pass that name here.

Default: `["heading"]`

\`\`\`js
TableOfContents.configure({
  anchorTypes: ['heading', 'customAnchorType'],
})
\`\`\`

### getIndex

This option can be used to customize how the item indexes are calculated. By default this is using an internal function but it can be overwritten to do some custom logic.

\`\`\`js
TableOfContents.configure({
  getIndex: (anchor, previousAnchors, level) => {
    // do some custom logic, but for this example we will just return 1
    return 1
  },
})
\`\`\`

We expose two ready to use functions - one to generate linear indexes which continue to count from 1 to n and one to generate hierarchical indexes that will count from 1 to n for each level.

\`\`\`js
import { getLinearIndexes, getHierarchicalIndexes } from '@tiptap-pro/extension-table-of-contents'

// generate linear indexes
TableOfContents.configure({
  getIndex: getLinearIndexes,
})

// generate hierarchical indexes
TableOfContents.configure({
  getIndex: getHierarchicalIndexes,
})
\`\`\`

### getLevel

This option can be used to customize how item levels are generated. By default the normal level generation is used that checks for heading element level attributes. If you want to customize this because for example you want to include custom anchors in your heading generation, you can use this to do so.

\`\`\`js
TableOfContents.configure({
  getLevel: (anchor, previousAnchors) => {
    // do some custom logic, but for this example we will just return 1
    return 1
  },
})
\`\`\`

### getId

A builder function that returns a unique ID for each heading. Inside the argument you get access to the headings text content (for example you want to generate IDs based on the text content of the heading).

By default this is a function that uses the [uuid](https://www.npmjs.com/package/uuid) package to generate a unique ID.

Default: `() => uuid()`

\`\`\`js
// here we use an imaginary "slugify" function
// you should probably also add a unique identifier to the slug
TableOfContents.configure({
  getId: (content) => slugify(content),
})
\`\`\`

### scrollParent

The scroll parent you want to attach to. This is used to determine which heading currently is active or was already scrolled over. By default this is a callback function that returns the window but you can pass a callback that returns any HTML element here.

Default: `() => window`

\`\`\`js
// For example the editors DOM element itself is the scrolling element
TableOfContents.configure({
  scrollParent: () => editor.view.dom,
})
\`\`\`

### onUpdate

The most important option that you must set to use this extension. This is a callback function that gets called whenever the Table of Content updates. You get access to an array of heading data (see below) which you can use to render your own Table of Content.

To render the table of content you can render it by any means you want. You can use a framework like Vue, React or Svelte or you can use a simple templating engine like Handlebars or Pug. You can also use a simple `document.createElement` to render the table of content.

You can pass a second argument to get the information whether this is the initial creation step for the ToC data.

Default: `undefined`

\`\`\`js
// with vanilla JS
const tocElement = document.createElement('div')
document.body.appendChild(tocElement)

TableOfContents.configure({
  onUpdate: (anchors, isCreate) => {
    tocElement.innerHTML = ''

    if (isCreate) {
      console.log('This is the inital creation step for the ToC data')
    }

    anchors.forEach((anchor) => {
      const anchorElement = document.createElement('div')

      anchorElement.innerHTML = anchor.content
      anchorElement.dataset.id = anchor.id
      anchorElement.dataset.depth = anchor.depth
      anchorElement.dataset.active = anchor.active
      anchorElement.dataset.scrolled = anchor.scrolled

      tocElement.appendChild(anchorElement)
    })
  },
})
\`\`\`

\`\`\`js
// with react
const [anchors, setAnchors] = useState([])

// inside the useEditor hook you could then do something like that:
TableOfContents.configure({
  onUpdate: (anchors) => {
    setAnchors(anchors)
  },
})
\`\`\`

\`\`\`js
// with vue
const anchors = ref([])

TableOfContents.configure({
  onUpdate: (anchors) => {
    anchors.value = anchors
  },
})
\`\`\`

## Storage

### content

The heading content of the current document

\`\`\`js
editor.storage.tableOfContents.content
\`\`\`

### anchors

An array of HTML nodes

\`\`\`js
editor.storage.tableOfContents.anchors
\`\`\`

### scrollHandler

The scrollHandler used by the scroll function. Should not be changed or edited but
could be used to manually bind this function somewhere else

\`\`\`js
editor.storage.tableOfContents.scrollHandler()
\`\`\`

### scrollPosition

The current scrollPosition inside the scrollParent.

\`\`\`js
editor.storage.tableOfContents.scrollPosition
\`\`\`

## The anchors array

The array returned by the storage or the `onUpdate` function includes objects structured like this:

\`\`\`js
{
  dom: HTMLElement // the HTML element for this anchor
  editor: Editor // the editor
  id: string // the node id
  isActive: boolean // whether this anchor is currently active
  isScrolledOver: boolean // whether this anchor was already scrolled over
  itemIndex: number // the index of the item on its current level
  level: number // the current level of the item - this could be different from the actual anchor level and is used to render the hierarchy from high to low headlines
  node: Node // the ProseMirror node for this anchor
  originalLevel: number // the actual level
  pos: number // the position of the anchor node
  textContent: string // the text content of the anchor
}
\`\`\`

This should give you enough flexibility to render your own table of content.

```

# editor\extensions\functionality\textalign.mdx

```mdx
---
title: TextAlign extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-text-align.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-text-align
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-text-align.svg
    url: https://npmcharts.com/compare/@tiptap/extension-text-align?minimal=true
    label: Downloads
meta:
  title: TextAlign extension | Tiptap Editor Docs
  description: Left, right, center, whatever! Align the text however you like with the Text Align extension. More in the docs!
  category: Editor
extension:
  name: Text Align
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-text-align
  description: Left, right, center, whatever! Align the text however you like.
  type: extension
  icon: AlignCenter
---

import { Callout } from '@/components/ui/Callout'

import { CodeDemo } from '@/components/CodeDemo'

This extension adds a text align attribute to a specified list of nodes. The attribute is used to align the text.

<Callout title="Firefox bug" variant="default">
  `text-align: justify` doesn’t work together with `white-space: pre-wrap` in Firefox, [that’s a
  known issue](https://bugzilla.mozilla.org/show_bug.cgi?id=1253840).
</Callout>

<CodeDemo path="/Extensions/TextAlign" />

## Install

\`\`\`bash
npm install @tiptap/extension-text-align
\`\`\`

## Settings

### types

A list of nodes where the text align attribute should be applied to. Usually something like `['heading', 'paragraph']`.

Default: `[]`

\`\`\`js
TextAlign.configure({
  types: ['heading', 'paragraph'],
})
\`\`\`

### alignments

A list of available options for the text align attribute.

Default: `['left', 'center', 'right', 'justify']`

\`\`\`js
TextAlign.configure({
  alignments: ['left', 'right'],
})
\`\`\`

### defaultAlignment

The default text align.

Default: `null`

\`\`\`js
TextAlign.configure({
  defaultAlignment: 'right',
})
\`\`\`

## Commands

### setTextAlign()

Set the text align to the specified value.

\`\`\`js
editor.commands.setTextAlign('right')
\`\`\`

### unsetTextAlign()

Remove the text align value.

\`\`\`js
editor.commands.unsetTextAlign()
\`\`\`

## Keyboard shortcuts

| Command               | Windows/Linux                                     | macOS                                            |
| --------------------- | ------------------------------------------------- | ------------------------------------------------ |
| setTextAlign(left)    | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>L</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>L</kbd> |
| setTextAlign(center)  | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>E</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>E</kbd> |
| setTextAlign(right)   | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd> |
| setTextAlign(justify) | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>J</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>J</kbd> |

## Source code

[packages/extension-text-align/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-text-align/)

```

# editor\extensions\functionality\typography.mdx

```mdx
---
title: Typography extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-typography.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-typography
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-typography.svg
    url: https://npmcharts.com/compare/@tiptap/extension-typography?minimal=true
    label: Downloads
meta:
  title: Typography Extension | Tiptap Editor Docs
  description: Replace common text patterns with typographic characters with the typography extension in your editor. More in the docs!
  category: Editor
extension:
  name: Typography
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-typography
  description: The typography expert for your editor, fixing everything that’s wrong.
  type: extension
  icon: Type
---

import { CodeDemo } from '@/components/CodeDemo'

This extension tries to help with common text patterns with the correct typographic character. Under the hood all rules are input rules.

<CodeDemo path="/Extensions/Typography" />

## Install

\`\`\`bash
npm install @tiptap/extension-typography
\`\`\`

## Rules

| Name                | Description                                                      |
| ------------------- | ---------------------------------------------------------------- |
| emDash              | Converts double dashes `--` to an emdash `—`.                    |
| ellipsis            | Converts three dots `...` to an ellipsis character `…`           |
| openDoubleQuote     | `“`Smart” opening double quotes.                                 |
| closeDoubleQuote    | “Smart`”` closing double quotes.                                 |
| openSingleQuote     | `‘`Smart’ opening single quotes.                                 |
| closeSingleQuote    | ‘Smart`’` closing single quotes.                                 |
| leftArrow           | Converts `<-` to an arrow `←` .                                  |
| rightArrow          | Converts `->` to an arrow `→`.                                   |
| copyright           | Converts `(c)` to a copyright sign `©`.                         |
| registeredTrademark | Converts `(r)` to registered trademark sign `®`.                |
| trademark           | Converts `(tm)` to registered trademark sign `™`.               |
| servicemark         | Converts `(sm)` to registered trademark sign `℠`.                |
| oneHalf             | Converts `1/2` to one half `½`.                                  |
| oneQuarter          | Converts `1/4` to one quarter `¼`.                               |
| threeQuarters       | Converts `3/4` to three quarters `¾`.                            |
| plusMinus           | Converts `+/-` to plus/minus sign `±`.                           |
| notEqual            | Converts `!=` to a not equal sign `≠`.                           |
| laquo               | Converts `<<` to left-pointing double angle quotation mark `«`.  |
| raquo               | Converts `>>` to right-pointing double angle quotation mark `»`. |
| multiplication      | Converts `2*3` or `2x3` to a multiplcation sign `2×3`.           |
| superscriptTwo      | Converts `^2` a superscript two `²`.                             |
| superscriptThree    | Converts `^3` a superscript three `³`.                           |

## Keyboard shortcuts

| Command         | Windows/Linux        | macOS             |
| --------------- | -------------------- | ----------------- |
| undoInputRule() | <kbd>Backspace</kbd> | <kbd>Delete</kbd> |

## Source code

[packages/extension-typography/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-typography/)

### Disabling rules

You can configure the included rules, or even disable a few of them, like shown below.

\`\`\`js
import { Editor } from '@tiptap/core'
import Typography from '@tiptap/extension-typography'

const editor = new Editor({
  extensions: [
    // Disable some included rules
    Typography.configure({
      oneHalf: false,
      oneQuarter: false,
      threeQuarters: false,
    }),
  ],
})
\`\`\`

### Overriding rules

You can override the output of a rule by passing a string to the option you want to override.

\`\`\`js
import { Editor } from '@tiptap/core'
import Typography from '@tiptap/extension-typography'

const editor = new Editor({
  extensions: [
    // Disable some included rules
    Typography.configure({
      oneHalf: '1 / 2', // this will insert "1 / 2" instead of the default "½"
    }),
  ],
})
\`\`\`

```

# editor\extensions\functionality\undo-redo.mdx

```mdx
---
title: Undo/Redo extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-history.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-history
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-history.svg
    url: https://npmcharts.com/compare/@tiptap/extension-history?minimal=true
    label: Downloads
meta:
  title: Undo/Redo extension | Tiptap Editor Docs
  description: Undo and redo changes in your Tiptap Editor with ease, allowing you to revert or reapply edits in your editor. More in the docs.
  category: Editor
extension:
  name: Undo/Redo
  description: Undo and redo changes in your Tiptap Editor with ease, allowing you to revert or reapply edits in your editor.
  type: extension
  icon: Undo2
---

import { CodeDemo } from '@/components/CodeDemo'

This extension provides undo and redo support. All changes to the document will be tracked and can be removed with `undo`. Undone changes can be applied with `redo` again.

You should only integrate this extension if you don't plan to make your editor collaborative. The Collaboration extension has its own undo/redo support because people generally don't want to revert changes made by others.

<CodeDemo path="/Extensions/History" />

## Install

\`\`\`bash
npm install @tiptap/extension-history
\`\`\`

## Settings

### depth

The amount of history events that are collected before the oldest events are discarded.

Default: `100`

\`\`\`js
History.configure({
  depth: 10,
})
\`\`\`

### newGroupDelay

The delay between changes after which a new group should be started (in milliseconds). When changes aren’t adjacent, a new group is always started.

Default: `500`

\`\`\`js
History.configure({
  newGroupDelay: 1000,
})
\`\`\`

## Commands

### undo()

Undo the last change.

\`\`\`js
editor.commands.undo()
\`\`\`

### redo()

Redo the last change.

\`\`\`js
editor.commands.redo()
\`\`\`

## Keyboard shortcuts

| Command | Windows/Linux                                                                                                                                     | macOS                                                                                                                                 |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| undo()  | <kbd>Control</kbd> + <kbd>Z</kbd> or <kbd>Control</kbd> + <kbd>я</kbd>                                                                            | <kbd>Cmd</kbd> + <kbd>Z</kbd> + or <kbd>Cmd</kbd> + <kbd>я</kbd>                                                                      |
| redo()  | <kbd>Shift</kbd> + <kbd>Control</kbd> + <kbd>Z</kbd> or <kbd>Control</kbd> + <kbd>Y</kbd> or <kbd>Shift</kbd> + <kbd>Control</kbd> + <kbd>я</kbd> | <kbd>Shift</kbd> + <kbd>Cmd</kbd> + <kbd>Z</kbd> or <kbd>Cmd</kbd> + <kbd>Y</kbd> or <kbd>Shift</kbd> + <kbd>Cmd</kbd> + <kbd>я</kbd> |

## Source code

[packages/extension-history/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-history/)

```

# editor\extensions\functionality\uniqueid.mdx

```mdx
---
title: UniqueID extension
tags:
  - type: pro
meta:
  title: UniqueID extension | Tiptap Editor Docs
  description: Add a unique ID to every single node and keep track of them with the UniqueID extension. More in the docs!
  category: Editor
extension:
  name: UniqueID
  description: Add a unique ID to every single node and keep track of them.
  type: extension
  icon: Hash
  isPro: true
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

The `UniqueID` extension adds unique IDs to all nodes. The extension keeps track of your nodes, even if you split them, merge them, undo/redo changes, crop content, paste content … It just works.
Also, you can configure which node types get an unique ID, and which not, and you can customize how those IDs are generated.

<CodeDemo isPro path="/Extensions/UniqueID" />

## Install

<Callout title="Set up access to Tiptap's private repository" variant="info">
  Integrate this pro extension by registering for a free [Tiptap
  account](https://cloud.tiptap.dev/register) and following our [access
  guide](/guides/pro-extensions) to Tiptap’s private repository.
</Callout>
Once done, you can install the extension from our private registry:

\`\`\`bash
npm install @tiptap-pro/extension-unique-id
\`\`\`

## Settings

### attributeName

Name of the attribute that is attached to the HTML tag (will be prefixed with `data-`).

Default: `'id'`

\`\`\`js
UniqueID.configure({
  attributeName: 'uid',
})
\`\`\`

### types

All types that should get a unique ID, for example `['heading', 'paragraph']`

Default: `[]`

\`\`\`js
UniqueID.configure({
  types: ['heading', 'paragraph'],
})
\`\`\`

### generateID

A function that generates and returns a unique ID.

Default: `() => uuidv4()`

### filterTransaction

Ignore some mutations, for example applied from other users through the collaboration plugin.

Default: `null`

\`\`\`js
import { isChangeOrigin } from '@tiptap/extension-collaboration'

// Adds support for collaborative editing
UniqueID.configure({
  filterTransaction: (transaction) => !isChangeOrigin(transaction),
})
\`\`\`

```

# editor\extensions\marks\bold.mdx

```mdx
---
title: Bold extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-bold.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-bold
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-bold.svg
    url: https://npmcharts.com/compare/@tiptap/extension-bold?minimal=true
    label: Downloads
extension:
  name: Bold
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-bold
  description: 'Make your text bold and let it stand out.'
  type: mark
  icon: Bold
meta:
  title: Bold extension | Tiptap Editor Docs
  description: Use the Bold extension in Tiptap to make your text bold and let it stand out. Learn more in our docs!
  category: Editor
---

import { Callout } from '@/components/ui/Callout'
import { CodeDemo } from '@/components/CodeDemo'

Use this extension to render text in **bold**. If you pass `<strong>`, `<b>` tags, or text with inline `style` attributes setting the `font-weight` CSS rule in the editor’s initial content, they all will be rendered accordingly.

Type `**two asterisks**` or `__two underlines__` and it will magically transform to **bold** text while you type.

<CodeDemo path="/Marks/Bold" />

<Callout title="Restrictions" variant="default">
    The extension will generate the corresponding `<strong>` HTML tags when reading contents of the `Editor` instance. All text marked bold, regardless of the method will be normalized to `<strong>` HTML tags.
</Callout>

## Install

\`\`\`bash
npm install @tiptap/extension-bold
\`\`\`

## Settings

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

\`\`\`js
Bold.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
\`\`\`

## Commands

### setBold()

Mark text as bold.

\`\`\`js
editor.commands.setBold()
\`\`\`

### toggleBold()

Toggle the bold mark.

\`\`\`js
editor.commands.toggleBold()
\`\`\`

### unsetBold()

Remove the bold mark.

\`\`\`js
editor.commands.unsetBold()
\`\`\`

## Keyboard shortcuts

| Command      | Windows/Linux                     | macOS                         |
| ------------ | --------------------------------- | ----------------------------- |
| toggleBold() | <kbd>Control</kbd> + <kbd>B</kbd> | <kbd>Cmd</kbd> + <kbd>B</kbd> |

## Source code

[packages/extension-bold/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-bold/)

```

# editor\extensions\marks\code.mdx

```mdx
---
title: Code extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-code.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-code
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-code.svg
    url: https://npmcharts.com/compare/@tiptap/extension-code?minimal=true
    label: Downloads
extension:
  name: Code
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-code
  description: 'Developers love to add some inline code to their texts.'
  type: mark
  icon: Code
meta:
  title: Code extension | Tiptap Editor Docs
  description: Use the Code extension in your Tiptap Editor to add inline code to your texts. Learn more in our docs!
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'

The Code extensions enables you to use the `<code>` HTML tag in the editor. If you paste in text with `<code>` tags it will rendered accordingly.

Type something with <code>\`back-ticks around\`</code> and it will magically transform to `inline code` while you type.

<CodeDemo path="/Marks/Code" />

## Install

\`\`\`bash
npm install @tiptap/extension-code
\`\`\`

## Settings

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

\`\`\`js
Code.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
\`\`\`

## Commands

### setCode()

Mark text as inline code.

\`\`\`js
editor.commands.setCode()
\`\`\`

### toggleCode()

Toggle inline code mark.

\`\`\`js
editor.commands.toggleCode()
\`\`\`

### unsetCode()

Remove inline code mark.

\`\`\`js
editor.commands.unsetCode()
\`\`\`

## Keyboard shortcuts

| Command      | Windows/Linux                     | macOS                         |
| ------------ | --------------------------------- | ----------------------------- |
| toggleCode() | <kbd>Control</kbd> + <kbd>E</kbd> | <kbd>Cmd</kbd> + <kbd>E</kbd> |

## Source code

[packages/extension-code/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-code/)

```

# editor\extensions\marks\highlight.mdx

```mdx
---
title: Highlight extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-highlight.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-highlight
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-highlight.svg
    url: https://npmcharts.com/compare/@tiptap/extension-highlight?minimal=true
    label: Downloads
extension:
  name: Highlight
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-highlight
  description: Make it look nerdier with some colorful text highlights.
  type: mark
  icon: PenLine
meta:
  title: Highlight extension | Tiptap Editor Docs
  description: Use the Highlight extension in your Tiptap Editor to add colorful text highlights. Learn more in our docs!
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'

Use this extension to render highlighted text with `<mark>`. You can use only default `<mark>` HTML tag, which has a yellow background color by default, or apply different colors.

Type `==two equal signs==` and it will magically transform to <mark>highlighted</mark> text while you type.

<CodeDemo path="/Marks/Highlight" />

## Install

\`\`\`bash
npm install @tiptap/extension-highlight
\`\`\`

## Settings

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

\`\`\`js
Highlight.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
\`\`\`

### multicolor

Add support for multiple colors.

Default: `false`

\`\`\`js
Highlight.configure({
  multicolor: true,
})
\`\`\`

## Commands

### setHighlight()

Mark text as highlighted.

\`\`\`js
editor.commands.setHighlight()
editor.commands.setHighlight({ color: '#ffcc00' })
\`\`\`

### toggleHighlight()

Toggle a text highlight.

\`\`\`js
editor.commands.toggleHighlight()
editor.commands.toggleHighlight({ color: '#ffcc00' })
\`\`\`

### unsetHighlight()

Removes the highlight.

\`\`\`js
editor.commands.unsetHighlight()
\`\`\`

## Keyboard shortcuts

| Command           | Windows/Linux                                        | macOS                                            |
| ----------------- | ---------------------------------------------------- | ------------------------------------------------ |
| toggleHighlight() | <kbd>Control</kbd> + <kbd>Shift</kbd> + <kbd>H</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>H</kbd> |

## Source code

[packages/extension-highlight/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-highlight/)

```

# editor\extensions\marks\index.mdx

```mdx
---
title: Mark extensions
sidebars:
  hideSecondary: true
meta:
  title: Mark extensions | Tiptap Editor Docs
  description: Learn about all the mark extensions you can use in your Tiptap Editor like bold, code, link and more. Learn more in the docs!
  category: Editor
---

import { Extensions } from '@/components/Extensions'

Learn about mark extensions like `Bold`, `Code`, `Link`, and more to improve your users’ text editor experience in Tiptap.

<Extensions path="content/editor/extensions/marks" hideAll hideFree />

```

# editor\extensions\marks\italic.mdx

```mdx
---
title: Italic extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-italic.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-italic
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-italic.svg
    url: https://npmcharts.com/compare/@tiptap/extension-italic?minimal=true
    label: Downloads
extension:
  name: Italic
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-italic
  icon: Italic
  description: Helps to emphasize your text; it doesn’t bring you closer to Italy, though.
  type: mark
meta:
  title: Italic extension | Tiptap Editor Docs
  description: Use the Italic extension in your Tiptap Editor to emphasize your text with italics. Learn more in our docs!
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

Use this extension to render text in _italic_. If you pass `<em>`, `<i>` tags, or text with inline `style` attributes setting `font-style: italic` in the editor’s initial content, they all will be rendered accordingly.

Type `*one asterisk*` or `_one underline_` and it will magically transform to _italic_ text while you type.

<CodeDemo path="/Marks/Italic" />

<Callout title="Restrictions" variant="default">
    The extension will generate the corresponding `<em>` HTML tags when reading contents of the `Editor` instance. All text marked italic, regardless of the method will be normalized to `<em>` HTML tags.
</Callout>

## Install

\`\`\`bash
npm install @tiptap/extension-italic
\`\`\`

## Settings

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

\`\`\`js
Italic.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
\`\`\`

## Commands

### setItalic()

Mark the text italic.

\`\`\`js
editor.commands.setItalic()
\`\`\`

### toggleItalic()

Toggle the italic mark.

\`\`\`js
editor.commands.toggleItalic()
\`\`\`

### unsetItalic()

Remove the italic mark.

\`\`\`js
editor.commands.unsetItalic()
\`\`\`

## Keyboard shortcuts

| Command        | Windows/Linux                     | macOS                         |
| -------------- | --------------------------------- | ----------------------------- |
| toggleItalic() | <kbd>Control</kbd> + <kbd>I</kbd> | <kbd>Cmd</kbd> + <kbd>I</kbd> |

## Source code

[packages/extension-italic/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-italic/)

```

# editor\extensions\marks\link.mdx

```mdx
---
title: Link extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-link.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-link
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-link.svg
    url: https://npmcharts.com/compare/@tiptap/extension-link?minimal=true
    label: Downloads
extension:
  name: Link
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-link
  description: 'Link it, link it good, link it real good (and don’t forget the href).'
  type: mark
  icon: Link
meta:
  title: Link extension | Tiptap Editor Docs
  description: Learn how to use the Link extension in Tiptap to add support for <a> tags. Discover more in our docs!
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

The Link extension adds support for `<a>` tags to the editor. The extension is headless too, there is no actual UI to add, modify or delete links. The usage example below uses the native JavaScript prompt to show you how that could work.

In a real world application, you would probably add a more sophisticated user interface.

Pasted URLs will be transformed to links automatically.

<CodeDemo path="/Marks/Link" />

## Install

\`\`\`bash
npm install @tiptap/extension-link
\`\`\`

## Settings

### protocols

Additional custom protocols you would like to be recognized as links.

Default: `[]`

\`\`\`js
Link.configure({
  protocols: ['ftp', 'mailto'],
})
\`\`\`

By default, [linkify](https://linkify.js.org/docs/) adds `//` to the end of a protocol however this behavior can be changed by passing `optionalSlashes` option

\`\`\`js
Link.configure({
  protocols: [
    {
      scheme: 'tel',
      optionalSlashes: true,
    },
  ],
})
\`\`\`

### autolink

If enabled, it adds links as you type.

Default: `true`

\`\`\`js
Link.configure({
  autolink: false,
})
\`\`\`

### openOnClick

If enabled, links will be opened on click.

Default: `true`

\`\`\`js
Link.configure({
  openOnClick: false,
})
\`\`\`

### linkOnPaste

Adds a link to the current selection if the pasted content only contains an url.

Default: `true`

\`\`\`js
Link.configure({
  linkOnPaste: false,
})
\`\`\`

### defaultProtocol

The default protocol used by `linkOnPaste` and `autolink` when no protocol is defined.

By default, the href generated for example.com is http://example.com and this option allows that protocol to be customized.

Default: `http`

\`\`\`js
Link.configure({
  defaultProtocol: 'https',
})
\`\`\`

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

\`\`\`js
Link.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
\`\`\`

#### Removing and overriding existing html attributes

You can add `rel: null` to HTMLAttributes to remove the default `rel="noopener noreferrer nofollow"`. You can also override the default by using `rel: "your-value"`.

This can also be used to change the `target` from the default value of `_blank`.

\`\`\`js
Link.configure({
  HTMLAttributes: {
    // Change rel to different value
    // Allow search engines to follow links(remove nofollow)
    rel: 'noopener noreferrer',
    // Remove target entirely so links open in current tab
    target: null,
  },
})
\`\`\`

### isAllowedUri

A function that allows customization of link validation, modifying the default verification logic. This function accepts the URL and a context object with additional properties.

**Parameters:**

- `url`: The URL to validate.
- `ctx`: An object containing:
  - `defaultValidate`: A function that performs the default URL validation.
  - `protocols`: An array of allowed protocols for the URL, e.g., `["http", "https"]`.
  - `defaultProtocol`: The default protocol (e.g., `'http'`).

**Returns:** `boolean` - `true` if the URL is valid, `false` otherwise.

This function enables you to enforce rules on allowed protocols or domains when autolinking URLs.

\`\`\`js
// Validate URLs to only accept non-relative URLs
Link.configure({
  isAllowedUri: (url, ctx) => ctx.defaultValidate(url) && !url.startsWith('./'),
})
\`\`\`

### validate (deprecated)

This function has been deprecated in favor of the more descriptive `shouldAutoLink` function. If provided, the `validate` function will replace the `shouldAutoLink` function.

### shouldAutoLink

Defines whether a valid link should be automatically linked within the editor content.

**Parameters:**

- `url`: The URL that has already passed validation.

**Returns:** `boolean` - `true` if the link should be auto-linked, `false` if it should not.

Use this function to control autolinking behavior based on the URL.

\`\`\`js
// Example: Auto-link only if the URL is secure
Link.configure({
  shouldAutoLink: (url) => url.startsWith('https://'),
})
\`\`\`

## Commands

### setLink()

Links the selected text.

\`\`\`js
editor.commands.setLink({ href: 'https://example.com' })
editor.commands.setLink({ href: 'https://example.com', target: '_blank' })
\`\`\`

### toggleLink()

Adds or removes a link from the selected text.

\`\`\`js
editor.commands.toggleLink({ href: 'https://example.com' })
editor.commands.toggleLink({ href: 'https://example.com', target: '_blank' })
\`\`\`

### unsetLink()

Removes a link.

\`\`\`js
editor.commands.unsetLink()
\`\`\`

## Keyboard shortcuts

<Callout title="No keyboard shortcut" variant="default">
  This extension doesn’t bind a specific keyboard shortcut. You would probably open your custom UI
  on `Mod-k` though.
</Callout>

## Get the current value

Did you know that you can use [`getAttributes`](/editor/api/editor#getattributes) to find out which attributes, for example which href, is currently set? Don’t confuse it with a [command](/editor/api/commands) (which changes the state), it’s just a method. Here is how that could look like:

\`\`\`js
this.editor.getAttributes('link').href
\`\`\`

## Source code

[packages/extension-link/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-link/)

```

# editor\extensions\marks\strike.mdx

```mdx
---
title: Strike extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-strike.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-strike
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-strike.svg
    url: https://npmcharts.com/compare/@tiptap/extension-strike?minimal=true
    label: Downloads
extension:
  name: Strike
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-strike
  description: Cut through the words you wrote if you’re too afraid to delete them.
  type: mark
  icon: Strikethrough
meta:
  title: Strike extension | Tiptap Editor Docs
  description: Learn how to use the Strike extension in Tiptap to cut through the words you wrote if you're too afraid to delete it.
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

Use this extension to render ~~striked text~~. If you pass `<s>`, `<del>`, `<strike>` tags, or text with inline `style` attributes setting `text-decoration: line-through` in the editor’s initial content, they all will be rendered accordingly.

Type <code>~~ text between tildes ~~</code> and it will be magically ~~striked through~~ while you type.

<Callout title="Restrictions" variant="default">
    The extension will generate the corresponding `<s>` HTML tags when reading contents of the `Editor` instance. All text striked through, regardless of the method will be normalized to `<s>` HTML tags.
</Callout>

<CodeDemo path="/Marks/Strike" />

## Install

\`\`\`bash
npm install @tiptap/extension-strike
\`\`\`

## Settings

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

\`\`\`js
Strike.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
\`\`\`

## Commands

### setStrike()

Mark text as striked.

\`\`\`js
editor.commands.setStrike()
\`\`\`

### toggleStrike()

Toggle strike mark.

\`\`\`js
editor.commands.toggleStrike()
\`\`\`

### unsetStrike()

Remove strike mark.

\`\`\`js
editor.commands.unsetStrike()
\`\`\`

## Keyboard shortcuts

| Command        | Windows/Linux                                        | macOS                                            |
| -------------- | ---------------------------------------------------- | ------------------------------------------------ |
| toggleStrike() | <kbd>Control</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> |

## Source code

[packages/extension-strike/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-strike/)

```

# editor\extensions\marks\subscript.mdx

```mdx
---
title: Subscript extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-subscript.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-subscript
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-subscript.svg
    url: https://npmcharts.com/compare/@tiptap/extension-subscript?minimal=true
    label: Downloads
extension:
  name: Subscript
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-subscript
  description: Write slightly below the normal line to make a statement.
  type: mark
  icon: Subscript
meta:
  title: Subscript extension | Tiptap Editor Docs
  description: Learn how to use the Subscript extension in Tiptap to write slightly below the normal line and show your unique style.
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

Use this extension to render text in <sub>subscript</sub>. If you pass `<sub>` or text with `vertical-align: sub` as inline style in the editor’s initial content, both will be rendered accordingly.

<Callout title="Restrictions" variant="default">
    The extension will generate the corresponding `<sub>` HTML tags when reading contents of the `Editor` instance. All text in subscript, regardless of the method will be normalized to `<sub>` HTML tags.
</Callout>

<CodeDemo path="/Marks/Subscript" />

## Install

\`\`\`bash
npm install @tiptap/extension-subscript
\`\`\`

## Settings

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

\`\`\`js
Subscript.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
\`\`\`

## Commands

### setSubscript()

Mark text as subscript.

\`\`\`js
editor.commands.setSubscript()
\`\`\`

### toggleSubscript()

Toggle subscript mark.

\`\`\`js
editor.commands.toggleSubscript()
\`\`\`

### unsetSubscript()

Remove subscript mark.

\`\`\`js
editor.commands.unsetSubscript()
\`\`\`

## Keyboard shortcuts

| Command           | Windows/Linux                     | macOS                         |
| ----------------- | --------------------------------- | ----------------------------- |
| toggleSubscript() | <kbd>Control</kbd> + <kbd>,</kbd> | <kbd>Cmd</kbd> + <kbd>,</kbd> |

## Source code

[packages/extension-subscript/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-subscript/)

```

# editor\extensions\marks\superscript.mdx

```mdx
---
title: Superscript extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-superscript.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-superscript
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-superscript.svg
    url: https://npmcharts.com/compare/@tiptap/extension-superscript?minimal=true
    label: Downloads
extension:
  name: Superscript
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-superscript
  description: Write slightly above the normal line to show you’re on the next level.
  type: mark
  icon: Superscript
meta:
  title: Superscript extension | Tiptap Editor Docs
  description: Use the Superscript extension in Tiptap to write text above the normal line. Learn more in our docs!
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

Use this extension to render text in <sup>superscript</sup>. If you pass `<sup>` or text with `vertical-align: super` as inline style in the editor’s initial content, both will be rendered accordingly.

<Callout title="Restrictions" variant="default">
    The extension will generate the corresponding `<sup>` HTML tags when reading contents of the `Editor` instance. All text in superscript, regardless of the method will be normalized to `<sup>` HTML tags.
</Callout>

<CodeDemo path="/Marks/Superscript" />

## Install

\`\`\`bash
npm install @tiptap/extension-superscript
\`\`\`

## Settings

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

\`\`\`js
Superscript.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
\`\`\`

## Commands

### setSuperscript()

Mark text as superscript.

\`\`\`js
editor.commands.setSuperscript()
\`\`\`

### toggleSuperscript()

Toggle superscript mark.

\`\`\`js
editor.commands.toggleSuperscript()
\`\`\`

### unsetSuperscript()

Remove superscript mark.

\`\`\`js
editor.commands.unsetSuperscript()
\`\`\`

## Keyboard shortcuts

| Command             | Windows/Linux                     | macOS                         |
| ------------------- | --------------------------------- | ----------------------------- |
| toggleSuperscript() | <kbd>Control</kbd> + <kbd>.</kbd> | <kbd>Cmd</kbd> + <kbd>.</kbd> |

## Source code

[packages/extension-superscript/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-superscript/)

```

# editor\extensions\marks\text-style.mdx

```mdx
---
title: TextStyle extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-text-style.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-text-style
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-text-style.svg
    url: https://npmcharts.com/compare/@tiptap/extension-text-style?minimal=true
    label: Downloads
extension:
  name: Text Style
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-text-style
  description: 'Otherwise useless, it adds <span> tags required by other extensions.'
  type: mark
  icon: Paintbrush
meta:
  title: TextStyle extension | Tiptap Editor Docs
  description: Use the Text Style extension in Tiptap to add <span> tags with custom styles. Learn more in our docs!
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'

This mark renders a `<span>` HTML tag and enables you to add a list of styling related attributes, for example font-family, font-size, or color. The extension doesn’t add any styling attribute by default, but other extensions use it as the foundation, for example [`FontFamily`](/editor/extensions/functionality/fontfamily) or [`Color`](/editor/extensions/functionality/color).

<CodeDemo path="/Marks/Textstyle" />

## Install

\`\`\`bash
npm install @tiptap/extension-text-style
\`\`\`

## Commands

### removeEmptyTextStyle()

Remove `<span>` tags without an inline style.

\`\`\`js
editor.command.removeEmptyTextStyle()
\`\`\`

## Source code

[packages/extension-text-style/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-text-style/)

```

# editor\extensions\marks\underline.mdx

```mdx
---
title: Underline extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-underline.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-underline
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-underline.svg
    url: https://npmcharts.com/compare/@tiptap/extension-underline?minimal=true
    label: Downloads
meta:
  title: Underline extension | Tiptap Editor Docs
  description: Add a line below your text to make it look more… underlined with the Tiptap’s… Underline extension. More in the docs!
  category: Editor
extension:
  name: Underline
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-underline
  description: Add a line below your text to make it look more… underlined.
  type: mark
  icon: Underline
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

Use this extension to render text <u>underlined</u>. If you pass `<u>` tags, or text with inline `style` attributes setting `text-decoration: underline` in the editor’s initial content, they all will be rendered accordingly.

Be aware that underlined text in the internet usually indicates that it’s a clickable link. Don’t confuse your users with underlined text.

<Callout title="Restrictions" variant="default">
    The extension will generate the corresponding `<u>` HTML tags when reading contents of the `Editor` instance. All text marked underlined, regardless of the method will be normalized to `<u>` HTML tags.
</Callout>

<CodeDemo path="/Marks/Underline" />

## Install

\`\`\`bash
npm install @tiptap/extension-underline
\`\`\`

## Settings

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

\`\`\`js
Underline.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
\`\`\`

## Commands

### setUnderline()

Marks a text as underlined.

\`\`\`js
editor.commands.setUnderline()
\`\`\`

### toggleUnderline()

Toggles an underline mark.

\`\`\`js
editor.commands.toggleUnderline()
\`\`\`

### unsetUnderline()

Removes an underline mark.

\`\`\`js
editor.commands.unsetUnderline()
\`\`\`

## Keyboard shortcuts

| Command           | Windows/Linux                     | macOS                         |
| ----------------- | --------------------------------- | ----------------------------- |
| toggleUnderline() | <kbd>Control</kbd> + <kbd>U</kbd> | <kbd>Cmd</kbd> + <kbd>U</kbd> |

## Source code

[packages/extension-underline/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-underline/)

```

# editor\extensions\nodes\blockquote.mdx

```mdx
---
title: Blockquote extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-blockquote.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-blockquote
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-blockquote.svg
    url: https://npmcharts.com/compare/@tiptap/extension-blockquote?minimal=true
    label: Downloads
extension:
  name: Blockquote
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-blockquote
  description: Quoting other people will make you look clever.
  type: node
  icon: TextQuote
meta:
  title: Blockquote extension | Tiptap Editor Docs
  description: Use the Blockquote extension in Tiptap to enable the quote HTML tag in the editor. Learn more in our docs!
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'

The Blockquote extension enables you to use the `<blockquote>` HTML tag in the editor. This is great to … show quotes in the editor, you know?

Type <code>&gt;&nbsp;</code> at the beginning of a new line and it will magically transform to a blockquote.

<CodeDemo path="/Nodes/Blockquote" />

## Install

\`\`\`bash
npm install @tiptap/extension-blockquote
\`\`\`

## Settings

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

\`\`\`js
Blockquote.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
\`\`\`

## Commands

### setBlockquote()

Wrap content in a blockquote.

\`\`\`js
editor.commands.setBlockquote()
\`\`\`

### toggleBlockquote()

Wrap or unwrap a blockquote.

\`\`\`js
editor.commands.toggleBlockquote()
\`\`\`

### unsetBlockquote()

Unwrap a blockquote.

\`\`\`js
editor.commands.unsetBlockquote()
\`\`\`

## Keyboard shortcuts

| Command           | Windows/Linux                                        | macOS                                            |
| ----------------- | ---------------------------------------------------- | ------------------------------------------------ |
| Toggle Blockquote | <kbd>Control</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd> |

## Source code

[packages/extension-blockquote/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-blockquote/)

```

# editor\extensions\nodes\bullet-list.mdx

```mdx
---
title: BulletList extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-bullet-list.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-bullet-list
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-bullet-list.svg
    url: https://npmcharts.com/compare/@tiptap/extension-bullet-list?minimal=true
    label: Downloads
extension:
  name: BulletList
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-bullet-list
  description: Everything looks more serious with a few bullet points.
  type: node
  icon: List
meta:
  title: BulletList extension | Tiptap Editor Docs
  description: Use the Bullet list extension to enable bullet lists in your Tiptap Editor. Learn more about lists in our docs!
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

This extension enables you to use bullet lists in the editor. They are rendered as `<ul>` HTML tags. Type <code>\* </code>, <code>- </code> or <code>+ </code> at the beginning of a new line and it will magically transform to a bullet list.

<CodeDemo path="/Nodes/BulletList" />

<Callout title="Modify backspace behavior" variant="info">
  If you want to modify the standard behavior of backspace and delete functions for lists, you
  should read about the [ListKeymap](/editor/extensions/functionality/listkeymap) extension.
</Callout>

## Install

\`\`\`bash
npm install @tiptap/extension-bullet-list @tiptap/extension-list-item
\`\`\`

This extension requires the [`ListItem`](/editor/extensions/nodes/list-item) node.

## Settings

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

\`\`\`js
BulletList.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
\`\`\`

### itemTypeName

Specify the list item name.

Default: `'listItem'`

\`\`\`js
BulletList.configure({
  itemTypeName: 'listItem',
})
\`\`\`

### keepMarks

Decides whether to keep the marks from a previous line after toggling the list either using `inputRule` or using the button

Default: `false`

\`\`\`js
BulletList.configure({
  keepMarks: true,
})
\`\`\`

### keepAttributes

Decides whether to keep the attributes from a previous line after toggling the list either using `inputRule` or using the button

Default: `false`

\`\`\`js
BulletList.configure({
  keepAttributes: true,
})
\`\`\`

## Commands

### toggleBulletList()

Toggles a bullet list.

\`\`\`js
editor.commands.toggleBulletList()
\`\`\`

## Keyboard shortcuts

| Command          | Windows/Linux                                        | macOS                                            |
| ---------------- | ---------------------------------------------------- | ------------------------------------------------ |
| toggleBulletList | <kbd>Control</kbd> + <kbd>Shift</kbd> + <kbd>8</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>8</kbd> |

## Source code

[packages/extension-bullet-list/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-bullet-list/)

```

# editor\extensions\nodes\code-block-lowlight.mdx

```mdx
---
title: CodeBlockLowlight extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-code-block-lowlight.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-code-block-lowlight
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-code-block-lowlight.svg
    url: https://npmcharts.com/compare/@tiptap/extension-code-block-lowlight?minimal=true
    label: Downloads
extension:
  name: CodeBlock Lowlight
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-code-block-lowlight
  description: Add some colorful syntax highlighting to your code blocks.
  type: node
  icon: Code
meta:
  title: CodeBlockLowlight extension | Tiptap Editor Docs
  description: Use the CodeBlockLowlight extension to add code blocks with syntax highlighting to your documents. Learn more in our docs!
  category: Editor
---

import { Callout } from '@/components/ui/Callout'
import { CodeDemo } from '@/components/CodeDemo'

With the CodeBlockLowlight extension you can add fenced code blocks to your documents. It’ll wrap the code in `<pre>` and `<code>` HTML tags.

<Callout title="Syntax highlight dependency" variant="warning">
  This extension relies on the [lowlight](https://github.com/wooorm/lowlight) library to apply
  syntax highlight to the code block’s content.
</Callout>

Type <code>&grave;&grave;&grave; </code> (three backticks and a space) or <code>&Tilde;&Tilde;&Tilde; </code> (three tildes and a space) and a code block is instantly added for you. You can even specify the language, try writing <code>&grave;&grave;&grave;css </code>. That should add a `language-css` class to the `<code>`-tag.

<CodeDemo path="/Nodes/CodeBlockLowlight" />

## Install

\`\`\`bash
npm install lowlight @tiptap/extension-code-block-lowlight
\`\`\`

## Settings

### lowlight

You should provide the `lowlight` module to this extension. Decoupling the `lowlight`
package from the extension allows the client application to control which
version of lowlight it uses and which programming language packages it needs to load.

\`\`\`js
import { lowlight } from 'lowlight/lib/core'

CodeBlockLowlight.configure({
  lowlight,
})
\`\`\`

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

\`\`\`js
CodeBlockLowlight.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
\`\`\`

### languageClassPrefix

Adds a prefix to language classes that are applied to code tags.

Default: `'language-'`

\`\`\`js
CodeBlockLowlight.configure({
  languageClassPrefix: 'language-',
})
\`\`\`

### defaultLanguage

Define a default language instead of the automatic detection of lowlight.

Default: `null`

\`\`\`js
CodeBlockLowlight.configure({
  defaultLanguage: 'plaintext',
})
\`\`\`

## Commands

### setCodeBlock()

Wrap content in a code block.

\`\`\`js
editor.commands.setCodeBlock()
\`\`\`

### toggleCodeBlock()

Toggle the code block.

\`\`\`js
editor.commands.toggleCodeBlock()
\`\`\`

## Keyboard shortcuts

| Command         | Windows/Linux                                      | macOS                                          |
| --------------- | -------------------------------------------------- | ---------------------------------------------- |
| toggleCodeBlock | <kbd>Control</kbd> + <kbd>Alt</kbd> + <kbd>C</kbd> | <kbd>Cmd</kbd> + <kbd>Alt</kbd> + <kbd>C</kbd> |

## Source code

[packages/extension-code-block-lowlight/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-code-block-lowlight/)

```

# editor\extensions\nodes\code-block.mdx

```mdx
---
title: CodeBlock extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-code-block.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-code-block
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-code-block.svg
    url: https://npmcharts.com/compare/@tiptap/extension-code-block?minimal=true
    label: Downloads
extension:
  name: CodeBlock
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-code-block
  description: The less code the better, but sometimes you just need multiple lines.
  type: node
  icon: Code
meta:
  title: CodeBlock extension | Tiptap Editor Docs
  description: Use the CodeBlock extension in Tiptap to add fenced code blocks to your documents. Learn more in our docs!
  category: Editor
---

import { Callout } from '@/components/ui/Callout'
import { CodeDemo } from '@/components/CodeDemo'

With the CodeBlock extension you can add fenced code blocks to your documents. It’ll wrap the code in `<pre>` and `<code>` HTML tags.

Type <code>&grave;&grave;&grave; </code> (three backticks and a space) or <code>&Tilde;&Tilde;&Tilde; </code> (three tildes and a space) and a code block is instantly added for you. You can even specify the language, try writing <code>&grave;&grave;&grave;css </code>. That should add a `language-css` class to the `<code>`-tag.

<Callout title="No syntax highlighting" variant="hint">
  The CodeBlock extension doesn’t come with styling and has no syntax highlighting built-in. Try the
  [CodeBlockLowlight](/editor/extensions/nodes/code-block-lowlight) extension if you’re looking for code blocks
  with syntax highlighting.
</Callout>

<CodeDemo path="/Nodes/CodeBlock" />

## Install

\`\`\`bash
npm install @tiptap/extension-code-block
\`\`\`

## Settings

### languageClassPrefix

Adds a prefix to language classes that are applied to code tags.

Default: `'language-'`

\`\`\`js
CodeBlock.configure({
  languageClassPrefix: 'language-',
})
\`\`\`

### exitOnTripleEnter

Define whether the node should be exited on triple enter.

Default: `true`

\`\`\`js
CodeBlock.configure({
  exitOnTripleEnter: false,
})
\`\`\`

### defaultLanguage

Define a default language instead of the automatic detection of lowlight.

Default: `null`

\`\`\`js
CodeBlock.configure({
  defaultLanguage: 'plaintext',
})
\`\`\`

### exitOnArrowDown

Define whether the node should be exited on arrow down if there is no node after it.

Default: `true`

\`\`\`js
CodeBlock.configure({
  exitOnArrowDown: false,
})
\`\`\`

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

\`\`\`js
CodeBlock.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
\`\`\`

## Commands

### setCodeBlock()

Wrap content in a code block.

\`\`\`js
editor.commands.setCodeBlock()
\`\`\`

### toggleCodeBlock()

Toggle the code block.

\`\`\`js
editor.commands.toggleCodeBlock()
\`\`\`

## Keyboard shortcuts

| Command         | Windows/Linux                                      | macOS                                          |
| --------------- | -------------------------------------------------- | ---------------------------------------------- |
| toggleCodeBlock | <kbd>Control</kbd> + <kbd>Alt</kbd> + <kbd>C</kbd> | <kbd>Cmd</kbd> + <kbd>Alt</kbd> + <kbd>C</kbd> |

## Source code

[packages/extension-code-block/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-code-block/)

```

# editor\extensions\nodes\details-content.mdx

```mdx
---
title: DetailsContent extension
icon: menu-unfold-line
extension:
  name: DetailsContent
  description: Add content to your details nodes.
  type: node
  icon: Text
  isPro: true
meta:
  title: DetailsContent extension | Tiptap Editor Docs
  description: Show and hide content with the Details and DetailsContent extension in your Tiptap Editor. Great to… toggle hiding content!
  category: Editor
tags:
  - type: pro
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

The Details extension enables you to use the `<details>` HTML tag in the editor. This is great to show and hide content.

<CodeDemo isPro path="/Nodes/Details" />

## Install

<Callout title="Set up access to Tiptap's private repository" variant="info">
  Integrate this pro extension by registering a free [Tiptap
  account](https://cloud.tiptap.dev/register) and following our [access
  guide](/guides/pro-extensions) to Tiptap’s private repository.
</Callout>

\`\`\`bash
npm install @tiptap-pro/extension-details-content
\`\`\`

This extension requires the [`Details`](/editor/extensions/nodes/details) and [`DetailsSummary`](/editor/extensions/nodes/details-summary) node.

## Settings

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

\`\`\`js
DetailsContent.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
\`\`\`

```

# editor\extensions\nodes\details-summary.mdx

```mdx
---
title: DetailsSummary extension
icon: menu-unfold-line
extension:
  name: DetailsSummary
  description: Add a summary to your details nodes.
  type: node
  icon: Text
  isPro: true
meta:
  title: DetailsSummary extension | Tiptap Editor Docs
  description: Use the DetailsSummary extension to enable the `<summary>` HTML tag for your `<details>` content. Learn more in our docs!
  category: Editor
tags:
  - type: pro
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

The Details extension enables you to use the `<details>` HTML tag in the editor. This is great to show and hide content.

<CodeDemo isPro path="/Nodes/Details" />

## Install

<Callout title="Set up access to Tiptap's private repository" variant="info">
  Integrate this pro extension by registering for a free [Tiptap
  account](https://cloud.tiptap.dev/register) and following our [access
  guide](/guides/pro-extensions) to Tiptap’s private repository.
</Callout>

\`\`\`bash
npm install @tiptap-pro/extension-details-summary
\`\`\`

This extension requires the [`Details`](/editor/extensions/nodes/details) and [`DetailsContent`](/editor/extensions/nodes/details-content) node.

## Settings

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

\`\`\`js
DetailsSummary.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
\`\`\`

```

# editor\extensions\nodes\details.mdx

```mdx
---
title: Details extension
icon: menu-unfold-line
extension:
  name: Details
  description: Add collapsible details nodes to your editor content.
  type: node
  icon: ListCollapse
  isPro: true
meta:
  title: Details extension | Tiptap Editor Docs
  description: Use the Details extension in Tiptap to enable the <details> HTML tag for showing and hiding content. Learn more in our docs!
  category: Editor
tags:
  - type: pro
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

The Details extension enables you to use the `<details>` HTML tag in the editor. This is great to show and hide content.

<CodeDemo isPro path="/Nodes/Details" />

## Install

<Callout title="Set up access to Tiptap’s private repository" variant="info">
  Gain access to this pro extension by registering for a free [Tiptap
  account](https://cloud.tiptap.dev/register) and following our [access
  guide](/guides/pro-extensions) to Tiptap’s private repository.
</Callout>

\`\`\`bash
npm install @tiptap-pro/extension-details
\`\`\`

This extension requires the [`DetailsSummary`](/editor/extensions/nodes/details-summary) and [`DetailsContent`](/editor/extensions/nodes/details-content) node.

## Settings

### persist

Specify if the open status should be saved in the document. Defaults to `false`.

\`\`\`js
Details.configure({
  persist: true,
})
\`\`\`

### openClassName

Specifies a CSS class that is set when toggling the content. Defaults to `is-open`.

\`\`\`js
Details.configure({
  openClassName: 'is-open',
})
\`\`\`

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

\`\`\`js
Details.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
\`\`\`

## Commands

### setDetails()

Wrap content in a details node.

\`\`\`js
editor.commands.setDetails()
\`\`\`

### unsetDetails()

Unwrap a details node.

\`\`\`js
editor.commands.unsetDetails()
\`\`\`

```

# editor\extensions\nodes\document.mdx

```mdx
---
title: Document extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-document.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-document
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-document.svg
    url: https://npmcharts.com/compare/@tiptap/extension-document?minimal=true
    label: Downloads
meta:
  title: Document extension | Tiptap Editor Docs
  description: Use the required Document extension as a home for all your editor’s nodes and content. Learn more in our docs!
  category: Editor
extension:
  name: Document
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-document
  description: 'Everyone needs it, nobody talks about it: the Document extension.'
  type: node
  icon: FileText
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

The `Document` extension is required, no matter what you build with Tiptap. It’s a so called “topNode”, a node that’s the home to all other nodes. Think of it like the `<body>` tag for your document.

The node is very tiny though. It defines a name of the node (`doc`), is configured to be a top node (`topNode: true`) and that it can contain multiple other nodes (`block+`). That’s all. But have a look yourself:

<CodeDemo path="/Nodes/Document" />

<Callout title="Breaking Change" variant="warning">
  Tiptap v1 tried to hide that node from you, but it has always been there. You have to explicitly
  import it from now on (or use [StarterKit](/editor/extensions/functionality/starterkit)).
</Callout>

## Install

\`\`\`bash
npm install @tiptap/extension-document
\`\`\`

## Source code

[packages/extension-document/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-document/)

```

# editor\extensions\nodes\emoji.mdx

```mdx
---
title: Emoji extension
icon: emoji-smile-line
extension:
  name: Emoji
  description: Render emojis as inline nodes with fallback images for unsupported emojis.
  type: node
  icon: Laugh
  isPro: true
meta:
  title: Emoji extension | Tiptap Editor Docs
  description: Use the Emoji extension in Tiptap to render emojis as inline nodes with fallback images for unsupported emojis.
  category: Editor
tags:
  - type: pro
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

The `Emoji` extension renders emojis as an inline node. All inserted (typed, pasted, etc.) emojis will be converted to this node. The benefit of this is that unsupported emojis can be rendered with a fallback image. As soon as you copy text out of the editor, they will be converted back to plain text.

<CodeDemo isPro path="/Nodes/Emoji" />

## Install

<Callout title="Set up access to Tiptap's private repository" variant="info">
  Integrate this pro extension by registering for a free [Tiptap
  account](https://cloud.tiptap.dev/register) and following our [access
  guide](/guides/pro-extensions) to Tiptap’s private repository.
</Callout>

\`\`\`bash
npm install @tiptap-pro/extension-emoji
\`\`\`

## Dependencies

To place the popups correctly, we’re using [tippy.js](https://atomiks.github.io/tippyjs/) in all our examples. You are free to bring your own library, but if you’re fine with it, just install what we use:

\`\`\`bash
npm install tippy.js
\`\`\`

## Settings

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

\`\`\`js
Emoji.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
\`\`\`

### emojis

Define a set of emojis. Tiptap provides two lists of emojis:

1. The default `emojis` list, which contains all Unicode emojis of version 14.1
2. An extended `gitHubEmojis` list, which also contains custom emojis like :octocat:

\`\`\`js
import Emoji, { gitHubEmojis } from '@tiptap-pro/extension-emoji'

Emoji.configure({
  emojis: gitHubEmojis,
})
\`\`\`

<Callout title="Skin tones" variant="hint">

Skin tones are not yet supported ✌🏽

</Callout>

### enableEmoticons

Specifies whether text should be converted to emoticons (e.g. `<3` to ❤️). Defaults to `false`.

\`\`\`js
Emoji.configure({
  enableEmoticons: true,
})
\`\`\`

### forceFallbackImages

Specifies whether fallback images should always be rendered. Defaults to `false`.

\`\`\`js
Emoji.configure({
  forceFallbackImages: true,
})
\`\`\`

#### Add custom emojis

It’s super easy to add your own custom emojis.

\`\`\`js
import Emoji, { emojis } from '@tiptap-pro/extension-emoji'

const customEmojis = [
  {
    // A unique name of the emoji which will be stored as attribute
    name: 'octocat',
    // A list of unique shortcodes that are used by input rules to find the emoji
    shortcodes: ['octocat'],
    // A list of tags that can help for searching emojis
    tags: ['cat', 'meow'],
    // A name that can help to group emojis
    group: 'My custom group of emojis',
    // The image to be rendered
    fallbackImage: 'https://github.githubassets.com/images/icons/emoji/octocat.png',
  },
]

Emoji.configure({
  emojis: [...emojis, ...customEmojis],
})
\`\`\`

### suggestion

[Read more](/editor/api/utilities/suggestion)

\`\`\`js
Emoji.configure({
  suggestion: {
    // …
  },
})
\`\`\`

```

# editor\extensions\nodes\hard-break.mdx

```mdx
---
title: HardBreak extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-hard-break.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-hard-break
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-hard-break.svg
    url: https://npmcharts.com/compare/@tiptap/extension-hard-break?minimal=true
    label: Downloads
extension:
  name: Hard break
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-hard-break
  description: Sometimes we all need a break, even if it’s just a line break.
  type: node
  icon: WrapText
meta:
  title: HardBreak extension | Tiptap Editor Docs
  description: Use the Hard Break extension in Tiptap to add support for the <br> HTML tag for line breaks. Learn more in our docs!
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'

The HardBreak extensions adds support for the `<br>` HTML tag, which forces a line break.

<CodeDemo path="/Nodes/HardBreak" />

## Install

\`\`\`bash
npm install @tiptap/extension-hard-break
\`\`\`

## Settings

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

\`\`\`js
HardBreak.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
\`\`\`

### keepMarks

Decides whether to keep marks after a line break. Based on the `keepOnSplit` option for marks.

Default: `true`

\`\`\`js
HardBreak.configure({
  keepMarks: false,
})
\`\`\`

## Commands

### setHardBreak()

Add a line break.

\`\`\`js
editor.commands.setHardBreak()
\`\`\`

## Keyboard shortcuts

| Command      | Windows/Linux                                                               | macOS                                                                   |
| ------------ | --------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| setHardBreak | <kbd>Shift</kbd> + <kbd>Enter</kbd> + <kbd>Control</kbd> + <kbd>Enter</kbd> | <kbd>Shift</kbd> + <kbd>Enter</kbd> + <kbd>Cmd</kbd> + <kbd>Enter</kbd> |

## Source code

[packages/extension-hard-break/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-hard-break/)

```

# editor\extensions\nodes\heading.mdx

```mdx
---
title: Heading extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-heading.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-heading
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-heading.svg
    url: https://npmcharts.com/compare/@tiptap/extension-heading?minimal=true
    label: Downloads
extension:
  name: Heading
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-heading
  description: 'Structure the content with headings (comes with up to 6 different levels).'
  type: node
  icon: Heading
meta:
  title: Heading extension | Tiptap Editor Docs
  description: Use the Heading extension in Tiptap to add support for headings of different levels with <h> HTML tags. Learn more in our docs!
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'

The Heading extension adds support for headings of different levels. Headings are rendered with `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>` or `<h6>` HTML tags. By default all six heading levels (or styles) are enabled, but you can pass an array to only allow a few levels. Check the usage example to see how this is done.

Type <code># </code> at the beginning of a new line and it will magically transform to a heading, same for <code>## </code>, <code>### </code>, <code>#### </code>, <code>##### </code> and <code>###### </code>.

<CodeDemo path="/Nodes/Heading" />

## Install

\`\`\`bash
npm install @tiptap/extension-heading
\`\`\`

## Settings

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

\`\`\`js
Heading.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
\`\`\`

### levels

Specifies which heading levels are supported.

Default: `[1, 2, 3, 4, 5, 6]`

\`\`\`js
Heading.configure({
  levels: [1, 2],
})
\`\`\`

## Commands

### setHeading()

Creates a heading node with the specified level.

\`\`\`js
editor.commands.setHeading({ level: 1 })
\`\`\`

### toggleHeading()

Toggles a heading node with the specified level.

\`\`\`js
editor.commands.toggleHeading({ level: 1 })
\`\`\`

## Keyboard shortcuts

| Command                   | Windows/Linux                                      | macOS                                          |
| ------------------------- | -------------------------------------------------- | ---------------------------------------------- |
| toggleHeading( level: 1 ) | <kbd>Control</kbd> + <kbd>Alt</kbd> + <kbd>1</kbd> | <kbd>Cmd</kbd> + <kbd>Alt</kbd> + <kbd>1</kbd> |
| toggleHeading( level: 2 ) | <kbd>Control</kbd> + <kbd>Alt</kbd> + <kbd>2</kbd> | <kbd>Cmd</kbd> + <kbd>Alt</kbd> + <kbd>2</kbd> |
| toggleHeading( level: 3 ) | <kbd>Control</kbd> + <kbd>Alt</kbd> + <kbd>3</kbd> | <kbd>Cmd</kbd> + <kbd>Alt</kbd> + <kbd>3</kbd> |
| toggleHeading( level: 4 ) | <kbd>Control</kbd> + <kbd>Alt</kbd> + <kbd>4</kbd> | <kbd>Cmd</kbd> + <kbd>Alt</kbd> + <kbd>4</kbd> |
| toggleHeading( level: 5 ) | <kbd>Control</kbd> + <kbd>Alt</kbd> + <kbd>5</kbd> | <kbd>Cmd</kbd> + <kbd>Alt</kbd> + <kbd>5</kbd> |
| toggleHeading( level: 6 ) | <kbd>Control</kbd> + <kbd>Alt</kbd> + <kbd>6</kbd> | <kbd>Cmd</kbd> + <kbd>Alt</kbd> + <kbd>6</kbd> |

## Source code

[packages/extension-heading/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-heading/)

```

# editor\extensions\nodes\horizontal-rule.mdx

```mdx
---
title: HorizontalRule extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-horizontal-rule.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-horizontal-rule
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-horizontal-rule.svg
    url: https://npmcharts.com/compare/@tiptap/extension-horizontal-rule?minimal=true
    label: Downloads
extension:
  name: Horizontal Rule
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-horizontal-rule
  description: The least code the better, but sometimes you just need multiple lines.
  type: node
  icon: Minus
meta:
  title: HorizontalRule extension | Tiptap Editor Docs
  description: Use the Horizontal Rule extension in Tiptap to render the `<hr>` HTML tag for separating content. Learn more in our docs!
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'

Use this extension to render a `<hr>` HTML tag. If you pass `<hr>` in the editor’s initial content, it’ll be rendered accordingly.

Type three dashes (<code>---</code>) or three underscores and a space (<code>\_\_\_ </code>) at the beginning of a new line and it will magically transform to a horizontal rule.

<CodeDemo path="/Nodes/HorizontalRule" />

## Install

\`\`\`bash
npm install @tiptap/extension-horizontal-rule
\`\`\`

## Settings

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

\`\`\`js
HorizontalRule.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
\`\`\`

## Commands

### setHorizontalRule()

Create a horizontal rule.

\`\`\`js
editor.commands.setHorizontalRule()
\`\`\`

## Source code

[packages/extension-horizontal-rule/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-horizontal-rule/)

```

# editor\extensions\nodes\image.mdx

```mdx
---
title: Image extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-image.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-image
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-image.svg
    url: https://npmcharts.com/compare/@tiptap/extension-image?minimal=true
    label: Downloads
extension:
  name: Image
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-image
  description: Add an image (ideally a beautiful one), when words aren’t enough.
  type: node
  icon: Image
meta:
  title: Image extension | Tiptap Editor Docs
  description: Use the Image extension in Tiptap to render the <img> HTML tag for adding images to your documents. Learn more in our docs!
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

Use this extension to render `<img>` HTML tags. By default, those images are blocks. If you want to render images in line with text set the `inline` option to `true`.

<Callout title="No Server Functionality" variant="info">
  This extension is only responsible for displaying images. It doesn’t upload images to your server,
  for that you can integrate the [FileHandler
  extension](/editor/extensions/functionality/filehandler)
</Callout>

<CodeDemo path="/Nodes/Image" />

## Install

\`\`\`bash
npm install @tiptap/extension-image
\`\`\`

## Settings

### inline

Renders the image node inline, for example in a paragraph tag: `<p><img src="spacer.gif"></p>`. By default images are on the same level as paragraphs.

It totally depends on what kind of editing experience you’d like to have, but can be useful if you (for example) migrate from Quill to Tiptap.

Default: `false`

\`\`\`js
Image.configure({
  inline: true,
})
\`\`\`

### allowBase64

Allow images to be parsed as base64 strings `<img src="data:image/jpg;base64...">`.

Default: `false`

\`\`\`js
Image.configure({
  allowBase64: true,
})
\`\`\`

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

\`\`\`js
Image.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
\`\`\`

## Commands

### setImage()

Makes the current node an image.

\`\`\`js
editor.commands.setImage({ src: 'https://example.com/foobar.png' })
editor.commands.setImage({
  src: 'https://example.com/foobar.png',
  alt: 'A boring example image',
  title: 'An example',
})
\`\`\`

## Source code

[packages/extension-image/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-image/)

```

# editor\extensions\nodes\index.mdx

```mdx
---
title: Nodes extensions
sidebars:
  hideSecondary: true
meta:
  title: Nodes extensions | Tiptap Editor Docs
  description: Discover the different types of nodes in Tiptap, like paragraphs, headings, code blocks, and more. Learn more in our docs!
  category: Editor
---

import { Extensions } from '@/components/Extensions'

If you think of the document as a tree, then nodes are just a type of content in that tree. Examples of nodes are paragraphs, headings, or code blocks. But nodes don’t have to be blocks. They can also be rendered inline with the text, for example for @mentions.

<Extensions path="content/editor/extensions/nodes" />

```

# editor\extensions\nodes\list-item.mdx

```mdx
---
title: ListItem extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-list-item.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-list-item
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-list-item.svg
    url: https://npmcharts.com/compare/@tiptap/extension-list-item?minimal=true
    label: Downloads
extension:
  name: List Item
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-list-item
  description: 'Simply does its job. Doesn’t even care if it’s part of a bullet list or an ordered list.'
  type: node
  icon: List
meta:
  title: ListItem Extension | Tiptap Editor Docs
  description: Use the List Item extension in Tiptap to add support for the `<li>` tag used in bullet and ordered lists. Learn more in our docs!
  category: Editor
---

import { Callout } from '@/components/ui/Callout'
import { CodeDemo } from '@/components/CodeDemo'

The ListItem extension adds support for the `<li>` HTML tag. It’s used for bullet lists and ordered lists and can’t really be used without them.

<CodeDemo path="/Nodes/ListItem" />

<Callout title="Modify backspace behavior" variant="info">
  If you want to modify the standard behavior of backspace and delete functions for lists, you
  should read about the [ListKeymap](/editor/extensions/functionality/listkeymap) extension.
</Callout>

## Install

\`\`\`bash
npm install @tiptap/extension-list-item
\`\`\`

This extension requires the [`BulletList`](/editor/extensions/nodes/bullet-list) or [`OrderedList`](/editor/extensions/nodes/ordered-list) node.

## Settings

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

\`\`\`js
ListItem.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
\`\`\`

## Keyboard shortcuts

| Command         | Windows/Linux                     | macOS                             |
| --------------- | --------------------------------- | --------------------------------- |
| splitListItem() | <kbd>Enter</kbd>                  | <kbd>Enter</kbd>                  |
| sinkListItem()  | <kbd>Tab</kbd>                    | <kbd>Tab</kbd>                    |
| liftListItem()  | <kbd>Shift</kbd> + <kbd>Tab</kbd> | <kbd>Shift</kbd> + <kbd>Tab</kbd> |

## Source code

[packages/extension-list-item/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-list-item/)

```

# editor\extensions\nodes\mention.mdx

```mdx
---
title: Mention extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-mention.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-mention
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-mention.svg
    url: https://npmcharts.com/compare/@tiptap/extension-mention?minimal=true
    label: Downloads
extension:
  name: Mention
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-mention
  description: Mention other users with a suggestion popup and full control over the rendering.
  type: node
  icon: AtSign
meta:
  title: Mention extension | Tiptap Editor Docs
  description: Use the Mention extension in Tiptap to mention other users with a suggestion popup. Learn more in our docs!
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'

Honestly, the mention node is amazing. It adds support for `@mentions`, for example to ping users, _and_ provides full control over the rendering.

Literally everything can be customized. You can pass a custom component for the rendering. All examples use `.filter()` to search through items, but feel free to send async queries to an API or add a more advanced library like [fuse.js](https://fusejs.io/) to your project.

<CodeDemo path="/Nodes/Mention" />

## Install

\`\`\`bash
npm install @tiptap/extension-mention
\`\`\`

## Dependencies

To place the popups correctly, we’re using [tippy.js](https://atomiks.github.io/tippyjs/) in all our examples. You are free to bring your own library, but if you’re fine with it, just install what we use:

\`\`\`bash
npm install tippy.js
\`\`\`

Since 2.0.0-beta.193 we marked the `@tiptap/suggestion` as a peer dependency. That means, you will need to install it manually.

\`\`\`bash
npm install @tiptap/suggestion
\`\`\`

## Settings

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

\`\`\`js
Mention.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
\`\`\`

### renderText

Define how a mention text should be rendered.

\`\`\`js
Mention.configure({
  renderText({ options, node }) {
    return `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`
  },
})
\`\`\`

### renderHTML

Define how a mention html element should be rendered, this is useful if you want to render an element other than `span` (e.g `a`)

\`\`\`js
Mention.configure({
  renderHTML({ options, node }) {
    return [
      'a',
      mergeAttributes({ href: '/profile/1' }, options.HTMLAttributes),
      `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`,
    ]
  },
})
\`\`\`

### deleteTriggerWithBackspace
Toggle whether the suggestion character(s) should also be deleted on deletion of a mention node. Default is `false`.
\`\`\`js
Mention.configure({
  deleteTriggerWithBackspace: true
})
\`\`\`

### suggestion

[Read more](/editor/api/utilities/suggestion)

\`\`\`js
Mention.configure({
  suggestion: {
    // …
  },
})
\`\`\`

## Source code

[packages/extension-mention/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-mention/)

```

# editor\extensions\nodes\ordered-list.mdx

```mdx
---
title: OrderedList extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-ordered-list.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-ordered-list
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-ordered-list.svg
    url: https://npmcharts.com/compare/@tiptap/extension-ordered-list?minimal=true
    label: Downloads
extension:
  name: Ordered List
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-ordered-list
  description: If a bullet list doesn’t look serious enough, put some numbers in front of it.
  type: node
  icon: List
meta:
  title: OrderedList extension | Tiptap Editor Docs
  description: Use the Ordered List extension in Tiptap to enable ordered lists rendered as <ol> HTML tags. Learn more in our docs!
  category: Editor
---

import { Callout } from '@/components/ui/Callout'
import { CodeDemo } from '@/components/CodeDemo'

This extension enables you to use ordered lists in the editor. They are rendered as `<ol>` HTML tags.

Type <code>1. </code> (or any other number followed by a dot) at the beginning of a new line and it will magically transform to a ordered list.

<CodeDemo path="/Nodes/OrderedList" />

<Callout title="Modify backspace behavior" variant="info">
  If you want to modify the standard behavior of backspace and delete functions for lists, you
  should read about the [ListKeymap](/editor/extensions/functionality/listkeymap) extension.
</Callout>

## Install

\`\`\`bash
npm install @tiptap/extension-ordered-list @tiptap/extension-list-item
\`\`\`

This extension requires the [`ListItem`](/editor/extensions/nodes/list-item) node.

## Settings

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

\`\`\`js
OrderedList.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
\`\`\`

### itemTypeName

Specify the list item name.

Default: `'listItem'`

\`\`\`js
OrderedList.configure({
  itemTypeName: 'listItem',
})
\`\`\`

### keepMarks

Decides whether to keep the marks from a previous line after toggling the list either using `inputRule` or using the button

Default: `false`

\`\`\`js
OrderedList.configure({
  keepMarks: true,
})
\`\`\`

### keepAttributes

Decides whether to keep the attributes from a previous line after toggling the list either using `inputRule` or using the button

Default: `false`

\`\`\`js
OrderedList.configure({
  keepAttributes: true,
})
\`\`\`

## Commands

### toggleOrderedList()

Toggle an ordered list.

\`\`\`js
editor.commands.toggleOrderedList()
\`\`\`

## Keyboard shortcuts

| Command           | Windows/Linux                                        | macOS                                            |
| ----------------- | ---------------------------------------------------- | ------------------------------------------------ |
| toggleOrderedList | <kbd>Control</kbd> + <kbd>Shift</kbd> + <kbd>7</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>7</kbd> |

## Source code

[packages/extension-ordered-list/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-ordered-list/)

```

# editor\extensions\nodes\paragraph.mdx

```mdx
---
title: Paragraph extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-paragraph.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-paragraph
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-paragraph.svg
    url: https://npmcharts.com/compare/@tiptap/extension-paragraph?minimal=true
    label: Downloads
extension:
  name: Paragraph
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-paragraph
  description: Mom, look! I wrote a paragraph on the Internet.
  type: node
  icon: Pilcrow
meta:
  title: Paragraph extension | Tiptap Editor Docs
  description: Use the Paragraph extension in Tiptap to add support for paragraphs with the <p> HTML tag. Learn more in our docs!
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

Yes, the schema is very strict. Without this extension you won’t even be able to use paragraphs in the editor.

<Callout title="Breaking Change" variant="warning">
  Tiptap v1 tried to hide that node from you, but it has always been there. You have to explicitly
  import it from now on (or use [StarterKit](/editor/extensions/functionality/starterkit)).
</Callout>

<CodeDemo path="/Nodes/Paragraph" />

## Install

\`\`\`bash
npm install @tiptap/extension-paragraph
\`\`\`

## Settings

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

\`\`\`js
Paragraph.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
\`\`\`

## Commands

### setParagraph()

Transforms all selected nodes to paragraphs.

\`\`\`js
editor.commands.setParagraph()
\`\`\`

## Keyboard shortcuts

| Command        | Windows/Linux                                      | macOS                                          |
| -------------- | -------------------------------------------------- | ---------------------------------------------- |
| setParagraph() | <kbd>Control</kbd> + <kbd>Alt</kbd> + <kbd>0</kbd> | <kbd>Cmd</kbd> + <kbd>Alt</kbd> + <kbd>0</kbd> |

## Source code

[packages/extension-paragraph/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-paragraph/)

```

# editor\extensions\nodes\table-cell.mdx

```mdx
---
title: TableCell extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-table-cell.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-table-cell
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-table-cell.svg
    url: https://npmcharts.com/compare/@tiptap/extension-table-cell?minimal=true
    label: Downloads
extension:
  name: Table Cell
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-table-cell
  description: 'It’s useless without all its other table friends: the table cell.'
  type: node
  icon: Table
meta:
  title: TableCell extension | Tiptap Editor Docs
  description: Use the Table Cell extension in Tiptap to add cells to your tables for proper data structure. Learn more in our docs!
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'

Don’t try to use tables without table cells. It won’t be fun.

<CodeDemo path="/Nodes/Table" />

## Install

\`\`\`bash
npm install @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-header @tiptap/extension-table-cell
\`\`\`

This extension requires the [`Table`](/editor/extensions/nodes/table), [`TableRow`](/editor/extensions/nodes/table-row) and [`TableHeader`](/editor/extensions/nodes/table-header) nodes.

## Source code

[packages/extension-table-cell/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-table-cell/)

```

# editor\extensions\nodes\table-header.mdx

```mdx
---
title: TableHeader extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-table-header.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-table-header
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-table-header.svg
    url: https://npmcharts.com/compare/@tiptap/extension-table-header?minimal=true
    label: Downloads
meta:
  title: TableHeader extension | Tiptap Editor Docs
  description: Improve tables with Tiptap’s TableHeader extension. Easily control table headers. Source code and usage examples in the docs!
  category: Editor
extension:
  name: Table Header
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-table-header
  description: 'Tables don’t require a header, but let’s be honest: They look better with it.'
  type: node
  icon: Table
---

import { CodeDemo } from '@/components/CodeDemo'

This extension complements the [`Table`](/editor/extensions/nodes/table) extension and adds… you guessed it… table headers to them.

<CodeDemo path="/Nodes/Table" />

Table headers are optional. But come on, you want them, don’t you? If you don’t want them, update the `content` attribute of the [`TableRow`](/editor/extensions/nodes/table-row) extension, like this:

\`\`\`js
// Table rows without table headers
TableRow.extend({
  content: 'tableCell*',
})
\`\`\`

This is the default, which allows table headers:

\`\`\`js
// Table rows with table headers (default)
TableRow.extend({
  content: '(tableCell | tableHeader)*',
})
\`\`\`

## Install

\`\`\`bash
npm install @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-header @tiptap/extension-table-cell
\`\`\`

This extension requires the [`Table`](/editor/extensions/nodes/table), [`TableRow`](/editor/extensions/nodes/table-row) and [`TableCell`](/editor/extensions/nodes/table-cell) nodes.

## Source code

[packages/extension-table-header/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-table-header/)

```

# editor\extensions\nodes\table-row.mdx

```mdx
---
title: TableRow extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-table-row.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-table-row
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-table-row.svg
    url: https://npmcharts.com/compare/@tiptap/extension-table-row?minimal=true
    label: Downloads
extension:
  name: Table Row
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-table-row
  description: 'The perfect middle ground between a table and a table cell.'
  type: node
  icon: Table
meta:
  title: TableRow extension | Tiptap Editor Docs
  description: Use the Table Row extension in Tiptap to add rows to your tables for a better table structure. Learn more in our docs!
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'

What’s a table without rows? Add this extension to make your tables usable.

<CodeDemo path="/Nodes/Table" />

## Install

\`\`\`bash
npm install @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-header @tiptap/extension-table-cell
\`\`\`

This extension requires the [`Table`](/editor/extensions/nodes/table), [`TableHeader`](/editor/extensions/nodes/table-header) and [`TableCell`](/editor/extensions/nodes/table-cell) nodes.

## Source code

[packages/extension-table-row/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-table-row/)

```

# editor\extensions\nodes\table.mdx

```mdx
---
title: Table extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-table.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-table
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-table.svg
    url: https://npmcharts.com/compare/@tiptap/extension-table?minimal=true
    label: Downloads
extension:
  name: Table
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-table
  description: 'You’re working on something really serious if you need tables inside a text editor.'
  type: node
  icon: Table
meta:
  title: Table extension | Tiptap Editor Docs
  description: Use the Table extension in Tiptap to add tables to your documents with a range of customization options. Learn more in our docs!
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'

Nothing is as much fun as a good old HTML table. The `Table` extension enables you to add this holy grail of WYSIWYG editing to your editor.

Don’t forget to add a `spacer.gif`. (Just joking. If you don’t know what that is, don’t listen.)

<CodeDemo path="/Nodes/Table" />

## Install

\`\`\`bash
npm install @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-header @tiptap/extension-table-cell
\`\`\`

This extension requires the [`TableRow`](/editor/extensions/nodes/table-row), [`TableHeader`](/editor/extensions/nodes/table-header) and [`TableCell`](/editor/extensions/nodes/table-cell) nodes.

## Settings

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

\`\`\`js
Table.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
\`\`\`

### resizable

Default: `false`

### handleWidth

Default: `5`

### cellMinWidth

Default: `25`

### View

Default: `TableView`

### lastColumnResizable

Default: `true`

### allowTableNodeSelection

Default: `false`

## Commands

### insertTable()

Creates a new three-by-three table by default, including a header row. You can specify custom rows, columns, and header preferences:

\`\`\`js
editor.commands.insertTable()
editor.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: false })
\`\`\`

### addColumnBefore()

Adds a column before the current column.

\`\`\`js
editor.commands.addColumnBefore()
\`\`\`

### addColumnAfter()

Adds a column after the current column.

\`\`\`js
editor.commands.addColumnAfter()
\`\`\`

### deleteColumn()

Deletes the current column.

\`\`\`js
editor.commands.deleteColumn()
\`\`\`

### addRowBefore()

Adds a row above the current row.

\`\`\`js
editor.commands.addRowBefore()
\`\`\`

### addRowAfter()

Adds a row below the current row.

\`\`\`js
editor.commands.addRowAfter()
\`\`\`

### deleteRow()

Deletes the current row.

\`\`\`js
editor.commands.deleteRow()
\`\`\`

### deleteTable()

Deletes the whole table.

\`\`\`js
editor.commands.deleteTable()
\`\`\`

### mergeCells()

Merge all selected cells to a single cell.

\`\`\`js
editor.commands.mergeCells()
\`\`\`

### splitCell()

Splits the current cell.

\`\`\`js
editor.commands.splitCell()
\`\`\`

### toggleHeaderColumn()

Makes the current column a header column.

\`\`\`js
editor.commands.toggleHeaderColumn()
\`\`\`

### toggleHeaderRow()

Makes the current row a header row.

\`\`\`js
editor.commands.toggleHeaderRow()
\`\`\`

### toggleHeaderCell()

Makes the current cell a header cell.

\`\`\`js
editor.commands.toggleHeaderCell()
\`\`\`

### mergeOrSplit()

If multiple cells are selected, they are merged. If a single cell is selected, the cell is splitted into two cells.

\`\`\`js
editor.commands.mergeOrSplit()
\`\`\`

### setCellAttribute()

Sets the given attribute for the current cell. Can be whatever you define on the [`TableCell`](/editor/extensions/nodes/table-cell) extension, for example a background color. Just make sure to register [your custom attribute](/editor/extensions/custom-extensions/extend-existing#attributes) first.

\`\`\`js
editor.commands.setCellAttribute('customAttribute', 'value')
editor.commands.setCellAttribute('backgroundColor', '#000')
\`\`\`

### goToNextCell()

Go the next cell.

\`\`\`js
editor.commands.goToNextCell()
\`\`\`

### goToPreviousCell()

Go to the previous cell.

\`\`\`js
editor.commands.goToPreviousCell()
\`\`\`

### fixTables()

Inspects all tables in the document and fixes them, if necessary.

\`\`\`js
editor.commands.fixTables()
\`\`\`

## Source code

[packages/extension-table/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-table/)

```

# editor\extensions\nodes\task-item.mdx

```mdx
---
title: TaskItem extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-task-item.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-task-item
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-task-item.svg
    url: https://npmcharts.com/compare/@tiptap/extension-task-item?minimal=true
    label: Downloads
extension:
  name: Task Item
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-task-item
  description: 'The actually task; without it, the task list would be nothing.'
  type: node
  icon: ListChecks
meta:
  title: TaskItem extension | Tiptap Editor Docs
  description: Use the TaskItem extension to add support for task items rendered as <li data-type="taskItem"> with checkboxes. More in our docs!
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'

This extension renders a task item list element, which is a `<li>` tag with a `data-type` attribute set to `taskItem`. It also renders a checkbox inside the list element, which updates a `checked` attribute.

This extension doesn’t require any JavaScript framework, it’s based on Vanilla JavaScript.

<CodeDemo path="/Nodes/TaskItem" />

## Install

\`\`\`bash
npm install @tiptap/extension-task-list @tiptap/extension-task-item
\`\`\`

This extension requires the [`TaskList`](/editor/extensions/nodes/task-list) node.

## Settings

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

\`\`\`js
TaskItem.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
\`\`\`

### nested

Whether the task items are allowed to be nested within each other.

\`\`\`js
TaskItem.configure({
  nested: true,
})
\`\`\`

### onReadOnlyChecked

A handler for when the task item is checked or unchecked while the editor is set to `readOnly`.
If this is not supplied, the task items are immutable while the editor is `readOnly`.
If this function returns false, the check state will be preserved (`readOnly`).

\`\`\`js
TaskItem.configure({
  onReadOnlyChecked: (node, checked) => {
    // do something
  },
})
\`\`\`

## Keyboard shortcuts

| Command         | Windows/Linux                     | macOS                             |
| --------------- | --------------------------------- | --------------------------------- |
| splitListItem() | <kbd>Enter</kbd>                  | <kbd>Enter</kbd>                  |
| sinkListItem()  | <kbd>Tab</kbd>                    | <kbd>Tab</kbd>                    |
| liftListItem()  | <kbd>Shift</kbd> + <kbd>Tab</kbd> | <kbd>Shift</kbd> + <kbd>Tab</kbd> |

## Source code

[packages/extension-task-item/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-task-item/)

```

# editor\extensions\nodes\task-list.mdx

```mdx
---
title: TaskList extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-task-list.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-task-list
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-task-list.svg
    url: https://npmcharts.com/compare/@tiptap/extension-task-list?minimal=true
    label: Downloads
extension:
  name: Task List
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-task-list
  description: 'Adds support for tasks (though it won’t make sure you actually complete them).'
  type: node
  icon: ListChecks
meta:
  title: TaskList extension | Tiptap Editor Docs
  description: Use the Task List extension in Tiptap to add support for task lists rendered as <ul data-type="taskList">. More in our docs!
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'

This extension enables you to use task lists in the editor. They are rendered as `<ul data-type="taskList">`. This implementation doesn’t require any framework, it’s using Vanilla JavaScript only.

Type <code>[ ] </code> or <code>[x] </code> at the beginning of a new line and it will magically transform to a task list.

<CodeDemo path="/Nodes/TaskList" />

## Install

\`\`\`bash
npm install @tiptap/extension-task-list @tiptap/extension-task-item
\`\`\`

This extension requires the [`TaskItem`](/editor/extensions/nodes/task-item) extension.

## Settings

### HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

\`\`\`js
TaskList.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
\`\`\`

### itemTypeName

Specify the list item name.

Default: `'taskItem'`

\`\`\`js
TaskList.configure({
  itemTypeName: 'taskItem',
})
\`\`\`

## Commands

# toggleTaskList()

Toggle a task list.

\`\`\`js
editor.commands.toggleTaskList()
\`\`\`

## Keyboard shortcuts

| Command          | Windows/Linux                                        | macOS                                            |
| ---------------- | ---------------------------------------------------- | ------------------------------------------------ |
| toggleTaskList() | <kbd>Control</kbd> + <kbd>Shift</kbd> + <kbd>9</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>9</kbd> |

## Source code

[packages/extension-task-list/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-task-list/)

```

# editor\extensions\nodes\text.mdx

```mdx
---
title: Text extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-text.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-text
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-text.svg
    url: https://npmcharts.com/compare/@tiptap/extension-text?minimal=true
    label: Downloads
extension:
  name: Text
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-text
  description: 'No text editor without text, so better make sure to install this one.'
  type: node
  icon: Type
meta:
  title: Text extension | Tiptap Editor Docs
  description: It's very likely that you want text in your text editor. Enable plain text support with the Text extension. More in the docs!
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

The `Text` extension is required, at least if you want to work with text of any kind and that’s very likely. This extension is a little bit different, it doesn’t even render HTML. It’s plain text, that’s all.

<Callout title="Breaking Change" variant="info">
  Tiptap v1 tried to hide that node from you, but it has always been there. You have to explicitly
  import it from now on (or use [StarterKit](/editor/extensions/functionality/starterkit)).
</Callout>

<CodeDemo path="/Nodes/Text" />

## Install

\`\`\`bash
npm install @tiptap/extension-text
\`\`\`

## Source code

[packages/extension-text/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-text/)

```

# editor\extensions\nodes\youtube.mdx

```mdx
---
title: Youtube extension
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/extension-youtube.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/extension-youtube
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/extension-youtube.svg
    url: https://npmcharts.com/compare/@tiptap/extension-youtube?minimal=true
    label: Downloads
extension:
  name: Youtube
  link: https://github.com/ueberdosis/tiptap/tree/main/packages/extension-youtube
  description: Easily embed YouTube videos into your documents.
  type: node
  icon: Youtube
meta:
  title: Youtube extension | Tiptap Editor Docs
  description: Use the Youtube extension in Tiptap to easily embed Youtube videos in your documents. Learn more in our docs!
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'

This extension adds a new YouTube embed node to the editor.

<CodeDemo path="/Nodes/YouTube" />

## Install

\`\`\`bash
npm install @tiptap/extension-youtube
\`\`\`

## Settings

### inline

Controls if the node should be handled inline or as a block.

Default: `false`

\`\`\`js
Youtube.configure({
  inline: false,
})
\`\`\`

### width

Controls the default width of added videos

Default: `640`

\`\`\`js
Youtube.configure({
  width: 480,
})
\`\`\`

### height

Controls the default height of added videos

Default: `480`

\`\`\`js
Youtube.configure({
  height: 320,
})
\`\`\`

### controls

Enables or disables YouTube video controls

Default: `true`

\`\`\`js
Youtube.configure({
  controls: false,
})
\`\`\`

### nocookie

Enables the nocookie mode for YouTube embeds

Default: `false`

\`\`\`js
Youtube.configure({
  nocookie: true,
})
\`\`\`

### allowFullscreen

Allows the iframe to be played in fullscreen

Default: `true`

\`\`\`js
Youtube.configure({
  allowFullscreen: false,
})
\`\`\`

### autoplay

Allows the iframe to start playing after the player is loaded

Default: `false`

\`\`\`js
Youtube.configure({
  autoplay: true,
})
\`\`\`

### ccLanguage

Specifies the default language that the player will use to display closed captions. Set the parameter’s value to an ISO 639-1 two-letter language code. For example, setting it to `es` will cause the captions to be in spanish

Default: `undefined`

\`\`\`js
Youtube.configure({
  ccLanguage: 'es',
})
\`\`\`

### ccLoadPolicy

Setting this parameter’s value to `true` causes closed captions to be shown by default, even if the user has turned captions off

Default: `false`

\`\`\`js
Youtube.configure({
  ccLoadPolicy: true,
})
\`\`\`

### disableKBcontrols

Disables the keyboards controls for the iframe player

Default: `false`

\`\`\`js
Youtube.configure({
  disableKBcontrols: true,
})
\`\`\`

### enableIFrameApi

Enables the player to be controlled via IFrame Player API calls

Default: `false`

\`\`\`js
Youtube.configure({
  enableIFrameApi: true,
})
\`\`\`

### origin

This parameter provides an extra security measure for the IFrame API and is only supported for IFrame embeds. If you are using the IFrame API, which means you are setting the `enableIFrameApi` parameter value to `true`, you should always specify your domain as the `origin` parameter value.

Default: `''`

\`\`\`js
Youtube.configure({
  origin: 'yourdomain.com',
})
\`\`\`

### endTime

This parameter specifies the time, measured in seconds from the start of the video, when the player should stop playing the video.
For example, setting it to `15` will make the video stop at the 15 seconds mark

Default: `0`

\`\`\`js
Youtube.configure({
  endTime: '15',
})
\`\`\`

### interfaceLanguage

Sets the player’s interface language. The parameter value is an ISO 639-1 two-letter language code. For example, setting it to `fr` will cause the interface to be in french

Default: `undefined`

\`\`\`js
Youtube.configure({
  interfaceLanguage: 'fr',
})
\`\`\`

### ivLoadPolicy

Setting this to 1 causes video annotations to be shown by default, whereas setting to 3 causes video annotations to not be shown by default

Default: `0`

\`\`\`js
Youtube.configure({
  ivLoadPolicy: '3',
})
\`\`\`

### loop

This parameter has limited support in IFrame embeds. To loop a single video, set the loop parameter value to `true` and set the playlist parameter value to the same video ID already specified in the Player API URL.

Default: `false`

\`\`\`js
Youtube.configure({
  loop: true,
})
\`\`\`

### playlist

This parameter specifies a comma-separated list of video IDs to play.

Default: `''`

\`\`\`js
Youtube.configure({
  playlist: 'VIDEO_ID_1,VIDEO_ID_2,VIDEO_ID_3,...,VIDEO_ID_N',
})
\`\`\`

### modestBranding

Disables the Youtube logo on the control bar of the player. Note that a small YouTube text label will still display in the upper-right corner of a paused video when the user's mouse pointer hovers over the player

Default: `false`

\`\`\`js
Youtube.configure({
  modestBranding: true,
})
\`\`\`

### progressBarColor

This parameter specifies the color that will be used in the player's video progress bar. Note that setting the color parameter to `white` will disable the `modestBranding` parameter

Default: `undefined`

\`\`\`js
Youtube.configure({
  progressBarColor: 'white',
})
\`\`\`

## Commands

### setYoutubeVideo(options)

Inserts a YouTube iframe embed at the current position

\`\`\`js
editor.commands.setYoutubeVideo({
  src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  width: 640,
  height: 480,
})
\`\`\`

#### Options

| Option | Description                                                          | Optional |
| ------ | -------------------------------------------------------------------- | -------- |
| src    | The url of the youtube video. Can be a YouTube or YouTube Music link |
| width  | The embed width (overrides the default option, optional)             | ✅       |
| height | The embed height (overrides the default option, optional)            | ✅       |

## Source code

[packages/extension-youtube/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-youtube/)

```

# editor\extensions\overview.mdx

```mdx
---
title: Don’t bend it, extend it.
meta:
  title: Extensions | Tiptap Editor Docs
  description: Choose from countless Editor extensions to build a unique content experience. Start exploring Editor extensions in the docs!
  category: Editor
sidebars:
  hideSecondary: true
---

Our editor does what you would expect from a modern editor, and probably way more than that. With tons of extensions there’s a lot to explore for you.

import { Extensions } from '@/components/Extensions'

<Extensions path="content/editor/extensions" />

```

# editor\getting-started\configure.mdx

```mdx
---
title: Configure the Editor
meta:
  title: Configuration | Tiptap Editor Docs
  description: Configure your Tiptap Editor's elements, extensions, and content settings. Learn more in our documentation!
  category: Editor
---

To configure Tiptap, specify three key elements:
+ where it should be rendered (`element`) 
+ which functionalities to enable (`extensions`) 
+ what the initial document should contain (`content`)

While this setup works for most cases, you can configure additional options.

## Add your configuration

To configure the editor, pass [an object with settings](/editor/api/editor) to the `Editor` class, as shown below:

\`\`\`js
import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

new Editor({
  // bind Tiptap to the `.element`
  element: document.querySelector('.element'),
  // register extensions
  extensions: [Document, Paragraph, Text],
  // set the initial content
  content: '<p>Example Text</p>',
  // place the cursor in the editor after initialization
  autofocus: true,
  // make the text editable (default is true)
  editable: true,
  // prevent loading the default CSS (which isn't much anyway)
  injectCSS: false,
})
\`\`\`

## Nodes, marks, and extensions

Most editing features are packaged as [nodes](/editor/extensions/nodes), [marks](/editor/extensions/marks), or [functionality](/editor/extensions/functionality). Import what you need and pass them as an array to the editor.

Here's the minimal setup with only three extensions:

\`\`\`js
import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

new Editor({
  element: document.querySelector('.element'),
  extensions: [Document, Paragraph, Text],
})
\`\`\`

### Configure extensions

Many extensions can be configured with the `.configure()` method. You can pass an object with specific settings.

For example, to limit the heading levels to 1, 2, and 3, configure the [`Heading`](/editor/extensions/nodes/heading) extension as shown below:

\`\`\`js
import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Heading from '@tiptap/extension-heading'

new Editor({
  element: document.querySelector('.element'),
  extensions: [
    Document,
    Paragraph,
    Text,
    Heading.configure({
      levels: [1, 2, 3],
    }),
  ],
})
\`\`\`

Refer to the extension's documentation for available settings.

### A bundle with the most common extensions

We have bundled a few of the most common extensions into the [`StarterKit`](/editor/extensions/functionality/starterkit). Here's how to use it:

\`\`\`js
import StarterKit from '@tiptap/starter-kit'

new Editor({
  extensions: [StarterKit],
})
\`\`\`

You can configure all extensions included in the [StarterKit](/editor/extensions/functionality/starterkit) by passing an object. To target specific extensions, prefix their configuration with the name of the extension. For example, to limit heading levels to 1, 2, and 3:

\`\`\`js
import StarterKit from '@tiptap/starter-kit'

new Editor({
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
    }),
  ],
})
\`\`\`

### Disable specific StarterKit extensions

To exclude certain extensions [StarterKit](/editor/extensions/functionality/starterkit), you can set them to `false` in the configuration. For example, to disable the [`Undo/Redo History`](/editor/extensions/functionality/undo-redo) extension:

\`\`\`js
import StarterKit from '@tiptap/starter-kit'

new Editor({
  extensions: [
    StarterKit.configure({
      history: false,
    }),
  ],
})
\`\`\`

When using Tiptap's [`Collaboration`](/editor/extensions/functionality/collaboration), which comes with its own history extension, you must disable the `Undo/Redo History` extension included in the [StarterKit](/editor/extensions/functionality/starterkit) to avoid conflicts.

### Additional extensions

The [StarterKit](/editor/extensions/functionality/starterkit) doesn't include all available extensions. To add more features to your editor, list them in the `extensions` array. For example, to add the [`Strike`](/editor/extensions/marks/strike) extension:

\`\`\`js
import StarterKit from '@tiptap/starter-kit'
import Strike from '@tiptap/extension-strike'

new Editor({
  extensions: [StarterKit, Strike],
})
\`\`\`

```

# editor\getting-started\install\alpine.mdx

```mdx
---
title: Alpine
meta:
  title: Alpine | Tiptap Editor Docs
  description: Discover how to use Tiptap with Alpine.js to create a powerful text editor. Follow our detailed guide in our docs!
  category: Editor
---

The following guide describes how to integrate Tiptap with version 3 of Alpine.js. For the sake of this guide, we'll use Vite to quickly set up a project, but you can use whatever you're used to. Vite is just really fast and we love it!

### Requirements

- [Node](https://nodejs.org/en/download/) installed on your machine
- Experience with [Alpine.js](https://github.com/alpinejs/alpine)

## Create a project (optional)

If you already have an Alpine.js project, that's fine too. Just skip this step.

For the purpose of this guide, start with a fresh [Vite](https://vitejs.dev/) project called `my-tiptap-project`. Vite sets up everything we need, just select the Vanilla JavaScript template.

\`\`\`bash
npm init vite@latest my-tiptap-project -- --template vanilla
cd my-tiptap-project
npm install
npm run dev
\`\`\`

### Install the dependencies

Okay, enough of the boring boilerplate work. Let's finally install Tiptap! For the following example, you'll need `alpinejs`, the `@tiptap/core` package, the `@tiptap/pm` package, and the `@tiptap/starter-kit`, which includes the most common extensions to get started quickly.

\`\`\`bash
npm install alpinejs @tiptap/core @tiptap/pm @tiptap/starter-kit
\`\`\`

If you followed step 1, you can now start your project with `npm run dev`, and open [http://localhost:5173](http://localhost:5173) in your favorite browser. This might be different if you're working with an existing project.

## Integrate Tiptap

To actually start using Tiptap, you'll need to write a little bit of JavaScript. Let's put the following example code in a file called `main.js`.

This is the fastest way to get Tiptap up and running with Alpine.js. It will give you a very basic version of Tiptap. No worries, you will be able to add more functionality soon.

\`\`\`js
import Alpine from 'alpinejs'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

document.addEventListener('alpine:init', () => {
  Alpine.data('editor', (content) => {
    let editor // Alpine's reactive engine automatically wraps component properties in proxy objects. If you attempt to use a proxied editor instance to apply a transaction, it will cause a "Range Error: Applying a mismatched transaction", so be sure to unwrap it using Alpine.raw(), or simply avoid storing your editor as a component property, as shown in this example.

    return {
      updatedAt: Date.now(), // force Alpine to rerender on selection change
      init() {
        const _this = this

        editor = new Editor({
          element: this.$refs.element,
          extensions: [StarterKit],
          content: content,
          onCreate({ editor }) {
            _this.updatedAt = Date.now()
          },
          onUpdate({ editor }) {
            _this.updatedAt = Date.now()
          },
          onSelectionUpdate({ editor }) {
            _this.updatedAt = Date.now()
          },
        })
      },
      isLoaded() {
        return editor
      },
      isActive(type, opts = {}) {
        return editor.isActive(type, opts)
      },
      toggleHeading(opts) {
        editor.chain().toggleHeading(opts).focus().run()
      },
      toggleBold() {
        editor.chain().focus().toggleBold().run()
      },
      toggleItalic() {
        editor.chain().toggleItalic().focus().run()
      },
    }
  })
})

window.Alpine = Alpine
Alpine.start()
\`\`\`

### Add it to your app

Now, let's replace the contents of `index.html` with the following example code to use the editor in our app.

\`\`\`html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
  </head>
  <body>
    <div x-data="editor('<p>Hello world! :-)</p>')">
      <template x-if="isLoaded()">
        <div class="menu">
          <button
            @click="toggleHeading({ level: 1 })"
            :class="{ 'is-active': isActive('heading', { level: 1 }, updatedAt) }"
          >
            H1
          </button>
          <button @click="toggleBold()" :class="{ 'is-active' : isActive('bold', updatedAt) }">
            Bold
          </button>
          <button @click="toggleItalic()" :class="{ 'is-active' : isActive('italic', updatedAt) }">
            Italic
          </button>
        </div>
      </template>

      <div x-ref="element"></div>
    </div>

    <script type="module" src="/main.js"></script>

    <style>
      body {
        margin: 2rem;
        font-family: sans-serif;
      }
      button.is-active {
        background: black;
        color: white;
      }
      .tiptap {
        padding: 0.5rem 1rem;
        margin: 1rem 0;
        border: 1px solid #ccc;
      }
    </style>
  </body>
</html>
\`\`\`

Tiptap should now be visible in your browser. Time to give yourself a pat on the back! :)

```

# editor\getting-started\install\cdn.mdx

```mdx
---
title: CDN
meta:
  title: CDN | Tiptap Editor Docs
  description: Learn how to use Tiptap via CDN for quick and easy setup in demos or tests. Explore our quick start guide in the docs!
  category: Editor
---

For testing purposes or demos, use our esm.sh CDN builds. Here are a few lines of code you need to get started.

\`\`\`html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <body>
    <div class="element"></div>
    <script type="module">
      import { Editor } from 'https://esm.sh/@tiptap/core'
      import StarterKit from 'https://esm.sh/@tiptap/starter-kit'
      const editor = new Editor({
        element: document.querySelector('.element'),
        extensions: [StarterKit],
        content: '<p>Hello World!</p>',
      })
    </script>
  </body>
</html>
\`\`\`

Tiptap should now be visible in your browser. Time to give yourself a pat on the back! :)

```

# editor\getting-started\install\index.mdx

```mdx
---
title: Install the Editor
meta:
  title: Install the Editor | Tiptap Editor Docs
  description: Integrate the Tiptap editor into your project. Tiptap is framework-agnostic, offering full compatibility with most frameworks.
  category: Editor
---

Tiptap is framework-agnostic and even works with vanilla JavaScript (if that's your thing). Use the following guides to integrate Tiptap into your JavaScript project.

import Link from '@/components/Link'
import { PageHeader } from '@/components/PageHeader'
import * as CardGrid from '@/components/CardGrid'
import javascriptIcon from '@/assets/javascript.png'
import reactIcon from '@/assets/react.png'
import nextIcon from '@/assets/next.png'
import vueIcon from '@/assets/vue.png'
import nuxtIcon from '@/assets/nuxt.png'
import svelteIcon from '@/assets/svelte.png'
import alpineIcon from '@/assets/alpine.png'
import phpIcon from '@/assets/php.png'
import angularIcon from '@/assets/angular.png'
import solidIcon from '@/assets/solid.png'
import cdnIcon from '@/assets/cdn.png'

<CardGrid.Wrapper className="grid-cols-1 sm:grid-cols-3">
  <CardGrid.Item asChild>
    <Link href="/editor/getting-started/install/vanilla-javascript">
      <CardGrid.ItemImageIcon src={javascriptIcon.src} alt="Javascript logo" />
      <CardGrid.ItemTitle className="text-[1.125rem]">JavaScript</CardGrid.ItemTitle>
    </Link>
  </CardGrid.Item>
  <CardGrid.Item asChild>
    <Link href="/editor/getting-started/install/react">
      <CardGrid.ItemImageIcon src={reactIcon.src} alt="React logo" />
      <CardGrid.ItemTitle className="text-[1.125rem]">React</CardGrid.ItemTitle>
    </Link>
  </CardGrid.Item>
  <CardGrid.Item asChild>
    <Link href="/editor/getting-started/install/nextjs">
      <CardGrid.ItemImageIcon src={nextIcon.src} alt="Next logo" />
      <CardGrid.ItemTitle className="text-[1.125rem]">Next</CardGrid.ItemTitle>
    </Link>
  </CardGrid.Item>
  <CardGrid.Item asChild>
    <Link href="/editor/getting-started/install/vue3">
      <CardGrid.ItemImageIcon src={vueIcon.src} alt="Vue logo" />
      <CardGrid.ItemTitle className="text-[1.125rem]">Vue 3</CardGrid.ItemTitle>
    </Link>
  </CardGrid.Item>
  <CardGrid.Item asChild>
    <Link href="/editor/getting-started/install/vue2">
      <CardGrid.ItemImageIcon src={vueIcon.src} alt="Vue logo" />
      <CardGrid.ItemTitle className="text-[1.125rem]">Vue 2</CardGrid.ItemTitle>
    </Link>
  </CardGrid.Item>
  <CardGrid.Item asChild>
    <Link href="/editor/getting-started/install/nuxt">
      <CardGrid.ItemImageIcon src={nuxtIcon.src} alt="Nuxt logo" />
      <CardGrid.ItemTitle className="text-[1.125rem]">Nuxt</CardGrid.ItemTitle>
    </Link>
  </CardGrid.Item>
  <CardGrid.Item asChild>
    <Link href="/editor/getting-started/install/svelte">
      <CardGrid.ItemImageIcon src={svelteIcon.src} alt="Svelte logo" />
      <CardGrid.ItemTitle className="text-[1.125rem]">Svelte</CardGrid.ItemTitle>
    </Link>
  </CardGrid.Item>
  <CardGrid.Item asChild>
    <Link href="/editor/getting-started/install/alpine">
      <CardGrid.ItemImageIcon src={alpineIcon.src} alt="Alpine.js logo" />
      <CardGrid.ItemTitle className="text-[1.125rem]">Alpine.js</CardGrid.ItemTitle>
    </Link>
  </CardGrid.Item>
  <CardGrid.Item asChild>
    <Link href="/editor/getting-started/install/php">
      <CardGrid.ItemImageIcon src={phpIcon.src} alt="PHP logo" />
      <CardGrid.ItemTitle className="text-[1.125rem]">PHP</CardGrid.ItemTitle>
    </Link>
  </CardGrid.Item>
  <CardGrid.Item asChild>
    <Link href="/editor/getting-started/install/cdn">
      <CardGrid.ItemImageIcon src={cdnIcon.src} alt="CDN logo" />
      <CardGrid.ItemTitle className="text-[1.125rem]">CDN</CardGrid.ItemTitle>
    </Link>
  </CardGrid.Item>
</CardGrid.Wrapper>

### Community efforts

<CardGrid.Wrapper className="grid-cols-1 sm:grid-cols-3">
  <CardGrid.Item asChild>
    <Link target="_blank" rel="nofollow noreferrer" href="https://github.com/sibiraj-s/ngx-tiptap">
      <CardGrid.ItemImageIcon src={angularIcon.src} alt="Angular logo" />
      <CardGrid.ItemTitle className="text-[1.125rem]">Angular</CardGrid.ItemTitle>
    </Link>
  </CardGrid.Item>
  <CardGrid.Item asChild>
    <Link target="_blank" rel="nofollow noreferrer" href="https://github.com/LXSMNSYC/solid-tiptap">
      <CardGrid.ItemImageIcon src={solidIcon.src} alt="Solid logo" />
      <CardGrid.ItemTitle className="text-[1.125rem]">Solid</CardGrid.ItemTitle>
    </Link>
  </CardGrid.Item>
</CardGrid.Wrapper>

```

# editor\getting-started\install\nextjs.mdx

```mdx
---
title: Next.js
meta:
  title: Next.js | Tiptap Editor Docs
  description: Learn how to integrate Tiptap with Next.js to create a versatile and powerful rich text editor for your project.
  category: Editor
---

Integrate Tiptap with your Next.js project using this step-by-step guide.

### Requirements

- [Node](https://nodejs.org/en/download/) installed on your machine
- Experience with [React](https://reactjs.org/)

## Create a project (optional)

If you already have an existing Next.js project, that's fine too. Just skip this step.

For the purpose of this guide, start a new Next.js project called `my-tiptap-project`. The following command sets up everything we need to get started.

\`\`\`bash
# create a project
npx create-next-app my-tiptap-project

# change directory
cd my-tiptap-project
\`\`\`

### Install dependencies

Now that we have a standard boilerplate set up, we can get Tiptap up and running! For this, we will need to install three packages: `@tiptap/react`, `@tiptap/pm`, and `@tiptap/starter-kit`, which includes all the extensions you need to get started quickly.

\`\`\`bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit
\`\`\`

If you followed steps 1 and 2, you can now start your project with `npm run dev` and open [http://localhost:3000/](http://localhost:3000/) in your favorite browser. This might be different if you're working with an existing project.

## Integrate Tiptap

To start using Tiptap, you'll need to add a new component to your app. To do so, first create a directory called `components/`. Now it's time to create our component which we'll call `Tiptap`. To do this, add the following example code in `components/Tiptap.jsx`.

\`\`\`jsx
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const Tiptap = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Hello World! 🌎️</p>',
  })

  return <EditorContent editor={editor} />
}

export default Tiptap
\`\`\`

### Add it to your app

Now, let's replace the content of `app/page.js` (or `pages/index.js`, if you are using the Pages router) with the following example code to use the `Tiptap` component in our app.

\`\`\`jsx
import Tiptap from '../components/Tiptap'

export default function Home() {
  return <Tiptap />
}
\`\`\`

You should now see Tiptap in your browser. Time to give yourself a pat on the back! :)

### Using yjs with Next.js

To avoid the error: `Yjs was already imported. This breaks constructor checks and will lead to issues!`, add the following to your next.js config file. You might have to adjust the 'node_modules/yjs' to '../node_modules/yjs' or '../../node_modules/yjs' depending on where your node_modules are installed.

\`\`\`js
const path = require('path')

module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ensure that all imports of 'yjs' resolve to the same instance
      config.resolve.alias['yjs'] = path.resolve(__dirname, 'node_modules/yjs')
    }
    return config
  },
}
\`\`\`

The original discussion and fix can be found on [Github](https://github.com/yjs/yjs/issues/438#issuecomment-2225079409).

```

# editor\getting-started\install\nuxt.mdx

```mdx
---
title: Nuxt
meta:
  title: Nuxt | Tiptap Editor Docs
  description: Learn how to set up the Tiptap Editor with Nuxt.js for a dynamic rich text editing experience. Dive into our guide in our docs!
  category: Editor
---

This guide covers how to integrate Tiptap with your Nuxt.js project, complete with code examples.

import { CodeDemo } from '@/components/CodeDemo'

### Requirements

- [Node](https://nodejs.org/en/download/) installed on your machine
- Experience with [Vue](https://vuejs.org/v2/guide/#Getting-Started)

## Create a project (optional)

If you already have a Nuxt.js project, that's fine too. Just skip this step.

For the purpose of this project, start with a fresh Nuxt.js project called `my-tiptap-project`. The following command sets up everything we need. It asks a lot of questions, but just use what floats your boat or use the defaults.

\`\`\`bash
# create a project
npm init nuxt-app my-tiptap-project

# change directory
cd my-tiptap-project
\`\`\`

### Install the dependencies

Enough of the boring boilerplate work. Let's install Tiptap! For the following example, you'll need the `@tiptap/vue-3` package with a few components, the `@tiptap/pm` package, and `@tiptap/starter-kit`, which has the most common extensions to get started quickly.

\`\`\`bash
npm install @tiptap/vue-3 @tiptap/pm @tiptap/starter-kit
\`\`\`

If you followed steps 1 and 2, you can now start your project with `npm run dev` and open [http://localhost:8080/](http://localhost:8080/) in your favorite browser. This might be different if you're working with an existing project.

## Integrate Tiptap

To actually start using Tiptap, you'll need to add a new component to your app. Let's call it `TiptapEditor` and put the following example code in `components/TiptapEditor.vue`.

This is the fastest way to get Tiptap up and running with Vue. It will give you a very basic version of Tiptap, without any buttons. No worries, you will be able to add more functionality soon.

\`\`\`html
<template>
  <editor-content :editor="editor" />
</template>

<script>
  import { Editor, EditorContent } from '@tiptap/vue-3'
  import StarterKit from '@tiptap/starter-kit'

  export default {
    components: {
      EditorContent,
    },

    data() {
      return {
        editor: null,
      }
    },

    mounted() {
      this.editor = new Editor({
        content: '<p>I'm running Tiptap with Vue.js. 🎉</p>',
        extensions: [StarterKit],
      })
    },

    beforeUnmount() {
      this.editor.destroy()
    },
  }
</script>
\`\`\`

### Add it to your app

Now, let's replace the content of `pages/index.vue` with the following example code to use our new `TiptapEditor` component in our app.

\`\`\`html
<template>
  <div>
    <client-only>
      <tiptap-editor />
    </client-only>
  </div>
</template>
<script>
  import TiptapEditor from '~/components/TiptapEditor.vue'
  export default {
    components: {
      TiptapEditor,
    },
  }
</script>
\`\`\`

Note that Tiptap needs to run in the client, not on the server. It's required to wrap the editor in a `<client-only>` tag. [Read more about client-only components.](https://nuxtjs.org/api/components-client-only)

You should now see Tiptap in your browser. Time to give yourself a pat on the back! :)

### Use v-model (optional)

You're probably used to binding your data with `v-model` in forms. This also possible with Tiptap. Here's a working example component, that you can integrate in your project:

<CodeDemo path="/GuideGettingStarted/VModel" />

\`\`\`html
<template>
  <editor-content :editor="editor" />
</template>

<script>
  import { Editor, EditorContent } from '@tiptap/vue-3'
  import StarterKit from '@tiptap/starter-kit'

  export default {
    components: {
      EditorContent,
    },

    props: {
      value: {
        type: String,
        default: '',
      },
    },

    data() {
      return {
        editor: null,
      }
    },

    watch: {
      value(value) {
        // HTML
        const isSame = this.editor.getHTML() === value

        // JSON
        // const isSame = JSON.stringify(this.editor.getJSON()) === JSON.stringify(value)

        if (isSame) {
          return
        }

        this.editor.commands.setContent(value, false)
      },
    },

    mounted() {
      this.editor = new Editor({
        content: this.value,
        extensions: [StarterKit],
        onUpdate: () => {
          // HTML
          this.$emit('input', this.editor.getHTML())

          // JSON
          // this.$emit('input', this.editor.getJSON())
        },
      })
    },

    beforeUnmount() {
      this.editor.destroy()
    },
  }
</script>
\`\`\`

```

# editor\getting-started\install\php.mdx

```mdx
---
title: PHP
meta:
  title: PHP | Tiptap Editor Docs
  description: Discover how to utilize Tiptap within PHP environments, including Laravel and Livewire. Access the guide in our docs!
  category: Editor
---

import { Callout } from '@/components/ui/Callout'

You can use Tiptap with Laravel, Livewire, Inertia.js, Alpine.js, Tailwind CSS, and even—yes, you read that right—inside PHP.

We provide [an official PHP package to work with Tiptap content](/editor/api/utilities/tiptap-for-php). You can transform Tiptap-compatible JSON to HTML and vice versa, sanitize your content, or just modify it.

## Laravel Livewire

### my-livewire-component.blade.php

\`\`\`html
<!--
  In your livewire component you could add an
  autosave method to handle saving the content
  from the editor every 10 seconds if you wanted
-->
<x-editor wire:model="foo" wire:poll.10000ms="autosave"></x-editor>
\`\`\`

<Callout variant="default" title="Hint">

    The `.defer` modifier is no longer available in Livewire v3, as updating the state is deferred by default. Use the `.live` modifier if you need to update the state server-side, as it changes.

</Callout>

### editor.blade.php

\`\`\`html
<div
  x-data="setupEditor(
    $wire.entangle('{{ $attributes->wire('model')->value() }}').defer
  )"
  x-init="() => init($refs.editor)"
  wire:ignore
  {{ $attributes->whereDoesntStartWith('wire:model') }}
>
  <div x-ref="editor"></div>
</div>
\`\`\`

### index.js

\`\`\`js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

window.setupEditor = function (content) {
  let editor

  return {
    content: content,

    init(element) {
      editor = new Editor({
        element: element,
        extensions: [StarterKit],
        content: this.content,
        onUpdate: ({ editor }) => {
          this.content = editor.getHTML()
        },
      })

      this.$watch('content', (content) => {
        // If the new content matches TipTap's then we just skip.
        if (content === editor.getHTML()) return

        /*
          Otherwise, it means that an external source
          is modifying the data on this Alpine component,
          which could be Livewire itself.
          In this case, we only need to update Tiptap's
          content and we're done.
          For more information on the `setContent()` method, see:
            https://www.tiptap.dev/api/commands/set-content
        */
        editor.commands.setContent(content, false)
      })
    },
  }
}
\`\`\`

```

# editor\getting-started\install\react.mdx

```mdx
---
title: React
meta:
  title: React | Tiptap Editor Docs
  description: Learn how to integrate the Tiptap Editor with a React app and develop your custom editor experience.
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'

This guide describes how to integrate Tiptap with your React project. We're using Vite, but the workflow should be similar with other setups.

<CodeDemo path="/Examples/Default" />

### Create a React project (optional)

Start with a fresh React project called `my-tiptap-project`. [Vite](https://vitejs.dev/guide/) will set up everything we need.

\`\`\`bash
# create a project with npm
npm create vite@latest my-tiptap-project -- --template react-ts

# OR, create a project with pnpm
pnpm create vite@latest my-tiptap-project --template react-ts

# OR, create a project with yarn
yarn create vite my-tiptap-project --template react-ts

# change directory
cd my-tiptap-project
\`\`\`

### Install dependencies

Next, install the `@tiptap/react` package, `@tiptap/pm` (the ProseMirror library), and `@tiptap/starter-kit`, which includes the most common extensions to get started quickly.

\`\`\`bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit
\`\`\`

If you followed steps 1 and 2, you can now start your project with `npm run dev` and open [http://localhost:3000](http://localhost:3000) in your browser.

## Integrate Tiptap

To actually start using Tiptap we need to create a new component. Let's call it `Tiptap` and add the following example code in `src/Tiptap.tsx`.

\`\`\`jsx
// src/Tiptap.tsx
import { EditorProvider, FloatingMenu, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

// define your extension array
const extensions = [StarterKit]

const content = '<p>Hello World!</p>'

const Tiptap = () => {
  return (
    <EditorProvider extensions={extensions} content={content}>
      <FloatingMenu editor={null}>This is the floating menu</FloatingMenu>
      <BubbleMenu editor={null}>This is the bubble menu</BubbleMenu>
    </EditorProvider>
  )
}

export default Tiptap
\`\`\`

**Important Note**: You can always use the `useEditor` hook if you want to avoid using the Editor context.

\`\`\`jsx
// src/Tiptap.tsx
import { useEditor, EditorContent, FloatingMenu, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

// define your extension array
const extensions = [StarterKit]

const content = '<p>Hello World!</p>'

const Tiptap = () => {
  const editor = useEditor({
    extensions,
    content,
  })

  return (
    <>
      <EditorContent editor={editor} />
      <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu>
      <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu>
    </>
  )
}

export default Tiptap
\`\`\`

### Add it to your app

Finally, replace the content of `src/App.tsx` with our new `Tiptap` component.

\`\`\`jsx
import Tiptap from './Tiptap'

const App = () => {
  return (
    <div className="card">
      <Tiptap />
    </div>
  )
}

export default App
\`\`\`

### Consume the Editor context in child components

If you use the `EditorProvider` to set up your Tiptap editor, you can now access your editor instance from any child component using the `useCurrentEditor` hook.

\`\`\`tsx
import { useCurrentEditor } from '@tiptap/react'

const EditorJSONPreview = () => {
  const { editor } = useCurrentEditor()

  return <pre>{JSON.stringify(editor.getJSON(), null, 2)}</pre>
}
\`\`\`

**Important**: This won't work if you use the `useEditor` hook to setup your editor.

You should now see a pretty barebones example of Tiptap in your browser.

### Add before or after slots

Since the EditorContent component is rendered by the `EditorProvider` component, we now can't directly define where to render before or after content of our editor. For that, we can use the `slotBefore` and `slotAfter` props on the `EditorProvider` component.

\`\`\`tsx
<EditorProvider
  extensions={extensions}
  content={content}
  slotBefore={<MyEditorToolbar />}
  slotAfter={<MyEditorFooter />}
/>
\`\`\`

### Container props

The `EditorProvider` component accepts an `editorContainerProps` prop to pass attributes to the container element of the editor provider.

\`\`\`tsx
<EditorProvider
  extensions={extensions}
  content={content}
  editorContainerProps={{ className: 'editor-container' }}
/>
\`\`\`

## Optimize your performance

We recommend visiting the [React Performance Guide](/guides/performance) to integrate the Tiptap Editor efficiently. This will help you avoid potential issues as your app scales.

```

# editor\getting-started\install\svelte.mdx

```mdx
---
title: Svelte
meta:
  title: Svelte | Tiptap Editor Docs
  description: Discover how to set up Tiptap with Svelte for a dynamic rich text editing experience. Follow our detailed guide in our docs!
  category: Editor
---

Learn how to integrate Tiptap with your SvelteKit project using this step-by-sep guide. Alternatively, check out our [Svelte text editor example](/examples/basics/default-text-editor).

## Take a shortcut: Svelte REPL with Tiptap

If you want to jump into it right away, here is a [Svelte REPL with Tiptap](https://svelte.dev/repl/798f1b81b9184780aca18d9a005487d2?version=3.31.2).

### Requirements

- [Node](https://nodejs.org/en/download/) installed on your machine
- Experience with [Svelte](https://svelte.dev/docs#getting-started)

## Create a project (optional)

If you already have a SvelteKit project, that's fine too. Just skip this step.

For the purpose of this guide, start with a fresh SvelteKit project called `my-tiptap-project`. The following commands set up everything we need. It asks a lot of questions, but select your preferred options or use the defaults.

\`\`\`bash
npm create svelte@latest my-tiptap-project
cd my-tiptap-project
npm install
npm run dev
\`\`\`

### Install dependencies

Now that we're done with boilerplate, let's install Tiptap! For the following example you'll need the `@tiptap/core` package, with a few components, `@tiptap/pm`, and `@tiptap/starter-kit`, which includes the most common extensions to get started quickly.

\`\`\`bash
npm install @tiptap/core @tiptap/pm @tiptap/starter-kit
\`\`\`

If you followed steps 1 and 2, you can now start your project with `npm run dev` and open [http://localhost:3000/](http://localhost:3000/) in your favorite browser. This might be different if you're working with an existing project.

## Integrate Tiptap

To start using Tiptap, you'll need to add a new component to your app. Let's call it `Tiptap` and add the following example code in `src/lib/Tiptap.svelte`.

This is the fastest way to get Tiptap up and running with SvelteKit. It will give you a very basic version of Tiptap, without any buttons. No worries, you will be able to add more functionality soon.

\`\`\`svelte
<script>
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';

	let element;
	let editor;

	onMount(() => {
		editor = new Editor({
			element: element,
			extensions: [StarterKit],
			content: '<p>Hello World! 🌍️ </p>',
			onTransaction: () => {
				// force re-render so `editor.isActive` works as expected
				editor = editor;
			},
		});
	});

	onDestroy(() => {
		if (editor) {
			editor.destroy();
		}
	});
</script>

{#if editor}
	<button
		on:click={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
		class:active={editor.isActive('heading', { level: 1 })}
	>
		H1
	</button>
	<button
		on:click={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
		class:active={editor.isActive('heading', { level: 2 })}
	>
		H2
	</button>
	<button
		on:click={() => editor.chain().focus().setParagraph().run()}
		class:active={editor.isActive('paragraph')}
	>
		P
	</button>
{/if}

<div bind:this={element} />

<style>
	button.active {
		background: black;
		color: white;
	}
</style>
\`\`\`

## Add it to your app

Now, let's replace the content of `src/routes/+page.svelte` with the following example code to use our new `Tiptap` component in our app.

\`\`\`svelte
<script>
  import Tiptap from '$lib/Tiptap.svelte'
</script>

<main>
  <Tiptap />
</main>
\`\`\`

Tiptap should now be visible in your browser. Time to give yourself a pat on the back! :)

```

# editor\getting-started\install\vanilla-javascript.mdx

```mdx
---
title: Vanilla JavaScript
meta:
  title: Vanilla JavaScript | Tiptap Editor Docs
  description: Learn how to set up the Tiptap Editor with Vanilla JavaScript, install dependencies and initialize the editor in the docs!
category: Editor
---

import { Callout } from '@/components/ui/Callout'

Are you using plain JavaScript or a framework that isn't listed? No worries, we provide everything you need.

<Callout title="Hint" variant="hint">
    If you don't use a bundler like Webpack or Rollup, please follow the [CDN](/editor/getting-started/install/cdn) guide instead. Since Tiptap is built in a modular way, you will need to use `<script type="module">` in your HTML to get our CDN imports working.
</Callout>

## Install dependencies

For the following example, you will need `@tiptap/core` (the actual editor), `@tiptap/pm` (the ProseMirror library), and `@tiptap/starter-kit`. The StarterKit doesn't include all extensions, only the most common ones.

\`\`\`bash
npm install @tiptap/core @tiptap/pm @tiptap/starter-kit
\`\`\`

### Add markup

Add the following HTML where you'd like to mount the editor:

\`\`\`html
<div class="element"></div>
\`\`\`

## Initialize the editor

Everything is in place, so let's set up the editor. Add the following code to your JavaScript:

\`\`\`js
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

new Editor({
  element: document.querySelector('.element'),
  extensions: [StarterKit],
  content: '<p>Hello World!</p>',
})
\`\`\`

Open your project in the browser to see Tiptap in action. Good work!

```

# editor\getting-started\install\vue2.mdx

```mdx
---
title: Vue 2
meta:
  title: Vue 2 | Tiptap Editor Docs
  description: Learn how to set up Tiptap with Vue 2 for enhanced rich text editing capabilities. Follow our step-by-step guide in our docs!
  category: Editor
---

This guide details how to integrate Tiptap with your Vue 2 project. Alternatively, check out our [Vue text editor example](/examples/basics/default-text-editor).

### Requirements

- [Node](https://nodejs.org/en/download/) installed on your machine
- [Vue CLI](https://cli.vuejs.org/) installed on your machine
- Experience with [Vue](https://vuejs.org/v2/guide/#Getting-Started)

## Create a project (optional)

If you already have a Vue project, that's fine too. Just skip this step.

For the purpose of this guide, start with a fresh Vue project called `my-tiptap-project`. The Vue CLI sets up everything we need, just select the default Vue 2 template.

\`\`\`bash
# create a project
vue create my-tiptap-project

# change directory
cd my-tiptap-project
\`\`\`

### Install the dependencies

Okay, enough of the boring boilerplate work. Let's finally install Tiptap! For the following example you'll need the `@tiptap/vue-2` package, `@tiptap/pm` (the ProseMirror library) and `@tiptap/starter-kit`, which includes the most common extensions to get started quickly.

\`\`\`bash
npm install @tiptap/vue-2 @tiptap/pm @tiptap/starter-kit
\`\`\`

If you followed step 1 and 2, you can now start your project with `npm run dev`, and open [http://localhost:8080](http://localhost:8080) in your favorite browser. This might be different, if you're working with an existing project.

## Integrate Tiptap

To actually start using Tiptap, you'll need to add a new component to your app. Let's call it `Tiptap` and put the following example code in `components/Tiptap.vue`.

This is the fastest way to get Tiptap up and running with Vue. It will give you a very basic version of Tiptap, without any buttons. No worries, you will be able to add more functionality soon.

\`\`\`html
<template>
  <editor-content :editor="editor" />
</template>

<script>
  import { Editor, EditorContent } from '@tiptap/vue-2'
  import StarterKit from '@tiptap/starter-kit'

  export default {
    components: {
      EditorContent,
    },

    data() {
      return {
        editor: null,
      }
    },

    mounted() {
      this.editor = new Editor({
        content: "<p>I'm running Tiptap with Vue.js. 🎉</p>",
        extensions: [StarterKit],
      })
    },

    beforeDestroy() {
      this.editor.destroy()
    },
  }
</script>
\`\`\`

### Add it to your app

Now, let's replace the content of `src/App.vue` with the following example code to use our new `Tiptap` component in our app.

\`\`\`html
<template>
  <div id="app">
    <tiptap />
  </div>
</template>

<script>
  import Tiptap from './components/Tiptap.vue'

  export default {
    name: 'App',
    components: {
      Tiptap,
    },
  }
</script>
\`\`\`

You should now see Tiptap in your browser. Time to give yourself a pat on the back! :)

### Use v-model (optional)

You're probably used to bind your data with `v-model` in forms, that's also possible with Tiptap. Here is a working example component, that you can integrate in your project:

\`\`\`html
<template>
  <editor-content :editor="editor" />
</template>

<script>
  import { Editor, EditorContent } from '@tiptap/vue-2'
  import StarterKit from '@tiptap/starter-kit'

  export default {
    components: {
      EditorContent,
    },

    props: {
      value: {
        type: String,
        default: '',
      },
    },

    data() {
      return {
        editor: null,
      }
    },

    watch: {
      value(value) {
        // HTML
        const isSame = this.editor.getHTML() === value

        // JSON
        // const isSame = JSON.stringify(this.editor.getJSON()) === JSON.stringify(value)

        if (isSame) {
          return
        }

        this.editor.commands.setContent(value, false)
      },
    },

    mounted() {
      this.editor = new Editor({
        content: this.value,
        extensions: [StarterKit],
        onUpdate: () => {
          // HTML
          this.$emit('input', this.editor.getHTML())

          // JSON
          // this.$emit('input', this.editor.getJSON())
        },
      })
    },

    beforeDestroy() {
      this.editor.destroy()
    },
  }
</script>
\`\`\`

```

# editor\getting-started\install\vue3.mdx

```mdx
---
title: Vue 3
meta:
  title: Vue 3 | Tiptap Editor Docs
  description: Learn how to set up Tiptap with Vue 3 for enhanced rich text editing. Get started with our thorough guide in our docs!
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'

Discover how to integrate Tiptap with your Vue 3 project using this step-by-step guide. Alternatively, check out our [Vue text editor example](/examples/basics/default-text-editor).

### Requirements

- [Node](https://nodejs.org/en/download/) installed on your machine
- [Vue CLI](https://cli.vuejs.org/) installed on your machine
- Experience with [Vue](https://v3.vuejs.org/guide/introduction.html)

## Create a project (optional)

If you already have a Vue project, that's fine too. Just skip this step.

For the purpose of this guide, start with a fresh Vue project called `my-tiptap-project`. The Vue CLI sets up everything we need. Just select the Vue 3 template.

\`\`\`bash
# create a project
vue create my-tiptap-project

# change directory
cd my-tiptap-project
\`\`\`

### Install the dependencies

Okay, enough boilerplate work. Let's finally install Tiptap! For the following example, you'll need the `@tiptap/vue-3` package, `@tiptap/pm` (the ProseMirror library), and `@tiptap/starter-kit`, which includes the most common extensions to get started quickly.

\`\`\`bash
npm install @tiptap/vue-3 @tiptap/pm @tiptap/starter-kit
\`\`\`

If you followed steps 1 and 2, you can now start your project with `npm run dev` and open [http://localhost:8080](http://localhost:8080) in your favorite browser. This might be different if you're working with an existing project.

## Integrate Tiptap

To start using Tiptap, you'll need to add a new component to your app. Let's call it `Tiptap` and put the following example code in `components/Tiptap.vue`.

This is the fastest way to get Tiptap up and running with Vue. It will give you a very basic version of Tiptap, without any buttons. No worries, you will be able to add more functionality soon.

\`\`\`html
<template>
  <editor-content :editor="editor" />
</template>

<script>
  import { Editor, EditorContent } from '@tiptap/vue-3'
  import StarterKit from '@tiptap/starter-kit'

  export default {
    components: {
      EditorContent,
    },

    data() {
      return {
        editor: null,
      }
    },

    mounted() {
      this.editor = new Editor({
        content: "<p>I'm running Tiptap with Vue.js. 🎉</p>",
        extensions: [StarterKit],
      })
    },

    beforeUnmount() {
      this.editor.destroy()
    },
  }
</script>
\`\`\`

Alternatively, you can use the Composition API with the `useEditor` method.

\`\`\`html
<template>
  <editor-content :editor="editor" />
</template>

<script>
  import { useEditor, EditorContent } from '@tiptap/vue-3'
  import StarterKit from '@tiptap/starter-kit'

  export default {
    components: {
      EditorContent,
    },

    setup() {
      const editor = useEditor({
        content: "<p>I'm running Tiptap with Vue.js. 🎉</p>",
        extensions: [StarterKit],
      })

      return { editor }
    },
  }
</script>
\`\`\`

Or feel free to use the new [`<script setup>` syntax](https://v3.vuejs.org/api/sfc-script-setup.html).

\`\`\`html
<template>
  <editor-content :editor="editor" />
</template>

<script setup>
  import { useEditor, EditorContent } from '@tiptap/vue-3'
  import StarterKit from '@tiptap/starter-kit'

  const editor = useEditor({
    content: "<p>I'm running Tiptap with Vue.js. 🎉</p>",
    extensions: [StarterKit],
  })
</script>
\`\`\`

### Add it to your app

Now, let's replace the content of `src/App.vue` with the following example code to use our new `Tiptap` component in our app.

\`\`\`html
<template>
  <div id="app">
    <tiptap />
  </div>
</template>

<script>
  import Tiptap from './components/Tiptap.vue'

  export default {
    name: 'App',
    components: {
      Tiptap,
    },
  }
</script>
\`\`\`

You should now see Tiptap in your browser. Time to give yourself a pat on the back! :)

### Use v-model (optional)

You're probably used to binding your data with `v-model` in forms, that's also possible with Tiptap. Here is how that would work with Tiptap:

<CodeDemo path="/GuideGettingStarted/VModel" />

```

# editor\getting-started\overview.mdx

```mdx
---
title: Integrate the Tiptap Editor
tags:
  - type: image
    src: https://img.shields.io/npm/v/@tiptap/core.svg?label=version
    url: https://www.npmjs.com/package/@tiptap/core
    label: Version
  - type: image
    src: https://img.shields.io/npm/dm/@tiptap/core.svg
    url: https://npmcharts.com/compare/@tiptap/core?minimal=true
    label: Downloads
  - type: image
    src: https://img.shields.io/npm/l/@tiptap/core.svg
    url: https://www.npmjs.com/package/@tiptap/core
    label: License
meta:
  title: Getting started | Tiptap Editor Docs
  description: Build a custom rich text editor with Tiptap, a customizable and headless editor framework. Learn more about Tiptap in the docs.
  category: Editor
---

import Link from '@/components/Link'
import { ArrowRightIcon } from 'lucide-react'
import * as CtaBox from '@/components/CtaBox'
import { Button } from '@/components/ui/Button'
import * as CardGrid from '@/components/CardGrid'
import { Tag } from '@/components/ui/Tag'
import { Section } from '@/components/ui/Section'
import contentTemplatesImage from '@/assets/content-templates.png'
import * as ImageCard from '@/components/ImageCard'

Tiptap is a headless wrapper around ProseMirror, a rich text WYSIWYG editor toolkit used by companies like The New York Times, The Guardian, and Atlassian for their content workflows.

## Why use the Tiptap Editor?

Tiptap lets you create a fully customizable rich text editor using modular building blocks. It offers a range of open-source and Pro extensions, allowing you to configure every part of the editor with a few lines of code. The API lets you customize and extend editor functionality.

### Framework-agnostic

Tiptap works across multiple frameworks, including React, Vue, Svelte, and more. Developers often use the vanilla JavaScript integration to adapt Tiptap to their preferred framework. [Learn how to integrate Tiptap with your framework](/editor/getting-started/install).

### Start with a template

By default, Tiptap doesn't provide a user interface, giving you full control over its design and behavior. You don't need to overwrite classes, use !important, or any other hacks. Instead, create your own interface within your setup.

If you want to start quickly, we offer a Notion-inspired template as a reference.

<ImageCard.Card>
  <ImageCard.Image src={contentTemplatesImage.src} alt="User interface templates for Tiptap" />
  <ImageCard.Content>
    <ImageCard.Title>Notion-like editor</ImageCard.Title>
    <ImageCard.Paragraph>
      A clean interface with block-based editing tools that let users create and organize content.
    </ImageCard.Paragraph>
    <div className="flex items-center gap-2 mt-8">
      <Button asChild variant="secondary">
        <Link href="https://templates.tiptap.dev/">
          Try demo
          <ArrowRightIcon className="size-4" />
        </Link>
      </Button>
      <Button asChild variant="tertirary">
        <Link href="https://cloud.tiptap.dev/react-templates">
          Get access
          <ArrowRightIcon className="size-4" />
        </Link>
      </Button>
    </div>
  </ImageCard.Content>
</ImageCard.Card>

### Add extensions to your editor

Expand editor functionality with extensions that add capabilities or modify behavior. These include basic extensions that don't change the schema and complex nodes and marks that render rich content.

You can start with the [`StarterKit`](/editor/extensions/functionality/starterkit), which includes common extensions.

We provide a range of open-source and more sophisticated Pro extensions. For detailed instructions on using and creating extensions, visit our [extensions](/editor/core-concepts/extensions) and [custom extensions](/editor/extensions/custom-extensions) guides.

Additionally, developers can use the [Awesome Tiptap Repository](https://github.com/ueberdosis/awesome-tiptap) to discuss and share community-created custom extensions.

<CtaBox.Wrapper>
  <CtaBox.Title>Unlock the Editor's full potential</CtaBox.Title>
  <CtaBox.Description>
    Integrate advanced text editor features with the Tiptap Collaboration Server.
  </CtaBox.Description>
  <CtaBox.List>
    <CtaBox.ListItem>Add comments, document history, and more</CtaBox.ListItem>
    <CtaBox.ListItem>Enable real-time collaboration capabilities</CtaBox.ListItem>
    <CtaBox.ListItem>
      Host on your infrastructure or as a managed service hosted by Tiptap
    </CtaBox.ListItem>
  </CtaBox.List>
  <CtaBox.Actions className="-mx-3">
    <Button className="text-white/80 hover:text-white/100" variant="tertiary" asChild>
      <Link href="/collaboration/getting-started/overview">
        Learn more
        <ArrowRightIcon className="w-4 h-4" />
      </Link>
    </Button>
  </CtaBox.Actions>
</CtaBox.Wrapper>
<br />
<br />
<br />
<Section title="Editor resources" moreLink={{ label: 'Browse guides', url: '/docs/guides' }}>
  <CardGrid.Wrapper>
    <CardGrid.Item asChild>
      <Link href="/editor/getting-started/configure">
        <CardGrid.Subtitle size="sm">First Steps</CardGrid.Subtitle>
        <div>
          <CardGrid.ItemTitle>How to set up and configure the Tiptap editor?</CardGrid.ItemTitle>
        </div>
        <CardGrid.ItemFooter>
          <Tag>Editor</Tag>
        </CardGrid.ItemFooter>
      </Link>
    </CardGrid.Item>
    <CardGrid.Item asChild>
      <Link href="/guides/pro-extensions">
        <CardGrid.Subtitle size="sm">First Steps</CardGrid.Subtitle>
        <div>
          <CardGrid.ItemTitle>How to integrate Pro Extensions?</CardGrid.ItemTitle>
        </div>
        <CardGrid.ItemFooter>
          <Tag>Editor</Tag>
          <Tag>Collaboration</Tag>
        </CardGrid.ItemFooter>
      </Link>
    </CardGrid.Item>
    <CardGrid.Item asChild>
      <Link href="/collaboration/getting-started/install">
        <CardGrid.Subtitle size="sm">First Steps</CardGrid.Subtitle>
        <div>
          <CardGrid.ItemTitle>How to make your Editor collaborative?</CardGrid.ItemTitle>
        </div>
        <CardGrid.ItemFooter>
          <Tag>Editor</Tag>
          <Tag>Collaboration</Tag>
        </CardGrid.ItemFooter>
      </Link>
    </CardGrid.Item>
    <CardGrid.Item asChild>
      <Link href="/editor/getting-started/style-editor">
        <CardGrid.Subtitle size="sm">Styling</CardGrid.Subtitle>
        <div>
          <CardGrid.ItemTitle>
            How to apply styling to the headless Tiptap Editor
          </CardGrid.ItemTitle>
        </div>
        <CardGrid.ItemFooter>
          <Tag>Editor</Tag>
        </CardGrid.ItemFooter>
      </Link>
    </CardGrid.Item>
  </CardGrid.Wrapper>
</Section>

```

# editor\getting-started\style-editor\custom-menus.mdx

```mdx
---
title: How to develop a custom menu
meta:
  title: Custom menu | Tiptap Editor Docs
  description: Learn how to develop a custom bubble or floating menu in your Tiptap editor. Learn more in our documentation!
  category: Editor
---

import { Callout } from '@/components/ui/Callout'
import { CodeDemo } from '@/components/CodeDemo'

Tiptap comes very raw, but that's a good thing. You have full control over the editor's appearance.

When we say full control, we mean it. You can (and have to) build a menu on your own, although Tiptap will help you wire everything up.

## Menus

The editor provides a fluent API to trigger commands and add active states. You can use any markup you like. To simplify menu positioning, Tiptap provides a few utilities and components. Let's go through the most typical use cases one by one.

### Fixed menu

A fixed menu is one that permanently sits in one location. For example, it's popular to place a fixed menu above the editor. Tiptap doesn't come with a fixed menu, but you can build one by creating a `<div>` element and filling it with `<button>` elements. [See below](#buttons) to learn how those buttons can trigger [commands](/editor/api/commands) in the editor, for example bolding or italicizing text.

### Bubble menu

A [bubble menu](/editor/extensions/functionality/bubble-menu) is one that appears when selecting text. The markup and styling are entirely up to you.

<CodeDemo path="/Extensions/BubbleMenu?inline=false&hideSource=true" />

### Floating menu

A [floating menu](/editor/extensions/functionality/floatingmenu) appears in the editor when you place your cursor on an empty line. Again, the markup and styling are entirely up to you.

<CodeDemo path="/Extensions/FloatingMenu?inline=false&hideSource=true" />

### Slash commands (work in progress)

Although there isn't an official extension yet, there is [an experiment](/examples/experiments/slash-commands) that allows you to use "slash commands." With slash commands, typing `/` at the beginning of a new line will reveal a popup menu.

## Buttons

Okay, you've got your menu. But how do you wire things up?

### Commands

You've got the editor running already and want to add your first button. You need a `<button>` HTML tag with a click handler. Depending on your setup, that can look like the following example:

\`\`\`html
<button onclick="editor.chain().focus().toggleBold().run()">Bold</button>
\`\`\`

Oh, that's a long command, right? Actually, it's a [chain of commands](/editor/api/commands). Let's go through this one by one:

\`\`\`js
editor.chain().focus().toggleBold().run()
\`\`\`

1. `editor` should be a Tiptap instance,
2. `chain()` is used to tell the editor you want to execute multiple commands,
3. `focus()` sets the focus back to the editor,
4. `toggleBold()` marks the selected text bold. If the text is already bold, it removes the bold mark.
5. `run()` will execute the chain.

In other words: This will be a typical **Bold** button for your text editor.

The available commands depend on the extensions registered with the editor. Most extensions come with a `set…()`, `unset…()`, and `toggle…()` command. Read the extension documentation to see what's actually available or just surf through your code editor's autocomplete.

### Keep the focus

You have already seen the `focus()` command in the above example. When you click on the button, the browser focuses that DOM element and the editor loses focus. It's likely you want to add `focus()` to all your menu buttons, so the writing flow of your users isn't interrupted.

### The active state

The editor provides an `isActive()` method to check if something is applied to the selected text already. In Vue.js you can toggle a CSS class with help of that function:

\`\`\`html
<button
  :class="{ 'is-active': editor.isActive('bold') }"
  @click="editor.chain().focus().toggleBold().run()"
>
  Bold
</button>
\`\`\`

This toggles the `.is-active` class for nodes and marks. You can even check for specific attributes. Here is an example with the [`Highlight`](/editor/extensions/marks/highlight) mark that ignores different attributes:

\`\`\`js
editor.isActive('highlight')
\`\`\`

And an example that compares the given attribute(s):

\`\`\`js
editor.isActive('highlight', { color: '#ffa8a8' })
\`\`\`

There is even support for regular expressions:

\`\`\`js
editor.isActive('textStyle', { color: /.*/ })
\`\`\`

You can even check nodes and marks, but check for the attributes only. Here is an example with the [`TextAlign`](/editor/extensions/functionality/textalign) extension:

\`\`\`js
editor.isActive({ textAlign: 'right' })
\`\`\`

If your selection spans multiple nodes or marks, or only part of the selection has a mark, `isActive()` will return `false` and indicate nothing is active. This behavior is intentional, as it allows users to apply a new node or mark to the selection right away.

## User experience

When designing a great user experience you should consider a few things.

### Accessibility

- Make sure users can navigate the menu with their keyboard
- Use [title attributes](https://developer.mozilla.org/de/docs/Web/HTML/Global_attributes/title)
- Use [ARIA attributes](https://developer.mozilla.org/en-US/docs/Learn/Accessibility/WAI-ARIA_basics)
- List available keyboard shortcuts

### Icons

Most editor menus use icons for their buttons. In some of our demos, we use the open source icon set [Remix Icon](https://remixicon.com/). However, you can use any icon set you prefer. Here are a few suggestions:

- [Remix Icon](https://remixicon.com/#editor)
- [Font Awesome](https://fontawesome.com/icons?c=editors)
- [UI icons](https://www.ibm.com/design/language/iconography/ui-icons/library/)

```

# editor\getting-started\style-editor\index.mdx

```mdx
---
title: Styling the Editor
meta:
  title: Style your editor | Tiptap Editor Docs
  description: Apply custom styles to your Tiptap editor using plain HTML, custom classes, or Tailwind CSS. Learn more in the docs!
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'
import Link from '@/components/Link'
import { ArrowRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import * as ImageCard from '@/components/ImageCard'
import contentTemplatesImage from '@/assets/content-templates.png'


Tiptap is headless, which means there is no styling provided. That also means you are in full control of how your editor looks. The following methods allow you to apply custom styles to the editor.

<ImageCard.Card>
    <ImageCard.Image src={contentTemplatesImage.src} alt="User interface templates for Tiptap" />
    <ImageCard.Content>
        <ImageCard.Title>Wanna take a shortcut?</ImageCard.Title>
        <ImageCard.Paragraph>Speed up your Tiptap integration into your React app with our UI template. It's ready for deployment as-is or can be customized to your needs.</ImageCard.Paragraph>
        <div className="flex items-center gap-2 mt-8">
            <Button asChild variant="secondary">
                <Link href="https://templates.tiptap.dev/">
                    Try demo
                    <ArrowRightIcon className="size-4" />
                </Link>
            </Button>
            <Button asChild variant="tertirary">
                <Link href="https://cloud.tiptap.dev/react-templates">
                    Get access
                    <ArrowRightIcon className="size-4" />
                </Link>
            </Button>
        </div>
    </ImageCard.Content>
</ImageCard.Card>

## Style plain HTML

The entire editor is rendered inside a container with the class `.tiptap`. You can use that to scope your styling to the editor content:

\`\`\`css
/* Scoped to the editor */
.tiptap p {
  margin: 1em 0;
}
\`\`\`

If you're rendering the stored content elsewhere, there won't be a `.tiptap` container, so you can globally add styling to the relevant HTML tags:

\`\`\`css
/* Global styling */
p {
  margin: 1em 0;
}
\`\`\`

## Add custom classes

You can control the whole rendering, including adding classes to everything.

### Extensions

Most extensions allow you to add attributes to the rendered HTML through the `HTMLAttributes` option. You can use that to add a custom class (or any other attribute). That's also very helpful when you work with [Tailwind CSS](https://tailwindcss.com/).

\`\`\`js
new Editor({
  extensions: [
    Document,
    Paragraph.configure({
      HTMLAttributes: {
        class: 'my-custom-paragraph',
      },
    }),
    Heading.configure({
      HTMLAttributes: {
        class: 'my-custom-heading',
      },
    }),
    Text,
  ],
})
\`\`\`

The rendered HTML will look like this:

\`\`\`html
<h1 class="my-custom-heading">Example Text</h1>
<p class="my-custom-paragraph">Wow, that's really custom.</p>
\`\`\`

If there are already classes defined by the extensions, your classes will be added.

### Editor

You can even pass classes to the element that contains the editor:

\`\`\`js
new Editor({
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
    },
  },
})
\`\`\`

## Customize HTML

Or you can customize the markup for extensions. The following example will make a custom bold extension that doesn't render a `<strong>` tag, but a `<b>` tag:

\`\`\`js
import Bold from '@tiptap/extension-bold'

const CustomBold = Bold.extend({
  renderHTML({ HTMLAttributes }) {
    // Original:
    // return ['strong', HTMLAttributes, 0]
    return ['b', HTMLAttributes, 0]
  },
})

new Editor({
  extensions: [
    // …
    CustomBold,
  ],
})
\`\`\`

You should place your custom extensions in separate files for better organization, but you get the idea.

## Style using Tailwind CSS

The editor works fine with Tailwind CSS, too. Find an example that's styled with the `@tailwindcss/typography` plugin below.

<CodeDemo path="/Experiments/Tailwind?inline=false" />

### Intellisense

If you're using [TailwindCSS Intellisense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss), add this snippet to your `.vscode/setting.json` to enable intellisense support inside Tiptap objects:

\`\`\`json
"tailwindCSS.experimental.classRegex": [
  "class:\\s*?[\"'`]([^\"'`]*).*?,"
]
\`\`\`

```

# editor\sidebar.ts

```ts
import { SidebarConfig } from '@/types'

export const sidebarConfig: SidebarConfig = {
  id: 'editor',
  rootHref: '/editor/getting-started/overview',
  title: 'Editor',
  items: [
    {
      type: 'group',
      href: '/editor/getting-started',
      title: 'Getting started',
      children: [
        {
          title: 'Overview',
          href: '/editor/getting-started/overview',
        },
        {
          title: 'Install',
          href: '/editor/getting-started/install',
          children: [
            {
              href: '/editor/getting-started/install/vanilla-javascript',
              title: 'Vanilla JavaScript',
            },
            {
              href: '/editor/getting-started/install/react',
              title: 'React',
            },
            {
              href: '/editor/getting-started/install/nextjs',
              title: 'Next.js',
            },
            {
              href: '/editor/getting-started/install/vue3',
              title: 'Vue 3',
            },
            {
              href: '/editor/getting-started/install/vue2',
              title: 'Vue 2',
            },
            {
              href: '/editor/getting-started/install/nuxt',
              title: 'Nuxt',
            },
            {
              href: '/editor/getting-started/install/svelte',
              title: 'Svelte',
            },
            {
              href: '/editor/getting-started/install/alpine',
              title: 'Alpine',
            },
            {
              href: '/editor/getting-started/install/php',
              title: 'PHP',
            },
            {
              href: '/editor/getting-started/install/cdn',
              title: 'CDN',
            },
          ],
        },
        {
          title: 'Configure',
          href: '/editor/getting-started/configure',
        },
        {
          title: 'Styling',
          href: '/editor/getting-started/style-editor',
          children: [
            {
              href: '/editor/getting-started/style-editor/custom-menus',
              title: 'Custom menus',
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      title: 'Extensions',
      href: '/editor/extensions',
      children: [
        {
          href: '/editor/extensions/overview',
          title: 'Overview',
        },
        {
          href: '/editor/extensions/nodes',
          title: 'Nodes',
          children: [
            {
              href: '/editor/extensions/nodes/blockquote',
              title: 'Blockquote',
            },
            {
              href: '/editor/extensions/nodes/bullet-list',
              title: 'Bullet list',
            },
            {
              href: '/editor/extensions/nodes/code-block',
              title: 'Code block',
            },
            {
              href: '/editor/extensions/nodes/code-block-lowlight',
              title: 'Code block lowlight',
            },
            {
              href: '/editor/extensions/nodes/details',
              title: 'Details',
              tags: ['Pro'],
            },
            {
              href: '/editor/extensions/nodes/details-content',
              title: 'Details content',
              tags: ['Pro'],
            },
            {
              href: '/editor/extensions/nodes/details-summary',
              title: 'Details summary',
              tags: ['Pro'],
            },
            {
              href: '/editor/extensions/nodes/document',
              title: 'Document',
            },
            {
              href: '/editor/extensions/nodes/emoji',
              title: 'Emoji',
              tags: ['Pro'],
            },
            {
              href: '/editor/extensions/nodes/hard-break',
              title: 'Hard break',
            },
            {
              href: '/editor/extensions/nodes/heading',
              title: 'Heading',
            },
            {
              href: '/editor/extensions/nodes/horizontal-rule',
              title: 'Horizontal rule',
            },
            {
              href: '/editor/extensions/nodes/image',
              title: 'Image',
            },
            {
              href: '/editor/extensions/nodes/list-item',
              title: 'List item',
            },
            {
              href: '/editor/extensions/nodes/mention',
              title: 'Mention',
            },
            {
              href: '/editor/extensions/nodes/ordered-list',
              title: 'Ordered list',
            },
            {
              href: '/editor/extensions/nodes/paragraph',
              title: 'Paragraph',
            },
            {
              href: '/editor/extensions/nodes/table',
              title: 'Table',
            },
            {
              href: '/editor/extensions/nodes/table-cell',
              title: 'Table cell',
            },
            {
              href: '/editor/extensions/nodes/table-header',
              title: 'Table header',
            },
            {
              href: '/editor/extensions/nodes/table-row',
              title: 'Table row',
            },
            {
              href: '/editor/extensions/nodes/task-list',
              title: 'Task list',
            },
            {
              href: '/editor/extensions/nodes/task-item',
              title: 'Task item',
            },
            {
              href: '/editor/extensions/nodes/text',
              title: 'Text',
            },
            {
              href: '/editor/extensions/nodes/youtube',
              title: 'Youtube',
            },
          ],
        },
        {
          href: '/editor/extensions/marks',
          title: 'Marks',
          children: [
            {
              href: '/editor/extensions/marks/bold',
              title: 'Bold',
            },
            {
              href: '/editor/extensions/marks/code',
              title: 'Code',
            },
            {
              href: '/editor/extensions/marks/highlight',
              title: 'Highlight',
            },
            {
              href: '/editor/extensions/marks/italic',
              title: 'Italic',
            },
            {
              href: '/editor/extensions/marks/link',
              title: 'Link',
            },
            {
              href: '/editor/extensions/marks/strike',
              title: 'Strike',
            },
            {
              href: '/editor/extensions/marks/subscript',
              title: 'Subscript',
            },
            {
              href: '/editor/extensions/marks/superscript',
              title: 'Superscript',
            },
            {
              href: '/editor/extensions/marks/text-style',
              title: 'Text Style',
            },
            {
              href: '/editor/extensions/marks/underline',
              title: 'Underline',
            },
          ],
        },
        {
          href: '/editor/extensions/functionality',
          title: 'Functionality',
          children: [
            {
              href: '/editor/extensions/functionality/ai-suggestion',
              title: 'AI Suggestion',
              tags: ['Beta', 'Pro'],
            },
            {
              href: '/editor/extensions/functionality/bubble-menu',
              title: 'Bubble menu',
            },
            {
              href: '/editor/extensions/functionality/character-count',
              title: 'Character count',
            },
            {
              href: '/editor/extensions/functionality/collaboration',
              title: 'Collaboration',
            },
            {
              href: '/editor/extensions/functionality/collaboration-cursor',
              title: 'Collaboration Cursor',
            },
            {
              href: '/editor/extensions/functionality/color',
              title: 'Color',
            },
            {
              href: '/editor/extensions/functionality/comments',
              title: 'Comments',
              tags: ['Beta', 'Pro'],
            },
            {
              href: '/editor/extensions/functionality/ai-generation',
              title: 'AI Generation',
              tags: ['Pro'],
            },
            {
              href: '/editor/extensions/functionality/drag-handle',
              title: 'Drag Handle',
              tags: ['Pro'],
            },
            {
              href: '/editor/extensions/functionality/drag-handle-react',
              title: 'Drag Handle React',
              tags: ['Pro'],
            },
            {
              href: '/editor/extensions/functionality/drag-handle-vue',
              title: 'Drag Handle Vue',
              tags: ['Pro'],
            },
            {
              href: '/editor/extensions/functionality/dropcursor',
              title: 'Dropcursor',
            },
            {
              href: '/editor/extensions/functionality/export',
              title: 'Export',
              tags: ['Beta', 'Pro'],
            },
            {
              href: '/editor/extensions/functionality/filehandler',
              title: 'File handler',
              tags: ['Pro'],
            },
            {
              href: '/editor/extensions/functionality/floatingmenu',
              title: 'Floating menu',
            },
            {
              href: '/editor/extensions/functionality/focus',
              title: 'Focus',
            },
            {
              href: '/editor/extensions/functionality/fontfamily',
              title: 'Font family',
            },
            {
              href: '/editor/extensions/functionality/gapcursor',
              title: 'Gap cursor',
            },
            {
              href: '/editor/extensions/functionality/history',
              title: 'History',
              tags: ['Pro', 'Cloud'],
            },
            {
              href: '/editor/extensions/functionality/invisiblecharacters',
              title: 'Invisible characters',
              tags: ['Pro'],
            },
            {
              href: '/editor/extensions/functionality/listkeymap',
              title: 'List Keymap',
            },
            {
              href: '/editor/extensions/functionality/import',
              title: 'Import',
              tags: ['Beta', 'Pro'],
            },
            {
              href: '/editor/extensions/functionality/mathematics',
              title: 'Mathematics',
              tags: ['Pro'],
            },
            {
              href: '/editor/extensions/functionality/placeholder',
              title: 'Placeholder',
            },
            {
              href: '/editor/extensions/functionality/snapshot-compare',
              title: 'Snapshot Compare',
              tags: ['Pro', 'Cloud'],
            },
            {
              href: '/editor/extensions/functionality/starterkit',
              title: 'Starter kit',
            },
            {
              href: '/editor/extensions/functionality/table-of-contents',
              title: 'Table of contents',
              tags: ['Pro'],
            },
            {
              href: '/editor/extensions/functionality/textalign',
              title: 'Text align',
            },
            {
              href: '/editor/extensions/functionality/typography',
              title: 'Typography',
            },
            {
              href: '/editor/extensions/functionality/undo-redo',
              title: 'Undo & Redo History',
            },
            {
              href: '/editor/extensions/functionality/uniqueid',
              title: 'Unique ID',
              tags: ['Pro'],
            },
          ],
        },
        {
          href: '/editor/extensions/custom-extensions',
          title: 'Custom extensions',
          children: [
            {
              href: '/editor/extensions/custom-extensions/extend-existing',
              title: 'Extend existing',
            },
            {
              href: '/editor/extensions/custom-extensions/create-new',
              title: 'Create new',
            },
            {
              href: '/editor/extensions/custom-extensions/node-views',
              title: 'Node views',
              children: [
                {
                  href: '/editor/extensions/custom-extensions/node-views/javascript',
                  title: 'Javascript',
                },
                {
                  href: '/editor/extensions/custom-extensions/node-views/react',
                  title: 'React',
                },
                {
                  href: '/editor/extensions/custom-extensions/node-views/vue',
                  title: 'Vue',
                },
                {
                  href: '/editor/extensions/custom-extensions/node-views/examples',
                  title: 'Examples',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'group',
      title: 'Core Concepts',
      href: '/editor/core-concepts',
      children: [
        {
          href: '/editor/core-concepts/introduction',
          title: 'Introduction',
        },
        {
          href: '/editor/core-concepts/extensions',
          title: 'Extensions',
        },
        {
          href: '/editor/core-concepts/nodes-and-marks',
          title: 'Nodes and Marks',
        },
        {
          href: '/editor/core-concepts/schema',
          title: 'Schema',
        },
        {
          href: '/editor/core-concepts/keyboard-shortcuts',
          title: 'Keyboard shortcuts',
        },
        {
          title: 'ProseMirror',
          href: '/editor/core-concepts/prosemirror',
        },
      ],
    },
    {
      type: 'group',
      href: '/editor/api',
      title: 'API',
      children: [
        {
          href: '/editor/api/editor',
          title: 'Editor instance',
        },
        {
          href: '/editor/api/commands',
          title: 'Commands',
          children: [
            {
              href: '/editor/api/commands/content',
              title: 'Content',
              children: [
                {
                  href: '/editor/api/commands/content/clear-content',
                  title: 'clearContent',
                },
                {
                  href: '/editor/api/commands/content/cut',
                  title: 'cut',
                },
                {
                  href: '/editor/api/commands/content/insert-content',
                  title: 'insertContent',
                },
                {
                  href: '/editor/api/commands/content/insert-content-at',
                  title: 'insertContentAt',
                },
                {
                  href: '/editor/api/commands/content/set-content',
                  title: 'setContent',
                },
              ],
            },
            {
              href: '/editor/api/commands/nodes-and-marks',
              title: 'Nodes & Marks',
              children: [
                {
                  href: '/editor/api/commands/nodes-and-marks/clear-nodes',
                  title: 'clearNodes',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/create-paragraph-near',
                  title: 'createParagraphNear',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/delete-node',
                  title: 'deleteNode',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/extend-mark-range',
                  title: 'extendMarkRange',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/exit-code',
                  title: 'exitCode',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/join-backward',
                  title: 'joinBackward',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/join-down',
                  title: 'joinDown',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/join-forward',
                  title: 'joinForward',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/join-textblock-backward',
                  title: 'joinTextblockBackward',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/join-textblock-forward',
                  title: 'joinTextblockForward',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/join-up',
                  title: 'joinUp',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/lift',
                  title: 'lift',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/lift-empty-block',
                  title: 'liftEmptyBlock',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/newline-in-code',
                  title: 'newlineInCode',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/reset-attributes',
                  title: 'resetAttributes',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/set-mark',
                  title: 'setMark',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/set-node',
                  title: 'setNode',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/split-block',
                  title: 'splitBlock',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/toggle-mark',
                  title: 'toggleMark',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/toggle-node',
                  title: 'toggleNode',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/toggle-wrap',
                  title: 'toggleWrap',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/undo-input-rule',
                  title: 'undoInputRule',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/unset-all-marks',
                  title: 'unsetAllMarks',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/unset-mark',
                  title: 'unsetMark',
                },
                {
                  href: '/editor/api/commands/nodes-and-marks/update-attributes',
                  title: 'updateAttributes',
                },
              ],
            },
            {
              href: '/editor/api/commands/lists',
              title: 'Lists',
              children: [
                {
                  href: '/editor/api/commands/lists/lift-list-item',
                  title: 'liftListItem',
                },
                {
                  href: '/editor/api/commands/lists/sink-list-item',
                  title: 'sinkListItem',
                },
                {
                  href: '/editor/api/commands/lists/split-list-item',
                  title: 'splitListItem',
                },
                {
                  href: '/editor/api/commands/lists/toggle-list',
                  title: 'toggleList',
                },
                {
                  href: '/editor/api/commands/lists/wrap-in-list',
                  title: 'wrapInList',
                },
              ],
            },
            {
              href: '/editor/api/commands/selection',
              title: 'Selection',
              children: [
                {
                  href: '/editor/api/commands/selection/blur',
                  title: 'blur',
                },
                {
                  href: '/editor/api/commands/selection/delete-range',
                  title: 'deleteRange',
                },
                {
                  href: '/editor/api/commands/selection/delete-selection',
                  title: 'deleteSelection',
                },
                {
                  href: '/editor/api/commands/selection/enter',
                  title: 'enter',
                },
                {
                  href: '/editor/api/commands/selection/focus',
                  title: 'focus',
                },
                {
                  href: '/editor/api/commands/selection/keyboard-shortcut',
                  title: 'keyboardShortcut',
                },
                {
                  href: '/editor/api/commands/selection/scroll-into-view',
                  title: 'scrollIntoView',
                },
                {
                  href: '/editor/api/commands/selection/select-all',
                  title: 'selectAll',
                },
                {
                  href: '/editor/api/commands/selection/select-node-backward',
                  title: 'selectNodeBackward',
                },
                {
                  href: '/editor/api/commands/selection/select-node-forward',
                  title: 'selectNodeForward',
                },
                {
                  href: '/editor/api/commands/selection/select-parent-node',
                  title: 'selectParentNode',
                },
                {
                  href: '/editor/api/commands/selection/set-node-selection',
                  title: 'setNodeSelection',
                },
                {
                  href: '/editor/api/commands/selection/set-text-selection',
                  title: 'setTextSelection',
                },
              ],
            },
            {
              href: '/editor/api/commands/for-each',
              title: 'forEach',
            },
            {
              href: '/editor/api/commands/select-textblock-end',
              title: 'selectTextblockEnd',
            },
            {
              href: '/editor/api/commands/select-textblock-start',
              title: 'selectTextblockStart',
            },
            {
              href: '/editor/api/commands/set-meta',
              title: 'setMeta',
            },
          ],
        },
        {
          href: '/editor/api/utilities',
          title: 'Utilities',
          children: [
            {
              href: '/editor/api/utilities/html',
              title: 'HTML',
            },
            {
              href: '/editor/api/utilities/suggestion',
              title: 'Suggestion',
            },
            {
              href: '/editor/api/utilities/tiptap-for-php',
              title: 'Tiptap for PHP',
            },
          ],
        },
        {
          href: '/editor/api/node-positions',
          title: 'Node Positions',
        },
        {
          href: '/editor/api/events',
          title: 'Events',
        },
      ],
    },
    {
      type: 'group',
      title: 'Resources',
      href: '/editor/resources',
      children: [
        {
          href: '/guides',
          title: 'Guides',
        },
        {
          href: '/resources/pro-license',
          title: 'Pro license',
        },
      ],
    },
  ],
}

```

# examples\advanced\clever-editor.mdx

```mdx
---
title: Tiptap Editor with customized extensions
meta:
  title: Clever Editor example | Tiptap Editor Docs
  description: See how to create highly customized extensions for your text editor with Tiptap. Learn more in our documentation!
  category: Examples
---

import { CodeDemo } from '@/components/CodeDemo'

Tiptap is a powerful editor that allows you to create customized extensions for your needs. In this example, we create various extensions to handle **color highlighting**, a **emoji replacer** and a **typography replacer** to show how easy it is to handle content and replace it.

<CodeDemo path="/Examples/Savvy" />

```

# examples\advanced\collaborative-editing.mdx

```mdx
---
title: Collaborative editing implementation
meta:
  title: Collaborative editing example | Tiptap Editor Docs
  description: Learn how to create a simple collaborative text editor in Tiptap with a short code example. More in our docs!
  category: Examples
---

import { CodeDemo } from '@/components/CodeDemo'

This example shows how you can use Tiptap to let multiple users collaborate in the same document in real-time.

It connects all clients to a WebSocket server and merges changes to the document with the power of [Y.js](https://github.com/yjs/yjs). If you want to learn more about collaborative text editing, check out [our installation guide on collaborative editing](/collaboration/getting-started/overview).

<CodeDemo path="/Demos/CollaborationSplitPane" />

```

# examples\advanced\drawing.mdx

```mdx
---
title: Tiptap Editor with a canvas drawing node
meta:
  title: Drawing example | Tiptap Editor Docs
  description: Learn how create a text editor with drawing capabilities with Tiptap with an easy code example. More in our docs!
  category: Examples
---

import { CodeDemo } from '@/components/CodeDemo'

Did you ever want to draw in a text editor? Me neither. Anyway, here is an example how that could work with Tiptap. If you want to build something like that, [learn more about node views](/editor/extensions/custom-extensions/node-views).

<CodeDemo path="/Examples/Drawing" />

```

# examples\advanced\forced-content-structure.mdx

```mdx
---
title: Enforcing a content structure
meta:
  title: Forced content structure example | Tiptap Editor Docs
  description: Learn how to add a text editor with a forced content structure with Tiptap. More in our documentation!
  category: Examples
---

import { CodeDemo } from '@/components/CodeDemo'

Does your editor require content in a specific structure? You can enforce specific content structures via **custom documents** that extend our default `@tiptap/extension-document` extension. See below to learn more about how to create a custom document schema.

<CodeDemo path="/Examples/CustomDocument" />

```

# examples\advanced\interactive-react-and-vue-views.mdx

```mdx
---
title: Interactive React & Vue views
meta:
  title: Interactive React & Vue views example | Tiptap Editor Docs
  description: Learn how to build a text editor with React or Vue support with Tiptap. More in our documentation!
  category: Examples
---

import { CodeDemo } from '@/components/CodeDemo'

Thanks to [node views](/editor/extensions/custom-extensions/node-views) you can add interactivity to your nodes. If you can write it in JavaScript, you can add it to the editor.

## Implementing React or Vue components as NodeViews

<CodeDemo path="/Examples/InteractivityComponent" />

## Editable content

React & Node NodeViews also support editable content. See the following example to learn how to create a node view with editable content.

<CodeDemo path="/Examples/InteractivityComponentContent" />

```

# examples\advanced\mentions.mdx

```mdx
---
title: Mentions in Tiptap
meta:
  title: Mentions example | Tiptap Editor Docs
  description: Learn how to build a text editor with mentions in Tiptap with a quick code example. More in our documentation.
  category: Examples
---

import { CodeDemo } from '@/components/CodeDemo'

The [mentions extension](/editor/extensions/nodes/mention) allows you to create a text editor that supports mentions. This example shows you how to build a text editor with mentions using Tiptap.

<CodeDemo path="/Examples/Community" />

```

# examples\advanced\menus.mdx

```mdx
---
title: Bubble & floating menu implementation
meta:
  title: Menus example | Tiptap Editor Docs
  description: Learn how to create floating menus for your text editor in Tiptap with a short code example. More in our docs.
  category: Examples
---

import { CodeDemo } from '@/components/CodeDemo'

Menus allow you to create floating user interface elements that can be used to interact and manipulate the editor content. In this example, we show you how to create a simple menu that allows you to change the text alignment of the editor content.

<CodeDemo path="/Examples/Menus" />

```

# examples\advanced\react-performance.mdx

```mdx
---
title: React rendering performance
meta:
  title: React rendering performance demo | Tiptap Editor Docs
  description: Learn how to integrate Tiptap with React and improve the rendering performance of your editor. More in the docs!
  category: Examples
---

import { CodeDemo } from '@/components/CodeDemo'

## React Tiptap Editor Integration

When using Tiptap with React, the most common performance issue is that the editor is re-rendered too often. This demo shows the difference between the default editor and the optimized rendering with `shouldRerenderOnTransaction`.

<CodeDemo path="/Examples/Performance" />

```

# examples\advanced\retrieval-augmented-generation-rag.mdx

```mdx
---
title: Retrieval-Augmented Generation (RAG)
meta:
  title: Retrieval-Augmented Generation (RAG) | Tiptap Editor Docs
  description: Using Tiptap Semantic Search to retrieve context for your Tiptap AI commands.
  category: Examples
---

import { CodeDemo } from '@/components/CodeDemo'

The following example shows how you can use [Tiptap Semantic Search](/collaboration/documents/semantic-search) to generate meaningful context for Tiptap AI.

With this approach, your AI commands can use existing documents as knowledge, improving the quality of the answer.

<CodeDemo src="https://ai-demo.tiptap.dev/preview/Examples/RAG" />

```

# examples\advanced\syntax-highlighting.mdx

```mdx
---
title: Using the CodeBlockLowlight extension in Tiptap
meta:
  title: Syntax highlighting example | Tiptap Editor Docs
  description: Learn how to create code blocks with syntax highlighting with Tiptap with an easy example. More in our docs!
  category: Examples
---

import { CodeDemo } from '@/components/CodeDemo'

Tiptap supports syntax highlighting in code blocks. This example shows you how to create a text editor with syntax highlighting using Tiptap & the CodeBlockLowlight extension.

<CodeDemo path="/Examples/CodeBlockLanguage" />

```

# examples\basics\default-text-editor.mdx

```mdx
---
title: Default text editor
meta:
  title: Default text editor example | Tiptap Editor Docs
  description: Learn how to create a super basic text editor in Tiptap with a short code example. More in our documentation!
  category: Examples
---

import { CodeDemo } from '@/components/CodeDemo'

Did we mention that you have full control over the rendering of the editor? Here is a barebones example without any styling, but packed with a whole set of common extensions.

<CodeDemo path="/Examples/Default" />

```

# examples\basics\formatting.mdx

```mdx
---
title: Formatting
meta:
  title: Formatting example | Tiptap Editor Docs
  description: Learn how to create a text editor with text formatting in Tiptap with an easy code example. More in our docs!
  category: Examples
---

import { CodeDemo } from '@/components/CodeDemo'

Tiptap supports text formatting with ease. This example shows you how to create a text editor with text formatting using Tiptap.

<CodeDemo path="/Examples/Formatting" />

```

# examples\basics\images.mdx

```mdx
---
title: Images
meta:
  title: Images example | Tiptap Editor Docs
  description: Learn how to create a text editor supporting images in Tiptap with a short code example. More in our docs!
  category: Examples
---

import { CodeDemo } from '@/components/CodeDemo'

Images are a common way to enrich your content. This example shows you how to create a text editor supporting images using Tiptap.

<CodeDemo path="/Examples/Images" />

```

# examples\basics\long-texts.mdx

```mdx
---
title: Long texts
meta:
  title: Long texts example | Tiptap Editor Docs
  description: Learn how to create a text editor supporting large content with Tiptap with an easy example. More in our docs!
  category: Examples
---

import { CodeDemo } from '@/components/CodeDemo'

This demo has more than 200,000 words, check the performance yourself.

<CodeDemo path="/Examples/Book" />

```

# examples\basics\markdown-shortcuts.mdx

```mdx
---
title: Markdown shortcuts in Tiptap
meta:
  title: Markdown shortcuts example | Tiptap Editor Docs
  description: Learn how to create a editor with Markdown shortcuts in Tiptap with an easy code example. More in our docs!
  category: Examples
---

import { CodeDemo } from '@/components/CodeDemo'

Tiptap supports markdown shortcuts out of the box. This example shows you how to create a text editor with markdown shortcuts using Tiptap.

<CodeDemo path="/Examples/MarkdownShortcuts" />

```

# examples\basics\minimal-setup.mdx

```mdx
---
title: Minimal setup for paragraphs & text only
meta:
  title: Minimal setup example | Tiptap Editor Docs
  description: Learn how to create a very minimal text editor in Tiptap with a short code example. More in our documentation!
  category: Examples
---

import { CodeDemo } from '@/components/CodeDemo'

Tiptap can also be used to build minimal editors for simple input use cases like comments or chat messages. This example shows you how to create a very minimal text editor using Tiptap.

<CodeDemo path="/Examples/Minimal" />

```

# examples\basics\tables.mdx

```mdx
---
title: Adding table support to Tiptap
meta:
  title: Tables example | Tiptap Editor Docs
  description: Learn how to create a text editor supporting tables in Tiptap with a quick code example. More in our docs!
  category: Examples
---

import { CodeDemo } from '@/components/CodeDemo'

HTML tables are a common way to display data. This example shows you how to create a text editor supporting tables using Tiptap.

<CodeDemo path="/Examples/Tables" />

```

# examples\basics\tasks.mdx

```mdx
---
title: Task lists in Tiptap
meta:
  title: Tasks example | Tiptap Editor Docs
  description: Learn how to create a text editor supporting task lists with Tiptap with an easy code example. More in our docs.
  category: Examples
---

import { CodeDemo } from '@/components/CodeDemo'

Tiptap can also render custom html elements like task lists. This example shows you how to create a text editor supporting task lists using Tiptap & the TaskList extension.

<CodeDemo path="/Examples/Tasks" />

```

# examples\experiments\collaborative-fields.mdx

```mdx
---
title: Multiple fields on collaborative document
meta:
  title: Collaborative fields | Tiptap Editor Docs
  description: See how to save different content on one collaboration document with Tiptap Editor. Learn more in our documentation!
  category: Examples
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

<Callout variant="warning" title="Experiment">
  Experiment, currently not supported or maintained
</Callout>

The following example has three different instances of Tiptap. The first is configured to have a single paragraph of text, the second to have a task list and the third to have text. All of them are stored in a single Y.js document, which can be synced in real-time with other users.

<CodeDemo path="/Experiments/MultipleEditors" />

```

# examples\experiments\figure.mdx

```mdx
---
title: Example code editor with Figures
extension:
  name: Figure
  description: Add figure nodes to your editor content.
  type: node
  icon: GalleryThumbnails
  isExperiment: true
meta:
  title: Figure Extension | Tiptap Editor Docs
  description: Use the Figure extension in Tiptap to add figure nodes to your editor content. Learn more in our docs!
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

<Callout variant="warning" title="Experiment">

Experiment, currently not supported or maintained. This extension does not have a published package yet. You may need to copy the source code and create your own extension.

</Callout>

The Figure extension allows you to add figure nodes to your editor content. This extension is **not yet published officially**, so you may need to copy the source code and create your own extension.

<CodeDemo path="/Experiments/Figure" />

## Notes

- **Not published**: This extension does not have a published package yet. You may need to copy the source code and create your own extension.
- **Experiment**: This extension is an experiment and not yet supported or maintained.
- The current implementation only works with images

## Related links & issues

- https://github.com/ueberdosis/tiptap/issues/573#issuecomment-730122427
- https://discuss.prosemirror.net/t/figure-and-editable-caption/462/5

```

# examples\experiments\generic-figure.mdx

```mdx
---
title: Image & Table figures via a generic figure
meta:
  title: Generic figure example | Tiptap Editor Docs
  description: Learn how to create a generic figure extension for your Tiptap Editor with an easy example. More in our docs!
  category: Examples
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

<Callout variant="warning" title="Experiment">
  Experiment, currently not supported or maintained
</Callout>

In this example we use a `Figure` extension as a generic figure that we **extend** to create images and table nodes with figure support.

<CodeDemo path="/Experiments/GenericFigure" />

```

# examples\experiments\iframe.mdx

```mdx
---
title: Integrate an iFrame into your Editor
extension:
  name: iFrame
  description: 'Embed iframes in your editor content.'
  type: node
  icon: Frame
  isExperiment: true
meta:
  title: iFrame Extension | Tiptap Editor Docs
  description: Use the Iframe extension in Tiptap to embed iframes in your editor content. Learn more in our docs!
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

<Callout variant="warning" title="Experiment" hasCalloutAfter>

Experiment, currently not supported or maintained. This extension does not have a published package yet. You may need to copy the source code and create your own extension.

</Callout>

The iframe extension allows you to embed iframes in your editor content. This extension is **not yet published officially**, so you may need to copy the source code and create your own extension.

<CodeDemo path="/Experiments/Embeds" />

## Notes

- **Not published**: This extension does not have a published package yet. You may need to copy the source code and create your own extension.
- **Experiment**: This extension is an experiment and not yet supported or maintained.

```

# examples\experiments\linting.mdx

```mdx
---
title: Linting example in Tiptap
meta:
  title: Linting example | Tiptap Editor Docs
  description: Learn how to add a content linter to your Tiptap Editor with a short but sweet code example. More in our docs.
  category: Examples
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

<Callout variant="warning" title="Experiment">
  Experiment, currently not supported or maintained
</Callout>

Linter can be used to check the content as per your wish and highlight it to the user. Linter extension can have multiple plugins for each task you want to achieve.

<CodeDemo path="/Experiments/Linter" />

## Known issues

- There is no decoration API in Tiptap, that’s why this is a lot of ProseMirror work. Before we’ll publish that example, we’d need to find a few ways to make it more Tiptap-like. For example, it would be great to use Vue/React components for the widget.

```

# examples\experiments\slash-commands.mdx

```mdx
---
title: Code editor with Slash Commands
meta:
  title: Slash Commands Extension | Tiptap Editor Docs
  description: Use the Slash Commands extension in Tiptap to add a toolbar via / that pops up at the slash position. Learn more in our docs!
  category: Editor
extension:
  name: Slash Commands
  description: 'Adds a toolbar via / that pops up at the slash position.'
  type: extension
  icon: CopySlash
  isExperiment: true
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

<Callout variant="warning" title="Experiment" hasCalloutAfter>

Experiment, currently not supported or maintained. This extension does not have a published package yet. You may need to copy the source code and create your own extension.

</Callout>

The Slash Commands extension adds a toolbar via `/` that pops up at the slash position, well known from other editor applications. It's great to quickly insert different content types or apply inline formatting.

Since this extension is **not yet published officially**, you may need to copy the source code and create your own extension.

<CodeDemo path="/Experiments/Commands" />

## Notes

- **Not published**: This extension does not have a published package yet. You may need to copy the source code and create your own extension.
- **Experiment**: This extension is an experiment and not yet supported or maintained.
- This extension is using the `@tiptap/suggestion` package to build the slash commands panel

```

# examples\experiments\trailing-node.mdx

```mdx
---
title: Editor with Trailing node
meta:
  title: Trailing node Extension | Tiptap Editor Docs
  description: Use the Trailing node extension in Tiptap to add a node at the end of the document. Learn more in our docs!
  category: Editor
extension:
  name: Trailing Node
  description: 'Add a node at the end of the document.'
  type: extension
  icon: Space
  isExperiment: true
---

import { CodeDemo } from '@/components/CodeDemo'
import { Callout } from '@/components/ui/Callout'

<Callout variant="warning" title="Experiment" hasCalloutAfter>

Experiment, currently not supported or maintained. This extension does not have a published package yet. You may need to copy the source code and create your own extension.

</Callout>

The Trailing Node extension automatically appends an invisible node at the end of the document. This is useful for purposes like adding a consistent footer or signature.

In the example shown here, the trailing node is left empty to enable you to place your caret behind the code block.

Since this extension is **not yet published officially**, you may need to copy the source code and create your own extension.

<CodeDemo path="/Experiments/TrailingNode" />

### Configure behavior
In this example, when text is entered in the last node, the system does not automatically create a new trailing node. This behavior is configurable. The relevant configuration can be implemented within the addOptions() method as follows:

\`\`\`js
addOptions() {
    return {
        node: 'paragraph',
        notAfter: ['paragraph'],
    };
}
\`\`\`

## Notes

- **Not published**: This extension does not have a published package yet. You may need to copy the source code and create your own extension.
- **Experiment**: This extension is an experiment and not yet supported or maintained.
- This is currently using an actual node - would be better to use a decoration in the future so the document is not changed

```

# examples\index.mdx

```mdx
---
title: Examples
meta:
  title: Examples | Tiptap Editor Docs
  description: Learn how to use and integrate a custom user experience in Tiptap with our list of code examples. More in the docs!
  category: Examples
sidebars:
  hideSecondary: true
---

import Link from '@/components/Link'
import * as CardGrid from '@/components/CardGrid'
import { Tag } from '@/components/ui/Tag'
import cardCoverDefaultEditor from '@/assets/card-covers/examples/default-text-editor.jpg'
import cardCoverFormatting from '@/assets/card-covers/examples/formatting.jpg'
import cardCoverImages from '@/assets/card-covers/examples/images.jpg'
import cardCoverlongText from '@/assets/card-covers/examples/long-text.jpg'
import cardCoverMarkdown from '@/assets/card-covers/examples/markdown-shortcuts.jpg'
import cardCoverMinimal from '@/assets/card-covers/examples/minimal-setup.jpg'
import cardCoverTables from '@/assets/card-covers/examples/tables.jpg'
import cardCoverTasks from '@/assets/card-covers/examples/tasks.jpg'
import cardCoverCollaborativeEditing from '@/assets/card-covers/examples/collaborative-editing.jpg'
import cardCoverCollaborativeFields from '@/assets/card-covers/examples/collaborative-fields.jpg'
import cardCoverCollaborativeCleverEditor from '@/assets/card-covers/examples/clever-editor.jpg'
import cardCoverCollaborativeDrawing from '@/assets/card-covers/examples/drawing.jpg'
import cardCoverCollaborativeFigure from '@/assets/card-covers/examples/figure.jpg'
import cardCoverCollaborativeForcedContent from '@/assets/card-covers/examples/forced-content-structure.jpg'
import cardCoverCollaborativeGenericFigure from '@/assets/card-covers/examples/generic-figure.jpg'
import cardCoverCollaborativeiFrame from '@/assets/card-covers/examples/iframe.jpg'
import cardCoverCollaborativeInteractiveViews from '@/assets/card-covers/examples/interactive-views.jpg'
import cardCoverCollaborativeLinting from '@/assets/card-covers/examples/linting.jpg'
import cardCoverCollaborativeMentions from '@/assets/card-covers/examples/mentions.jpg'
import cardCoverCollaborativeMenus from '@/assets/card-covers/examples/menus.jpg'
import cardCoverCollaborativeSlashCommands from '@/assets/card-covers/examples/slash-commands.jpg'
import cardCoverCollaborativeSytnaxHighlights from '@/assets/card-covers/examples/syntax-highlighting.jpg'
import cardCoverCollaborativeTrailingNode from '@/assets/card-covers/examples/trailing-node.jpg'
import * as FilterGrid from '@/components/FilterGrid'

It's hard to get started with a new library. We know that and that's why we created a bunch of examples for you. They cover a wide range of use cases and show you how to use Tiptap in your project.

<FilterGrid.Wrapper filters={['Editor', 'Collaboration']}>
  <CardGrid.Wrapper className="sm:grid-cols-3">
    <FilterGrid.Item filter="Editor">
      <CardGrid.Item asChild>
        <Link href="/examples/basics/default-text-editor">
          <CardGrid.ItemImage
            asNextImage
            src={cardCoverDefaultEditor.src}
            width={cardCoverDefaultEditor.width}
            height={cardCoverDefaultEditor.height}
            alt="Image"
          />
          <div>
            <CardGrid.ItemTitle>Default text editor</CardGrid.ItemTitle>
            <CardGrid.ItemParagraph>
              Learn how to create a default text editor with Tiptap.
            </CardGrid.ItemParagraph>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
    <FilterGrid.Item filter="Editor">
      <CardGrid.Item asChild>
        <Link href="/examples/basics/markdown-shortcuts">
          <CardGrid.ItemImage
            asNextImage
            src={cardCoverMarkdown.src}
            width={cardCoverMarkdown.width}
            height={cardCoverMarkdown.height}
            alt="Image"
          />
          <div>
            <CardGrid.ItemTitle>Markdown shortcuts</CardGrid.ItemTitle>
            <CardGrid.ItemParagraph>
              Add markdown shortcuts to your Tiptap Editor.
            </CardGrid.ItemParagraph>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
    <FilterGrid.Item filter="Editor">
      <CardGrid.Item asChild>
        <Link href="/examples/basics/tables">
          <CardGrid.ItemImage
            asNextImage
            src={cardCoverTables.src}
            width={cardCoverTables.width}
            height={cardCoverTables.height}
            alt="Image"
          />
          <div>
            <CardGrid.ItemTitle>Tables</CardGrid.ItemTitle>
            <CardGrid.ItemParagraph>Add tables to your Tiptap Editor.</CardGrid.ItemParagraph>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
    <FilterGrid.Item filter="Editor">
      <CardGrid.Item asChild>
        <Link href="/examples/basics/images">
          <CardGrid.ItemImage
            asNextImage
            src={cardCoverImages.src}
            width={cardCoverImages.width}
            height={cardCoverImages.height}
            alt="Image"
          />
          <div>
            <CardGrid.ItemTitle>Images</CardGrid.ItemTitle>
            <CardGrid.ItemParagraph>Add images to your Tiptap Editor.</CardGrid.ItemParagraph>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
    <FilterGrid.Item filter="Editor">
      <CardGrid.Item asChild>
        <Link href="/examples/basics/formatting">
          <CardGrid.ItemImage
            asNextImage
            src={cardCoverFormatting.src}
            width={cardCoverFormatting.width}
            height={cardCoverFormatting.height}
            alt="Image"
          />
          <div>
            <CardGrid.ItemTitle>Formatting</CardGrid.ItemTitle>
            <CardGrid.ItemParagraph>
              Add content formatting to your Tiptap Editor.
            </CardGrid.ItemParagraph>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
    <FilterGrid.Item filter="Editor">
      <CardGrid.Item asChild>
        <Link href="/examples/basics/tasks">
          <CardGrid.ItemImage
            asNextImage
            src={cardCoverTasks.src}
            width={cardCoverTasks.width}
            height={cardCoverTasks.height}
            alt="Image"
          />
          <div>
            <CardGrid.ItemTitle>Tasks</CardGrid.ItemTitle>
            <CardGrid.ItemParagraph>Add task lists to your Tiptap Editor.</CardGrid.ItemParagraph>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
    <FilterGrid.Item filter="Editor">
      <CardGrid.Item asChild>
        <Link href="/examples/basics/long-texts">
          <CardGrid.ItemImage
            asNextImage
            src={cardCoverlongText.src}
            width={cardCoverlongText.width}
            height={cardCoverlongText.height}
            alt="Image"
          />
          <div>
            <CardGrid.ItemTitle>Long texts</CardGrid.ItemTitle>
            <CardGrid.ItemParagraph>
              Keep a good performance with huge amount of content.
            </CardGrid.ItemParagraph>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
    <FilterGrid.Item filter="Editor">
      <CardGrid.Item asChild>
        <Link href="/examples/basics/minimal-setup">
          <CardGrid.ItemImage
            asNextImage
            src={cardCoverMinimal.src}
            width={cardCoverMinimal.width}
            height={cardCoverMinimal.height}
            alt="Image"
          />
          <div>
            <CardGrid.ItemTitle>Minimal setup</CardGrid.ItemTitle>
            <CardGrid.ItemParagraph>
              Keep it simple and clean with a minimal Tiptap Editor setup.
            </CardGrid.ItemParagraph>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
    <FilterGrid.Item filter={['Editor', 'Collaboration']}>
      <CardGrid.Item asChild>
        <Link href="/examples/advanced/collaborative-editing">
          <CardGrid.ItemImage
            asNextImage
            src={cardCoverCollaborativeEditing.src}
            width={cardCoverCollaborativeEditing.width}
            height={cardCoverCollaborativeEditing.height}
            alt="Image"
          />
          <div>
            <CardGrid.ItemTitle>Collaborative editing</CardGrid.ItemTitle>
            <CardGrid.ItemParagraph>
              Build collaborative editors with Tiptap Editor.
            </CardGrid.ItemParagraph>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
            <Tag>Collaboration</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
    <FilterGrid.Item filter={['Editor']}>
      <CardGrid.Item asChild>
        <Link href="/examples/advanced/menus">
          <CardGrid.ItemImage
            asNextImage
            src={cardCoverCollaborativeMenus.src}
            width={cardCoverCollaborativeMenus.width}
            height={cardCoverCollaborativeMenus.height}
            alt="Image"
          />
          <div>
            <CardGrid.ItemTitle>Menus</CardGrid.ItemTitle>
            <CardGrid.ItemParagraph>
              Add bubble and floating menus to your editor.
            </CardGrid.ItemParagraph>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
    <FilterGrid.Item filter={['Editor']}>
      <CardGrid.Item asChild>
        <Link href="/examples/advanced/drawing">
          <CardGrid.ItemImage
            asNextImage
            src={cardCoverCollaborativeDrawing.src}
            width={cardCoverCollaborativeDrawing.width}
            height={cardCoverCollaborativeDrawing.height}
            alt="Image"
          />
          <div>
            <CardGrid.ItemTitle>Drawing</CardGrid.ItemTitle>
            <CardGrid.ItemParagraph>
              Add a custom NodeView with drawing support to your Tiptap Editor.
            </CardGrid.ItemParagraph>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
    <FilterGrid.Item filter={['Editor']}>
      <CardGrid.Item asChild>
        <Link href="/examples/advanced/mentions">
          <CardGrid.ItemImage
            asNextImage
            src={cardCoverCollaborativeMentions.src}
            width={cardCoverCollaborativeMentions.width}
            height={cardCoverCollaborativeMentions.height}
            alt="Image"
          />
          <div>
            <CardGrid.ItemTitle>Mentions</CardGrid.ItemTitle>
            <CardGrid.ItemParagraph>
              Allow users to mention others in your documents.
            </CardGrid.ItemParagraph>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
    <FilterGrid.Item filter={['Editor']}>
      <CardGrid.Item asChild>
        <Link href="/examples/advanced/forced-content-structure">
          <CardGrid.ItemImage
            asNextImage
            src={cardCoverCollaborativeForcedContent.src}
            width={cardCoverCollaborativeForcedContent.width}
            height={cardCoverCollaborativeForcedContent.height}
            alt="Image"
          />
          <div>
            <CardGrid.ItemTitle>Forced content structure</CardGrid.ItemTitle>
            <CardGrid.ItemParagraph>
              Enforce specific content structures like headings in your editor.
            </CardGrid.ItemParagraph>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
    <FilterGrid.Item filter={['Editor']}>
      <CardGrid.Item asChild>
        <Link href="/examples/advanced/clever-editor">
          <CardGrid.ItemImage
            asNextImage
            src={cardCoverCollaborativeCleverEditor.src}
            width={cardCoverCollaborativeCleverEditor.width}
            height={cardCoverCollaborativeCleverEditor.height}
            alt="Image"
          />
          <div>
            <CardGrid.ItemTitle>Clever Editor</CardGrid.ItemTitle>
            <CardGrid.ItemParagraph>
              Make your editor clever with custom replacement extensions.
            </CardGrid.ItemParagraph>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
    <FilterGrid.Item filter={['Editor']}>
      <CardGrid.Item asChild>
        <Link href="/examples/advanced/interactive-react-and-vue-views">
          <CardGrid.ItemImage
            asNextImage
            src={cardCoverCollaborativeInteractiveViews.src}
            width={cardCoverCollaborativeInteractiveViews.width}
            height={cardCoverCollaborativeInteractiveViews.height}
            alt="Image"
          />
          <div>
            <CardGrid.ItemTitle>Interactive React & Vue views</CardGrid.ItemTitle>
            <CardGrid.ItemParagraph>
              Use React or Vue components in your Tiptap Editor content.
            </CardGrid.ItemParagraph>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
    <FilterGrid.Item filter={['Editor']}>
      <CardGrid.Item asChild>
        <Link href="/examples/advanced/syntax-highlighting">
          <CardGrid.ItemImage
            asNextImage
            src={cardCoverCollaborativeSytnaxHighlights.src}
            width={cardCoverCollaborativeSytnaxHighlights.width}
            height={cardCoverCollaborativeSytnaxHighlights.height}
            alt="Image"
          />
          <div>
            <CardGrid.ItemTitle>Syntax highlighting</CardGrid.ItemTitle>
            <CardGrid.ItemParagraph>
              Implement syntax highlighting to codeblocks in your Tiptap Editor.
            </CardGrid.ItemParagraph>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
  </CardGrid.Wrapper>
</FilterGrid.Wrapper>

## Experiments

The following examples are **experiments**, meaning they are not supported or maintained. They are here to show you what's possible with Tiptap and to inspire you to create your own extensions.

<FilterGrid.Wrapper filters={['Editor', 'Collaboration']}>
  <CardGrid.Wrapper className="sm:grid-cols-3">
    <FilterGrid.Item filter={['Editor', 'Collaboration']}>
      <CardGrid.Item asChild>
        <Link href="/examples/experiments/collaborative-fields">
          <CardGrid.ItemImage
            asNextImage
            src={cardCoverCollaborativeFields.src}
            width={cardCoverCollaborativeFields.width}
            height={cardCoverCollaborativeFields.height}
            alt="Image"
          />
          <div>
            <CardGrid.ItemTitle>Collaborative fields</CardGrid.ItemTitle>
            <CardGrid.ItemParagraph>
              Save separate data to one collaborative Yjs document with Tiptap via fields.
            </CardGrid.ItemParagraph>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
            <Tag>Collaboration</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
    <FilterGrid.Item filter={['Editor']}>
      <CardGrid.Item asChild>
        <Link href="/examples/experiments/figure">
          <CardGrid.ItemImage
            asNextImage
            src={cardCoverCollaborativeFigure.src}
            width={cardCoverCollaborativeFigure.width}
            height={cardCoverCollaborativeFigure.height}
            alt="Image"
          />
          <div>
            <CardGrid.ItemTitle>Figure</CardGrid.ItemTitle>
            <CardGrid.ItemParagraph>
              Create image nodes and enhance them with figures.
            </CardGrid.ItemParagraph>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
    <FilterGrid.Item filter={['Editor']}>
      <CardGrid.Item asChild>
        <Link href="/examples/experiments/generic-figure">
          <CardGrid.ItemImage
            asNextImage
            src={cardCoverCollaborativeGenericFigure.src}
            width={cardCoverCollaborativeGenericFigure.width}
            height={cardCoverCollaborativeGenericFigure.height}
            alt="Image"
          />
          <div>
            <CardGrid.ItemTitle>Generic Figure</CardGrid.ItemTitle>
            <CardGrid.ItemParagraph>
              Create nodes with figure support via a generic figure extension.
            </CardGrid.ItemParagraph>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
    <FilterGrid.Item filter={['Editor']}>
      <CardGrid.Item asChild>
        <Link href="/examples/experiments/iframe">
          <CardGrid.ItemImage
            asNextImage
            src={cardCoverCollaborativeiFrame.src}
            width={cardCoverCollaborativeiFrame.width}
            height={cardCoverCollaborativeiFrame.height}
            alt="Image"
          />
          <div>
            <CardGrid.ItemTitle>iFrame</CardGrid.ItemTitle>
            <CardGrid.ItemParagraph>Embed iframes in your editor content</CardGrid.ItemParagraph>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
    <FilterGrid.Item filter={['Editor']}>
      <CardGrid.Item asChild>
        <Link href="/examples/experiments/linting">
          <CardGrid.ItemImage
            asNextImage
            src={cardCoverCollaborativeLinting.src}
            width={cardCoverCollaborativeLinting.width}
            height={cardCoverCollaborativeLinting.height}
            alt="Image"
          />
          <div>
            <CardGrid.ItemTitle>Linting</CardGrid.ItemTitle>
            <CardGrid.ItemParagraph>
              Create a document linter for your Tiptap editor.
            </CardGrid.ItemParagraph>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
    <FilterGrid.Item filter={['Editor']}>
      <CardGrid.Item asChild>
        <Link href="/examples/experiments/slash-commands">
          <CardGrid.ItemImage
            asNextImage
            src={cardCoverCollaborativeSlashCommands.src}
            width={cardCoverCollaborativeSlashCommands.width}
            height={cardCoverCollaborativeSlashCommands.height}
            alt="Image"
          />
          <div>
            <CardGrid.ItemTitle>Slash commands</CardGrid.ItemTitle>
            <CardGrid.ItemParagraph>
              Add a toolbar that pops up at the slash position
            </CardGrid.ItemParagraph>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
    <FilterGrid.Item filter={['Editor']}>
      <CardGrid.Item asChild>
        <Link href="/examples/experiments/trailing-node">
          <CardGrid.ItemImage
            asNextImage
            src={cardCoverCollaborativeTrailingNode.src}
            width={cardCoverCollaborativeTrailingNode.width}
            height={cardCoverCollaborativeTrailingNode.height}
            alt="Image"
          />
          <div>
            <CardGrid.ItemTitle>Trailing node</CardGrid.ItemTitle>
            <CardGrid.ItemParagraph>Add a node at the end of the document</CardGrid.ItemParagraph>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
  </CardGrid.Wrapper>
</FilterGrid.Wrapper>

```

# examples\sidebar.ts

```ts
import { SidebarConfig } from '@/types'

export const sidebarConfig: SidebarConfig = {
  id: 'examples',
  rootHref: '/examples',
  title: 'Examples',
  items: [
    {
      type: 'group',
      title: 'Getting started',
      href: '/examples',
      children: [
        {
          href: '/examples',
          title: 'Overview',
        },
      ],
    },
    {
      type: 'group',
      href: '',
      title: 'Basics',
      children: [
        {
          title: 'Default text editor',
          href: '/examples/basics/default-text-editor',
        },
        {
          title: 'Formatting',
          href: '/examples/basics/formatting',
        },
        {
          title: 'Images',
          href: '/examples/basics/images',
        },
        {
          title: 'Long texts',
          href: '/examples/basics/long-texts',
        },
        {
          title: 'Markdown shortcuts',
          href: '/examples/basics/markdown-shortcuts',
        },
        {
          title: 'Minimal setup',
          href: '/examples/basics/minimal-setup',
        },
        {
          title: 'Tables',
          href: '/examples/basics/tables',
        },
        {
          title: 'Tasks',
          href: '/examples/basics/tasks',
        },
      ],
    },
    {
      type: 'group',
      href: '',
      title: 'Advanced',
      children: [
        {
          title: 'Clever editor',
          href: '/examples/advanced/clever-editor',
        },
        {
          title: 'Collaborative editing',
          href: '/examples/advanced/collaborative-editing',
        },
        {
          title: 'Drawing',
          href: '/examples/advanced/drawing',
        },
        {
          title: 'Forced content structure',
          href: '/examples/advanced/forced-content-structure',
        },
        {
          title: 'Interactive React & Vue views',
          href: '/examples/advanced/interactive-react-and-vue-views',
        },
        {
          title: 'Retrieval-Augmented Generation (RAG)',
          href: '/examples/advanced/retrieval-augmented-generation-rag',
        },
        {
          title: 'React performance',
          href: '/examples/advanced/react-performance',
        },
        {
          title: 'Menus',
          href: '/examples/advanced/menus',
        },
        {
          title: 'Mentions',
          href: '/examples/advanced/mentions',
        },
        {
          title: 'Syntax highlighting',
          href: '/examples/advanced/syntax-highlighting',
        },
      ],
    },
    {
      type: 'group',
      href: '',
      title: 'Experiments',
      children: [
        {
          title: 'Collaborative fields',
          href: '/examples/experiments/collaborative-fields',
        },
        {
          title: 'Figure',
          href: '/examples/experiments/figure',
        },
        {
          title: 'Generic figure',
          href: '/examples/experiments/generic-figure',
        },
        {
          title: 'iFrame',
          href: '/examples/experiments/iframe',
        },
        {
          title: 'Linting',
          href: '/examples/experiments/linting',
        },
        {
          title: 'Slash commands',
          href: '/examples/experiments/slash-commands',
        },
        {
          title: 'Trailing node',
          href: '/examples/experiments/trailing-node',
        },
      ],
    },
  ],
}

```

# guides\accessibility.mdx

```mdx
---
tags:
  - type: editor
title: How to make your editor accessible
meta:
  title: Accessibility | Tiptap Editor Docs
  description: Quick notes on ensuring accessibility by providing semantic markup, keyboard accessibility, and guidelines. More in the docs!
  category: Editor
---

We strive to make Tiptap accessible to everyone. From our current understanding, that’s what needs to be done:

### Interface

An interface needs to have well-defined contrasts, big enough click areas, semantic markup, must be keyboard accessible and well documented. Currently, we don’t provide an interface, so for now that’s totally up to you.

But no worries, we’ll provide an interface soon and take accessibility into account early on.

### Output

The editor needs to produce semantic markup, must be keyboard accessible and well documented. The Tiptap content is well structured so that’s a good foundation already. That said, we can add support and encourage the usage of additional attributes, for example the Alt-attribute for images.

### Writing assistance (optional)

An optional writing assitance could help people writing content semanticly correct, for example pointing out an incorrect usage of heading levels. With that kind of assistance provided by the core developers, we could help to improve the content of a lot of applications.

## Resources

| Document | Section | Heading                                                                                |
| -------- | ------- | -------------------------------------------------------------------------------------- |
| WCAG 3.0 | 7.1     | [Text Alternatives](https://www.w3.org/TR/wcag-3.0/#text-alternatives)                 |
| WCAG 2.1 | 1.1.1   | [Non-text Content](https://www.w3.org/WAI/WCAG21/Understanding/non-text-content)       |
| WCAG 2.1 | 2.1     | [Keyboard Accessible](https://www.w3.org/WAI/WCAG21/Understanding/keyboard-accessible) |
| WCAG 2.1 | 2.1.1   | [Keyboard](https://www.w3.org/WAI/WCAG21/Understanding/keyboard)                       |
| WCAG 2.1 | 4.1.1   | [Parsing](https://www.w3.org/WAI/WCAG21/Understanding/parsing)                         |
| WCAG 2.1 | 4.1.2   | [Name, Role, Value](https://www.w3.org/WAI/WCAG21/Understanding/name-role-value)       |
| WCAG 2.1 | 2.1.2   | [No Keyboard Trap](https://www.w3.org/TR/WCAG21/#no-keyboard-trap)                     |

```

# guides\authentication.mdx

```mdx
---
tags:
  - type: collaboration
meta:
  title: JWT Authentication with Collaboration | Tiptap Collaboration Docs
  description: Implement JWT authentication with Tiptap's collaboration and securely generate and manage JWTs server-side. More in the docs!
  category: Collaboration
title: Authentication with Collaboration
---

The JWT that is given by Collaboration is valid for just a few hours, which is enough for testing,
but certainly not enough for a real live application.

For a quick setup guide, follow these instructions. For detailed information, visit the [Authentication](/collaboration/getting-started/authenticate) page.

## Authenticate with JWT

In a short explanation, a JWT (JSON Web Token) is a json object that is cryptographically signed, which means a generated JWT cannot be altered.

## Generate a JWT

The JWT **must** be generated on the server side, as your `secret` **must not** leave your server (i.e. don't even try to generate the JWT on the frontend).
You can use the following snippet on a NodeJS server and build an API around it.

\`\`\`typescript
import jsonwebtoken from 'jsonwebtoken'

const jwt = jsonwebtoken.sign(
  {
    /* object to be encoded in the JWT */
  },
  'your_secret',
)
// this JWT should be sent in the `token` field of the provider. Never expose 'your_secret' to a frontend!
\`\`\`

A full server / API example is available [here](https://github.com/ueberdosis/tiptap-collab-replit/tree/main/src).
Make sure to put the `secret` inside the server environment variable (or just make it a constant in the server file, don't transfer it from the client).
You probably want to create an API call like `GET /getCollabToken` which will generate the JWT based on the server secret and the list of documents that the user is allowed to access.

## Limit access to specific documents

Documents can only be accessed by knowing the exact document name, as there is no way to get a list of documents from Collaboration.
Thus, it's a good practice to name them like `userUuid/documentUuid` (i.e. `1500c624-8f9f-496a-b196-5e5dd8ec3c25/7865975c-38d0-4bb5-846b-df909cdc66d3`), which
already makes it impossible to open random documents by guessing the name.

If you want to further limit which documents can be accessed using which JWT, you can encode the `allowedDocumentNames` property in the JWT, as in the following
example. The created JWT will only allow access to the document(s) specified.

\`\`\`typescript
import jsonwebtoken from 'jsonwebtoken'

const jwt = jsonwebtoken.sign(
  {
    allowedDocumentNames: [
      '1500c624-8f9f-496a-b196-5e5dd8ec3c25/7865975c-38d0-4bb5-846b-df909cdc66d3', // userUuid/documentUuid
      '1500c624-8f9f-496a-b196-5e5dd8ec3c25/*', // userUuid/*
    ],
  },
  'your_secret',
)
// this JWT should be sent in the `token` field of the provider. Never expose 'your_secret' to a frontend!
\`\`\`

```

# guides\index.mdx

```mdx
---
title: Tiptap Guides
meta:
  title: Guides | Tiptap Docs
  description: Explore the Tiptap guides about Content AI, Comments, Collaboration, and more to build dynamic and accessible rich-text editors.
  category: Editor
sidebars:
  hideSecondary: true
---

import Link from '@/components/Link'
import { Tag } from '@/components/ui/Tag'
import { Section } from '@/components/ui/Section'
import * as FilterGrid from '@/components/FilterGrid'
import * as CardGrid from '@/components/CardGrid'

Tiptap Guides provide practical advice on configuring your editor, enhancing the user experience with our features, custom extensions, interactive elements, and ensuring accessibility, all aimed at helping you build inclusive and dynamic rich text editors for your applications.

<FilterGrid.Wrapper filters={['Editor', 'Collaboration']}>
  <CardGrid.Wrapper className="sm:grid-cols-3">
    <FilterGrid.Item filter="Editor">
      <CardGrid.Item asChild>
        <Link href="/guides/pro-extensions">
          <CardGrid.Subtitle size="sm">First Steps</CardGrid.Subtitle>
          <div>
            <CardGrid.ItemTitle>How to integrate Pro Extensions</CardGrid.ItemTitle>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
    <FilterGrid.Item filter="Editor">
      <CardGrid.Item asChild>
        <Link href="/guides/accessibility">
          <CardGrid.Subtitle size="sm">Essential</CardGrid.Subtitle>
          <div>
            <CardGrid.ItemTitle>
              How to ensure the content created with Tiptap is accessible?
            </CardGrid.ItemTitle>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
    <FilterGrid.Item filter="Editor">
      <CardGrid.Item asChild>
        <Link href="/guides/performance">
          <CardGrid.Subtitle size="sm">Essential</CardGrid.Subtitle>
          <div>
            <CardGrid.ItemTitle>
              How to make sure your editor is integrated performantly?
            </CardGrid.ItemTitle>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
    <FilterGrid.Item filter="Editor">
      <CardGrid.Item asChild>
        <Link href="/guides/invalid-schema">
          <CardGrid.Subtitle size="sm">Essential</CardGrid.Subtitle>
          <div>
            <CardGrid.ItemTitle>
                How to handle invalid schemas in Tiptap
            </CardGrid.ItemTitle>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
    <FilterGrid.Item filter="Editor">
      <CardGrid.Item asChild>
        <Link href="/guides/output-json-html">
          <CardGrid.Subtitle size="sm">Essential</CardGrid.Subtitle>
          <div>
            <CardGrid.ItemTitle>
              See how to export and store your content as JSON or HTML
            </CardGrid.ItemTitle>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
    <FilterGrid.Item filter="Collaboration">
      <CardGrid.Item asChild>
        <Link href="/guides/authentication">
          <CardGrid.Subtitle size="sm">Essential</CardGrid.Subtitle>
          <div>
            <CardGrid.ItemTitle>
              How to implement authentication for document access control?
            </CardGrid.ItemTitle>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Collaboration</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
    <FilterGrid.Item filter="Collaboration">
      <CardGrid.Item asChild>
        <Link href="/guides/naming-documents">
          <CardGrid.Subtitle size="sm">Documents</CardGrid.Subtitle>
          <div>
            <CardGrid.ItemTitle>
              How to effectively name and organize documents in your collaborative platform?
            </CardGrid.ItemTitle>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Collaboration</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
    <FilterGrid.Item filter="Collaboration">
      <CardGrid.Item asChild>
        <Link href="/guides/offline-support">
          <CardGrid.Subtitle size="sm">Offline</CardGrid.Subtitle>
          <div>
            <CardGrid.ItemTitle>
              How to incorporate offline capabilities and automatic sync?
            </CardGrid.ItemTitle>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Collaboration</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
    <FilterGrid.Item filter="Editor">
      <CardGrid.Item asChild>
        <Link href="/guides/upgrade-tiptap-v1">
          <CardGrid.Subtitle size="sm">Essential</CardGrid.Subtitle>
          <div>
            <CardGrid.ItemTitle>How to upgrade from Tiptap v1 to v2?</CardGrid.ItemTitle>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
    <FilterGrid.Item filter="Editor">
      <CardGrid.Item asChild>
        <Link href="/guides/typescript">
          <CardGrid.Subtitle size="sm">Customization</CardGrid.Subtitle>
          <div>
            <CardGrid.ItemTitle>
              How to code and extend your Editor with TypeScript?
            </CardGrid.ItemTitle>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </FilterGrid.Item>
  </CardGrid.Wrapper>
</FilterGrid.Wrapper>

```

# guides\invalid-schema.mdx

```mdx
---
tags:
  - type: editor
meta:
    title: Invalid schema handling | Tiptap Editor Docs
    description: Adjust and configure how you handle invalid schemas in Tiptap and Tiptap Collaboration. More in the docs!
    category: Editor
title: Invalid schema handling in Tiptap
---

Content integrity can be a significant challenge in collaborative editing environments. Think of a scenario where users with different versions of an app are trying to edit the same document. Or a scenario common to single-page applications: some users keep their browser tabs open for long periods of time without refreshing, while others always have the latest editor version after a recent page load.

In both cases, a user with a newer version is creating content with features that are not available to others. When a user with an older version tries to access this document, how do we prevent data loss, maintain document structure, and ensure a smooth user experience?

This is where invalid schema handling becomes important. It allows developers to gracefully manage situations where the content structure doesn't match the editor's expectations, preventing issues like data corruption, unexpected content stripping, or editor crashes.

Whether you're building a note-taking app, a content management system, or any application with rich text editing capabilities, understanding and implementing proper schema handling can significantly improve your application's reliability and user experience.

## Introducing content checking

Tiptap has an option called `enableContentCheck`. When set to `true`, this feature activates a mechanism to validate content against the schema derived from your registered extensions. This is particularly useful for catching and responding to content errors before they cause issues in your application.

### Enable content checking

To enable this feature, simply add the `enableContentCheck` option when initializing your Tiptap editor:

\`\`\`jsx
new Editor({
  enableContentCheck: true,
  // ... other options
})
\`\`\`

## The contentError event

When content checking is enabled, Tiptap will emit a `contentError` event if the initial content provided during editor setup is incompatible with the schema. This event provides you with valuable information to handle the error appropriately.

### Handle contentError events

You have two options for handling these events:

Either you can use  the `onContentError` callback:

\`\`\`jsx
new Editor({
  enableContentCheck: true,
  content: potentiallyInvalidContent,
  onContentError({ editor, error, disableCollaboration }) {
    // Your error handling logic here
  },
  // ... other options
})

\`\`\`

Or you can attach a listener to the `contentError` event:

\`\`\`jsx
const editor = new Editor({
  enableContentCheck: true,
  content: invalidContent,
  // ... other options
})

editor.on('contentError', ({ editor, error, disableCollaboration }) => {
  // Your error handling logic here
})

\`\`\`

## A note on content types

It's important to note that Tiptap's content checking is 100% accurate for JSON content types. However, when working with HTML content, there may be some limitations. While Tiptap does its best to alert on missing nodes, certain mark-related issues might be missed in some situations.

## Recommended error handling strategies

How you handle schema errors will depend on your specific application and requirements. However, here are some general recommendations:

### For non-collaborative editing

If you're not using collaborative editing features, the default behavior of stripping unknown content may be sufficient. This keeps your content in a known valid state for future editing.

### For collaborative editing

When using collaborative features, it's crucial to handle content errors to prevent synchronization issues. Here's an example of how you might handle a content error in a collaborative environment:

\`\`\`jsx
onContentError({ editor, error, disableCollaboration }) {
  // Disable collaboration to prevent syncing invalid content
  disableCollaboration()

  // Prevent emitting updates
  const emitUpdate = false

  // Disable further user input
  editor.setEditable(false, emitUpdate)

  // Notify the user about the issue
  notifyUser("An error occurred. Please refresh the application.")
}

\`\`\`

This approach:
1. Disables collaboration to prevent syncing invalid content
2. Prevents updates from being emitted
3. Disables the editor to prevent further user input
4. Notifies the user about the issue
```

# guides\legacy-conversion.mdx

```mdx
---
tags:
  - type: editor
title: Legacy DOCX Import & Export
meta:
    title: Legacy DOCX | Tiptap Editor Docs
    description: Review how to configure the legacy import and export extensions and REST API endpoints. More in the docs.
    category: Editor
---

import { Callout } from '@/components/ui/Callout'

The original `extension-import` and `extension-export` packages for Tiptap provide reliable methods to import and export DOCX files.

These extensions, and associated endpoints remain available to anyone with a Tiptap account but are no longer actively developed.

They will be officially sunset later in 2025 and replaced by the new [Tiptap Conversion](/conversion/getting-started/overview) extensions and services.

The following guide focuses on configuring the legacy extensions.

## Import legacy extension

<Callout title="Legacy Import Extension Deprecation" variant="warning">
    The **extension-import** package will no longer be supported later 2025. Please plan to migrate to our [newer solutions](/conversion/getting-started/overview) or alternative endpoints before then to ensure uninterrupted service.
</Callout>

\`\`\`js
// Start with importing the extension
import { Import } from '@tiptap-pro/extension-import'

const editor = new Editor({
  // ...
  extensions: [
    // ...
    Import.configure({
      // The Convert App-ID from the Convert settings page: https://cloud.tiptap.dev/convert-settings
      appId: 'your-app-id',

      // The JWT token you generated in the previous step
      token: 'your-jwt',

      // The URL to upload images to, if not provided, images will be stripped from the document
      imageUploadCallbackUrl: 'https://your-image-upload-url.com',

      // Enables the experimental DOCX import which should better preserve content styling
      experimentalDocxImport: true,
    }),
  ],
})
\`\`\`

### Import your first document

\`\`\`js
// The most simple way to import a file
// This will import the uploaded file, replace the editor content
// and focus the editor
editor.chain().focus().import({ file }).run()
\`\`\`

#### Customize the import behavior

\`\`\`js
// You can also use the onImport callback to customize the import behavior
editor
  .chain()
  .import({
    file,
    onImport(context) {
      const { setEditorContent, content, error } = context

      // add error handling
      if (error) {
        showErrorToast({ message: error.message })
      }

      // You could also modify the content before inserting it
      content.doc.content.push({ type: 'paragraph', content: [{ type: 'text', text: 'Hello!' }] })

      // you can change the loading state of your application for example
      isLoading = false

      // make sure you call the setEditorContent function if you want to run
      // the default insertion behavior of the extension
      // setEditorContent()
      // but since we modified the content, we need to do the insertion manually
      editor.commands.setContent(content)
    },
  })
  .focus()
  .run()
\`\`\`

### Import options

| Name                     | Type       | Default     | Description                                                                                                                                                                                     |
| ------------------------ | ---------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `appId`                  | `string`   | `undefined` | The convert app ID from the Convert settings page: [https://cloud.tiptap.dev/convert-settings](https://cloud.tiptap.dev/convert-settings)                                                       |
| `token`                  | `string`   | `undefined` | The JWT token generated from your server via secret                                                                                                                                             |
| `imageUploadCallbackUrl` | `string`   | `undefined` | The URL to upload images to, if not provided, images will be stripped from the document, [see more info](/collaboration/documents/conversion#image-uploading)                                   |
| `experimentalDocxImport` | `boolean ` | `false`     | Enables the experimental DOCX import which should better preserve content styling (experimental, and this API may not be completely stable while in alpha), only applies to DOCX files uploaded |

### Commands

| Name     | Description                   |
| -------- | ----------------------------- |
| `import` | Import a file into the editor |

#### `import`

##### Arguments

| Name       | Type       | Default     | Options       | Description                                                                                                                                                                   |
| ---------- | ---------- | ----------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `file`     | `File`     | `undefined` | Any file      | The file to import                                                                                                                                                            |
| `format`   | `string`   | `undefined` | `gfm`         | Is used for special cases where the format is not clear, for example markdown gfm                                                                                             |
| `onImport` | `Function` | `undefined` | `fn(context)` | A callback used to customize the import behavior. The context argument includes information about the content, errors and a `setEditorContent` function to modify the content |

### Supported formats

- `docx` - Microsoft Word, Google Docs, OpenOffice, LibreOffice and others
- `odt` - OpenDocument Text format used by OpenOffice, LibreOffice and others
- `rtf` - Rich Text Format used by Microsoft Word, Google Docs and others
- Commonmark `markdown` - Markdown format used by various editors and platforms
- GFM `markdown` - GitHub Flavored Markdown used by GitHub

### Caveats and limitations

- **Image upload** - Images are assumed to be inline within the document so, your editor should be setup with `Image.configure({ inline: true })` to display them correctly, otherwise they will be stripped from the document
- **Unsupported docx elements on import** - Importing docx files currently does not support page breaks, page headers and footers, horizontal rules or text styles
- **Content added via suggestion mode** - Content added via suggestion mode is not included in the imported prosemirror document
- **PDF import & export** - Importing and exporting PDF files is not yet supported
- **Inline styles** - Inline styles are currently not parsed and are not available in import & export

## Export legacy extension


<Callout title="Legacy Export Extension Deprecation" variant="warning">
    The **extension-export** package will no longer be supported later 2025. We strongly recommend transitioning to our updated [export extension](/conversion/getting-started/overview), which offer improved customization and ongoing support.
</Callout>

\`\`\`js
// Start with importing the extension
import { Export } from '@tiptap-pro/extension-export'

const editor = new Editor({
  // ...
  extensions: [
    // ...
    Export.configure({
      // The Convert App-ID from the convert settings page: https://cloud.tiptap.dev/convert-settings
      appId: 'your-app-id',

      // The JWT token you generated in the previous step
      token: 'your-jwt',
    }),
  ],
})
\`\`\`

### Export a document

\`\`\`js
// Do a simple export to docx
// Supported formats: docx, odt, md and gfm
editor.chain().focus().export({ format: 'docx' }).run()
\`\`\`

### Customize the export behavior

\`\`\`js
// You can also use the onExport callback to customize the export behavior
editor.chain().export({
  format: 'docx',
  onExport(context) {
    const { blob, error, download, filename } = context

    // add error handling
    if (error) {
      showErrorToast({ message: error.message })
    }

    // you can change the loading state of your application for example
    isLoading = false

    // you could modify the filename or handle the blob differently here
    // but we will keep them as they are

    // you can trigger a download directly by calling the download method
    download()

    // keep in mind that the download method will only work in the browser
    // and if the blob and filename was changed before must be managed manually
  },
})
\`\`\`

### Export options

| Name    | Type     | Default     | Description                                                                                                                               |
| ------- | -------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `appId` | `string` | `undefined` | The convert app ID from the Convert settings page: [https://cloud.tiptap.dev/convert-settings](https://cloud.tiptap.dev/convert-settings) |
| `token` | `string` | `undefined` | The JWT token generated from your server via secret                                                                                       |

### Commands

| Name     | Description               |
| -------- | ------------------------- |
| `export` | Export the editor content |

#### `export`

##### Arguments

| Name       | Type          | Default     | Options           | Description                                                                                                                                                                              |
| ---------- | ------------- | ----------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `format`   | `string`      | `undefined` | `docx,odt,md,gfm` | The format you want to export to                                                                                                                                                         |
| `content`  | `JSONContent` | `undefined` | Any Tiptap JSON   | The Tiptap JSON content you want to export                                                                                                                                               |
| `onExport` | `Function`    | `undefined` | `fn(context)`     | A callback used to customize the export behavior. The context argument includes information about the blob, filename, errors and a `download` function to download the document directly |

### Supported formats

- `docx` - Microsoft Word, Google Docs, OpenOffice, LibreOffice and others
- `odt` - OpenDocument Text format used by OpenOffice, LibreOffice and others
- Commonmark `markdown` - Markdown format used by various editors and platforms
- GFM `markdown` - GitHub Flavored Markdown used by GitHub

### Caveats and limitations

- **Custom Node exports** - Exporting custom nodes or marks is supported in the new [Conversion](/conversion/getting-started/overview) extensions and endpoints.
- **Custom docx templates** - Review our new [Conversion](/conversion/getting-started/overview) extensions and endpoints to integrate docx templates.
- **PDF import & export** - Exporting PDF files is not yet supported
- **Inline styles** - Review our new [Conversion](/conversion/getting-started/overview) extensions and endpoints to integrate inline styles.

## Legacy REST API

<Callout title="Legacy /v1/ Conversion REST API Deprecation" variant="warning">
    The **/v1/ Document Conversion REST API** will not be supported later 2025. For continued updates and maintenance, migrate to newer [API endpoints](/conversion/getting-started/overview) or check out our [Postman Collection](https://www.postman.com/docking-module-explorer-14290287/workspace/tiptap-collaboration-public/collection/33042171-cc186a66-df41-4df8-9c6e-e91b20deffe5?action=share&creator=32651125) for the latest resources.
</Callout>

The legacy document conversion API supports DOCX, ODT, and Markdown conversion from and to Tiptap’s JSON format.

### /import endpoint

The `/import` endpoint enables the conversion of `docx`, `odt`, or `markdown` files into Tiptap’s JSON format. Users can POST documents to this endpoint and use various parameters to customize how different document elements are handled during the conversion process.

- **Method**: `POST`

#### Required headers

| Name            | Description                                                                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `Authorization` | The JWT token to authenticate the request. Example: `Bearer your-jwt-token`                                                                     |
| `X-App-Id`      | The Convert App-ID from the Collaboration settings page: [https://cloud.tiptap.dev/convert-settings](https://cloud.tiptap.dev/convert-settings) |

#### Body

| Name                     | Type     | Description                                                                                                                  |
| ------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `file`                   | `File`   | The file to convert                                                                                                          |
| `imageUploadCallbackUrl` | `string` | The callback endpoint to upload images that were encountered within the uploaded document, [see more info](#image-uploading) |

#### Query parameters

Specify how source document elements are mapped to ProseMirror nodes or marks, and adjust the conversion to meet your specific styling and structural preferences.

| Name             | Default          | Description                                                          |
| ---------------- | ---------------- | -------------------------------------------------------------------- |
| `paragraph`      | `paragraph`      | Defines which prosemirror type is used for paragraph conversion      |
| `heading`        | `heading`        | Defines which prosemirror type is used for heading conversion        |
| `blockquote`     | `blockquote`     | Defines which prosemirror type is used for blockquote conversion     |
| `codeblock`      | `codeblock`      | Defines which prosemirror type is used for codeblock conversion      |
| `bulletlist`     | `bulletlist`     | Defines which prosemirror type is used for bulletList conversion     |
| `orderedlist`    | `orderedlist`    | Defines which prosemirror type is used for orderedList conversion    |
| `listitem`       | `listitem`       | Defines which prosemirror type is used for listItem conversion       |
| `hardbreak`      | `hardbreak`      | Defines which prosemirror type is used for hardbreak conversion      |
| `horizontalrule` | `horizontalrule` | Defines which prosemirror type is used for horizontalRule conversion |
| `table`          | `table`          | Defines which prosemirror type is used for table conversion          |
| `tablecell`      | `tablecell`      | Defines which prosemirror type is used for tableCell conversion      |
| `tableheader`    | `tableheader`    | Defines which prosemirror type is used for tableHeader conversion    |
| `tablerow`       | `tablerow`       | Defines which prosemirror type is used for tableRow conversion       |
| `bold`           | `bold`           | Defines which prosemirror mark is used for bold conversion           |
| `italic`         | `italic`         | Defines which prosemirror mark is used for italic conversion         |
| `underline`      | `underline`      | Defines which prosemirror mark is used for underline conversion      |
| `strikethrough`  | `strike`         | Defines which prosemirror mark is used for strikethrough conversion  |
| `link`           | `link`           | Defines which prosemirror mark is used for link conversion           |
| `code`           | `code`           | Defines which prosemirror mark is used for code conversion           |
| `image`          | `image`          | Defines which prosemirror mark is used for image conversion          |

### /import-docx endpoint (experimental)

The `/import-docx` endpoint enables the conversion of docx files into Tiptap's JSON format and allows for more docx-specific functions than the /import endpoint. Users can POST documents to this endpoint and use various parameters to customize how different document elements are handled during the conversion process.

- **Method**: `POST`

#### Required headers

| Name            | Description                                                                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `Authorization` | The JWT token to authenticate the request. Example: `Bearer your-jwt-token`                                                                     |
| `X-App-Id`      | The Convert App-ID from the Collaboration settings page: [https://cloud.tiptap.dev/convert-settings](https://cloud.tiptap.dev/convert-settings) |

#### Body

| Name                     | Type     | Description                                                                                                                  |
| ------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `file`                   | `File`   | The file to convert                                                                                                          |
| `imageUploadCallbackUrl` | `string` | The callback endpoint to upload images that were encountered within the uploaded document, [see more info](#image-uploading) |

#### Query parameters

Specify how source document elements are mapped to ProseMirror nodes or marks, and adjust the conversion to meet your specific styling and structural preferences.

| Name             | Default          | Description                                                          |
| ---------------- | ---------------- | -------------------------------------------------------------------- |
| `paragraph`      | `paragraph`      | Defines which prosemirror type is used for paragraph conversion      |
| `heading`        | `heading`        | Defines which prosemirror type is used for heading conversion        |
| `blockquote`     | `blockquote`     | Defines which prosemirror type is used for blockquote conversion     |
| `codeblock`      | `codeblock`      | Defines which prosemirror type is used for codeblock conversion      |
| `bulletlist`     | `bulletlist`     | Defines which prosemirror type is used for bulletList conversion     |
| `orderedlist`    | `orderedlist`    | Defines which prosemirror type is used for orderedList conversion    |
| `listitem`       | `listitem`       | Defines which prosemirror type is used for listItem conversion       |
| `hardbreak`      | `hardbreak`      | Defines which prosemirror type is used for hardbreak conversion      |
| `horizontalrule` | `horizontalrule` | Defines which prosemirror type is used for horizontalRule conversion |
| `table`          | `table`          | Defines which prosemirror type is used for table conversion          |
| `tablecell`      | `tablecell`      | Defines which prosemirror type is used for tableCell conversion      |
| `tableheader`    | `tableheader`    | Defines which prosemirror type is used for tableHeader conversion    |
| `tablerow`       | `tablerow`       | Defines which prosemirror type is used for tableRow conversion       |
| `bold`           | `bold`           | Defines which prosemirror mark is used for bold conversion           |
| `italic`         | `italic`         | Defines which prosemirror mark is used for italic conversion         |
| `underline`      | `underline`      | Defines which prosemirror mark is used for underline conversion      |
| `strikethrough`  | `strike`         | Defines which prosemirror mark is used for strikethrough conversion  |
| `link`           | `link`           | Defines which prosemirror mark is used for link conversion           |
| `code`           | `code`           | Defines which prosemirror mark is used for code conversion           |
| `image`          | `image`          | Defines which prosemirror mark is used for image conversion          |

### /export endpoint

The `/export` endpoint converts Tiptap documents back into formats like `docx`, `odt`, or `markdown`.

- **Method**: `POST`

Convert a Tiptap document to a different format.

#### Required headers

| Name            | Description                                                                                                                                     |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `Authorization` | The JWT token to authenticate the request. Example: `Bearer your-jwt-token`                                                                     |
| `X-App-Id`      | The Convert App-ID from the Collaboration settings page: [https://cloud.tiptap.dev/convert-settings](https://cloud.tiptap.dev/convert-settings) |

#### Body

| Name      | Type     | Description                                                  |
| --------- | -------- | ------------------------------------------------------------ |
| `content` | `Object` | The Tiptap document                                          |
| `format`  | `string` | The format to convert to, can be `docx`, `odt` or `markdown` |

#### Query parameters

| Name             | Default          | Description                                                          |
| ---------------- | ---------------- | -------------------------------------------------------------------- |
| `gfm`            | `0`              | Use Github Flavored Markdown for markdown export                     |
| `paragraph`      | `paragraph`      | Defines which prosemirror type is used for paragraph conversion      |
| `heading`        | `heading`        | Defines which prosemirror type is used for heading conversion        |
| `blockquote`     | `blockquote`     | Defines which prosemirror type is used for blockquote conversion     |
| `codeblock`      | `codeblock`      | Defines which prosemirror type is used for codeblock conversion      |
| `bulletlist`     | `bulletlist`     | Defines which prosemirror type is used for bulletList conversion     |
| `orderedlist`    | `orderedlist`    | Defines which prosemirror type is used for orderedList conversion    |
| `listitem`       | `listitem`       | Defines which prosemirror type is used for listItem conversion       |
| `hardbreak`      | `hardbreak`      | Defines which prosemirror type is used for hardbreak conversion      |
| `horizontalrule` | `horizontalrule` | Defines which prosemirror type is used for horizontalRule conversion |
| `table`          | `table`          | Defines which prosemirror type is used for table conversion          |
| `tablecell`      | `tablecell`      | Defines which prosemirror type is used for tableCell conversion      |
| `tableheader`    | `tableheader`    | Defines which prosemirror type is used for tableHeader conversion    |
| `tablerow`       | `tablerow`       | Defines which prosemirror type is used for tableRow conversion       |
| `bold`           | `bold`           | Defines which prosemirror mark is used for bold conversion           |
| `italic`         | `italic`         | Defines which prosemirror mark is used for italic conversion         |
| `underline`      | `underline`      | Defines which prosemirror mark is used for underline conversion      |
| `strikethrough`  | `strike`         | Defines which prosemirror mark is used for strikethrough conversion  |
| `link`           | `link`           | Defines which prosemirror mark is used for link conversion           |
| `code`           | `code`           | Defines which prosemirror mark is used for code conversion           |
```

# guides\naming-documents.mdx

```mdx
---
tags:
  - type: collaboration
meta:
  title: Name Documents | Tiptap Collaboration Docs
  description: Name and organize documents effectively in Tiptap Collaboration, using unique identifiers and Y.js fragments. More in the docs!
  category: Collaboration
title: Name and structure your Collaboration documents
---

This guide outlines best practices for naming documents and organizing content within a single document, to help you define your own document structure.

For a comprehensive understanding of how to choose document names, you should review our [authorization guide](/collaboration/getting-started/authenticate#set-up-authorization), as document naming plays a crucial role in access control as well.

## Structure document names

Tiptap Collaboration uses document names to facilitate collaborative sessions, they serve as unique identifiers that link users to the same document. In theory it could be any string.

While the following example uses an entity's name combined with a unique ID, typical for CMS applications, you're free to adopt any naming convention that suits your application's requirements.

New documents are automatically generated as needed; you only need to provide a string identifier to the provider.

\`\`\`typescript
const documentName = 'article.123'
\`\`\`

This naming format allows you to separate out the key details easily:

\`\`\`typescript
const documentName = 'article.123'

// Splitting the document name into separate parts
const [entityType, entityID] = documentName.split('.')

console.log(entityType) // Output: "article"
console.log(entityID) // Output: "123"
\`\`\`

## Manage nested documents with fragments

Yjs's fragments are ideal for handling complex documents with distinct sections. This might be relevant in case you want to nest your documents, like for example a blog post with separate `title` and `content` parts.

With fragments, you can use one Y.Doc instance (e.g. one document) and use different editors for its distinct sections.

For example, in this blog post setup:

\`\`\`typescript
const ydoc = new Y.Doc()

// Title editor
const titleEditor = new Editor({
  extensions: [
    Collaboration.configure({
      document: this.ydoc,
      field: 'title',
    }),
  ],
})

// Content editor
const bodyEditor = new Editor({
  extensions: [
    Collaboration.configure({
      document: this.ydoc,
      field: 'content',
    }),
  ],
})
\`\`\`

For complex setups with nested fragments, you can directly use a raw Y.js fragment, bypassing the `document` and `field` settings.

\`\`\`typescript
// a raw Y.js fragment
Collaboration.configure({
  fragment: ydoc.getXmlFragment('custom'),
})
\`\`\`

To fully grasp how document naming influences access control in Tiptap Collaboration, it's essential to consult our [authorization guide](/collaboration/getting-started/authenticate).

```

# guides\offline-support.mdx

```mdx
---
tags:
  - type: collaboration
title: Add offline support to your editor
meta:
  title: Offline support | Tiptap Collaboration Docs
  description: Add offline functionality to your Collaborative Editor and enable local data storage and automatic sync when online.
  category: Collaboration
---

Easily add offline functionality to your collaborative editor by using the [Y IndexedDB](https://docs.yjs.dev/ecosystem/database-provider/y-indexeddb) extension. This tool from the Y.js ecosystem enhances your editor with offline data storage and sync capabilities.

## Integrating offline support

Begin by adding the Y IndexedDB adapter to your project:

\`\`\`bash
npm install y-indexeddb
\`\`\`

Connect Y Indexeddb with a Y document to store it locally.

\`\`\`typescript
import { Editor } from '@tiptap/core'
import Collaboration from '@tiptap/extension-collaboration'
import * as Y from 'yjs'
import { IndexeddbPersistence } from 'y-indexeddb'

const ydoc = new Y.Doc()

// Set up IndexedDB for local storage of the Y document
new IndexeddbPersistence('example-document', ydoc)

const editor = new Editor({
  extensions: [
    // Other extensions...
    Collaboration.configure({
      document: ydoc,
    }),
  ],
})
\`\`\`

The IndexedDB adapter ensures that every change to your document is stored locally in the browser. This means your work is saved even if you close the tab, lose your internet connection, or edit offline. When you're back online, it automatically syncs these changes.

```

# guides\output-json-html.mdx

```mdx
---
tags:
  - type: editor
title: Output and content handling with Tiptap
meta:
  title: Export to JSON and HTML | Tiptap Editor Docs
  description: Manage content formats in Tiptap Editor and export to JSON and HTML, using Y.js for advanced features. More in the docs!
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'

You can store your content as a JSON object or as a good old HTML string. Both work fine. And of course, you can pass both formats to the editor to restore your content. Here is an interactive example, that exports the content as HTML and JSON when the document is changed:

## Export

### Option 1: JSON

JSON is probably easier to loop through, for example to look for a mention and it’s more like what Tiptap uses under the hood. Anyway, if you want to use JSON to store the content we provide a method to retrieve the content as JSON:

\`\`\`js
const json = editor.getJSON()
\`\`\`

You can store that in your database (or send it to an API) and restore the document initially:

\`\`\`js
new Editor({
  content: {
    type: 'doc',
    content: [
      // …
    ],
  },
})
\`\`\`

Or if you need to wait for something, you can do it later through the editor instance:

\`\`\`js
editor.commands.setContent({
  type: 'doc',
  content: [
    // …
  ],
})
\`\`\`

Here is an interactive example where you can see that in action:

<CodeDemo path="/guidecontent/exportjson?hideSource=true" />

### Option 2: HTML

HTML can be easily rendered in other places, for example in emails and it’s widely used, so it’s probably easier to switch the editor at some point. Anyway, every editor instance provides a method to get HTML from the current document:

\`\`\`js
const html = editor.getHTML()
\`\`\`

This can then be used to restore the document initially:

\`\`\`js
new Editor({
  content: `<p>Example Text</p>`,
})
\`\`\`

Or if you want to restore the content later (e. g. after an API call has finished), you can do that too:

\`\`\`js
editor.commands.setContent(`<p>Example Text</p>`)
\`\`\`

Use this interactive example to fiddle around:

<CodeDemo path="/guidecontent/exporthtml?hideSource=true" />

### Option 3: Y.js

Our editor has top notch support for Y.js, which is amazing to add features like [realtime collaboration, offline editing, or syncing between devices](/collaboration/getting-started/overview).

Internally, Y.js stores a history of all changes. That can be in the browser, on a server, synced with other connected clients, or on a USB stick. But, it’s important to know that Y.js needs those stored changes. A simple JSON document is not enough to merge changes.

Sure, you can import existing JSON documents to get started and get a JSON out of Y.js, but that’s more like an import/export format. It won’t be your single source. That’s important to consider when adding Y.js for one of the mentioned use cases.

That said, it’s amazing and we’re about to provide an amazing backend, that makes all that a breeze.

### Markdown

Tiptap already provides import, export, and REST API conversions for Markdown (including GitHub Flavored Markdown). This lets you:

- **Import `.md` or GFM** files into a Tiptap editor, converting them to Tiptap JSON
- **Export** Tiptap JSON to standard Markdown or GFM, letting you save or share your editor content as a `.md` file.
- **Integrate server-side** (no editor required) by sending or retrieving `.md` content via our Conversion REST API.

See [Markdown Conversion](/conversion/import-export/markdown) for details on how to handle other Markdown features, plus examples for both in-editor workflows and server-side usage.

**Tiptap v3 will deepen Markdown support.** We’re committed to making Markdown more robust and easier to integrate for advanced (AI) use cases.

## Listen for changes

If you want to continuously store the updated content while people write, you can [hook into events](/editor/api/events). Here is an example how that could look like:

\`\`\`js
const editor = new Editor({
  // intial content
  content: `<p>Example Content</p>`,

  // triggered on every change
  onUpdate: ({ editor }) => {
    const json = editor.getJSON()
    // send the content to an API here
  },
})
\`\`\`

## Render

### Option 1: Read-only instance of Tiptap

To render the saved content, set the editor to read-only. That’s how you can achieve the exact same rendering as it’s in the editor, without duplicating your CSS and other code.

<CodeDemo path="/GuideContent/ReadOnly?inline=false&hideSource=false" />

### Option 2: Generate HTML from ProseMirror JSON

If you need to render the content on the server side, for example to generate the HTML for a blog post, which has been written in Tiptap, you’ll probably want to do just that without an actual editor instance.

That’s what the `generateHTML()` is for. It’s a helper function which renders HTML without an actual editor instance.

<CodeDemo path="/GuideContent/GenerateHTML?inline=false&hideSource=false" />

By the way, the other way is possible, too. The below examples shows how to generate JSON from HTML.

<CodeDemo path="/GuideContent/GenerateJSON?inline=false&hideSource=false" />

## Migrate

If you’re migrating existing content to Tiptap we would recommend to get your existing output to HTML. That’s probably the best format to get your initial content into Tiptap, because ProseMirror ensures there is nothing wrong with it. Even if there are some tags or attributes that aren’t allowed (based on your configuration), Tiptap just throws them away quietly.

We’re about to go through a few cases to help with that, for example we provide a PHP package to convert HTML to a compatible JSON structure: [ueberdosis/prosemirror-to-html](https://github.com/ueberdosis/html-to-prosemirror).

[Share your experiences with us!](mailto:humans@tiptap.dev) We’d like to add more information here.

## Security

There is no reason to use one or the other because of security concerns. If someone wants to send malicious content to your server, it doesn’t matter if it’s JSON or HTML. It doesn’t even matter if you’re using Tiptap or not. You should always validate user input.

```

# guides\performance.mdx

```mdx
---
tags:
  - type: editor
title: Integrating Tiptap performantly in your app
meta:
  title: Integration performance | Tiptap Editor Docs
  description: Learn how to integrate Tiptap Editor performantly in your app. More in the docs!
  category: Editor
---

import { CodeDemo } from '@/components/CodeDemo'

<CodeDemo path="/Examples/Book" />

Tiptap is a very performant editor (even able to edit an entire book!), often when you run into performance issues, it's not Tiptap itself, but the way you integrate it into your app. Here are some tips to make sure your editor runs smoothly.

## React Tiptap Editor Integration

<CodeDemo path="/Examples/Performance?hideSource=true" />

When using Tiptap with React, the most common performance issue is that the editor is re-rendered too often. This can happen for several reasons:

- When using the `useEditor` hook, it by default will re-render the editor on every change. So, you should isolate the editor (and things that depend on it) in a separate component to prevent unnecessary re-renders.
- The editor should be isolated from renders that don't affect it. For example, if you have a sidebar that doesn't interact with the editor, it should be in a separate component.

Luckily, the solution for most of these issues is the same: isolate the editor in a separate component. Here is an example of how you can do this:

DO: isolate the editor in a separate component

\`\`\`jsx
import { EditorContent, useEditor } from '@tiptap/react'

const TiptapEditor = () => {
  const editor = useEditor({
    extensions,
    content,
  })

  return (
    <>
      <EditorContent editor={editor} />
      {/* Other components that depend on the editor instance */}
      <MenuComponent editor={editor} />
    </>
  )
}

export default TiptapEditor
\`\`\`

DON'T: render the editor in the same component as other components

\`\`\`jsx
import { EditorContent, useEditor } from '@tiptap/react'

const App = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const editor = useEditor({
    extensions,
    content,
  })

  return (
    <>
      <UnrelatedSidebar onChange={setSidebarOpen} />
      <EditorContent editor={editor} />
      <MenuComponent editor={editor} />
      <Sidenav isSidebarOpen={sidebarOpen}>
        <AnotherComponent />
      </Sidenav>
    </>
  )
}

export default App
\`\`\`

These unrelated components will cause the editor to re-render more often than necessary, and make each render more expensive.

### Track down performance issues

You can use the React DevTools Profiler to see which components are re-rendering and why. Another strategy is to put a `console.count('editor render')` in the editor component and see how often it is re-rendered. This can help you identify which components are causing unnecessary re-renders.

If it is re-rendered more often than you expect, you can take the following steps:

- Check if the editor is rendering because of its parent component.
- Isolate the editor from unrelated state changes (e.g. opening a sidebar should not cause the editor to re-render).
- Use `useEditorState` to prevent unnecessary re-renders within the editor component.

Hopefully, these tips will help you track down and fix any performance issues you encounter.

### Use `useEditorState` to prevent unnecessary re-renders

The `useEditorState` hook allows you to subscribe to changes in the editor state and re-render only when necessary. This can help you prevent unnecessary re-renders of the editor and its components.

\`\`\`tsx
import { useEditor, useEditorState } from '@tiptap/react'

function Component() {
  const editor = useEditor({
    extensions,
    content,
  })

  const editorState = useEditorState({
    editor,
    // This function will be called every time the editor state changes
    selector: ({ editor }: { editor: Editor }) => ({
      // It will only re-render if the bold or italic state changes
      isBold: editorInstance.isActive('bold'),
      isItalic: editorInstance.isActive('italic'),
    }),
  })

  return (
    <>
      <EditorContent editor={editor} />
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editorState.isBold ? 'primary' : ''}
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editorState.isItalic ? 'primary' : ''}
      >
        Italic
      </button>
    </>
  )
}
\`\`\`

The `selector` function allows you to specify which parts of the editor state you want to subscribe to. By default this will be deeply compared with the previous selected state, and only re-render if it has changed. You can select any part of the editor state, or even derive new values from it.

### Gain more control over rendering

As of Tiptap v2.5.0, you can gain more control over rendering by using the `immediatelyRender` and `shouldRerenderOnTransaction` options. This can be useful if you want to prevent the editor from rendering immediately or on every transaction.

\`\`\`tsx
import { useEditor } from '@tiptap/react'

function Component() {
  const editor = useEditor({
    extensions,
    content,
    /**
     * This option gives us the control to enable the default behavior of rendering the editor immediately.
     */
    immediatelyRender: true,
    /**
     * This option gives us the control to disable the default behavior of re-rendering the editor on every transaction.
     */
    shouldRerenderOnTransaction: false,
  })

  return <EditorContent editor={editor} />
}
\`\`\`

## React node views performance

Node views allow you to render custom components in place of nodes within the editor. This enables you to embed any kind of content in your editor. However, when using React components, be aware of potential performance implications.

For technical reasons, node views are expected to be rendered synchronously. Tiptap will create new elements for each node view and mount your React component in them. This can be expensive, especially if you have many instances of node views throughout your editor.

We've optimized as much as possible on our side, but if you find that rendering node views is causing performance issues, consider using plain HTML elements or a different approach to render your content within your node view.

```

# guides\pro-extensions.mdx

```mdx
---
tags:
  - type: editor
  - type: ai
  - type: collaboration
  - type: documents
title: How to use Tiptap Pro extensions?
meta:
  title: Pro Extensions | Tiptap Editor Docs
  description: Tiptap Pro extensions add advanced capabilities to the Tiptap Editor and are installed from the private Tiptap NPM registry.
  category: Editor
---

import { Callout } from '@/components/ui/Callout'

Tiptap Pro extensions add advanced capabilities to the Tiptap Editor such as versioning and AI-assisted content generation. A Tiptap account is required to access Pro extensions. Select extensions such as Collaboration History, Comments, and the Content AI extensions also require an active subscription.

To install Pro Extensions you authenticate to the private Tiptap NPM registry with a Tiptap Pro authentication token. You can configure credentials for your package manager on a per-project basis, or set them globally for CI/CD environments.

<Callout title="Security warning" variant="warning">
  Treat your authentication tokens like passwords to prevent unauthorized use. Each Tiptap user has
  a unique authentication token that does not expire. We recommend creating a dedicated user for
  CI/CD applications.
</Callout>

## Configure per-project authentication

1. Get your Tiptap Pro authentication token from https://cloud.tiptap.dev/pro-extensions.
2. Add the Tiptap private registry to the package manager configuration file in the root directory of your project.

For **npm**, **pnpm**, or **Yarn Classic** (Yarn 1), add the registry to `.npmrc`.

\`\`\`
@tiptap-pro:registry=https://registry.tiptap.dev/
//registry.tiptap.dev/:_authToken=${TIPTAP_PRO_TOKEN}
\`\`\`

If you are using **Yarn Modern** (Yarn 2+), add the registry to `.yarnrc.yml`.

\`\`\`
npmScopes:
 tiptap-pro:
   npmAlwaysAuth: true
   npmRegistryServer: "https://registry.tiptap.dev/"
   npmAuthToken: ${TIPTAP_PRO_TOKEN}
\`\`\`

<Callout title="Note" variant="hint">
  You can specify the authentication token directly or using an environment variable as shown
  (recommended).
</Callout>

4. Add the configuration file to the project's `.gitignore` file to prevent it from being checked into your source code repository.

<Callout title="Warning" variant="hint">
  This is essential to avoid leaking your credentials if you specify the authentication token
  directly in the configuration file.
</Callout>

Once you've configured authentication for a project, you can install Pro Extensions like any other Editor extension.

If you use environment variables, pass the authentication token during installation:

\`\`\`
TIPTAP_PRO_TOKEN=actual-auth-token npm install --save @tiptap-pro/extension-unique-id
\`\`\`

## Configure global authentication

You can set up authentication once for **all** of your projects by updating the package manager configuration file at the user level. This is useful for CI/CD environments.

1. Get your Tiptap Pro authentication token from https://cloud.tiptap.dev/pro-extensions.
2. Add the Tiptap private registry to the package manager configuration.

**Yarn Classic, npm**

\`\`\`bash
npm config set "@tiptap-pro:registry" https://registry.tiptap.dev/
\`\`\`

**Yarn Modern**

\`\`\`bash
yarn config set --home npmScopes.@tiptap-pro.npmRegistryServer "https://registry.tiptap.dev/"
yarn config set --home npmScopes.@tiptap-pro.npmAlwaysAuth "true"
\`\`\`

**pnpm**

\`\`\`bash
pnpm config set --global "@tiptap-pro:registry" https://registry.tiptap.dev/
\`\`\`

3. Add your authentication token to the package manager configuration.

**Yarn Classic, npm**

\`\`\`bash
npm config set "//registry.tiptap.dev/:_authToken" actual-auth-token
\`\`\`

**Yarn Modern**

\`\`\`bash
yarn config set --home npmScopes.@tiptap-pro.npmAuthToken "actual-auth-token"
\`\`\`

**pnpm**

\`\`\`bash
pnpm config set "//registry.tiptap.dev/:_authToken" actual-auth-token
\`\`\`

Once you've configured authentication, you can install Tiptap Pro extensions like any other extension:

\`\`\`
npm install --save @tiptap-pro/extension-unique-id
\`\`\`

```

# guides\sidebar.ts

```ts
import { SidebarConfig } from '@/types'

export const sidebarConfig: SidebarConfig = {
  id: 'guides',
  rootHref: '/guides',
  title: 'Guides',
  items: [
    {
      title: 'First Steps',
      href: '',
      type: 'group',
      children: [
        {
          href: '/guides/pro-extensions',
          title: 'Integrate Pro Extensions',
        },
      ],
    },
    {
      title: 'Essential',
      type: 'group',
      href: '',
      children: [
        {
          href: '/guides/accessibility',
          title: 'Accessibility',
        },
        {
          href: '/guides/performance',
          title: 'Performance',
        },
        {
          href: '/guides/invalid-schema',
          title: 'Invalid schema handling',
        },
        {
          href: '/guides/output-json-html',
          title: 'Export JSON or HTML',
        },
        {
          href: '/guides/authentication',
          title: 'Collaboration Auth',
        },
        {
          href: '/guides/naming-documents',
          title: 'Naming documents',
        },
        {
          href: '/guides/offline-support',
          title: 'Offline Collaboration',
        },
        {
          href: '/guides/upgrade-tiptap-v1',
          title: 'Upgrade Tiptap V1',
        },
        {
          href: '/guides/legacy-conversion',
          title: 'Legacy conversion',
        },
      ],
    },
    {
      title: 'Customization',
      type: 'group',
      href: '',
      children: [
        {
          href: '/guides/typescript',
          title: 'Extend with TypeScript',
        },
      ],
    },
  ],
}

```

# guides\typescript.mdx

```mdx
---
tags:
  - type: editor
title: Working with TypeScript
meta:
  title: TypeScript | Tiptap Editor Docs
  description: Use TypeScript to develop your Tiptap Editor. Learn more in our documentation
  category: Editor
---

The whole Tiptap codebase is written in TypeScript. If you haven’t heard of it or never used it, no worries. You don’t have to.

TypeScript extends JavaScript by adding types (hence the name). It adds new syntax, which doesn’t exist in Vanilla JavaScript. It’s actually removed before running in the browser, but this step – the compilation – is important to find bugs early. It checks if you pass the right types of data to functions. For a big and complex project, that’s very valuable. It means we’ll get notified of lots of bugs, before shipping code to you.

**Anyway, if you don’t use TypeScript in your project, that’s fine.** You will still be able to use Tiptap and nevertheless get a nice autocomplete for the Tiptap API (if your editor supports it, but most do).

If you are using TypeScript in your project and want to extend Tiptap, there are two types that are good to know about.

## Types

### Options types

To extend or create default options for an extension, you’ll need to define a custom type, here is an example:

\`\`\`ts
import { Extension } from '@tiptap/core'

export interface CustomExtensionOptions {
  awesomeness: number
}

const CustomExtension = Extension.create<CustomExtensionOptions>({
  addOptions() {
    return {
      awesomeness: 100,
    }
  },
})
\`\`\`

### Storage types

To add types for your extension storage, you’ll have to pass that as a second type parameter.

\`\`\`ts
import { Extension } from '@tiptap/core'

export interface CustomExtensionStorage {
  awesomeness: number
}

const CustomExtension = Extension.create<{}, CustomExtensionStorage>({
  name: 'customExtension',

  addStorage() {
    return {
      awesomeness: 100,
    }
  },
})
\`\`\`

When using storage outside of the extension you have to manually set the type.

\`\`\`ts
import { CustomExtensionStorage } from './custom-extension'

const customStorage = editor.storage.customExtension as CustomExtensionStorage
\`\`\`

### Command type

The core package also exports a `Command` type, which needs to be added to all commands that you specify in your code. Here is an example:

\`\`\`ts
import { Extension } from '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customExtension: {
      /**
       * Comments will be added to the autocomplete.
       */
      yourCommand: (someProp: any) => ReturnType
    }
  }
}

const CustomExtension = Extension.create({
  addCommands() {
    return {
      yourCommand:
        (someProp) =>
        ({ commands }) => {
          // …
        },
    }
  },
})
\`\`\`

That’s basically it. We’re doing all the rest automatically.

```

# guides\upgrade-tiptap-v1.mdx

```mdx
---
tags:
  - type: editor
title: How to upgrade Tiptap V1 to V2
meta:
  title: Offline support | Tiptap Collaboration Docs
  description: Add offline functionality to your Collaborative Editor and enable local data storage and automatic sync when online.
  category: Collaboration
---

First of all, Tiptap v1 isn’t supported anymore and won’t receive any further updates.

If you’re still using Tiptap v1, you can find the documentation [here](https://v1.tiptap.dev/), but we strongly recommend that you upgrade to version 2.

Yes, it’s tedious work to upgrade your favorite text editor to a new API, but we made sure you’ve got enough reasons to upgrade to the newest version.

- Autocompletion in your IDE (thanks to TypeScript)
- Amazing documentation with 100+ pages and 100+ interactive examples
- Active development, new features in the making, new releases every week
- Tons of new extensions
- Well-tested code base

The new API will look pretty familiar to you, but there are a ton of changes though. To make the upgrade a little bit easier, here is everything you need to know:

## Uninstall Tiptap v1

The whole package structure has changed, we even moved to another npm namespace, so you’ll need to remove the old version entirely before upgrading to Tiptap 2.

Otherwise you’ll run into an exception, for example “looks like multiple versions of prosemirror-model were loaded”.

\`\`\`bash
npm uninstall tiptap tiptap-commands tiptap-extensions tiptap-utils
\`\`\`

## Install Tiptap v2

Once you have uninstalled the old version of Tiptap, install the new Vue 2 package, the ProseMirror library and the starter kit:

\`\`\`bash
npm install @tiptap/vue-2 @tiptap/pm @tiptap/starter-kit
\`\`\`

## Keep Tiptap v2 up to date

We are constantly releasing updates to Tiptap.

Unfortunately, for npm there is no integrated tool to easily update your dependencies, but you can use the `npm-check` package:

\`\`\`bash
npm install -g npm-check
npm-check -u
\`\`\`

## Explicitly register the Document, Text and Paragraph extensions

Tiptap 1 tried to hide a few required extensions from you with the default setting `useBuiltInExtensions: true`. That setting has been removed and you’re required to import all extensions. Be sure to explicitly import at least the [`Document`](/editor/extensions/nodes/document), [`Paragraph`](/editor/extensions/nodes/paragraph) and [`Text`](/editor/extensions/nodes/text) extensions.

\`\`\`js
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'

new Editor({
  extensions: [
    Document,
    Paragraph,
    Text,
    // all your other extensions
  ],
})
\`\`\`

And we removed some settings: `dropCursor`, `enableDropCursor`, and `enableGapCursor`. Those are separate extensions now: [`Dropcursor`](/editor/extensions/functionality/dropcursor) and [`Gapcursor`](/editor/extensions/functionality/gapcursor). You probably want to load them, but if you don’t, just ignore this.

## New names for most extensions

We switched to lowerCamelCase, so there’s a lot type names that changed. If you stored your content as JSON you need to loop through it and rename them. Sorry for that one.

| Old type              | New type               |
| --------------------- | ---------------------- |
| ~~`bullet_list`~~     | `bulletList`           |
| ~~`code_block`~~      | `codeBlock`            |
| ~~`hard_break`~~      | `hardBreak`            |
| ~~`horizontal_rule`~~ | `horizontalRule`       |
| ~~`list_item`~~       | `listItem`             |
| ~~`ordered_list`~~    | `orderedList`          |
| ~~`table_cell`~~      | `tableCell`            |
| ~~`table_header`~~    | `tableHeader`          |
| ~~`table_row`~~       | `tableRow`             |
| ~~`todo_list`~~       | `taskList` (new name!) |
| ~~`todo_item`~~       | `taskItem` (new name!) |

## Removed methods

We removed the `.state()` method. No worries though, it’s still available through `editor.state`.

## New extension API

In case you’ve built some custom extensions for your project, you’re required to rewrite them to fit the new API. No worries, you can keep a lot of your work though. The `schema`, `commands`, `keys`, `inputRules` and `pasteRules` all work like they did before. It’s just different how you register them.

\`\`\`js
import { Node } from '@tiptap/core'

const CustomExtension = Node.create({
  name: 'custom_extension',
  addOptions() {
    …
  },
  addAttributes() {
    …
  },
  parseHTML() {
    …
  },
  renderHTML({ node, HTMLAttributes }) {
    …
  },
  addCommands() {
    …
  },
  addKeyboardShortcuts() {
    …
  },
  addInputRules() {
    …
  },
  // and more …
})
\`\`\`

Read more about [all the nifty details building custom extensions](/editor/extensions/custom-extensions) in our guide.

## Renamed settings and methods

[We renamed a lot of settings and methods](/editor/api/editor). Hopefully you can migrate to the new API with search & replace. Here is a list of what changed:

| Old name        | New name    |
| --------------- | ----------- |
| ~~`autoFocus`~~ | `autofocus` |

## Renamed commands

All new extensions come with specific commands to set, unset and toggle styles. So instead of `.bold()`, it’s now `.toggleBold()`. Also, we switched to lowerCamelCase, below are a few examples. Oh, and we renamed `todo_list`, to `taskList`, sorry for that one.

| Old command              | New command                     |
| ------------------------ | ------------------------------- |
| `.redo()`                | `.redo()` (nothing changed)     |
| `.undo()`                | `.undo()` (nothing changed)     |
| ~~`.todo_list()`~~       | `.toggleTaskList()` (new name!) |
| ~~`.blockquote()`~~      | `.toggleBlockquote()`           |
| ~~`.bold()`~~            | `.toggleBold()`                 |
| ~~`.bullet_list()`~~     | `.toggleBulletList()`           |
| ~~`.code()`~~            | `.toggleCode()`                 |
| ~~`.code_block()`~~      | `.toggleCodeBlock()`            |
| ~~`.hard_break()`~~      | `.setHardBreak()`               |
| ~~`.heading()`~~         | `.toggleHeading()`              |
| ~~`.horizontal_rule()`~~ | `.setHorizontalRule()`          |
| ~~`.italic()`~~          | `.toggleItalic()`               |
| ~~`.link()`~~            | `.toggleLink()`                 |
| ~~`.ordered_list()`~~    | `.toggleOrderedList()`          |
| ~~`.paragraph()`~~       | `.setParagraph()`               |
| ~~`.strike()`~~          | `.toggleStrike()`               |
| ~~`.underline()`~~       | `.toggleUnderline()`            |
| …                        | …                               |

## MenuBar, BubbleMenu and FloatingMenu

Read the dedicated [guide on creating menus](/editor/getting-started/style-editor/custom-menus) to migrate your menus.

## Commands can be chained now

Most commands can be combined to one call now. That’s shorter than separate function calls in most cases. Here is an example to make the selected text bold:

\`\`\`js
editor.chain().focus().toggleBold().run()
\`\`\`

The `.chain()` is required to start a new chain and the `.run()` is needed to actually execute all the commands in between. Read more about [the new Tiptap commands](/editor/api/commands) in our API documentation.

## .focus() isn’t called on every command anymore

We tried to hide the `.focus()` command from you with Tiptap 1 and executed that on every command. That led to issues in specific use cases, where you want to run a command, but don’t want to focus the editor.

With Tiptap v2 you have to explicitly call the `focus()` and you probably want to do that in a lot of places. Here is an example:

\`\`\`js
editor.chain().focus().toggleBold().run()
\`\`\`

## Event callbacks have fewer parameters

The new event callbacks have fewer parameters. The same things should be available through `this.` now. [Read more about events here.](/editor/api/events)

## Collaborative editing

The reference implementation for collaborative editing uses Y.js now. That’s a whole different thing. You still can use the Tiptap 1 extension, but it’s up to you to adapt it to the new extension API. If you’ve done this, don’t forget to share it with us so we can link to it from here!

Read more about [the new collaborative editing experience](/collaboration/getting-started/install) in our guide.

## Marks don’t support node view anymore

For marks, node views are [not well supported in ProseMirror](https://discuss.prosemirror.net/t/there-is-a-bug-in-marks-nodeview/2722/2). There is also [a related issue](https://github.com/ueberdosis/tiptap/issues/613) for Tiptap 1. That’s why we removed it in Tiptap 2.

```

# index.mdx

```mdx
---
title: Tiptap Docs
meta:
  title: Tiptap Docs
  description: Tiptap provides a framework to create custom content editors. Explore countless extensible features and handy cloud services.
  category: Editor
---

import { ArrowRightIcon } from 'lucide-react'
import Link from '@/components/Link'
import { Button } from '@/components/ui/Button'
import { ProductCard } from '@/components/ProductCard'
import { Section } from '@/components/ui/Section'
import { Tag } from '@/components/ui/Tag'
import * as CardGrid from '@/components/CardGrid'
import * as CtaBox from '@/components/CtaBox'
import * as Grid from '@/components/Grid'
import * as ImageCard from '@/components/ImageCard'
import AuditLogsIcon from '@/assets/icons/audit-logs.svg'
import cardCoverCollaborativeEditing from '@/assets/card-covers/examples/collaborative-editing.jpg'
import cardCoverDefaultEditor from '@/assets/card-covers/examples/default-text-editor.jpg'
import CloudIcon from '@/assets/icons/cloud.svg'
import conversionIcon from '@/assets/conversion.png'
import collabIcon from '@/assets/collaboration.png'
import commentsIcon from '@/assets/comments.png'
import contentAIIcon from '@/assets/content-ai.png'
import contentTemplatesImage from '@/assets/content-templates.png'
import DedicatedCloudIcon from '@/assets/icons/dedicated-cloud.svg'
import DiscordIcon from '@/assets/icons/discord.svg'
import DocumentManagementIcon from '@/assets/icons/document-management.svg'
import documentsIcon from '@/assets/documents.png'
import editorIcon from '@/assets/editor.png'
import GithubIcon from '@/assets/icons/github.svg'
import OnPremisesIcon from '@/assets/icons/self-hosted.svg'
import WebhookIcon from '@/assets/icons/webhook.svg'
import XIcon from '@/assets/icons/x.svg'

Tiptap is an editor framework designed for creating custom content experiences. Integrate content AI, collaborative editing, and commenting functionalities into your tech stack with a few lines of code.

Explore countless extensions for easy extensibility with minimal code changes using our flexible APIs.

<div className="grid gap-20">
    <CtaBox.Wrapper>
        <CtaBox.Title>Develop a rich text editor</CtaBox.Title>
        <CtaBox.Description>
          Start developing your own editor by integrating Tiptap's open-source and pro extensions. Create a free Tiptap account to access all features and services.
        </CtaBox.Description>
        <CtaBox.Actions className="-mx-3">
            <Button className="text-white/80 hover:text-white/100" variant="tertiary" asChild>
                <Link href="/editor/getting-started/overview">
                    Integrate the editor
                    <ArrowRightIcon className="w-4 h-4" />
                </Link>
            </Button>
        </CtaBox.Actions>
    </CtaBox.Wrapper>

  <Section
    title="Browse by feature"
    description="Review our docs and examples to learn how to incorporate Tiptap into your tech stack."
  >
    <div className="grid sm:grid-cols-2 gap-5">
      <ProductCard
        title="Editor"
        description="Headless and framework-agnostic rich text editor based on ProseMirror."
        tags={["Open source"]}
        documentationUrl="/editor/getting-started/overview"
        secondaryUrl="/examples/basics/default-text-editor"
        icon={editorIcon.src}
      />
      <ProductCard
        title="Collaboration"
        description="Real-time document editing with offline-first support."
        tags={["Cloud", "On premises"]}
        documentationUrl="/collaboration/getting-started/overview"
        secondaryUrl="/collaboration/getting-started/install"
        icon={collabIcon.src}
      />
      <ProductCard
        title="Content AI"
        description="In-line content manipulation with your custom LLM or OpenAI."
        tags={["Cloud", "On premises"]}
        documentationUrl="/content-ai/getting-started/overview"
        secondaryUrl="/content-ai/capabilities/generation/overview#example"
        icon={contentAIIcon.src}
      />
      <ProductCard
        title="Comments"
        description="Integrate document and in-line comment functionality into your stack."
        tags={["Cloud", "On premises"]}
        documentationUrl="/comments/getting-started/overview"
        secondaryUrl="/comments/getting-started/overview#comments-example"
        icon={commentsIcon.src}
      />
      <ProductCard
        title="Documents"
        description="Manage and manipulate documents in your frontend or server-side."
        tags={["Cloud", "On premises"]}
        documentationUrl="/collaboration/documents"
        icon={documentsIcon.src}
      />
      <ProductCard
        title="Conversion"
        description="Import and export DOCX and other file types in your Editor or REST API"
        tags={["Cloud", "On premises"]}
        documentationUrl="/conversion/getting-started/overview"
        icon={conversionIcon.src}
      />
    </div>
  </Section>
  <Section
    title="Implement a template"
    description="Speed up your Tiptap integration into your React app with our UI template. You can deploy it as-is or customize it to meet your needs."
  >
    <ImageCard.Card>
      <ImageCard.Image src={contentTemplatesImage.src} alt="User interface templates for Tiptap" />
      <ImageCard.Content>
        <ImageCard.Title>Notion-like editor</ImageCard.Title>
        <ImageCard.Paragraph>Make content creation easier for your users with a clean interface and block-based editing tools.</ImageCard.Paragraph>
        <div className="flex items-center gap-2 mt-8">
            <Button asChild variant="secondary">
                <Link href="https://templates.tiptap.dev/">
                    Show demo
                    <ArrowRightIcon className="size-4" />
                </Link>
            </Button>
            <Button asChild variant="tertirary">
                <Link href="https://cloud.tiptap.dev/react-templates">
                    Get access
                    <ArrowRightIcon className="size-4" />
                </Link>
            </Button>
        </div>
      </ImageCard.Content>
    </ImageCard.Card>
  </Section>
  <Section
    title="Integrate or deploy Tiptap"
    description="Integrate Tiptap Cloud services into your environment or deploy our on-premises variant within your own infrastructure. Choose the solution that best fits your performance, management, and scalability requirements."
  >
    <Grid.Wrapper className="sm:grid-cols-2 lg:grid-cols-3">
      <Grid.Item>
        <Grid.ItemHeader>
          <CloudIcon className="w-6 h-6" />
        </Grid.ItemHeader>
        <Grid.ItemContent>
          <Grid.ItemTitle>Cloud</Grid.ItemTitle>
          <Grid.ItemParagraph>Integrate our cloud service tested everyday by hundreds of thousands of users.</Grid.ItemParagraph>
        </Grid.ItemContent>
      </Grid.Item>
      <Grid.Item>
        <Grid.ItemHeader>
          <DedicatedCloudIcon className="w-6 h-6" />
        </Grid.ItemHeader>
        <Grid.ItemContent>
          <Grid.ItemTitle>Dedicated Cloud</Grid.ItemTitle>
          <Grid.ItemParagraph>Access a dedicated server, optimized for handling larger projects and higher loads.</Grid.ItemParagraph>
        </Grid.ItemContent>
      </Grid.Item>
    <Grid.Item>
        <Grid.ItemHeader>
            <OnPremisesIcon className="w-6 h-6" />
        </Grid.ItemHeader>
        <Grid.ItemContent>
            <Grid.ItemTitle>On-Premises</Grid.ItemTitle>
            <Grid.ItemParagraph>Implement Tiptap Cloud using Docker Images on your own servers.</Grid.ItemParagraph>
        </Grid.ItemContent>
    </Grid.Item>
    </Grid.Wrapper>
    <CtaBox.Wrapper variant="light" className="mt-12">
      <CtaBox.Title>Create a free Tiptap account</CtaBox.Title>
      <CtaBox.Description>
        Integrate the Tiptap Editor and Collaboration with open source and pro extensions for free—no credit card required. Develop and perfect your application, then upgrade to access all features when you're ready to launch.
      </CtaBox.Description>
      <CtaBox.List>
        <CtaBox.ListItem title="Free sign up: ">No credit card required</CtaBox.ListItem>
        <CtaBox.ListItem title="Pro Extensions: ">Integrate all Pro Extensions.</CtaBox.ListItem>
        <CtaBox.ListItem title="Collaboration: ">Test all Collaboration features.</CtaBox.ListItem>
        <CtaBox.ListItem title="Unlimited dev time: ">Develop and test with no time constraints.</CtaBox.ListItem>
      </CtaBox.List>
      <CtaBox.Actions className="-mx-3">
        <Button variant="tertiary" asChild>
          <Link href="https://cloud.tiptap.dev/register">
            Sign up now
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </Button>
      </CtaBox.Actions>
    </CtaBox.Wrapper>
  </Section>
  <Section
    title="Manage your documents"
    description="The Tiptap Platform offers a suite of tools to maintain and manipulate documents on both the frontend and backend."
  >
    <Grid.Wrapper className="sm:grid-cols-2 lg:grid-cols-3">
      <Grid.Item>
        <Grid.ItemHeader>
          <DocumentManagementIcon className="size-6" />
        </Grid.ItemHeader>
        <Grid.ItemContent>
          <Grid.ItemTitle>Document management</Grid.ItemTitle>
          <Grid.ItemParagraph>Manage your documents with our API-first approach.</Grid.ItemParagraph>
        </Grid.ItemContent>
      </Grid.Item>
      <Grid.Item>
        <Grid.ItemHeader>
          <WebhookIcon className="size-6" />
        </Grid.ItemHeader>
        <Grid.ItemContent>
          <Grid.ItemTitle>Webhook management</Grid.ItemTitle>
          <Grid.ItemParagraph>Automate document changes and comments with the Tiptap Webhooks.</Grid.ItemParagraph>
        </Grid.ItemContent>
      </Grid.Item>
      <Grid.Item>
        <Grid.ItemHeader>
          <AuditLogsIcon className="size-6" />
        </Grid.ItemHeader>
        <Grid.ItemContent>
          <Grid.ItemTitle>Audit logs</Grid.ItemTitle>
          <Grid.ItemParagraph>Gain visibility and traceability with comprehensive logs.</Grid.ItemParagraph>
        </Grid.ItemContent>
      </Grid.Item>
    </Grid.Wrapper>
  </Section>
  <Section title="Examples" moreLink={{ label: 'Browse examples', url: '/docs/examples' }}>
    <CardGrid.Wrapper>
      <CardGrid.Item asChild>
        <Link href="/examples/basics/default-text-editor">
          <CardGrid.ItemImage asNextImage src={cardCoverDefaultEditor.src} width={cardCoverDefaultEditor.width} height={cardCoverDefaultEditor.height} alt="Image" />
          <div>
            <CardGrid.ItemTitle>Text editor</CardGrid.ItemTitle>
            <CardGrid.ItemParagraph>Develop a rich text editor using Tiptap with minimal code.</CardGrid.ItemParagraph>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
      <CardGrid.Item asChild>
        <Link href="/examples/advanced/collaborative-editing">
          <CardGrid.ItemImage asNextImage src={cardCoverCollaborativeEditing.src} width={cardCoverCollaborativeEditing.width} height={cardCoverCollaborativeEditing.height} alt="Image" />
          <div>
            <CardGrid.ItemTitle>Collaborative editing</CardGrid.ItemTitle>
            <CardGrid.ItemParagraph>Build a text editor featuring multi-user collaboration.</CardGrid.ItemParagraph>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
            <Tag>Collaboration</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </CardGrid.Wrapper>
  </Section>
  <Section title="Guides" moreLink={{ label: 'Browse guides', url: '/docs/guides' }}>
    <CardGrid.Wrapper>
      <CardGrid.Item asChild>
          <Link href="/editor/getting-started/configure">
          <CardGrid.Subtitle size="sm">First Steps</CardGrid.Subtitle>
          <div>
            <CardGrid.ItemTitle>How to set up and configure the Tiptap editor?</CardGrid.ItemTitle>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
      <CardGrid.Item asChild>
          <Link href="/guides/pro-extensions">
          <CardGrid.Subtitle size="sm">First Steps</CardGrid.Subtitle>
          <div>
            <CardGrid.ItemTitle>How to integrate Pro Extensions?</CardGrid.ItemTitle>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
            <Tag>Collaboration</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
      <CardGrid.Item asChild>
          <Link href="/collaboration/getting-started/install">
          <CardGrid.Subtitle size="sm">First Steps</CardGrid.Subtitle>
          <div>
              <CardGrid.ItemTitle>How to make your Editor collaborative?</CardGrid.ItemTitle>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
            <Tag>Collaboration</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
      <CardGrid.Item asChild>
          <Link href="/editor/getting-started/style-editor">
            <CardGrid.Subtitle size="sm">Styling</CardGrid.Subtitle>
          <div>
              <CardGrid.ItemTitle>How to apply styling to the headless Tiptap Editor</CardGrid.ItemTitle>
          </div>
          <CardGrid.ItemFooter>
            <Tag>Editor</Tag>
          </CardGrid.ItemFooter>
        </Link>
      </CardGrid.Item>
    </CardGrid.Wrapper>
  </Section>
  <Section title="Community">
    <Grid.Wrapper className="sm:grid-cols-2 lg:grid-cols-3">
      <Grid.Item asChild>
        <Link href="https://x.com/tiptap_editor" target="_blank" rel="nofollow noreferrer">
          <Grid.ItemHeader>
            <XIcon className="w-6 h-6" />
          </Grid.ItemHeader>
          <Grid.ItemContent>
            <Grid.ItemTitle><span className="line-through">Twitter</span> X</Grid.ItemTitle>
            <Grid.ItemParagraph>Follow us on X for the latest news and updates.</Grid.ItemParagraph>
          </Grid.ItemContent>
          <div className="mt-4">
            <Button className="inline-block" size="small" variant="secondary">
              <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </div>
        </Link>
      </Grid.Item>
      <Grid.Item asChild>
        <Link href="https://tiptap.dev/discord" target="_blank" rel="nofollow noreferrer">
          <Grid.ItemHeader>
            <DiscordIcon className="size-6" />
          </Grid.ItemHeader>
          <Grid.ItemContent>
            <Grid.ItemTitle>Discord</Grid.ItemTitle>
            <Grid.ItemParagraph>Connect with the Tiptap community.</Grid.ItemParagraph>
          </Grid.ItemContent>
          <div className="mt-4">
            <Button className="inline-block" size="small" variant="secondary">
              <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </div>
        </Link>
      </Grid.Item>
      <Grid.Item asChild>
        <Link href="https://github.com/ueberdosis/tiptap" target="_blank" rel="nofollow noreferrer">
          <Grid.ItemHeader>
            <GithubIcon className="w-6 h-6" />
          </Grid.ItemHeader>
          <Grid.ItemContent>
            <Grid.ItemTitle>GitHub</Grid.ItemTitle>
            <Grid.ItemParagraph>Follow progress and contribute to the codebase.</Grid.ItemParagraph>
          </Grid.ItemContent>
          <div className="mt-4">
            <Button className="inline-block" size="small" variant="secondary">
              <ArrowRightIcon className="w-4 h-4" />
            </Button>
          </div>
        </Link>
      </Grid.Item>
    </Grid.Wrapper>
  </Section>
</div>

```

# resources\changelog.mdx

```mdx
---
title: Editor Changelog
meta:
  title: Changelog | Tiptap Editor Docs
  description: A guide on tracking changes in Tiptap Editor with information on how and where to follow updates for this multi-package system.
  category: Editor
---

Tiptap consists of more than 50 separate packages. Here is everything you need to follow changes:

1. Check [GitHub releases page](https://github.com/ueberdosis/tiptap/releases) to get the best overview.
2. For even more details, head over to [Tiptaps CHANGELOG on GitHub](https://github.com/ueberdosis/tiptap/blob/main/CHANGELOG.md).
3. In addition, all packages have [a separate `CHANGELOG.md`](https://github.com/ueberdosis/tiptap/blob/main/packages), too.
4. It’s also helpful to keep an eye on the [merged Pull Requests on GitHub](https://github.com/ueberdosis/tiptap/pulls?q=is%3Apr+is%3Aclosed).

[We’ll write blog posts](https://tiptap.dev/blog) about bigger changes and keep them in a changelog here.

```

# resources\contributing.mdx

```mdx
---
title: Contributing to Tiptap
meta:
  title: Contributing | Tiptap
  description: Step-by-step guide for those interested in contributing to Tiptap, from setting up your development environment to tips for successful pull requests and creating your own extensions.
  category: Editor
---

Tiptap would be nothing without its lively community. Contributions have always been and will always be welcome. Here is a little bit you should know, before you send your contribution:

## Welcome examples

- Failing regression tests as bug reports
- Documentation improvements, e. g. fix a typo, add a section
- New features for existing extensions, e. g. a new configureable option
- Well explained, non-breaking changes to the core

## Won’t merge

- New extensions, which we then need to support and maintain

## Submit ideas

Make sure to open an issue and outline your idea first. We’ll get back to you quickly and let you know if there is a chance we can merge your contribution.

## Set up the development environment

It’s not too hard to tinker around with the official repository. You’ll need [Git](https://github.com/git-guides/install-git), [Node and NPM](https://nodejs.org/en/download/) installed. Here is what you need to do then:

1. Copy the code to your local machine: `$ git clone git@github.com:ueberdosis/tiptap.git`
2. Install dependencies: `$ npm install`
3. Start the development environment: `$ npm run start`
4. Open http://localhost:3000 in your favorite browser.
5. Start playing around!

## Our code style

There is an eslint config that ensures a consistent code style. To check for errors, run `$ npm run lint`. That’ll be checked when you send a pull request, too. Make sure it’s passing, before sending a pull request.

## Test for errors

Your pull request will automatically execute all our existing tests. Make sure that they all pass, before sending a pull request. Run all tests locally with `$ npm run test` or run single tests (e. g. when writing new ones) with `$ npm run test:open`.

## Create your own extensions

If you want to create and maintain your own extensions, you can use your `create-tiptap-extension` CLI tool. It will create a new extension boilerplate with all necessary files and the build process. It's as easy as running

\`\`\`bash
npm init tiptap-extension
\`\`\`

If you want to let us know about your extension you can give us a hint on [X](https://x.com/tiptap_editor) or [Discord](https://tiptap.dev/discord).

## Document your contributions

When contributing to Tiptap, it's important to understand that Tiptap's codebase and its documentation are managed in two separate repositories. If you make changes or enhancements to Tiptap, documenting these changes is of course important for clarity and usability by others. Ensure you update the documentation repository corresponding to any alterations you make in the code.

1. Tiptap Repository: [Tiptap Code Repository](https://github.com/ueberdosis/tiptap) - Modify the code here.
2. Documentation Repository: [Tiptap Documentation Repository](https://github.com/ueberdosis/tiptap-docs) - Update or add documentation here to reflect changes made in the Tiptap repository.

In your PR to the Tiptap code repository, include a reference to the corresponding updates you've made in the Documentation repository. Alternatively, when submitting a PR to the Documentation repository, make sure to include references to any associated code changes in the Tiptap repository if they are relevant to the documentation updates.

## Further questions

Any further questions? Create a new issue or discussion in the repository. We’ll get back to you.

```

# resources\pro-license.mdx

```mdx
---
title: Pro License
---

Tiptap GmbH grants you an ongoing, non-exclusive license to use the Tiptap Pro extensions, as long as you are an active subscriber of Tiptap Pro.

If you have subscribed to the Free Plan, the license grants permission for **one individual** (the Licensee) to access and use the Tiptap Pro extensions.

If you have purchased the Entry Plan, the license grants permission for **up to 2 Employees and Contractors of the Licensee** to access and use the Tiptap Pro extensions.

If you have purchased the Business Plan, the license grants permission for **up to 8 Employees and Contractors of the Licensee** to access and use the Tiptap Pro extensions.

You **can**:

+ Use the Tiptap Pro extensions to create unlimited End Products.
+ Use the Tiptap Pro extensions to create unlimited End Products for unlimited Clients.
+ Use the Tiptap Pro extensions to create End Products where the End Product is sold to End Users.
+ Use the Tiptap Pro extensions to create End Products that are open source and freely available to End Users.

You **cannot**:

- Use the Tiptap Pro extensions to create End Products that are developed to allow an End User to build their own End Products using the Tiptap Pro extensions or derivatives of the Tiptap Pro extensions.
- Modify the Tiptap Pro extensions to create derivative Tiptap extensions.
- Re-distribute the Tiptap Pro extensions or derivatives of the Tiptap Pro extensions separately from an End Product.
- Share your account or access to the Tiptap Pro extensions with any other individuals, if you have subscribed to the Free Plan.
- Use the Tiptap Pro extensions to create End Products that are the property of any individual or entity other than the Licensee or Clients of the Licensee.
- Use the Tiptap Pro extensions to produce anything that, in the sole and absolute discretion of Tiptap GmbH, may be considered competitive or collusive with Tiptap GmbH's business.

## Example usage
Examples of usage **allowed** by the license:

+ Creating a personal website or web application by yourself.
+ Creating a website or web application for a client that will be owned by that client.
+ Creating a commercial SaaS application (like an invoicing app for example) where end users have to pay a fee to use the application.
+ Creating a commercial self-hosted web application that is sold to end users for a one-time fee.
+ Creating a web application whose main purpose is clearly not to share the Tiptap Pro extensions (such as a conference organization application that uses the Tiptap Pro extensions for its editor) that is free and open source and whose source code is publicly available.

Examples of use **not permitted** by the license:

- Creating a repository of your favorite Tiptap Pro extensions (or derivatives based on Tiptap Pro extensions) and publishing it publicly.
- Rebuilding Tiptap Pro extensions in other programming languages or program libraries and making it available either for sale or for free.
- Creating an "editor builder" project where end users can build their own editors using Tiptap Pro extensions included with or derived from Tiptap Pro extensions.
- Creating any End Product that is not the sole property of either you, your company or a client of your company. For example your employees/contractors can't use your company’s Tiptap Pro license to build their own websites or side projects.

## Free (Single Developer) Definitions
The Licensee is the individual who has subscribed to the Free Plan.

Tiptap Pro extensions are the source code that is made available to the Licensee after subscribing to the Free Plan.

An End Product is any artifact produced that incorporates the Tiptap Pro extensions or derivatives of the Tiptap Pro extensions.

An End User is a user of an End Product.

A Client is an individual or entity receiving custom professional services directly from the Licensee, produced specifically for that individual or entity. Customers of software as a service products are not considered clients for the purpose of this document.

## Entry or Business License Definitions
The Licensee is the business entity who has purchased an Entry or Business License.

Tiptap Pro extensions are the source code that is made available to the Licensee after purchasing an Entry or Business license.

An End Product is any artifact produced that incorporates the Tiptap Pro extensions or derivatives of the Tiptap Pro extensions.

End User is a user of an End Product.

An Employee is a full-time or part-time employee of the Licensee.

A Contractor is an individual or business entity contracted to perform services for the Licensee.

A Client is an individual or entity receiving custom professional services directly from the Licensee, produced specifically for that individual or entity. Customers of software as a service products are not considered clients for the purpose of this document.

## Enforcement
If you are found to be in violation of the license, access to your Tiptap account will be terminated, and a refund may be issued at our discretion. When license violation is blatant and malicious (such as intentionally redistributing the Tiptap Pro extensions through private warez channels), no refund will be issued.

The copyright of the Tiptap Pro extensions is owned by Tiptap GmbH. You are granted only the permissions described in this license; all other rights are reserved. Tiptap GmbH reserves the right to take legal action against any unauthorized use of the Tiptap Pro extensions outside of this license. In particular, Tiptap GmbH reserves the right to terminate your license without notice if you fail to comply with any term or condition of this License Agreement. Upon termination of this License Agreement, you must destroy the original and all copies of the Tiptap Pro extensions and related documentation.

## Liability
Tiptap GmbH’s liability to you for costs, damages, or other losses arising from your use of the Tiptap Pro extensions — including third-party claims against you — is limited to the amount paid by the Licensee in the 12 months prior to the occurrence of the damage event. Tiptap GmbH may not be held liable for any consequential damages, incidental or special damages, including any damages for loss of profits or savings related to your use of the Tiptap Pro extensions. Tiptap GmbH shall have unlimited liability for damage arising from gross negligence or wilful intent and in the event of injury to life, body or health.

The liability of Tiptap GmbH irrespective of fault in accordance with Section 536a(1), 1st alternative German Civil Code for defects that already existed at the time of granting this license is excluded.

## Final Provisions
This agreement is governed by the laws of the Federal Republic of Germany, excluding the conflict of laws provisions and excluding the United Nations Convention on Contracts for the International Sale of Goods (CISG). The place of jurisdiction for all disputes arising from this contractual relationship, as far as legally permitted, is Berlin.

## Questions?
Unsure if your use case is covered by our license? Email us at humans@tiptap.dev!
```

# resources\sidebar.ts

```ts
import { SidebarConfig } from '@/types'

export const sidebarConfig: SidebarConfig = {
  id: 'all-docs',
  rootHref: '/',
  title: 'Home',
  items: [
    {
      type: 'group',
      title: 'Getting started',
      href: '/getting-started',
      children: [
        {
          href: '/',
          title: 'Overview',
        },
      ],
    },
    {
      type: 'group',
      title: 'Browse by feature',
      href: '/suite-docs',
      children: [
        {
          href: '/editor/getting-started/overview',
          title: 'Editor',
        },
        {
          href: '/collaboration/getting-started/overview',
          title: 'Collaboration',
        },
        {
          href: '/content-ai/getting-started/overview',
          title: 'Content AI',
        },
        {
          href: '/comments/getting-started/overview',
          title: 'Comments',
        },
        {
          href: '/collaboration/documents',
          title: 'Documents',
        },
      ],
    },
    {
      type: 'group',
      title: 'Resources',
      href: '/resources',
      children: [
        {
          href: '/guides',
          title: 'Guides',
        },
        {
          href: '/examples',
          title: 'Examples',
        },
        {
          href: '/resources/contributing',
          title: 'Contributing',
        },
        {
          href: '/resources/changelog',
          title: 'Editor changelog',
        },
        {
          href: '/resources/pro-license',
          title: 'Pro license',
        },
      ],
    },
  ],
}

```

# sidebar.ts

```ts
import { SidebarConfig } from '@/types'

export const sidebarConfig: SidebarConfig = {
  id: 'all-docs',
  rootHref: '/',
  title: 'Home',
  items: [
    {
      type: 'group',
      title: 'Getting started',
      href: '/getting-started',
      children: [
        {
          href: '/',
          title: 'Overview',
        },
      ],
    },
    {
      type: 'group',
      title: 'Browse by feature',
      href: '/suite-docs',
      children: [
        {
          href: '/editor/getting-started/overview',
          title: 'Editor',
        },
        {
          href: '/collaboration/getting-started/overview',
          title: 'Collaboration',
        },
        {
          href: '/comments/getting-started/overview',
          title: 'Comments',
        },
        {
          href: '/content-ai/getting-started/overview',
          title: 'Content AI',
        },
        {
          href: '/collaboration/documents/history',
          title: 'History',
        },
        {
          href: '/conversion/getting-started/overview',
          title: 'Conversion',
        },
        {
          href: '/collaboration/documents/semantic-search',
          title: 'Semantic Search',
        },
      ],
    },
    {
      type: 'group',
      title: 'Resources',
      href: '/resources',
      children: [
        {
          href: '/guides',
          title: 'Guides',
        },
        {
          href: '/examples',
          title: 'Examples',
        },
        {
          href: '/resources/contributing',
          title: 'Contributing',
        },
        {
          href: '/resources/changelog',
          title: 'Editor changelog',
        },
        {
          href: '/resources/pro-license',
          title: 'Pro license',
        },
      ],
    },
  ],
}

```

# templates\index.mdx

```mdx
# Hello world to this new templates docs.

```

