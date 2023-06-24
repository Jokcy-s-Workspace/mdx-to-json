import { Root, Element, ElementContent, RootContent } from 'hast';
import { Program, ExpressionMap } from 'estree';
import { toJs } from 'estree-util-to-js';
import {
    JSXAttribute,
    JSXIdentifier,
    JSXMemberExpression,
    JSXNamespacedName,
} from 'estree-util-to-js/lib/jsx';

function processJSXAttribute(attr: JSXAttribute) {
    if (attr.value?.type === 'Literal') {
        return attr.value.value;
    } else if (attr.value?.type === 'JSXExpressionContainer') {
        if (attr.value.expression.type === 'JSXEmptyExpression')
            return undefined;

        return eval(
            toJs({
                type: 'Program',
                sourceType: 'module',
                body: [
                    {
                        type: 'ExpressionStatement',
                        expression: attr.value.expression,
                    },
                ],
            }).value,
        );
    } else if (attr.value?.type === 'JSXElement') {
        return turnEstreeJsxElementToJson(attr.value);
    } else if (attr.value?.type === 'JSXFragment') {
        // TODO:
        throw new Error('Fragmenet current not supported');
    }
}

function getJSXName(
    attr: JSXMemberExpression | JSXIdentifier | JSXNamespacedName,
) {
    if (attr.type === 'JSXMemberExpression') {
        return attr.property.name;
    } else if (attr.type === 'JSXIdentifier') {
        return attr.name;
    } else {
        return attr.name.name;
    }
}

function turnEstreeJsxElementToJson(
    element: ExpressionMap['JSXElement'],
): JsonNode {
    return {
        component: getJSXName(element.openingElement.name),
        props: element.openingElement.attributes.reduce((result, attr) => {
            if (attr.type === 'JSXSpreadAttribute') {
                throw new Error('');
            }

            return {
                ...result,
                [attr.name.name as string]: processJSXAttribute(attr),
            };
        }, {} as Record<string, any>),
    };
}

function processJSXProp(attr: JsxAttribute) {
    if (attr.value && typeof attr.value === 'object') {
        // const jscode = toJs(attr.value.data.estree);
        // console.log(jscode, eval(jscode.value));

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

        if (expression.expression.type === 'Literal') {
            return expression.expression.value;
        }

        if (expression.expression.type === 'JSXElement') {
            // TODO:
            return turnEstreeJsxElementToJson(expression.expression);
        }

        return eval(toJs(attr.value.data.estree).value);
    } else {
        return attr.value;
    }
}

type JsxAttribute = {
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

type JSXElement = {
    type: 'mdxJsxFlowElement';
    name: string;
    attributes: JsxAttribute[];
    children: (ElementContent | JSXElement)[];
};

export type TextJsonNode = {
    text: string;
};

export type JsonNode = {
    component: string;
    props: Record<string, any>;
    children?: (JsonNode | TextJsonNode)[];
};

function loopChildren<T extends RootContent | JSXElement>(
    children: T[],
    jsonChildren: (JsonNode | TextJsonNode)[],
) {
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
                component: child.name,
                props: child.attributes.reduce(
                    (result, attr) => ({
                        ...result,
                        [attr.name]: processJSXProp(attr),
                    }),
                    {},
                ),
                children: [],
            };

            loopChildren(child.children, jsonNode.children!);

            jsonChildren.push(jsonNode);
        } else {
            console.log(`${child.type} current not supported`);
        }
    });
}

export function processMdxAstToJson(root: Root) {
    let jsonChildren: JsonNode[] = [];

    loopChildren(root.children, jsonChildren);

    return jsonChildren;
}
