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
      // Removed custom 'Enter' handler to allow default paragraph creation.
      // StarterKit with hardBreak: false should handle 'Enter' for new paragraphs.
    };
  }
});

[end of src/CustomHardBreak.js]
