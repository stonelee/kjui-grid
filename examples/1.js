seajs.use(['$', 'grid'], function($, Grid) {

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
    width: 80,
    name: 'licensePlateNumber'
  }, {
    header: '矿种',
    name: 'coalType'
  }, {
    header: '毛重',
    name: 'grossWeight',
    render: function(value) {
      return '<b>' + value + '吨</b>';
    }
  }, {
    header: '过站时间',
    name: 'transitDate',
    width: 80,
    render: function(value) {
      return value.split('T')[0];
    }
  }, {
    header: '详细信息',
    name: 'id',
    align: 'center',
    render: function(value) {
      return '<img data-role="detail" src="./application_view_detail.png" width="16" title="详细信息" style="vertical-align:middle;">';
    }
  }];

  var grid = new Grid({
    element: '#demo1',
    title: 'title',
    url: './grid_1.json',
    urlParser: /(grid_)\d+(.*)/,
    fields: fields,
    height: 190,
    onClick: function(e, data, cell, row) {
      console.log(data, cell, row);
    },
    onSort: function(name, direction) {
      console.log(name, direction);
    }
  });
  grid.render();

  grid.on('click', function(e, data) {
    if ($(e.target).attr('data-role') == 'detail') {
      console.log(data);
    }
  });
});
