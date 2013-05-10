{{#each headers}}
  <td class="grid-cell{{addSortClass sort}}"
    {{#if name}} data-name="{{name}}"{{/if}}
    {{#if sort}} data-sortable{{/if}}
    {{#if rowspan}} rowspan="{{rowspan}}"{{/if}}
    {{#if colspan}} colspan="{{colspan}}"{{/if}}
    ><span>{{header}}</span>
  </td>
{{/each}}
