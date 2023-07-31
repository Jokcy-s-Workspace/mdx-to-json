# MDX to json

这个包将你的 MDX 语法，编译成 JSON 数据格式，这能够带来这些好处：

-   内容可以直接存储到数据库，并且无需`eval`即可渲染，契合所有 edge runtime
-   数据量小，只保留了`jsx`所需的参数：
    -   component (string)
    -   props
    -   children
-   JSON 对于框架没有要求，任何框架只要能够根据该数据结构渲染出内容，其就可以支持

## Aata Structure

```json
[
    {
        "relativePath": "path/to/your/mdx",
        "absoultePath": "/path/to/your/mdx",
        "slug": "relative/to/posts/dir",
        "data": {
            "frontmatter": { "a": "b" },
            "nodes": [
                {
                    "component": "A",
                    "props": { "name": "jokcy" },
                    "children": []
                }
            ]
        }
    }
]
```

## Limitation

JSON 智能存储可序列化的数据格式，所以总体上相较于 MDX 直接编译成 JS，该库有一定的限制，主要集中于 esm 相关的功能：

-   `import`
-   `export`
-   declare function
-   declare variable (binary expression maybe supported in the future)
-   scope variable invocation

你可以在 props 或者 children 中使用一些表达式，比如：

-   `{1+1}`
-   `{Data.now()}`
-   `{'a'.repeat(5)}`

对于表达式，我们直接对其进行`eval`并且把返回的值写入 value，你需要考虑其在编译时的执行结果是否符合你的预期。

## Usage

TODO

目前该包只导出了一个`mdxToJson`函数，具体如何监控本地目录，或者远端文件，则仍然在开发中。
