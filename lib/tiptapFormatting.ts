import { Mark } from '@tiptap/core';

export const UnderlineMark = Mark.create({
  name: 'underline',
  parseHTML() {
    return [{ tag: 'u' }];
  },
  renderHTML() {
    return ['u', 0];
  },
});

export const LinkMark = Mark.create({
  name: 'link',
  inclusive: false,
  addAttributes() {
    return {
      href: { default: null },
      target: { default: '_blank' },
      rel: { default: 'noopener noreferrer' },
    };
  },
  parseHTML() {
    return [{ tag: 'a[href]' }];
  },
  renderHTML({ HTMLAttributes }) {
    const href = String(HTMLAttributes.href || '');
    const safe = /^(https?:\/\/|mailto:|tel:)/i.test(href) ? href : '#';
    return ['a', { ...HTMLAttributes, href: safe, class: 'underline text-navy', target: '_blank', rel: 'noopener noreferrer' }, 0];
  },
});
