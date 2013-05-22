define(function(require, exports, module) {
  var $ = require('$'),
    Widget = require('widget'),
    Templatable = require('templatable');

  var Loading = Widget.extend({
    Implements: Templatable,
    template: require('./loading.tpl'),
    model: {
      left: 0,
      top: 0,
      content: '加载中...'
    }
  });

  module.exports = Loading;
});
