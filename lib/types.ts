import { Root, Element, ElementContent, RootContent } from 'hast';
import { Program, ExpressionMap } from 'estree';
import { toJs } from 'estree-util-to-js';
import {
    JSXAttribute,
    JSXIdentifier,
    JSXMemberExpression,
    JSXNamespacedName,
} from 'estree-util-to-js/lib/jsx';

export type JsxAttribute = {
    type: 'mdxJsxAttribute';
    name: string;
    value:
        | string
        | {
              type: 'mdxJsxAttributeValueExpression';
              value: string;
              data: { estree: Program };
          };
};

export type MdxJsxFlowElement = {
    type: 'mdxJsxFlowElement';
    name: string;
    attributes: JsxAttribute[];
    children: (ElementContent | MdxJsxFlowElement)[];
};

export type MdxTextExpression = {
    type: 'mdxTextExpression';
    value: string;
    data: {
        estree: Program;
    };
};

export type TextJsonNode = {
    text: string;
};

export type JsonNode = {
    component: string;
    props: Record<string, any>;
    children?: (JsonNode | TextJsonNode)[];
};
