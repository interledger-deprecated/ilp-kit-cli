# ilp-kit-cli [![npm][npm-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/ilp-connector-cli.svg?style=flat
[npm-url]: https://npmjs.org/package/ilp-connector-cli

> Utility scripts to configure and start [ILP Kit](https://github.com/interledgerjs/ilp-kit)

## Installation

```sh
npm install -g ilp-connector-cli
```

## Usage

### Configuring

In order to configure ILP Kit, all you have to do is run `ilp-connector-config
-o config.list`. This will create an environment file called
`config.list`, which can be used by ILP Kit (see '**Running**').  A
command-line interface will walk you through the required steps.

If you want to configure a connector as part of your ILP Kit, the CLI will
prompt you for the number of plugins your connector will use. Plugin-specific
questions will be asked in order to create appropriate configurations for each
plugin. Note that if your `id`s are not unique, then you may overwrite other
plugins. You can edit the final output in the `CONNECTOR_LEDGERS` field of
`config.list`. It is output in the form of a stringified JSON object.

### Running

The environment file output by `ilp-connector-config` can be used to start
a ledger, UI, and connector. In the directory of ILP Kit, run:

```sh
$ sh -ac '. ./config.list ; npm start'
```

This creates a new shell in which all assigned variables are environment
variables.  In this new shell, the configuration is evaluated, setting each of
the required variables.  Then the ILP Kit is launched with `npm start`, which
reads from the environment for configuration.
