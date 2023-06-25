import type { Root } from 'mdast';
import type { Root as HastRoot } from 'hast';
import { createProcessor } from '@mdx-js/mdx';
import remarkFrontmatter from 'remark-frontmatter';
import { visit } from 'unist-util-visit';
import { parse } from 'yaml';
import { processMdxAstToJson } from './process-mdx-ast-to-json';

export function mdxToJson(mdx: string) {
    let mdast: Root = { type: 'root', children: [] };
    let hast: HastRoot = { type: 'root', children: [] };
    let frontmatter: Record<string, any> = {};

    const processor = createProcessor({
        format: 'mdx',
        remarkPlugins: [() => (t) => (mdast = t), remarkFrontmatter],
        rehypePlugins: [
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

    return processMdxAstToJson(hast);
}
