# grid

---

Grid 提供了表格展示功能，可以分页，点击，排序

---


## 配置

### title `String`

表格标题，默认为空，表示不显示标题栏

### url `String`

ajax请求数据的路径

### urlParser `RegExp`

用来适配翻页url

### data `Array`

直接加载静态数据

### fields `Array`

每列的配置，配置项包括

* `header` 列名
* `name` data中该列对应的key
* `width` `Number` 该列宽度
* `align` 对齐方式,取值为`left`,`center`,`right`
* `render` 自定义渲染函数，参数为该单元格的值

```js
//加粗，并加后缀
render: function(value) {
  return '<b>' + value + '吨</b>';
}

//显示为一张可点击的图片
render: function(value) {
  return '<img data-role="detail" src="./application_view_detail.png" width="16" title="详细信息" style="vertical-align:middle;cursor:pointer;">';
}
```

### paginate `Boolean`

默认为false，如果设为true则出现分页栏

### needCheckbox `Boolean`

默认为false，如果设为true则出现多选框列

### checkboxWidth `Number`

多选框列的宽度，默认为20

### needOrder `Boolean`

默认为false，如果设为true则出现自动编号列

### orderWidth `Number`

自动编号列的宽度，默认为20

### width `Number`

整个grid的宽度，默认扩展到父元素宽度

### height `Number`

表格内容高度，如果设置height，而显示内容过多，会自动出现下拉滚动条

## 属性

### data `Array`

返回从url或者data中得到的数据

### selected `Array`

返回当前选中的行，每项都包装为jquery对象

### $tr.data('data') `Array`

返回该行对应的数据

## 方法

### gotoPage `id`

加载某页数据

### prevPage ` `

加载上一页数据

### nextPage ` `

加载下一页数据

### firstPage ` `

加载第一页数据

### lastPage ` `

加载最后一页数据

### refresh ` `

刷新数据

## 事件

### click `target, data`

在表格行中点击触发

* `target` 被点击的元素，被包装成了jquery对象
* `data` 该行对应的数据

### sort `name, direction`

点击列名触发

* `name` 该列对应的数据key name
* `direction` 升序还是降序

### rendered `grid`

组件渲染完毕后触发，用来对默认样式进行动态更改

* `grid` 组件实例
