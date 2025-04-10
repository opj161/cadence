// SyllableCounterExtension.js
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { countSyllables } from './utils/syllableCounter';

export const SyllableCounterPluginKey = new PluginKey('syllableCounter');

export const SyllableCounterExtension = Extension.create({
  name: 'syllableCounter',
  
  addOptions() {
    return {
      debug: false
    };
  },
  
  addProseMirrorPlugins() {
    const { debug } = this.options;
    
    return [
      new Plugin({
        key: SyllableCounterPluginKey,
        state: {
          init() {
            return {
              decorations: DecorationSet.empty,
              lineCounts: []
            };
          },
          apply(tr, pluginState, oldState, newState) {
            // Skip if the document hasn't changed
            if (!tr.docChanged) {
              return {
                ...pluginState,
                decorations: pluginState.decorations.map(tr.mapping, tr.doc)
              };
            }
            
            // Process the document to count syllables
            const lineCounts = [];
            const decorations = [];
            
            // Get the editor container for positioning
            const editorContainer = document.querySelector('.editor-container');
            if (!editorContainer) {
              return pluginState;
            }
            
            // Process each block node (paragraph, heading, etc.)
            tr.doc.descendants((node, pos) => {
              if (node.isBlock) {
                // Process each line within the block
                const lines = getTextLinesFromNode(node, pos);
                
                lines.forEach((line, index) => {
                  // Count syllables for this line
                  const syllableCount = countSyllables(line.text);
                  
                  // Store line information
                  lineCounts.push({
                    pos: line.pos,
                    text: line.text,
                    syllableCount,
                    lineIndex: index
                  });
                  
                  // Create a decoration for the syllable count
                  decorations.push(
                    Decoration.widget(line.pos, () => {
                      const gutterItem = document.createElement('div');
                      gutterItem.className = 'syllable-gutter-item';
                      gutterItem.textContent = syllableCount;
                      gutterItem.setAttribute('data-pos', line.pos);
                      gutterItem.setAttribute('data-line-index', index);
                      
                      // Position will be set by CSS and updateGutterPositions
                      return gutterItem;
                    }, { side: -1 })
                  );
                });
              }
            });
            
            if (debug) {
              console.log('Syllable counts:', lineCounts);
            }
            
            // Schedule a position update on the next animation frame
            setTimeout(() => {
              updateGutterPositions(newState.doc, debug);
            }, 10);
            
            return {
              decorations: DecorationSet.create(tr.doc, decorations),
              lineCounts
            };
          }
        },
        props: {
          decorations(state) {
            return this.getState(state).decorations;
          }
        }
      })
    ];
  }
});

// Helper function to get text lines from a node, accounting for hard breaks
function getTextLinesFromNode(node, pos) {
  const lines = [];
  let currentLine = { text: '', pos: pos + 1 };
  let currentPos = pos + 1;
  
  // Process each child node
  node.forEach((child, offset, index) => {
    if (child.type.name === 'hardBreak') {
      // End the current line
      lines.push(currentLine);
      
      // Start a new line after the hard break
      currentPos += child.nodeSize;
      currentLine = { text: '', pos: currentPos };
    } else if (child.isText) {
      // Add text to the current line
      currentLine.text += child.text;
      currentPos += child.nodeSize;
    } else {
      // Handle other inline nodes
      currentPos += child.nodeSize;
    }
  });
  
  // Add the last line if it's not empty or if no lines have been added
  if (currentLine.text || lines.length === 0) {
    lines.push(currentLine);
  }
  
  return lines;
}

// Function to update gutter positions based on DOM positions
function updateGutterPositions(doc, debug) {
  const gutterItems = document.querySelectorAll('.syllable-gutter-item');
  const editorContainer = document.querySelector('.editor-container');
  
  if (!editorContainer || !gutterItems.length) return;
  
  const containerRect = editorContainer.getBoundingClientRect();
  
  // Get all paragraph elements
  const paragraphs = editorContainer.querySelectorAll('.ProseMirror p');
  
  // Create a map of positions to DOM elements
  const posToElement = new Map();
  
  // Process each paragraph to find line elements
  paragraphs.forEach(paragraph => {
    // Get the paragraph's position attribute
    const paragraphPos = parseInt(paragraph.getAttribute('data-pos') || '0', 10);
    
    // Get all text nodes and <br> elements in the paragraph
    const textAndBreakNodes = [];
    const collectNodes = (element) => {
      if (element.nodeType === Node.TEXT_NODE) {
        textAndBreakNodes.push({ type: 'text', node: element });
      } else if (element.nodeName === 'BR') {
        textAndBreakNodes.push({ type: 'break', node: element });
      } else if (element.childNodes) {
        Array.from(element.childNodes).forEach(collectNodes);
      }
    };
    
    collectNodes(paragraph);
    
    // First line is the paragraph itself
    posToElement.set(paragraphPos + 1, {
      element: paragraph,
      lineIndex: 0
    });
    
    // Process breaks to find subsequent lines
    let lineIndex = 1;
    let currentPos = paragraphPos + 1;
    
    for (let i = 0; i < textAndBreakNodes.length; i++) {
      const node = textAndBreakNodes[i];
      
      if (node.type === 'break') {
        // Position after the break
        currentPos += 1;
        
        // Find the next text node (if any)
        const nextTextNode = textAndBreakNodes.slice(i + 1).find(n => n.type === 'text');
        
        if (nextTextNode) {
          posToElement.set(currentPos, {
            element: nextTextNode.node.parentElement || paragraph,
            lineIndex: lineIndex
          });
        }
        
        lineIndex++;
      } else if (node.type === 'text') {
        currentPos += node.node.textContent.length;
      }
    }
  });
  
  // Update each gutter item's position
  gutterItems.forEach(item => {
    const pos = parseInt(item.getAttribute('data-pos') || '0', 10);
    const lineIndex = parseInt(item.getAttribute('data-line-index') || '0', 10);
    
    // Find the corresponding element
    const elementInfo = posToElement.get(pos);
    
    if (elementInfo) {
      const { element, lineIndex: elementLineIndex } = elementInfo;
      const elementRect = element.getBoundingClientRect();
      
      // Calculate top position
      let top = elementRect.top - containerRect.top;
      
      // Adjust for line index if needed
      if (lineIndex > 0) {
        // Approximate line height
        const lineHeight = parseInt(window.getComputedStyle(element).lineHeight) || 24;
        top += lineIndex * lineHeight;
      }
      
      // Set the position
      item.style.top = `${top}px`;
    } else if (debug) {
      console.warn(`Could not find element for position ${pos}`);
    }
  });
}
