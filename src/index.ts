import { Config } from "./config";
import { promises as fs } from "fs";
import { resolve } from "path";
import execa from "execa";

const asInstallString = (deps: Record<string, string>) =>
  Object.entries(deps)
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

const getPaths = (config: Config) => {
  return {
    packageJson: resolve(config.dirname, "package.json"),
    readme: resolve(config.dirname, "readme.md"),
    tsconfig: resolve(config.dirname, "tsconfig.json"),
    gulpfile: resolve(config.dirname, "gulpfile.js"),
    mod: {
      infoJson: resolve(config.dirname, "src", "info.json"),
      changelog: resolve(config.dirname, "src", "changelog.txt"),
      thumbnail: resolve(config.dirname, "src", "thumbnail.png"),
      settings: resolve(config.dirname, "src", "settings.ts"),
      settingsUpdates: resolve(config.dirname, "src", "settings-updates.ts"),
      settingsFinalFixes: resolve(config.dirname, "src", "settings-final-fixes.ts"),
      data: resolve(config.dirname, "src", "data.ts"),
      dataUpdates: resolve(config.dirname, "src", "data-updates.ts"),
      dataFinalFixes: resolve(config.dirname, "src", "data-final-fixes.ts"),
      controlTs: resolve(config.dirname, "src", "control.ts"),
    },
  };
};

const defaultControlTs =
  `
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
    types: [ "typed-factorio/runtime", "@typescript-to-lua/language-extensions" ]
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

const createInfoJson = (config: Config) => ({
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

export const create = async (config: Config) => {
  await fs.mkdir(config.dirname, { recursive: true });
  const packageJson = {
    name: config.projectName,
    license: "MIT",
    devDependencies: {},
    scripts: {
      "copy:infoJSON:windows": "xcopy /Y /S /I src\\info.json build\\",
      "copy:campaigns:windows": "xcopy /Y /S /I src\\campaigns build\\campaigns",
      "copy:locale:windows": "xcopy /Y /S /I src\\locale build\\locale",
      "copy:migrations:windows": "xcopy /Y /S /I src\\migrations build\\migrations",
      "copy:scenarios:windows": "xcopy /Y /S /I src\\scenarios build\\scenarios",
      "copy:tutorials:windows": "xcopy /Y /S /I src\\tutorials build\\tutorials",
      "clean:windows": "(IF EXIST build rd /s /q build) && (IF EXIST deployment rd /s /q deployment) && exit 0",
      "deploy_windows": "yarn clean:windows && yarn build && yarn copy:infoJSON:windows && yarn copy:campaigns:windows && yarn copy:locale:windows && yarn copy:migrations:windows && yarn copy:scenarios:windows && yarn copy:tutorials:windows && gulp compress",
  
      "copy:infoJSON:unix": "cp -R src/info.json build/",
      "copy:campaigns:unix": "mkdir -p build/campaigns && cp -R src/campaigns/* build/campaigns/",
      "copy:locale:unix": "mkdir -p build/locale && cp -R src/locale/* build/locale/",
      "copy:migrations:unix": "mkdir -p build/migrations && cp -R src/migrations/* build/migrations/",
      "copy:scenarios:unix": "mkdir -p build/scenarios && cp -R src/scenarios/* build/scenarios/",
      "copy:tutorials:unix": "mkdir -p build/tutorials && cp -R src/tutorials/* build/tutorials/",
      "clean:unix": "rm -rf build/ deployment/",
      "deploy_unix": "yarn clean:unix && yarn build && yarn copy:infoJSON:unix && yarn copy:campaigns:unix && yarn copy:locale:unix && yarn copy:migrations:unix && yarn copy:scenarios:unix && yarn copy:tutorials:unix && gulp compress",
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
    fs.writeFile(
      paths.packageJson,
      JSON.stringify(packageJson, null, 2) + "\n"
    ),
    fs.writeFile(
      paths.readme,
      `# ${config.projectName}\n\nThe world's next best factorio mod!\n\nCreated with [create-typed-factorio](https://github.com/mkaulfers/create-typed-factorio).\n`
    ),
    fs.writeFile(
      paths.tsconfig,
      JSON.stringify(defaultTsconfig, null, 2) + "\n"
    ),
    fs.writeFile(paths.gulpfile, defaultGulpfile),
    fs.mkdir(resolve(config.dirname, "src")),
    fs.mkdir(resolve(config.dirname, "src", "locale")),
    fs.writeFile(resolve(config.dirname, "src", "locale", "en.cfg"), defaultLocaleCFG),
    fs.mkdir(resolve(config.dirname, "src", "scenarios")),
    fs.writeFile(resolve(config.dirname, "src", "scenarios", "info.html"), scenarioMessage),
    fs.mkdir(resolve(config.dirname, "src", "campaigns")),
    fs.writeFile(resolve(config.dirname, "src", "campaigns", "info.html"), campaignMessage),
    fs.mkdir(resolve(config.dirname, "src", "tutorials")),
    fs.writeFile(resolve(config.dirname, "src", "tutorials", "info.html"), tutorialMessage),
    fs.mkdir(resolve(config.dirname, "src", "migrations")),
    fs.writeFile(resolve(config.dirname, "src", "migrations", "info.html"), migrationsMessage),
    fs.writeFile(paths.mod.changelog, "// Changelog goes here"),
    fs.writeFile(paths.mod.thumbnail, ""),
    fs.writeFile(paths.mod.settings, "// https://lua-api.factorio.com/latest/Data-Lifecycle.html"),
    fs.writeFile(paths.mod.settingsUpdates, "// https://lua-api.factorio.com/latest/Data-Lifecycle.html"),
    fs.writeFile(paths.mod.settingsFinalFixes, "// https://lua-api.factorio.com/latest/Data-Lifecycle.html"),
    fs.writeFile(paths.mod.data, "// https://lua-api.factorio.com/latest/Data-Lifecycle.html"),
    fs.writeFile(paths.mod.dataUpdates, "// https://lua-api.factorio.com/latest/Data-Lifecycle.html"),
    fs.writeFile(paths.mod.dataFinalFixes, "// https://lua-api.factorio.com/latest/Data-Lifecycle.html"),
    fs.writeFile(paths.mod.controlTs, defaultControlTs),
    fs.writeFile(
      paths.mod.infoJson,
      JSON.stringify(createInfoJson(config), null, 2) + "\n"
    )
  ]);

  const [yarnCmd, ...yarnArgs] = `yarn add --dev ${asInstallString(
    devDependencies
  )}`.split(" ");
  await execa(yarnCmd, yarnArgs, { stdio: "inherit", cwd: config.dirname });

  console.log(
    [
      `\nYeeah Boiii! We're doing things now, it's installed, now get to coding:`,
      `  - cd "${config.dirname}"`,
      `  - yarn start`,
    ].join("\n")
  );
};
