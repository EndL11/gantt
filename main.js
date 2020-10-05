const allProperties = {
  pID: "pk",
  pStart: "start_date",
  pEnd: "finish_date",
  pPlanStart: "planned_start",
  pPlanEnd: "planned_finish",
  status: "exec_status",
  pRes: "executor",
  pName: "name",
};

const urk_lang = {
  january: "Січень",
  february: "Лютий",
  march: "Березень",
  april: "Квітень",
  maylong: "Травень",
  june: "Червень",
  july: "Липень",
  august: "Серпень",
  september: "Вересень",
  october: "Жовтень",
  november: "Листопад",
  december: "Грудень",
  jan: "Січ",
  feb: "Лют",
  mar: "Берез",
  apr: "Квіт",
  may: "Трав",
  jun: "Черв",
  jul: "Лип",
  aug: "Серп",
  sep: "Верес",
  oct: "Жовт",
  nov: "Лист",
  dec: "Груд",
  sunday: "Неділя",
  monday: "Понеділок",
  tuesday: "Вівторок",
  wednesday: "Середа",
  thursday: "Четвер",
  friday: "П'ятниця",
  saturday: "Субота",
  sun: "	Нд",
  mon: "	Пн",
  tue: "	Вт",
  wed: "	Ср",
  thu: "	Чт",
  fri: "	Пт",
  sat: "	Сб",
  resource: "Виконавець",
  duration: "Тривалість",
  comp: "% виконання",
  completion: "Виконано",
  startdate: "Поч. дата",
  planstartdate: "План. поч. дата",
  enddate: "Кін. дата",
  planenddate: "План. кін. дата",
  cost: "Cost",
  moreinfo: "Деталі",
  notes: "Подробиці",
  format: "Формат",
  hour: "Година",
  day: "День",
  week: "Тиждень",
  month: "Місяць",
  quarter: "Квартал",
  hours: "Годин",
  days: "Днів",
  weeks: "Тижнів",
  months: "Місяців",
  quarters: "Кварталів",
  hr: "год.",
  dy: "дн.",
  wk: "тиж.",
  mth: "міс.",
  qtr: "кв.",
  hrs: "год.",
  dys: "дн.",
  wks: "тиж.",
  mths: "міс.",
  qtrs: "кв.",
  tooltipLoading: "Завантаження...",
};

const status = {
  ToDo: "В черзі",
  InProgress: "Виконується",
  OnChecking: "На перевірці",
  Done: "Виконано",
};

const setup = async () => {
  //let resources = await getResponseData("api_resources.json");
  var g = new JSGantt.GanttChart(
    document.getElementById("GanttChartDIV"),
    "day"
  );

  data.forEach((el) => {
    g.AddTaskItemObject(createTaskFromProject(el, g));
  });

  g.addLang("ua", urk_lang);

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
    vLang: "ua",
    vShowTaskInfoLink: 0, // Show link in tool tip (0/1)
    vShowEndWeekDate: 0, // Show/Hide the date for the last day of the week in header for daily
    vAdditionalHeaders: {
      // Add data columns to your table
      status: {
        title: "Статус",
      },
      object_code: {
        title: "Object_code",
      },
    },
    vEvents: {
      // taskname: console.log,
      // res: console.log,
      // start: console.log,
      // end: console.log,
      // planstart: console.log,
      // planend: console.log,
      beforeDraw: () => console.log("before draw listener"),
      afterDraw: afterDrawHandler,
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

  g.Draw();
  g.setScrollTo("today");
};

function editValue(list, task, event, cell, column) {
  const pk = task.getOriginalID();
  const apiType = task.getGroup() == 1 ? "project" : "task";
  const newValue = event.target.value.trim().replace(" ", "-");
  let fieldName = !allProperties[column] ? column : allProperties[column];
  const api_request = `/${apiType}/${pk}/?${fieldName}=${newValue}`;
  console.log(api_request);
  //console.log(list, task, event, cell, column);
  const found = list.find((item) => item.pID == task.getOriginalID());
  if (!found) {
    return;
  } else {
    found[column] = event ? event.target.value : "";
  }
}

function createTaskFromProject(obj, g) {
  //  gets api project info object
  //  returns object for jsgantt chart

  let newObject = {};

  // newObject.status = obj.hasOwnProperty("exec_status")
  //   ? status[obj.exec_status]
  //   : "";
  Object.keys(allProperties).forEach((key) => {
    if (key === "status") {
      newObject[key] = status[obj[allProperties[key]]];
      return;
    }
    newObject[key] = obj[allProperties[key]];
  });
  newObject.pClass = `task_${obj.exec_status.toLowerCase()}`;
  // newObject.pStart = obj.start_date;
  // newObject.pEnd = obj.finish_date;
  // newObject.pID = obj.pk;
  // newObject.pName = obj.name;
  // newObject.pPlanStart = obj.planned_start;
  // newObject.pPlanEnd = obj.planned_finish;
  // newObject.pRes = obj.hasOwnProperty("pm") ? obj.pm : "";
  newObject.pComp = 0;
  newObject.object_code = obj.object_code;
  newObject.pGroup = 1; //  1 for project task, 0 for task
  newObject.pParent = 0;
  newObject.pOpen = 1;
  obj.tasks.forEach((task) =>
    g.AddTaskItemObject(createTaskFromProjectTask(task, obj.pk))
  );
  return newObject;
}

function createTaskFromProjectTask(obj, projectID) {
  //  gets api task info object
  //  returns object for jsgantt chart
  let newObject = {};

  // newObject.status = obj.hasOwnProperty("exec_status")
  //   ? status[obj.exec_status]
  //   : "";
  Object.keys(allProperties).forEach((key) => {
    if (key === "status") {
      newObject[key] = status[obj[allProperties[key]]];
      return;
    }
    newObject[key] = obj[allProperties[key]];
  });
  newObject.pClass = `task_${obj.exec_status.toLowerCase()}`;
  // newObject.pStart = obj.start_date;
  // newObject.pEnd = obj.finish_date;
  // newObject.pID = obj.pk;
  // newObject.pPlanStart = obj.planned_start;
  // newObject.pPlanEnd = obj.planned_finish;
  // newObject.pName = obj.part_name;
  newObject.object_code = obj.task;
  // newObject.pRes = obj.hasOwnProperty("executor") ? obj.executor : "";
  newObject.pComp = 0;
  newObject.pGroup = 0; //  1 for project task, 0 for task
  newObject.pParent = projectID;
  newObject.pOpen = 1;
  newObject.pNotes = obj.hasOwnProperty("warning") ? obj.warning : "";
  return newObject;
}

function hideElementsInputBySelector(selector){
  const allDurationInputElement = document.querySelectorAll(selector);
  for (let i = 0; i < allDurationInputElement?.length; i++) {
    const inputValue = allDurationInputElement[i].firstChild.value;
    console.log(allDurationInputElement[i].firstChild);
    allDurationInputElement[i].firstChild.remove();
    allDurationInputElement[i].innerHTML = inputValue;
  }
}

function afterDrawHandler(){
  console.log("after draw listener");
  hideElementsInputBySelector(".gduration div");
  hideElementsInputBySelector(".ggroupitem .gresource div");
  hideElementsInputBySelector(".gstartdate div, .genddate div");
}

setup();
