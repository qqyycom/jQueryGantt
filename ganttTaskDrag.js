function GanttDragger(editor) {
  this.editor = editor;
  this.master = editor.master;
  this.element = editor.element;

  this.selectedTask;
  this.selectedTaskRow;
  this.draggingEle;
  this.draggingRowIndex;
  this.placeholder;
  this.list;
  this.isDraggingStarted = false;

  this.toCollapsed = [];
  this.toHide = [];

  this.idTaskRowMap = {};

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

GanttDragger.prototype.mouseDownHandler = function (e) {
  // Get the original row
  const originalRow = e.target.parentNode.parentNode;

  this.draggingRowIndex = [].slice.call(this.table.querySelectorAll('tr:not(.emptyRow)')).indexOf(originalRow);
  // this.draggingRowIndex = originalRow.getAttribute("taskid");
  // Determine the mouse position
  this.x = e.clientX;

  this.y = e.clientY;

  // Attach the listeners to `document`
  this.moveHandler = (e) => this.mouseMoveHandler(e);
  document.addEventListener('mousemove', this.moveHandler);
  this.upHandler = (e) => this.mouseUpHandler(e);
  document.addEventListener('mouseup', this.upHandler);

};

GanttDragger.prototype.mouseMoveHandler = function (e) {
  let draggingRowIndex = this.draggingRowIndex;
  let draggingEle = this.draggingEle;
  let placeholder = this.placeholder;
  let list = this.list;

  if (!this.isDraggingStarted) {
    this.isDraggingStarted = true;
    this.cloneTable();
    list = this.list;
    draggingEle = [].slice.call(list.children)[draggingRowIndex];
    // draggingEle = this.idTaskRowMap[draggingRowIndex];
    this.draggingEle = draggingEle

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
    placeholder.style.height = `${draggingEle.offsetHeight}px`;
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

  // The dragging element is below the next element
  // User moves the dragging element to the bottom
  if (nextEle && isAbove(nextEle, draggingEle)) {
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
  let rows = [].slice.call(table.querySelectorAll('tr:not(.emptyRow)'));
  draggingRowIndex > endRowIndex
    ? rows[endRowIndex].parentNode.insertBefore(rows[draggingRowIndex], rows[endRowIndex])
    : rows[endRowIndex].parentNode.insertBefore(
      rows[draggingRowIndex],
      rows[endRowIndex].nextSibling
    );

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

  return rectA.top + rectA.height / 2 < rectB.top + rectB.height;
};

GanttDragger.prototype.cloneTable = function (draggingEle) {
  let table = this.table;
  let list;
  // const rect = table.getBoundingClientRect();
  const width = parseInt(window.getComputedStyle(table).width);

  this.collapseBeforeDrag(this.selectedTask);

  list = document.createElement('div');
  list.classList.add('clone-list');
  list.style.position = 'absolute';
  // list.style.left = `${rect.left}px`;
  // list.style.top = `${rect.top}px`;
  table.parentNode.insertBefore(list, table);

  const toCollapsed = this.toCollapsed;
  const toHide = this.toHide;

  // Hide the original table
  table.style.visibility = 'hidden';
  const rowSet = table.querySelectorAll('tr:not(.emptyRow)')
  for (const row of rowSet) {
    // Create a new table from given row
    const item = document.createElement('div');

    item.classList.add('draggable');
    const newTable = document.createElement('table');
    newTable.setAttribute('class', 'clone-table gdfTable');

    newTable.style.width = `${width}px`;
    const newRow = row.cloneNode()
    let taskId = row.getAttribute('taskid');

    if (taskId) {
      this.idTaskRowMap[taskId] = item;
    }

    if (toCollapsed.includes(taskId)) {
      newRow.classList.add('collapsed');
    }

    const cells = [].slice.call(row.children);
    cells.forEach(function (cell) {
      const newCell = cell.cloneNode(true);
      newCell.style.width = `${parseInt(window.getComputedStyle(cell).width)}px`;
      newRow.appendChild(newCell);
    });

    // collapse siblings

    if (toHide.includes(taskId)) {
      item.style.display = 'none'
      continue;
    }
    newTable.appendChild(newRow);
    item.appendChild(newTable);
    list.appendChild(item);
  }
  this.list = list
};


GanttDragger.prototype.collapseBeforeDrag = function (task) {
  const siblings = task.level;
  const allTasks = this.master.tasks;
  allTasks.forEach((t) => {
    let id = t.id;
    let level = t.level;
    if (level === siblings && t.isParent()) {
      this.toCollapsed.push(id + '')
    } else if (level > siblings) {
      if (t.isParent()) {
        this.toCollapsed.push(id + '')
      }
      this.toHide.push(id + '')
    }
  });
}

GanttDragger.prototype.expandAfterDrag = function () {
  this.toHide = [];
  this.toCollapsed = [];
  this.idTaskRowMap = {};
}

function nextDisplayedElementSibling(current) {
  let nextSibling = current.nextElementSibling;

  while (nextSibling && nextSibling.style.display === 'none') {
    nextSibling = nextSibling.nextElementSibling;
  }
  return nextSibling;
}

function prevDisplayedElementSibling(current) {
  let prevSibling = current.previousElementSibling;
  while (prevSibling && prevSibling.style.display === 'none') {
    console.log(prevSibling);
    prevSibling = current.previousElementSibling;
  }
  return prevSibling;
}