(function () {
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const list = document.getElementById('todo-list');
  const search = document.getElementById('todo-search');
  const empty = document.getElementById('todo-empty');

  if (!form || !input || !list || !search || !empty) return;

  const key = 'rzxxy_tasks';
  let tasks = [];
  let filter = 'all';

  try {
    tasks = JSON.parse(localStorage.getItem(key) || '[]');
    if (!Array.isArray(tasks)) tasks = [];
  } catch (e) {
    tasks = [];
  }

  function save() {
    localStorage.setItem(key, JSON.stringify(tasks));
  }

  function render() {
    list.replaceChildren();

    const term = search.value.toLowerCase().trim();

    const visible = tasks.filter(function (task) {
      return task.text.toLowerCase().includes(term) &&
        (filter === 'all' ||
         (filter === 'active' && !task.done) ||
         (filter === 'done' && task.done));
    });

    empty.style.display = visible.length ? 'none' : 'block';

    visible.forEach(function (task) {
      const row = document.createElement('div');
      row.style.cssText =
        'display:flex;align-items:center;gap:12px;padding:14px;margin:10px 0;background:#15152b;border-radius:12px;color:white';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.done;

      checkbox.addEventListener('change', function () {
        task.done = checkbox.checked;
        save();
        render();
      });

      const text = document.createElement('span');
      text.textContent = task.text;
      text.style.flex = '1';

      if (task.done) {
        text.style.textDecoration = 'line-through';
        text.style.color = '#888';
      }

      const del = document.createElement('button');
      del.textContent = 'Delete';
      del.style.cssText =
        'padding:8px;border:0;border-radius:8px;background:#51233b;color:white';

      del.addEventListener('click', function () {
        tasks = tasks.filter(function (t) {
          return t.id !== task.id;
        });
        save();
        render();
      });

      row.append(checkbox, text, del);
      list.appendChild(row);
    });

    document.getElementById('todo-total').textContent = tasks.length;
    document.getElementById('todo-active').textContent =
      tasks.filter(t => !t.done).length;
    document.getElementById('todo-done').textContent =
      tasks.filter(t => t.done).length;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    const text = input.value.trim();
    if (!text) return;

    tasks.unshift({
      id: Date.now().toString() + Math.random().toString(16),
      text: text,
      done: false
    });

    save();
    input.value = '';
    render();
  });

  search.addEventListener('input', render);

  document.querySelectorAll('.todo-filter').forEach(function (button) {
    button.addEventListener('click', function () {
      filter = button.dataset.filter;
      render();
    });
  });

  render();
})();
