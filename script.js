//TODO
// [] add a task to the database local storage
// [/] add sound when task done
// [/] add refresh for the next day
// [/] add check when task is done

// toggles modal for creating task
const createTask = document.getElementById("create-task");
function toggleCreateTask() {
    if (createTask.hasAttribute("open")) {
        createTask.removeAttribute("open");
    } else {
        createTask.setAttribute("open", "");
    }
}

const taskForm = document.getElementById("task-form");
// stores all tasks from local storage in an array
let taskList = JSON.parse(localStorage.getItem("taskList")) || [];

function saveTasksToLocalStorage() {
    localStorage.setItem("taskList", JSON.stringify(taskList));
}

taskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // collect form data
    const taskName = document.getElementById("task").value;
    const minutes = parseInt(document.getElementById("minutes").value);
    const seconds = parseInt(document.getElementById("seconds").value);

    // add task to taskList
    taskList.push({
        taskName,
        totalTime: minutes * 60 + seconds,
        taskId: Date.now(),
        timeEnd: null,
        countdown: null,
    });

    saveTasksToLocalStorage();
    renderTasks();
});

// will render all tasks in database
function renderTasks() {
    const taskListDom = document.getElementById("task-list");
    console.log(taskList);
    // container for all tasks
    let taskCombinedDom = "";

    // iterate through taskList and add to taskCombinedDom
    taskList.forEach((task) => {
        // check if task needs to be refreshed
        if (task.timeEnd != new Date().toJSON().slice(0, 10)) {
            task.timeEnd = null;
        }
        // checks if task is done if yes then add &#x2705; to taskDone
        let taskDone = "";
        if (task.timeEnd) {
            taskDone = "✅";
            console.log(taskDone);
        }

        taskCombinedDom += `
        <article class="card">
            <div class="task-card-left">
                <h3>${taskDone}${task.taskName}</h3>
            </div>
            <div class="task-card-right">
                <h4 id="time-${task.taskId}">${formatTime(task.totalTime)}</h4>
                <button id="play-button" onclick="startCountdown(${
                    task.taskId
                })">
                &#x23ef;
                </button>
                <button onclick="toggleEditTask(${
                    task.taskId
                })">&#128296;</button>
            </div>
        </article>
        `;
    });

    // add taskCombinedDom to taskListDom
    taskListDom.innerHTML = taskCombinedDom;
}

// format seconds to minutes:seconds
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    const formattedSecs = String(secs).padStart(2, "0");

    return `${mins}:${formattedSecs}`;
}

// play alarm sound
const alarmSound = new Audio("alarm.mp3");
alarmSound.volume = 0.4;

//start counting down
function startCountdown(taskId) {
    const task = taskList.find((task) => task.taskId === taskId);

    if (task.countdown) {
        // Pause the countdown if it's already running
        console.log("Pause");
        clearInterval(task.countdown); // Pause the countdown
        task.countdown = null; // Reset countdown
    } else {
        task.countdown = setInterval(() => {
            console.log("Current Total Time: " + task.totalTime);
            task.totalTime--; // Decrease totalTime by 1 second

            if (task.totalTime <= 0) {
                alarmSound.play();
                task.timeEnd = new Date().toJSON().slice(0, 10);
                task.totalTime = 0;
                saveTasksToLocalStorage();
                renderTasks();

                clearInterval(task.countdown);
                console.log("Time's up!");
            } else {
                const timeDom = document.getElementById(`time-${task.taskId}`);
                timeDom.innerHTML = formatTime(task.totalTime);
            }
        }, 1000);
    }
}

function pauseCountdown(taskId) {
    const task = taskList.find((task) => task.id === taskId);
    clearInterval(task.countdown);
}

// toggles modal for creating task
const editTask = document.getElementById("edit-task");

// stores the id of the task being edited
let currentTaskEditId;

function toggleEditTask(taskId) {
    if (editTask.hasAttribute("open")) {
        editTask.removeAttribute("open");
    } else {
        editTask.setAttribute("open", "");
        currentTaskEditId = taskId;
        console.log(taskId);

        const task = taskList.find((task) => task.taskId === currentTaskEditId);

        const editTaskName = document.getElementById("edit-task-name");
        const editMinutes = document.getElementById("edit-minutes");
        const editSeconds = document.getElementById("edit-seconds");

        editTaskName.value = task.taskName;
        editMinutes.value = Math.floor(task.totalTime / 60);
        editSeconds.value = task.totalTime % 60;
    }
}

function editTaskForm() {
    const task = taskList.find((task) => task.taskId === currentTaskEditId);

    // get data from edit forms
    const editTaskName = document.getElementById("edit-task-name").value;
    const editMinutes = parseInt(document.getElementById("edit-minutes").value);
    const editSeconds = parseInt(document.getElementById("edit-seconds").value);

    if (editTaskName) task.taskName = editTaskName;
    if (
        !isNaN(editMinutes) &&
        editMinutes >= 0 &&
        !isNaN(editSeconds) &&
        editSeconds >= 0
    ) {
        task.totalTime = editMinutes * 60 + editSeconds;
    }
    saveTasksToLocalStorage();
    toggleEditTask();
    renderTasks();
    console.log(task);
}

function deleteTask() {
    // Remove the task with the matching taskId from taskList
    taskList = taskList.filter((task) => task.taskId !== currentTaskEditId);

    saveTasksToLocalStorage();
    toggleEditTask();
    renderTasks();
}

// render all tasks when opening the app
renderTasks();
