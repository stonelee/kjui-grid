# 更多测试

- order: 3

---

## 没有标题栏

````iframe:300
<style type="text/css">
  #demo1 .bd{
    border-top-width:1px;
  }
</style>

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

  new Grid({
    element: '#demo1',
    url: './grid_1.json',
    urlParser: /(grid_)\d+(.*)/,
    fields: fields,
    height: 190
  }).render();

});
</script>
````
