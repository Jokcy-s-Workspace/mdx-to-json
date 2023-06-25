import { Root, Element, ElementContent, RootContent } from 'hast';

import {
    JsonNode,
    MdxJsxAttribute,
    MdxJsxFlowElement,
    MdxTextExpression,
    TextJsonNode,
} from './types';
import {
    getExpressionValue,
    processJSXChild,
    turnEstreeJsxElementToJson,
} from './estree-jsx-process';
import { JSXFragment } from 'estree-jsx';

function processMdxJsxProp(attr: MdxJsxAttribute) {
    if (attr.value && typeof attr.value === 'object') {
        if (attr.value.data.estree.body.length > 1) {
            throw new Error(
                `jsx prop can only be simple expression: ${attr.value.value}`,
            );
        }

        const expression = attr.value.data.estree.body[0];
        if (expression.type !== 'ExpressionStatement') {
            throw new Error(
                `jsx prop can only be simple expression: ${attr.value.value}`,
            );
        }

        if (expression.expression.type === 'JSXElement') {
            // TODO:
            return turnEstreeJsxElementToJson(expression.expression);
        }

        if ((expression.expression.type as any) === 'JSXFragment') {
            // throw new Error('JSXFragment no supported');
            return {
                component: 'Fragment',
                props: {},
                children: (
                    expression.expression as unknown as JSXFragment
                ).children.map((child) => processJSXChild(child)),
            } as JsonNode;
        }

        return getExpressionValue(attr.value.data.estree);
    } else {
        return attr.value === null ? true : attr.value;
    }
}

function loopChildren<
    T extends RootContent | MdxJsxFlowElement | MdxTextExpression,
>(children: T[], jsonChildren: (JsonNode | TextJsonNode)[]) {
    // if (node.type === "element")
    children.forEach((child) => {
        if (child.type === 'text') {
            // jsonChildren.push(child);
            jsonChildren.push({ text: child.value });
        } else if (child.type === 'element') {
            const node = {
                component: child.tagName,
                props: child.properties || {},
                children: [],
            };
            const hastChildren = child.children;

            child.children = [];
            loopChildren(hastChildren, node.children);
            jsonChildren.push(node);
        } else if (child.type === 'mdxJsxFlowElement') {
            const jsonNode: JsonNode = {
                component: child.name || 'Fragment', // <></> child.name will be null
                props: child.attributes.reduce(
                    (result, attr) => ({
                        ...result,
                        [attr.name]: processMdxJsxProp(attr),
                    }),
                    {},
                ),
                children: [],
            };

            loopChildren(child.children, jsonNode.children!);

            jsonChildren.push(jsonNode);
        } else if (child.type === 'mdxTextExpression') {
            return getExpressionValue(child.data.estree);
        } else {
            throw new Error(`${child.type} current not supported`);
        }
    });
}

export function processMdxAstToJson(root: Root) {
    let jsonChildren: (JsonNode | TextJsonNode)[] = [];

    loopChildren(root.children, jsonChildren);

    return jsonChildren;
}
