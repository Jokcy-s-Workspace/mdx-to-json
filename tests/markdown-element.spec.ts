import { describe, expect, it } from 'vitest';
import { mdxToJson } from '../lib';
import { b, t } from '../lib/util';

const blockTests = [
    { input: 'paragraph', output: [b('p', {}, t('paragraph'))] },
    {
        input: '> blockquote',
        output: [
            b('blockquote', {}, t('\n'), b('p', {}, t('blockquote')), t('\n')),
        ],
    },
    ...[1, 2, 3, 4, 5, 6].map((num) => ({
        input: `${'#'.repeat(num)} heading`,
        output: [b(`h${num}`, {}, t('heading'))],
    })),
    {
        input: `- 1\n- 2`,
        output: [
            b(
                'ul',
                {},
                t('\n'),
                b('li', {}, t('1')),
                t('\n'),
                b('li', {}, t('2')),
                t('\n'),
            ),
        ],
    },
    {
        input: `1. 1\n2. 2`,
        output: [
            b(
                'ol',
                {},
                t('\n'),
                b('li', {}, t('1')),
                t('\n'),
                b('li', {}, t('2')),
                t('\n'),
            ),
        ],
    },
    {
        input: `\`\`\`js
const num = 1 + 2
\`\`\``,
        output: [
            b(
                'pre',
                {},
                b(
                    'code',
                    { className: ['language-js'] },
                    t('const num = 1 + 2\n'),
                ),
            ),
        ],
    },
];

const inlineTests = [
    {
        input: '**blod**',
        output: [b('p', {}, b('strong', {}, t('blod')))],
    },
    {
        input: '*italic*',
        output: [b('p', {}, b('em', {}, t('italic')))],
    },
    {
        input: '![image](/path/to/image.png)',
        output: [
            b('p', {}, b('img', { src: '/path/to/image.png', alt: 'image' })),
        ],
    },
    {
        input: '`code`',
        output: [b('p', {}, b('code', {}, t('code')))],
    },
    {
        input: '[link](http://b.com "title")',
        output: [
            b(
                'p',
                {},
                b('a', { href: 'http://b.com', title: 'title' }, t('link')),
            ),
        ],
    },
];

describe('markdown element', () => {
    blockTests.forEach((t) => {
        it(t.input, () => {
            expect(mdxToJson(t.input)).toEqual(t.output);
        });
    });

    inlineTests.forEach((t) => {
        it(t.input, () => {
            expect(mdxToJson(t.input)).toEqual(t.output);
        });
    });
});
