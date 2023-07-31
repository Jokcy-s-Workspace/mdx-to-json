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

function getChildren(
    nodes: (JsonNode | TextJsonNode)[],
    components: Record<string, ComponentType<any>>,
) {
    const result = nodes.map((node, index) =>
        isText(node) ? node.text : renderNode(node, components, index),
    );

    return result.length === 1 ? result[0] : result;
}

function renderNode(
    node: JsonNode,
    components: Record<string, ComponentType<any>>,
    key?: number | string,
): JSX.Element {
    const Comp = components[node.component];

    if (!Comp) throw new Error(`${node.component} not found`);

    return createElement(
        Comp,
        key !== undefined ? { ...node.props, key } : node.props,
        node.children ? getChildren(node.children, components) : null,
    );
}

export function useMdxJson(
    nodes: (JsonNode | TextJsonNode) | (JsonNode | TextJsonNode)[],
    components?: Record<string, ComponentType<any>>,
) {
    const mergeredComponents: any = { ...defaultComponents, ...components };

    nodes = Array.isArray(nodes) ? nodes : [nodes];

    return getChildren(nodes, mergeredComponents);
}
