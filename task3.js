const form = document.querySelector('#character-form');
const fields = [...form.querySelectorAll('input, select')];
const skillNames = ['strength', 'agility', 'intelligence', 'magic'];
const takenNames = ['admin', 'hero', 'merlin'];
const classRules = {
  warrior: ['strength', 'agility'],
  mage: ['magic', 'intelligence'],
  rogue: ['agility', 'intelligence']
};
const totalPoints = 20;
const touched = new Set();
const errorSummary = document.querySelector('#form-errors');
let submitted = false;
form.noValidate = true;

function readCharacter() {
  const data = Object.fromEntries(new FormData(form));
  data.name = data.name.trim();
  for (const skill of skillNames) data[skill] = Number(data[skill]);
  return data;
}

function sumSkills(data) {
  let total = 0;
  for (const skill of skillNames) total += data[skill];
  return total;
}

function fieldError(field, data) {
  if (!field.checkValidity()) {
    if (field.validity.valueMissing) return 'Please fill in this field.';
    if (field.name === 'name') return 'Use 2–20 English letters/spaces, starting with a letter.';
    return 'Enter a whole number from 1 to 10.';
  }
  if (field.name === 'name') {
    if (data.name.length < 2) return 'Use at least 2 letters.';
    if (takenNames.includes(data.name.toLowerCase())) return 'This name is already taken.';
  }
  if (skillNames.includes(field.name)) {
    const messages = [];
    if (sumSkills(data) !== totalPoints) messages.push('All skills must total exactly 20.');
    const rule = classRules[data.class];
    if (rule && field.name === rule[0] && data[field.name] < 6) messages.push('This class needs this skill at 6 or more.');
    if (rule && field.name === rule[1] && data[field.name] < 4) messages.push('This class needs this skill at 4 or more.');
    return messages.join(' ');
  }
  return '';
}

function validate() {
  const data = readCharacter();
  const invalid = [];
  for (const field of fields) {
    const error = fieldError(field, data);
    if (error) invalid.push(field);
    const visibleError = touched.has(field.name) ? error : '';
    document.getElementById(`${field.name}-error`).textContent = visibleError;
    field.setAttribute('aria-invalid', String(Boolean(visibleError)));
  }
  errorSummary.hidden = !submitted || invalid.length === 0;
  errorSummary.textContent = invalid.length === 1 ? '1 field needs fixing.' : `${invalid.length} fields need fixing.`;
  return invalid;
}

// Both preview and final result are built with DOM methods.
function buildCard(container, data) {
  container.replaceChildren();
  container.className = `character-card ${data.color}`;
  const name = document.createElement('h3');
  name.textContent = data.name || 'Your character';
  const role = document.createElement('p');
  role.textContent = data.class ? `Class: ${data.class}` : 'Choose a class';
  container.append(name, role);
  for (const skill of skillNames) {
    const line = document.createElement('p');
    line.textContent = `${skill}: ${data[skill]}`;
    container.append(line);
  }
}

function updatePreview() {
  const data = readCharacter();
  buildCard(document.querySelector('#character-preview'), data);
  const counter = document.querySelector('#points-left');
  const left = totalPoints - sumSkills(data);
  counter.textContent = `Points left: ${left}`;
  counter.classList.toggle('success', left === 0);
  counter.classList.toggle('error', left !== 0);
}

function handleEdit() {
  updatePreview();
  validate();
}

form.addEventListener('input', handleEdit);
form.addEventListener('change', handleEdit);
form.addEventListener('blur', (event) => {
  if (!fields.includes(event.target)) return;
  touched.add(event.target.name);
  validate();
}, true);

form.addEventListener('submit', (event) => {
  event.preventDefault();
  submitted = true;
  for (const field of fields) touched.add(field.name);
  const invalid = validate();
  if (invalid.length > 0) {
    invalid[0].focus();
    return;
  }
  const result = document.querySelector('#character-result');
  const heading = document.createElement('h3');
  heading.textContent = 'Character created!';
  heading.className = 'success';
  const card = document.createElement('div');
  buildCard(card, readCharacter());
  result.replaceChildren(heading, card);
  form.reset();
  touched.clear();
  submitted = false;
  updatePreview();
  validate();
});

updatePreview();
