import { Root, Element, ElementContent, RootContent } from 'hast';
import { Program, ExpressionMap } from 'estree';
import { toJs } from 'estree-util-to-js';
import {
    JSXAttribute,
    JSXIdentifier,
    JSXMemberExpression,
    JSXNamespacedName,
} from 'estree-util-to-js/lib/jsx';
import {
    JsonNode,
    JsxAttribute,
    MdxJsxFlowElement,
    MdxTextExpression,
    TextJsonNode,
} from './types';

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
                throw new Error('JSXSpreadAttribute not supported');
            }

            let value: any;

            if (attr.value === null) {
                value = true;
            } else if (attr.value.type === 'JSXExpressionContainer') {
                const expression = attr.value.expression;
                if (expression.type === 'JSXElement') {
                    value = turnEstreeJsxElementToJson(expression);
                } else {
                    value = getExpressionValue({
                        type: 'Program',
                        sourceType: 'module',
                        body: [
                            {
                                type: 'ExpressionStatement',
                                expression: expression as any,
                            },
                        ],
                    });
                }
            } else if (attr.value.type === 'JSXElement') {
                value = turnEstreeJsxElementToJson(attr.value);
            } else {
                throw new Error(`${attr.value.type} not supported`);
            }

            return {
                ...result,
                [attr.name.name as string]: value,
            };
        }, {} as Record<string, any>),
        children: element.children.map((child) => {
            if (child.type === 'JSXElement') {
                return turnEstreeJsxElementToJson(child);
            } else if ((child.type as any) === 'mdxJsxFlowElement') {
                // TODO: do this as indevalduade function

                const c = child as unknown as MdxJsxFlowElement;

                const jsonNode: JsonNode = {
                    component: c.name,
                    props: c.attributes.reduce(
                        (result, attr) => ({
                            ...result,
                            [attr.name]: processJSXProp(attr),
                        }),
                        {},
                    ),
                    children: [],
                };

                loopChildren(c.children, jsonNode.children!);

                return jsonNode;
            } else {
                throw new Error(`${child.type} not supported`);
            }
        }),
    };
}

function getExpressionValue(program: Program) {
    return eval(toJs(program).value);
}

function processJSXProp(attr: JsxAttribute) {
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
                        [attr.name]: processJSXProp(attr),
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
    let jsonChildren: JsonNode[] = [];

    loopChildren(root.children, jsonChildren);

    return jsonChildren;
}
