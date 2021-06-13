import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import svelte from "rollup-plugin-svelte";
import zip from "rollup-plugin-zip";
import postcss from "rollup-plugin-postcss";
import { terser } from "rollup-plugin-terser";
import sveltePreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
import url from '@rollup/plugin-url';

// const production = !process.env.ROLLUP_WATCH;
const production = false;

const commonConfig = {
  // output: {
  //   dir: "dist",
  //   format: "esm",
  //   preserveModules: true,
  //   preserveModulesRoot: 'src'
  // },
  plugins: [
    svelte({
      preprocess: sveltePreprocess(),
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production,
      },
    }),
    postcss({ extract: true, minimize: production }),
    // the plugins below are optional
    resolve({
      dedupe: ["svelte"],
    }),
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    commonjs(),
    typescript({ sourceMap: false }),
    url({ limit: 0, fileName: 'assets/[name][extname]', publicPath: '/' }),
    // If we're building for production, minify
    production && terser(),
    // Outputs a zip file in ./releases
    production && zip({ dir: "releases" }),
  ],
};

export default [
{
  input: ['src/background/index.ts'],
  output: {
    file: "dist/background/index.js",
    format: "esm",
  },
  ...commonConfig,
},
{
  input: ['src/content/index.ts'],
  output: {
    file: "dist/content/index.js",
    format: "esm",
  },
  ...commonConfig,
},
{
  input: ['src/popup/index.ts'],
  output: {
    file: "dist/popup/index.js",
    format: "esm",
  },
  ...commonConfig,
},
{
  input: ['src/options/index.ts'],
  output: {
    file: "dist/options/index.js",
    format: "esm",
  },
  ...commonConfig,
},
];
