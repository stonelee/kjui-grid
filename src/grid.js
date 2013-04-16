define(function(require, exports, module) {
  var $ = require('$'),
    _ = require('underscore'),
    handlebars = require('handlebars'),
    Widget = require('widget');

  var tpl = require('./grid.tpl');

  var Grid = Widget.extend({
    attrs: {
      title: '',
      url: '',
      urlParser: null,
      data: [],
      fields: [],
      paginate: false,
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

            return {
              width: field.width,
              align: field.align,
              value: value
            };
          })
        };
      });

      var gridHeight = this.get('height');
      var html = handlebars.compile(tpl)({
        width: gridWidth,
        title: this.get('title'),
        height: gridHeight,
        fields: fields,
        records: records,
        paginate: this.get('paginate'),
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
      var target = $(e.target);
      var $row = target.parents('tr');

      $row.addClass('grid-row-is-selected').siblings().removeClass('grid-row-is-selected');
      this.trigger('click', target, $row.data('data'));
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
