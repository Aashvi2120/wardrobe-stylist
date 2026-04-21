const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const outDir = path.join(projectRoot, "static-build");

function clean() {
  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
}

function exportWeb() {
  console.log("Exporting Expo web build → static-build/");
  const result = spawnSync(
    "pnpm",
    ["exec", "expo", "export", "--platform", "web", "--output-dir", "static-build"],
    {
      cwd: projectRoot,
      stdio: "inherit",
      env: { ...process.env, CI: "true" },
    },
  );
  if (result.status !== 0) {
    console.error("expo export failed");
    process.exit(result.status || 1);
  }
}

function ensureIndex() {
  const indexPath = path.join(outDir, "index.html");
  if (!fs.existsSync(indexPath)) {
    console.error("Build did not produce static-build/index.html");
    process.exit(1);
  }
  console.log("Web build complete:", outDir);
}

clean();
exportWeb();
ensureIndex();
