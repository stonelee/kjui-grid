define(function(require, exports, module) {
  var $ = require('$'),
    Widget = require('widget'),
    Templatable = require('templatable'),
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
      checkboxWidth: 20,

      needOrder: false,
      orderWidth: 20,

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
      this.model.fields = this._processField();

      Grid.superclass.parseElement.call(this);
    },

    _processField: function() {
      var fields = this.model.fields;

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
      var leftWidth = this.model.width - fields.length * 9 - specWidth - 18;
      if (this.model.needCheckbox) {
        leftWidth = leftWidth - this.model.checkboxWidth - 9;
      }
      if (this.model.needOrder) {
        leftWidth = leftWidth - this.model.orderWidth - 9;
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

    setup: function() {
      //自适应高度
      var gridHeight = this.model.height;
      if (!gridHeight) {
        //TODO: body高度不是整个浏览器高度
        gridHeight = $(this.get('parentNode')).innerHeight() - this.$('[data-role=bd]').position().top - this.$('[data-role=ft]').outerHeight() - 1;
        this.$('[data-role=bd]').height(gridHeight);
      }

      //TODO: delete
      this.trigger('rendered', this);
    },

    _onRenderUrl: function(url) {
      var self = this;

      this.loading();
      setTimeout(function() {
        $.getJSON(url, function(data) {
          self._loadData(data.data);
        });
      }, 3000);
    },

    _onRenderData: function(data) {
      this._loadData(data);
    },

    _loadData: function(data) {
      this.data = data;

      var fields = this.model.fields;
      var needOrder = this.model.needOrder;
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

      $.extend(this.model, {
        records: records,

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
      this.element.html(this.compile());

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

      this.$('[data-role=num]').val(data.pageNumber);

      //disabled button will not be clicked
      this.$('.icon-btn').click(function(e) {
        if ($(this).hasClass('icon-btn-is-disabled')) {
          e.stopImmediatePropagation();
        }
      });

    },

    events: {
      'click [data-role=hd]': '_sort',
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
    },

    loading:function() {
      return new Loading({
        parentNode: this.$('[data-role=bd]'),
        model: {
          left: (this.model.width - 106) / 2,
          top: (this.model.height - 36) / 2
        }
      }).render();
    }

  });

  module.exports = Grid;

});
