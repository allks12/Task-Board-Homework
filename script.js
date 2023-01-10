const toDo = document.querySelector(".todo");
const inProgress = document.querySelector(".in-progress");
const finished = document.querySelector(".done");

function createToDo(title, description) {
  const headline = document.createElement("h3");
  headline.textContent = title;
  const content = document.createElement("p");
  content.textContent = description;
  const toDoTask = document.createElement("li");
  toDoTask.appendChild(headline);
  toDoTask.appendChild(content);
  toDoTask.classList.add("todo__item");
  toDoTask.addEventListener("click", (event) => event.target.classList.toggle("selected"));
  return toDoTask;
};

function moveToDo(card, source, destination) {
  source.removeChild(card);
  destination.appendChild(card);
  card.classList.remove("selected");
}

function request(url, method, body, callback) {
  fetch(url, {
    method: method,
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  }).then(data => {
    if (data.ok) {
      return data.json();
    }
  }).then(data => {
    if (data !== undefined) {
      callback(data);
    }
  });
};

document.querySelector("form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.target;
  const title = form.querySelector("input").value;
  const description = form.querySelector("textarea").value;
  const body = {
    title: title,
    description: description,
    isInProgress: false,
    completed: false
  };
  const callback = data => {
    const { id, title, description } = data;
    const toDoTask = createToDo(title, description);
    toDoTask.setAttribute("data-task-id", id);
    toDo.appendChild(toDoTask);
  };
  request("http://localhost:3000/tasks", "POST", body, callback);
  form.reset();
});

document.querySelector("#move-to-in-progress").addEventListener("click", _ => {
  toDo.querySelectorAll(".selected").forEach((card) => {
    const body = {
      title: card.children[0].textContent,
      description: card.children[1].textContent,
      isInProgress: true,
      completed: false
    };
    const callback = _ => moveToDo(card, toDo, inProgress);
    request(`http://localhost:3000/tasks/${card.getAttribute("data-task-id")}`, "PUT", body, callback);
  });
});

document.querySelector("#move-to-finished").addEventListener("click", _ => {
  inProgress.querySelectorAll(".selected").forEach((card) => {
    const body = {
      title: card.children[0].textContent,
      description: card.children[1].textContent,
      isInProgress: false,
      completed: true
    };
    const callback = _ => moveToDo(card, inProgress, finished);
    request(`http://localhost:3000/tasks/${card.getAttribute("data-task-id")}`, "PUT", body, callback);
  });
});

fetch("http://localhost:3000/tasks").then(data => data.json()).then(data => {
  data.forEach(task => {
    const { id, title, description, isInProgress, completed } = task;
    const toDoTask = createToDo(title, description);
    toDoTask.setAttribute("data-task-id", id);
    if (completed) {
      finished.appendChild(toDoTask);
    } else if (isInProgress) {
      inProgress.appendChild(toDoTask);
    } else {
      toDo.appendChild(toDoTask);
    }
  });
});