// const API_KEY = "3042b9bfd374130956c1e55d218c8156";
// const url_api = `https://api.openweathermap.org/data/2.5/weather?lang=ua&q=rivne&appid=${API_KEY}&units=metric`;

const status = {
  "ToDo": "В черзі",
  "InProgress": "Виконується",
  "OnChecking": "На перевірці",
  "Done": "Виконано"
}

const getResponseData = async (url) => {
  return await fetch(url).then(async (res) => {
    return await res.json().then(async (data) => {
      return await data;
    });
  });
};
const setup = async () => {
  let resources = await getResponseData("api_resources.json");
  var g = new JSGantt.GanttChart(
    document.getElementById("GanttChartDIV"),
    "day"
  );

  g.setOptions({
    vResources: resources,
    vCaptionType: "Resource", // Set to Show Caption : None,Caption,Resource,Duration,Complete,
    vHourColWidth: 16,
    vDayColWidth: 32,
    vWeekColWidth: 64,
    vMonthColWidth: 128,
    vQuarterColWidth: 256,
    vTooltipDelay: 1000,
    vDateTaskDisplayFormat: "day dd month yyyy", // Shown in tool tip box
    vDayMajorDateDisplayFormat: "mon yyyy - Week ww", // Set format to dates in the "Major" header of the "Day" view
    vWeekMinorDateDisplayFormat: "dd mon", // Set format to display dates in the "Minor" header of the "Week" view
    vLang: "en",
    vShowTaskInfoLink: 0, // Show link in tool tip (0/1)
    vShowEndWeekDate: 0, // Show/Hide the date for the last day of the week in header for daily
    vAdditionalHeaders: {
      // Add data columns to your table
      status: {
        title: "Статус",
      },
      object_code: {
        title: "Object_code"
      }
    },
    vEvents: {
      taskname: console.log,
      res: console.log,
      start: console.log,
      end: console.log,
      planstart: console.log,
      planend: console.log,
      beforeDraw: () => console.log("before draw listener"),
      afterDraw: () => console.log("after draw listener"),
    },
    vEventsChange: {
      taskname: editValue, // if you need to use the this scope, do: editValue.bind(this)
      res: editValue,
      dur: editValue,
      start: editValue,
      end: editValue,
      planstart: editValue,
      planend: editValue,
    },
    vEditable: true,
    vUseSort: true,
    vShowCost: false,
    vShowAddEntries: false,
    vShowComp: false,
    vShowPlanStartDate: true,
    vShowPlanEndDate: true,
    vUseSingleCell: 25000, // Set the threshold cell per table row (Helps performance for large data.
    vFormatArr: ["Day", "Week", "Month", "Quarter"], // Even with setUseSingleCell using Hour format on such a large chart can cause issues in some browsers,
  });

  // fetch("api_data.json").then(async (data) => {
  //   await data.json().then(async (array) => {
  //     await array.forEach((el) => {
  //       g.AddTaskItemObject(getUpdatedUser(el));
  //     });
  //     g.Draw();
  //   });
  // });

  fetch("data.json").then(async (data) => {
    await data.json().then(async (array) => {
      await array.forEach((el) => {
        g.AddTaskItemObject(createTaskFromProject(el, g));
      });
      g.Draw();
    });
  });

  g.setScrollTo("today");
};

// Load from a Json url

//JSGantt.parseJSON("./data.json", g);

// Or Adding  Manually
// g.AddTaskItemObject({
//   pID: 1,
//   pName: "Define Chart <strong>API</strong>",
//   pStart: "2017-02-25",
//   pEnd: "2017-03-17",
//   pPlanStart: "2017-04-01",
//   pPlanEnd: "2017-04-15 12:00",
//   pClass: "ggroupblack",
//   pRes: "Brian",
//   pParent: 0,
// });

// document.addEventListener('DOMContentLoaded', function(){
// });

function nameChange(taskname, event, element) {
  taskname.setName("New name");
  console.log("Name changed");
  g.Draw();
}

function startDateChange(taskname, event, element) {
  taskname.setStart(new Date(Date.now()));
  console.log("Start date changed");
  g.Draw();
}

function endDateChange(taskname, event, element) {
  let date = new Date(Date.now());
  date.setDate(date.getDate() + 1);
  taskname.setEnd(date);
  console.log("End date changed");
  g.Draw();
}

function editValue(list, task, event, cell, column) {
  console.log(list, task, event, cell, column);
  const found = list.find((item) => item.pID == task.getOriginalID());
  if (!found) {
    return;
  } else {
    found[column] = event ? event.target.value : "";
  }
  g.Draw();
}

function createTaskFromProject(obj, g) {
  //  gets api project info object
  //  returns object for jsgantt chart
  let newObject = {};

  newObject.status = obj.hasOwnProperty("exec_status")
    ? status[obj.exec_status]
    : "";
  newObject.pClass = `task_${obj.exec_status.toLowerCase()}`;
  newObject.pStart = obj.start_date;
  newObject.pEnd = obj.finish_date;
  newObject.pID = obj.pk;
  newObject.pName = obj.name;
  newObject.pPlanStart = obj.planned_start;
  newObject.pPlanEnd = obj.planned_finish;
  newObject.pRes = obj.hasOwnProperty("pm")
    ? obj.pm
    : "";
  newObject.pComp = 0;
  newObject.object_code = obj.object_code;
  newObject.pGroup = 1;   //  1 for project task, 0 for task
  newObject.pParent = 0;
  newObject.pOpen = 1;
  obj.tasks.forEach( task => g.AddTaskItemObject(createTaskFromProjectTask(task, obj.pk)));
  console.log(obj, newObject);
  return newObject;
}

function createTaskFromProjectTask(obj, projectID){
  //  gets api task info object
  //  returns object for jsgantt chart
  let newObject = {};

  newObject.status = obj.hasOwnProperty("exec_status")
    ? status[obj.exec_status]
    : "";
  newObject.pClass = `task_${obj.exec_status.toLowerCase()}`;
  newObject.pStart = obj.start_date;
  newObject.pEnd = obj.finish_date;
  newObject.pID = obj.pk;
  newObject.pName = obj.part_name;
  newObject.pPlanStart = obj.planned_start;
  newObject.pPlanEnd = obj.planned_finish;
  newObject.object_code = obj.task;
  newObject.pRes = obj.hasOwnProperty("executor")
    ? obj.executor
    : "";
  newObject.pComp = 0;
  newObject.pGroup = 0;   //  1 for project task, 0 for task
  newObject.pParent = projectID;
  newObject.pOpen = 1;
  newObject.pNotes = obj.hasOwnProperty("warning") ? obj.warning : "";
  console.log(obj, newObject);
  return newObject;
}

setup();
