// CustomHardBreak.js
import HardBreak from '@tiptap/extension-hard-break';

export const CustomHardBreak = HardBreak.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      class: {
        default: 'hard-break',
        parseHTML: element => element.getAttribute('class'),
        renderHTML: attributes => {
          return {
            class: attributes.class,
          }
        },
      },
    }
  },
  
  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => this.editor.commands.setHardBreak(),
      'Shift-Enter': () => this.editor.commands.setHardBreak(),
      'Enter': () => {
        // If we're at the end of a paragraph, create a new paragraph
        // Otherwise, insert a hard break
        const { selection } = this.editor.state;
        const { $from, empty } = selection;
        
        if (empty && $from.parent.type.name === 'paragraph') {
          const endPos = $from.end();
          if ($from.pos === endPos - 1) {
            return this.editor.commands.splitBlock();
          }
        }
        
        return this.editor.commands.setHardBreak();
      }
    };
  }
});
