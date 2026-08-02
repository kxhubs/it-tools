#!/usr/bin/env python3
"""
批量向 locales/en.yml 与 locales/zh.yml 的工具区块中插入新的翻译键。

用法:
    python3 scripts/insert-locale-keys.py <translations.json>

translations.json 格式:
{
  "tool-name": {
    "keyName": "英文文本",          # 写入 en.yml
    "keyName_zh": "中文文本"        # 写入 zh.yml
  },
  ...
}
其中带 `_zh` 后缀的键写入 zh.yml(去掉后缀),普通键写入 en.yml。
若同一键同时提供(如 "copied": "Copied" 与 "copied_zh": "已复制"),
则分别写入 en.yml 和 zh.yml。

脚本是幂等的:已存在的键不会被覆盖。
"""

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def read_lines(path: Path) -> list[str]:
    return path.read_text(encoding='utf-8').splitlines(keepends=True)


def write_lines(path: Path, lines: list[str]) -> None:
    path.write_text(''.join(lines), encoding='utf-8')


def find_tool_section(lines: list[str], toolname: str) -> int | None:
    """返回 `  toolname:` 所在行的索引;未找到返回 None。"""
    pattern = re.compile(rf'^  {re.escape(toolname)}:\s*$')
    for i, line in enumerate(lines):
        if pattern.match(line.rstrip('\n')):
            return i
    return None


def find_tools_section_end(lines: list[str]) -> int:
    """返回 tools 区块的结束位置(最后一个子键之后的下一行索引)。"""
    tools_idx = None
    for i, line in enumerate(lines):
        if re.match(r'^tools:\s*$', line.rstrip('\n')):
            tools_idx = i
            break
    if tools_idx is None:
        raise RuntimeError('未找到 tools: 顶层键')
    # 找到最后一个 2 空格缩进的子键(tool 区块)
    last_tool = tools_idx
    for i in range(tools_idx + 1, len(lines)):
        line = lines[i].rstrip('\n')
        if line and not line.startswith(' ') and line != '---':
            break
        if re.match(r'^  \S', line):
            last_tool = i
    # 找到该子键区块的结束
    for i in range(last_tool + 1, len(lines)):
        line = lines[i].rstrip('\n')
        if re.match(r'^  \S', line):
            return i
        if line and not line.startswith(' ') and line != '---':
            return i
    return len(lines)


def yaml_quote(value: str) -> str:
    """将值安全地转换为 YAML 单引号字符串,避免解析错误。"""
    return "'" + value.replace("'", "''") + "'"


def format_key_lines(keys: dict[str, str], indent: str = '    ') -> list[str]:
    """将键格式化为 YAML 行。带点键(如 code100.name)自动转换为嵌套结构,
    因为 vue-i18n 的 t('...code100.name') 按点号路径解析。"""
    # 分组:普通键直接输出;带点键按第一段分组
    plain = {}
    nested: dict[str, dict[str, str]] = {}
    for k, v in keys.items():
        if '.' in k:
            group, sub = k.split('.', 1)
            nested.setdefault(group, {})[sub] = v
        else:
            plain[k] = v

    lines: list[str] = []
    for k in sorted(plain):
        lines.append(f'{indent}{k}: {yaml_quote(plain[k])}\n')
    for group in sorted(nested):
        lines.append(f'{indent}{group}:\n')
        for sub in sorted(nested[group]):
            lines.append(f'  {indent}{sub}: {yaml_quote(nested[group][sub])}\n')
    return lines


def insert_keys(lines: list[str], toolname: str, keys: dict[str, str]) -> list[str]:
    """将 keys 插入到 toolname 区块(不存在则创建),返回新的行列表。"""
    tool_idx = find_tool_section(lines, toolname)

    if tool_idx is not None:
        # 在工具区块内查找已存在的键(含嵌套块),跳过重复
        existing = set()
        j = tool_idx + 1
        while j < len(lines) and (lines[j].startswith('    ') or lines[j].strip() == ''):
            m = re.match(r'^    ([A-Za-z0-9_.-]+):', lines[j])
            if m:
                existing.add(m.group(1))
            j += 1
        block_end = j

        insert_at = block_end
        # 若区块最后一行是空行,插在空行之前
        while insert_at > tool_idx and lines[insert_at - 1].strip() == '':
            insert_at -= 1

        # 跳过已存在的键(带点键按顶层分组判断)
        to_add = {}
        for k, v in keys.items():
            top = k.split('.', 1)[0]
            if top not in existing:
                to_add[k] = v
        if not to_add:
            return lines
        additions = format_key_lines(to_add)
        return lines[:insert_at] + additions + lines[insert_at:]
    else:
        # 创建新的工具区块,追加到 tools 区块末尾
        end = find_tools_section_end(lines)
        additions = [f'  {toolname}:\n'] + format_key_lines(keys)
        return lines[:end] + additions + lines[end:]


def main() -> None:
    if len(sys.argv) != 2:
        print('用法: python3 scripts/insert-locale-keys.py <translations.json>')
        sys.exit(1)

    data_path = Path(sys.argv[1])
    data = json.loads(data_path.read_text(encoding='utf-8'))

    en_lines = read_lines(ROOT / 'locales' / 'en.yml')
    zh_lines = read_lines(ROOT / 'locales' / 'zh.yml')

    for toolname, entries in data.items():
        en_keys = {k: v for k, v in entries.items() if not k.endswith('_zh')}
        zh_keys = {k[:-3]: v for k, v in entries.items() if k.endswith('_zh')}
        en_lines = insert_keys(en_lines, toolname, en_keys)
        zh_lines = insert_keys(zh_lines, toolname, zh_keys)
        print(f'✓ {toolname}: en+{len(en_keys)} zh+{len(zh_keys)}')

    write_lines(ROOT / 'locales' / 'en.yml', en_lines)
    write_lines(ROOT / 'locales' / 'zh.yml', zh_lines)
    print('完成!')


if __name__ == '__main__':
    main()
