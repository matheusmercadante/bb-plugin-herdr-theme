# Palette provenance

`herdr.json` contains the RGB palette records extracted from Herdr's
`src/app/state.rs` on September 13, 2026, at upstream revision
`aa961df943b874730b23f78baf94af7332f7acfa`.
Source: https://github.com/herdrdev/herdr/blob/aa961df943b874730b23f78baf94af7332f7acfa/src/app/state.rs
Herdr is Copyright Herdr contributors, distributed under Apache-2.0.
The accompanying LICENSE-herdr.txt preserves that license for the data.
The original palette names credit Catppuccin, Tokyo Night, Dracula, Nord,
Gruvbox, One, Solarized, Kanagawa, Rosé Pine, and Vesper.

Changes for BB: scripts/generate-palettes.py maps records into BB semantic
roles, supplies explicit backgrounds where terminals would inherit their host,
and adjusts text and status shades for contrast. Dracula, Nord, and Vesper
have original light companions for BB, labeled in the picker. Code highlighting
uses corresponding bundled themes when available; Tokyo Night Day and the
three BB light companions use GitHub Light as a compatible code fallback.
These are adaptations, not pixel-identical terminal palette reproductions.

Regenerate with `python3 scripts/generate-palettes.py`. The script preserves
Lavender, writes eleven theme files and the picker catalog, and records 198 text
contrast checks in design/palette-contrast.txt. Each family remains a native
BB manifest theme. Light/dark appearance remains BB's setting.

The settings picker writes BB's theme SDK through validated plugin RPC. Only
this plugin's registered palette IDs are accepted. Selection follows the palette
CSS BB applies, including updates from other clients, without polling or a second
saved preference. Navigation reads the same theme attribute.

## Matte Black (from Zed)

`zed.json` holds two records imported from the Zed themes Matte Black (dark)
and Matt White (light), read from the installed Zed extensions by
`python3 scripts/import-zed-themes.py`. The same script writes
`themes/matte-black-code-dark.json` and `themes/matte-black-code-light.json`,
VS Code themes built from the Zed syntax colors, so code keeps the editor's
highlighting. These records carry `border_mix: 0.12` instead of Herdr's 0.2:
the Zed themes are used borderless, so the frames stay but are quieter. Accent
and status shades still pass the same contrast checks, which darkens the light
amber slightly.
