;(function() {
  var CDN_MODULES = [
    'jquery', 'zepto', 'json', 'jasmine', 'underscore', 'handlebars',
    'seajs', 'moment', 'async', 'store', 'swfobject', 'backbone', 'raphael'
  ];

  var KJUI_MODULES = [
    'accordion', 'date-picker', 'dialog', 'grid', 'tab', 'tree'
  ];

  var ALIPAY_BASE = 'http://static.alipayobjects.com/';
  var ARALE_BASE = 'http://aralejs.org/source/';
  var KJUI_BASE = 'https://raw.github.com/stonelee/kjui/master/';

  var mapRules = [], coverRule = [];
  mapRules.push(function(url) {
    // KJUI_MODULES 从 kjui 加载
    for (var i = 0; i < KJUI_MODULES.length; i++) {
      if (url.indexOf(KJUI_MODULES[i] + '/') > 0) {
        url = url.replace('kjui/', '');
        return url.replace(ARALE_BASE, KJUI_BASE);
      }
    }

    // CDN_MODULES 直接从 alipay 的 cdn 上加载
    for (var i = 0; i < CDN_MODULES.length; i++) {
      if (url.indexOf(CDN_MODULES[i] + '/') > 0) {
        return url.replace(ARALE_BASE, ALIPAY_BASE);
      }
    }

    url = url.replace('http://aralejs.org/source/alipay', 'http://modules.alipay.im/alipay');

    // 如果访问 alipay.im 则从 alipay.im 加载
    if (location.hostname.indexOf('alipay.im') != -1 || location.hash == '#alipay') {
        // 链接转换成 http://arale.alipay.im/source/overlay/0.9.9/overlay.js
        url = url.replace(ARALE_BASE, 'http://modules.alipay.im/');
        return url;
    } 
    return url;
  })

  if (location.search === '?coverage=1') {
    coverRule.push(function(url) {
      url = url.replace('/src/', '/src-cov/');
      return url;
    });
    mapRules = mapRules.concat(coverRule);
  }

  var jqueryPath = (seajs._nicodebug ? '/sea-modules' : 'http://static.alipayobjects.com');

  seajs.config({
    base: ARALE_BASE,
    alias: {
      '$': jqueryPath + '/gallery/jquery/1.7.2/jquery.js',
      '$-debug': jqueryPath + '/gallery/jquery/1.7.2/jquery-debug.js',

      'jquery': jqueryPath + '/gallery/jquery/1.7.2/jquery',
      'jquery-debug': jqueryPath + '/gallery/jquery/1.7.2/jquery-debug.js'
    },
    preload: [
      'seajs/plugin-json',
      'seajs/plugin-text'
    ]
  })
  if (seajs._nicodebug) {
    seajs.config({
      base: '/sea-modules',
      map: coverRule
    })
  } else {
    seajs.config({
      map: mapRules
    })
  }
})();
