<div class="mod" style="width:{{width}}px;">
  {{#if title}}
  <div class="hd unselectable">
    <span class="hd-title">{{title}}</span>
  </div>
  {{/if}}
  <div class="bd">

    <div class="grid-hd unselectable">
      <table><thead><tr>
        {{#if needOrder}}
          <th class="grid-cell" width="{{orderWidth}}">
            <span></span>
          </th>
        {{/if}}
        {{#each fields}}
          <th class="grid-cell" data-name="{{name}}" width="{{width}}">
            <span>{{header}}</span>
          </th>
        {{/each}}
      </tr></thead></table>
    </div>

    <div class="grid-bd"{{#if height}} style="height:{{height}}px"{{/if}}>
      <table><tbody>
        {{#each records}}
          <tr class="grid-row{{#if isAlt}} grid-row-alt{{/if}}">
            {{#if ../needOrder}}
              <td class="grid-cell grid-mark-cell" width="{{../../orderWidth}}">{{order}}</td>
            {{/if}}
            {{#each values}}
              <td class="grid-cell" width="{{width}}"{{#if align}} style="text-align:{{align}};"{{/if}}>{{{value}}}</td>
            {{/each}}
          </tr>
        {{/each}}
      </tbody></table>
    </div>

    {{#if paginate}}
      <div class="toolbar toolbar-ft">
        <span class="toolbar-text toolbar-text-right">共{{totalCount}}条记录，每页{{pageSize}}条</span>
        <i class="icon icon-btn {{#if isFirst}}icon-btn-is-disabled icon-grid-page-first-disabled{{else}}icon-grid-page-first{{/if}}" data-role="first"></i>
        <i class="icon icon-btn {{#if hasPrev}}icon-grid-page-prev{{else}}icon-btn-is-disabled icon-grid-page-prev-disabled{{/if}}" data-role="prev"></i>
        <i class="toolbar-separator"></i>
        <span class="toolbar-text">当前第</span>
        <input style="width:40px;" type="text" data-role="num">
        <span class="toolbar-text">/{{pageNumber}}页</span>
        <i class="toolbar-separator"></i>
        <i class="icon icon-btn {{#if hasNext}}icon-grid-page-next{{else}}icon-btn-is-disabled icon-grid-page-next-disabled{{/if}}" data-role="next"></i>
        <i class="icon icon-btn {{#if isLast}}icon-btn-is-disabled icon-grid-page-last-disabled{{else}}icon-grid-page-last{{/if}}" data-role="last"></i>
        <i class="toolbar-separator"></i>
        <i class="icon icon-btn icon-grid-refresh" data-role="refresh"></i>
      </div>
    {{/if}}
  </div>
</div>
