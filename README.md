# grid

---

Grid 提供了表格展示功能，可以分页，排序

---


## 配置

### title `String`

表格标题，默认为空，表示不显示标题行

### url `String`

ajax请求数据的路径

### data `Array`

静态数据，如果没有设置url则使用data中的数据

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
  return '<a href="javascript:void 0;" data-role="detail"><img src="./application_view_detail.png" width="16" title="详细信息"></a>';
}
```

### width `Number`

整个grid的宽度，默认扩展到父元素宽度

### height `Number`

表格内容高度，如果设置height，而显示内容过多，会出现下拉滚动条

## 方法

### data

返回从url或者data中得到的数据

### load `url`

从指定url处获取数据并加载到grid中

## 事件

### click

在表格中点击触发，参数包括

* `data` 该行对应的数据
* `cell` 被点击的单元格，为jquery对象
* `row` 被点击的行，为jquery对象

### sort

点击列名触发，参数包括

* `name` 该列对应的数据key
* `direction` 升序还是降序
