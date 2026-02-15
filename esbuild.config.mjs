import esbuild from "esbuild";
import builtins from "builtin-modules";

const isWatch = process.argv.includes("--watch");

const buildOptions = {
  entryPoints: ["main.ts"],
  bundle: true,
  external: ["obsidian", "electron", ...builtins],
  format: "cjs",
  target: "es2018",
  outfile: "main.js",
  platform: "node",
  sourcemap: "inline",
  treeShaking: true,
  logLevel: "info",
};

if (isWatch) {
  const context = await esbuild.context(buildOptions);
  await context.watch();
  console.log("Watching for changes...");
} else {
  await esbuild.build(buildOptions);
}
