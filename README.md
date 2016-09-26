# ilp-connector-cli [![npm][npm-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/ilp-connector-cli.svg?style=flat
[npm-url]: https://npmjs.org/package/ilp-connector-cli

> Utility scripts to configure and start connectors on ILP

## Installation

```sh
npm install -g ilp-connector-cli
```

## Usage

### Configuring

To create a trustline, you must first create configs for the ledgers that you
wish to use. The `ilp-connector-config` tool is made for this purpose. To use a
five-bells-ledger account, run: `ilp-connector-config -t bells -o
five-bells.json`.  To create a config for a trustline, run
`ilp-connector-config -t virtual -o trustline.json`.  You can use
`ilp-connector-config -h` to see more options.

The `ilp-connector-config` tool will walk you through the different configuration
options, with defaults provided for each of them. From this input, it will assemble
a JSON file with the proper fields set. You can then change this file as you see
fit, although all necessary configuration has been performed.

### Running

Once you have filled in the config files, you can launch your nerd connector.
Run `ilp-connector-run five-bells.json trustline.json` to start the connector.
The JSON files will be passed into the `CONNECTOR_CREDENTIALS` field in the
connector.

#### Further connection configuration

If you want to set any of the connector's environment variables (as specified
in [the connector's
README](https://github.com/interledger/five-bells-connector#configuration),
you can prefix the command with them.

To run a connector which is compatible with the `five-bells-wallet`, run
`CONNECTOR_MAX_HOLD_TIME=100 ilp-connector-run five-bells.json trustline.json`.

#### Giving access to others

To run a connector which can be connected to from different machines, you will
need to forward your ports. You can use [localtunnel](https://localtunnel.github.io/www/).
Just run:

```sh
$ lt --port 4444
your url is: http://senedqjwk.localtunnel.me
$ CONNECTOR_PUBLIC_URI=https://senedqjwk.localtunnel.me CONNECTOR_PORT=4444 ilp-connector-run five-bells.json trustline.json
# ...
```
