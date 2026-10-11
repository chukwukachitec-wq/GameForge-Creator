(() => {
  const $ = (id) => document.getElementById(id);
  const backdrop = $('modalBackdrop');
  const form = $('projectForm');
  const nameInput = $('projectName');
  const typeInput = $('projectType');
  const grid = $('projectGrid');
  const toast = $('toast');
  let toastTimer;

  function showModal(template) {
    if (template) typeInput.value = template;
    $('formError').hidden = true;
    backdrop.hidden = false;
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => nameInput.focus(), 30);
  }
  function closeModal() {
    backdrop.hidden = true;
    document.body.style.overflow = '';
  }
  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => { toast.hidden = true; }, 3000);
  }
  function loadProjects() {
    try { return JSON.parse(localStorage.getItem('gameforge-projects') || '[]'); }
    catch (_) { return []; }
  }
  function saveProjects(projects) {
    try { localStorage.setItem('gameforge-projects', JSON.stringify(projects)); }
    catch (_) { /* The project still appears for this page session. */ }
  }
  function renderProjects() {
    grid.querySelectorAll('.created-project').forEach((el) => el.remove());
    loadProjects().forEach((project) => {
      const card = document.createElement('article');
      card.className = 'project-card created-project';
      const tile = document.createElement('div');
      tile.className = 'tile tile-purple';
      tile.textContent = '✦';
      const heading = document.createElement('h3');
      heading.textContent = project.name;
      const description = document.createElement('p');
      description.textContent = project.type + ' · Created just now';
      const button = document.createElement('button');
      button.className = 'button button-secondary';
      button.type = 'button';
      button.textContent = 'Open project';
      button.addEventListener('click', () => showToast('Your "' + project.name + '" project is ready to start building.'));
      card.append(tile, heading, description, button);
      grid.prepend(card);
    });
  }

  ['topCreate', 'heroCreate', 'newProject'].forEach((id) => {
    const button = $(id);
    if (button) button.addEventListener('click', () => showModal());
  });
  document.querySelectorAll('.template-button').forEach((button) => {
    button.addEventListener('click', () => showModal(button.dataset.template));
  });
  $('closeModal').addEventListener('click', closeModal);
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) closeModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !backdrop.hidden) closeModal();
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    if (!name) {
      $('formError').hidden = false;
      nameInput.focus();
      return;
    }
    const projects = loadProjects();
    projects.unshift({ name, type: typeInput.value, createdAt: new Date().toISOString() });
    saveProjects(projects);
    renderProjects();
    form.reset();
    closeModal();
    showToast('Project "' + name + '" created successfully!');
  });
  renderProjects();
})(); 
