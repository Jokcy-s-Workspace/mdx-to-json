import { describe, expect, it } from 'vitest';
import { mdxToJson } from '../lib';
import { b, t } from '../lib/util';

const singleElement = [
    {
        input: '<A />',
        output: [b('A', {})],
    },
    {
        input: '<A a="b" />',
        output: [b('A', { a: 'b' })],
    },
    {
        input: '<A a={1} />',
        output: [b('A', { a: 1 })],
    },
    {
        title: 'binary expression',
        input: '<A a={1 + 1} />',
        output: [b('A', { a: 2 })],
    },
    {
        title: 'function invoke',
        input: '<A a={Math.floor(2.2)} />',
        output: [b('A', { a: 2 })],
    },
    {
        title: 'null prop will be true',
        input: '<A open />',
        output: [b('A', { open: true })],
    },
];

const nestElement = [
    {
        input: '<A><B /></A>',
        output: [b('A', {}, b('B', {}))],
    },
    {
        title: 'JSX element as attribute',
        input: '<A renderB={<B />} />',
        output: [b('A', { renderB: b('B', {}) })],
    },
    {
        title: 'nest JSX element as attribute',
        input: '<A renderB={<B><C /></B>} />',
        output: [b('A', { renderB: b('B', {}, b('C', {})) })],
    },
    {
        title: 'super nested JSX element as attribute',
        input: '<A renderB={<B><C renderD={<D />} /></B>} />',
        output: [
            b('A', { renderB: b('B', {}, b('C', { renderD: b('D', {}) })) }),
        ],
    },
    {
        input: '<><A /></>',
        output: [b('Fragment', {}, b('A', {}))],
    },
    {
        input: '<A renderB={<><B /></>}></A>',
        output: [b('A', { renderB: b('Fragment', {}, b('B', {})) })],
    },
    {
        input: '<A>text</A>',
        output: [b('A', {}, t('text'))],
    },
    {
        title: 'nested JSX flow elements',
        input: `<A>

<B>

<C />

</B>

</A>
        
        `,
        output: [b('A', {}, b('B', {}, b('C', {})))],
    },
];

describe('jsx element', () => {
    singleElement.forEach((t) => {
        it(t.title || t.input, () => {
            expect(mdxToJson(t.input)).toEqual(t.output);
        });
    });

    nestElement.forEach((t) => {
        it(t.title || t.input, () => {
            expect(mdxToJson(t.input)).toEqual(t.output);
        });
    });
});
