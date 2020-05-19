const chai = require('chai');

const cdk = require('@aws-cdk/core');
const cdkAssert = require('@aws-cdk/assert');
const Parameters = require('../lib/parameters');

describe('JS <-> CFN Parameter conversion tests', () => {
  it('should be able to convert strings and numbers', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'MyTestStack');
    const construct = new Parameters(stack, 'MyTestConstruct', {
      some: { nested: 'value' },
      a: 'number',
    });
    chai.assert.isObject(construct['Param:SomeNested']);
    chai.assert.isObject(construct['Param:A']);
    cdkAssert.expect(stack).to(
      cdkAssert.matchTemplate({
        Parameters: {
          MyTestConstructSomeNested4F788115: {
            Type: 'String',
            Default: 'value',
            Description: 'Some Nested',
          },
          MyTestConstructA90E92ED7: {
            Type: 'String',
            Default: 'number',
            Description: 'A',
          },
        },
      })
    );
  });

  it('should throw when converting non numbers or strings', () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, 'MyTestStack');
    chai.assert.throws(() => {
      const construct = new Parameters(stack, 'MyTestConstruct', {
        something: { invalid: true },
      });
    });
  });
});
