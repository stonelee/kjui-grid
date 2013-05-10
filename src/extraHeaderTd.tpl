{{#if needCheckbox}}
  <td class="grid-cell" width="{{checkboxWidth}}"{{#if needRowspan}} rowspan="{{rowspan}}"{{/if}}>
    <input type="checkbox" data-role="checkAll"/>
  </td>
{{/if}}
{{#if needOrder}}
  <td class="grid-cell" width="{{orderWidth}}"{{#if needRowspan}} rowspan="{{rowspan}}"{{/if}}></td>
{{/if}}
