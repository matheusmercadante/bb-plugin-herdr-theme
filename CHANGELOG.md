# Changelog

## 0.7.0

- Add Herdr Matte Black: the Zed themes Matte Black (dark) and Matt White
  (light) with Herdr terminal styling, quieter borders, and code highlighting
  imported from the Zed syntax colors.
- Add `scripts/import-zed-themes.py`, which reads installed Zed themes into
  palette records and VS Code code themes for the generator.

## 0.6.1

Compatibility fix for BB 0.47.

- List the rail destinations and Settings in the commands-line menu again.
  BB 0.47 wraps the navigation rail in its `<nav>` instead of nesting one
  inside it, and moved Settings out of the footer row, so the menu opened
  empty and plugin pages were unreachable while the rail was hidden.

## 0.6.0

Compatibility release for BB 0.46. Requires BB 0.46 or newer.

- Stop registering the sidebar navigation slot, which BB 0.46 removed. The
  failed registration aborted plugin setup, so BB loaded only the palette
  colors and none of the framing, prompt, sidebar, or settings UI.
- Rebuild the commands line with a content script: new thread, search
  threads, and a menu listing BB's rail destinations and Settings. While it
  shows, the expanded desktop sidebar hides BB's navigation rail, New thread
  row, and icon footer; the menu reveals that footer. Phones and the
  collapsed sidebar keep BB's native chrome.
- Frame the conversation column BB 0.46 renders: the split pane itself for a
  single pane, and the pane's inner column in split layouts.
- Cut the frame line behind the new header action group.
- Match sidebar rows whose thread link is nested in the row, and the selected
  row through `.bb-sidebar-selected-row`.
- Hide the per-row provider logo BB 0.46 added, keeping one line per thread.
- Add a Text size setting (90–130%). It scales the root font size instead of
  page zoom, so BB's window controls stay aligned with the macOS traffic
  lights. Text-related theme lengths move to rem so they scale with it.
- Hide the sidebar toggle while the expanded sidebar shows the command line.
  It returns when the sidebar is collapsed.
- Repin `@get-bb/plugin-sdk` to 0.6.49 and type-check every source file.

## 0.5.0

First public release.

- Eleven palette families with light and dark appearances.
- Bundled JetBrains Mono, framed panes, and full-width transcripts.
- Highlighted user messages and compact prompts.
- Terminal child-thread connectors and native activity indicators.
- Optional branch names and a native settings palette picker.
- Responsive input spacing and native mobile controls.

Workspace management is outside this theme's scope.
