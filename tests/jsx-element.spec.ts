import { describe, expect, it } from 'vitest';
import { mdxToJson } from '../lib';
import { b } from '../lib/util';

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
        title: 'JSX element as attribute',
        input: '<A renderB={<B />} />',
        output: [b('A', { renderB: b('B', {}) })],
    },
    {
        title: 'nest JSX element as attribute',
        input: '<A renderB={<B><C /></B>} />',
        output: [b('A', { renderB: b('B', {}) })],
    },
];

const nestElement = [
    {
        input: '<A><B /></A>',
        output: [b('A', {}, b('B', {}))],
    },
];

describe('jsx element', () => {
    singleElement.forEach((t) => {
        it(t.title || t.input, () => {
            expect(mdxToJson(t.input)).toEqual(t.output);
        });
    });
});
