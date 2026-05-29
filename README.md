<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Automotive Service Center CRM Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@400;500;700&display=swap" rel="stylesheet" />
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="container-fluid py-3 py-md-4">
    <div class="row g-3 g-lg-4">
      <aside class="col-12 col-lg-3 col-xxl-2">
        <div class="card border-0 shadow-sm h-100 sidebar-shell">
          <div class="card-body d-flex flex-column gap-4">
            <div class="d-flex align-items-center gap-3">
              <div class="brand-mark">ASC</div>
              <div>
                <h1 class="h5 mb-0">IAM Lost CRM</h1>
                <p class="small text-secondary mb-0">Automotive Service Center</p>
              </div>
            </div>

            <nav class="nav nav-pills flex-row flex-lg-column gap-2 overflow-auto pb-1">
              <a class="nav-link active" href="#" data-view-target="dashboardView">Dashboard</a>
              <a class="nav-link" href="#" data-view-target="appointmentsView">Appointments</a>
              <a class="nav-link" href="#" data-view-target="customersView">Customers</a>
              <a class="nav-link" href="#">Work Orders</a>
              <a class="nav-link" href="#">Billing</a>
              <a class="nav-link" href="#">Inventory</a>
            </nav>
          </div>
        </div>
      </aside>

      <main class="col-12 col-lg-9 col-xxl-10">
        <div id="dashboardView" class="crm-view d-flex flex-column gap-3 gap-lg-4">
          <header class="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center gap-2 gap-md-3">
            <div>
              <h2 class="h4 mb-1">Dashboard Overview</h2>
              <p class="text-secondary mb-0">Service center performance snapshot for today</p>
            </div>
            <button class="btn btn-primary fw-semibold align-self-start align-self-md-auto action-btn" data-bs-toggle="modal" data-bs-target="#newAppointmentModal">+ New Appointment</button>
          </header>

          <section class="row g-3">
            <div class="col-12 col-sm-6 col-xl-3">
              <article class="card metric-card h-100 border-0 shadow-sm">
                <div class="card-body">
                  <p class="text-secondary small mb-1">Total Revenue</p>
                  <h3 class="h4 mb-2">--</h3>
                  <span class="badge text-bg-success-subtle text-success-emphasis border border-success-subtle">No data yet</span>
                </div>
              </article>
            </div>
            <div class="col-12 col-sm-6 col-xl-3">
              <article class="card metric-card h-100 border-0 shadow-sm">
                <div class="card-body">
                  <p class="text-secondary small mb-1">Active Work Orders</p>
                  <h3 class="h4 mb-2">--</h3>
                  <span class="badge text-bg-success-subtle text-success-emphasis border border-success-subtle">No data yet</span>
                </div>
              </article>
            </div>
            <div class="col-12 col-sm-6 col-xl-3">
              <article class="card metric-card h-100 border-0 shadow-sm">
                <div class="card-body">
                  <p class="text-secondary small mb-1">Completed Services</p>
                  <h3 class="h4 mb-2">--</h3>
                  <span class="badge text-bg-success-subtle text-success-emphasis border border-success-subtle">No data yet</span>
                </div>
              </article>
            </div>
            <div class="col-12 col-sm-6 col-xl-3">
              <article class="card metric-card h-100 border-0 shadow-sm">
                <div class="card-body">
                  <p class="text-secondary small mb-1">Customer Satisfaction</p>
                  <h3 class="h4 mb-2">--</h3>
                  <span class="badge text-bg-success-subtle text-success-emphasis border border-success-subtle">No data yet</span>
                </div>
              </article>
            </div>
          </section>

          <section class="row g-3">
            <div class="col-12 col-xl-8">
              <article class="card section-card border-0 shadow-sm h-100">
                <div class="card-body">
                  <h4 class="h6 mb-3">Revenue Trend (Last 7 Months)</h4>
                  <div class="chart-wrap chart-revenue">
                    <canvas id="revenueChart"></canvas>
                  </div>
                </div>
              </article>
            </div>

            <div class="col-12 col-xl-4">
              <article class="card section-card border-0 shadow-sm h-100">
                <div class="card-body">
                  <h4 class="h6 mb-3">Service Distribution</h4>
                  <div class="chart-wrap chart-service">
                    <canvas id="serviceChart"></canvas>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section class="row g-3">
            <div class="col-12 col-xl-8">
              <article class="card section-card border-0 shadow-sm h-100">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <h4 class="h6 mb-0">Recent Appointments</h4>
                    <a href="#" id="viewAllAppointmentsBtn" class="small text-decoration-none">View all</a>
                  </div>
                  <div class="table-responsive">
                    <table class="table align-middle appointment-table mb-0">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Vehicle</th>
                          <th>Service</th>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody id="recentAppointmentsBody"></tbody>
                    </table>
                  </div>
                </div>
              </article>
            </div>

            <div class="col-12 col-xl-4">
              <article class="card section-card border-0 shadow-sm h-100">
                <div class="card-body">
                  <h4 class="h6 mb-3">Quick Actions</h4>
                  <div class="d-grid gap-2">
                    <button class="btn btn-outline-secondary text-start quick-action-btn" data-bs-toggle="modal" data-bs-target="#newAppointmentModal">Schedule Appointment</button>
                    <button class="btn btn-outline-secondary text-start quick-action-btn" id="goCustomersBtn">Register New Customer</button>
                    <button class="btn btn-outline-secondary text-start quick-action-btn" id="goAppointmentsBtn">Manage Appointments</button>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </div>

        <div id="appointmentsView" class="crm-view d-none d-flex flex-column gap-3 gap-lg-4">
          <header class="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center gap-2 gap-md-3">
            <div>
              <h2 class="h4 mb-1">Appointments</h2>
              <p class="text-secondary mb-0">Track all service bookings and customer schedule flow.</p>
            </div>
            <button class="btn btn-primary fw-semibold action-btn" data-bs-toggle="modal" data-bs-target="#newAppointmentModal">+ Add Appointment</button>
          </header>

          <section class="row g-3">
            <div class="col-12 col-md-4">
              <article class="card section-card border-0 shadow-sm h-100">
                <div class="card-body">
                  <p class="small text-secondary mb-1">Total Appointments</p>
                  <h3 class="h4 mb-0" id="totalAppointmentsCount">0</h3>
                </div>
              </article>
            </div>
            <div class="col-12 col-md-4">
              <article class="card section-card border-0 shadow-sm h-100">
                <div class="card-body">
                  <p class="small text-secondary mb-1">Confirmed</p>
                  <h3 class="h4 mb-0" id="confirmedAppointmentsCount">0</h3>
                </div>
              </article>
            </div>
            <div class="col-12 col-md-4">
              <article class="card section-card border-0 shadow-sm h-100">
                <div class="card-body">
                  <p class="small text-secondary mb-1">Completed</p>
                  <h3 class="h4 mb-0" id="completedAppointmentsCount">0</h3>
                </div>
              </article>
            </div>
          </section>

          <section class="card section-card border-0 shadow-sm">
            <div class="card-body">
              <div class="table-responsive">
                <table class="table align-middle appointment-table mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Mobile</th>
                      <th>Vehicle</th>
                      <th>Fuel</th>
                      <th>Plate No.</th>
                      <th>Service</th>
                      <th>Date</th>
                      <th>Preferred Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody id="appointmentsTabBody"></tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        <div id="customersView" class="crm-view d-none d-flex flex-column gap-3 gap-lg-4">
          <header class="d-flex flex-column flex-md-row justify-content-md-between align-items-md-center gap-2 gap-md-3">
            <div>
              <h2 class="h4 mb-1">Customers</h2>
              <p class="text-secondary mb-0">Customer directory linked to service history and vehicle info.</p>
            </div>
            <div class="w-100 w-md-auto">
              <input id="customerSearchInput" type="text" class="form-control" placeholder="Search by name or mobile" />
            </div>
          </header>

          <section class="row g-3">
            <div class="col-12 col-md-6">
              <article class="card section-card border-0 shadow-sm h-100">
                <div class="card-body">
                  <p class="small text-secondary mb-1">Total Customers</p>
                  <h3 class="h4 mb-0" id="totalCustomersCount">0</h3>
                </div>
              </article>
            </div>
            <div class="col-12 col-md-6">
              <article class="card section-card border-0 shadow-sm h-100">
                <div class="card-body">
                  <p class="small text-secondary mb-1">With Repeat Visits</p>
                  <h3 class="h4 mb-0" id="repeatCustomersCount">0</h3>
                </div>
              </article>
            </div>
          </section>

          <section class="card section-card border-0 shadow-sm">
            <div class="card-body">
              <div class="table-responsive">
                <table class="table align-middle customer-table mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Mobile</th>
                      <th>Address</th>
                      <th>Vehicles</th>
                      <th>Total Visits</th>
                      <th>Last Service</th>
                    </tr>
                  </thead>
                  <tbody id="customersBody"></tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>

  <div class="modal fade" id="newAppointmentModal" tabindex="-1" aria-labelledby="newAppointmentModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
      <div class="modal-content appointment-modal">
        <form id="newAppointmentForm" novalidate>
          <div class="modal-header border-0 pb-1 appointment-modal-header">
            <div class="modal-title-wrap">
              <span class="modal-chip">Service Booking</span>
              <h5 class="modal-title" id="newAppointmentModalLabel">New Appointment</h5>
              <p class="text-secondary small mb-0">Complete the required fields and submit.</p>
            </div>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body pt-2">
            <div class="d-flex flex-column gap-3 appointment-form-layout">
              <section class="form-panel">
                <div class="form-panel-title">Customer</div>
                <div class="row g-3">
                  <div class="col-12 col-md-6">
                    <label for="customerInput" class="form-label">Name</label>
                    <input type="text" class="form-control form-control-lg" id="customerInput" maxlength="80" required />
                    <div class="invalid-feedback">Name is required.</div>
                  </div>
                  <div class="col-12 col-md-6">
                    <label for="mobileInput" class="form-label">Mobile No.</label>
                    <input type="tel" class="form-control form-control-lg" id="mobileInput" maxlength="11" inputmode="numeric" placeholder="09XXXXXXXXX" pattern="[0-9]{11}" required />
                    <div class="invalid-feedback">Enter exactly 11 digits.</div>
                  </div>
                  <div class="col-12">
                    <label for="addressInput" class="form-label">Address <span class="text-secondary small">(optional)</span></label>
                    <input type="text" class="form-control form-control-lg" id="addressInput" maxlength="150" />
                    <div class="form-hint-chip">For pickup/drop-off or home service only</div>
                  </div>
                </div>
              </section>

              <section class="form-panel">
                <div class="form-panel-title">Vehicle</div>
                <div class="row g-3">
                  <div class="col-12 col-md-4">
                    <label for="brandSelect" class="form-label">Brand</label>
                    <select class="form-select form-select-lg" id="brandSelect" required>
                      <option value="">Select brand</option>
                    </select>
                    <div class="invalid-feedback">Please select a brand.</div>
                  </div>
                  <div class="col-12 col-md-4">
                    <label for="modelSelect" class="form-label">Model</label>
                    <select class="form-select form-select-lg" id="modelSelect" required disabled>
                      <option value="">Select model</option>
                    </select>
                    <div class="invalid-feedback">Please select a model.</div>
                  </div>
                  <div class="col-12 col-md-4">
                    <label for="yearSelect" class="form-label">Year</label>
                    <select class="form-select form-select-lg" id="yearSelect" required disabled>
                      <option value="">Select year</option>
                    </select>
                    <div class="invalid-feedback">Please select a year.</div>
                  </div>
                  <div class="col-12 col-md-4">
                    <label for="fuelTypeInput" class="form-label">Fuel Type</label>
                    <input type="text" class="form-control form-control-lg fuel-readonly" id="fuelTypeInput" placeholder="Auto-detected" readonly required />
                    <div class="invalid-feedback">Fuel type will auto-fill after selecting a vehicle model.</div>
                  </div>
                  <div class="col-12 col-md-4 d-none" id="fuelTypeManualWrap">
                    <label for="fuelTypeManualSelect" class="form-label">Final Fuel</label>
                    <select class="form-select form-select-lg" id="fuelTypeManualSelect">
                      <option value="">Select fuel</option>
                      <option value="Gasoline">Gasoline</option>
                      <option value="Diesel">Diesel</option>
                    </select>
                    <div class="invalid-feedback">Please select fuel type for this vehicle.</div>
                  </div>
                  <div class="col-12 col-md-4">
                    <label for="plateInput" class="form-label">Plate No.</label>
                    <input type="text" class="form-control form-control-lg text-uppercase" id="plateInput" maxlength="15" placeholder="e.g. ABC 1234" required />
                    <div class="invalid-feedback">Plate number is required.</div>
                  </div>
                </div>
              </section>

              <section class="form-panel">
                <div class="form-panel-title">Service & Schedule</div>
                <div class="row g-3">
                  <div class="col-12 col-md-6">
                    <label for="serviceSelect" class="form-label">Service</label>
                    <select class="form-select form-select-lg" id="serviceSelect" required>
                      <option value="">Select a service</option>
                      <option value="Change Oil">Change Oil</option>
                      <option value="Periodic Maintenance">Periodic Maintenance</option>
                      <option value="Brake Service">Brake Service</option>
                      <option value="Tire Rotation">Tire Rotation</option>
                      <option value="Wheel Alignment">Wheel Alignment</option>
                      <option value="Battery Check">Battery Check</option>
                      <option value="Engine Diagnostics">Engine Diagnostics</option>
                      <option value="Aircon Service">Aircon Service</option>
                      <option value="Other">Other</option>
                    </select>
                    <div class="invalid-feedback">Please select a service.</div>
                  </div>
                  <div class="col-12 col-md-6 d-none" id="otherServiceWrap">
                    <label for="serviceOtherInput" class="form-label">Other Service</label>
                    <input type="text" class="form-control form-control-lg" id="serviceOtherInput" maxlength="80" placeholder="Type custom service" />
                    <div class="invalid-feedback">Please enter the custom service.</div>
                  </div>
                  <div class="col-12 col-md-4">
                    <label for="timeInput" class="form-label">Preferred Time</label>
                    <input type="time" class="form-control form-control-lg" id="timeInput" required />
                    <div class="invalid-feedback">Please choose a preferred time.</div>
                  </div>
                  <div class="col-12 col-md-4">
                    <label for="dateInput" class="form-label">Date</label>
                    <input type="date" class="form-control form-control-lg" id="dateInput" required />
                    <div class="invalid-feedback">Please choose a date.</div>
                  </div>
                  <div class="col-12 col-md-4">
                    <label for="statusInput" class="form-label">Status</label>
                    <select class="form-select form-select-lg" id="statusInput" required>
                      <option value="Confirmed">Confirmed</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              </section>
            </div>
          </div>
          <div class="modal-footer border-0 pt-1">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="submit" class="btn btn-primary px-4">Add Appointment</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <div class="toast-container position-fixed top-0 end-0 p-3">
    <div id="appointmentToast" class="toast border-0" role="status" aria-live="polite" aria-atomic="true">
      <div class="toast-header">
        <strong class="me-auto">Appointment Added</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body" id="appointmentToastBody">New appointment saved.</div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="script.js"></script>
</body>
</html>
