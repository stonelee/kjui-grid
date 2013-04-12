# 宽度高度测试

- order: 2

---

## 固定宽度和高度

适用于grid固定大小的场合

````iframe:300
<div id="demo1"></div>

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

  var grid = new Grid({
    element: '#demo1',
    title: 'title',
    url: './grid_1.json',
    fields: fields,
    width: 650,
    height: 190
  });
  grid.urlFormat = function(id){
    return './grid_' + id + '.json';
  };

});
</script>
````

## 不固定宽度，固定高度

grid宽度自动扩展为父元素宽度

````iframe:300
<div id="demo1"></div>

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

  var grid = new Grid({
    element: '#demo1',
    title: 'title',
    url: './grid_1.json',
    fields: fields,
    height: 190
  });
  grid.urlFormat = function(id){
    return './grid_' + id + '.json';
  };

});
</script>
````

## 不固定高度

此时不会出现内容滚动条，当超出父元素高度时出现整体滚动条

````iframe:500
<div id="demo1"></div>

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

  var grid = new Grid({
    element: '#demo1',
    title: 'title',
    url: './grid_1.json',
    fields: fields
  });
  grid.urlFormat = function(id){
    return './grid_' + id + '.json';
  };

});
</script>
````

## 高度自适应

通过计算父元素高度，实现grid高度自适应

````iframe:300
<div id="demo1"></div>

<script type="text/javascript">
seajs.use(['$','grid'], function($, Grid) {
  //自适应高度
  $('#demo1').height(window.innerHeight);

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

  var grid = new Grid({
    element: '#demo1',
    title: 'title',
    url: './grid_1.json',
    fields: fields
  });
  grid.urlFormat = function(id){
    return './grid_' + id + '.json';
  };

});
</script>
````
