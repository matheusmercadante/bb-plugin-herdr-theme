import type { BbPluginApi } from "@get-bb/plugin-sdk";
import { contract } from "./contract";
export default function herdrTheme(bb: BbPluginApi) {
  bb.settings.define({
    showBranches: { type: "boolean", label: "Show branch names", default: false,
      description: "Show BB's known Git branch beneath stock sidebar threads. Non-repository threads stay single-line." },
    textSize: { type: "select", label: "Text size", default: "100",
      options: ["90", "100", "110", "120", "130"],
      experimental_optionLabels: { "90": "90%", "100": "100% (BB default)", "110": "110%", "120": "120%", "130": "130%" },
      description: "Scale BB's text and spacing without page zoom, so the window controls stay aligned with the macOS traffic lights." },
  });
  bb.rpc.register(contract, {
    select: async id => (await bb.sdk.theme.set(id)).themeId,
  });
}
