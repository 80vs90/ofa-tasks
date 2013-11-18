//Make list sortable, and assign proper checkbox functionality
$(function() {
  $( "#assigned, #pool" ).sortable({
    start: function(event, ui) {
      item = ui.item;
      newList = oldList = ui.item.parent();
    },
    stop: function(event, ui) {
      if(oldList != newList)
      {
        if( newList.attr("id") == "assigned")
        {
          var re = /task_(\d+)/;
          var taskId = item.attr("id").replace(re, "$1");
          receiveTask(taskId);
          item.not(':has(input)').prepend("<input class=\"checker\" type=\"checkbox\">");
        }
        else { 
          var re = /task_(\d+)/;
          var taskId = item.attr("id").replace(re, "$1");
          releaseTask(taskId);
          item.children('input').remove(); 
        }
      }

    },
    change: function(event, ui) {
      if(ui.sender) newList = ui.placeholder.parent();
    },
    connectWith: ".connectedSortable"
  }).disableSelection();


//Pop dialog explaining task more thoroughly

  $( "#task-dialog" ).dialog({
    autoOpen: false,
    title: "Task Name"
  });

  
  $( "a.task" ).click( function() {
    $( "#task-dialog" ).html("<div id=\"task-dialog\" title=\"Task #x\"><h7><b>Due by:</b>June 1, 2013</h6><p>This is a description of the task at hand.</p></div>");
    $( "#task-dialog" ).dialog( "open" );
  });


//Hide task when completed

  function hideTask(task) {
    var taskId = task.attr('id');
    var re = /task_(\d+)/;
    taskId = taskId.replace(re, "$1");
    completeTask(taskId);
    task.hide( "blind", 1000 );
  };


  $( "#assigned" ).on("click", "input", function(e) {
    var task = $(e.target).parent();
    hideTask(task);
    return false;
  });


//Pop dialog form to enter a new task

  $( "#new-task-dialog" ).dialog({
    autoOpen: false,
    modal: true,
    title: "New Task",
    buttons: {
      "Submit": function() {
        $( this ).dialog( "close" );
        var name = $("#taskname").val();
        var due = $("#due").val();
        var assignee = $("#assignee").val();
        var priority = $("#priority").val();
        var description = $( "#description" ).val();
        var id = addTask(name, due, priority, assignee, description);
      },
      Cancel: function() {
        $( this ).dialog( "close" );
      }
    },
  });

  $( "#newtask" ).click(function() {
    $( "#new-task-dialog" ).html("<form><fieldset><input id=\"taskname\" type=\"text\" placeholder=\"What needs gettin' done?\"><label>Assign to...</label><select id=\"assignee\"><option value=\"pool\">No one, throw it in the pool</option><option value=\"emossman\">Edward</option><option value=\"nrubin\">Nate 1</option><option value=\"gmartin\">Glenn</option><option value=\"nlandolt\">Nate 2</option></select><label>When is it due?</label><input id=\"due\" type=\"date\"><textarea id=\"description\" placeholder=\"What exactly needs to get done?\"></textarea><label>Priority level...</label><select id=\"priority\"><option value=\"0\">Normal</option><option value=\"1\">Low</option><option value=\"2\">High</option></select></fieldset></form>");
    $( "#new-task-dialog" ).dialog( "open" );
  });
});

function receiveTask(taskId) {
  $.post(
    "/assigntask",
    {
      taskId: taskId
    },
    function(data) {
    },
    "json"
  );
}

function releaseTask(taskId) {
  $.post(
    "/releasetask",
    {
      taskId: taskId
    },
    function(data) {

    },
    "json"
  );
}

function completeTask(taskId) {
  $.post(
    "/completetask",
    {
      taskId: taskId
    },
    function(data) {

    },
    "json"
  );
}

function addTask(name, due, priority, assignee, description) {
  var taskId = 0;
  $.post(
    "/createtask",
    {
      name: name,
      due: due,
      assignee: assignee,
      priority: priority,
      description: description
    },
    function(data) {
      $.each(data, function(key,val) {
        if(key == "id")
        {
          taskId = val;
        }
        addTaskHTML(taskId, priority, name);
      });
    },
    "json"
  );
}

function addTaskHTML(id, priority, name)
{
  var priority_html;
  if( priority == 0 )
  {
    priority_html = "<span class=\"label pull-right\">Normal</span>";
  }
  else if( priority == 1 )
  {
    priority_html = "<span class=\"label label-success pull-right\">Low</span>";
  }
  else if( priority == 2)
  {
    priority_html = "<span class=\"label label-important pull-right\">High</span>";
  }
  $( "#pool" ).append("<li id=\"" + id + "\" class=\"ui-state-default\"><a class=\"task\" href=\"#\">" + name + priority_html + "</a></li>");

}