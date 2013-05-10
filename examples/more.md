# 更多

- order: 3

---

## 没有标题栏

````iframe:300
<style type="text/css">
  .bd{
    border-top-width:1px;
  }
</style>

<script type="text/javascript">
seajs.use(['$','grid'], function($, Grid) {
  var fields = [{
    header: '编号',
    align: 'center',
    name: 'id'
  }, {
    header: '验票站名称',
    name: 'stationName',
    width: 150
  }, {
    header: '矿企名称',
    name: 'mineName'
  }, {
    header: '车牌号',
    width:80,
    name: 'licensePlateNumber'
  }, {
    header: '矿种',
    name: 'coalType'
  }];

  new Grid({
    url: './grid_1.json',
    urlParser: /(grid_)\d+(.*)/,
    model: {
      fields: fields,
      height: 190
    }
  }).render();

});
</script>
````

## 没有分页栏

````iframe:300

<script type="text/javascript">
seajs.use(['$','grid'], function($, Grid) {

  var fields = [{
    header: '编号',
    align: 'center',
    name: 'id'
  }, {
    header: '验票站名称',
    name: 'stationName',
    width: 150
  }, {
    header: '矿企名称',
    name: 'mineName'
  }, {
    header: '车牌号',
    width:80,
    name: 'licensePlateNumber'
  }, {
    header: '矿种',
    name: 'coalType'
  }];

  new Grid({
    url: './grid_1.json',
    urlParser: /(grid_)\d+(.*)/,
    model: {
      fields: fields,
      title: 'title',
      paginate: false,
      height: 190
    }
  }).render();

});
</script>
````

## 自动序号

````iframe:300

<script type="text/javascript">
seajs.use(['$','grid'], function($, Grid) {
  var fields = [{
    header: '编号',
    align: 'center',
    name: 'id'
  }, {
    header: '验票站名称',
    name: 'stationName',
    width: 180
  }, {
    header: '矿企名称',
    name: 'mineName'
  }, {
    header: '车牌号',
    width:80,
    name: 'licensePlateNumber'
  }, {
    header: '矿种',
    name: 'coalType'
  }];

  new Grid({
    url: './grid_1.json',
    urlParser: /(grid_)\d+(.*)/,
    model: {
      fields: fields,
      title: 'title',
      needOrder: true,
      height: 190
    }
  }).render();

});
</script>
````

## 多选

````iframe:300

<script type="text/javascript">
seajs.use(['$','grid'], function($, Grid) {
  var fields = [{
    header: '编号',
    align: 'center',
    name: 'id'
  }, {
    header: '验票站名称',
    name: 'stationName',
    width: 180
  }, {
    header: '矿企名称',
    name: 'mineName'
  }, {
    header: '车牌号',
    width:80,
    name: 'licensePlateNumber'
  }, {
    header: '矿种',
    name: 'coalType'
  }];

  new Grid({
    url: './grid_1.json',
    urlParser: /(grid_)\d+(.*)/,
    model: {
      fields: fields,
      title: 'title',
      needCheckbox: true,
      height: 190
    }
  }).render();

});
</script>
````

## 序号+多选

````iframe:300

<script type="text/javascript">
seajs.use(['$','grid'], function($, Grid) {
  var fields = [{
    header: '编号',
    align: 'center',
    name: 'id'
  }, {
    header: '验票站名称',
    name: 'stationName',
    width: 180
  }, {
    header: '矿企名称',
    name: 'mineName'
  }, {
    header: '车牌号',
    width:80,
    name: 'licensePlateNumber'
  }, {
    header: '矿种',
    name: 'coalType'
  }];

  new Grid({
    url: './grid_1.json',
    urlParser: /(grid_)\d+(.*)/,
    model: {
      fields: fields,
      title: 'title',
      needCheckbox: true,
      needOrder: true,
      height: 190
    }
  }).render();

});
</script>
````

## 自定义按钮

````iframe:300

<script type="text/javascript">
seajs.use(['$','grid'], function($, Grid) {
  var fields = [{
    header: '编号',
    align: 'center',
    name: 'id'
  }, {
    header: '验票站名称',
    name: 'stationName',
    width: 180
  }, {
    header: '矿企名称',
    name: 'mineName'
  }, {
    header: '车牌号',
    width:80,
    name: 'licensePlateNumber'
  }, {
    header: '矿种',
    name: 'coalType'
  }];

  new Grid({
    url: './grid_1.json',
    urlParser: /(grid_)\d+(.*)/,
    model: {
      fields: fields,
      title: 'title',
      needCheckbox: true,
      height: 190
    },
    onLoaded: function(){
      var self = this;
      var $ft = this.$('[data-role=ft]');
      var $btnSelected = $('<div class="toolbar-btn">').html('已选择').appendTo($ft);
      $btnSelected.click(function(){
        var ids = $.map(self.selected, function($row){
          return $row.data('data').id
        })
        console.log(ids);
      })
    }
  }).render();

});
</script>
````
