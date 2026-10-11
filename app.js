(() => {
  const $ = (id) => document.getElementById(id);
  const viewport = $('viewport');
  const toast = $('toast');
  let toastTimer, scene, camera, renderer, raycaster, mouse, ground, gridHelper, selected = null;
  let objects = [], nextId = 1, currentMode = 'world', previewing = false;
  let dragging = false, lastX = 0, lastY = 0, cameraAngle = 0.65, cameraElevation = 0.85, cameraDistance = 11;
  const objectColors = { cube: 0x9b7bff, tree: 0x46c78a, rock: 0x8f8aa9, coin: 0xffcc54, car: 0xff69b4, player: 0x55b8ff };

  function notify(message) {
    toast.textContent = message; toast.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.hidden = true, 2600);
  }
  function setStatus(message) { $('saveStatus').textContent = '● ' + message; }
  function initScene() {
    if (!window.THREE) {
      viewport.innerHTML = '<div class="scene-error">The 3D library did not load. Check your internet connection and refresh the page.</div>';
      return;
    }
    scene = new THREE.Scene(); scene.background = new THREE.Color(0x1a1a34); scene.fog = new THREE.Fog(0x1a1a34, 18, 40);
    camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100); updateCamera();
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    viewport.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xbfc8ff, 0x38402d, 1.2));
    const sun = new THREE.DirectionalLight(0xffffff, 1.25); sun.position.set(7, 12, 8); sun.castShadow = true; scene.add(sun);
    ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: 0x27344a, roughness: 0.92 }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -0.06; ground.receiveShadow = true; ground.userData.ground = true; scene.add(ground);
    gridHelper = new THREE.GridHelper(40, 40, 0x7666aa, 0x46415f); gridHelper.position.y = -0.045; scene.add(gridHelper);
    raycaster = new THREE.Raycaster(); mouse = new THREE.Vector2();
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', () => { dragging = false; });
    renderer.domElement.addEventListener('pointercancel', () => { dragging = false; });
    renderer.domElement.addEventListener('wheel', (e) => { cameraDistance = Math.max(5, Math.min(22, cameraDistance + e.deltaY * 0.012)); updateCamera(); }, { passive: true });
    window.addEventListener('resize', resize);
    resize(); animate(); loadScene();
  }
  function resize() {
    if (!renderer || !camera) return;
    const w = Math.max(1, viewport.clientWidth), h = Math.max(1, viewport.clientHeight);
    camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false);
  }
  function updateCamera() {
    if (!camera) return;
    camera.position.set(Math.sin(cameraAngle) * cameraDistance, cameraElevation * cameraDistance, Math.cos(cameraAngle) * cameraDistance);
    camera.lookAt(0, 0.5, 0);
  }
  function animate() { requestAnimationFrame(animate); if (renderer && scene && camera) renderer.render(scene, camera); }
  function makeMaterial(color, roughness = 0.72) { return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.04 }); }
  function addShape(kind, opts = {}) {
    if (!scene) { notify('The 3D scene is still loading. Please wait a moment.'); return; }
    let group = new THREE.Group(), color = objectColors[kind] || 0x9b7bff;
    if (kind === 'cube') {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.15, 1.15), makeMaterial(color)); mesh.position.y = 0.58; mesh.castShadow = true; mesh.receiveShadow = true; group.add(mesh);
    } else if (kind === 'tree') {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 1.05, 8), makeMaterial(0x8a5a36)); trunk.position.y = 0.52; trunk.castShadow = true; group.add(trunk);
      const leaves = new THREE.Mesh(new THREE.ConeGeometry(0.72, 1.55, 9), makeMaterial(color)); leaves.position.y = 1.65; leaves.castShadow = true; group.add(leaves);
    } else if (kind === 'rock') {
      const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.72, 0), makeMaterial(color)); mesh.position.y = 0.48; mesh.scale.set(1.15, 0.78, 0.9); mesh.castShadow = true; group.add(mesh);
    } else if (kind === 'coin') {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 32), new THREE.MeshStandardMaterial({color, metalness:0.7, roughness:0.22, emissive:0x5a3600})); mesh.position.y = 0.78; mesh.rotation.x = Math.PI / 2; mesh.castShadow = true; group.add(mesh);
    } else if (kind === 'car') {
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.42, 0.85), makeMaterial(color)); body.position.y = 0.48; body.castShadow = true; group.add(body);
      const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.35, 0.65), makeMaterial(0x9fe6ff, 0.28)); cabin.position.set(-0.08, 0.84, 0); group.add(cabin);
      for (const x of [-0.48, 0.48]) for (const z of [-0.48, 0.48]) { const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.19,0.19,0.12,14), makeMaterial(0x20202a)); wheel.rotation.x = Math.PI/2; wheel.position.set(x,0.25,z); group.add(wheel); }
    } else if (kind === 'player') {
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 1.15, 12), makeMaterial(color));
      body.position.y = 0.8; body.castShadow = true; group.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 12), makeMaterial(0xffd2b2)); head.position.y = 1.55; group.add(head);
    }
    group.position.set(opts.x ?? ((objects.length % 4) - 1.5) * 1.65, 0, opts.z ?? (Math.floor(objects.length / 4) - 0.5) * 1.6);
    group.userData.kind = kind; group.userData.id = opts.id || nextId++; group.userData.label = opts.label || kindLabel(kind);
    group.traverse(child => { if (child.isMesh) { child.userData.parentGroup = group; } });
    scene.add(group); objects.push(group); selectObject(group); updateObjectList(); updateCount(); setStatus('Unsaved changes');
    return group;
  }
  function kindLabel(kind) { return ({cube:'Block',tree:'Tree',rock:'Rock',coin:'Coin',car:'Car',player:'Player'})[kind] || 'Object'; }
  function addOutline(group) {
    if (!group) return;
    const box = new THREE.BoxHelper(group, 0xd7c4ff); box.name = 'selectionOutline'; scene.add(box); group.userData.outline = box;
  }
  function clearOutline(group) { if (group && group.userData.outline) { scene.remove(group.userData.outline); group.userData.outline.geometry.dispose(); group.userData.outline = null; } }
  function selectObject(group) {
    if (selected) clearOutline(selected);
    selected = group || null;
    if (selected) addOutline(selected);
    $('selectedName').textContent = selected ? selected.userData.label + ' ' + selected.userData.id : 'Nothing selected';
    $('selectedHint').textContent = selected ? 'Use the arrows to move this object around the scene.' : 'Tap an object in the scene or add a new one.';
    $('deleteBtn').disabled = !selected;
    updateObjectList();
  }
  function updateObjectList() {
    const list = $('objectList'); list.innerHTML = '';
    if (!objects.length) { list.innerHTML = '<p class="empty-list">Your objects will appear here.</p>'; return; }
    objects.slice().reverse().forEach(obj => {
      const row = document.createElement('div'); row.className = 'object-row';
      const dot = document.createElement('span'); dot.className = 'object-dot';
      const name = document.createElement('span'); name.textContent = obj.userData.label + ' ' + obj.userData.id;
      const focus = document.createElement('button'); focus.type = 'button'; focus.textContent = '›'; focus.setAttribute('aria-label','Select object');
      row.style.outline = obj === selected ? '1px solid #7657a8' : 'none'; row.append(dot, name, focus);
      row.addEventListener('click', () => selectObject(obj)); list.appendChild(row);
    });
  }
  function updateCount() { $('objectCount').textContent = objects.length + (objects.length === 1 ? ' object added' : ' objects added'); }
  function onPointerDown(e) {
    if (!renderer || previewing) return;
    dragging = true; lastX = e.clientX; lastY = e.clientY;
    renderer.domElement.setPointerCapture?.(e.pointerId);
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1; mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(objects, true);
    if (hits.length) { let g = hits[0].object; while (g && !g.userData.kind) g = g.parent; if (g) selectObject(g); }
  }
  function onPointerMove(e) {
    if (!dragging || previewing) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY;
    if (Math.abs(dx) + Math.abs(dy) > 2) { cameraAngle -= dx * 0.008; cameraElevation = Math.max(0.25, Math.min(1.4, cameraElevation + dy * 0.005)); updateCamera(); }
  }
  function moveSelected(dir) {
    if (!selected) { notify('Select an object first, or add one from Build Tools.'); return; }
    const step = 0.5;
    if (dir === 'x-') selected.position.x -= step;
    if (dir === 'x+') selected.position.x += step;
    if (dir === 'z-') selected.position.z -= step;
    if (dir === 'z+') selected.position.z += step;
    if (selected.userData.outline) selected.userData.outline.update();
    setStatus('Unsaved changes');
  }
  function saveScene() {
    const data = objects.map(o => ({kind:o.userData.kind,id:o.userData.id,label:o.userData.label,x:o.position.x,z:o.position.z}));
    try { localStorage.setItem('gameforge-3d-scene', JSON.stringify({mode:currentMode, objects:data})); setStatus('Saved on this device'); notify('Scene saved on this device.'); }
    catch (_) { notify('Could not save in this browser. You can still use the current scene.'); }
  }
  function loadScene() {
    try {
      const saved = JSON.parse(localStorage.getItem('gameforge-3d-scene') || 'null');
      if (saved && Array.isArray(saved.objects)) {
        currentMode = saved.mode || 'world';
        saved.objects.forEach(o => addShape(o.kind, o));
        setMode(currentMode, false); setStatus('Saved scene loaded');
      }
    } catch (_) {}
  }
  function setMode(mode, showMessage = true) {
    currentMode = mode;
    document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
    const data = {
      world: ['World Builder','Place objects and shape your own 3D world.'],
      adventure: ['Adventure Game','Build an adventure scene with a player, trees, rocks, and collectibles.'],
      racing: ['Racing Game','Create a simple racing scene with cars and track obstacles.']
    }[mode] || ['World Builder','Place objects and shape your own 3D world.'];
    $('modeTitle').textContent = data[0]; $('modeDescription').textContent = data[1];
    if (showMessage) notify(data[0] + ' selected. Add objects from Build Tools.');
  }
  function clearObjects() {
    if (!objects.length) { notify('There are no added objects to clear yet.'); return; }
    objects.forEach(o => { clearOutline(o); scene.remove(o); o.traverse(c => { if (c.geometry) c.geometry.dispose(); }); });
    objects = []; selected = null; selectObject(null); updateCount(); setStatus('Unsaved changes'); notify('Added objects cleared.');
  }
  function togglePreview() {
    previewing = !previewing;
    $('playBtn').textContent = previewing ? '■ Stop preview' : '▶ Play preview';
    $('previewBanner').hidden = !previewing;
    $('viewHelp').textContent = previewing ? 'Preview is running · Stop preview to edit objects' : 'Drag to orbit · Scroll to zoom · Tap an object to select it';
    document.querySelectorAll('.add-card,.move-btn,.nav-item').forEach(b => b.disabled = previewing);
    notify(previewing ? 'Preview mode started.' : 'Back to edit mode.');
  }
  document.querySelectorAll('.add-card').forEach(b => b.addEventListener('click', () => {
    if (previewing) return; addShape(b.dataset.object); notify(kindLabel(b.dataset.object) + ' added to your scene.');
  }));
  document.querySelectorAll('.nav-item').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
  document.querySelectorAll('.move-btn').forEach(b => b.addEventListener('click', () => moveSelected(b.dataset.move)));
  $('deleteBtn').addEventListener('click', () => {
    if (!selected) return; const doomed = selected; clearOutline(doomed); scene.remove(doomed); objects = objects.filter(o => o !== doomed); selected = null; selectObject(null); updateCount(); setStatus('Unsaved changes'); notify('Object deleted.');
  });
  $('saveBtn').addEventListener('click', saveScene);
  $('playBtn').addEventListener('click', togglePreview);
  $('resetCamera').addEventListener('click', () => { cameraAngle = 0.65; cameraElevation = 0.85; cameraDistance = 11; updateCamera(); notify('View reset.'); });
  $('clearBtn').addEventListener('click', clearObjects);
  initScene();
})();