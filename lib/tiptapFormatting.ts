import { Extension, Mark, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

/**
 * Underline formatting
 */
export const UnderlineMark = Mark.create({
  name: 'underline',

  parseHTML() {
    return [
      { tag: 'u' },
      {
        style: 'text-decoration',
        getAttrs: (value) =>
          value === 'underline' ? {} : false,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['u', mergeAttributes(HTMLAttributes), 0];
  },
});

/**
 * Manually-created hyperlinks
 */
export const LinkMark = Mark.create({
  name: 'link',

  inclusive: false,

  addAttributes() {
    return {
      href: {
        default: null,
      },
      target: {
        default: '_blank',
      },
      rel: {
        default: 'noopener noreferrer',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'a[href]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'a',
      mergeAttributes(HTMLAttributes, {
        class: 'text-blue-600 no-underline',
      }),
      0,
    ];
  },
});

/**
 * Automatically converts website addresses into clickable links.
 *
 * Examples:
 * meta.ai
 * google.com
 * chatlinked.uk
 * www.example.com
 * https://example.com
 */
export const AutoLinkMark = Mark.create({
  name: 'autoLink',

  inclusive: false,

  addAttributes() {
    return {
      href: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'a[data-auto-link]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'a',
      mergeAttributes(HTMLAttributes, {
        'data-auto-link': 'true',
        target: '_blank',
        rel: 'noopener noreferrer',
        class: 'text-blue-600 no-underline',
      }),
      0,
    ];
  },

  addProseMirrorPlugins() {
    const markTypeName = this.name;

    return [
      new Plugin({
        key: new PluginKey('automaticWebsiteLinks'),

        appendTransaction: (transactions, _oldState, newState) => {
          if (
            !transactions.some(
              (transaction) => transaction.docChanged
            )
          ) {
            return null;
          }

          const markType = newState.schema.marks[markTypeName];

          if (!markType) {
            return null;
          }

          const transaction = newState.tr;

          newState.doc.descendants((node, position) => {
            if (!node.isText || !node.text) {
              return;
            }

            const websitePattern =
              /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/g;

            for (const match of node.text.matchAll(
              websitePattern
            )) {
              const text = match[0];
              const index = match.index ?? 0;

              const from = position + index;
              const to = from + text.length;

              const href = text.startsWith('http')
                ? text
                : `https://${text}`;

              const alreadyLinked = node.marks.some(
                (mark) =>
                  mark.type === markType &&
                  mark.attrs.href === href
              );

              if (!alreadyLinked) {
                transaction.addMark(
                  from,
                  to,
                  markType.create({ href })
                );
              }
            }
          });

          return transaction.docChanged
            ? transaction
            : null;
        },
      }),
    ];
  },
});

/**
 * Hashtag highlighting
 *
 * Hashtags are:
 * - Completely blue
 * - Not clickable
 * - Not underlined
 *
 * Examples:
 * #ManCity
 * #Liverpool
 * #Ghana
 * #UniVerseCity
 */
export const HashtagMark = Extension.create({
  name: 'hashtagHighlight',

  addProseMirrorPlugins() {
    const pluginKey = new PluginKey('hashtagHighlight');

    const createHashtagDecorations = (doc: any) => {
      const decorations: Decoration[] = [];

      doc.descendants((node: any, position: number) => {
        if (!node.isText || !node.text) {
          return;
        }

        const hashtagPattern = /#[\p{L}\p{N}_-]+/gu;

        for (const match of node.text.matchAll(
          hashtagPattern
        )) {
          const hashtag = match[0];
          const index = match.index ?? 0;

          const from = position + index;
          const to = from + hashtag.length;

          decorations.push(
            Decoration.inline(from, to, {
              class: 'text-blue-600 no-underline',
            })
          );
        }
      });

      return DecorationSet.create(doc, decorations);
    };

    return [
      new Plugin({
        key: pluginKey,

        state: {
          init: (_config, state) => {
            return createHashtagDecorations(state.doc);
          },

          apply: (transaction, oldDecorations) => {
            if (transaction.docChanged) {
              return createHashtagDecorations(
                transaction.doc
              );
            }

            return oldDecorations.map(
              transaction.mapping,
              transaction.doc
            );
          },
        },

        props: {
          decorations(state) {
            return pluginKey.getState(state);
          },
        },
      }),
    ];
  },
});