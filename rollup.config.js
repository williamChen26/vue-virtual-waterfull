const resolve = require("rollup-plugin-node-resolve");
const vue_3 = require("rollup-plugin-vue");
const babel = require("@rollup/plugin-babel").default;
const commonjs = require("@rollup/plugin-commonjs");
const typescript = require("rollup-plugin-typescript2");
const postcss = require("rollup-plugin-postcss");
const { dependencies, peerDependencies } = require("./package.json");
const path = require("path");

const getPath = (_path) => path.resolve(__dirname, _path);

/**
 * @returns {import('rollup').RollupOptions}
 */
function getBaseConfig() {
	const vueConfig = {
		css: true,
		style: {
		preprocessOptions: {
			less: {
			javascriptEnabled: true,
			},
		},
		},
	};

	return {
		external: [
		...Object.keys(dependencies || {}),
		...Object.keys(peerDependencies || {}),
		],
		input: "./src/index.ts",
		output: {
		dir: `dist`,
		format: "esm",
		globals: {
			vue: "Vue",
		},
		//   preserveModules: true,
		//   preserveModulesRoot: "./src/",
		},
		plugins: [
			vue_3(vueConfig),
			postcss({
				// extract: "index.css",
				extensions: [".css", ".less"],
				use: [
				[
					"less",
					{
					javascriptEnabled: true,
					},
				],
				],
			}),
			typescript({
				tsconfig: getPath("./tsconfig.json"), // 导入本地ts配置
				extensions: [".js", ".ts"],
				clear: true,
				tsconfigOverride: {
				compilerOptions: { declaration: true },
				},
			}),
			resolve(),
			commonjs({}),
			babel({
				exclude: "**/node_modules/**",
			}),
		],
	};
}

const config_ue3 = getBaseConfig();

export default [config_ue3];

// async function build(config) {
//   let bundle;
//   let buildFailed = false;
//   try {
//     // create a bundle
//     bundle = await rollup(config);

//     // an array of file names this bundle depends on
//     console.log(bundle.watchFiles);
//     await bundle.generate(config.output)
//     await bundle.write(config.output);
//     // await generateOutputs(bundle);
//   } catch (error) {
//     buildFailed = true;
//     // do some error reporting
//     console.error(error);
//   }
//   if (bundle) {
//     // closes the bundle
//     await bundle.close();
//   }
// //   process.exit(buildFailed ? 1 : 0);
// }

// async function main() {
//   // await execute("npm i vue@3.0.0");
//   await build(config_ue3);
//   // await execute("npm i vue@2.6.11");
//   await build(config_ue2);
// }

// main();
