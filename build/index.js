"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const execa_1 = __importDefault(require("execa"));
const asInstallString = (deps) => Object.entries(deps)
    .map(([k, v]) => `${k}@${v}`)
    .join(" ");
const devDependencies = {
    "gulp": "latest",
    "gulp-rename": "latest",
    "gulp-zip": "latest",
    "lua-types": "latest",
    "npm-run-all": "latest",
    "typed-factorio": "latest",
    "typescript": "latest",
    "typescript-to-lua": "latest",
    "yargs": "latest"
};
const getPaths = (config) => {
    return {
        packageJson: path_1.resolve(config.dirname, "package.json"),
        readme: path_1.resolve(config.dirname, "readme.md"),
        tsconfig: path_1.resolve(config.dirname, "tsconfig.json"),
        gulpfile: path_1.resolve(config.dirname, "gulpfile.js"),
        mod: {
            infoJson: path_1.resolve(config.dirname, "src", "info.json"),
            changelog: path_1.resolve(config.dirname, "src", "changelog.txt"),
            thumbnail: path_1.resolve(config.dirname, "src", "thumbnail.png"),
            settings: path_1.resolve(config.dirname, "src", "settings.ts"),
            settingsUpdates: path_1.resolve(config.dirname, "src", "settings-updates.ts"),
            settingsFinalFixes: path_1.resolve(config.dirname, "src", "settings-final-fixes.ts"),
            data: path_1.resolve(config.dirname, "src", "data.ts"),
            dataUpdates: path_1.resolve(config.dirname, "src", "data-updates.ts"),
            dataFinalFixes: path_1.resolve(config.dirname, "src", "data-final-fixes.ts"),
            controlTs: path_1.resolve(config.dirname, "src", "control.ts"),
        },
    };
};
const defaultControlTs = `
// To avoid type conflicts, the global tables for the settings/data stages have to be declared manually where you need them. 
// These types can be imported from typed-factorio/data/types or typed-factorio/settings/types.
\n
// import { Data, Mods } from "typed-factorio/data/types"
// or
// import { Data, Mods } from "typed-factorio/settings/types"
\n
// declare const data: Data
// declare const mods: Mods
\n
// data.extend([{ ... }])
\n
const onTick = (_evt: OnTickEvent) => {
  game.print(serpent.block({ hello: "world", its_nice: "to see you" }))
};
\n
script.on_event(defines.events.on_tick, onTick);
`.trim() + "\n";
const defaultTsconfig = {
    compilerOptions: {
        rootDir: "./src",
        outDir: "./build",
        target: "esnext",
        lib: ["esnext"],
        moduleResolution: "node",
        strict: true,
        sourceMap: false,
        types: ["typed-factorio/runtime", "@typescript-to-lua/language-extensions"]
    },
    tstl: {
        luaTarget: "JIT",
        noHeader: true,
        noImplicitSelf: true,
    },
    include: ["./**/*", "./node_modules/typed-factorio/data/types.d.ts", "gulpfile.js"],
};
const defaultGulpfile = `
const gulp = require('gulp');
const zip = require('gulp-zip');
const rename = require('gulp-rename');
const info = require('./build/info.json');
const argv = require('yargs').argv;
\n
gulp.task('compress', () => {
  const name = info.name.replace(/\s/g, '_');
  const version = info.version;
  const dest = argv.dest ? argv.dest : 'deployment';

  return gulp.src('./build/**/*')
    .pipe(zip(\`\${name}_\${version}.zip\`))
    .pipe(rename((path) => {
      if (argv.dest) {
        path.dirname = '';
      }
    }))
    .pipe(gulp.dest(dest));
});
\n
gulp.task('default', gulp.series('compress'));
`.trim() + "\n";
const defaultLocaleCFG = `
# https://wiki.factorio.com/Tutorial:Localisation
# welcome-message=Hello world
# [category]
# title=Category related title
`.trim() + "\n";
const createInfoJson = (config) => ({
    name: config.projectName,
    version: "0.0.0",
    title: config.projectName,
    author: "your-name-here",
    factorio_version: "1.1.77",
    dependencies: [],
    package: {
        scripts: {},
    },
});
const create = async (config) => {
    await fs_1.promises.mkdir(config.dirname, { recursive: true });
    const packageJson = {
        name: config.projectName,
        license: "MIT",
        devDependencies: {},
        scripts: {
            "copy:infoJSON": "cp src/info.json build/ || xcopy /Y /S src\\info.json build\\ || mkdir -p build && cp src/info.json build/",
            "deploy": "yarn copy:infoJSON && gulp compress",
            "build": "tstl",
            "watch": "tstl --watch"
        }
    };
    const scenarioUrl = "https://wiki.factorio.com/Scenario_system";
    const scenarioMessage = `Visit <a href="${scenarioUrl}">${scenarioUrl}</a> for more information on the scenario system.`;
    const campaignUrl = "https://wiki.factorio.com/Tutorial:Mod_structure";
    const campaignMessage = `Visit <a href="${campaignUrl}">${campaignUrl}</a> for more information on the campaign system.`;
    const tutorialUrl = "https://wiki.factorio.com/Prototype/Tutorial";
    const tutorialMessage = `Visit <a href="${tutorialUrl}">${tutorialUrl}</a> for more information on the tutorial system.`;
    const migrationsUrl = "https://lua-api.factorio.com/latest/Migrations.html";
    const migrationsMessage = `Visit <a href="${migrationsUrl}">${migrationsUrl}</a> for more information on migrations.`;
    const paths = getPaths(config);
    await Promise.all([
        fs_1.promises.writeFile(paths.packageJson, JSON.stringify(packageJson, null, 2) + "\n"),
        fs_1.promises.writeFile(paths.readme, `# ${config.projectName}\n\nThe world's next best factorio mod!\n\nCreated with [create-typed-factorio](https://github.com/mkaulfers/create-typed-factorio).\n`),
        fs_1.promises.writeFile(paths.tsconfig, JSON.stringify(defaultTsconfig, null, 2) + "\n"),
        fs_1.promises.writeFile(paths.gulpfile, defaultGulpfile),
        fs_1.promises.mkdir(path_1.resolve(config.dirname, "src")),
        fs_1.promises.mkdir(path_1.resolve(config.dirname, "src", "locale")),
        fs_1.promises.writeFile(path_1.resolve(config.dirname, "src", "locale", "en.cfg"), defaultLocaleCFG),
        fs_1.promises.mkdir(path_1.resolve(config.dirname, "src", "scenarios")),
        fs_1.promises.writeFile(path_1.resolve(config.dirname, "src", "scenarios", "info.html"), scenarioMessage),
        fs_1.promises.mkdir(path_1.resolve(config.dirname, "src", "campaigns")),
        fs_1.promises.writeFile(path_1.resolve(config.dirname, "src", "campaigns", "info.html"), campaignMessage),
        fs_1.promises.mkdir(path_1.resolve(config.dirname, "src", "tutorials")),
        fs_1.promises.writeFile(path_1.resolve(config.dirname, "src", "tutorials", "info.html"), tutorialMessage),
        fs_1.promises.mkdir(path_1.resolve(config.dirname, "src", "migrations")),
        fs_1.promises.writeFile(path_1.resolve(config.dirname, "src", "migrations", "info.html"), migrationsMessage),
        fs_1.promises.writeFile(paths.mod.changelog, "// Changelog goes here"),
        fs_1.promises.writeFile(paths.mod.thumbnail, ""),
        fs_1.promises.writeFile(paths.mod.settings, "// https://lua-api.factorio.com/latest/Data-Lifecycle.html"),
        fs_1.promises.writeFile(paths.mod.settingsUpdates, "// https://lua-api.factorio.com/latest/Data-Lifecycle.html"),
        fs_1.promises.writeFile(paths.mod.settingsFinalFixes, "// https://lua-api.factorio.com/latest/Data-Lifecycle.html"),
        fs_1.promises.writeFile(paths.mod.data, "// https://lua-api.factorio.com/latest/Data-Lifecycle.html"),
        fs_1.promises.writeFile(paths.mod.dataUpdates, "// https://lua-api.factorio.com/latest/Data-Lifecycle.html"),
        fs_1.promises.writeFile(paths.mod.dataFinalFixes, "// https://lua-api.factorio.com/latest/Data-Lifecycle.html"),
        fs_1.promises.writeFile(paths.mod.controlTs, defaultControlTs),
        fs_1.promises.writeFile(paths.mod.infoJson, JSON.stringify(createInfoJson(config), null, 2) + "\n")
    ]);
    const [yarnCmd, ...yarnArgs] = `yarn add --dev ${asInstallString(devDependencies)}`.split(" ");
    await execa_1.default(yarnCmd, yarnArgs, { stdio: "inherit", cwd: config.dirname });
    console.log([
        `\nYeeah Boiii! We're doing things now, it's installed, now get to coding:`,
        `  - cd "${config.dirname}"`,
        `  - yarn start`,
    ].join("\n"));
};
exports.create = create;
//# sourceMappingURL=index.js.map