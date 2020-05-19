'use strict';

const cdk = require('@aws-cdk/core');

const util = require('util');
const assert = require('assert');
const traverse = require('traverse');
const { startCase } = require('lodash');

class Parameters extends cdk.Construct {
  /**
   * Converts the input JS object into CloudFormation parameters
   * If you access something in "params" by "params.some.value", you can access
   * its CloudFormation parameter equivalent with "this[Param:SomeValue]".
   * @param {cdk.Construct} scope cdk scope object
   * @param {string} id cdk string id
   * @param {object} params JS object to be converted into CFN parameters
   */
  constructor(scope, id, params) {
    super(scope, id);

    const self = this;
    traverse(params).forEach(function (val) {
      if (this.isLeaf && /[a-zA-Z0-9]/g.test(this.key)) {
        assert.ok(util.isString(val) || util.isNumber(val));
        const key = this.path.map(startCase).join('').replace(' ', '');
        self[`Param:${key}`] = new cdk.CfnParameter(self, key, {
          description: startCase(key),
          type: startCase(typeof val),
          default: val,
        });
      }
    });
  }
}

module.exports = Parameters;
