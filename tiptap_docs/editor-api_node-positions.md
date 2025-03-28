---
title: Node Positions | Tiptap Editor Docs
source_url: https://tiptap.dev/docs/editor/api/node-positions#lastchild
ogDescription: Learn about Node Positions in Tiptap for document navigation and manipulation. Learn more in the docs!
og:locale: en_US
robots: index, follow
og:image: https://tiptap.dev/docs/api/og?title=Node%20Positions&category=Editor
ogTitle: Node Positions | Tiptap Editor Docs
viewport: width=device-width, initial-scale=1
og:description: Learn about Node Positions in Tiptap for document navigation and manipulation. Learn more in the docs!
twitter:card: summary_large_image
twitter:image: https://tiptap.dev/docs/api/og?title=Node%20Positions&category=Editor
ogImage: https://tiptap.dev/docs/api/og?title=Node%20Positions&category=Editor
twitter:description: Learn about Node Positions in Tiptap for document navigation and manipulation. Learn more in the docs!
docsearch:version: 2.x
description: Learn about Node Positions in Tiptap for document navigation and manipulation. Learn more in the docs!
language: en
og:type: website
favicon: https://tiptap.dev/docs/favicon.png
ogLocale: en_US
og:image:width: 1200
og:image:height: 630
og:url: https://tiptap.dev/docs/editor/api/node-positions
twitter:title: Node Positions | Tiptap Editor Docs
og:title: Node Positions | Tiptap Editor Docs
ogUrl: https://tiptap.dev/docs/editor/api/node-positions
scrapeId: 5fc8ed61-f33e-4ff7-9e6d-290aa2410df9
sourceURL: https://tiptap.dev/docs/editor/api/node-positions#lastchild
url: https://tiptap.dev/docs/editor/api/node-positions#lastchild
statusCode: 200
---

Node Positions (`NodePos`) describe the specific position of a node, its children, and its parent, providing easy navigation between them. Node Positions are heavily inspired by the DOM and are based on ProseMirror's [ResolvedPos](https://prosemirror.net/docs/ref/#model.ResolvedPos)
 implementation.

[](https://tiptap.dev/docs/editor/api/node-positions#use-node-positions)
Use Node Positions
-------------------------------------------------------------------------------------------

The easiest way to create a new Node Position is by using the helper functions in the Editor instance. This way you always use the correct editor instance and have direct access to the API.

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
    

You can also create your own NodePos instances:

    // You need to have an editor instance
    // and a position you want to map to
    const myNodePos = new NodePos(100, editor)
    

[](https://tiptap.dev/docs/editor/api/node-positions#what-can-i-do-with-a-nodepos)
What can I do with a NodePos?
----------------------------------------------------------------------------------------------------------------

`NodePos` lets you traverse the document similarly to the document DOM in your browser. You can access parent nodes, child nodes, and sibling nodes.

**Example:** Get and update the content of a `codeBlock` node

    // get the first codeBlock from your document
    const $codeBlock = editor.$node('codeBlock')
    
    // get the previous NodePos of your codeBlock node
    const $previousItem = $codeBlock.before
    
    // easily update the content
    $previousItem.content = '<p>Updated content</p>'
    

If you are familiar with the DOM, this example will look familiar:

**Example:** Select list items and insert a new item in a bullet list

    // get a bullet list from your doc
    const $bulletList = editor.$node('bulletList')
    
    // get all listItems from your bulletList
    const $listItems = $bulletList.querySelectorAll('listItem')
    
    // get the last listItem
    const $lastListItem = $listItems[0]
    
    // insert a new listItem after the last one
    editor.commands.insertContentAt($lastListItem.after, '<li>New item</li>')
    

[](https://tiptap.dev/docs/editor/api/node-positions#api)
API
-------------------------------------------------------------

### [](https://tiptap.dev/docs/editor/api/node-positions#nodepos)
NodePos

The NodePos class is the main class you will work with. It describes a specific position of a node, its children, its parent and easy ways to navigate between them. They are heavily inspired by the DOM and are based on ProseMirror's [ResolvedPos](https://prosemirror.net/docs/ref/#model.ResolvedPos)
 implementation.

#### [](https://tiptap.dev/docs/editor/api/node-positions#methods)
Methods

| Method | Arguments | Returns | Description |
| --- | --- | --- | --- |
| `constructor` | `pos` (number), `editor` (object) | `NodePos` | Creates a new `NodePos` instance at the given position (`pos`) within the specified `editor` instance |
| `closest` | `nodeType` (string) | `NodePos` or `null` | Finds the closest matching `NodePos` going up the document structure. Returns `null` if no match is found |
| `querySelector` | `nodeType` (string), `attributes` (object) | `NodePos` or `null` | Finds the first matching `NodePos` going down the document structure. Can be filtered by attributes |
| `querySelectorAll` | `nodeType` (string), `attributes` (object) | `Array<NodePos>` | Finds all matching `NodePos` instances going down the document structure. Can be filtered by attributes |
| `setAttribute` | `attributes` (object) | `NodePos` | Sets the specified attributes on the current `NodePos` |

##### [](https://tiptap.dev/docs/editor/api/node-positions#constructor)
constructor

**Arguments**

*   `pos` – The position you want to map to
*   `editor` – The editor instance you want to use

**Returns** `NodePos`

    const myNodePos = new NodePos(100, editor)
    

##### [](https://tiptap.dev/docs/editor/api/node-positions#closest)
closest

The closest NodePos instance of your NodePosition going up the depth. If there is no matching NodePos, it will return `null`.

**Returns** `NodePos | null`

    const closest = myNodePos.closest('bulletList')
    

##### [](https://tiptap.dev/docs/editor/api/node-positions#queryselector)
querySelector

The first matching NodePos instance of your NodePosition going down the depth. If there is no matching NodePos, it will return `null`.

You can also filter by attributes via the second attribute.

**Returns** `NodePos | null`

    const firstHeading = myNodePos.querySelector('heading')
    const firstH1 = myNodePos.querySelector('heading', { level: 1 })
    

##### [](https://tiptap.dev/docs/editor/api/node-positions#queryselectorall)
querySelectorAll

All matching NodePos instances of your NodePosition going down the depth. If there is no matching NodePos, it will return an empty array.

You can also filter by attributes via the second attribute.

**Returns** `Array<NodePos>`

    const headings = myNodePos.querySelectorAll('heading')
    const h1s = myNodePos.querySelectorAll('heading', { level: 1 })
    

##### [](https://tiptap.dev/docs/editor/api/node-positions#setattribute)
setAttribute

Set attributes on the current NodePos.

**Returns** `NodePos`

    myNodePos.setAttribute({ level: 1 })
    

#### [](https://tiptap.dev/docs/editor/api/node-positions#properties)
Properties

| Property | Type | Description |
| --- | --- | --- |
| `node` | `Node` (ProseMirror Node) | The ProseMirror node at the current `NodePos` |
| `parent` | `NodePos` | The parent node of the current `NodePos` |
| `children` | `Array<NodePos>` | The child nodes of the current `NodePos` |
| `firstChild` | `NodePos` or `null` | The first child node of the current `NodePos`, or `null` if none exists |
| `lastChild` | `NodePos` or `null` | The last child node of the current `NodePos`, or `null` if none exists |
| `pos` | `number` | The position of the node in the document |
| `from` | `number` | The starting position of the node |
| `to` | `number` | The ending position of the node |
| `range` | `number` | The range (from–to) of the node at the current `NodePos` |
| `content` | `string` | The content of the node at the current `NodePos`. You can set this to update the node's content |
| `attributes` | `Object` | The attributes of the node at the current `NodePos` |
| `textContent` | `string` | The text content of the node at the current `NodePos` |
| `depth` | `number` | The depth (level) of the node in the document structure |
| `size` | `number` | The size of the node at the current `NodePos` |
| `before` | `NodePos` or `null` | The previous node before the current `NodePos`, or `null` if none exists |
| `after` | `NodePos` or `null` | The next node after the current `NodePos`, or `null` if none exists |

##### [](https://tiptap.dev/docs/editor/api/node-positions#node)
node

The ProseMirror Node at the current Node Position.

**Returns** `Node`

    const node = myNodePos.node
    node.type.name // 'paragraph'
    

##### [](https://tiptap.dev/docs/editor/api/node-positions#element)
element

The DOM element at the current Node Position.

**Returns** `Element`

    const element = myNodePos.element
    element.tagName // 'P'
    

##### [](https://tiptap.dev/docs/editor/api/node-positions#content)
content

The content of your NodePosition. You can set this to a new value to update the content of the node.

**Returns** `string`

    const content = myNodePos.content
    myNodePos.content = '<p>Updated content</p>'
    

##### [](https://tiptap.dev/docs/editor/api/node-positions#attributes)
attributes

The attributes of your NodePosition.

**Returns** `Object`

    const attributes = myNodePos.attributes
    attributes.level // 1
    

##### [](https://tiptap.dev/docs/editor/api/node-positions#textcontent)
textContent

The text content of your NodePosition.

**Returns** `string`

    const textContent = myNodePos.textContent
    

##### [](https://tiptap.dev/docs/editor/api/node-positions#depth)
depth

The depth of your NodePosition.

**Returns** `number`

    const depth = myNodePos.depth
    

##### [](https://tiptap.dev/docs/editor/api/node-positions#pos)
pos

The position of your NodePosition.

**Returns** `number`

    const pos = myNodePos.pos
    

##### [](https://tiptap.dev/docs/editor/api/node-positions#size)
size

The size of your NodePosition.

**Returns** `number`

    const size = myNodePos.size
    

##### [](https://tiptap.dev/docs/editor/api/node-positions#from)
from

The from position of your NodePosition.

**Returns** `number`

    const from = myNodePos.from
    

##### [](https://tiptap.dev/docs/editor/api/node-positions#to)
to

The to position of your NodePosition.

**Returns** `number`

    const to = myNodePos.to
    

##### [](https://tiptap.dev/docs/editor/api/node-positions#range)
range

The range of your NodePosition.

**Returns** `number`

    const range = myNodePos.range
    

##### [](https://tiptap.dev/docs/editor/api/node-positions#parent)
parent

The parent NodePos of your NodePosition.

**Returns** `NodePos`

    const parent = myNodePos.parent
    

##### [](https://tiptap.dev/docs/editor/api/node-positions#before)
before

The NodePos before your NodePosition. If there is no NodePos before, it will return `null`.

**Returns** `NodePos | null`

    const before = myNodePos.before
    

##### [](https://tiptap.dev/docs/editor/api/node-positions#after)
after

The NodePos after your NodePosition. If there is no NodePos after, it will return `null`.

**Returns** `NodePos | null`

    const after = myNodePos.after
    

##### [](https://tiptap.dev/docs/editor/api/node-positions#children)
children

The child NodePos instances of your NodePosition.

**Returns** `Array<NodePos>`

    const children = myNodePos.children
    

##### [](https://tiptap.dev/docs/editor/api/node-positions#firstchild)
firstChild

The first child NodePos instance of your NodePosition. If there is no child, it will return `null`.

**Returns** `NodePos | null`

    const firstChild = myNodePos.firstChild
    

##### [](https://tiptap.dev/docs/editor/api/node-positions#lastchild)
lastChild

The last child NodePos instance of your NodePosition. If there is no child, it will return `null`.

**Returns** `NodePos | null`

    const lastChild = myNodePos.lastChild