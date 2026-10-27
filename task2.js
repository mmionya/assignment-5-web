const tasks = [
  { id: 1, title: "Read JavaScript notes", priority: 1, tags: ["study"], done: false, status: "doing" },
  { id: 2, title: "Write the HTML page", priority: 1, tags: ["study"], done: false, status: "doing" },
  { id: 3, title: "Clean the desk", priority: 3, tags: ["home"], done: false, status: "doing" },
  { id: 4, title: "Practice array methods", priority: 1, tags: ["study"], done: false, status: "todo" },
  { id: 5, title: "Review CSS", priority: 2, tags: ["study"], done: false, status: "todo" },
  { id: 6, title: "Buy groceries", priority: 2, tags: ["home"], done: false, status: "todo" },
  { id: 7, title: "Water the plants", priority: 3, tags: ["home"], done: false, status: "todo" },
  { id: 8, title: "Prepare for the quiz", priority: 1, tags: ["study"], done: false, status: "todo" },
  { id: 9, title: "Organize the books", priority: 3, tags: ["home"], done: true, status: "done" },
  { id: 10, title: "Install the editor", priority: 2, tags: ["study"], done: true, status: "done" }
];

const columns = [
  { status: "todo", title: "To do" },
  { status: "doing", title: "In progress" },
  { status: "done", title: "Done" }
];
const board = document.querySelector("#board-columns");
const tagFilter = document.querySelector("#board-tag");
const sortSelect = document.querySelector("#board-sort");
const progress = document.querySelector("#board-progress");
const summary = document.querySelector("#board-summary");
const message = document.querySelector("#board-message");

for (const tag of ["all", ...new Set(tasks.flatMap(task => task.tags))]) {
  const option = document.createElement("option");
  option.value = tag;
  option.textContent = tag === "all" ? "All tags" : tag;
  tagFilter.append(option);
}

function showMessage(text, isError = false) {
  message.textContent = text;
  message.className = isError ? "error" : "success";
}

function render() {
  const counts = { todo: 0, doing: 0, done: 0 };
  let completed = 0;
  for (const task of tasks) {
    counts[task.status]++;
    if (task.done) completed++;
  }

  const percentage = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
  progress.value = percentage;
  progress.textContent = `${percentage}%`;
  summary.textContent = `Completed: ${completed}/${tasks.length} (${percentage}%). ` +
    `To do: ${counts.todo}. In progress: ${counts.doing}. Done: ${counts.done}.`;

  const visibleTasks = tasks.filter(task => tagFilter.value === "all" || task.tags.includes(tagFilter.value));
  visibleTasks.sort((a, b) => sortSelect.value === "title"
    ? a.title.localeCompare(b.title)
    : a.priority - b.priority || a.id - b.id);
  board.replaceChildren();

  columns.forEach((column, index) => {
    const section = document.createElement("section");
    section.className = "board-column";
    const heading = document.createElement("h3");
    heading.textContent = `${column.title} (${counts[column.status]}${index === 1 ? "/3" : ""})`;
    section.append(heading);
    const list = document.createElement("ul");
    const columnTasks = visibleTasks.filter(task => task.status === column.status);

    for (const task of columnTasks) {
      const card = document.createElement("li");
      card.className = "task-card";
      card.dataset.id = task.id;
      const title = document.createElement("h4");
      title.textContent = task.title;
      const meta = document.createElement("p");
      meta.className = "card-meta";
      meta.textContent = `${task.tags.join(", ")} · Priority: ${["", "High", "Medium", "Low"][task.priority]}`;
      const actions = document.createElement("div");
      actions.className = "card-actions";

      for (const direction of [-1, 1]) {
        const button = document.createElement("button");
        const destination = columns[index + direction];
        button.type = "button";
        button.dataset.move = direction;
        button.disabled = !destination;
        button.textContent = destination ? `Move to ${destination.title}` : (direction === -1 ? "Start" : "Finished");
        button.setAttribute("aria-label", `${button.textContent}: ${task.title}`);
        actions.append(button);
      }

      card.append(title, meta, actions);
      list.append(card);
    }

    if (columnTasks.length === 0) {
      const empty = document.createElement("li");
      empty.className = "empty-state";
      empty.textContent = "No tasks to show.";
      list.append(empty);
    }
    section.append(list);
    board.append(section);
  });
}

board.addEventListener("click", event => {
  const button = event.target.closest("button[data-move]");
  if (!button || !board.contains(button) || button.disabled) return;
  const task = tasks.find(item => item.id === Number(button.closest("[data-id]").dataset.id));
  const currentIndex = columns.findIndex(column => column.status === task.status);
  const destination = columns[currentIndex + Number(button.dataset.move)];
  let inProgress = 0;
  for (const item of tasks) {
    if (item.status === "doing") inProgress++;
  }

  if (destination.status === "doing" && inProgress >= 3) {
    showMessage("In progress is full (maximum 3 tasks). Move a task out first.", true);
    return;
  }

  task.status = destination.status;
  task.done = task.status === "done";
  showMessage(`Moved “${task.title}” to ${destination.title}.`);
  render();
});

tagFilter.addEventListener("change", () => {
  showMessage("");
  render();
});
sortSelect.addEventListener("change", () => {
  showMessage("");
  render();
});

render();
