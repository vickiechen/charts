import Ember from 'ember';
import ChartMixinMixin from 'charts/mixins/chart-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | chart mixin');

// Replace this with your real tests.
test('it works', function(assert) {
  let ChartMixinObject = Ember.Object.extend(ChartMixinMixin);
  let subject = ChartMixinObject.create();
  assert.ok(subject);
});
