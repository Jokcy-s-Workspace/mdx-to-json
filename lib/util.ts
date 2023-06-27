import { JsonNode, TextJsonNode } from './types.js';

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
