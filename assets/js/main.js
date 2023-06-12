// selectors
const todoInput = document.querySelector(".todo-input");
const todoForm = document.querySelector(".todo-form");
const todoList = document.querySelector(".todo-list");
const selectFilter = document.querySelector(".filter__todos");
const selectSort = document.querySelector(".sort__todos");
const backdrop = document.querySelector(".backdrop");
const modal = document.querySelector(".modal");
const closeModalBtn = document.querySelector(".close__modal");
const modalInput = document.querySelector(".modal__input");
const modalForm = document.querySelector(".modal__form");
// Events
document.addEventListener("DOMContentLoaded", (e) => {
  const ui = new Ui();
  ui.filterTodos(e);
  Storage.saveSettings();
  refrashEdit();
});
// Todo Events
todoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!todoInput.value) return null;
  const todos = new Todos();
  const todoData = todos.addNewTodo(e);
  const newTodos = Storage.saveTodo(todoData);
  const ui = new Ui();
  ui.sortTodos(newTodos);
});
selectFilter.addEventListener("change", (e) => {
  Storage.saveNewSettings(e);
  const ui = new Ui();
  ui.filterTodos(e);
});
selectSort.addEventListener("change", (e) => {
  Storage.saveNewSettings(e);
  const ui = new Ui();
  ui.sortTodos(e);
});
// Modal Events
backdrop.addEventListener("click", closeModal);
closeModalBtn.addEventListener("click", closeModal);
modalForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!modalInput.value) return null;
  const ui = new Ui();
  ui.saveEditTodo(e);
});
// Class
class Todos {
  addNewTodo(e) {
    if (!todoInput.value) return null;
    const newTodo = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      titel: todoInput.value,
      isCompleted: false,
      edit: false,
    };
    return newTodo;
  }
}
class Ui {
  // Show Todo
  showTodos(todos) {
    let result = "";
    todos.forEach((todo) => {
      result += `<li class="todo ${todo.isCompleted && "completed"}">
            <div class="status"></div>
            <p class="todo__title">${todo.titel}</p>
            <div class="todo__options">
              <div class="todo__btns">
                <button class="todo__check" data-todo-id=${todo.id}>
                  <i class="far fa-check-square"></i>
                </button>
                <button class="todo__edit" data-todo-id=${todo.id}>
                  <i class="far fa-edit"></i>
                </button>
                <button class="todo__remove" data-todo-id=${todo.id}>
                  <i class="far fa-trash-alt"></i>
                </button>
              </div>
              <span class="todo__createdat">${new Date(
                todo.createdAt
              ).toLocaleDateString("fa-ir")}</span>
            </div>
          </li>`;
    });
    todoList.innerHTML = result;
    todoInput.value = "";

    const optionBtns = [...document.querySelectorAll(".todo button")];
    optionBtns.forEach((btn) =>
      btn.addEventListener("click", (e) => {
        const optionBtn = [...e.target.classList][0];
        switch (optionBtn) {
          case "todo__remove": {
            this.removeTodo(e);
            this.filterTodos(e);
            break;
          }
          case "todo__check": {
            this.checkTodo(e);
            this.filterTodos(e);
            break;
          }
          case "todo__edit": {
            this.editTodo(e);
            break;
          }
        }
      })
    );
  }
  // Todo Options
  removeTodo(e) {
    let todos = Storage.getAllTodos();
    const todoId = Number(e.target.dataset.todoId);
    todos = todos.filter((t) => t.id !== todoId);
    Storage.saveAllTodos(todos);
  }
  checkTodo(e) {
    let todos = Storage.getAllTodos();
    const todoId = Number(e.target.dataset.todoId);
    const todo = todos.find((t) => t.id === todoId);
    todo.isCompleted = !todo.isCompleted;
    Storage.saveAllTodos(todos);
  }
  editTodo(e) {
    backdrop.classList.remove("hidden");
    modal.classList.remove("hidden");
    let todos = Storage.getAllTodos();
    const todoId = Number(e.target.dataset.todoId);
    const todo = todos.find((t) => t.id === todoId);
    todo.edit = !todo.edit;
    modalInput.value = todo.titel;
    modalInput.focus();
    Storage.saveAllTodos(todos);
  }
  saveEditTodo(e) {
    let todos = Storage.getAllTodos();
    const todo = todos.find((t) => t.edit);
    todo.titel = modalInput.value;
    todo.edit = false;
    Storage.saveAllTodos(todos);
    backdrop.classList.add("hidden");
    modal.classList.add("hidden");
    this.filterTodos();
  }
  // Filter & Sort
  filterTodos(e) {
    const todos = Storage.getAllTodos();
    const filterValue = Storage.getFilterValue();
    switch (filterValue) {
      case "all": {
        this.showTodos(todos);
        break;
      }
      case "completed": {
        const filteredTodos = todos.filter((t) => t.isCompleted);
        this.showTodos(filteredTodos);
        break;
      }
      case "uncompleted": {
        const filteredTodos = todos.filter((t) => !t.isCompleted);
        this.showTodos(filteredTodos);
        break;
      }

      default:
        this.showTodos(todos);
    }
  }
  sortTodos(e) {
    const todos = Storage.getAllTodos();
    const sortValue = Storage.getSortValue();
    switch (sortValue) {
      case "addeddate": {
        const sortedTodos = todos.sort((a, b) => a.id - b.id);
        Storage.saveAllTodos(sortedTodos);
        this.filterTodos();
        break;
      }
      case "duedate": {
        const sortedTodos = todos.sort((a, b) => b.id - a.id);
        Storage.saveAllTodos(sortedTodos);
        this.filterTodos();
        break;
      }
      default:
        this.filterTodos();
    }
  }
}
class Storage {
  // Todos
  static getAllTodos() {
    return JSON.parse(localStorage.getItem("todos")) || [];
  }
  static saveTodo(todo) {
    return localStorage.setItem(
      "todos",
      JSON.stringify([...this.getAllTodos(), todo])
    );
  }
  static saveAllTodos(todos) {
    localStorage.setItem("todos", JSON.stringify(todos));
  }
  // Settings
  static getSettings() {
    return JSON.parse(localStorage.getItem("settings")) || [];
  }
  static saveSettings() {
    const settings = this.getSettings();
    if (!settings.length) {
      const settings = [
        {
          filter: "all",
          sort: "addeddate",
        },
      ];
      localStorage.setItem("settings", JSON.stringify(settings));
    }
    const [{filter, sort}] = settings;
    selectFilter.value = filter;
    selectSort.value = sort;
  }
  static saveNewSettings(e) {
    const settings = this.getSettings();
    if (e.target.classList.contains("sort__todos")) {
      settings[0].sort = e.target.value;
      localStorage.setItem("settings", JSON.stringify(settings));
    } else if (e.target.classList.contains("filter__todos")) {
      settings[0].filter = e.target.value;
      localStorage.setItem("settings", JSON.stringify(settings));
    }
  }
  static getFilterValue() {
    let settings = this.getSettings();
    if (settings.length) return settings[0].filter;
  }
  static getSortValue() {
    const savedSettings = JSON.parse(localStorage.getItem("settings")) || [];
    if (savedSettings.length) return savedSettings[0].sort;
  }
}
// Function
function closeModal() {
  backdrop.classList.add("hidden");
  modal.classList.add("hidden");
  const todos = Storage.getAllTodos();
  const todo = todos.find((t) => t.edit);
  todo.edit = !todo.edit;
  Storage.saveAllTodos(todos);
}
function refrashEdit() {
  const todo = Storage.getAllTodos().find((t) => t.edit);
  if (todo) {
    backdrop.classList.remove("hidden");
    modal.classList.remove("hidden");
    modalInput.value = todo.titel;
    modalInput.focus();
  }
}
