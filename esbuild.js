/* eslint-disable @typescript-eslint/no-var-requires */
require("esbuild")
  .build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    sourcemap: true,
    platform: "node",
    outdir: "dist",
    watch: true,
  })
  .then(() => {
    console.log("Successfully built.");
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
