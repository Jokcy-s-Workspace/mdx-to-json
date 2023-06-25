import { ElementContent } from 'hast';
import { Program } from 'estree-jsx';

export type MdxJsxAttribute = {
    type: 'mdxJsxAttribute';
    name: string;
    value:
        | string
        | null
        | {
              type: 'mdxJsxAttributeValueExpression';
              value: string;
              data: { estree: Program };
          };
};

export type MdxJsxFlowElement = {
    type: 'mdxJsxFlowElement';
    name: string;
    attributes: MdxJsxAttribute[];
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
