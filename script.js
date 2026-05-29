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
  'Change Oil': {
    price: 1800,
    technician: 'Miguel Reyes',
    eta: '45 min',
    parts: [
      { name: 'Engine Oil (L)', qty: 4 },
      { name: 'Oil Filter', qty: 1 }
    ]
  },
  'Periodic Maintenance': {
    price: 4500,
    technician: 'Carlo Santos',
    eta: '2 hr 30 min',
    parts: [
      { name: 'Engine Oil (L)', qty: 4 },
      { name: 'Oil Filter', qty: 1 },
      { name: 'Air Filter', qty: 1 },
      { name: 'Coolant', qty: 1 }
    ]
  },
  'Brake Service': {
    price: 3200,
    technician: 'Jessa Cruz',
    eta: '1 hr 40 min',
    parts: [
      { name: 'Brake Pads Set', qty: 1 },
      { name: 'Brake Fluid Bottle', qty: 1 }
    ]
  },
  'Tire Rotation': {
    price: 1200,
    technician: 'Nico Ramos',
    eta: '40 min',
    parts: [{ name: 'Tire Valve Set', qty: 1 }]
  },
  'Wheel Alignment': {
    price: 1500,
    technician: 'Nico Ramos',
    eta: '1 hr 00 min',
    parts: [{ name: 'Alignment Shim Kit', qty: 1 }]
  },
  'Battery Check': {
    price: 900,
    technician: 'Liza Gomez',
    eta: '25 min',
    parts: [{ name: 'Battery Terminal Cleaner', qty: 1 }]
  },
  'Engine Diagnostics': {
    price: 2500,
    technician: 'Marco Diaz',
    eta: '1 hr 20 min',
    parts: [{ name: 'Sensor Cleaner', qty: 1 }]
  },
  'Aircon Service': {
    price: 3800,
    technician: 'Paolo Lim',
    eta: '2 hr 00 min',
    parts: [
      { name: 'Cabin Filter', qty: 1 },
      { name: 'Refrigerant Can', qty: 1 }
    ]
  }
};

const inventoryCatalog = {
  'Engine Oil (L)': { category: 'Fluids', stock: 96, reorderPoint: 20 },
  'Oil Filter': { category: 'Filters', stock: 32, reorderPoint: 8 },
  'Air Filter': { category: 'Filters', stock: 18, reorderPoint: 6 },
  'Coolant': { category: 'Fluids', stock: 24, reorderPoint: 8 },
  'Brake Pads Set': { category: 'Brakes', stock: 14, reorderPoint: 4 },
  'Brake Fluid Bottle': { category: 'Fluids', stock: 20, reorderPoint: 6 },
  'Tire Valve Set': { category: 'Tires', stock: 40, reorderPoint: 10 },
  'Alignment Shim Kit': { category: 'Suspension', stock: 10, reorderPoint: 3 },
  'Battery Terminal Cleaner': { category: 'Electrical', stock: 25, reorderPoint: 6 },
  'Sensor Cleaner': { category: 'Electrical', stock: 16, reorderPoint: 5 },
  'Cabin Filter': { category: 'Filters', stock: 14, reorderPoint: 4 },
  'Refrigerant Can': { category: 'HVAC', stock: 22, reorderPoint: 6 },
  'Shop Supplies Kit': { category: 'Consumables', stock: 50, reorderPoint: 15 }
};

const navLinks = document.querySelectorAll('[data-view-target]');
const views = document.querySelectorAll('.crm-view');
const viewAllAppointmentsBtn = document.getElementById('viewAllAppointmentsBtn');
const goAppointmentsBtn = document.getElementById('goAppointmentsBtn');
const goCustomersBtn = document.getElementById('goCustomersBtn');
const goAppointmentsFromInventoryBtn = document.getElementById('goAppointmentsFromInventoryBtn');

const recentAppointmentsBody = document.getElementById('recentAppointmentsBody');
const appointmentsTabBody = document.getElementById('appointmentsTabBody');
const customersBody = document.getElementById('customersBody');
const workOrdersBody = document.getElementById('workOrdersBody');
const billingBody = document.getElementById('billingBody');
const inventoryBody = document.getElementById('inventoryBody');

const totalAppointmentsCount = document.getElementById('totalAppointmentsCount');
const confirmedAppointmentsCount = document.getElementById('confirmedAppointmentsCount');
const completedAppointmentsCount = document.getElementById('completedAppointmentsCount');
const totalCustomersCount = document.getElementById('totalCustomersCount');
const repeatCustomersCount = document.getElementById('repeatCustomersCount');
const customerSearchInput = document.getElementById('customerSearchInput');
const totalWorkOrdersCount = document.getElementById('totalWorkOrdersCount');
const activeWorkOrdersCount = document.getElementById('activeWorkOrdersCount');
const completedWorkOrdersCount = document.getElementById('completedWorkOrdersCount');
const totalBilledAmount = document.getElementById('totalBilledAmount');
const collectedBilledAmount = document.getElementById('collectedBilledAmount');
const outstandingBilledAmount = document.getElementById('outstandingBilledAmount');
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
const managedUsersBody = document.getElementById('managedUsersBody');
const goAdminManagementBtn = document.getElementById('goAdminManagementBtn');
const goAdminUsersBtn = document.getElementById('goAdminUsersBtn');
const goAppointmentsFromAdminBtn = document.getElementById('goAppointmentsFromAdminBtn');
const goInventoryFromAdminBtn = document.getElementById('goInventoryFromAdminBtn');

const loginView = document.getElementById('loginView');
const crmAppShell = document.getElementById('crmAppShell');
const loginForm = document.getElementById('loginForm');
const loginEmailInput = document.getElementById('loginEmailInput');
const loginPasswordInput = document.getElementById('loginPasswordInput');
const loginError = document.getElementById('loginError');
const togglePasswordBtn = document.getElementById('togglePasswordBtn');
const logoutBtn = document.getElementById('logoutBtn');
const sessionUserInitials = document.getElementById('sessionUserInitials');
const sessionUserName = document.getElementById('sessionUserName');
const sessionUserRole = document.getElementById('sessionUserRole');
const sessionUserEmail = document.getElementById('sessionUserEmail');

const newAppointmentForm = document.getElementById('newAppointmentForm');
const modalElement = document.getElementById('newAppointmentModal');
const appointmentModal = new bootstrap.Modal(modalElement);
const appointmentToastElement = document.getElementById('appointmentToast');
const appointmentToastBody = document.getElementById('appointmentToastBody');
const appointmentToast = new bootstrap.Toast(appointmentToastElement, { delay: 2200 });

const customerInput = document.getElementById('customerInput');
const mobileInput = document.getElementById('mobileInput');
const addressInput = document.getElementById('addressInput');
const brandSelect = document.getElementById('brandSelect');
const modelSelect = document.getElementById('modelSelect');
const yearSelect = document.getElementById('yearSelect');
const fuelTypeInput = document.getElementById('fuelTypeInput');
const fuelTypeManualWrap = document.getElementById('fuelTypeManualWrap');
const fuelTypeManualSelect = document.getElementById('fuelTypeManualSelect');
const plateInput = document.getElementById('plateInput');
const serviceSelect = document.getElementById('serviceSelect');
const otherServiceWrap = document.getElementById('otherServiceWrap');
const serviceOtherInput = document.getElementById('serviceOtherInput');
const dateInput = document.getElementById('dateInput');
const timeInput = document.getElementById('timeInput');
const statusInput = document.getElementById('statusInput');

const today = new Date().toISOString().split('T')[0];
dateInput.min = today;
dateInput.value = today;

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function getSeedAdminUser() {
  return { ...seedAdminUser };
}

function getSeedStaffUser() {
  return { ...seedStaffUser };
}

function isSeedAdminAccount(user) {
  return Boolean(
    user
    && (
      user.id === seedAdminUser.id
      || normalizeEmail(user.email || '') === seedAdminUser.email
    )
  );
}

function isSeedStaffAccount(user) {
  return Boolean(
    user
    && (
      user.id === seedStaffUser.id
      || normalizeEmail(user.email || '') === seedStaffUser.email
    )
  );
}

function normalizeStoredUser(user) {
  if (!user || !user.id || !user.email || !user.password) {
    return null;
  }

  return {
    id: String(user.id),
    name: String(user.name || user.email).trim(),
    email: normalizeEmail(String(user.email)),
    password: String(user.password),
    role: user.role === 'Admin' ? 'Admin' : 'Staff',
    active: user.active !== false,
    createdAt: user.createdAt || new Date().toISOString(),
    createdBy: user.createdBy || 'System',
    lastLoginAt: user.lastLoginAt || ''
  };
}

function persistUsers() {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(appUsers));
  } catch (_error) {
    // Local storage may be unavailable; keep the in-memory state working.
  }
}

function initializeUserStore() {
  const fallbackUsers = [getSeedAdminUser(), getSeedStaffUser()];

  try {
    const rawUsers = localStorage.getItem(USER_STORAGE_KEY);
    if (!rawUsers) {
      appUsers = fallbackUsers;
      persistUsers();
      return;
    }

    const parsedUsers = JSON.parse(rawUsers);
    const normalizedUsers = Array.isArray(parsedUsers)
      ? parsedUsers.map(normalizeStoredUser).filter(Boolean)
      : [];

    if (normalizedUsers.length === 0) {
      appUsers = fallbackUsers;
      persistUsers();
      return;
    }

    const hasActiveAdmin = normalizedUsers.some((user) => user.role === 'Admin' && user.active);
    if (!hasActiveAdmin) {
      const existingSeedAdmin = normalizedUsers.find((user) => isSeedAdminAccount(user));
      if (existingSeedAdmin) {
        existingSeedAdmin.role = 'Admin';
        existingSeedAdmin.active = true;
      } else {
        normalizedUsers.unshift(getSeedAdminUser());
      }
    }

    const hasStaffSeed = normalizedUsers.some((user) => isSeedStaffAccount(user));
    if (!hasStaffSeed) {
      normalizedUsers.push(getSeedStaffUser());
    }

    normalizedUsers.forEach((user) => {
      if (isSeedAdminAccount(user)) {
        user.id = seedAdminUser.id;
        user.name = seedAdminUser.name;
        user.email = seedAdminUser.email;
        user.password = seedAdminUser.password;
        user.role = 'Admin';
        user.active = true;
        user.createdBy = 'System';
        user.createdAt = user.createdAt || seedAdminUser.createdAt;
      }

      if (isSeedStaffAccount(user)) {
        user.id = seedStaffUser.id;
        user.name = seedStaffUser.name;
        user.email = seedStaffUser.email;
        user.password = seedStaffUser.password;
        user.role = 'Staff';
        user.active = true;
        user.createdBy = 'System';
        user.createdAt = user.createdAt || seedStaffUser.createdAt;
      }
    });

    const seenEmails = new Set();
    appUsers = normalizedUsers.filter((user) => {
      const normalizedEmail = normalizeEmail(user.email);
      if (seenEmails.has(normalizedEmail)) {
        return false;
      }

      seenEmails.add(normalizedEmail);
      return true;
    });
    persistUsers();
  } catch (_error) {
    appUsers = fallbackUsers;
    persistUsers();
  }
}

function generateUserId() {
  return `user_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function findUserById(userId) {
  return appUsers.find((user) => user.id === userId) || null;
}

function findUserByEmail(email) {
  return appUsers.find((user) => user.email === normalizeEmail(email)) || null;
}

function updateStoredUser(userId, updates) {
  appUsers = appUsers.map((user) => (
    user.id === userId
      ? { ...user, ...updates }
      : user
  ));
  persistUsers();
  return findUserById(userId);
}

function buildSessionFromUser(user) {
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };
}

function getInitials(name) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return initials || 'AL';
}

function _setSessionUser(session) {
  sessionUserName.textContent = session.name;
  sessionUserRole.textContent = session.role;
  sessionUserEmail.textContent = session.email;
  sessionUserInitials.textContent = getInitials(session.name);
}

function storeSession(session) {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ userId: session.userId }));
  } catch (_error) {
    // Local storage may be unavailable; the app can still run for this tab.
  }
}

function clearStoredSession() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (_error) {
    // Ignore storage failures on logout.
  }
}

function getStoredSession() {
  try {
    const rawSession = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawSession) {
      return null;
    }

    const parsedSession = JSON.parse(rawSession);
    const matchedUser = findUserById(parsedSession.userId);
    if (!matchedUser || !matchedUser.active) {
      return null;
    }

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
  userManagementMessage.className = 'alert d-none py-2 px-3 mb-0';
}

function setPasswordVisibility(isVisible) {
  loginPasswordInput.type = isVisible ? 'text' : 'password';
  togglePasswordBtn.textContent = isVisible ? 'Hide' : 'Show';
  togglePasswordBtn.setAttribute('aria-label', isVisible ? 'Hide password' : 'Show password');
}

function authenticateUser(email, password) {
  const matchedUser = findUserByEmail(email);
  if (!matchedUser || matchedUser.password !== password) {
    return {
      user: null,
      error: 'Invalid email or password.'
    };
  }

  return {
    user: matchedUser.active ? matchedUser : null,
    error: matchedUser.active ? '' : 'This account is disabled. Contact an admin.'
  };
}

function formatDateTime(dateText) {
  if (!dateText) {
    return 'Never';
  }

  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) {
    return 'Never';
  }

  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

function getDefaultDashboardView(session = currentSession) {
  return canAccessAdmin(session) ? 'adminDashboardView' : 'staffDashboardView';
}

function canAccessAdmin(session = currentSession) {
  return Boolean(session && session.role === 'Admin');
}

function syncAdminAccess() {
  const isAdmin = canAccessAdmin();
  primaryDashboardLink.dataset.viewTarget = getDefaultDashboardView();
  adminNavLink.classList.toggle('d-none', !isAdmin);

  if (
    !isAdmin
    && ['adminView', 'adminDashboardView'].includes(document.querySelector('.nav-link.active')?.dataset.viewTarget || '')
  ) {
    switchView(getDefaultDashboardView());
  }
}

function showLoginView() {
  currentSession = null;
  crmAppShell.classList.add('d-none');
  loginView.classList.remove('d-none');
  hideLoginError();
  hideUserManagementMessage();
  loginForm.reset();
  loginForm.classList.remove('was-validated');
  setPasswordVisibility(false);
}

function showAppView(session) {
  currentSession = session;
  _setSessionUser(session);
  syncAdminAccess();
  loginView.classList.add('d-none');
  crmAppShell.classList.remove('d-none');
  initializeCharts();

  fetch(AMZN_LAMBDA_URL)
    .then(response => {
      if (!response.ok) throw new Error('Database read failed.');
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

function completeLogin(user) {
  const refreshedUser = updateStoredUser(user.id, {
    lastLoginAt: new Date().toISOString()
  });
  const session = buildSessionFromUser(refreshedUser);

  storeSession(session);
  hideLoginError();
  loginForm.classList.remove('was-validated');
  setPasswordVisibility(false);
  showAppView(session);
}

function logout() {
  currentSession = null;
  clearStoredSession();
  appointmentModal.hide();
  appointmentToast.hide();
  showLoginView();
  loginEmailInput.focus();
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
  if (activeView) {
    activeView.classList.remove('d-none');
  }

  const activeLink = document.querySelector(`[data-view-target="${resolvedViewId}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
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
if (goAppointmentsBtn) {
  goAppointmentsBtn.addEventListener('click', () => switchView('appointmentsView'));
}
if (goCustomersBtn) {
  goCustomersBtn.addEventListener('click', () => switchView('customersView'));
}
if (goAppointmentsFromInventoryBtn) {
  goAppointmentsFromInventoryBtn.addEventListener('click', () => switchView('appointmentsView'));
}
if (goAdminManagementBtn) {
  goAdminManagementBtn.addEventListener('click', () => switchView('adminView'));
}
if (goAdminUsersBtn) {
  goAdminUsersBtn.addEventListener('click', () => switchView('adminView'));
}
if (goAppointmentsFromAdminBtn) {
  goAppointmentsFromAdminBtn.addEventListener('click', () => switchView('appointmentsView'));
}
if (goInventoryFromAdminBtn) {
  goInventoryFromAdminBtn.addEventListener('click', () => switchView('inventoryView'));
}
if (togglePasswordBtn) {
  togglePasswordBtn.addEventListener('click', () => {
    setPasswordVisibility(loginPasswordInput.type === 'password');
  });
}
if (loginForm) {
  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    hideLoginError();

    if (!loginForm.checkValidity()) {
      loginForm.classList.add('was-validated');
      return;
    }

    const { user, error } = authenticateUser(loginEmailInput.value, loginPasswordInput.value);
    if (!user) {
      showLoginError(error);
      return;
    }

    completeLogin(user);
  });
}
if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}
[loginEmailInput, loginPasswordInput].forEach((input) => {
  if (!input) {
    return;
  }

  input.addEventListener('input', () => {
    hideLoginError();
  });
});
if (userManagementForm) {
  userManagementForm.addEventListener('submit', (event) => {
    event.preventDefault();
    hideUserManagementMessage();

    if (!userManagementForm.checkValidity()) {
      userManagementForm.classList.add('was-validated');
      return;
    }

    const normalizedEmail = normalizeEmail(adminEmailInput.value);
    if (findUserByEmail(normalizedEmail)) {
      showUserManagementMessage('danger', 'That email is already assigned to another account.');
      return;
    }

    const payload = {
      action: 'createUser',
      id: generateUserId(),
      name: adminNameInput.value.trim(),
      email: normalizedEmail,
      password: adminPasswordInput.value.trim(),
      role: adminRoleSelect.value === 'Admin' ? 'Admin' : 'Staff',
      active: true,
      createdAt: new Date().toISOString(),
      createdBy: currentSession ? currentSession.name : 'Admin',
      lastLoginAt: ''
    };

    const submitBtn = userManagementForm.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    fetch(AMZN_LAMBDA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(response => {
      if (!response.ok) throw new Error('Cloud persistence operation rejected.');
      return response.json();
    })
    .then(persistedUser => {
      appUsers.unshift(persistedUser);
      persistUsers();
      renderAdminPage();

      const createdRole = adminRoleSelect.value === 'Admin' ? 'admin' : 'staff';
      showUserManagementMessage('success', `Created ${createdRole} account for ${adminNameInput.value.trim()}.`);
      
      userManagementForm.reset();
      userManagementForm.classList.remove('was-validated');
      adminRoleSelect.value = 'Staff';
    })
    .catch(err => {
      console.error('Cloud Synchronization Error:', err);
      showUserManagementMessage('danger', 'Database connection offline. Account could not be provisioned.');
    })
    .finally(() => {
      if (submitBtn) submitBtn.disabled = false;
    });
  });
}
if (managedUsersBody) {
  managedUsersBody.addEventListener('click', (event) => {
    const actionButton = event.target.closest('[data-user-action]');
    if (!actionButton) {
      return;
    }

    const targetUser = findUserById(actionButton.dataset.userId);
    if (!targetUser) {
      return;
    }

    if (targetUser.id === currentSession?.userId) {
      showUserManagementMessage('warning', 'You cannot disable the account currently signed in.');
      return;
    }

    if (targetUser.role === 'Admin' && targetUser.active) {
      const activeAdminCount = appUsers.filter((user) => user.role === 'Admin' && user.active).length;
      if (activeAdminCount <= 1) {
        showUserManagementMessage('warning', 'At least one active admin account must remain.');
        return;
      }
    }

    const updatedUser = updateStoredUser(targetUser.id, {
      active: !targetUser.active
    });
    renderAdminPage();
    showUserManagementMessage(
      updatedUser.active ? 'success' : 'secondary',
      `${updatedUser.name} is now ${updatedUser.active ? 'active' : 'disabled'}.`
    );
  });
}
[adminNameInput, adminEmailInput, adminPasswordInput].forEach((input) => {
  if (!input) {
    return;
  }

  input.addEventListener('input', () => {
    hideUserManagementMessage();
  });
});

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

function isMixedFuelModel(brand, model) {
  return mixedFuelModelKeys.has(`${brand}|${model}`);
}

function inferFuelType(brand, model, _year) {
  if (!brand || !model) {
    return '';
  }
  return dieselModelKeys.has(`${brand}|${model}`) ? 'Diesel' : 'Gasoline';
}

brandSelect.addEventListener('change', () => {
  const selectedBrand = brandSelect.value;
  fuelTypeInput.value = '';
  fuelTypeManualWrap.classList.add('d-none');
  fuelTypeManualSelect.required = false;
  fuelTypeManualSelect.value = '';

  if (!selectedBrand) {
    resetVehicleSelectors();
    return;
  }

  const models = Object.keys(vehicleCatalog[selectedBrand]);
  populateSelect(modelSelect, models, 'Select model');
  modelSelect.disabled = false;
  populateSelect(yearSelect, [], 'Select year');
  yearSelect.disabled = true;
});

modelSelect.addEventListener('change', () => {
  const selectedBrand = brandSelect.value;
  const selectedModel = modelSelect.value;
  fuelTypeInput.value = '';
  fuelTypeManualWrap.classList.add('d-none');
  fuelTypeManualSelect.required = false;
  fuelTypeManualSelect.value = '';

  if (!selectedBrand || !selectedModel) {
    populateSelect(yearSelect, [], 'Select year');
    yearSelect.disabled = true;
    return;
  }

  const years = vehicleCatalog[selectedBrand][selectedModel] || [];
  populateSelect(yearSelect, years, 'Select year');
  yearSelect.disabled = false;
});

yearSelect.addEventListener('change', () => {
  const selectedBrand = brandSelect.value;
  const selectedModel = modelSelect.value;
  const selectedYear = yearSelect.value;

  if (isMixedFuelModel(selectedBrand, selectedModel)) {
    fuelTypeInput.value = 'Mixed fuel model';
    fuelTypeManualWrap.classList.remove('d-none');
    fuelTypeManualSelect.required = true;
    return;
  }

  fuelTypeManualWrap.classList.add('d-none');
  fuelTypeManualSelect.required = false;
  fuelTypeManualSelect.value = '';
  fuelTypeInput.value = inferFuelType(selectedBrand, selectedModel, selectedYear);
});

serviceSelect.addEventListener('change', () => {
  const isOther = serviceSelect.value === 'Other';
  otherServiceWrap.classList.toggle('d-none', !isOther);
  serviceOtherInput.required = isOther;

  if (!isOther) {
    serviceOtherInput.value = '';
  }
});

function formatTimeTo12Hour(time24) {
  const [hoursText, minutes] = time24.split(':');
  const hours = Number(hoursText);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${String(hour12).padStart(2, '0')}:${minutes} ${suffix}`;
}

function formatDate(dateText) {
  const date = new Date(`${dateText}T00:00:00`);
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  }).format(date);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0
  }).format(amount);
}

function getDateTimestamp(appointment) {
  if (appointment.dateRaw) {
    return new Date(`${appointment.dateRaw}T00:00:00`).getTime();
  }

  const parsed = new Date(appointment.date).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getServiceMeta(service) {
  return serviceCatalog[service] || {
    ...defaultServiceMeta,
    parts: defaultServiceMeta.parts.map((part) => ({ ...part }))
  };
}

function getBadgeClass(map, status) {
  return map[status] || 'bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle';
}

function buildAppointmentRow(item, compact = false) {
  const badgeClass = statusBadgeMap[item.status] || 'bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle';
  if (compact) {
    return `
      <td class="fw-semibold">${item.customer}</td>
      <td>${item.vehicle}</td>
      <td>${item.service}</td>
      <td>${item.date}</td>
      <td><span class="badge rounded-pill ${badgeClass}">${item.status}</span></td>
    `;
  }

  return `
    <td class="fw-semibold">${item.customer}</td>
    <td>${item.mobile}</td>
    <td>${item.vehicle}</td>
    <td>${item.fuelType}</td>
    <td>${item.plate}</td>
    <td>${item.service}</td>
    <td>${item.date}</td>
    <td>${item.time}</td>
    <td><span class="badge rounded-pill ${badgeClass}">${item.status}</span></td>
  `;
}

function renderRecentAppointments() {
  recentAppointmentsBody.innerHTML = '';
  const recent = dashboardData.appointments.slice(0, 5);

  if (recent.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = '<td colspan="5" class="text-center text-secondary py-4">No appointments yet</td>';
    recentAppointmentsBody.appendChild(emptyRow);
    return;
  }

  recent.forEach((item) => {
    const tr = document.createElement('tr');
    tr.innerHTML = buildAppointmentRow(item, true);
    recentAppointmentsBody.appendChild(tr);
  });
}

function renderAppointmentsTab() {
  appointmentsTabBody.innerHTML = '';

  if (dashboardData.appointments.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = '<td colspan="9" class="text-center text-secondary py-4">No appointments yet</td>';
    appointmentsTabBody.appendChild(emptyRow);
  } else {
    dashboardData.appointments.forEach((item) => {
      const tr = document.createElement('tr');
      tr.innerHTML = buildAppointmentRow(item, false);
      appointmentsTabBody.appendChild(tr);
    });
  }

  totalAppointmentsCount.textContent = String(dashboardData.appointments.length);
  confirmedAppointmentsCount.textContent = String(dashboardData.appointments.filter((a) => a.status === 'Confirmed').length);
  completedAppointmentsCount.textContent = String(dashboardData.appointments.filter((a) => a.status === 'Completed').length);
}

function getCustomersSummary() {
  const map = new Map();

  dashboardData.appointments.forEach((appointment) => {
    const key = `${appointment.customer}|${appointment.mobile}`;
    const timestamp = getDateTimestamp(appointment);
    const existing = map.get(key) || {
      customer: appointment.customer,
      mobile: appointment.mobile,
      address: appointment.address || '-',
      vehicles: new Set(),
      visits: 0,
      lastServiceDate: appointment.date,
      lastServiceTimestamp: timestamp
    };

    existing.vehicles.add(appointment.vehicle);
    existing.visits += 1;
    if (appointment.address) {
      existing.address = appointment.address;
    }
    if (timestamp >= existing.lastServiceTimestamp) {
      existing.lastServiceDate = appointment.date;
      existing.lastServiceTimestamp = timestamp;
    }

    map.set(key, existing);
  });

  return Array.from(map.values()).map((item) => ({
    ...item,
    vehicleCount: item.vehicles.size
  }));
}

function renderCustomers(filterText = '') {
  customersBody.innerHTML = '';
  const allCustomers = getCustomersSummary();
  const normalized = filterText.trim().toLowerCase();
  const filteredCustomers = normalized
    ? allCustomers.filter((item) => item.customer.toLowerCase().includes(normalized) || item.mobile.includes(normalized))
    : allCustomers;

  totalCustomersCount.textContent = String(allCustomers.length);
  repeatCustomersCount.textContent = String(allCustomers.filter((c) => c.visits > 1).length);

  if (filteredCustomers.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = '<td colspan="6" class="text-center text-secondary py-4">No customers found</td>';
    customersBody.appendChild(emptyRow);
    return;
  }

  filteredCustomers.forEach((item) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="fw-semibold">${item.customer}</td>
      <td>${item.mobile}</td>
      <td>${item.address || '-'}</td>
      <td>${item.vehicleCount}</td>
      <td>${item.visits}</td>
      <td>${item.lastServiceDate}</td>
    `;
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
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = '<td colspan="7" class="text-center text-secondary py-4">No work orders yet</td>';
    workOrdersBody.appendChild(emptyRow);
    return;
  }

  workOrders.forEach((item) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="fw-semibold">${item.id}</td>
      <td>${item.customer}</td>
      <td>${item.vehicle}</td>
      <td>${item.service}</td>
      <td>${item.technician}</td>
      <td>${item.eta}</td>
      <td><span class="badge rounded-pill ${getBadgeClass(workOrderStatusBadgeMap, item.status)}">${item.status}</span></td>
    `;
    workOrdersBody.appendChild(tr);
  });
}

function getBillingEntries() {
  return dashboardData.appointments.map((appointment, index) => {
    const serviceMeta = getServiceMeta(appointment.service);
    let paymentStatus = 'Unpaid';

    if (appointment.status === 'In Progress') {
      paymentStatus = 'Processing';
    } else if (appointment.status === 'Completed') {
      paymentStatus = 'Paid';
    }

    return {
      id: `INV-${String(index + 1).padStart(4, '0')}`,
      customer: appointment.customer,
      service: appointment.service,
      dueDate: appointment.date,
      amount: serviceMeta.price,
      paymentStatus
    };
  });
}

function renderBilling() {
  const bills = getBillingEntries();
  billingBody.innerHTML = '';

  const totalBilled = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const collected = bills
    .filter((bill) => bill.paymentStatus === 'Paid')
    .reduce((sum, bill) => sum + bill.amount, 0);
  const outstanding = totalBilled - collected;

  totalBilledAmount.textContent = formatCurrency(totalBilled);
  collectedBilledAmount.textContent = formatCurrency(collected);
  outstandingBilledAmount.textContent = formatCurrency(outstanding);

  if (bills.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = '<td colspan="6" class="text-center text-secondary py-4">No billable entries yet</td>';
    billingBody.appendChild(emptyRow);
    return;
  }

  bills.forEach((bill) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="fw-semibold">${bill.id}</td>
      <td>${bill.customer}</td>
      <td>${bill.service}</td>
      <td>${bill.dueDate}</td>
      <td>${formatCurrency(bill.amount)}</td>
      <td><span class="badge rounded-pill ${getBadgeClass(billingStatusBadgeMap, bill.paymentStatus)}">${bill.paymentStatus}</span></td>
    `;
    billingBody.appendChild(tr);
  });
}

function getInventorySnapshot() {
  const stockUsage = new Map(
    Object.keys(inventoryCatalog).map((itemName) => [
      itemName,
      { reserved: 0, used: 0 }
    ])
  );

  dashboardData.appointments.forEach((appointment) => {
    const serviceMeta = getServiceMeta(appointment.service);

    serviceMeta.parts.forEach((part) => {
      const usage = stockUsage.get(part.name) || { reserved: 0, used: 0 };

      if (appointment.status === 'Completed') {
        usage.used += part.qty;
      } else {
        usage.reserved += part.qty;
      }

      stockUsage.set(part.name, usage);
    });
  });

  return Object.entries(inventoryCatalog)
    .map(([itemName, itemMeta]) => {
      const usage = stockUsage.get(itemName) || { reserved: 0, used: 0 };
      const onHand = Math.max(itemMeta.stock - usage.used, 0);
      const available = Math.max(onHand - usage.reserved, 0);

      let status = 'Healthy';
      if (available <= itemMeta.reorderPoint) {
        status = 'Low Stock';
      } else if (available <= itemMeta.reorderPoint + 5) {
        status = 'Watch';
      }

      return {
        itemName,
        category: itemMeta.category,
        onHand,
        reserved: usage.reserved,
        available,
        reorderPoint: itemMeta.reorderPoint,
        status
      };
    })
    .sort((a, b) => a.available - b.available || a.itemName.localeCompare(b.itemName));
}

function renderInventory() {
  const inventoryItems = getInventorySnapshot();
  inventoryBody.innerHTML = '';

  inventoryTrackedCount.textContent = String(inventoryItems.length);
  inventoryLowStockCount.textContent = String(inventoryItems.filter((item) => item.status === 'Low Stock').length);
  inventoryReservedCount.textContent = String(inventoryItems.reduce((sum, item) => sum + item.reserved, 0));

  inventoryItems.forEach((item) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="fw-semibold">${item.itemName}</td>
      <td>${item.category}</td>
      <td>${item.onHand}</td>
      <td>${item.reserved}</td>
      <td>${item.available}</td>
      <td>${item.reorderPoint}</td>
      <td><span class="badge rounded-pill ${getBadgeClass(inventoryStatusBadgeMap, item.status)}">${item.status}</span></td>
    `;
    inventoryBody.appendChild(tr);
  });
}

function getUserRoleBadgeClass(role) {
  return role === 'Admin'
    ? 'bg-info-subtle text-info-emphasis border border-info-subtle'
    : 'bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle';
}

function getUserStatusBadgeClass(isActive) {
  return isActive
    ? 'bg-success-subtle text-success-emphasis border border-success-subtle'
    : 'bg-danger-subtle text-danger-emphasis border border-danger-subtle';
}

function renderAdminDashboard() {
  if (!dashboardTotalUsersCount) {
    return;
  }

  dashboardTotalUsersCount.textContent = String(appUsers.length);
  dashboardActiveAdminsCount.textContent = String(appUsers.filter((user) => user.role === 'Admin' && user.active).length);
  dashboardActiveStaffCount.textContent = String(appUsers.filter((user) => user.role === 'Staff' && user.active).length);
  dashboardTodayAppointmentsCount.textContent = String(
    dashboardData.appointments.filter((appointment) => appointment.dateRaw === today).length
  );

  adminRecentLoginsBody.innerHTML = '';

  const recentLogins = [...appUsers]
    .filter((user) => user.lastLoginAt)
    .sort((left, right) => new Date(right.lastLoginAt).getTime() - new Date(left.lastLoginAt).getTime())
    .slice(0, 6);

  if (recentLogins.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = '<td colspan="4" class="text-center text-secondary py-4">No successful sign-ins yet</td>';
    adminRecentLoginsBody.appendChild(emptyRow);
    return;
  }

  recentLogins.forEach((user) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="fw-semibold">${user.name}</td>
      <td>${user.email}</td>
      <td><span class="badge rounded-pill ${getUserRoleBadgeClass(user.role)}">${user.role}</span></td>
      <td>${formatDateTime(user.lastLoginAt)}</td>
    `;
    adminRecentLoginsBody.appendChild(tr);
  });
}

function renderAdminPage() {
  if (!managedUsersBody) {
    return;
  }

  totalUsersCount.textContent = String(appUsers.length);
  totalAdminUsersCount.textContent = String(appUsers.filter((user) => user.role === 'Admin').length);
  totalStaffUsersCount.textContent = String(appUsers.filter((user) => user.role === 'Staff').length);

  managedUsersBody.innerHTML = '';

  if (!canAccessAdmin()) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = '<td colspan="7" class="text-center text-secondary py-4">Admin access required</td>';
    managedUsersBody.appendChild(emptyRow);
    return;
  }

  const activeAdminCount = appUsers.filter((user) => user.role === 'Admin' && user.active).length;
  const sortedUsers = [...appUsers].sort((left, right) => {
    if (left.role !== right.role) {
      return left.role === 'Admin' ? -1 : 1;
    }
    if (left.active !== right.active) {
      return left.active ? -1 : 1;
    }
    return left.name.localeCompare(right.name);
  });

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
    const actionLabel = isCurrentUser
      ? 'Current User'
      : user.active
        ? 'Disable'
        : 'Enable';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="fw-semibold">${user.name}</td>
      <td>${user.email}</td>
      <td><span class="badge rounded-pill ${getUserRoleBadgeClass(user.role)}">${user.role}</span></td>
      <td><span class="badge rounded-pill ${getUserStatusBadgeClass(user.active)}">${user.active ? 'Active' : 'Disabled'}</span></td>
      <td>${formatDateTime(user.lastLoginAt)}</td>
      <td>${user.createdBy}</td>
      <td>
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary user-action-btn"
          data-user-action="toggle-active"
          data-user-id="${user.id}"
          ${actionDisabled ? 'disabled' : ''}
        >
          ${actionLabel}
        </button>
      </td>
    `;
    managedUsersBody.appendChild(tr);
  });
}

function buildRevenueChartConfig() {
  const revenueLabels = dashboardData.revenue.labels;
  const revenueValues = dashboardData.revenue.values;

  return {
    type: 'line',
    data: {
      labels: revenueLabels,
      datasets: [{
        label: 'Revenue (PHP)',
        data: revenueValues,
        borderColor: '#0e7490',
        backgroundColor: 'rgba(14, 116, 144, 0.15)',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: '#0e7490'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `\u20B1${value}`
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: revenueValues.length > 0 }
      }
    }
  };
}

function buildServiceChartConfig() {
  const serviceLabels = dashboardData.serviceDistribution.labels;
  const serviceValues = dashboardData.serviceDistribution.values;

  return {
    type: 'doughnut',
    data: {
      labels: serviceLabels.length ? serviceLabels : ['No data'],
      datasets: [{
        data: serviceValues.length ? serviceValues : [1],
        backgroundColor: serviceValues.length
          ? ['#0e7490', '#f97316', '#22c55e', '#e11d48', '#a855f7']
          : ['#cbd5e1'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        },
        tooltip: {
          enabled: serviceValues.length > 0
        }
      }
    }
  };
}

function initializeCharts() {
  const revenueCanvas = document.getElementById('revenueChart');
  const serviceCanvas = document.getElementById('serviceChart');

  if (!revenueChart && revenueCanvas) {
    revenueChart = new Chart(revenueCanvas, buildRevenueChartConfig());
  }

  if (!serviceChart && serviceCanvas) {
    serviceChart = new Chart(serviceCanvas, buildServiceChartConfig());
  }

  window.requestAnimationFrame(() => {
    if (revenueChart) {
      revenueChart.resize();
    }

    if (serviceChart) {
      serviceChart.resize();
    }
  });
}

function renderAll() {
  const serviceCounts = {};
  const revenueMap = {};

  dashboardData.appointments.forEach(app => {
    const meta = getServiceMeta(app.service);
    const cost = meta.price;
    
    serviceCounts[app.service] = (serviceCounts[app.service] || 0) + 1;
    
    const dateKey = app.date || 'Unknown';
    revenueMap[dateKey] = (revenueMap[dateKey] || 0) + cost;
  });

  dashboardData.serviceDistribution.labels = Object.keys(serviceCounts);
  dashboardData.serviceDistribution.values = Object.values(serviceCounts);

  const sortedDates = Object.keys(revenueMap).sort((a, b) => new Date(a) - new Date(b));
  dashboardData.revenue.labels = sortedDates;
  dashboardData.revenue.values = sortedDates.map(d => revenueMap[d]);

  if (revenueChart) {
    revenueChart.data.labels = dashboardData.revenue.labels;
    revenueChart.data.datasets[0].data = dashboardData.revenue.values;
    revenueChart.options.plugins.tooltip.enabled = dashboardData.revenue.values.length > 0;
    revenueChart.update();
  }

  if (serviceChart) {
    const hasData = dashboardData.serviceDistribution.values.length > 0;
    serviceChart.data.labels = hasData ? dashboardData.serviceDistribution.labels : ['No data'];
    serviceChart.data.datasets[0].data = hasData ? dashboardData.serviceDistribution.values : [1];
    serviceChart.data.datasets[0].backgroundColor = hasData 
      ? ['#0e7490', '#f97316', '#22c55e', '#e11d48', '#a855f7'] 
      : ['#cbd5e1'];
    serviceChart.options.plugins.tooltip.enabled = hasData;
    serviceChart.update();
  }

  renderRecentAppointments();
  renderAppointmentsTab();
  renderCustomers(customerSearchInput ? customerSearchInput.value : '');
  renderWorkOrders();
  renderBilling();
  renderInventory();
  renderAdminDashboard();
  renderAdminPage();
}

newAppointmentForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!newAppointmentForm.checkValidity()) {
    newAppointmentForm.classList.add('was-validated');
    return;
  }

  const customer = customerInput.value.trim();
  const mobile = mobileInput.value.trim();
  const address = addressInput.value.trim();
  const vehicle = `${brandSelect.value} ${modelSelect.value} ${yearSelect.value}`.trim();
  const fuelType = fuelTypeManualSelect.required ? fuelTypeManualSelect.value : fuelTypeInput.value;
  const plate = plateInput.value.trim().toUpperCase();
  let service = serviceSelect.value.trim();
  if (service === 'Other') {
    service = serviceOtherInput.value.trim();
  }
  const date = dateInput.value;
  const time = timeInput.value;
  const status = statusInput.value;

  const payload = {
    customer,
    mobile,
    address,
    vehicle,
    fuelType,
    plate,
    service,
    dateRaw: date,
    date: formatDate(date),
    time: formatTimeTo12Hour(time),
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
    if (!response.ok) throw new Error('Failed to save to database.');
    return response.json();
  })
  .then(persistedItem => {
    dashboardData.appointments.unshift(persistedItem);
    renderAll();
    newAppointmentForm.reset();
    newAppointmentForm.classList.remove('was-validated');
    initializeVehicleSelectors();
    
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
    
    appointmentModal.hide();
    appointmentToastBody.textContent = `${customer} booked ${service} on ${formatDate(date)}.`;
    appointmentToast.show();
  })
  .catch(err => {
    console.error('Cloud Error:', err);
    alert("Database connection offline. Appointment wasn't saved.");
  })
  .finally(() => {
    if (submitBtn) submitBtn.disabled = false;
  });
});

modalElement.addEventListener('shown.bs.modal', () => {
  customerInput.focus();
});

modalElement.addEventListener('hidden.bs.modal', () => {
  newAppointmentForm.classList.remove('was-validated');
});

function bootApp() {
  initializeVehicleSelectors();
  initializeUserStore();

  const storedSession = getStoredSession();
  if (storedSession) {
    showAppView(storedSession);
    return;
  }

  showLoginView();
  loginEmailInput.focus();
}

bootApp();