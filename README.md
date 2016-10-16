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

In order to configure a connector, all you have to do is run
`ilp-connector-config -o connector.list`. This will create an environment file
called `connector.list`, which can be used by Docker (see '**Running**').  A
command-line interface will walk you through the required steps.

First, the CLI will ask for some general options. These options will be
assigned to the environment variables specified in [ILP-connector's
README](https://github.com/interledgerjs/ilp-connector). You can see and change
these settings by reading `connector.list` after `ilp-connnector-config` is
done.

Next, the CLI will prompt you for the number of plugins your connector will
use. Plugin-specific questions will be asked in order to create appropriate
configurations for each plugin. Note that if your `id`s are not unique, then
you may overwrite other plugins. You can edit the final output in the
`CONNECTOR_LEDGERS` field of `connector.list`. It is output in the form of a
stringified JSON object.

### Running

The environment file output by `ilp-connector-config` can be used by docker
in order to start a connector. Just run:

```sh
$ docker run -it --rm --env-file ./connector.list interledgerjs/ilp-connector
```

#### Giving access to others

To run a connector which can be connected to from different machines, you will
need to forward your ports. You can use [localtunnel](https://localtunnel.github.io/www/)
to temporarily do this without requiring remote hosting or network configuration.
Just run:

```sh
$ lt --port 4444
your url is: http://senedqjwk.localtunnel.me
```

If you are configuring a new connector, then enter that URL when it prompts for
your public URI. Otherwise, go into your existing environment file and change
the line:

```sh
CONNECTOR_PUBLIC_URI= #.....
```

to:

```sh
# write the URL that you got from the previous step instead of this URL
CONNECTOR_PUBLIC_URI=http://senedqjwk.localtunnel.me
```
