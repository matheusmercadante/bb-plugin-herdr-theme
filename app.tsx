import { definePluginApp } from "@get-bb/plugin-sdk/app";
import { BranchDetails } from "./branch-details";
import { mountChrome } from "./chrome";
import "./font.css";
import "./chrome.css";
import "./composition.css";
import "./sidebar.css";

import { PalettePicker } from "./palette-picker";
import "./palette-picker.css";

// BB 0.46 removed the experimental sidebarNavigation slot. Registering it
// threw during setup, which stopped every slot, content script, and stylesheet
// below from loading. BB's navigation rail now owns those commands.
export default definePluginApp((app) => {
  app.contentScripts.register({ id: "terminal-chrome", mount: mountChrome });
  app.slots.experimental_appOverlay({ id: "branch-details", component: BranchDetails });
  app.slots.settingsSection({ id: "about", title: "Color schemes", component: PalettePicker });
});
