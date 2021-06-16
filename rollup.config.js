import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import svelte from "rollup-plugin-svelte";
import postcss from "rollup-plugin-postcss";
import sveltePreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
import url from '@rollup/plugin-url';

const production = !process.env.ROLLUP_WATCH;

const commonConfig = {
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
  ],
};

export default [
{
  input: 'node_modules/webextension-polyfill/dist/browser-polyfill.js',
  output: {
    file: 'dist/browser-polyfill.js',
  }
},
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
