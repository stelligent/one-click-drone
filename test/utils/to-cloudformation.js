'use strict';

const cdk = require('@aws-cdk/core');

/**
 * Returns a JSON representation of the input CDK stack. Suitable for testing.
 * @param {cdk.Stack} stack
 */
function toCloudFormation(stack) {
  return cdk.ConstructNode.synth(stack.node, {
    skipValidation: true,
  }).getStackByName(stack.stackName).template;
}

module.exports = { toCloudFormation };
