import { describe, expect, it } from 'vitest';
import { mdxToJson } from '../lib';

const throwErrors = [
    {
        input: 'import a from "b"',
        error: 'mdxjsEsm current not supported',
    },
    {
        input: 'export const a = "b"',
        error: 'mdxjsEsm current not supported',
    },
    {
        input: '<A a={b()}></A>',
        error: 'b is not defined',
    },
];

describe('unsupported syntax', () => {
    throwErrors.forEach((error) => {
        it(error.input, () => {
            expect(() => mdxToJson(error.input)).toThrowError(
                new Error(error.error),
            );
        });
    });
});
