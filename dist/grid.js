define("kjui/grid/1.0.0/grid",["$","gallery/underscore/1.4.2/underscore","gallery/handlebars/1.0.0/handlebars","arale/widget/1.0.2/widget","arale/base/1.0.1/base","arale/class/1.0.0/class","arale/events/1.0.0/events"],function(e,t,n){var r=e("$"),i=e("gallery/underscore/1.4.2/underscore"),s=e("gallery/handlebars/1.0.0/handlebars"),o=e("arale/widget/1.0.2/widget"),u='<div class="mod" style="width:{{width}}px;"> {{#if title}} <div class="hd unselectable"> <span class="hd-title">{{title}}</span> </div> {{/if}} <div class="bd"><div class="grid-hd unselectable"> <table><thead><tr> {{#each fields}} <th class="grid-cell" data-name="{{name}}" width="{{width}}"> <span>{{header}}</span> </th> {{/each}} </tr></thead></table> </div><div class="grid-bd"{{#if height}} style="height:{{height}}px"{{/if}}> <table><tbody> {{#each records}} <tr class="grid-row{{#if isAlt}} grid-row-alt{{/if}}" data-id="{{id}}"> {{#each values}} <td class="grid-cell" width="{{width}}"{{#if align}} style="text-align:{{align}};"{{/if}}>{{{value}}}</td> {{/each}} </tr> {{/each}} </tbody></table> </div><div class="toolbar toolbar-ft"> <span class="toolbar-text toolbar-text-right">共{{totalCount}}条记录，每页{{pageSize}}条</span> <i class="icon icon-btn {{#if isFirst}}icon-btn-is-disabled icon-grid-page-first-disabled{{else}}icon-grid-page-first{{/if}}" data-role="first"></i> <i class="icon icon-btn {{#if hasPrev}}icon-grid-page-prev{{else}}icon-btn-is-disabled icon-grid-page-prev-disabled{{/if}}" data-role="prev"></i> <i class="toolbar-separator"></i> <span class="toolbar-text">当前第</span> <input style="width:40px;" type="text" data-role="num"> <span class="toolbar-text">/10页</span> <i class="toolbar-separator"></i> <i class="icon icon-btn {{#if hasNext}}icon-grid-page-next{{else}}icon-btn-is-disabled icon-grid-page-next-disabled{{/if}}" data-role="next"></i> <i class="icon icon-btn {{#if isLast}}icon-btn-is-disabled icon-grid-page-last-disabled{{else}}icon-grid-page-last{{/if}}" data-role="last"></i> <i class="toolbar-separator"></i> <i class="icon icon-btn icon-grid-refresh" data-role="refresh"></i> </div> </div> </div>',a=o.extend({attrs:{title:"",url:"",urlParser:null,data:[],fields:[],width:0,height:0},_onRenderUrl:function(e){var t=this;r.getJSON(e,function(e){t._createGrid(e.data)})},_onRenderData:function(e){this._createGrid(e)},_createGrid:function(e){this.data=e;var t=this.get("width")||this.element.parent().width(),n=this._processField(t),o=r.map(e.result,function(e,t){return{isAlt:t%2===1,id:e.id,values:r.map(n,function(t){var n=e[t.name];return n=i.escape(n),r.isFunction(t.render)&&(n=t.render(n)),{width:t.width,align:t.align,value:n}})}}),a=this.get("height"),f=s.compile(u)({width:t,title:this.get("title"),height:a,fields:n,records:o,isFirst:function(){return e.pageNumber<=1},isLast:function(){return e.totalPages===0||e.pageNumber===e.totalPages},hasPrev:e.hasPrev,hasNext:e.hasNext,totalCount:e.totalCount,pageSize:e.pageSize});this.element.html(f),a||(a=this.element.height()-this.$(".grid-bd").position().top-this.$(".toolbar-ft").outerHeight()-1,this.$(".grid-bd").height(a)),this.$("[data-role=num]").val(e.pageNumber),this.$(".icon-btn").click(function(e){r(this).hasClass("icon-btn-is-disabled")&&e.stopImmediatePropagation()})},_processField:function(e){var t=this.get("fields"),n=0,i=0;r.each(t,function(){this.width&&(n+=this.width,i+=1)});var s=(e-t.length*9-n-18)/(t.length-i);return t=r.map(t,function(e){return e.width||(e.width=s),e}),t},events:{"click .grid-hd":"_sort","click .grid-row":"_click","click [data-role=prev]":"prevPage","click [data-role=next]":"nextPage","click [data-role=first]":"firstPage","click [data-role=last]":"lastPage","click [data-role=refresh]":"refresh","keyup [data-role=num]":"_gotoPage"},_sort:function(e){var t=r(e.target).closest("th"),n=t.attr("data-name");this._oldSortHeader?this._oldSortHeader.attr("data-name")!==n&&(this._oldSortHeader.removeClass("grid-is-desc grid-is-asc"),this._oldSortHeader=t):this._oldSortHeader=t,t.hasClass("grid-is-desc")?(t.removeClass("grid-is-desc").addClass("grid-is-asc"),this.trigger("sort",n,"asc")):(t.removeClass("grid-is-asc").addClass("grid-is-desc"),this.trigger("sort",n,"desc"))},_click:function(e){var t=r(e.target),n=t.parents("tr"),s=n.attr("data-id"),o=i.find(this.data.result,function(e){return e.id==s});this.trigger("click",t,o)},_gotoPage:function(e){var t=r(e.target),n=t.val();if(n&&e.which==13)this.gotoPage(n);else{n=n.replace(/\D/g,"");if(n){n=parseInt(n,10);var i=this.data.totalPages;n>i?n=i:n===0&&(n=1),t.val(n)}else t.val("")}},gotoPage:function(e){var t=this.get("urlParser"),n=this.get("url").replace(t,"$1"+e+"$2");this.set("url",n)},prevPage:function(){var e=this.data.prevPage;this.gotoPage(e)},nextPage:function(){var e=this.data.nextPage;this.gotoPage(e)},firstPage:function(){var e=this.data.firstPage;this.gotoPage(e)},lastPage:function(){var e=this.data.lastPage;this.gotoPage(e)},refresh:function(){var e=this.get("url");this._onRenderUrl(e)}});n.exports=a});