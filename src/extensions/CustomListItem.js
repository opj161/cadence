import ListItem from '@tiptap/extension-list-item';

/**
 * CustomListItem Extension
 *
 * This extension extends the default ListItem to change its content schema.
 * Instead of requiring a 'paragraph' node, it requires our custom 'cadenceParagraph'.
 * This is necessary for the schema to be valid when we replace the default paragraph.
 */
export const CustomListItem = ListItem.extend({
  content: 'cadenceParagraph block*',
});
