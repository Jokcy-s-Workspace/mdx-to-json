import type { Root } from 'mdast';
import type { Root as HastRoot } from 'hast';
import { createProcessor } from '@mdx-js/mdx';
import remarkFrontmatter from 'remark-frontmatter';
import { visit } from 'unist-util-visit';
import { parse } from 'yaml';
import { ProcessorOptions } from '@mdx-js/mdx';
import { processMdxAstToJson } from './process-mdx-ast-to-json.js';

export function mdxToJson(
    mdx: string,
    options: {
        remarkPlugins?: ProcessorOptions['remarkPlugins'];
        rehypePlugins?: ProcessorOptions['rehypePlugins'];
    } = {},
) {
    let mdast: Root = { type: 'root', children: [] };
    let hast: HastRoot = { type: 'root', children: [] };
    let frontmatter: Record<string, any> = {};

    const processor = createProcessor({
        format: 'mdx',
        remarkPlugins: [
            ...(options.remarkPlugins || []),
            remarkFrontmatter,
            () => (t) => (mdast = t),
        ],
        rehypePlugins: [
            ...(options.rehypePlugins || []),
            () => (t) => {
                hast = structuredClone(t);
            },
        ],
    });

    const ast = processor.parse({ value: mdx });

    processor.runSync(ast);

    visit(mdast, 'yaml', (node) => {
        frontmatter = parse(node.value);
    });

    return {
        frontmatter,
        nodes: processMdxAstToJson(hast),
    };
}
