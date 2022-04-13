function Stack() {
  let items = []
  // 添加元素到栈顶，也就是栈的末尾
  this.push = function (element) {
    items.push(element)
  }
  // 栈的后进先出原则，从栈顶出栈
  this.pop = function () {
    return items.pop()
  }

  this.popN = function (n) {
    if (n <= 0) {
      return undefined;
    }
    if(n > 1) {
      items = items.slice(0, items.length - n + 1);
    }
    return items.pop();
  }
  // 查看栈顶的元素，访问数组最后一个元素
  this.peek = function () {
    return items[items.length - 1]
  }
  // 检查栈是否为空
  this.isEmpty = function () {
    return items.length === 0
  }
  // 返回栈的长度，栈的长度就是数组的长度
  this.size = function () {
    return items.length
  }
  // 清空栈
  this.clear = function () {
    items = []
  }
  // 打印栈元素
  this.print = function () {
    console.log(items.toString())
  }
}