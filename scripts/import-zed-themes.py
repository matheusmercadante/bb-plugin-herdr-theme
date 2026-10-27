"""Import Zed themes as Herdr palette records and code themes.

Reads Zed theme JSON (the installed extension files), writes the palette
records to palettes/zed.json in the same shape as palettes/herdr.json, and a
VS Code theme per side for code highlighting. generate-palettes.py then maps
the records to BB roles like every other family.

Usage: python3 scripts/import-zed-themes.py [zed-extensions-dir]
"""
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ZED = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.home() / 'Library/Application Support/Zed/extensions/installed'

# (record key, theme file, theme name, code theme output, border mix)
# Border mix is lower than Herdr's 0.2: these themes are drawn borderless in
# Zed, so the frames stay, only quieter.
SOURCES = [
    ('matte_black', 'matte-black/themes/matte-black.json', 'Matte Black', 'themes/matte-black-code-dark.json', 0.12),
    ('matt_white', 'matt-white-theme/themes/matt-white.json', 'Matt White', 'themes/matte-black-code-light.json', 0.12),
]

def rgb(h): return [int(h[i:i + 2], 16) for i in (1, 3, 5)]
def mix(a, b, t): return '#' + ''.join(f'{round(x * (1 - t) + y * t):02x}' for x, y in zip(rgb(a), rgb(b)))
def hex6(value): return value[:7].lower()

def load(path, name):
    data = json.loads((ZED / path).read_text(), strict=False)
    return next(theme for theme in data['themes'] if theme['name'] == name)

def record(theme, border_mix):
    s = theme['style']
    dark = theme.get('appearance') == 'dark'
    bg = hex6(s['background'])
    return {
        'accent': hex6(s['text.accent']),
        'panel_bg': bg,
        'active_row_bg': hex6(s['editor.active_line.background']),
        'selection_bg': hex6(s['surface.background']),
        'surface0': hex6(s['element.background']),
        'surface1': hex6(s['surface.background']),
        'surface_dim': mix(bg, '#000000' if dark else '#ffffff', 0.3),
        'overlay0': hex6(s['hint']),
        'overlay1': hex6(s['icon.muted']),
        'text': hex6(s['text']),
        'subtext0': hex6(s['text.muted']),
        'mauve': hex6(s['terminal.ansi.magenta']),
        'green': hex6(s['terminal.ansi.green']),
        'yellow': hex6(s['terminal.ansi.yellow']),
        'red': hex6(s['error']),
        'blue': hex6(s['terminal.ansi.blue']),
        'teal': hex6(s['terminal.ansi.cyan']),
        'peach': hex6(s['warning']),
        'border_mix': border_mix,
    }

# Zed syntax capture -> TextMate scopes. Generic first; later rules win.
SCOPES = [
    ('variable', ['variable', 'meta.definition.variable']),
    ('variable.parameter', ['variable.parameter']),
    ('variable.builtin', ['variable.language']),
    ('property', ['variable.other.property', 'variable.other.object.property', 'support.variable.property', 'meta.object-literal.key']),
    ('constant', ['constant', 'support.constant', 'variable.other.constant']),
    ('number', ['constant.numeric']),
    ('boolean', ['constant.language.boolean']),
    ('string', ['string']),
    ('string.escape', ['constant.character.escape']),
    ('string.regexp', ['string.regexp']),
    ('string.special.url', ['markup.underline.link']),
    ('keyword', ['keyword', 'keyword.control', 'storage', 'storage.type', 'storage.modifier']),
    ('operator', ['keyword.operator']),
    ('keyword.operator', ['keyword.operator.new', 'keyword.operator.expression', 'keyword.operator.logical.python']),
    ('keyword.directive', ['keyword.control.directive', 'meta.preprocessor']),
    ('keyword.export', ['keyword.control.export']),
    ('function', ['entity.name.function']),
    ('function.call', ['meta.function-call entity.name.function', 'meta.function-call.generic', 'support.function']),
    ('function.method', ['entity.name.function.member', 'meta.method-call entity.name.function']),
    ('function.builtin', ['support.function.builtin']),
    ('function.decorator', ['meta.decorator', 'entity.name.function.decorator']),
    ('type', ['entity.name.type', 'entity.name.class', 'support.type', 'support.class', 'entity.other.inherited-class']),
    ('type.builtin', ['support.type.primitive', 'support.type.builtin']),
    ('constructor', ['entity.name.function.constructor', 'new.expr entity.name.type']),
    ('namespace', ['entity.name.namespace', 'entity.name.module']),
    ('punctuation', ['punctuation', 'meta.brace']),
    ('tag', ['entity.name.tag']),
    ('tag.attribute', ['entity.other.attribute-name']),
    ('comment', ['comment', 'punctuation.definition.comment']),
    ('title', ['markup.heading', 'entity.name.section']),
    ('emphasis.strong', ['markup.bold']),
    ('emphasis', ['markup.italic']),
    ('text.literal', ['markup.inline.raw', 'markup.fenced_code']),
    ('link_text', ['string.other.link']),
    ('punctuation.list_marker', ['punctuation.definition.list.begin.markdown']),
    ('diff.plus', ['markup.inserted']),
    ('diff.minus', ['markup.deleted']),
]

def code_theme(theme):
    s = theme['style']
    syntax = s.get('syntax', {})
    rules = []
    for capture, scopes in SCOPES:
        entry = syntax.get(capture)
        if not entry or not entry.get('color'):
            continue
        settings = {'foreground': hex6(entry['color'])}
        styles = []
        if entry.get('font_style') == 'italic':
            styles.append('italic')
        if (entry.get('font_weight') or 0) >= 600:
            styles.append('bold')
        if styles:
            settings['fontStyle'] = ' '.join(styles)
        rules.append({'name': capture, 'scope': scopes, 'settings': settings})
    return {
        'name': theme['name'],
        'type': theme.get('appearance', 'dark'),
        'colors': {
            'editor.background': hex6(s['editor.background']),
            'editor.foreground': hex6(s['editor.foreground']),
            'editorLineNumber.foreground': hex6(s['editor.line_number']),
            'editor.lineHighlightBackground': hex6(s['editor.active_line.background']),
            'editor.selectionBackground': s['players'][0]['selection'],
        },
        'tokenColors': rules,
    }

records = {}
for key, path, name, output, border_mix in SOURCES:
    theme = load(path, name)
    records[key] = record(theme, border_mix)
    (ROOT / output).write_text(json.dumps(code_theme(theme), indent=2) + '\n')
(ROOT / 'palettes/zed.json').write_text(json.dumps(records, indent=2) + '\n')
print(f'Imported {len(records)} Zed themes into palettes/zed.json and their code themes.')
