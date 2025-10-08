

import { getUserIds } from './public/common.mjs';
import { getData, addData } from './public/storage.mjs';

// --- Build page structure ---
const h1 = document.createElement('h1');
h1.textContent = 'Spaced Repetition Tracker';

// Accessible user selector
const userSelectLabel = document.createElement('label');
userSelectLabel.textContent = 'Select User: ';
userSelectLabel.setAttribute('for', 'userSelect');

const userSelect = document.createElement('select');
userSelect.id = 'userSelect';
userSelect.innerHTML = `
  <option value="">-- Choose a user --</option>
  ${getUserIds()
    .map(id => `<option value="${id}">User ${id}</option>`)
    .join('')}
`;

// Message + agenda container
const messageArea = document.createElement('div');
messageArea.id = 'message';
messageArea.setAttribute('aria-live', 'polite');

const agendaList = document.createElement('ul');
agendaList.id = 'agendaList';

// Accessible form
const form = document.createElement('form');
form.id = 'addForm';

const topicLabel = document.createElement('label');
topicLabel.textContent = 'Topic: ';
topicLabel.setAttribute('for', 'topicInput');

const topicInput = document.createElement('input');
topicInput.type = 'text';
topicInput.id = 'topicInput';
topicInput.required = true;
topicInput.placeholder = 'Enter topic name';

const dateLabel = document.createElement('label');
dateLabel.textContent = 'Start Date: ';
dateLabel.setAttribute('for', 'dateInput');

const dateInput = document.createElement('input');
dateInput.type = 'date';
dateInput.id = 'dateInput';
dateInput.required = true;
dateInput.valueAsDate = new Date(); // default to today

const submitBtn = document.createElement('button');
submitBtn.type = 'submit';
submitBtn.textContent = 'Add Topic';

const deleteBtn = document.createElement('button');
deleteBtn.textContent = 'Delete Topic';
deleteBtn.type = 'button'; // Prevent form submission
deleteBtn.addEventListener('click', () => {
  const userId = userSelect.value;
  if (!userId) {
    alert('Please select a user first.');
  }
  else{
    localStorage.removeItem(`stored-data-user-${userId}`);
    renderAgenda(userId);
  }
});


form.append(topicLabel, topicInput, dateLabel, dateInput, submitBtn, deleteBtn);

// Add all elements to body
document.body.append(h1, userSelectLabel, userSelect, messageArea, agendaList, form);

// --- Event: When user is selected ---
userSelect.addEventListener('change', () => {
  const userId = userSelect.value;
  if (!userId) {
    renderMessage('Please select a user.');
    return;
  }
  renderAgenda(userId);
});

// --- Event: When form is submitted ---
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const userId = userSelect.value;
  if (!userId) {
    alert('Please select a user first.');
    return;
  }

  const topic = topicInput.value.trim();
  const dateStr = dateInput.value;

  if (!topic || !dateStr) {
    alert('Please fill in both fields.');
    return;
  }

  const startDate = new Date(dateStr);
  const newItems = computeRevisions(topic, startDate);
  addData(userId, newItems);

  form.reset();
  dateInput.valueAsDate = new Date(); // reset to today
  topicInput.focus();

  renderAgenda(userId);
});

// --- Helper: Compute spaced repetition dates ---
export function computeRevisions(topic, startDate) {
  const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };
  const addMonths = (date, months) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  };

  const intervals = [
    addDays(startDate, 7),     // 1 week
    addMonths(startDate, 1),   // 1 month
    addMonths(startDate, 3),   // 3 months
    addMonths(startDate, 6),   // 6 months
    addMonths(startDate, 12),  // 1 year
  ];

  return intervals.map(d => ({
    topic,
    date: d.toISOString().split('T')[0],
  }));
}

// --- Helper: Render agenda for selected user ---
function renderAgenda(userId) {
  const items = getData(userId) || [];
  const today = new Date().toISOString().split('T')[0];

  const future = items
    .filter(item => item.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (future.length === 0) {
    renderMessage('No agenda for this user.');
    return;
  }

  renderList(future);
}

// --- Render list of agenda items ---
function renderList(items) {
  agendaList.innerHTML = '';
  messageArea.textContent = '';

  const getDayWithSuffix = (day) => {
    if (day > 3 && day < 21) return `${day}th`; // 11th–13th
    switch (day % 10) {
      case 1: return `${day}st`;
      case 2: return `${day}nd`;
      case 3: return `${day}rd`;
      default: return `${day}th`;
    }
  };

  for (const { topic, date } of items) {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.toLocaleString('en-GB', { month: 'short' });
    const year = d.getFullYear();

    const formattedDate = `${getDayWithSuffix(day)} ${month} ${year}`;

    const li = document.createElement('li');
    li.textContent = `${topic} - ${formattedDate}`;
    agendaList.appendChild(li);
  }
}

// --- Render message ---
function renderMessage(msg) {
  messageArea.textContent = msg;
  agendaList.innerHTML = '';
}