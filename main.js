// const API_KEY = "3042b9bfd374130956c1e55d218c8156";
// const url_api = `https://api.openweathermap.org/data/2.5/weather?lang=ua&q=rivne&appid=${API_KEY}&units=metric`;
// let response = fetch(url_api).then((data) => {
//   data.json().then((fulldata) => console.log(fulldata));
// });

var g = new JSGantt.GanttChart(document.getElementById("GanttChartDIV"), "day");

g.setOptions({
  vCaptionType: "Complete", // Set to Show Caption : None,Caption,Resource,Duration,Complete,
  vQuarterColWidth: 36,
  vDateTaskDisplayFormat: "day dd month yyyy", // Shown in tool tip box
  vDayMajorDateDisplayFormat: "mon yyyy - Week ww", // Set format to dates in the "Major" header of the "Day" view
  vWeekMinorDateDisplayFormat: "dd mon", // Set format to display dates in the "Minor" header of the "Week" view
  vLang: "en",
  vShowTaskInfoLink: 1, // Show link in tool tip (0/1)
  vShowEndWeekDate: 0, // Show/Hide the date for the last day of the week in header for daily
  vAdditionalHeaders: {
    // Add data columns to your table
    status: {
      title: "Status",
    },
    partName: {
      title: "Part Name",
    },
    part: {
      title: "Part",
    },
  },
  vMinDate: Date.now(),
  vEvents: {
    taskname: nameChange,
    res: console.log,
    start: startDateChange,
    end: endDateChange,
    planstart: console.log,
    planend: console.log,
    beforeDraw: () => console.log("before draw listener"),
    afterDraw: callback,
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
  vUseSingleCell: 10000, // Set the threshold cell per table row (Helps performance for large data.
  vFormatArr: ["Day", "Week", "Month", "Quarter"], // Even with setUseSingleCell using Hour format on such a large chart can cause issues in some browsers,
});

// Load from a Json url
JSGantt.parseJSON("./data.json", g);

// Or Adding  Manually
g.AddTaskItemObject({
  pID: 1,
  pName: "Define Chart <strong>API</strong>",
  pStart: "2017-02-25",
  pEnd: "2017-03-17",
  pPlanStart: "2017-04-01",
  pPlanEnd: "2017-04-15 12:00",
  pClass: "ggroupblack",
  pLink: "",
  pMile: 0,
  pRes: "Brian",
  pComp: 0,
  pGroup: 0,
  pParent: 0,
  pOpen: 1,
  pDepend: "",
  pCaption: "",
  pCost: 1000,
  pNotes: "Some Notes text",
  category: "My Category",
  sector: "Finance",
});

g.setScrollTo("today");
g.setCaptionType("Resource");
g.Draw();
// document.addEventListener('DOMContentLoaded', function(){
//   let complete = document.querySelectorAll("td.gpccomplete, .gplan");
//   console.log(complete);
//   complete.forEach(el => {
//     console.log(el.style);
//     el.style.backgroundColor = "red";
//     //el.style.display = "none";
//   });
// });

function callback() {

}

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
  console.log(list, task, event, cell, column)
  const found = list.find(item => item.pID == task.getOriginalID());
  if (!found) {
    return;
  }
  else {
    found[column] = event ? event.target.value : '';
  }
  g.Draw();
}