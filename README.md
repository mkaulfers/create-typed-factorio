
# create-typed-factorio

This is an `create` package for yarn (Technically installable by npm too), which would allow you to quickly buid a TypeScript -> Lua project, for developing mods with Factorio. It has some awesome built in scripts for building, cleaning, and deploying a packaged mod. (Psst, you can even deploy directly to your factorio instance, on-the-fly, for rapid iteration and testing, simply reset your scenario.) This should get you developing right out of the box, it includes all the types you would need, as well as configuing the files. When you're ready to deploy, simply remove the files you don't want from `src/` and run `yarn deploy`. Your package will be named, zipped, and ready to roll. Enjoy and please let me know if youu'd like to see any changes. 

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

## Start Developing
You'll notice there is now a `src/` directory. In there you'll find all the revelvant files, already configured in the proper structure for a mod to be packaged. Once you're done developing your mod, build it with the built in script, which will generate a new `build/` or `deployment/` directory, which will be your `lua` files that you'd traditionally use. Profit o7, and happy coding. 

## Scripts
The following scripts are contained in the generated files, all you need to do is `cd your/mod/root/dir` and then run them. Unix is for `Linux/Mac` and Windows is for... well `Windows`.

-   `yarn build_windows` or `yarn build_unix` - compiles the TypeScript files into Lua and places the files into the `build/` directory.
-   `yarn deploy_windows` or `yarn deploy_unix` - creates a compressed mod file that is ready for release. If you do not modify the `--dest` flag on the gulp script, it will be placed into the `deplyment/` directory, otherwise the directory you specify.
-   `yarn watch` - watches the TypeScript files and recompiles them when they change. Also places them into the `build/` directory. 

To run any of these scripts, navigate to the mod directory and run the script using yarn. For example, to build the mod, run the following command from `yourProjectDestination/`:
`yarn build` 

### Building to the Factorio directory
To build and deploy a mod to the Factorio directory, use the `--dest` flag with the `yarn deploy` command. For example, to build and deploy a mod to the directory `C:\your\factorio\mods`, modify the script `"deploy: ..."` located in the generated `package.json`. An example might look something like this :

`"deploy_windows": "yarn clean:windows && yarn build && yarn copy:infoJSON:windows && yarn copy:campaigns:windows && yarn copy:locale:windows && yarn copy:migrations:windows && yarn copy:scenarios:windows && yarn copy:tutorials:windows && gulp compress gulp compress --dest=C:\your\factorio\mods"` 

Or for Unix fans:

`"deploy_unix": "yarn clean:windows && yarn build && yarn copy:infoJSON:windows && yarn copy:campaigns:windows && yarn copy:locale:windows && yarn copy:migrations:windows && yarn copy:scenarios:windows && yarn copy:tutorials:windows && gulp compress gulp compress --dest=~etc\your\factorio\mods"` 

## Attribution
This package is based on the work of [GlassBricks](https://github.com/GlassBricks/typed-factorio) and [cdaringe](https://github.com/cdaringe/create-factorio-mod/).
