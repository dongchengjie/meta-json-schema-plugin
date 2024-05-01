## 使用方法

### YAML 文件

- 不可直接视为 Clash.Meta 配置文件。
- 支持的文件扩展名为 `.yaml`、`.yml`、 `.txt`。
- 要求文件首行含有 `clash` 字样注释，以区分其他 YAML 文件。

### Clash 文件

- 可直接视为 Clash.Meta 配置文件。
- 支持的文件扩展名为 `.clash`、`.clash.meta`。

## 配置

| 配置项                       | 说明                                                     | 默认值                                                                                          |
| ---------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `meta-json-schema.schemaURL` | 自定义 `schema` 文件地址（无法获取 `schema` 文件时使用） | https://fastly.jsdelivr.net/gh/dongchengjie/meta-json-schema@main/schemas/meta-json-schema.json |
