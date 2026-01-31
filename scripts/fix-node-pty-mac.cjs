#!/usr/bin/env node
/**
 * On macOS, node-pty's spawn-helper can end up without execute permission after
 * npm install, causing posix_spawnp to fail. This script fixes that so the
 * PTY session stays open and waits for input.
 * node-pty 1.x uses prebuilds: prebuilds/darwin-arm64/spawn-helper and
 * prebuilds/darwin-x64/spawn-helper (not build/Release).
 */
const fs = require("fs");
const path = require("path");
const os = require("os");

if (os.platform() !== "darwin") {
  process.exit(0);
}

const nodePtyRoot = path.join(process.cwd(), "node_modules", "node-pty");
const prebuildsDir = path.join(nodePtyRoot, "prebuilds");
let fixed = 0;

function chmodSpawnHelper(dir) {
  const helper = path.join(dir, "spawn-helper");
  if (fs.existsSync(helper)) {
    try {
      fs.chmodSync(helper, 0o755);
      fixed++;
      return true;
    } catch (err) {
      console.warn("[postinstall] node-pty: could not chmod", helper, err.message);
    }
  }
  return false;
}

if (fs.existsSync(prebuildsDir)) {
  const entries = fs.readdirSync(prebuildsDir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory() && e.name.startsWith("darwin-")) {
      chmodSpawnHelper(path.join(prebuildsDir, e.name));
    }
  }
}

// Legacy path (build from source)
const legacyHelper = path.join(nodePtyRoot, "build", "Release", "spawn-helper");
if (fs.existsSync(legacyHelper)) {
  try {
    fs.chmodSync(legacyHelper, 0o755);
    fixed++;
  } catch (err) {
    console.warn("[postinstall] node-pty: could not chmod spawn-helper:", err.message);
  }
}

if (fixed > 0) {
  console.log("[postinstall] node-pty: spawn-helper set executable (macOS)");
}

process.exit(0);
