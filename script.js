const AMZN_LAMBDA_URL = "https://g7b2iieznm5kqssthpy3howyfu0exxfm.lambda-url.us-east-1.on.aws/";

const dashboardData = {
  appointments: [],
  revenue: {
    labels: [],
    values: []
  },
  serviceDistribution: {
    labels: [],
    values: []
  }
};

const AUTH_STORAGE_KEY = 'iamlostcrm_session';
const USER_STORAGE_KEY = 'iamlostcrm_users';

const seedAdminUser = {
  id: 'user_admin_root',
  email: 'admin@iamlostcrm.com',
  password: '123456',
  name: 'IAM Lost Admin',
  role: 'Admin',
  active: true,
  createdAt: '2026-03-07T00:00:00.000Z',
  createdBy: 'System',
  lastLoginAt: ''
};

const seedStaffUser = {
  id: 'user_staff_root',
  email: 'staff@iamlostcrm.com',
  password: '123456',
  name: 'IAM Lost Staff',
  role: 'Staff',
  active: true,
  createdAt: '2026-03-07T00:00:00.000Z',
  createdBy: 'System',
  lastLoginAt: ''
};

let revenueChart;
let serviceChart;
let appUsers = [];
let currentSession = null;

const YEAR_START = 1990;
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: currentYear - YEAR_START + 1 }, (_, i) => String(currentYear - i));

const baseVehicleCatalog = {
  Toyota: ['Vios', 'Wigo', 'Yaris', 'Corolla Altis', 'Camry', 'Raize', 'Rush', 'Avanza', 'Innova', 'Fortuner', 'Hilux', 'Land Cruiser', 'Coaster', 'Hiace'],
  Honda: ['Brio', 'City', 'Civic', 'Accord', 'CR-V', 'HR-V', 'BR-V', 'Jazz', 'Mobilio'],
  Mitsubishi: ['Mirage', 'Mirage G4', 'Xpander', 'Montero Sport', 'Strada', 'L300', 'Outlander', 'ASX'],
  Nissan: ['Almera', 'Sylphy', 'Sentra', 'Navara', 'Terra', 'Patrol', 'Livina', 'Juke', 'Kicks'],
  Ford: ['Ranger', 'Everest', 'Territory', 'Explorer', 'Mustang', 'Expedition'],
  Isuzu: ['D-Max', 'mu-X', 'N-Series', 'F-Series'],
  Mazda: ['Mazda2', 'Mazda3', 'Mazda6', 'CX-3', 'CX-5', 'CX-8', 'CX-9', 'BT-50', 'MX-5'],
  Suzuki: ['S-Presso', 'Celerio', 'Dzire', 'Swift', 'Ertiga', 'XL7', 'Jimny', 'APV', 'Carry'],
  Hyundai: ['Reina', 'Accent', 'Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Stargazer', 'Staria', 'H-100'],
  Kia: ['Soluto', 'Stonic', 'Seltos', 'Sportage', 'Sorento', 'Carnival', 'Picanto', 'K2500'],
  Chevrolet: ['Spark', 'Sonic', 'Cruze', 'Trailblazer', 'Tracker', 'Suburban', 'Tahoe'],
  Subaru: ['XV', 'Forester', 'Outback', 'WRX', 'Levorg', 'BRZ', 'Evoltis'],
  Volkswagen: ['Santana', 'Lamando', 'T-Cross', 'Tiguan', 'Lavida'],
  BMW: ['1 Series', '2 Series', '3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X7', 'Z4'],
  'Mercedes-Benz': ['A-Class', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLC', 'GLE', 'GLS', 'V-Class'],
  Audi: ['A3', 'A4', 'A6', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'TT'],
  Lexus: ['IS', 'ES', 'LS', 'UX', 'NX', 'RX', 'GX', 'LX'],
  Peugeot: ['301', '508', '2008', '3008', '5008', 'Partner'],
  MG: ['MG3', 'MG5', 'MG6', 'ZS', 'HS', 'RX8', 'Extender'],
  Geely: ['Emgrand', 'Coolray', 'Azkarra', 'Okavango', 'GX3 Pro', 'PandA'],
  Chery: ['Tiggo 2', 'Tiggo 5X', 'Tiggo 7 Pro', 'Tiggo 8 Pro', 'Arrizo 5'],
  BYD: ['Seagull', 'Dolphin', 'Atto 3', 'Seal', 'Han', 'Tang', 'E6'],
  GAC: ['GS3', 'GS4', 'GS8', 'Empow', 'Emzoom', 'M8'],
  JAC: ['S2', 'S3', 'S4', 'T6', 'T8', 'M3'],
  Foton: ['Tornado', 'Thunder', 'Traveller', 'Toano', 'Transvan'],
  Tesla: ['Model 3', 'Model S', 'Model X', 'Model Y', 'Cybertruck'],
  'Land Rover': ['Defender', 'Discovery Sport', 'Discovery', 'Range Rover Evoque', 'Range Rover Velar', 'Range Rover Sport', 'Range Rover'],
  Volvo: ['S60', 'S90', 'XC40', 'XC60', 'XC90', 'V60'],
  Jeep: ['Wrangler', 'Cherokee', 'Grand Cherokee', 'Compass', 'Renegade'],
  Dodge: ['Charger', 'Challenger', 'Durango'],
  Ram: ['1500', '2500', '3500'],
  Mini: ['Cooper', 'Countryman', 'Clubman']
};

const vehicleCatalog = Object.fromEntries(
  Object.entries(baseVehicleCatalog).map(([brand, models]) => [
    brand,
    Object.fromEntries(models.map((model) => [model, [...yearOptions]]))
  ])
);

const dieselModelKeys = new Set([
  'Toyota|Fortuner', 'Toyota|Hilux', 'Toyota|Innova', 'Toyota|Land Cruiser', 'Toyota|Coaster', 'Toyota|Hiace',
  'Mitsubishi|Montero Sport', 'Mitsubishi|Strada', 'Mitsubishi|L300',
  'Nissan|Navara', 'Nissan|Terra', 'Nissan|Patrol',
  'Ford|Ranger', 'Ford|Everest',
  'Isuzu|D-Max', 'Isuzu|mu-X', 'Isuzu|N-Series', 'Isuzu|F-Series',
  'Mazda|BT-50',
  'Hyundai|Santa Fe', 'Hyundai|Staria', 'Hyundai|H-100',
  'Kia|Sorento', 'Kia|Carnival', 'Kia|K2500',
  'Chevrolet|Trailblazer',
  'Peugeot|Partner',
  'MG|Extender',
  'Foton|Tornado', 'Foton|Thunder', 'Foton|Traveller', 'Foton|Toano', 'Foton|Transvan',
  'Land Rover|Defender', 'Land Rover|Discovery Sport', 'Land Rover|Discovery',
  'Land Rover|Range Rover', 'Land Rover|Range Rover Sport', 'Land Rover|Range Rover Velar', 'Land Rover|Range Rover Evoque'
]);

const mixedFuelModelKeys = new Set(['Hyundai|Accent']);

const statusBadgeMap = {
  Confirmed: 'bg-success-subtle text-success-emphasis border border-success-subtle',
  'In Progress': 'bg-warning-subtle text-warning-emphasis border border-warning-subtle',
  Completed: 'bg-primary-subtle text-primary-emphasis border border-primary-subtle'
};

const workOrderStatusBadgeMap = {
  Scheduled: 'bg-info-subtle text-info-emphasis border border-info-subtle',
  Active: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle',
  Completed: 'bg-primary-subtle text-primary-emphasis border border-primary-subtle'
};

const billingStatusBadgeMap = {
  Unpaid: 'bg-danger-subtle text-danger-emphasis border border-danger-subtle',
  Processing: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle',
  Paid: 'bg-success-subtle text-success-emphasis border border-success-subtle'
};

const inventoryStatusBadgeMap = {
  Healthy: 'bg-success-subtle text-success-emphasis border border-success-subtle',
  Watch: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle',
  'Low Stock': 'bg-danger-subtle text-danger-emphasis border border-danger-subtle'
};

const defaultServiceMeta = {
  price: 2200,
  technician: 'Service Advisor',
  eta: '1 hr 00 min',
  parts: [{ name: 'Shop Supplies Kit', qty: 1 }]
};

const serviceCatalog = {
  'Change Oil': { price: 1800, technician: 'Miguel Reyes', eta: '45 min', parts: [{ name: 'Engine Oil (L)', qty: 4 }, { name: 'Oil Filter', qty: 1 }] },
  'Periodic Maintenance': { price: 4500, technician: 'Carlo Santos', eta: '2 hr 30 min', parts: [{ name: 'Engine Oil (L)', qty: 4 }, { name: 'Oil Filter', qty: 1 }, { name: 'Air Filter', qty: 1 }, { name: 'Coolant', qty: 1 }] },
  'Brake Service': { price: 3200, technician: 'Jessa Cruz', eta: '1 hr 40 min', parts: [{ name: 'Brake Pads Set', qty: 1 }, { name: 'Brake Fluid Bottle', qty: 1 }] },
  'Tire Rotation': { price: 1200, technician: 'Nico Ramos', eta: '40 min', parts: [{ name: 'Tire Valve Set', qty: 1 }] },
  'Wheel Alignment': { price: 1500, technician: 'Nico Ramos', eta: '1 hr 00 min', parts: [{ name: 'Alignment Shim Kit', qty: 1 }] },
  'Battery Check': { price: 900, technician: 'Liza Gomez', eta: '25 min', parts: [{ name: 'Battery Terminal Cleaner', qty: 1 }] },
  'Engine Diagnostics': { price: 2500, technician: 'Marco Diaz', eta: '1 hr 20 min', parts: [{ name: 'Sensor Cleaner', qty: 1 }] },
  'Aircon Service': { price: 3800, technician: 'Paolo Lim', eta: '2 hr 00 min', parts: [{ name: 'Cabin Filter', qty: 1 }, { name: 'Refrigerant Can', qty: 1 }] }
};

const inventoryCatalog = {
  'Engine Oil (L)': { stock: 120, reorderPoint: 20, category: 'Fluids' },
  'Oil Filter': { stock: 45, reorderPoint: 10, category: 'Filters' },
  'Air Filter': { stock: 30, reorderPoint: 8, category: 'Filters' },
  'Cabin Filter': { stock: 25, reorderPoint: 5, category: 'Filters' },
  'Brake Pads Set': { stock: 18, reorderPoint: 4, category: 'Mechanical' },
  'Brake Fluid Bottle': { stock: 20, reorderPoint: 5, category: 'Fluids' },
  'Coolant': { stock: 25, reorderPoint: 6, category: 'Fluids' },
  'Tire Valve Set': { stock: 100, reorderPoint: 15, category: 'Tires' },
  'Alignment Shim Kit': { stock: 50, reorderPoint: 10, category: 'Mechanical' },
  'Battery Terminal Cleaner': { stock: 15, reorderPoint: 3, category: 'Chemicals' },
  'Sensor Cleaner': { stock: 12, reorderPoint: 3, category: 'Chemicals' },
  'Refrigerant Can': { stock: 40, reorderPoint: 8, category: 'Fluids' },
  'Shop Supplies Kit': { stock: 200, reorderPoint: 20, category: 'General' }
};

// DOM Selections
const loginView = document.getElementById('loginView');
const crmAppShell = document.getElementById('crmAppShell');
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const loginError = document.getElementById('loginError');
const userSessionName = document.getElementById('userSessionName');
const userSessionRole = document.getElementById('userSessionRole');
const logoutBtn = document.getElementById('logoutBtn');

const navLinks = document.querySelectorAll('[data-view-target]');
const views = document.querySelectorAll('.crm-view');
const viewAllAppointmentsBtn = document.getElementById('viewAllAppointmentsBtn');

const appointmentsBody = document.getElementById('appointmentsBody');
const dashboardRecentAppointmentsBody = document.getElementById('dashboardRecentAppointmentsBody');
const customersBody = document.getElementById('customersBody');
const workOrdersBody = document.getElementById('workOrdersBody');
const inventoryBody = document.getElementById('inventoryBody');
const managedUsersBody = document.getElementById('managedUsersBody');

const totalAppointmentsCount = document.getElementById('totalAppointmentsCount');
const confirmedAppointmentsCount = document.getElementById('confirmedAppointmentsCount');
const inProgressAppointmentsCount = document.getElementById('inProgressAppointmentsCount');
const completedAppointmentsCount = document.getElementById('completedAppointmentsCount');
const totalCustomersCount = document.getElementById('totalCustomersCount');
const totalWorkOrdersCount = document.getElementById('totalWorkOrdersCount');
const activeWorkOrdersCount = document.getElementById('activeWorkOrdersCount');
const completedWorkOrdersCount = document.getElementById('completedWorkOrdersCount');
const inventoryTrackedCount = document.getElementById('inventoryTrackedCount');
const inventoryLowStockCount = document.getElementById('inventoryLowStockCount');
const inventoryReservedCount = document.getElementById('inventoryReservedCount');

const primaryDashboardLink = document.getElementById('primaryDashboardLink');
const adminNavLink = document.getElementById('adminNavLink');
const totalUsersCount = document.getElementById('totalUsersCount');
const totalAdminUsersCount = document.getElementById('totalAdminUsersCount');
const totalStaffUsersCount = document.getElementById('totalStaffUsersCount');
const dashboardTotalUsersCount = document.getElementById('dashboardTotalUsersCount');
const dashboardActiveAdminsCount = document.getElementById('dashboardActiveAdminsCount');
const dashboardActiveStaffCount = document.getElementById('dashboardActiveStaffCount');
const dashboardTodayAppointmentsCount = document.getElementById('dashboardTodayAppointmentsCount');
const adminRecentLoginsBody = document.getElementById('adminRecentLoginsBody');

const userManagementForm = document.getElementById('userManagementForm');
const adminNameInput = document.getElementById('adminNameInput');
const adminEmailInput = document.getElementById('adminEmailInput');
const adminPasswordInput = document.getElementById('adminPasswordInput');
const adminRoleSelect = document.getElementById('adminRoleSelect');
const userManagementMessage = document.getElementById('userManagementMessage');

const customerSearchInput = document.getElementById('customerSearchInput');
const newAppointmentForm = document.getElementById('newAppointmentForm');
const customerInput = document.getElementById('customerInput');
const phoneInput = document.getElementById('phoneInput');
const brandSelect = document.getElementById('brandSelect');
const modelSelect = document.getElementById('modelSelect');
const yearSelect = document.getElementById('yearSelect');
const fuelTypeInput = document.getElementById('fuelTypeInput');
const fuelTypeManualWrap = document.getElementById('fuelTypeManualWrap');
const fuelTypeManualSelect = document.getElementById('fuelTypeManualSelect');
const serviceSelect = document.getElementById('serviceSelect');
const otherServiceWrap = document.getElementById('otherServiceWrap');
const serviceOtherInput = document.getElementById('serviceOtherInput');
const dateInput = document.getElementById('dateInput');
const statusInput = document.getElementById('statusInput');
const modalElement = document.getElementById('newAppointmentModal');
const appointmentModal = modalElement ? new bootstrap.Modal(modalElement) : null;
const appointmentToastElement = document.getElementById('appointmentToast');
const appointmentToast = appointmentToastElement ? new bootstrap.Toast(appointmentToastElement) : null;
const appointmentToastBody = document.getElementById('appointmentToastBody');

// Utility Helper Routines
function normalizeEmail(email) { return typeof email === 'string' ? email.trim().toLowerCase() : ''; }
function findUserByEmail(email) { const norm = normalizeEmail(email); return appUsers.find((u) => normalizeEmail(u.email) === norm) || null; }
function findUserById(id) { return appUsers.find((u) => u.id === id) || null; }
function isSeedAdminAccount(user) { return user && user.id === seedAdminUser.id; }
function buildSessionFromUser(user) { return { userId: user.id, email: user.email, name: user.name, role: user.role }; }
function generateUserId() { return `user_${Math.random().toString(36).slice(2, 11)}`; }
function canAccessAdmin() { return currentSession && currentSession.role === 'Admin'; }
function getDefaultDashboardView() { return currentSession && currentSession.role === 'Admin' ? 'adminDashboardView' : 'dashboardView'; }

function persistUsers() {
  try { localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(appUsers)); } catch (_error) {}
}

function normalizeStoredUser(u) {
  if (!u || typeof u !== 'object') return null;
  return {
    id: String(u.id || ''),
    email: String(u.email || ''),
    password: String(u.password || ''),
    name: String(u.name || ''),
    role: u.role === 'Admin' ? 'Admin' : 'Staff',
    active: u.active !== false,
    createdAt: String(u.createdAt || new Date().toISOString()),
    createdBy: String(u.createdBy || 'System'),
    lastLoginAt: String(u.lastLoginAt || '')
  };
}

function initializeUserStore() {
  const fallbackUsers = [{ ...seedAdminUser }, { ...seedStaffUser }];
  try {
    const rawUsers = localStorage.getItem(USER_STORAGE_KEY);
    if (!rawUsers) {
      appUsers = fallbackUsers;
      persistUsers();
      return;
    }
    const parsedUsers = JSON.parse(rawUsers);
    const normalizedUsers = Array.isArray(parsedUsers) ? parsedUsers.map(normalizeStoredUser).filter(Boolean) : [];
    if (normalizedUsers.length === 0) {
      appUsers = fallbackUsers;
      persistUsers();
      return;
    }
    appUsers = normalizedUsers;
  } catch (_error) {
    appUsers = fallbackUsers;
  }
}

// ASYNC CLOUD SYNC: Fetches accounts live from AWS Lambda DynamoDB router
function syncCloudUsers() {
  return fetch(AMZN_LAMBDA_URL + "users")
    .then(response => {
      if (!response.ok) throw new Error("Failed to load user definitions from server.");
      return response.json();
    })
    .then(cloudUsers => {
      if (Array.isArray(cloudUsers)) {
        const localCopy = [...appUsers];
        cloudUsers.forEach(cu => {
          const normE = normalizeEmail(cu.email);
          const idx = localCopy.findIndex(u => normalizeEmail(u.email) === normE);
          if (idx > -1) {
            localCopy[idx] = { ...localCopy[idx], ...cu };
          } else {
            localCopy.push(cu);
          }
        });
        appUsers = localCopy;
        persistUsers();
        if (currentSession && document.getElementById('adminView') && !document.getElementById('adminView').classList.contains('d-none')) {
          renderAdminPage();
        }
      }
    })
    .catch(err => console.error("Cloud User Synchronization Deferred:", err));
}

function _setSessionUser(session) {
  try { localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session)); } catch (_error) {}
}

function clearSessionUser() {
  try { localStorage.removeItem(AUTH_STORAGE_KEY); } catch (_error) {}
}

function getStoredSession() {
  try {
    const rawSession = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawSession) return null;
    const parsedSession = JSON.parse(rawSession);
    const matchedUser = findUserById(parsedSession.userId);
    if (!matchedUser || !matchedUser.active) return null;
    return buildSessionFromUser(matchedUser);
  } catch (_error) {
    return null;
  }
}

function showLoginError(message) {
  loginError.textContent = message;
  loginError.classList.remove('d-none');
}

function hideLoginError() {
  loginError.textContent = '';
  loginError.classList.add('d-none');
}

function showUserManagementMessage(type, message) {
  userManagementMessage.textContent = message;
  userManagementMessage.className = `alert alert-${type} py-2 px-3 mb-0`;
  userManagementMessage.classList.remove('d-none');
}

function hideUserManagementMessage() {
  userManagementMessage.textContent = '';
  userManagementMessage.className = 'alert d-none';
}

function switchView(viewId) {
  let resolvedViewId = viewId;
  if (resolvedViewId === 'dashboardView') {
    resolvedViewId = getDefaultDashboardView();
  }
  if (['adminView', 'adminDashboardView'].includes(resolvedViewId) && !canAccessAdmin()) {
    resolvedViewId = getDefaultDashboardView();
  }
  views.forEach((view) => view.classList.add('d-none'));
  navLinks.forEach((link) => link.classList.remove('active'));
  
  const activeView = document.getElementById(resolvedViewId);
  if (activeView) activeView.classList.remove('d-none');
  
  const activeLink = document.querySelector(`[data-view-target="${resolvedViewId}"]`);
  if (activeLink) activeLink.classList.add('active');
}

navLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    switchView(link.dataset.viewTarget);
  });
});

if (viewAllAppointmentsBtn) {
  viewAllAppointmentsBtn.addEventListener('click', (event) => {
    event.preventDefault();
    switchView('appointmentsView');
  });
}

function syncAdminAccess() {
  if (canAccessAdmin()) {
    adminNavLink.classList.remove('d-none');
    if (primaryDashboardLink) primaryDashboardLink.dataset.viewTarget = 'adminDashboardView';
  } else {
    adminNavLink.classList.add('d-none');
    if (primaryDashboardLink) primaryDashboardLink.dataset.viewTarget = 'dashboardView';
  }
}

function showAppView(session) {
  currentSession = session;
  _setSessionUser(session);
  syncAdminAccess();
  
  userSessionName.textContent = session.name;
  userSessionRole.textContent = session.role;
  loginView.classList.add('d-none');
  crmAppShell.classList.remove('d-none');
  
  initializeCharts();
  
  // GET Appointments Sync Pipeline Execution
  fetch(AMZN_LAMBDA_URL)
    .then(response => {
      if (!response.ok) throw new Error('Database response rejected layout arrays.');
      return response.json();
    })
    .then(data => {
      dashboardData.appointments = data || [];
    })
    .catch(error => {
      console.error('Data pull failed, showing local fallback context:', error);
      dashboardData.appointments = [];
    })
    .finally(() => {
      renderAll();
      switchView(getDefaultDashboardView(session));
    });
}

function showLoginView() {
  currentSession = null;
  clearSessionUser();
  crmAppShell.classList.add('d-none');
  loginView.classList.remove('d-none');
  if (loginForm) loginForm.reset();
  hideLoginError();
}

if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    hideLoginError();
    const email = emailInput.value;
    const password = passwordInput.value;
    
    const targetUser = findUserByEmail(email);
    if (!targetUser || targetUser.password !== password) {
      showLoginError('Invalid email or dashboard security profile credentials.');
      return;
    }
    if (!targetUser.active) {
      showLoginError('This user profile mapping context has been locked out.');
      return;
    }
    
    targetUser.lastLoginAt = new Date().toISOString();
    persistUsers();
    showAppView(buildSessionFromUser(targetUser));
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', (event) => {
    event.preventDefault();
    showLoginView();
  });
}

function formatDate(dateStr) {
  if (!dateStr) return 'Undefined';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-US', options);
}

function getAppointmentTimestamp(appointment) {
  if (!appointment) return 0;
  if (appointment.createdAt) return Number(appointment.createdAt);
  if (appointment.dateRaw) return new Date(`${appointment.dateRaw}T00:00:00`).getTime();
  const parsed = new Date(appointment.date).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getServiceMeta(service) {
  return serviceCatalog[service] || { ...defaultServiceMeta, parts: defaultServiceMeta.parts.map((p) => ({ ...p })) };
}

function getBadgeClass(map, status) {
  return map[status] || 'bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle';
}

function buildAppointmentRow(item, compact = false) {
  const badgeClass = statusBadgeMap[item.status] || 'bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle';
  if (compact) {
    return `<tr>
      <td class="fw-semibold">${item.customer}</td>
      <td>${item.vehicle}</td>
      <td>${item.service}</td>
      <td>${item.date}</td>
      <td><span class="badge rounded-pill ${badgeClass}">${item.status}</span></td>
    </tr>`;
  }
  return `<tr>
    <td class="fw-semibold">${item.customer}</td>
    <td><a href="tel:${item.phone}" class="text-decoration-none text-secondary">${item.phone}</a></td>
    <td><span class="font-monospace text-uppercase small text-secondary">${item.id.slice(0, 8)}</span></td>
    <td>
      <div class="fw-medium text-dark">${item.vehicle}</div>
      <div class="small text-muted text-uppercase font-monospace fs-xs">${item.fuelType || 'Gasoline'}</div>
    </td>
    <td><span class="badge bg-light text-dark border border-secondary-subtle fw-normal px-2 py-1">${item.service}</span></td>
    <td>${item.date}</td>
    <td><span class="badge rounded-pill ${badgeClass}">${item.status}</span></td>
  </tr>`;
}

function renderAppointments() {
  appointmentsBody.innerHTML = '';
  dashboardRecentAppointmentsBody.innerHTML = '';
  
  const list = dashboardData.appointments || [];
  totalAppointmentsCount.textContent = String(list.length);
  confirmedAppointmentsCount.textContent = String(list.filter((a) => a.status === 'Confirmed').length);
  inProgressAppointmentsCount.textContent = String(list.filter((a) => a.status === 'In Progress').length);
  completedAppointmentsCount.textContent = String(list.filter((a) => a.status === 'Completed').length);
  
  if (list.length === 0) {
    const emptyRow = '<tr><td colspan="7" class="text-center text-secondary py-4">No logged service profile cards available</td></tr>';
    appointmentsBody.innerHTML = emptyRow;
    dashboardRecentAppointmentsBody.innerHTML = '<tr><td colspan="5" class="text-center text-secondary py-3">No recent activities matching metrics</td></tr>';
    return;
  }
  
  list.forEach((item) => {
    appointmentsBody.insertAdjacentHTML('beforeend', buildAppointmentRow(item, false));
  });
  
  list.slice(0, 5).forEach((item) => {
    dashboardRecentAppointmentsBody.insertAdjacentHTML('beforeend', buildAppointmentRow(item, true));
  });
}

function getCustomerRegistry(searchQuery = '') {
  const query = searchQuery.trim().toLowerCase();
  const customerMap = new Map();
  
  dashboardData.appointments.forEach((appt) => {
    const key = normalizeEmail(appt.customer) + '|' + appt.phone;
    let record = customerMap.get(key);
    if (!record) {
      record = { name: appt.customer, phone: appt.phone, vehicles: new Set(), totalVisits: 0 };
      customerMap.set(key, record);
    }
    record.vehicles.add(appt.vehicle);
    record.totalVisits += 1;
  });
  
  return Array.from(customerMap.values())
    .map((c) => ({ name: c.name, phone: c.phone, vehicleSummary: Array.from(c.vehicles).join(', '), totalVisits: c.totalVisits }))
    .filter((c) => !query || c.name.toLowerCase().includes(query) || c.phone.includes(query))
    .sort((a, b) => b.totalVisits - a.totalVisits || a.name.localeCompare(b.name));
}

function renderCustomers(searchQuery = '') {
  customersBody.innerHTML = '';
  const registry = getCustomerRegistry(searchQuery);
  totalCustomersCount.textContent = String(registry.length);
  
  if (registry.length === 0) {
    customersBody.innerHTML = '<tr><td colspan="4" class="text-center text-secondary py-4">No vehicle operators mapped on this entry scope</td></tr>';
    return;
  }
  
  registry.forEach((cust) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td class="fw-semibold">${cust.name}</td>
      <td><a href="tel:${cust.phone}" class="text-decoration-none text-secondary">${cust.phone}</a></td>
      <td class="text-muted small">${cust.vehicleSummary}</td>
      <td><span class="badge bg-secondary rounded-circle px-2 py-1">${cust.totalVisits}</span></td>`;
    customersBody.appendChild(tr);
  });
}

if (customerSearchInput) {
  customerSearchInput.addEventListener('input', () => {
    renderCustomers(customerSearchInput.value);
  });
}

function getWorkOrders() {
  return dashboardData.appointments.map((appointment, index) => {
    const serviceMeta = getServiceMeta(appointment.service);
    let status = 'Scheduled';
    if (appointment.status === 'In Progress') {
      status = 'Active';
    } else if (appointment.status === 'Completed') {
      status = 'Completed';
    }
    return {
      id: `WO-${String(index + 1).padStart(4, '0')}`,
      customer: appointment.customer,
      vehicle: appointment.vehicle,
      service: appointment.service,
      technician: serviceMeta.technician,
      eta: serviceMeta.eta,
      status
    };
  });
}

function renderWorkOrders() {
  const workOrders = getWorkOrders();
  workOrdersBody.innerHTML = '';
  totalWorkOrdersCount.textContent = String(workOrders.length);
  activeWorkOrdersCount.textContent = String(workOrders.filter((item) => item.status === 'Active').length);
  completedWorkOrdersCount.textContent = String(workOrders.filter((item) => item.status === 'Completed').length);
  
  if (workOrders.length === 0) {
    workOrdersBody.innerHTML = '<tr><td colspan="6" class="text-center text-secondary py-4">No processing workshop floor items running</td></tr>';
    return;
  }
  
  workOrders.forEach((wo) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><span class="font-monospace fw-bold text-secondary text-uppercase small">${wo.id}</span></td>
      <td class="fw-semibold">${wo.customer}</td>
      <td class="small text-muted">${wo.vehicle}</td>
      <td><span class="badge bg-light text-dark border border-secondary-subtle font-sans fw-medium">${wo.service}</span></td>
      <td><div class="fw-medium">${wo.technician}</div><div class="small text-muted fs-xs font-monospace">ETA: ${wo.eta}</div></td>
      <td><span class="badge rounded-pill ${getBadgeClass(workOrderStatusBadgeMap, wo.status)}">${wo.status}</span></td>`;
    workOrdersBody.appendChild(tr);
  });
}

function getInventorySnapshot() {
  const stockUsage = new Map();
  dashboardData.appointments.forEach((appt) => {
    const meta = getServiceMeta(appt.service);
    const multiplier = appt.status === 'Completed' ? 1 : 0;
    const reserveMultiplier = appt.status === 'Confirmed' || appt.status === 'In Progress' ? 1 : 0;
    
    if (meta && Array.isArray(meta.parts)) {
      meta.parts.forEach((p) => {
        let entry = stockUsage.get(p.name);
        if (!entry) {
          entry = { reserved: 0, used: 0 };
          stockUsage.set(p.name, entry);
        }
        entry.used += p.qty * multiplier;
        entry.reserved += p.qty * reserveMultiplier;
      });
    }
  });
  
  return Object.keys(inventoryCatalog)
    .map((itemName) => {
      const itemMeta = inventoryCatalog[itemName];
      const usage = stockUsage.get(itemName) || { reserved: 0, used: 0 };
      const onHand = Math.max(itemMeta.stock - usage.used, 0);
      const available = Math.max(onHand - usage.reserved, 0);
      let status = 'Healthy';
      
      if (available <= itemMeta.reorderPoint) {
        status = 'Low Stock';
      } else if (available <= itemMeta.reorderPoint + 5) {
        status = 'Watch';
      }
      return { itemName, category: itemMeta.category, onHand, reserved: usage.reserved, available, reorderPoint: itemMeta.reorderPoint, status };
    })
    .sort((a, b) => a.available - b.available || a.itemName.localeCompare(b.itemName));
}

function renderInventory() {
  const inventoryItems = getInventorySnapshot();
  inventoryBody.innerHTML = '';
  inventoryTrackedCount.textContent = String(inventoryItems.length);
  inventoryLowStockCount.textContent = String(inventoryItems.filter((item) => item.status === 'Low Stock').length);
  inventoryReservedCount.textContent = String(inventoryItems.reduce((acc, curr) => acc + curr.reserved, 0));
  
  inventoryItems.forEach((item) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td class="fw-semibold">${item.itemName}</td>
      <td class="small text-secondary">${item.category}</td>
      <td class="font-monospace fw-bold text-end pe-4">${item.onHand}</td>
      <td class="font-monospace text-warning text-end pe-4">${item.reserved > 0 ? `${item.reserved}` : '-'}</td>
      <td class="font-monospace text-primary fw-bold text-end pe-4">${item.available}</td>
      <td><span class="badge rounded-pill ${getBadgeClass(inventoryStatusBadgeMap, item.status)}">${item.status}</span></td>`;
    inventoryBody.appendChild(tr);
  });
}

function getUserRoleBadgeClass(role) { return role === 'Admin' ? 'bg-danger-subtle text-danger-emphasis' : 'bg-info-subtle text-info-emphasis'; }

function renderAdminPage() {
  if (!managedUsersBody) return;
  managedUsersBody.innerHTML = '';
  
  const sortedUsers = [...appUsers].sort((a, b) => a.name.localeCompare(b.name));
  totalUsersCount.textContent = String(sortedUsers.length);
  totalAdminUsersCount.textContent = String(sortedUsers.filter((u) => u.role === 'Admin').length);
  totalStaffUsersCount.textContent = String(sortedUsers.filter((u) => u.role === 'Staff').length);
  
  dashboardTotalUsersCount.textContent = String(sortedUsers.length);
  dashboardActiveAdminsCount.textContent = String(sortedUsers.filter((u) => u.role === 'Admin' && u.active).length);
  dashboardActiveStaffCount.textContent = String(sortedUsers.filter((u) => u.role === 'Staff' && u.active).length);
  
  const activeAdminCount = sortedUsers.filter((u) => u.role === 'Admin' && u.active).length;
  
  if (sortedUsers.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = '<td colspan="7" class="text-center text-secondary py-4">No accounts available</td>';
    managedUsersBody.appendChild(emptyRow);
    return;
  }
  
  sortedUsers.forEach((user) => {
    const isCurrentUser = user.id === currentSession?.userId;
    const isProtectedAdmin = user.role === 'Admin' && user.active && activeAdminCount <= 1;
    const actionDisabled = isCurrentUser || isProtectedAdmin;
    const actionLabel = isCurrentUser ? 'Current User' : user.active ? 'Disable' : 'Enable';
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="fw-semibold">${user.name}</td>
      <td>${user.email}</td>
      <td><span class="badge rounded-pill ${getUserRoleBadgeClass(user.role)}">${user.role}</span></td>
      <td><span class="badge ${user.active ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'}">${user.active ? 'Active' : 'Disabled'}</span></td>
      <td class="small font-monospace text-muted text-uppercase">${user.createdBy || 'System'}</td>
      <td class="small text-muted font-sans">${formatDate(user.createdAt)}</td>
      <td>
        <button class="btn btn-sm ${user.active ? 'btn-outline-danger' : 'btn-outline-success'} toggle-user-status-btn" 
          data-user-id="${user.id}" ${actionDisabled ? 'disabled' : ''}>
          ${actionLabel}
        </button>
      </td>
    `;
    managedUsersBody.appendChild(tr);
  });
  
  // Hook listeners onto Disable/Enable switches
  document.querySelectorAll('.toggle-user-status-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const uId = btn.dataset.userId;
      const target = findUserById(uId);
      if (target) {
        target.active = !target.active;
        persistUsers();
        renderAdminPage();
        showUserManagementMessage(target.active ? 'success' : 'secondary', `${target.name} account flag altered successfully.`);
      }
    });
  });
}

[adminNameInput, adminEmailInput, adminPasswordInput].forEach((input) => {
  if (!input) return;
  input.addEventListener('input', () => { hideUserManagementMessage(); });
});

// CREATE ACCOUNT SUBMISSION: Cloud Sync Integration via Sub-Router A
if (userManagementForm) {
  userManagementForm.addEventListener('submit', (event) => {
    event.preventDefault();
    hideUserManagementMessage();

    if (!userManagementForm.checkValidity()) {
      userManagementForm.classList.add('was-validated');
      return;
    }

    const normalizedEmail = adminEmailInput.value.trim().toLowerCase();
    
    // Fast fail check against current runtime profile tracking array
    if (findUserByEmail(normalizedEmail)) {
      showUserManagementMessage('danger', 'That email registration pattern matches an existing profile.');
      return;
    }

    // Build user configuration packet
    const userData = {
      name: adminNameInput.value.trim(),
      email: normalizedEmail,
      password: adminPasswordInput.value.trim(),
      role: adminRoleSelect.value === 'Admin' ? 'Admin' : 'Staff',
      active: true,
      createdBy: currentSession ? currentSession.name : 'Admin',
      lastLoginAt: ''
    };

    const submitBtn = userManagementForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    // Send payload directly to the Lambda /users path
    fetch(AMZN_LAMBDA_URL + "users", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    .then(response => {
      if (!response.ok) throw new Error('Database server validation failure.');
      return response.json();
    })
    .then(persistedUser => {
      // Inject returned server-instantiated configuration directly into runtime state array
      appUsers.unshift(persistedUser);
      persistUsers(); 
      renderAdminPage();

      showUserManagementMessage('success', `Successfully created ${persistedUser.role.toLowerCase()} account for ${persistedUser.name} on DynamoDB.`);
      
      userManagementForm.reset();
      userManagementForm.classList.remove('was-validated');
      adminRoleSelect.value = 'Staff';
    })
    .catch(err => {
      console.error('Account Sync Operational Breakdown:', err);
      showUserManagementMessage('danger', 'Database connection offline. User registration could not sync to AWS cloud ecosystem.');
    })
    .finally(() => {
      if (submitBtn) submitBtn.disabled = false;
    });
  });
}

function populateSelect(select, options, placeholder) {
  select.innerHTML = `<option value="">${placeholder}</option>`;
  options.forEach((option) => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option;
    select.appendChild(opt);
  });
}

function resetVehicleSelectors() {
  populateSelect(modelSelect, [], 'Select model');
  populateSelect(yearSelect, [], 'Select year');
  modelSelect.disabled = true;
  yearSelect.disabled = true;
}

function initializeVehicleSelectors() {
  populateSelect(brandSelect, Object.keys(vehicleCatalog), 'Select brand');
  resetVehicleSelectors();
  fuelTypeInput.value = '';
  fuelTypeManualWrap.classList.add('d-none');
  fuelTypeManualSelect.required = false;
  fuelTypeManualSelect.value = '';
}

if (brandSelect) {
  brandSelect.addEventListener('change', () => {
    const brand = brandSelect.value;
    resetVehicleSelectors();
    fuelTypeInput.value = '';
    fuelTypeManualWrap.classList.add('d-none');
    fuelTypeManualSelect.required = false;
    fuelTypeManualSelect.value = '';
    
    if (brand && vehicleCatalog[brand]) {
      populateSelect(modelSelect, Object.keys(vehicleCatalog[brand]), 'Select model');
      modelSelect.disabled = false;
    }
  });
}

if (modelSelect) {
  modelSelect.addEventListener('change', () => {
    const brand = brandSelect.value;
    const model = modelSelect.value;
    populateSelect(yearSelect, [], 'Select year');
    yearSelect.disabled = true;
    fuelTypeInput.value = '';
    fuelTypeManualWrap.classList.add('d-none');
    fuelTypeManualSelect.required = false;
    fuelTypeManualSelect.value = '';
    
    if (brand && model && vehicleCatalog[brand] && vehicleCatalog[brand][model]) {
      populateSelect(yearSelect, vehicleCatalog[brand][model], 'Select year');
      yearSelect.disabled = false;
      
      const combinedKey = `${brand}|${model}`;
      if (dieselModelKeys.has(combinedKey)) {
        fuelTypeInput.value = 'Diesel';
      } else if (mixedFuelModelKeys.has(combinedKey)) {
        fuelTypeInput.value = '';
        fuelTypeManualWrap.classList.remove('d-none');
        fuelTypeManualSelect.required = true;
      } else {
        fuelTypeInput.value = 'Gasoline';
      }
    }
  });
}

if (fuelTypeManualSelect) {
  fuelTypeManualSelect.addEventListener('change', () => {
    fuelTypeInput.value = fuelTypeManualSelect.value;
  });
}

if (serviceSelect) {
  serviceSelect.addEventListener('change', () => {
    const val = serviceSelect.value;
    if (val === 'Other') {
      otherServiceWrap.classList.remove('d-none');
      serviceOtherInput.required = true;
    } else {
      otherServiceWrap.classList.add('d-none');
      serviceOtherInput.required = false;
      serviceOtherInput.value = '';
    }
  });
}

function getMetricSnapshots() {
  const map = { totalRevenue: 0, todayCount: 0, serviceCounts: {}, revenueMap: {} };
  const todayStr = new Date().toISOString().split('T')[0];
  
  dashboardData.appointments.forEach((appt) => {
    const meta = getServiceMeta(appt.service);
    const cost = meta.price || 0;
    
    if (appt.status === 'Completed') {
      map.totalRevenue += cost;
    }
    
    const apptDate = appt.dateRaw || (appt.date && appt.date.includes('-') ? appt.date : '');
    if (apptDate === todayStr) {
      map.todayCount += 1;
    }
    
    map.serviceCounts[appt.service] = (map.serviceCounts[appt.service] || 0) + 1;
    
    if (appt.status === 'Completed' && apptDate) {
      map.revenueMap[apptDate] = (map.revenueMap[apptDate] || 0) + cost;
    }
  });
  
  return map;
}

function renderDashboard() {
  const dataMap = getMetricSnapshots();
  dashboardTodayAppointmentsCount.textContent = String(dataMap.todayCount);
  updateCharts(dataMap.revenueMap, dataMap.serviceCounts);
}

function renderAll() {
  renderAppointments();
  renderCustomers();
  renderWorkOrders();
  renderInventory();
  renderAdminPage();
  renderDashboard();
}

function updateCharts(revenueMap, serviceCounts) {
  if (!revenueChart || !serviceChart) return;
  
  dashboardData.serviceDistribution.labels = Object.keys(serviceCounts);
  dashboardData.serviceDistribution.values = Object.values(serviceCounts);
  
  const sortedDates = Object.keys(revenueMap).sort((a, b) => new Date(a) - new Date(b));
  dashboardData.revenue.labels = sortedDates.map(d => formatDate(d));
  dashboardData.revenue.values = sortedDates.map(d => revenueMap[d]);
  
  revenueChart.data.labels = dashboardData.revenue.labels;
  revenueChart.data.datasets[0].data = dashboardData.revenue.values;
  revenueChart.update();
  
  serviceChart.data.labels = dashboardData.serviceDistribution.labels;
  serviceChart.data.datasets[0].data = dashboardData.serviceDistribution.values;
  serviceChart.update();
}

function initializeCharts() {
  const revCtx = document.getElementById('revenueChart');
  const servCtx = document.getElementById('serviceDistributionChart');
  
  if (revCtx && !revenueChart) {
    revenueChart = new Chart(revCtx, {
      type: 'line',
      data: { labels: [], datasets: [{ label: 'Gross Revenue (PHP)', data: [], borderColor: '#0891b2', backgroundColor: 'rgba(8, 145, 178, 0.08)', fill: true, tension: 0.3 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { borderDash: [5, 5] } }, x: { grid: { display: false } } } }
    });
  }
  
  if (servCtx && !serviceChart) {
    serviceChart = new Chart(servCtx, {
      type: 'doughnut',
      data: { labels: [], datasets: [{ data: [], backgroundColor: ['#06b6d4', '#0284c7', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#eab308'] }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 12, font: { family: 'Manrope' } } } } }
    });
  }
}

// CREATE APPOINTMENT SUBMISSION: Cloud Sync Integration via Fallback Router
if (newAppointmentForm) {
  newAppointmentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!newAppointmentForm.checkValidity()) {
      newAppointmentForm.classList.add('was-validated');
      return;
    }
    
    const customer = customerInput.value.trim();
    const phone = phoneInput.value.trim();
    const brand = brandSelect.value;
    const model = modelSelect.value;
    const year = yearSelect.value;
    const sType = serviceSelect.value;
    const customService = serviceOtherInput.value.trim();
    const service = sType === 'Other' ? customService : sType;
    const fType = fuelTypeInput.value || 'Gasoline';
    const date = dateInput.value;
    const status = statusInput.value;
    
    const payload = {
      customer,
      phone,
      vehicle: `${brand} ${model} (${year})`,
      brand,
      model,
      year,
      fuelType: fType,
      service,
      date: formatDate(date),
      dateRaw: date,
      status
    };
    
    const submitBtn = newAppointmentForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    
    fetch(AMZN_LAMBDA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(response => {
      if (!response.ok) throw new Error('Network validation rejection fault.');
      return response.json();
    })
    .then(persistedItem => {
      // Success block runs strictly upon safe database confirmation
      dashboardData.appointments.unshift(persistedItem);
      renderAll();
      
      newAppointmentForm.reset();
      newAppointmentForm.classList.remove('was-validated');
      initializeVehicleSelectors();
      
      const today = new Date().toISOString().split('T')[0];
      dateInput.value = today;
      statusInput.value = 'Confirmed';
      serviceSelect.value = '';
      fuelTypeInput.value = '';
      fuelTypeManualWrap.classList.add('d-none');
      fuelTypeManualSelect.required = false;
      fuelTypeManualSelect.value = '';
      otherServiceWrap.classList.add('d-none');
      serviceOtherInput.required = false;
      serviceOtherInput.value = '';
      
      if (appointmentModal) appointmentModal.hide();
      if (appointmentToast) {
        appointmentToastBody.textContent = `${customer} booked ${service} on ${formatDate(date)}.`;
        appointmentToast.show();
      }
    })
    .catch(err => {
      console.error('Cloud Error:', err);
      alert("Database connection offline. Appointment wasn't saved.");
    })
    .finally(() => {
      if (submitBtn) submitBtn.disabled = false;
    });
  });
}

if (modalElement) {
  modalElement.addEventListener('shown.bs.modal', () => { if (customerInput) customerInput.focus(); });
  modalElement.addEventListener('hidden.bs.modal', () => { if (newAppointmentForm) newAppointmentForm.classList.remove('was-validated'); });
}

function bootApp() {
  initializeVehicleSelectors();
  initializeUserStore();
  syncCloudUsers(); // Background sync for global account registry verification
  
  const today = new Date().toISOString().split('T')[0];
  if (dateInput) dateInput.value = today;
  
  const storedSession = getStoredSession();
  if (storedSession) {
    showAppView(storedSession);
    return;
  }
  showLoginView();
}

document.addEventListener('DOMContentLoaded', bootApp);