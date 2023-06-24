import { describe, expect, it } from 'vitest';
import { mdxToJson } from '../lib';
import { b, t } from '../lib/util';

describe('test', () => {
    it('should work', () => {
        expect(mdxToJson('# a')).toEqual([b('h1', {}, t('a'))]);
    });
});
