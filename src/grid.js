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
      data: [],
      fields: [],
      width: 0,
      height: 0
    },

    setup: function() {
      Grid.superclass.setup.call(this);

      var that = this;
      var url = this.get('url');
      if (url) {
        $.getJSON(url, function(data) {
          that._createGrid(data.data);
        });
      } else {
        var data = this.get('data');
        if (data) {
          this._createGrid(data);
        }
      }
    },
    _createGrid: function(data) {
      this.data = data;

      var gridWidth = this.get('width') || this.element.parent().width();
      var fields = this._processField(gridWidth);
      var records = $.map(data.result, function(record, index) {
        return {
          isAlt: index % 2 === 1,
          id: record.id,
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

      var html = handlebars.compile(tpl)({
        width: gridWidth,
        title: this.get('title'),
        height: this.get('height'),
        fields: fields,
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
        pageSize: data.pageSize
      });
      this.element.html(html);

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

      var totalWidth = 0,
        totalNum = 0;
      $.each(fields, function() {
        if (this.width) {
          totalWidth += this.width;
          totalNum += 1;
        }
      });

      var averageWidth = (gridWidth - fields.length * 9 - totalWidth - 18) / (fields.length - totalNum);

      fields = $.map(fields, function(field) {
        if (!field.width) {
          field.width = averageWidth;
        }
        return field;
      });
      return fields;
    },

    events: {
      'click .grid-hd': 'sort',
      'click .grid-row': 'click',
      'click [data-role=prev]': 'prevPage',
      'click [data-role=next]': 'nextPage',
      'click [data-role=first]': 'firstPage',
      'click [data-role=last]': 'lastPage',
      'click [data-role=refresh]': 'refresh',
      'keyup [data-role=num]': 'gotoPage'
    },

    sort: function(e) {
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
        console.log(name, 'asc');
      } else {
        cell.removeClass('grid-is-asc').addClass('grid-is-desc');
        console.log(name, 'desc');
      }
    },

    click: function(e) {
      var cell = $(e.target);
      var row = cell.parents('tr');

      var id = row.attr('data-id');
      var data = _.find(this.data.result, function(record) {
        return record.id == id;
      });
      this.trigger('click', data, cell, row);
    },

    prevPage: function() {
      var id = this.data.prevPage;
      this.fetch(id);
    },
    nextPage: function() {
      var id = this.data.nextPage;
      this.fetch(id);
    },
    firstPage: function() {
      var id = this.data.firstPage;
      this.fetch(id);
    },
    lastPage: function() {
      var id = this.data.lastPage;
      this.fetch(id);
    },
    refresh: function() {
      var id = this.data.pageNumber;
      this.fetch(id);
    },
    gotoPage: function(e) {
      var $input = $(e.target);
      var value = $input.val();

      if (value && e.which == 13) {
        this.fetch(value);
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

    fetch: function(id) {
      var that = this;
      var url = this.urlFormat(id);
      $.getJSON(url, function(data) {
        that._createGrid(data.data);
      });
    },

    urlFormat: function(id) {
      return id;
    }

  });

  module.exports = Grid;

});
