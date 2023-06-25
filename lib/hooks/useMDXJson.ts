import { ComponentType, createElement } from 'react';
import { JsonNode, TextJsonNode } from '../types';

const defaultComponents = {
    a: 'a',
    blockquote: 'blockquote',
    br: 'br',
    code: 'code',
    em: 'em',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    hr: 'hr',
    img: 'img',
    li: 'li',
    ol: 'ol',
    p: 'p',
    pre: 'pre',
    strong: 'strong',
    ul: 'ul',
};

function isText(node: JsonNode | TextJsonNode): node is TextJsonNode {
    return !(node as any).component && (node as any).text;
}

function renderNode(
    node: JsonNode,
    components: Record<string, ComponentType<any>>,
) {
    const Comp = components[node.component];

    if (!Comp) throw new Error(`${node.component} not found`);

    return createElement(
        Comp,
        node.props,
        node.children?.map((node) =>
            isText(node) ? node.text : renderNode(node, components),
        ),
    );
}

export function useMdxJson(
    nodes: (JsonNode | TextJsonNode) | (JsonNode | TextJsonNode)[],
    components?: Record<string, ComponentType<any>>,
) {
    const mergeredComponents: any = { ...defaultComponents, ...components };

    nodes = Array.isArray(nodes) ? nodes : [nodes];

    return nodes.map((node) =>
        isText(node) ? node.text : renderNode(node, mergeredComponents),
    );
}