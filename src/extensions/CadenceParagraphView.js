export class CadenceParagraphView {
  /**
   * @param {import('@tiptap/pm/model').Node} node
   * @param {import('@tiptap/pm/view').EditorView} view
   * @param {() => number} getPos
   * @param {import('@tiptap/core').Editor} editor
   */
  constructor(node, view, getPos, editor) {
    this.node = node;
    this.view = view;
    this.getPos = getPos;
    this.editor = editor; // Store the full editor instance

    // The main container for our node view
    this.dom = document.createElement('div');
    this.dom.classList.add('cadence-paragraph-wrapper');

    // The element that will display the syllable count
    this.gutter = document.createElement('span');
    this.gutter.classList.add('gutter-line-count');
    this.gutter.setAttribute('contenteditable', 'false'); // Non-editable

    // The element where Tiptap will render the paragraph's actual content
    this.contentDOM = document.createElement('p');
    this.contentDOM.classList.add('paragraph-node'); // Keep class for existing styles

    // Assemble the structure
    this.dom.append(this.gutter, this.contentDOM);

    // Initial render of the syllable count
    this.updateGutter(node);
  }

  /**
   * Called by ProseMirror when the node's content or attributes change.
   * @param {import('@tiptap/pm/model').Node} node
   */
  update(node) {
    // Don't re-render if the node type is incorrect
    if (node.type.name !== 'cadenceParagraph') {
      return false;
    }

    this.updateGutter(node);
    return true;
  }

  updateGutter(node) {
    const pos = this.getPos();
    const count = this.editor.storage.cadenceParagraph.counts.get(pos) || 0;
    this.gutter.textContent = `[${count}]`;
  }
}
