---
title: Keyboard shortcuts | Tiptap Editor Docs
source_url: https://tiptap.dev/docs/editor/core-concepts/keyboard-shortcuts#overwrite-keyboard-shortcuts
ogLocale: en_US
description: Discover the predefined keyboard shortcuts for Tiptap and learn how to customize these shortcuts to fit your editing needs.
og:title: Keyboard shortcuts | Tiptap Editor Docs
og:locale: en_US
og:image:height: 630
favicon: https://tiptap.dev/docs/favicon.png
ogUrl: https://tiptap.dev/docs/editor/core-concepts/keyboard-shortcuts
viewport: width=device-width, initial-scale=1
robots: index, follow
og:image:width: 1200
language: en
og:description: Discover the predefined keyboard shortcuts for Tiptap and learn how to customize these shortcuts to fit your editing needs.
twitter:description: Discover the predefined keyboard shortcuts for Tiptap and learn how to customize these shortcuts to fit your editing needs.
twitter:title: Keyboard shortcuts | Tiptap Editor Docs
ogDescription: Discover the predefined keyboard shortcuts for Tiptap and learn how to customize these shortcuts to fit your editing needs.
og:url: https://tiptap.dev/docs/editor/core-concepts/keyboard-shortcuts
twitter:card: summary_large_image
og:image: https://tiptap.dev/docs/api/og?title=Keyboard%20shortcuts%20in%20Tiptap&category=Editor
ogImage: https://tiptap.dev/docs/api/og?title=Keyboard%20shortcuts%20in%20Tiptap&category=Editor
docsearch:version: 2.x
og:type: website
ogTitle: Keyboard shortcuts | Tiptap Editor Docs
twitter:image: https://tiptap.dev/docs/api/og?title=Keyboard%20shortcuts%20in%20Tiptap&category=Editor
scrapeId: c8a81a66-d434-4c54-bd33-2a445f74b2be
sourceURL: https://tiptap.dev/docs/editor/core-concepts/keyboard-shortcuts#overwrite-keyboard-shortcuts
url: https://tiptap.dev/docs/editor/core-concepts/keyboard-shortcuts#overwrite-keyboard-shortcuts
statusCode: 200
---

Tiptap comes with sensible keyboard shortcut defaults. Depending on what you want to use it for, you’ll probably want to change those keyboard shortcuts to your liking. Let’s have a look at what we defined for you, and show you how to change it then!

[](https://tiptap.dev/docs/editor/core-concepts/keyboard-shortcuts#predefined-keyboard-shortcuts)
Predefined keyboard shortcuts
-------------------------------------------------------------------------------------------------------------------------------

Most of the core extensions register their own keyboard shortcuts. Depending on what set of extension you use, not all of the below listed keyboard shortcuts work for your editor.

### [](https://tiptap.dev/docs/editor/core-concepts/keyboard-shortcuts#essentials)
Essentials

| Command | Windows/Linux | macOS |
| --- | --- | --- |
| Copy | Control + C | Cmd + C |
| Cut | Control + X | Cmd + X |
| Paste | Control + V | Cmd + V |
| Paste without formatting | Control + Shift + V | Cmd + Shift + V |
| Undo | Control + Z | Cmd + Z |
| Redo | Control + Shift + Z | Cmd + Shift + Z |
| Add a line break | Shift + Enter  <br>Control + Enter | Shift + Enter  <br>Cmd + Enter |

### [](https://tiptap.dev/docs/editor/core-concepts/keyboard-shortcuts#text-formatting)
Text Formatting

| Command | Windows/Linux | macOS |
| --- | --- | --- |
| Bold | Control + B | Cmd + B |
| Italicize | Control + I | Cmd + I |
| Underline | Control + U | Cmd + U |
| Strikethrough | Control + Shift + S | Cmd + Shift + S |
| Highlight | Control + Shift + H | Cmd + Shift + H |
| Code | Control + E | Cmd + E |

### [](https://tiptap.dev/docs/editor/core-concepts/keyboard-shortcuts#paragraph-formatting)
Paragraph Formatting

| Command | Windows/Linux | macOS |
| --- | --- | --- |
| Apply normal text style | Control + Alt + 0 | Cmd + Alt + 0 |
| Apply heading style 1 | Control + Alt + 1 | Cmd + Alt + 1 |
| Apply heading style 2 | Control + Alt + 2 | Cmd + Alt + 2 |
| Apply heading style 3 | Control + Alt + 3 | Cmd + Alt + 3 |
| Apply heading style 4 | Control + Alt + 4 | Cmd + Alt + 4 |
| Apply heading style 5 | Control + Alt + 5 | Cmd + Alt + 5 |
| Apply heading style 6 | Control + Alt + 6 | Cmd + Alt + 6 |
| Ordered list | Control + Shift + 7 | Cmd + Shift + 7 |
| Bullet list | Control + Shift + 8 | Cmd + Shift + 8 |
| Task list | Control + Shift + 9 | Cmd + Shift + 9 |
| Blockquote | Control + Shift + B | Cmd + Shift + B |
| Left align | Control + Shift + L | Cmd + Shift + L |
| Center align | Control + Shift + E | Cmd + Shift + E |
| Right align | Control + Shift + R | Cmd + Shift + R |
| Justify | Control + Shift + J | Cmd + Shift + J |
| Code block | Control + Alt + C | Cmd + Alt + C |
| Subscript | Control + , | Cmd + , |
| Superscript | Control + . | Cmd + . |

### [](https://tiptap.dev/docs/editor/core-concepts/keyboard-shortcuts#text-selection)
Text Selection

| Command | Windows/Linux | macOS |
| --- | --- | --- |
| Select all | Control + A | Cmd + A |
| Extend selection one character to left | Shift + ← | Shift + ← |
| Extend selection one character to right | Shift + → | Shift + → |
| Extend selection one line up | Shift + ↑ | Shift + ↑ |
| Extend selection one line down | Shift + ↓ | Shift + ↓ |

[](https://tiptap.dev/docs/editor/core-concepts/keyboard-shortcuts#overwrite-keyboard-shortcuts)
Overwrite keyboard shortcuts
-----------------------------------------------------------------------------------------------------------------------------

Keyboard shortcuts may be strings like `'Shift-Control-Enter'`. Keys are based on the strings that can appear in `event.key`, concatenated with a `-`. There is a little tool called [keycode.info](https://keycode.info/)
, which shows the `event.key` interactively.

Use lowercase letters to refer to letter keys (or uppercase letters if you want shift to be held). You may use `Space` as an alias for the .

Modifiers can be given in any order. `Shift`, `Alt`, `Control` and `Cmd` are recognized. For characters that are created by holding shift, the `Shift` prefix is implied, and should not be added explicitly.

You can use `Mod` as a shorthand for `Cmd` on Mac and `Control` on other platforms.

Here is an example how you can overwrite the keyboard shortcuts for an existing extension:

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
      extensions: [\
        CustomBulletList(),\
        // …\
      ],
    })