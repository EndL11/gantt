const commonProperties = {
  // required properties of incoming object
  pID: "pk",
  pStart: "start_date",
  pEnd: "finish_date",
  pPlanStart: "planned_start",
  pPlanEnd: "planned_finish",
  status: "exec_status",
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
  IW: "В черзі",
  IP: "Виконується",
  OC: "На перевірці",
  HD: "Виконано",
  ST: "Надіслано",
  OH: "Призупинено",
  CL: "Відмінено",
};

const setup = async () => {
  //  Creating gantt chart
  var g = new JSGantt.GanttChart(
    document.getElementById("GanttChartDIV"),
    "day"
  );
  const ganttSettings = {
    vCaptionType: "Caption", // Set to Show Caption : None,Caption,Resource,Duration,Complete,
    //  Column width for each chart view (for day, week, month, quarter)
    vDayColWidth: 32,
    vWeekColWidth: 64,
    vMonthColWidth: 128,
    vQuarterColWidth: 256,
    vTooltipDelay: 1000,  //  Delay for tooltip hiding
    vDateTaskDisplayFormat: "DAY dd month yyyy", // Shown in tool tip box
    vDayMajorDateDisplayFormat: "mon yyyy - Week ww", // Set format to dates in the "Major" header of the "Day" view
    vWeekMinorDateDisplayFormat: "dd mon", // Set format to display dates in the "Minor" header of the "Week" view
    vLang: "ua",  //  Setting language for gantt chart
    vShowTaskInfoLink: 0, // Show link in tool tip (0/1)
    vShowEndWeekDate: 0, // Show/Hide the date for the last day of the week in header for daily
    vAdditionalHeaders: {
      // Add data columns to your table
      status: {
        title: "Статус",
      },
    },
    vEvents: {
      beforeDraw: () => console.log("before draw listener"),
      afterDraw: () => afterDrawHandler(g),
    },
    vEventsChange: {
      planstart: editValue,
      planend: editValue,
    },
    vShowCost: false, // Hide cost of tasks
    vShowRes: data?.view_mode == "project_view" ? 1 : 0,  // Show resource column if it's project view
    vShowAddEntries: false, // Hide showing "add button"
    vShowComp: false, // Hide showing % of done
    vShowPlanStartDate: true, // Show plan start date in table
    vShowPlanEndDate: true, //  Show plan end date in table
    vUseSingleCell: 35000, // Set the threshold cell per table row (Helps performance for large data.
    vFormatArr: ["Day", "Week", "Month", "Quarter"], // Even with setUseSingleCell using Hour format on such a large chart can cause issues in some browsers,
  };

  g.addLang("ua", urk_lang);    //  Add urk language (key, object)
  g.setOptions(ganttSettings);  //  Set settings for gantt
  
  data.projects.forEach((el) => {
    g.AddTaskItemObject(createTask(el, g)); // Creating and adding object for gantt chart
  });
  //  Set column order
  g.setColumnOrder([ "vShowRes","vAdditionalHeaders","vShowStartDate","vShowEndDate","vShowPlanStartDate","vShowPlanEndDate","vShowDur"]);
  //  Set total height for gantt
  g.setTotalHeight("92vh");
  //  Hide % of complete task in tooltip
  g.setShowTaskInfoComp(false);
  //  Scroll chart to today
  g.setScrollTo("today");
  //  Draw chart
  g.Draw();
};

function getCookie(name) {
  //  function for getting cookie value by name
  if (!document.cookie) {
    return null;
  }

  const xsrfCookies = document.cookie.split(';')
    .map(c => c.trim())
    .filter(c => c.startsWith(name + '='));

  if (xsrfCookies.length === 0) {
    return null;
  }
  return decodeURIComponent(xsrfCookies[0].split('=')[1]);
}

function editValue(list, task, event, cell, column) {
  //  Handler for "change" event
  const pk = task.getOriginalID();
  const apiType = task.getGroup() == 1 ? "project" : "task";
  const newValue = event.target.value.trim(); //  Getting new value
  let fieldName = (column === "pPlanStart") ? "planned_start" : "planned_finish";
  var formData = new FormData();
  formData.append("pk", pk);
  formData.append(fieldName, newValue);
  formData.append("task_type", apiType);
  editPostRequest(formData);
  const found = list.find((item) => item.pID == task.getOriginalID());
  if (!found) {
    return;
  } else {
    found[column] = event ? event.target.value : "";
  }
}

function editPostRequest(object){
  //  function for sending post request to backend for editing object
  const csrfToken = getCookie('csrftoken');
  fetch("change/", {
    method: 'POST', 
    body: object, 
    headers: {
      'X-CSRFToken': csrfToken,
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
}

function createTask(obj, g) {
  //  gets api project info object
  //  returns object for jsgantt chart

  let newObject = {};
  const isProject = obj.hasOwnProperty("tasks");  //  if incoming object has property "tasks" it means it's project
  newObject = setCommonPropertiesToGanttObject(obj, newObject); //  Set common properties for gantt object
  newObject.pClass = `task_${obj.exec_status.toLowerCase()}`; //  set custom class for task
  newObject.pComp = 0; //  % of complete
  newObject.pName = isProject ? obj.object_code : obj.part_name;  //  Set name for gantt object
  newObject.pRes = isProject ? obj.owner : obj.executor;  //  Set Resource
  newObject.pGroup = isProject ? 1 : 0; //  1 for project task, 0 for task
  newObject.pParent = isProject ? 0 : ""; //  if incoming object project - set 0, otherwise we set it later for each task (set pk for pParent)
  newObject.pOpen = 1; //  0 for rendering colapsed projects and tasks
  newObject.pCaption = isProject ? obj.object_code : obj.part_name; //  Set caption to show on chart (for each task/project)
  if (isProject) {
    //  create, set parent id and add each task of project to gantt chart
    obj.tasks.forEach((task) => {
      const ganttObj = createTask(task, g);
      ganttObj.pParent = obj.pk; //  set parent id from project
      g.AddTaskItemObject(ganttObj);  //  Add task to gantt chart
    });
  }
  return newObject;
}

function afterDrawHandler(g) {
  //  handler for after draw event of gantt chart
  console.log("after draw listener");
  addingEditProjectLink(".ggroupitem .gtaskname div:first-child");  //  Find and add edit link(icon) for each project task on chart
  addingEditingInputToPlanDates(".gplanstartdate div, .gplanenddate div", g);  // Find and add input for each cell of plan start and plan end date
}

function setCommonPropertiesToGanttObject(incomeObject, ganntObject) {
  Object.keys(commonProperties).forEach((key) => {
    const dataProperty = commonProperties[key]; //  incoming data key of each object
    if (key === "status") {
      ganntObject[key] = status[incomeObject[dataProperty]]; //  take status value for status collection
      return;
    }
    ganntObject[key] = incomeObject[dataProperty]; //  take dynamic key for object from properties of jsgantt value
  });
  if (incomeObject.start_date === "None") {
    ganntObject.pStart = null;    
  }
  if(incomeObject.finish_date === "None"){
    ganntObject.pEnd = null;
  }
  return ganntObject;
}

function addingEditProjectLink(selector) {
  //  Add link for editing project to all elements by selector
  const items = document.querySelectorAll(selector);
  items.forEach((item) => {
    const pk = item.lastChild.getAttribute("pk"); //  Get pk in attribute from last child in selector
    const link = document.createElement("a");  //  Create "a" element
    link.classList.add("edit_project_link");
    link.setAttribute("target", "_blank");
    link.setAttribute("href", `/project/${pk}/change`);
    link.innerHTML = `<i style="font-size: 16px;" data-toggle="tooltip" title="" data-placement="right" class="far fa-sticky-note" data-original-title="Відкрити редагування проекту"></i>`;
    item.appendChild(link); //  Insert link into selector element 
  });
}

function addingEditingInputToPlanDates(selector, g){
  //  Add input for editing plan dates
  //  Selector = plan start and plan end class
  const nodes = document.querySelectorAll(selector);  //  Get array of elements by parametrized selector
  nodes.forEach(node => {
    const nodeValueArr = node.innerText.split("/"); //  Get array of data part (dd/mm/yyyy)
    const nodeValue = `${nodeValueArr[2]}-${nodeValueArr[1]}-${nodeValueArr[0]}`; //  Set value for input by format (yyyy-mm-dd)
    const input = document.createElement("input");  //  Create input element
    input.setAttribute("type", "date"); //  Set type "date"
    input.setAttribute("class", "gantt-inputtable");  //  Set gantt class for inputs
    input.setAttribute("value", nodeValue); //  Set correct for input date value
    node.innerText = "";  //  Clear text into plan start and plan end cell
    node.appendChild(input);  // Insert input into cell
    const id = node.parentNode.parentNode.getAttribute("id").split("_")[1]; //  Get id of <tr> element in "id" attribute
    //  Get column name from cell classname (get classname, replace unnecessary classname parts) for creating gantt "change" event 
    const columnName = node.parentNode.getAttribute("class").replace("g", " ").replace("date", " ").trim(); 
    //  Set gantt event "change" for each input in task by custom function in gantt library
    //  Set:
    //  parent node (cell), 
    //  column name (planstart/planend), 
    //  object for handling "change" event from gantt chart object,
    //  object for handling "click" event from gantt chart object, 
    //  list with all tasks
    //  get id for task
    g.addListenerInputCellCustom(node.parentNode, columnName, g.vEventsChange, g.getEventsClickCell(), g.getList(), g.getArrayLocationByID(id));
  });
}

setup();
