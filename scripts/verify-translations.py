#!/usr/bin/env python3
"""验证 .vue 文件中使用的 t('tools.x.y') 键在 locales/en.yml 和 locales/zh.yml 中都存在。

用法:
    python3 scripts/verify-translations.py
"""
import re
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent

en = yaml.safe_load((ROOT / 'locales' / 'en.yml').read_text(encoding='utf-8'))
zh = yaml.safe_load((ROOT / 'locales' / 'zh.yml').read_text(encoding='utf-8'))

en_tools = en.get('tools', {})
zh_tools = zh.get('tools', {})

# 收集 .vue 中所有 t('tools....') 调用
used = set()
for p in (ROOT / 'src').rglob('*.vue'):
    text = p.read_text(encoding='utf-8')
    for m in re.finditer(r"t\('(tools\.[a-zA-Z0-9_.-]+)'", text):
        used.add(m.group(1))

missing_en = []
missing_zh = []
for key in sorted(used):
    parts = key.split('.')  # tools.ns.subkey
    ns = parts[1]
    sub = parts[2]
    if ns not in en_tools or sub not in en_tools[ns]:
        missing_en.append(key)
    if ns not in zh_tools or sub not in zh_tools[ns]:
        missing_zh.append(key)

print(f'使用的键总数: {len(used)}')
print(f'en.yml 缺失: {len(missing_en)}')
for k in missing_en:
    print(f'  - {k}')
print(f'zh.yml 缺失: {len(missing_zh)}')
for k in missing_zh:
    print(f'  - {k}')

# 也检查 translate('tools....') 调用(index.ts 等)
used_tr = set()
for p in (ROOT / 'src').rglob('*.ts'):
    text = p.read_text(encoding='utf-8')
    for m in re.finditer(r"translate\('(tools\.[a-zA-Z0-9_.-]+)'", text):
        used_tr.add(m.group(1))
for key in sorted(used_tr):
    parts = key.split('.')
    ns, sub = parts[1], parts[2]
    if ns not in en_tools or sub not in en_tools[ns]:
        print(f'[translate] en.yml 缺失: {key}')
    if ns not in zh_tools or sub not in zh_tools[ns]:
        print(f'[translate] zh.yml 缺失: {key}')

# 检查 http-status-codes 的动态嵌套键(模板字符串 t(`tools.http-status-codes.code${code}.name`))
hsc_const = ROOT / 'src' / 'tools' / 'http-status-codes' / 'http-status-codes.constants.ts'
if hsc_const.exists():
    const_text = hsc_const.read_text(encoding='utf-8')
    codes = sorted(set(int(m) for m in re.findall(r'code:\s*(\d+)', const_text)))
    for code in codes:
        for sub in ('name', 'description'):
            key = f'code{code}.{sub}'
            en_hsc = en_tools.get('http-status-codes', {})
            zh_hsc = zh_tools.get('http-status-codes', {})
            en_code = en_hsc.get(f'code{code}', {}) if isinstance(en_hsc.get(f'code{code}'), dict) else {}
            zh_code = zh_hsc.get(f'code{code}', {}) if isinstance(zh_hsc.get(f'code{code}'), dict) else {}
            if sub not in en_code:
                print(f'[http-status] en.yml 缺失: tools.http-status-codes.{key}')
                missing_en.append(f'http-status-codes.{key}')
            if sub not in zh_code:
                print(f'[http-status] zh.yml 缺失: tools.http-status-codes.{key}')
                missing_zh.append(f'http-status-codes.{key}')

sys.exit(0 if not missing_en and not missing_zh else 1)
