// Application state - stored in memory only
let tasks = [
  { id: 1, name: "App-V Decommission", owner: "SysEng ClientEng", dependencies: [], roadblocks: [], status: "not-started", comments: "" },
  { id: 2, name: "NPS Migration", owner: "Network", dependencies: [], roadblocks: [], status: "not-started", comments: "" },
  { id: 3, name: "Veeam Migration (5 servers)", owner: "SysEng Infra", dependencies: [2], roadblocks: [4], status: "roadblocked", comments: "" },
  { id: 4, name: "Cohesity Expansion", owner: "SysEng Infra", dependencies: [3], roadblocks: [], status: "not-started", comments: "" },
  { id: 5, name: "NTP Migration", owner: "SysEng Ops", dependencies: [4], roadblocks: [], status: "not-started", comments: "" },
  { id: 6, name: "SnapCenter Migration na-snpctr-p1", owner: "DBAs", dependencies: [5], roadblocks: [7], status: "roadblocked", comments: "" },
  { id: 7, name: "ITAPP19-SQL-P1 Migration", owner: "DBAs", dependencies: [6], roadblocks: [8], status: "roadblocked", comments: "" },
  { id: 8, name: "Rauland Nurse Call Migration", owner: "Vendor", dependencies: [7], roadblocks: [10], status: "roadblocked", comments: "" },
  { id: 9, name: "Data Warehouse Migration (11 servers)", owner: "Data Platform", dependencies: [6], roadblocks: [8], status: "roadblocked", comments: "" },
  { id: 10, name: "Load balancing and firewall rules", owner: "Vendor", dependencies: [8], roadblocks: [], status: "not-started", comments: "" },
  { id: 11, name: "Suncheck", owner: "Clinical Lab", dependencies: [], roadblocks: [], status: "not-started", comments: "" },
  { id: 12, name: "CMS-Citrix", owner: "Clinical Lab", dependencies: [], roadblocks: [], status: "not-started", comments: "" },
  { id: 13, name: "Cadstream", owner: "Clinical Lab", dependencies: [], roadblocks: [], status: "not-started", comments: "" },
  { id: 14, name: "Scobto", owner: "Clinical Lab", dependencies: [], roadblocks: [], status: "not-started", comments: "" },
  { id: 15, name: "Saphyr", owner: "Clinical Lab", dependencies: [], roadblocks: [], status: "not-started", comments: "" },
  { id: 16, name: "Sysmex", owner: "Clinical Lab", dependencies: [], roadblocks: [], status: "not-started", comments: "" },
  { id: 17, name: "ELLink", owner: "Vendor", dependencies: [], roadblocks: [], status: "not-started", comments: "" }
];

const owners = [
  "SysEng ClientEng",
  "Network",
  "SysEng Infra",
  "SysEng Ops",
  "DBAs",
  "Data Platform",
  "Vendor",
  "Clinical Lab"
];

let network = null;
let currentEditingTaskId = null;

// Initialize the application
function init() {
  setupEventListeners();
  populateFilters();
  renderFlowchart();
  renderTable();
}

function setupEventListeners() {
  // View toggle
  document.getElementById('flowchartViewBtn').addEventListener('click', () => {
    showView('flowchart');
  });
  
  document.getElementById('tableViewBtn').addEventListener('click', () => {
    showView('table');
  });
  
  // Filters
  document.getElementById('ownerFilter').addEventListener('change', applyFilters);
  document.getElementById('statusFilter').addEventListener('change', applyFilters);
  document.getElementById('roadblockedFilter').addEventListener('change', applyFilters);
  
  // Add task button
  document.getElementById('addTaskBtn').addEventListener('click', openAddTaskModal);
  
  // Modal controls
  document.getElementById('closeModal').addEventListener('click', closeModal);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  document.getElementById('saveTaskBtn').addEventListener('click', saveTask);
  
  // Close modal on outside click
  document.getElementById('editModal').addEventListener('click', (e) => {
    if (e.target.id === 'editModal') {
      closeModal();
    }
  });
}

function showView(view) {
  const flowchartView = document.getElementById('flowchartView');
  const tableView = document.getElementById('tableView');
  const flowchartBtn = document.getElementById('flowchartViewBtn');
  const tableBtn = document.getElementById('tableViewBtn');
  
  if (view === 'flowchart') {
    flowchartView.classList.add('active');
    tableView.classList.remove('active');
    flowchartBtn.classList.remove('btn--secondary');
    flowchartBtn.classList.add('btn--primary');
    tableBtn.classList.remove('btn--primary');
    tableBtn.classList.add('btn--secondary');
    if (network) {
      network.fit();
    }
  } else {
    flowchartView.classList.remove('active');
    tableView.classList.add('active');
    flowchartBtn.classList.remove('btn--primary');
    flowchartBtn.classList.add('btn--secondary');
    tableBtn.classList.remove('btn--secondary');
    tableBtn.classList.add('btn--primary');
  }
}

function populateFilters() {
  const ownerFilter = document.getElementById('ownerFilter');
  owners.forEach(owner => {
    const option = document.createElement('option');
    option.value = owner;
    option.textContent = owner;
    ownerFilter.appendChild(option);
  });
}

function applyFilters() {
  renderFlowchart();
  renderTable();
}

function getFilteredTasks() {
  const ownerFilter = document.getElementById('ownerFilter').value;
  const statusFilter = document.getElementById('statusFilter').value;
  const roadblockedOnly = document.getElementById('roadblockedFilter').checked;
  
  return tasks.filter(task => {
    if (ownerFilter && task.owner !== ownerFilter) return false;
    if (statusFilter && task.status !== statusFilter) return false;
    if (roadblockedOnly && task.roadblocks.length === 0 && task.status !== 'roadblocked') return false;
    return true;
  });
}

function getStatusColor(status) {
  switch (status) {
    case 'not-started':
      return 'rgba(245, 158, 11, 0.15)';
    case 'in-progress':
      return 'rgba(59, 130, 246, 0.15)';
    case 'roadblocked':
      return 'rgba(239, 68, 68, 0.15)';
    case 'complete':
      return 'rgba(34, 197, 94, 0.15)';
    default:
      return 'rgba(167, 169, 169, 0.15)';
  }
}

function getStatusBorderColor(status) {
  switch (status) {
    case 'not-started':
      return 'rgba(245, 158, 11, 0.5)';
    case 'in-progress':
      return 'rgba(59, 130, 246, 0.5)';
    case 'roadblocked':
      return 'rgba(239, 68, 68, 0.8)';
    case 'complete':
      return 'rgba(34, 197, 94, 0.5)';
    default:
      return 'rgba(167, 169, 169, 0.5)';
  }
}

function renderFlowchart() {
  const filteredTasks = getFilteredTasks();
  const filteredTaskIds = new Set(filteredTasks.map(t => t.id));
  
  // Create nodes
  const nodes = filteredTasks.map(task => {
    const hasRoadblock = task.roadblocks.length > 0 || task.status === 'roadblocked';
    return {
      id: task.id,
      label: task.name + '\n[' + task.owner + ']',
      color: {
        background: getStatusColor(task.status),
        border: getStatusBorderColor(task.status)
      },
      borderWidth: hasRoadblock ? 3 : 1,
      font: {
        size: 12,
        multi: true
      },
      shape: 'box',
      margin: 10
    };
  });
  
  // Create edges for dependencies
  const edges = [];
  filteredTasks.forEach(task => {
    task.dependencies.forEach(depId => {
      if (filteredTaskIds.has(depId)) {
        edges.push({
          from: depId,
          to: task.id,
          arrows: 'to',
          color: { color: '#21808D', opacity: 0.6 },
          width: 2,
          label: 'depends on',
          font: { size: 10, align: 'middle' }
        });
      }
    });
    
    // Add roadblock edges
    task.roadblocks.forEach(roadblockId => {
      if (filteredTaskIds.has(roadblockId)) {
        edges.push({
          from: roadblockId,
          to: task.id,
          arrows: 'to',
          color: { color: '#C0152F', opacity: 0.8 },
          width: 3,
          dashes: true,
          label: 'roadblock',
          font: { size: 10, align: 'middle', color: '#C0152F' }
        });
      }
    });
  });
  
  const container = document.getElementById('flowchartNetwork');
  const data = { nodes: nodes, edges: edges };
  
  const options = {
    layout: {
      hierarchical: {
        enabled: true,
        direction: 'LR',
        sortMethod: 'directed',
        levelSeparation: 200,
        nodeSpacing: 150
      }
    },
    physics: {
      enabled: false
    },
    interaction: {
      hover: true,
      navigationButtons: true,
      keyboard: true
    },
    nodes: {
      shape: 'box',
      margin: 10,
      widthConstraint: {
        maximum: 200
      }
    }
  };
  
  if (network) {
    network.destroy();
  }
  
  network = new vis.Network(container, data, options);
  
  // Add click event to open edit modal
  network.on('click', function(params) {
    if (params.nodes.length > 0) {
      const taskId = params.nodes[0];
      openEditTaskModal(taskId);
    }
  });
}

function renderTable() {
  const filteredTasks = getFilteredTasks();
  const tbody = document.getElementById('taskTableBody');
  tbody.innerHTML = '';
  
  filteredTasks.forEach(task => {
    const row = document.createElement('tr');
    if (task.roadblocks.length > 0 || task.status === 'roadblocked') {
      row.classList.add('roadblocked');
    }
    
    // Task Name
    const nameCell = document.createElement('td');
    nameCell.textContent = task.name;
    nameCell.style.fontWeight = '500';
    row.appendChild(nameCell);
    
    // Owner
    const ownerCell = document.createElement('td');
    ownerCell.textContent = task.owner;
    row.appendChild(ownerCell);
    
    // Dependencies
    const depsCell = document.createElement('td');
    if (task.dependencies.length > 0) {
      const depsList = document.createElement('ul');
      depsList.className = 'task-list';
      task.dependencies.forEach(depId => {
        const depTask = tasks.find(t => t.id === depId);
        if (depTask) {
          const li = document.createElement('li');
          li.textContent = depTask.name;
          depsList.appendChild(li);
        }
      });
      depsCell.appendChild(depsList);
    } else {
      depsCell.textContent = '-';
    }
    row.appendChild(depsCell);
    
    // Roadblocks
    const roadblocksCell = document.createElement('td');
    if (task.roadblocks.length > 0) {
      const roadblocksList = document.createElement('ul');
      roadblocksList.className = 'task-list';
      task.roadblocks.forEach(roadblockId => {
        const roadblockTask = tasks.find(t => t.id === roadblockId);
        if (roadblockTask) {
          const li = document.createElement('li');
          li.textContent = roadblockTask.name;
          li.style.color = 'var(--color-error)';
          li.style.fontWeight = '500';
          roadblocksList.appendChild(li);
        }
      });
      roadblocksCell.appendChild(roadblocksList);
    } else {
      roadblocksCell.textContent = '-';
    }
    row.appendChild(roadblocksCell);
    
    // Status
    const statusCell = document.createElement('td');
    const statusBadge = document.createElement('span');
    statusBadge.className = `status-badge status-${task.status}`;
    statusBadge.textContent = task.status.replace('-', ' ');
    statusCell.appendChild(statusBadge);
    row.appendChild(statusCell);
    
    // Comments
    const commentsCell = document.createElement('td');
    commentsCell.textContent = task.comments || '-';
    commentsCell.style.fontSize = 'var(--font-size-xs)';
    row.appendChild(commentsCell);
    
    // Actions
    const actionsCell = document.createElement('td');
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn--sm btn--secondary';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => openEditTaskModal(task.id));
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn--sm btn--danger';
    deleteBtn.textContent = 'Delete';
    deleteBtn.style.marginLeft = 'var(--space-4)';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    
    actionsCell.appendChild(editBtn);
    actionsCell.appendChild(deleteBtn);
    row.appendChild(actionsCell);
    
    tbody.appendChild(row);
  });
}

function openAddTaskModal() {
  currentEditingTaskId = null;
  document.getElementById('modalTitle').textContent = 'Add New Task';
  document.getElementById('editTaskName').value = '';
  document.getElementById('editTaskStatus').value = 'not-started';
  document.getElementById('editTaskComments').value = '';
  
  // Populate owner dropdown
  const ownerSelect = document.getElementById('editTaskOwner');
  ownerSelect.innerHTML = '';
  owners.forEach(owner => {
    const option = document.createElement('option');
    option.value = owner;
    option.textContent = owner;
    ownerSelect.appendChild(option);
  });
  
  // Populate dependencies checkboxes
  const depsContainer = document.getElementById('dependenciesCheckboxes');
  depsContainer.innerHTML = '';
  tasks.forEach(task => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = task.id;
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(task.name));
    depsContainer.appendChild(label);
  });
  
  // Populate roadblocks checkboxes
  const roadblocksContainer = document.getElementById('roadblocksCheckboxes');
  roadblocksContainer.innerHTML = '';
  tasks.forEach(task => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = task.id;
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(task.name));
    roadblocksContainer.appendChild(label);
  });
  
  document.getElementById('editModal').classList.add('active');
}

function openEditTaskModal(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;
  
  currentEditingTaskId = taskId;
  document.getElementById('modalTitle').textContent = 'Edit Task';
  document.getElementById('editTaskName').value = task.name;
  document.getElementById('editTaskStatus').value = task.status;
  document.getElementById('editTaskComments').value = task.comments || '';
  
  // Populate owner dropdown
  const ownerSelect = document.getElementById('editTaskOwner');
  ownerSelect.innerHTML = '';
  owners.forEach(owner => {
    const option = document.createElement('option');
    option.value = owner;
    option.textContent = owner;
    if (owner === task.owner) {
      option.selected = true;
    }
    ownerSelect.appendChild(option);
  });
  
  // Populate dependencies checkboxes
  const depsContainer = document.getElementById('dependenciesCheckboxes');
  depsContainer.innerHTML = '';
  tasks.forEach(t => {
    if (t.id !== taskId) {
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = t.id;
      if (task.dependencies.includes(t.id)) {
        checkbox.checked = true;
      }
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(t.name));
      depsContainer.appendChild(label);
    }
  });
  
  // Populate roadblocks checkboxes
  const roadblocksContainer = document.getElementById('roadblocksCheckboxes');
  roadblocksContainer.innerHTML = '';
  tasks.forEach(t => {
    if (t.id !== taskId) {
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = t.id;
      if (task.roadblocks.includes(t.id)) {
        checkbox.checked = true;
      }
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(t.name));
      roadblocksContainer.appendChild(label);
    }
  });
  
  document.getElementById('editModal').classList.add('active');
}

function closeModal() {
  document.getElementById('editModal').classList.remove('active');
  currentEditingTaskId = null;
}

function saveTask() {
  const name = document.getElementById('editTaskName').value.trim();
  const owner = document.getElementById('editTaskOwner').value;
  const status = document.getElementById('editTaskStatus').value;
  const comments = document.getElementById('editTaskComments').value.trim();
  
  if (!name) {
    alert('Task name is required');
    return;
  }
  
  // Get selected dependencies
  const dependencies = [];
  document.querySelectorAll('#dependenciesCheckboxes input:checked').forEach(checkbox => {
    dependencies.push(parseInt(checkbox.value));
  });
  
  // Get selected roadblocks
  const roadblocks = [];
  document.querySelectorAll('#roadblocksCheckboxes input:checked').forEach(checkbox => {
    roadblocks.push(parseInt(checkbox.value));
  });
  
  if (currentEditingTaskId) {
    // Edit existing task
    const task = tasks.find(t => t.id === currentEditingTaskId);
    if (task) {
      task.name = name;
      task.owner = owner;
      task.status = status;
      task.dependencies = dependencies;
      task.roadblocks = roadblocks;
      task.comments = comments;
    }
  } else {
    // Add new task
    const newId = Math.max(...tasks.map(t => t.id)) + 1;
    tasks.push({
      id: newId,
      name: name,
      owner: owner,
      status: status,
      dependencies: dependencies,
      roadblocks: roadblocks,
      comments: comments
    });
  }
  
  closeModal();
  renderFlowchart();
  renderTable();
}

function deleteTask(taskId) {
  if (!confirm('Are you sure you want to delete this task?')) {
    return;
  }
  
  // Remove task
  tasks = tasks.filter(t => t.id !== taskId);
  
  // Remove task from other tasks' dependencies and roadblocks
  tasks.forEach(task => {
    task.dependencies = task.dependencies.filter(id => id !== taskId);
    task.roadblocks = task.roadblocks.filter(id => id !== taskId);
  });
  
  renderFlowchart();
  renderTable();
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}