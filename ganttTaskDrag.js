function GanttDragger(editor) {
  this.editor = editor;
  this.master = editor.master;
  this.element = editor.element;

  this.selectedTask;
  this.selectedTaskRow;
  this.draggingEle;
  this.draggingRowIndex;
  this.draggingRowFirstSameLevelNodeDistance;
  this.placeholder;
  this.list;
  this.isDraggingStarted = false;

  this.visibleTasksInDragging = [];
  this.toHide = [];

  this.idTaskRowMap = {};

  this.taskOneLevelMap;

  this.startOverTime = 0;

  this.TRIGGER_OVER_DURA = 500   // ms

  const self = this;

  this.table = self.element.get(0);



  // The current position of mouse relative to the dragging element
  this.x = 0;
  this.y = 0;

  this.moveHandler = () => {
  };
  this.upHandler = () => {
  };

}

GanttDragger.prototype.bindRowDragEvents = function (task, taskRow) {
  taskRow.find(".draggable").mousedown((e) => {
    this.selectedTask = task;
    this.selectedTaskRow = taskRow;
    this.mouseDownHandler(e);
  })
}

GanttDragger.prototype.ready2TriggerOver = function () {
  return (new Date().getTime() - this.startOverTime) > this.TRIGGER_OVER_DURA;
}

GanttDragger.prototype.clearOverTriggerTimer = function () {
  this.startOverTime = 0;
}

GanttDragger.prototype.startOverTriggerTimer = function () {
  if (this.startOverTime === 0 ) {
    this.startOverTime = new Date().getTime();
  }
}

GanttDragger.prototype.mouseDownHandler = function (e) {
  // Get the original row
  const originalRow = e.target.parentNode.parentNode;

  // this.draggingRowIndex = [].slice.call(this.table.querySelectorAll('tr:not(.emptyRow)')).indexOf(originalRow);
  this.draggingRowIndex = originalRow.getAttribute("taskid");
  // Determine the mouse position
  this.x = e.clientX;

  this.y = e.clientY;

  this.mappingLevelRelations();

  // Attach the listeners to `document`
  this.moveHandler = (e) => this.mouseMoveHandler(e);
  document.addEventListener('mousemove', this.moveHandler);
  this.upHandler = (e) => this.mouseUpHandler(e);
  document.addEventListener('mouseup', this.upHandler);

};

GanttDragger.prototype.mouseMoveHandler = function (e) {
  let draggingEle = this.draggingEle;
  let placeholder = this.placeholder;

  if (!this.isDraggingStarted) {
    this.isDraggingStarted = true;
    this.cloneTable();
    // list = this.list;
    // draggingEle = [].slice.call(list.children)[draggingRowIndex];
    // draggingEle = this.idTaskRowMap[draggingRowIndex];
    draggingEle = this.draggingEle

    // draggingEle.classList.add('dragging');
    // draggingEle = document.createElement('div');
    // Let the placeholder take the height of dragging element
    // So the next element won't move up
    // placeholder = document.createElement('div');
    placeholder = draggingEle.cloneNode(true);
    this.placeholder = placeholder;

    draggingEle.classList.add('dragging');

    placeholder.classList.add('placeholder');
    draggingEle.parentNode.insertBefore(placeholder, draggingEle.nextSibling);
    // placeholder.style.height = `${draggingEle.offsetHeight}px`;
  }

  // Set position for dragging element
  draggingEle.style.position = 'absolute';
  draggingEle.style.top = `${draggingEle.offsetTop + e.clientY - this.y}px`;
  draggingEle.style.left = `${draggingEle.offsetLeft + e.clientX - this.x}px`;

  // Reassign the position of mouse
  this.x = e.clientX;
  this.y = e.clientY;

  // The current order
  // prevEle
  // draggingEle
  // placeholder
  // nextEle
  const prevEle = draggingEle.previousElementSibling;
  // const prevEle = prevDisplayedElementSibling(draggingEle);
  const nextEle = placeholder.nextElementSibling;
  // const nextEle = nextDisplayedElementSibling(placeholder);

  // The dragging element is above the previous element
  // User moves the dragging element to the top
  // We don't allow to drop above the header
  // (which doesn't have `previousElementSibling`)
  if (prevEle && prevEle.previousElementSibling && this.isOverTriggered(draggingEle, prevEle)) {
    this.handleOverTriggered(prevEle)
    return;
  }

  // The dragging element is above the previous element
  // User moves the dragging element to the top
  // We don't allow to drop above the header
  // (which doesn't have `previousElementSibling`)
  if (prevEle && prevEle.previousElementSibling && isAbove(draggingEle, prevEle)) {
    // if (prevEle && prevDisplayedElementSibling(prevEle) && isAbove(draggingEle, prevEle)) {
    // The current order    -> The new order
    // prevEle              -> placeholder
    // draggingEle          -> draggingEle
    // placeholder          -> prevEle
    swap(placeholder, draggingEle);
    swap(placeholder, prevEle);
    return;
  }

  if (nextEle && this.isOverTriggered(draggingEle, nextEle)) {
    // add  children row which is only one level lower
    this.handleOverTriggered(nextEle)
    return;
  }

  // The dragging element is below the next element
  // User moves the dragging element to the bottom
  if (nextEle && isBlow(draggingEle, nextEle)) {
    // The current order    -> The new order
    // draggingEle          -> nextEle
    // placeholder          -> placeholder
    // nextEle              -> draggingEle
    swap(nextEle, placeholder);
    swap(nextEle, draggingEle);
  }
};

GanttDragger.prototype.mouseUpHandler = function () {
  let placeholder = this.placeholder;
  let draggingEle = this.draggingEle;
  let list = this.list;
  let draggingRowIndex = this.draggingRowIndex;
  let table = this.table;
  // Remove the placeholder

  placeholder && placeholder.parentNode.removeChild(placeholder);
  draggingEle.classList.remove('dragging');
  draggingEle.style.removeProperty('top');
  draggingEle.style.removeProperty('left');
  draggingEle.style.removeProperty('position');

  // Get the end index
  const endRowIndex = [].slice.call(list.children).indexOf(draggingEle);

  this.isDraggingStarted = false;

  // Remove the `list` element
  list.parentNode.removeChild(list);

  // Move the dragged row to `endRowIndex`
  // let rows = [].slice.call(table.querySelectorAll('tr:not(.emptyRow)'));
  // draggingRowIndex > endRowIndex
  //   ? rows[endRowIndex].parentNode.insertBefore(rows[draggingRowIndex], rows[endRowIndex])
  //   : rows[endRowIndex].parentNode.insertBefore(
  //     rows[draggingRowIndex],
  //     rows[endRowIndex].nextSibling
  //   );

  // Bring back the table
  table.style.removeProperty('visibility');

  // Remove the handlers of `mousemove` and `mouseup`
  document.removeEventListener('mousemove', this.moveHandler);
  document.removeEventListener('mouseup', this.upHandler);

  this.expandAfterDrag();
};

// Swap two nodes
const swap = function (nodeA, nodeB) {
  const parentA = nodeA.parentNode;
  const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;

  // Move `nodeA` to before the `nodeB`
  nodeB.parentNode.insertBefore(nodeA, nodeB);

  // Move `nodeB` to before the sibling of `nodeA`
  parentA.insertBefore(nodeB, siblingA);
};

// Check if `nodeA` is above `nodeB`
const isAbove = function (nodeA, nodeB) {
  // Get the bounding rectangle of nodes
  const rectA = nodeA.getBoundingClientRect();
  const rectB = nodeB.getBoundingClientRect();
  // 将rect 分成5份, 如果在最上1/4的位置, 则 a 高于 b
  return rectA.top + rectA.height / 2 < rectB.top + rectB.height / 4;
};

const isOver = function (nodeA, nodeB) {
  // 将rect 分成5份, 如果在中间 2/4 的位置, 则 a 在 b 上
  // Get the bounding rectangle of nodes

  const rectA = nodeA.getBoundingClientRect();
  const rectB = nodeB.getBoundingClientRect();
  let nodeACenter = rectA.top + rectA.height / 2;
  return nodeACenter > rectB.top + rectB.height / 4 && nodeACenter < rectB.top + rectB.height * 3 / 4
}

GanttDragger.prototype.isOverTriggered = function (nodeA, nodeB) {
  if (isOver(nodeA, nodeB)) {
    this.startOverTriggerTimer();
    if (this.ready2TriggerOver()) {
      nodeB.classList.add('drag-be-overed');
      return true;
    }
  } else if (nodeB.classList.contains('drag-be-overed')) {
    nodeB.classList.remove('drag-be-overed');
    this.clearOverTriggerTimer()
  }
  return false;
}

GanttDragger.prototype.handleOverTriggered = function (overedNode) {
  let taskId = overedNode.querySelector('tr').getAttribute('taskid');
  let pTask = this.master.getTask(+taskId);
  let subTasks = this.taskOneLevelMap.get(taskId);

  if(!subTasks || subTasks.appended)
    return

  // const rowSet = this.table.querySelectorAll('tr:not(.emptyRow)')
  const insertPosition = overedNode.nextElementSibling;
  for (let i = 0; i < subTasks.length; i++) {
    let idx = subTasks[i].idx;
    let task = subTasks[i].t;
    // there is a head row in rowSet. should ignore it

    let newRow = this.createItemFromTask(task, task.isParent());

    if (insertPosition) {
      overedNode.parentNode.insertBefore(newRow, insertPosition);
    } else {
      overedNode.parentNode.append(newRow);
    }
  }
  pTask.draggingRowEle.classList.remove('collapsed')
  subTasks.appended = true
}

const isBlow = function (nodeA, nodeB) {
  // Get the bounding rectangle of nodes
  const rectA = nodeA.getBoundingClientRect();
  const rectB = nodeB.getBoundingClientRect();
  // 将rect 分成5份, 如果在最下 1/4 的位置, 则 a 在 b 下
  return rectA.top + rectA.height / 2 > rectB.top + rectB.height * 3 / 4;

}



GanttDragger.prototype.cloneTable = function () {
  let table = this.table;
  let list;

  this.initVisibleRowList(this.selectedTask);

  list = document.createElement('div');
  list.classList.add('clone-list');
  list.style.position = 'absolute';
  // list.style.left = `${rect.left}px`;
  // list.style.top = `${rect.top}px`;
  table.parentNode.insertBefore(list, table);

  // Hide the original table
  table.style.visibility = 'hidden';

  // create header
  const headerRow = table.querySelectorAll('tr:not(.emptyRow)')[0];
  list.appendChild(this.createItemFromRow(headerRow));
  let visibleTasks = this.visibleTasksInDragging;
  for (let i = 0; i < visibleTasks.length; i++) {
    let vt = visibleTasks[i].t;
    let collapsed = visibleTasks[i].collapsed;

    const item = this.createItemFromTask(vt, collapsed);

    if (this.draggingRowIndex === vt.id+'') {
      this.draggingEle = item;
    }
    list.appendChild(item);
  }
  this.list = list
};

GanttDragger.prototype.createItemFromTask = function (task, isCollapsed) {
  // to DOM
  const rowEle = task.rowElement.get(0)
  return this.createItemFromRow(rowEle, isCollapsed, task);
}

GanttDragger.prototype.createItemFromRow = function (rowEle, isCollapsed, task) {
  const width = parseInt(window.getComputedStyle(this.table).width);

  // Create a new table from given row
  const item = document.createElement('div');

  item.classList.add('draggable');
  const newTable = document.createElement('table');
  newTable.setAttribute('class', 'clone-table gdfTable');

  newTable.style.width = `${width}px`;

  const newRow = rowEle.cloneNode()

  if (isCollapsed) {
    newRow.classList.add('collapsed')
  }

  const cells = [].slice.call(rowEle.children);
  cells.forEach(function (cell) {
    const newCell = cell.cloneNode(true);
    newCell.style.width = `${parseInt(window.getComputedStyle(cell).width)}px`;
    newRow.appendChild(newCell);
  });

  newTable.appendChild(newRow);
  if (task) {
    task.draggingRowEle = newRow;
  }
  item.appendChild(newTable);
  return item;
}

GanttDragger.prototype.initVisibleRowList = function (task) {
  const siblings = task.level;
  const allTasks = this.master.tasks;
  allTasks.forEach((t) => {
    let level = t.level;
    let collapsed = false;
    if (level <= siblings) {
      if (level === siblings) {
        collapsed = true;
      }
      this.visibleTasksInDragging.push({t, collapsed});
    }
  });
}

GanttDragger.prototype.expandAfterDrag = function () {
  this.toHide = [];
  this.visibleTasksInDragging = [];
  this.taskOneLevelMap = undefined;
}

// function nextDisplayedElementSibling(current) {
//   let nextSibling = current.nextElementSibling;
//
//   while (nextSibling && nextSibling.style.display === 'none') {
//     nextSibling = nextSibling.nextElementSibling;
//   }
//   return nextSibling;
// }
//
// function prevDisplayedElementSibling(current) {
//   let prevSibling = current.previousElementSibling;
//   while (prevSibling && prevSibling.style.display === 'none') {
//     console.log(prevSibling);
//     prevSibling = current.previousElementSibling;
//   }
//   return prevSibling;
// }

GanttDragger.prototype.mappingLevelRelations = function () {
  const tasks = this.master.tasks;
  const parentNodes = new Stack();
  const resMap = new Map();

  if (tasks.length === 0 || tasks.length === 1) {
    return;
  }

  parentNodes.push(tasks[0])

  let pNode;
  for (let i = 0; i < tasks.length - 1; i++) {
    if (tasks[i + 1].level > tasks[i].level) {
      parentNodes.push(tasks[i]);
    } else if (tasks[i + 1].level === tasks[i].level) {
      // do nothing
    } else if (tasks[i + 1].level < tasks[i].level) {
      let popStep = tasks[i].level - tasks[i + 1].level;
      parentNodes.popN(popStep);
    }
    pNode = parentNodes.peek();

    let pTaskId = pNode.id + '';
    let cList;
    if (resMap.has(pTaskId)) {
      cList = resMap.get(pTaskId)
    } else {
      resMap.set(pTaskId, cList = []);
    }
    cList.push({idx: i+1, t: tasks[i + 1]})
  }

  this.taskOneLevelMap = resMap;
}