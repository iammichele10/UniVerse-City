import { Extension, Mark, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import {
  Decoration,
  DecorationSet,
} from '@tiptap/pm/view';

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
    return [
      'u',
      mergeAttributes(HTMLAttributes),
      0,
    ];
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
        class:
          'text-blue-600 no-underline',
        target: '_blank',
        rel: 'noopener noreferrer',
      }),
      0,
    ];
  },
});

/**
 * Automatically converts website addresses
 * into clickable links.
 *
 * The important part of this implementation is
 * that it scans the complete text inside each
 * text block rather than scanning individual
 * Tiptap text nodes.
 */
export const AutoLinkMark = Mark.create({
  name: 'autoLink',

  /**
   * Keep this false.
   *
   * This prevents normal text typed after a URL
   * from inheriting the blue link.
   */
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
        class:
          'text-blue-600 no-underline',
      }),
      0,
    ];
  },

  addProseMirrorPlugins() {
    const markTypeName = this.name;

    return [
      new Plugin({
        key: new PluginKey(
          'automaticWebsiteLinks'
        ),

        appendTransaction: (
          transactions,
          _oldState,
          newState
        ) => {
          if (
            !transactions.some(
              (transaction) =>
                transaction.docChanged
            )
          ) {
            return null;
          }

          const markType =
            newState.schema.marks[
              markTypeName
            ];

          if (!markType) {
            return null;
          }

          const transaction =
            newState.tr;

          /**
           * Complete website matcher.
           *
           * Examples:
           *
           * laliga.com
           * www.laliga.com
           * google.co.uk
           * https://laliga.com
           * https://www.laliga.com/news
           */
          const websitePattern =
            /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/[^\s<]*)?/g;

          /**
           * Walk through every text-containing
           * block in the document.
           *
           * Instead of looking at individual text
           * nodes, combine adjacent inline text.
           *
           * This is what fixes:
           *
           * laliga.co + m
           *
           * becoming:
           *
           * laliga.com
           */
          newState.doc.descendants(
            (node, position) => {
              /**
               * We only care about nodes that
               * contain inline content.
               */
              if (
                !node.isTextblock ||
                !node.content.size
              ) {
                return;
              }

              /**
               * Collect the text children of this
               * block and remember their positions.
               */
              const pieces: {
                text: string;
                start: number;
                end: number;
              }[] = [];

              let combinedText = '';

              node.forEach(
                (child, offset) => {
                  if (
                    !child.isText ||
                    !child.text
                  ) {
                    return;
                  }

                  const start =
                    combinedText.length;

                  combinedText +=
                    child.text;

                  const end =
                    combinedText.length;

                  pieces.push({
                    text: child.text,
                    start,
                    end,
                  });
                }
              );

              if (
                pieces.length === 0 ||
                !combinedText
              ) {
                return;
              }

              websitePattern.lastIndex = 0;

              for (const match of combinedText.matchAll(
                websitePattern
              )) {
                const website =
                  match[0];

                const combinedStart =
                  match.index ?? 0;

                const combinedEnd =
                  combinedStart +
                  website.length;

                const href =
                  /^https?:\/\//i.test(
                    website
                  )
                    ? website
                    : `https://${website}`;

                /**
                 * Convert combined-text
                 * positions back into absolute
                 * ProseMirror document positions.
                 */
                const absoluteStart =
                  position +
                  1 +
                  combinedStart;

                const absoluteEnd =
                  position +
                  1 +
                  combinedEnd;

                /**
                 * Check whether every character
                 * in the URL already has the
                 * correct auto-link mark.
                 */
                let alreadyLinked = true;

                for (
                  let pos =
                    absoluteStart;
                  pos < absoluteEnd;
                  pos++
                ) {
                  const resolved =
                    newState.doc.resolve(
                      pos
                    );

                  const hasMark =
                    resolved
                      .marks()
                      .some(
                        (mark) =>
                          mark.type ===
                            markType &&
                          mark.attrs.href ===
                            href
                      );

                  if (!hasMark) {
                    alreadyLinked =
                      false;
                    break;
                  }
                }

                if (!alreadyLinked) {
                  transaction.addMark(
                    absoluteStart,
                    absoluteEnd,
                    markType.create({
                      href,
                    })
                  );
                }
              }
            }
          );

          return transaction.docChanged
            ? transaction
            : null;
        },
      }),
    ];
  },
});

/**
 * HASHTAG HIGHLIGHT
 *
 * Hashtags are deliberately NOT a Tiptap mark.
 *
 * They are editor-only decorations.
 * Saving is handled separately in page.tsx.
 */
export const HashtagMark =
  Extension.create({
    name: 'hashtagHighlight',

    addProseMirrorPlugins() {
      const pluginKey =
        new PluginKey(
          'hashtagHighlight'
        );

      function createDecorations(
        doc: any
      ) {
        const decorations: Decoration[] =
          [];

        doc.descendants(
          (
            node: any,
            position: number
          ) => {
            if (
              !node.isText ||
              !node.text
            ) {
              return;
            }

            const hashtagPattern =
              /#[\p{L}\p{N}_-]+/gu;

            for (const match of node.text.matchAll(
              hashtagPattern
            )) {
              const hashtag =
                match[0];

              const index =
                match.index ?? 0;

              const from =
                position + index;

              const to =
                from + hashtag.length;

              decorations.push(
                Decoration.inline(
                  from,
                  to,
                  {
                    style:
                      'color:#2563eb !important;text-decoration:none !important;',
                    class:
                      'hashtag-blue',
                  }
                )
              );
            }
          }
        );

        return DecorationSet.create(
          doc,
          decorations
        );
      }

      return [
        new Plugin({
          key: pluginKey,

          state: {
            init: (
              _config,
              state
            ) => {
              return createDecorations(
                state.doc
              );
            },

            apply: (
              transaction,
              oldDecorations
            ) => {
              if (
                transaction.docChanged
              ) {
                return createDecorations(
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
              return pluginKey.getState(
                state
              );
            },
          },
        }),
      ];
    },
  });

/**
 * LINE SPACING
 *
 * Adds a paragraph-level line-height attribute that is saved
 * in the post HTML and restored when the post is edited.
 */
export const LineSpacing = Extension.create({
  name: 'lineSpacing',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading', 'blockquote', 'listItem'],
        attributes: {
          lineHeight: {
            default: null,

            parseHTML: (element) =>
              element.style.lineHeight || null,

            renderHTML: (attributes) => {
              if (!attributes.lineHeight) {
                return {};
              }

              return {
                style: `line-height:${attributes.lineHeight};`,
              };
            },
          },
        },
      },
    ];
  },
});
