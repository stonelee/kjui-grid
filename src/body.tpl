{{#each records}}
  <tr class="grid-row{{#if isAlt}} grid-row-alt{{/if}}">
    {{#if ../needCheckbox}}
      <td class="grid-cell grid-mark-cell">
        <input type="checkbox" data-role="check"/>
      </td>
    {{/if}}
    {{#if ../needOrder}}
      <td class="grid-cell grid-mark-cell">
        {{order}}
      </td>
    {{/if}}
    {{#each values}}
      <td class="grid-cell"{{#if align}} style="text-align:{{align}};"{{/if}}>
        {{{value}}}
      </td>
    {{/each}}
  </tr>
{{/each}}
