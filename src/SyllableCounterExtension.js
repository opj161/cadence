// SyllableCounterExtension.js
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { countSyllables } from './utils/syllableCounter'; // Now async

export const SyllableCounterPluginKey = new PluginKey('syllableCounter');

export const SyllableCounterExtension = Extension.create({
  name: 'syllableCounter',

  addOptions() {
    return {
      debug: false,
    };
  },

  addProseMirrorPlugins() {
    const { debug } = this.options;
    const extensionName = this.name;

    return [
      new Plugin({
        key: SyllableCounterPluginKey,
        state: {
          init() {
            if (debug) console.log(`[${extensionName}] Init plugin state`);
            return {
              decorations: DecorationSet.empty,
              // Stores { pos: number, count: number, error?: any }
              resolvedCounts: new Map(),
              // Stores { pos: number, promise: Promise }
              pendingRequests: new Map(),
            };
          },
          apply(tr, pluginState, oldState, newState) {
            const { doc } = newState;
            let { decorations, resolvedCounts, pendingRequests } = pluginState;

            // Map existing decorations and resolved counts through changes
            decorations = decorations.map(tr.mapping, doc);
            const newResolvedCounts = new Map();
            resolvedCounts.forEach((data, pos) => {
              const mapped = tr.mapping.mapResult(pos);
              if (!mapped.deleted) {
                newResolvedCounts.set(mapped.pos, data);
              }
            });
            resolvedCounts = newResolvedCounts;

            const newPendingRequests = new Map();
            pendingRequests.forEach((req, pos) => {
                const mapped = tr.mapping.mapResult(pos);
                if (!mapped.deleted) {
                    newPendingRequests.set(mapped.pos, req);
                } else {
                    // If the node was deleted, try to cancel/ignore the promise
                    // For simplicity, we'll just not carry it over.
                    // Actual cancellation is harder.
                    if (debug && req.controller) {
                        // req.controller.abort(); // If using AbortController
                        console.log(`[${extensionName}] Node at ${pos} deleted, pending request ignored.`);
                    }
                }
            });
            pendingRequests = newPendingRequests;


            const meta = tr.getMeta(this.key);

            if (meta && meta.type === 'syllables_updated') {
              if (debug) console.log(`[${extensionName}] Meta: syllables_updated`, meta.result);
              const { pos, count, error } = meta.result;
              pendingRequests.delete(pos); // Remove from pending
              if (error) {
                resolvedCounts.set(pos, { count: -1, error: true });
                if (debug) console.warn(`[${extensionName}] Error counting syllables for pos ${pos}:`, error);
              } else {
                resolvedCounts.set(pos, { count });
              }
              // Decorations will be rebuilt based on updated resolvedCounts
            }

            if (tr.docChanged) {
              if (debug) console.log(`[${extensionName}] Document changed. Recalculating syllables.`);
              doc.descendants((node, pos) => {
                if (node.isBlock && node.type.name === 'paragraph') { // Process only paragraphs for now
                  const nodePos = pos + 1; // Position of the content within the node
                  
                  // Only process if content changed or not yet processed
                  // This simple check might need refinement for optimal performance
                  let oldNodeText = null;
                  if(oldState && !tr.steps.some(step => step.slice && step.slice.content.size > 0)){ // Heuristic: avoid re-calc if not structurally changed
                    const oldNode = oldState.doc.nodeAt(pos);
                    if(oldNode) oldNodeText = oldNode.textContent;
                  }

                  if (node.textContent !== oldNodeText || !resolvedCounts.has(nodePos) && !pendingRequests.has(nodePos)) {
                    // If there's an existing pending request for this node, cancel it (conceptually)
                    // Actual promise cancellation is complex; here we just overwrite.
                    if (pendingRequests.has(nodePos)) {
                        if (debug) console.log(`[${extensionName}] Node at ${nodePos} changed, existing pending request replaced.`);
                        // Potentially abort if using AbortController: pendingRequests.get(nodePos).controller.abort();
                    }

                    const textContent = node.textContent;
                    if (textContent.trim().length > 0) {
                      // const controller = new AbortController(); // For potential cancellation
                      const promise = countSyllables(textContent)
                        .then(count => ({ pos: nodePos, count }))
                        .catch(error => ({ pos: nodePos, count: -1, error }));
                      
                      pendingRequests.set(nodePos, { promise /*, controller*/ });
                      if (debug) console.log(`[${extensionName}] Requesting syllable count for pos ${nodePos}, text: "${textContent.substring(0,20)}..."`);

                      promise.then(result => {
                        // Check if the view is still mounted and the plugin is active
                        // This check is important to prevent updates on destroyed views
                        const currentPluginState = this.getState(newState);
                        if (currentPluginState && currentPluginState.pendingRequests.has(result.pos)) {
                             // Only dispatch if this promise is still the one pending
                             const pendingReq = currentPluginState.pendingRequests.get(result.pos);
                             if (pendingReq && pendingReq.promise === promise) {
                                if (newState.doc.nodeAt(pos) === node) { // Ensure node still exists at that pos
                                    const view = this.editor.view; // Get view from editor instance (passed in addProseMirrorPlugins)
                                    if (view && !view.isDestroyed) {
                                        view.dispatch(
                                            newState.tr.setMeta(this.key, { type: 'syllables_updated', result })
                                        );
                                    }
                                } else if (debug) {
                                    console.log(`[${extensionName}] Node at pos ${pos} changed before promise for "${textContent.substring(0,20)}..." resolved. Update skipped.`);
                                }
                             } else if (debug) {
                                 console.log(`[${extensionName}] Promise for pos ${result.pos} (text: "${textContent.substring(0,20)}...") was superseded. Update skipped.`);
                             }
                        } else if (debug) {
                             console.log(`[${extensionName}] Promise for pos ${result.pos} (text: "${textContent.substring(0,20)}...") resolved but node no longer pending or plugin state changed. Update skipped.`);
                        }
                      });
                    } else {
                        // Empty node, set count to 0
                        resolvedCounts.set(nodePos, { count: 0 });
                        pendingRequests.delete(nodePos); // remove if it was pending
                    }
                  }
                }
              });
            }

            // Create decorations based on resolved counts
            const newDecorations = [];
            resolvedCounts.forEach(({ count, error }, pos) => {
              const decorationPos = pos; // Place widget at the start of the paragraph content
              if (doc.nodeAt(pos-1) && doc.nodeAt(pos-1).type.name === 'paragraph') { // ensure node exists
                newDecorations.push(
                  Decoration.widget(decorationPos, () => {
                    const el = document.createElement('div');
                    el.className = 'syllable-gutter-item';
                    el.textContent = error ? 'ERR' : (count === -1 ? '?' : String(count));
                    el.setAttribute('data-pos', String(decorationPos));
                    // updateGutterPositions would be called here or after all decorations are set,
                    // but its logic needs to be adapted for per-paragraph widgets.
                    return el;
                  }, { side: -1, key: `sgc-${pos}` })
                );
              }
            });
            
            // Add decorations for pending requests (e.g., loading state)
            pendingRequests.forEach((_req, pos) => {
                if (!resolvedCounts.has(pos) && doc.nodeAt(pos-1) && doc.nodeAt(pos-1).type.name === 'paragraph') { // Only show loading if not already resolved
                    newDecorations.push(
                        Decoration.widget(pos, () => {
                            const el = document.createElement('div');
                            el.className = 'syllable-gutter-item loading';
                            el.textContent = '...';
                            el.setAttribute('data-pos', String(pos));
                            return el;
                        }, { side: -1, key: `sgc-pending-${pos}` })
                    );
                }
            });
            decorations = DecorationSet.create(doc, newDecorations);

            // The updateGutterPositions logic needs significant rework
            // For now, we'll rely on CSS for basic positioning.
            // It should be called after decorations are applied and stable.
            // A simple timeout might work for a demo, but a more robust solution is needed.
            if (tr.docChanged || (meta && meta.type === 'syllables_updated')) {
                setTimeout(() => {
                    if (this.editor.view && !this.editor.view.isDestroyed) {
                         this.updateGutterPositions(this.editor.view, debug);
                    }
                }, 50); // Delay to allow DOM updates
            }
            
            return { decorations, resolvedCounts, pendingRequests };
          }
        },
        props: {
          decorations(state) {
            const pluginState = this.getState(state);
            if (pluginState) return pluginState.decorations;
            return null;
          }
        },
        // Pass editor instance to the plugin
        view(editorView) {
            this.editor = editorView.editor; // Store editor instance
            // This is a workaround to make editor instance available in plugin state apply
            // A cleaner way might be to pass it through options or have a dedicated method in the extension
            const plugin = this.key ? editorView.state.plugins.find(p => p.key === this.key.key) : null;
            if (plugin) {
                plugin.editor = editorView.editor; // Attach editor to plugin instance for access in apply
            }
            this.updateGutterPositions(editorView, debug);
            return {
                update: (view, prevState) => {
                    this.updateGutterPositions(view, debug);
                },
                destroy: () => {}
            };
        }
      })
    ];
  },
  
  // This is a new method for the extension, not part of PM plugin
  updateGutterPositions(view, debug) {
    const editorContainer = view.dom.closest('.editor-container');
    if (!editorContainer) return;

    const gutterItems = editorContainer.querySelectorAll('.syllable-gutter-item');
    if (!gutterItems.length) return;
    
    const containerRect = editorContainer.getBoundingClientRect();

    gutterItems.forEach(item => {
        const pos = parseInt(item.getAttribute('data-pos') || '0', 10);
        if (pos > 0) {
            try {
                const coords = view.coordsAtPos(pos);
                const top = coords.top - containerRect.top;
                item.style.top = `${top}px`;
                if (debug) console.log(`[${this.name}] Updating gutter for pos ${pos} to top: ${top}px`);
            } catch (e) {
                if (debug) console.warn(`[${this.name}] Error getting coords for pos ${pos}:`, e);
                item.style.top = '0px'; // Fallback
            }
        }
    });
  }
});

[end of src/SyllableCounterExtension.js]
