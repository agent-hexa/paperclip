import type { PaperclipPluginManifestV1 } from "@paperclipai/plugin-sdk";

/**
 * Stable plugin ID used by host registration and namespacing.
 *
 * Vendored from https://github.com/gcampton/Agent-Pixels unchanged so an
 * existing install of the standalone plugin keeps the same plugin key.
 */
export const PLUGIN_ID = "agent-pixels.camera";
export const PLUGIN_VERSION = "0.1.0";
export const PAGE_ROUTE = "agent-pixels";

export const SLOT_IDS = {
  sidebar: "agent-pixels-sidebar",
  page: "agent-pixels-camera-page",
  settingsPage: "agent-pixels-settings-page",
} as const;

export const EXPORT_NAMES = {
  sidebar: "AgentPixelsSidebarLink",
  page: "AgentPixelsCameraPage",
  settingsPage: "AgentPixelsSettingsPage",
} as const;

/**
 * UI-only plugin: a security-camera pixel office that renders the company's
 * agents, plus a settings page for assigning character sprites.
 *
 * `displayName` and `description` must stay plain string literals — the host
 * bundled-plugin catalog scrapes them out of this source file with a regex.
 */
const manifest: PaperclipPluginManifestV1 = {
  id: PLUGIN_ID,
  apiVersion: 1,
  version: PLUGIN_VERSION,
  displayName: "Agent Pixels",
  description:
    "Live security-camera pixel office for Paperclip companies. A Paperclip plugin port of Pixel-Agents by Pablo De Lucca.",
  author: "gcampton",
  categories: ["ui"],
  capabilities: [
    "companies.read",
    "agents.read",
    "instance.settings.register",
    "ui.sidebar.register",
    "ui.page.register",
  ],
  entrypoints: {
    worker: "./dist/worker.js",
    ui: "./dist/ui",
  },
  ui: {
    slots: [
      {
        type: "sidebar",
        id: SLOT_IDS.sidebar,
        displayName: "Agent Pixels",
        exportName: EXPORT_NAMES.sidebar,
      },
      {
        type: "page",
        id: SLOT_IDS.page,
        displayName: "Agent Pixels",
        exportName: EXPORT_NAMES.page,
        routePath: PAGE_ROUTE,
      },
      {
        type: "settingsPage",
        id: SLOT_IDS.settingsPage,
        displayName: "Agent Pixels Settings",
        exportName: EXPORT_NAMES.settingsPage,
      },
    ],
  },
};

export default manifest;