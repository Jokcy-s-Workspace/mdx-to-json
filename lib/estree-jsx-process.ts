import { Root, Element, ElementContent, RootContent } from 'hast';
import { Program, ExpressionMap } from 'estree';
import { toJs } from 'estree-util-to-js';

import { JsonNode, MdxJsxFlowElement } from './types';
import {
    JSXAttribute,
    JSXIdentifier,
    JSXMemberExpression,
    JSXNamespacedName,
    JSXFragment,
    Expression,
    JSXEmptyExpression,
    JSXExpressionContainer,
    JSXElement,
    JSXText,
    JSXSpreadChild,
} from 'estree-jsx';

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

export function getExpressionValue(program: Program) {
    return eval(toJs(program).value);
}

function getJSXExpressionContainerValue(
    expression: Expression | JSXEmptyExpression,
) {
    if (expression.type === 'JSXEmptyExpression') {
        return null;
    }
    return getExpressionValue({
        type: 'Program',
        sourceType: 'module',
        body: [
            {
                type: 'ExpressionStatement',
                expression,
            },
        ],
    });
}

function processJSXAttribute(attr: JSXAttribute) {
    let value: any;

    if (attr.value === null) {
        value = true;
    } else if (attr.value.type === 'JSXExpressionContainer') {
        const expression = attr.value.expression;
        if (expression.type === 'JSXElement') {
            value = turnEstreeJsxElementToJson(expression);
        } else {
            value = getJSXExpressionContainerValue(expression);
        }
    } else if (attr.value.type === 'JSXElement') {
        value = turnEstreeJsxElementToJson(attr.value);
    } else {
        throw new Error(`${attr.value.type} not supported`);
    }

    return value;
}

export function processJSXChild(
    child:
        | JSXFragment
        | JSXElement
        | JSXExpressionContainer
        | JSXText
        | JSXSpreadChild,
) {
    if (child.type === 'JSXElement') {
        return turnEstreeJsxElementToJson(child);
    }
    if (child.type === 'JSXExpressionContainer') {
        return getJSXExpressionContainerValue(child.expression);
    }
    if (child.type === 'JSXText') {
        return child.value;
    }
    if (child.type === 'JSXFragment') {
    }

    throw new Error(`${child.type} not supported`);
}

export function turnEstreeJsxElementToJson(
    element: ExpressionMap['JSXElement'],
): JsonNode {
    return {
        component: getJSXName(element.openingElement.name),
        props: element.openingElement.attributes.reduce((result, attr) => {
            if (attr.type === 'JSXSpreadAttribute') {
                throw new Error('JSXSpreadAttribute not supported');
            }

            const value = processJSXAttribute(attr);

            return {
                ...result,
                [attr.name.name as string]: value,
            };
        }, {} as Record<string, any>),
        children: element.children.map((child) => processJSXChild(child)),
    };
}
