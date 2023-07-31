# @directwines/cork

A CLI that provides utilities for the direct wines FE team.

<div align="center">
<img  src="docs/imgs/cork-guy.png">
</div>

## Installation

**NOTE**: This project is still very much in early development. In the future, we plan to publish this package to a registry to make consuming and installation easier. For now, please follow the instructions below to use this tool.

### Requirements

This project relies on the following dependencies:

- Node.js `V12.22.1`

### Instructions

**Start with this project**

1) Start by cloning this repo

```bash
$ git clone https://github.com/dw-front-end-engineering/cork.git
```

2) [optional] If you haven't already, switch your node version. You can find the current node version for this project in a `.nvmrc`

3) install the project dependencies

npm:
```bash
$ npm install
```

yarn:
```bash
$ yarn
```

4) Run the build for this project using your chosen package manager

npm:
```bash
npm run build
```

yarn:
```bash
yarn build
```

Once the build is complete, you can start to work from your consuming repo.

1) Once you're in the context of your current repo, you can install using your chosen package manager:

npm:
```bash
npm install ../path/to/cork/project
```

yarn:
```bash
yarn add ../path/to/cork/project
```

2) When the package is finished installing, make sure you run all commands within the context of your node env. The best way to do this is to add a simple script to your package.json `scripts` to make sure it's running in the correct context

Example:

```json
{
    ...
    "main": "index.js",
    "license": "MIT",
    "scripts": {
        ...
        "release": "cork react-release"
        ...
    },
    ...
}
```

### Commands

React Release

```bash
Usage: cork react-release

Options:
  -h, --help               Show help                                   [boolean]
  -r, --remote-name        If you are not using origin as your remote name, you
                           can specify it here.              [default: "origin"]
  -u, --upgrade-deps       Parses the package.json and upgrades all direct-wines
                           dependencies to the latest version   [default: false]
      --dry-run, --dry     Runs the necessary commands with no remote changes.
                           Undoing any local changes at the end of the process.
                           Useful for testing.                  [default: false]
      --with-yarn, --yarn  Uses the yarn package-manager to upgrade
                           dependencies.                        [default: false]
  -v, --version            Show version number                         [boolean]

Examples:
  cork react-release                 Basic usage.
  cork react-release --upgrade-deps  Create a release branch and upgrade all
                                     direct-wines dependencies to the latest
                                     version.

```

