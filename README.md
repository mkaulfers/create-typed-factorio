
# create-typed-factorio

A tool to build a starting point for developing mods with factorio. The package includes scripts that allow you to quickly create and deploy a mod, developed in TypeScript, for Factorio.

## Dependencies
- [Node.js](https://nodejs.org/en/)

## Installation
First, you need to have [yarn](https://yarnpkg.com/getting-started/install) installed, you can install it with the following command:
`npm install -g yarn` 

Once you have yarn installed, you can install `create-typed-factorio` with the following command:
`yarn add create-typed-factorio` 

## Usage
To create a new mod, navigate to the directory where you want to create the mod and run the following command:
`yarn create typed-factorio <yourModName>` 

This will create a new directory in the current directory with the name of the mod. The directory will contain all the necessary files to start developing a new mod.

## Scripts
The following scripts are contained in the generated files:

-   `yarn build` - compiles the TypeScript files into Lua and places the files into the `src/` directory.
-   `yarn watch` - watches the TypeScript files and recompiles them when they change. Also places them into the `src/` directory. 
-   `yarn deploy` - creates a compressed mod file that is ready for release. If you do not modify the `--dest` flag on the gulp script, it will be placed into the `deplyment/` directory, otherwise the directory you specify.

To run any of these scripts, navigate to the mod directory and run the script using yarn. For example, to build the mod, run the following command from `yourProjectDestination/`:
`yarn build` 

### Building to the Factorio directory
To build and deploy a mod to the Factorio directory, use the `--dest` flag with the `yarn deploy` command. For example, to build and deploy a mod to the directory `C:\your\factorio\mods`, modify the script `"deploy: ..."` located in the generated `package.json`. An example might look something like this :

`"deploy":  "yarn copy:infoJSON && gulp compress --dest=C:\your\factorio\mods"` 

## Attribution
This package is based on the work of [GlassBricks](https://github.com/GlassBricks/typed-factorio) and [cdaringe](https://github.com/cdaringe/create-factorio-mod/).