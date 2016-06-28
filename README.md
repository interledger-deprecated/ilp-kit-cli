# ilp-nerd-client

> Utility scripts to create a trustline on ILP

## Installation

```sh
npm install --save ilp-nerd-client
```

## Usage

### Configuring

To create a trustline, you must first create configs for the ledgers that you
wish to use. The `nerd-config` tool is made for this purpose. To use a
five-bells-ledger account, run: `nerd-config -t bells -o five-bells.json`.  To
create a config for a trustline, run `nerd-config -t virtual -o
trustline.json`.  You can use `nerd-config -h` to see more options.

Now go into the two files that were created: `five-bells.json` and `trustline.json`.
They have partially completed configurations for creating their plugins. Fill in
the necessary fields in a text editor.

### Running

Once you have filled in the config files, you can launch your nerd connector.
Run `nerd-run five-bells.json trustline.json` to start the connector. The JSON
files will be passed into the `CONNECTOR_CREDENTIALS` field in the connector.
