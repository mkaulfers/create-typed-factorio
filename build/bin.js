"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const meow_1 = __importDefault(require("meow"));
const path_1 = require("path");
const _1 = require(".");
const cli = meow_1.default(`
  Usage
    $ yarn create typed-factorio <project-name>

  Options
    --dirname, -d  directory to create the project in
    --factorioVersion, -V  factorio version

  Examples
    $ yarn create typed-factorio destroy-all-biters
`, {
    flags: {
        dirname: {
            type: "string",
            alias: "d",
        },
        factorioVersion: {
            type: "string",
            alias: "V",
        },
    },
});
async function go() {
    const projectName = cli.input[0];
    if (!projectName || typeof projectName !== "string")
        throw new Error(`invalid projectName ${projectName}`);
    const config = {
        dirname: cli.flags.dirname || path_1.resolve(process.cwd(), projectName),
        projectName,
        factorioVersion: cli.flags.factorioVersion || "latest",
    };
    try {
        await _1.create(config);
    }
    catch (err) {
        console.error(`Failed to create new project: ${projectName}\n\n\n`);
        console.error(err);
        process.exit(1);
    }
}
go();
//# sourceMappingURL=bin.js.map