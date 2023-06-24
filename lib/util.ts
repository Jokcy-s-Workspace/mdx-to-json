import { JsonNode, TextJsonNode } from './process-mdx-ast-to-json';

export function build(
    component: string,
    props: Record<string, any>,
    ...children: (JsonNode | TextJsonNode)[]
) {
    return {
        component,
        props,
        children,
    };
}

export function buildText(text: string) {
    return {
        text,
    };
}

export const b = build;
export const t = buildText;
