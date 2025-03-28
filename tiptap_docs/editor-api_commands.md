---
title: Commands | Tiptap Editor Docs
source_url: https://tiptap.dev/docs/editor/api/commands#write-your-own-commands
og:type: website
twitter:card: summary_large_image
ogDescription: Learn about command execution and chaining in Tiptap. Discover how to extend functionalities in the Editor command docs.
twitter:description: Learn about command execution and chaining in Tiptap. Discover how to extend functionalities in the Editor command docs.
og:url: https://tiptap.dev/docs/editor/api/commands
twitter:title: Commands | Tiptap Editor Docs
ogLocale: en_US
og:title: Commands | Tiptap Editor Docs
og:description: Learn about command execution and chaining in Tiptap. Discover how to extend functionalities in the Editor command docs.
language: en
viewport: width=device-width, initial-scale=1
favicon: https://tiptap.dev/docs/favicon.png
og:image:width: 1200
ogUrl: https://tiptap.dev/docs/editor/api/commands
og:image:height: 630
twitter:image: https://tiptap.dev/docs/api/og?title=Editor%20commands&category=Editor
description: Learn about command execution and chaining in Tiptap. Discover how to extend functionalities in the Editor command docs.
ogImage: https://tiptap.dev/docs/api/og?title=Editor%20commands&category=Editor
robots: index, follow
og:locale: en_US
docsearch:version: 2.x
og:image: https://tiptap.dev/docs/api/og?title=Editor%20commands&category=Editor
ogTitle: Commands | Tiptap Editor Docs
scrapeId: 0182d120-76a7-4544-b569-48fe77a29ee8
sourceURL: https://tiptap.dev/docs/editor/api/commands#write-your-own-commands
url: https://tiptap.dev/docs/editor/api/commands#write-your-own-commands
statusCode: 200
---

The editor provides a ton of commands to programmatically add or change content or alter the selection. If you want to build your own editor you definitely want to learn more about them.

[](https://tiptap.dev/docs/editor/api/commands#execute-a-command)
Execute a command
-----------------------------------------------------------------------------------

All available commands are accessible through an editor instance. Let’s say you want to make text bold when a user clicks on a button. That’s how that would look like:

    editor.commands.setBold()
    

While that’s perfectly fine and does make the selected bold, you’d likely want to chain multiple commands in one run. Let’s have a look at how that works.

### [](https://tiptap.dev/docs/editor/api/commands#chain-commands)
Chain commands

Most commands can be combined to one call. That’s shorter than separate function calls in most cases. Here is an example to make the selected text bold:

    editor.chain().focus().toggleBold().run()
    

The `.chain()` is required to start a new chain and the `.run()` is needed to actually execute all the commands in between.

In the example above two different commands are executed at once. When a user clicks on a button outside of the content, the editor isn’t in focus anymore. That’s why you probably want to add a `.focus()` call to most of your commands. It brings back the focus to the editor, so the user can continue to type.

All chained commands are kind of queued up. They are combined to one single transaction. That means, the content is only updated once, also the `update` event is only triggered once.

### Transaction mapping

By default Prosemirror **does not support chaining** which means that you need to update the positions between chained commands via [**Transaction mapping**](https://prosemirror.net/docs/ref/#transform.Mapping)
.

For example you want to chain a **delete** and **insert** command in one chain, you need to keep track of the position inside your chain commands. Here is an example:

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
    

Now you can do the following without `insert` inserting the content into the wrong position:

    editor.chain().delete().insert('foo').run()
    

#### [](https://tiptap.dev/docs/editor/api/commands#chain-inside-custom-commands)
Chain inside custom commands

When chaining a command, the transaction is held back. If you want to chain commands inside your custom commands, you’ll need to use said transaction and add to it. Here is how you would do that:

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
    

### [](https://tiptap.dev/docs/editor/api/commands#inline-commands)
Inline commands

In some cases, it’s helpful to put some more logic in a command. That’s why you can execute commands in commands. I know, that sounds crazy, but let’s look at an example:

    editor
      .chain()
      .focus()
      .command(({ tr }) => {
        // manipulate the transaction
        tr.insertText('hey, that’s cool!')
    
        return true
      })
      .run()
    

### [](https://tiptap.dev/docs/editor/api/commands#dry-run-commands)
Dry run commands

Sometimes, you don’t want to actually run the commands, but only know if it would be possible to run commands, for example to show or hide buttons in a menu. That’s what we added `.can()` for. Everything coming after this method will be executed, without applying the changes to the document:

    editor.can().toggleBold()
    

And you can use it together with `.chain()`, too. Here is an example which checks if it’s possible to apply all the commands:

    editor.can().chain().toggleBold().toggleItalic().run()
    

Both calls would return `true` if it’s possible to apply the commands, and `false` in case it’s not.

In order to make that work with your custom commands, don’t forget to return `true` or `false`.

For some of your own commands, you probably want to work with the raw [transaction](https://tiptap.dev/docs/editor/core-concepts/introduction)
. To make them work with `.can()` you should check if the transaction should be dispatched. Here is how you can create a simple `.insertText()` command:

    export default (value) =>
      ({ tr, dispatch }) => {
        if (dispatch) {
          tr.insertText(value)
        }
    
        return true
      }
    

If you’re just wrapping another Tiptap command, you don’t need to check that, we’ll do it for you.

    addCommands() {
      return {
        bold: () => ({ commands }) => {
          return commands.toggleMark('bold')
        },
      }
    }
    

If you’re just wrapping a plain ProseMirror command, you’ll need to pass `dispatch` anyway. Then there’s also no need to check it:

    import { exitCode } from '@tiptap/pm/commands'
    
    export default () =>
      ({ state, dispatch }) => {
        return exitCode(state, dispatch)
      }
    

### [](https://tiptap.dev/docs/editor/api/commands#try-commands)
Try commands

If you want to run a list of commands, but want only the first successful command to be applied, you can do this with the `.first()` method. This method runs one command after the other and stops at the first which returns `true`.

For example, the backspace key tries to undo an input rule first. If that was successful, it stops there. If no input rule has been applied and thus can’t be reverted, it runs the next command and deletes the selection, if there is one. Here is the simplified example:

    editor.commands.first(({ commands }) => [\
      () => commands.undoInputRule(),\
      () => commands.deleteSelection(),\
      // …\
    ])
    

Inside of commands you can do the same thing:

    export default () =>
      ({ commands }) => {
        return commands.first([\
          () => commands.undoInputRule(),\
          () => commands.deleteSelection(),\
          // …\
        ])
      }
    

[](https://tiptap.dev/docs/editor/api/commands#list-of-commands)
List of commands
---------------------------------------------------------------------------------

Have a look at all of the core commands listed below. They should give you a good first impression of what’s possible.

### [](https://tiptap.dev/docs/editor/api/commands#content)
Content

| Command | Description |
| --- | --- |
| `clearContent()` | Clear the whole document. |
| `insertContent()` | Insert a node or an HTML string at the current position. |
| `insertContentAt()` | Insert a node or an HTML string at a specific position. |
| `setContent()` | Replace the whole document with new content. |

### [](https://tiptap.dev/docs/editor/api/commands#nodes-and-marks)
Nodes & Marks

| Command | Description |
| --- | --- |
| `clearNodes()` | Normalize nodes to a simple paragraph. |
| `createParagraphNear()` | Create a paragraph nearby. |
| `deleteNode()` | Delete a node. |
| `extendMarkRange()` | Extends the text selection to the current mark. |
| `exitCode()` | Exit from a code block. |
| `joinBackward()` | Join two nodes backward. |
| `joinForward()` | Join two nodes forward. |
| `lift()` | Removes an existing wrap. |
| `liftEmptyBlock()` | Lift block if empty. |
| `newlineInCode()` | Add a newline character in code. |
| `resetAttributes()` | Resets some node or mark attributes to the default value. |
| `setMark()` | Add a mark with new attributes. |
| `setNode()` | Replace a given range with a node. |
| `splitBlock()` | Forks a new node from an existing node. |
| `toggleMark()` | Toggle a mark on and off. |
| `toggleNode()` | Toggle a node with another node. |
| `toggleWrap()` | Wraps nodes in another node, or removes an existing wrap. |
| `undoInputRule()` | Undo an input rule. |
| `unsetAllMarks()` | Remove all marks in the current selection. |
| `unsetMark()` | Remove a mark in the current selection. |
| `updateAttributes()` | Update attributes of a node or mark. |

### [](https://tiptap.dev/docs/editor/api/commands#lists)
Lists

| Command | Description |
| --- | --- |
| `liftListItem()` | Lift the list item into a wrapping list. |
| `sinkListItem()` | Sink the list item down into an inner list. |
| `splitListItem()` | Splits one list item into two list items. |
| `toggleList()` | Toggle between different list types. |
| `wrapInList()` | Wrap a node in a list. |

### [](https://tiptap.dev/docs/editor/api/commands#selection)
Selection

| Command | Description |
| --- | --- |
| `blur()` | Removes focus from the editor. |
| `deleteRange()` | Delete a given range. |
| `deleteSelection()` | Delete the selection, if there is one. |
| `enter()` | Trigger enter. |
| `focus()` | Focus the editor at the given position. |
| `keyboardShortcut()` | Trigger a keyboard shortcut. |
| `scrollIntoView()` | Scroll the selection into view. |
| `selectAll()` | Select the whole document. |
| `selectNodeBackward()` | Select a node backward. |
| `selectNodeForward()` | Select a node forward. |
| `selectParentNode()` | Select the parent node. |
| `setNodeSelection()` | Creates a NodeSelection. |
| `setTextSelection()` | Creates a TextSelection. |

[](https://tiptap.dev/docs/editor/api/commands#write-your-own-commands)
Write your own commands
-----------------------------------------------------------------------------------------------

All extensions can add additional commands (and most do), check out the specific [documentation for the provided nodes](https://tiptap.dev/docs/editor/extensions/nodes)
, [marks](https://tiptap.dev/docs/editor/extensions/marks)
, and [functionality](https://tiptap.dev/docs/editor/extensions/functionality)
 to learn more about those. And of course, you can [add your custom extensions](https://tiptap.dev/docs/editor/extensions/custom-extensions)
 with custom commands as well. But how do you write those commands? There’s a little bit to learn about that.