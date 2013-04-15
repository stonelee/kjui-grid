define("kjui/grid/0.0.1/grid-debug", ["$-debug", "gallery/underscore/1.4.2/underscore-debug", "gallery/handlebars/1.0.0/handlebars-debug", "arale/widget/1.0.2/widget-debug", "arale/base/1.0.1/base-debug", "arale/class/1.0.0/class-debug", "arale/events/1.0.0/events-debug"], function(require, exports, module) {
  var $ = require('$-debug'),
    _ = require('gallery/underscore/1.4.2/underscore-debug'),
    handlebars = require('gallery/handlebars/1.0.0/handlebars-debug'),
    Widget = require('arale/widget/1.0.2/widget-debug');

  var tpl = '<div class="mod" style="width:{{width}}px;"> {{#if title}} <div class="hd unselectable"> <span class="hd-title">{{title}}</span> </div> {{/if}} <div class="bd"><div class="grid-hd unselectable"> <table><thead><tr> {{#each fields}} <th class="grid-cell" data-name="{{name}}" width="{{width}}"> <span>{{header}}</span> </th> {{/each}} </tr></thead></table> </div><div class="grid-bd"{{#if height}} style="height:{{height}}px"{{/if}}> <table><tbody> {{#each records}} <tr class="grid-row{{#if isAlt}} grid-row-alt{{/if}}" data-id="{{id}}"> {{#each values}} <td class="grid-cell" width="{{width}}"{{#if align}} style="text-align:{{align}};"{{/if}}>{{{value}}}</td> {{/each}} </tr> {{/each}} </tbody></table> </div><div class="toolbar toolbar-ft"> <span class="toolbar-text toolbar-text-right">共{{totalCount}}条记录，每页{{pageSize}}条</span> <i class="icon icon-btn {{#if isFirst}}icon-btn-is-disabled icon-grid-page-first-disabled{{else}}icon-grid-page-first{{/if}}" data-role="first"></i> <i class="icon icon-btn {{#if hasPrev}}icon-grid-page-prev{{else}}icon-btn-is-disabled icon-grid-page-prev-disabled{{/if}}" data-role="prev"></i> <i class="toolbar-separator"></i> <span class="toolbar-text">当前第</span> <input style="width:40px;" type="text" data-role="num"> <span class="toolbar-text">/10页</span> <i class="toolbar-separator"></i> <i class="icon icon-btn {{#if hasNext}}icon-grid-page-next{{else}}icon-btn-is-disabled icon-grid-page-next-disabled{{/if}}" data-role="next"></i> <i class="icon icon-btn {{#if isLast}}icon-btn-is-disabled icon-grid-page-last-disabled{{else}}icon-grid-page-last{{/if}}" data-role="last"></i> <i class="toolbar-separator"></i> <i class="icon icon-btn icon-grid-refresh" data-role="refresh"></i> </div> </div> </div>';

  var Grid = Widget.extend({
    attrs: {
      title: '',
      url: '',
      urlParser: null,
      data: [],
      fields: [],
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

      var gridHeight = this.get('height');
      var html = handlebars.compile(tpl)({
        width: gridWidth,
        title: this.get('title'),
        height: gridHeight,
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
      var row = target.parents('tr');

      var id = row.attr('data-id');
      var data = _.find(this.data.result, function(record) {
        return record.id == id;
      });
      this.trigger('click', target, data);
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
