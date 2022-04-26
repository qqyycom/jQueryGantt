function GanttProject(master) {
  this.master = master;

  this.selector = $.JST.createFromTemplate({}, "GANTTPROJECTSELECTOR");
  this.projectList;
  this.selectedProject;
}

GanttProject.prototype.addProjects = function (projectList) {
  const self = this
  this.projectList = projectList;
  projectList.forEach((p, i)=>{
    if (i === 0) {
      this.selectedProject = p;
    }
    let po = $.JST.createFromTemplate(p, "GANTTPROJECTOPTION");
    this.selector.find('#project').append(po)
  });
  this.selector.find('#project').selectmenu({
    select: function( event, ui ) {
      self.
    }
  });
}