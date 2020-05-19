const rc = require('rc');
const debug = require('debug')('stelligent:ocd:config');
const parse = require('parse-strings-in-object');
const traverse = require('traverse');

const defaults = {
  opts: {
    runner: {
      instanceType: 't2.micro',
      maxCapacity: 10,
      sshKey: '',
    },
  },
};

/**
 * Drop-in replacement for 'rc' package with recursive type parsing
 * This also fixes the broken d.ts of rc package so vscode shows correct types
 * @template T configuration type
 * @param {string} name rc namespace
 * @param {T} defaults default configuration
 * @returns {T} read and parsed configuration
 */
function rcTyped(name, defaults) {
  debug('reading config for namespace: %s and defaults: %o', name, defaults);
  const userConfig = rc(name, defaults);
  debug('rc read configuration: %o', userConfig);
  const parsedConfig = parse(userConfig);
  debug('parsed configuration: %o', parsedConfig);
  return parsedConfig;
}

const namespace = 'ocd';
const config = rcTyped(namespace, defaults);
const flat = traverse(config).reduce(function (acc, x) {
  if (this.isLeaf && /[a-zA-Z0-9]/g.test(this.key))
    acc[`${namespace}_${this.path.join('__')}`] = `${x}`;
  return acc;
}, {});

// this is for easy accessing the env var version of the config
debug('flat configuration: %O', flat);
module.exports = config.opts;
