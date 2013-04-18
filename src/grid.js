define(function(require, exports, module) {
  var $ = require('$-debug'),
    Widget = require('widget'),
    handlebars = require('handlebars'),
    _ = require('underscore');

  var tpl = require('./grid.tpl');

  var Grid = Widget.extend({
    attrs: {
      fields: [],

      url: '',
      urlParser: null,
      data: [],

      title: '',
      paginate: true,

      needCheckbox: false,
      checkboxWidth: 20,

      needOrder: false,
      orderWidth: 20,

      width: 0,
      height: 0
    },

    _onRenderUrl: function(url) {
      var self = this;
      $.getJSON(url, function(data) {
        self._createGrid(data.data);
      });
    },
    _onRenderData: function(data) {
      this._createGrid(data);
    },

    _createGrid: function(data) {
      this.data = data;

      var gridWidth = this.get('width') || this.element.parent().width();
      var fields = this._processField(gridWidth);
      var needOrder = this.get('needOrder');
      var records = $.map(data.result, function(record, index) {
        var order = '';
        if (needOrder) {
          order = (data.pageNumber - 1) * data.pageSize + index + 1;
        }

        return {
          isAlt: index % 2 === 1,
          order: order,
          values: $.map(fields, function(field) {
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

      var gridHeight = this.get('height');
      var html = handlebars.compile(tpl)({
        width: gridWidth,
        height: gridHeight,

        fields: fields,
        records: records,

        title: this.get('title'),
        paginate: this.get('paginate'),

        needCheckbox: this.get('needCheckbox'),
        checkboxWidth: this.get('checkboxWidth'),

        needOrder: needOrder,
        orderWidth: this.get('orderWidth'),

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
        pageNumber: function() {
          return Math.ceil(data.totalCount / data.pageSize);
        }
      });
      this.element.html(html);

      //将数据绑定到$row上
      var $rows = this.$('.grid-row');
      $.each(data.result, function(index, record) {
        $rows.eq(index).data('data', record);
      });

      //已选择的行
      if (this.get('needCheckbox')) {
        this.selected = [];
      } else {
        this.selected = null;
      }

      //自适应高度
      if (!gridHeight) {
        gridHeight = this.element.height() - this.$('.grid-bd').position().top - this.$('.toolbar-ft').outerHeight() - 1;
        this.$('.grid-bd').height(gridHeight);
      }

      this.$('[data-role=num]').val(data.pageNumber);

      //disabled button will not be clicked
      this.$('.icon-btn').click(function(e) {
        if ($(this).hasClass('icon-btn-is-disabled')) {
          e.stopImmediatePropagation();
        }
      });

      this.trigger('rendered', this);
    },
    _processField: function(gridWidth) {
      var fields = this.get('fields');

      var specWidth = 0,
        specNum = 0;
      $.each(fields, function() {
        if (this.width) {
          specWidth += this.width;
          specNum += 1;
        }
      });

      //padding-width + border-width = 9
      //滚动条宽度取18
      var leftWidth = gridWidth - fields.length * 9 - specWidth - 18;
      if (this.get('needCheckbox')) {
        leftWidth = leftWidth - this.get('checkboxWidth') - 9;
      }
      if (this.get('needOrder')) {
        leftWidth = leftWidth - this.get('orderWidth') - 9;
      }
      var averageWidth = leftWidth / (fields.length - specNum);

      fields = $.map(fields, function(field) {
        if (!field.width) {
          field.width = averageWidth;
        }
        return field;
      });
      return fields;
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
      var cell = $(e.target).closest('th');
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

      if (!this.get('needCheckbox')) {
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

      if ($target.prop('checked')) {
        this.selected.push($row);
        $row.addClass('grid-row-is-selected');
      } else {
        var id = $row.data('data').id;
        for (var i = this.selected.length - 1; i >= 0; i--) {
          if (this.selected[i].data('data').id === id) {
            this.selected.splice(i, 1);
          }
        }
        $row.removeClass('grid-row-is-selected');
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
    }

  });

  module.exports = Grid;

});
