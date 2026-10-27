import type { PluginContentScriptContext } from "@get-bb/plugin-sdk/app";

/** BB 0.46 removed the sidebar navigation slot and added a navigation rail,
    a New thread row, and an icon footer. Rebuild Herdr's command line at the
    foot of the stock sidebar. Every command runs BB's own control, so routing,
    shortcuts, and project context stay native. sidebar.css hides the rail,
    row, and footer only while this bar is shown. */

const isMac = /Mac|iPhone|iPad/.test(navigator.platform);
const shortcutSuffix = /\s*\([^)]*\)\s*$/;

function pressShortcut(key: string, code: string, shiftKey = false) {
  document.dispatchEvent(new KeyboardEvent("keydown", {
    key, code, shiftKey, metaKey: isMac, ctrlKey: !isMac, bubbles: true, cancelable: true,
  }));
}

function commandButton(label: string, title: string, run: () => void) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.title = title;
  button.addEventListener("click", run);
  return button;
}

/** Rail destinations and Settings, read when the menu opens. BB 0.47 wraps
    the rail in its `<nav>` instead of nesting one inside, and moved Settings
    out of the footer row, so neither wrapper is required. Home is the New
    thread command above. */
function menuSources() {
  const rail = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-testid="app-nav-rail"] button[aria-label]'))
    .filter(button => !["Home", "More"].includes(button.getAttribute("aria-label") ?? ""));
  const settings = document.querySelector<HTMLButtonElement>(
    '[data-testid="sidebar-footer-row"] button[aria-label^="Settings"], [data-sidebar="sidebar"] button[aria-label^="Settings"]',
  );
  return settings ? [...rail, settings] : rail;
}

export function mountSidebarCommands({ signal }: PluginContentScriptContext) {
  const bar = document.createElement("nav");
  bar.className = "herdr-commands";
  bar.setAttribute("aria-label", "Workspace commands");

  const menu = document.createElement("div");
  menu.className = "herdr-command-menu";
  menu.id = "herdr-command-menu";
  menu.setAttribute("role", "group");
  menu.setAttribute("aria-label", "Workspace menu");
  menu.hidden = true;

  const row = document.createElement("div");
  row.className = "herdr-commands-row";
  const shortcut = isMac ? "⌘" : "Ctrl+";
  const trigger = commandButton("Menu", "Menu", () => (menu.hidden ? open() : close()));
  trigger.dataset.herdrMenuTrigger = "";
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-controls", menu.id);
  row.append(
    commandButton("New thread", `New thread (${isMac ? "⇧⌘O" : "Ctrl+Shift+O"})`, () => {
      close();
      const native = document.querySelector<HTMLButtonElement>('[data-testid="nav-rail-header"] button');
      if (native) native.click();
      else pressShortcut("o", "KeyO", true);
    }),
    commandButton("Search threads", `Search threads (${shortcut}K)`, () => {
      close();
      pressShortcut("k", "KeyK");
    }),
    trigger,
  );
  bar.append(menu, row);

  function open() {
    menu.replaceChildren(...menuSources().map(source => {
      const label = (source.getAttribute("aria-label") ?? "").replace(shortcutSuffix, "");
      const item = commandButton(label, label, () => {
        close();
        source.click();
      });
      if (source.getAttribute("aria-current") === "page") item.setAttribute("aria-current", "page");
      return item;
    }));
    menu.hidden = false;
    bar.dataset.open = "";
    trigger.setAttribute("aria-expanded", "true");
  }

  function close() {
    if (menu.hidden) return;
    menu.hidden = true;
    menu.replaceChildren();
    delete bar.dataset.open;
    trigger.setAttribute("aria-expanded", "false");
  }

  bar.addEventListener("keydown", event => {
    if (event.key === "Escape" && !menu.hidden) {
      close();
      trigger.focus();
    }
  });
  // Clicks in BB's revealed footer, and the popovers and dialogs it opens,
  // keep the menu open; anything else closes it.
  const onPointerDown = (event: PointerEvent) => {
    const target = event.target;
    if (menu.hidden || !(target instanceof Element)) return;
    if (target.closest('.herdr-commands, [data-testid="sidebar-footer-row"], [data-radix-popper-content-wrapper], [role="dialog"]')) return;
    close();
  };
  document.addEventListener("pointerdown", onPointerDown, true);

  let frame = 0;
  const place = () => {
    frame = 0;
    const sidebar = document.documentElement.hasAttribute("data-herdr-theme")
      ? document.querySelector<HTMLElement>('[data-sidebar="sidebar"]')
      : null;
    if (!sidebar) {
      close();
      bar.remove();
    } else if (bar.parentElement !== sidebar || bar.nextElementSibling !== null) {
      sidebar.append(bar);
    }
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(place);
  };
  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-herdr-theme"] });
  observer.observe(document.body, { childList: true, subtree: true });
  place();

  const dispose = () => {
    observer.disconnect();
    cancelAnimationFrame(frame);
    document.removeEventListener("pointerdown", onPointerDown, true);
    bar.remove();
    signal.removeEventListener("abort", dispose);
  };
  signal.addEventListener("abort", dispose, { once: true });
  if (signal.aborted) dispose();
  return dispose;
}
