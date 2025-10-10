import { getUserIds } from "./common.mjs";
import { getData, addData, clearData } from "./storage.mjs";
import { computeRevisions, getDayWithSuffix } from "./helper.mjs";

// --- DOM code only runs in browser ---
if (typeof document !== "undefined") {
  // --- Build page structure ---
  const h1 = document.createElement("h1");
  h1.textContent = "Spaced Repetition Tracker";

  const userSelectLabel = document.createElement("label");
  userSelectLabel.textContent = "Select User: ";
  userSelectLabel.setAttribute("for", "userSelect");

  const userSelect = document.createElement("select");
  userSelect.id = "userSelect";
  userSelect.innerHTML = `
    <option value="">-- Choose a user --</option>
    ${getUserIds().map(id => `<option value="${id}">User ${id}</option>`).join("")}
  `;

  const messageArea = document.createElement("div");
  messageArea.id = "message";
  messageArea.setAttribute("aria-live", "polite");

  const agendaList = document.createElement("ul");
  agendaList.id = "agendaList";

  const form = document.createElement("form");
  form.id = "addForm";

  // --- Topic input ---
  const topicLabel = document.createElement("label");
  topicLabel.textContent = "Topic: ";
  topicLabel.setAttribute("for", "topicInput");

  const topicInput = document.createElement("input");
  topicInput.type = "text";
  topicInput.id = "topicInput";
  topicInput.required = true;
  topicInput.placeholder = "Enter topic name";
  topicInput.style.padding = "0.5em";

  // --- Date input ---
  const dateLabel = document.createElement("label");
  dateLabel.textContent = "Start Date: ";
  dateLabel.setAttribute("for", "dateInput");

  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.id = "dateInput";
  dateInput.required = true;
  dateInput.valueAsDate = new Date();
  dateInput.style.padding = "0.5em";

  // --- Buttons ---
  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = "Add Topic";
  submitBtn.style.padding = "0.7em 1em";

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.textContent = "Delete Topic";
  deleteBtn.style.padding = "0.7em 1em";

  deleteBtn.addEventListener("click", () => {
    const userId = userSelect.value;
    if (!userId) {
      alert("Please select a user first.");
    } else if (confirm(`Delete all topics for ${userId}?`)) {
      clearData(userId);
      renderAgenda(userId);
    }
  });

  // --- Fieldsets ---
  const topicField = document.createElement("fieldset");
  const topicLegend = document.createElement("legend");
  topicLegend.textContent = "Topic Details";
  topicField.appendChild(topicLegend);
  topicField.append(topicLabel, topicInput);

  const dateField = document.createElement("fieldset");
  dateField.append(dateLabel, dateInput);

  const buttonField = document.createElement("fieldset");
  buttonField.append(submitBtn, deleteBtn);

  form.append(topicField, dateField, buttonField);

  document.body.append(h1, userSelectLabel, userSelect, messageArea, agendaList, form);

  // --- Event handlers ---
  userSelect.addEventListener("change", () => {
    const userId = userSelect.value;
    if (!userId) {
      renderMessage("Please select a user.");
      return;
    }
    renderAgenda(userId);
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const userId = userSelect.value;
    if (!userId) return alert("Please select a user first.");

    const topic = topicInput.value.trim();
    const dateStr = dateInput.value;
    if (!topic || !dateStr) return alert("Please fill in both fields.");

    const startDate = new Date(dateStr);
    const newItems = computeRevisions(topic, startDate);
    addData(userId, newItems);

    form.reset();
    dateInput.valueAsDate = new Date();
    topicInput.focus();
    renderAgenda(userId);
  });

  function renderAgenda(userId) {
    const items = getData(userId) || [];
    const today = new Date().toISOString().split("T")[0];
    const future = items.filter(i => i.date >= today).sort((a, b) => a.date.localeCompare(b.date));
    future.length ? renderList(future) : renderMessage("No agenda for this user.");
  }

  function renderList(items) {
    agendaList.innerHTML = "";
    messageArea.textContent = "";
    for (const { topic, date } of items) {
      const d = new Date(date);
      const formattedDate = `${getDayWithSuffix(d.getDate())} ${d.toLocaleString("en-GB", { month: "short" })} ${d.getFullYear()}`;
      const li = document.createElement("li");
      li.textContent = `${topic}, ${formattedDate}`;
      agendaList.appendChild(li);
    }
  }

  function renderMessage(msg) {
    messageArea.textContent = msg;
    agendaList.innerHTML = "";
  }
}
