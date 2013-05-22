define(function(require, exports, module) {
  var $ = require('$'),
    Widget = require('widget'),
    Templatable = require('templatable'),
    Handlebars = require('handlebars'),
    _ = require('underscore');

  var Loading = require('./loading');

  var Grid = Widget.extend({
    Implements: Templatable,

    attrs: {
      url: '',
      urlParser: null,
      data: []
    },

    template: require('./grid.tpl'),

    model: {
      fields: [],

      title: '',
      paginate: true,

      needCheckbox: false,
      checkboxWidth: 30,

      needOrder: false,
      orderWidth: 30,

      width: null,
      height: null
    },

    parseElement: function() {
      _.defaults(this.model, {
        width: $(this.get('parentNode')).innerWidth(),
        records: [],
        isFirst: true,
        isLast: true,
        hasPrev: false,
        hasNext: false,
        totalCount: 0,
        pageSize: 0,
        pageNumbers: 0
      });
      this.model.headers = this._processHeaders();
      this.model.fields = this._processFields();

      Grid.superclass.parseElement.call(this);
    },

    _processHeaders: function() {
      var headers = [];

      //get headers
      function loopHeader(nodes, level) {
        if (headers.length < level + 1) {
          headers.push(nodes);
        } else {
          headers[level] = headers[level].concat(nodes);
        }

        var nextLevel = level + 1;
        $.each(nodes, function() {
          if (this.children && this.children.length > 0) {
            loopHeader(this.children, nextLevel);
          }
        });
      }
      loopHeader(this.model.fields, 0);

      //set colspan & rowspan
      function loopChildren(nodes, num) {
        var result = num + nodes.length;
        for (var i = 0; i < nodes.length; i++) {
          var node = nodes[i];
          if (node.children && node.children.length > 0) {
            result = loopChildren(node.children, result - 1);
          }
        }
        return result;
      }
      var levelNum = headers.length;
      for (var i = 0; i < levelNum; i++) {
        var header = headers[i];
        for (var j = 0; j < header.length; j++) {
          var h = header[j];
          if (h.children && h.children.length > 0) {
            var colspan = 0;
            colspan = loopChildren(h.children, colspan);
            h.colspan = colspan;
          } else {
            if (levelNum > 1) {
              h.rowspan = levelNum - i;
            }
            if (h.rowspan == 1) {
              delete h.rowspan;
            }
          }
        }
      }

      return headers;
    },

    _processFields: function() {
      var specWidth = 0,
        specNum = 0,
        fields = [];

      function loopHeader(nodes) {
        $.each(nodes, function() {
          if (this.children && this.children.length > 0) {
            loopHeader(this.children);
          } else {
            fields.push(this);
            //子表头宽度有效
            if (this.width) {
              specWidth += this.width;
              specNum += 1;
            }
          }
        });
      }
      loopHeader(this.model.fields);

      //滚动条宽度
      var scrollWidth = 18;
      //过长表格
      if (specNum === fields.length && specWidth > this.model.width) {
        this.model.isLong = true;
        scrollWidth = 0;
      }

      //如果没有设置width则平均分配宽度
      var remainWidth = this.model.width - specWidth - scrollWidth;
      if (this.model.needCheckbox) {
        remainWidth = remainWidth - this.model.checkboxWidth;
      }
      if (this.model.needOrder) {
        remainWidth = remainWidth - this.model.orderWidth;
      }
      var averageWidth = remainWidth / (fields.length - specNum);

      for (var i = fields.length - 1; i >= 0; i--) {
        if (!fields[i].width) {
          fields[i].width = averageWidth;
        }
      }

      return fields;
    },

    templateHelpers: {
      createHeader: function(headers) {
        //first tr
        var options = $.extend({}, this, {
          needRowspan: this.headers.length > 1,
          rowspan: this.headers.length
        });
        var extraTd = Handlebars.compile(require('./extraHeaderTd.tpl'))(options);
        var trs = '<tr>' + extraTd;

        var tpl = require('./headerTd.tpl');
        Handlebars.registerHelper('addSortClass', function(sort) {
          if (sort == 'asc' || sort == 'desc') {
            return new Handlebars.SafeString(' grid-is-' + sort);
          }
        });
        var td = Handlebars.compile(tpl)({
          headers: this.headers[0]
        });
        trs += td + '</tr>';

        //other tr
        for (var i = 1; i < this.headers.length; i++) {
          trs += '<tr>';
          td = Handlebars.compile(tpl)({
            headers: this.headers[i]
          });
          trs += td + '</tr>';
        }

        return new Handlebars.SafeString(trs);
      }
    },

    setup: function() {
      var self = this;
      if (this.model.isLong) {
        this.$('.grid-view').scroll(function() {
          self.$('.grid-hd').scrollLeft($(this).scrollLeft());
        });
      }
    },

    _onRenderUrl: function(url) {
      var self = this;

      this.showLoading();
      $.getJSON(url, function(data) {
        self._loadData(data.data);
        self.hideLoading();
      });
    },

    _onRenderData: function(data) {
      this._loadData(data);
    },

    _loadData: function(data) {
      var self = this;
      this.data = data;

      //body
      var records = $.map(data.result, function(record, index) {
        var order = '';
        if (self.model.needOrder) {
          order = (data.pageNumber - 1) * data.pageSize + index + 1;
        }

        return {
          isAlt: index % 2 === 1,
          order: order,
          values: $.map(self.model.fields, function(field) {
            var value = record[field.name];
            value = _.escape(value);

            if ($.isFunction(field.render)) {
              value = field.render(value);
            }
            var f = _.clone(field);
            f.value = value;
            return f;
          })
        };
      });

      var body = Handlebars.compile(require('./body.tpl'))($.extend({}, this.model, {
        records: records
      }));
      this.$('.grid-view tbody').html(body);


      //paginate
      $.extend(this.model, {
        isFirst: function() {
          return data.pageNumber <= 1;
        },
        isLast: function() {
          return data.totalPages === 0 || data.pageNumber === data.totalPages;
        },
        hasPrev: data.hasPrev,
        hasNext: data.hasNext,
        totalCount: data.totalCount,
        pageSize: data.pageSize,
        pageNumbers: function() {
          return Math.ceil(data.totalCount / data.pageSize);
        }
      });
      this.renderPartial('.toolbar-ft');

      //将数据绑定到$row上
      var $rows = this.$('.grid-row');
      $.each(data.result, function(index, record) {
        $rows.eq(index).data('data', record);
      });

      //已选择的行
      if (this.model.needCheckbox) {
        this.selected = [];
      } else {
        this.selected = null;
      }

      var $checkAll = this.$('[data-role=checkAll]');
      if ($checkAll.length > 0) {
        $checkAll[0].indeterminate = false;
        $checkAll.prop('checked', false);
      }

      this.$('[data-role=num]').val(data.pageNumber);

      //disabled button will not be clicked
      this.$('i').click(function(e) {
        if (/disabled/.test(e.target.className)) {
          e.stopImmediatePropagation();
        }
      });

      this.trigger('loaded');
    },

    events: {
      'click .grid-hd': '_sort',
      'click .grid-row': '_click',
      'click [data-role=check]': '_check',
      'click [data-role=checkAll]': '_checkAll',

      'click [data-role=prev]': 'prevPage',
      'click [data-role=next]': 'nextPage',
      'click [data-role=first]': 'firstPage',
      'click [data-role=last]': 'lastPage',
      'click [data-role=refresh]': 'refresh',
      'keyup [data-role=num]': '_gotoPage'
    },

    _sort: function(e) {
      var cell = $(e.target).closest('td');
      if (!cell.hasClass('grid-is-sortable')) return;

      var name = cell.attr('data-name');

      //只能按照单独的列排序
      if (!this._oldSortHeader) {
        this._oldSortHeader = cell;
      } else {
        if (this._oldSortHeader.attr('data-name') !== name) {
          this._oldSortHeader.removeClass('grid-is-desc grid-is-asc');
          this._oldSortHeader = cell;
        }
      }

      if (cell.hasClass('grid-is-desc')) {
        cell.removeClass('grid-is-desc').addClass('grid-is-asc');
        this.trigger('sort', name, 'asc');
      } else {
        cell.removeClass('grid-is-asc').addClass('grid-is-desc');
        this.trigger('sort', name, 'desc');
      }
    },

    _click: function(e) {
      var $target = $(e.target);
      var $row = $target.parents('tr');
      var data = $row.data('data');

      if (!this.model.needCheckbox) {
        if (this.selected && this.selected.data('data').id === data.id) {
          this.selected = null;
          $row.removeClass('grid-row-is-selected');
        } else {
          this.selected = $row;
          $row.addClass('grid-row-is-selected').siblings().removeClass('grid-row-is-selected');
        }
      }

      if ($target.attr('data-role') != 'check') {
        this.trigger('click', $target, data);
      }
    },

    _check: function(e) {
      var $target = $(e.target);
      var $row = $target.parents('tr');
      var $checkAll = $('[data-role=checkAll]');

      $checkAll[0].indeterminate = true;
      if ($target.prop('checked')) {
        //选中
        this.selected.push($row);
        $row.addClass('grid-row-is-selected');

        //如果全部选中
        if ($('[data-role=check]').not(':checked').length === 0) {
          $checkAll[0].indeterminate = false;
          $checkAll.prop('checked', true);
        }
      } else {
        var id = $row.data('data').id;
        for (var i = this.selected.length - 1; i >= 0; i--) {
          if (this.selected[i].data('data').id === id) {
            this.selected.splice(i, 1);
          }
        }
        $row.removeClass('grid-row-is-selected');

        //如果全部取消选中
        if (!$('[data-role=check]').is(':checked')) {
          $checkAll[0].indeterminate = false;
          $checkAll.prop('checked', false);
        }
      }
    },
    _checkAll: function(e) {
      var $target = $(e.target);
      var $checks = this.$('[data-role=check]');
      var $rows = $checks.parents('tr');

      if ($target.prop('checked')) {
        var selected = [];
        $rows.each(function(index, row) {
          selected.push($(row));
        });
        this.selected = selected;
        $checks.prop('checked', true);
        $rows.addClass('grid-row-is-selected');
      } else {
        this.selected = [];
        $checks.prop('checked', false);
        $rows.removeClass('grid-row-is-selected');
      }
    },

    _gotoPage: function(e) {
      var $input = $(e.target);
      var value = $input.val();

      if (value && e.which == 13) {
        this.gotoPage(value);
      } else {
        value = value.replace(/\D/g, '');
        if (value) {
          value = parseInt(value, 10);

          var totalPages = this.data.totalPages;
          if (value > totalPages) {
            value = totalPages;
          } else if (value === 0) {
            value = 1;
          }
          $input.val(value);
        } else {
          $input.val('');
        }
      }
    },

    //public method
    gotoPage: function(id) {
      var r = this.get('urlParser');
      var url = this.get('url').replace(r, '$1' + id + '$2');
      this.set('url', url);
    },
    prevPage: function() {
      var id = this.data.prevPage;
      this.gotoPage(id);
    },
    nextPage: function() {
      var id = this.data.nextPage;
      this.gotoPage(id);
    },
    firstPage: function() {
      var id = this.data.firstPage;
      this.gotoPage(id);
    },
    lastPage: function() {
      var id = this.data.lastPage;
      this.gotoPage(id);
    },
    refresh: function() {
      //刷新往往不会改变url
      var url = this.get('url');
      this._onRenderUrl(url);
    },

    showLoading: function() {
      if (this.loading) {
        this.loading.element.show();
      } else {
        this.loading = new Loading({
          parentNode: this.$('.grid-bd'),
          model: {
            left: (this.model.width - 106) / 2,
            top: (this.model.height - 36) / 2
          }
        }).render();
      }
    },
    hideLoading: function() {
      this.loading.element.hide();
    }

  });

  module.exports = Grid;

});
