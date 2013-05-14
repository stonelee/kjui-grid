{{#each headers}}
  <td class="grid-cell{{addSortClass sort}}{{#if sort}} grid-is-sortable{{/if}}"
    {{#if name}} data-name="{{name}}"{{/if}}
    {{#if rowspan}} rowspan="{{rowspan}}"{{/if}}
    {{#if colspan}} colspan="{{colspan}}"{{/if}}
    ><span>{{header}}</span>
  </td>
{{/each}}
