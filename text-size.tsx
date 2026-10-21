import { useEffect } from "react";
import { useSettings } from "@get-bb/plugin-sdk/app";
import { useHerdrTheme } from "./use-herdr-theme";

/** Page zoom also scales BB's window controls, which then drift below the
    macOS traffic lights. BB sizes text and spacing in rem, so scaling the root
    font size enlarges the interface while those controls stay aligned. */
export function TextSize() {
  const theme = useHerdrTheme();
  const { values } = useSettings();
  const size = theme && typeof values?.textSize === "string" ? values.textSize : null;
  useEffect(() => {
    if (size === null || size === "100") return;
    const root = document.documentElement;
    root.setAttribute("data-herdr-text-size", size);
    return () => root.removeAttribute("data-herdr-text-size");
  }, [size]);
  return null;
}
