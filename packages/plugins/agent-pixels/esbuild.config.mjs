import esbuild from "esbuild";
import { createPluginBundlerPresets } from "@paperclipai/plugin-sdk/bundlers";
import { writeUiAssets } from "./scripts/write-ui-assets.mjs";

const presets = createPluginBundlerPresets({ uiEntry: "src/ui/index.tsx" });
const watch = process.argv.includes("--watch");

const contexts = [
  await esbuild.context(presets.esbuild.worker),
  await esbuild.context(presets.esbuild.manifest),
  await esbuild.context(presets.esbuild.ui),
];

if (watch) {
  await Promise.all(contexts.map((context) => context.watch()));
  console.log("esbuild watch mode enabled for worker, manifest, and ui");
} else {
  await Promise.all(contexts.map((context) => context.rebuild()));
  await Promise.all(contexts.map((context) => context.dispose()));
  // The renderer fetches sprites over HTTP at runtime, so the PNG/JSON assets
  // and the generated index have to land next to dist/ui/index.js.
  await writeUiAssets();
}