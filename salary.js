  const employeeTableBody = document.getElementById("employeeTableBody");
const employeeProfileTableBody = document.getElementById("employeeProfileTableBody");
const employeeSelect = document.getElementById("employeeSelect");
const totalSalaryEl = document.getElementById("totalSalary");
const monthlySummaryTableBody = document.getElementById("monthlySummaryTableBody");
const monthlyTotalEl = document.getElementById("monthlyTotal");
const monthFilter = document.getElementById("monthFilter");
const salaryForm = document.getElementById("salaryForm");
const employeeForm = document.getElementById("employeeForm");
const editEmployeeForm = document.getElementById("editEmployeeForm");
const editEmployeeModal = document.getElementById("editEmployeeModal");
const archivesModal = document.getElementById("archivesModal");

let employees = JSON.parse(localStorage.getItem("employeeProfiles")) || [];
let salaryRecords = JSON.parse(localStorage.getItem("salaryRecords")) || [];
let archives = JSON.parse(localStorage.getItem("payrollArchives")) || [];
let totalPaid = salaryRecords.reduce((acc, record) => acc + record.salary, 0);
let currentEditingEmployeeId = null;
let filteredRecords = salaryRecords;
let monthlyChart = null;
let topEarnersChart = null;

updateProfileTable();
updateSalaryTable();
updateEmployeeSelect();
updateMonthlySummary();
updateDashboard();

// Add new employee profile
employeeForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const name = document.getElementById("newEmployeeName").value;
  const monthlySalary = parseInt(document.getElementById("newEmployeeMonthlySalary").value);

  const employee = {
    id: Date.now(),
    name,
    monthlySalary
  };

  employees.push(employee);
  saveEmployeeProfiles();
  updateProfileTable();
  updateEmployeeSelect();
  employeeForm.reset();
});

// Edit employee profile
editEmployeeForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const name = document.getElementById("editEmployeeName").value;
  const monthlySalary = parseInt(document.getElementById("editEmployeeMonthlySalary").value);

  const employee = employees.find(emp => emp.id === currentEditingEmployeeId);
  if (employee) {
    employee.name = name;
    employee.monthlySalary = monthlySalary;
    saveEmployeeProfiles();
    updateProfileTable();
    updateEmployeeSelect();
    closeEditForm();
  }
});

// Record salary for selected employee
salaryForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const employeeId = parseInt(document.getElementById("employeeSelect").value);
  const salaryMonth = document.getElementById("salaryMonth").value;
  const daysWorked = parseInt(document.getElementById("daysWorked").value);
  const overtimeHours = parseInt(document.getElementById("overtimeHours").value);

  const employee = employees.find(emp => emp.id === employeeId);
  if (!employee) {
    alert("Please select a valid employee");
    return;
  }

  if (!salaryMonth) {
    alert("Please select a month");
    return;
  }

  const salary = (employee.monthlySalary / 30) * (daysWorked + (overtimeHours / 8));

  // Convert month string (YYYY-MM) to date at the end of that month
  const [year, month] = salaryMonth.split('-');
  const lastDayOfMonth = new Date(year, month, 0);
  
  const salaryRecord = {
    id: Date.now(),
    employeeId,
    name: employee.name,
    monthlySalary: employee.monthlySalary,
    daysWorked,
    overtimeHours,
    salary,
    month: salaryMonth,
    date: lastDayOfMonth.toISOString()
  };

  salaryRecords.push(salaryRecord);
  totalPaid += salary;

  saveSalaryRecords();
  updateSalaryTable();
  updateMonthlySummary();
  updateDashboard();
  salaryForm.reset();
});

function deleteEmployeeProfile(id) {
  const index = employees.findIndex(emp => emp.id === id);
  if (index !== -1) {
    employees.splice(index, 1);
    saveEmployeeProfiles();
    updateProfileTable();
    updateEmployeeSelect();
  }
}

function openEditForm(id) {
  const employee = employees.find(emp => emp.id === id);
  if (employee) {
    currentEditingEmployeeId = id;
    document.getElementById("editEmployeeName").value = employee.name;
    document.getElementById("editEmployeeMonthlySalary").value = employee.monthlySalary;
    editEmployeeModal.style.display = "block";
  }
}

function closeEditForm() {
  editEmployeeModal.style.display = "none";
  currentEditingEmployeeId = null;
}

function deleteSalaryRecord(id) {
  const index = salaryRecords.findIndex(record => record.id === id);
  if (index !== -1) {
    totalPaid -= salaryRecords[index].salary;
    salaryRecords.splice(index, 1);
    saveSalaryRecords();
    updateSalaryTable();
    updateMonthlySummary();
    updateDashboard();
  }
}

function updateProfileTable() {
  employeeProfileTableBody.innerHTML = "";
  employees.forEach(emp => {
    const row = `<tr>
      <td>${emp.name}</td>
      <td>$${emp.monthlySalary}</td>
      <td>
        <button onclick="openEditForm(${emp.id})">Edit</button>
        <button onclick="deleteEmployeeProfile(${emp.id})" class="delete-btn">Delete</button>
      </td>
    </tr>`;
    employeeProfileTableBody.innerHTML += row;
  });
}

function updateSalaryTable() {
  employeeTableBody.innerHTML = "";
  salaryRecords.forEach(record => {
    const row = `<tr>
      <td>${record.name}</td>
      <td>$${record.monthlySalary}</td>
      <td>${record.daysWorked}</td>
      <td>${record.overtimeHours}</td>
      <td>$${record.salary.toFixed(2)}</td>
      <td>${new Date(record.date).toLocaleDateString()}</td>
      <td><button onclick="deleteSalaryRecord(${record.id})" class="delete-btn">Delete</button></td>
    </tr>`;
    employeeTableBody.innerHTML += row;
  });

  totalSalaryEl.innerText = `Total Salary Paid: $${totalPaid.toFixed(2)}`;
}

function updateEmployeeSelect() {
  employeeSelect.innerHTML = '<option value="">Select an Employee</option>';
  employees.forEach(emp => {
    const option = document.createElement("option");
    option.value = emp.id;
    option.textContent = `${emp.name} ($${emp.monthlySalary}/month)`;
    employeeSelect.appendChild(option);
  });
}

function saveEmployeeProfiles() {
  localStorage.setItem("employeeProfiles", JSON.stringify(employees));
}

function saveSalaryRecords() {
  localStorage.setItem("salaryRecords", JSON.stringify(salaryRecords));
}

function updateMonthlySummary() {
  monthlySummaryTableBody.innerHTML = "";
  
  const recordsToShow = filteredRecords.length > 0 ? filteredRecords : salaryRecords;
  
  recordsToShow.forEach(record => {
    const row = `<tr>
      <td>${record.name}</td>
      <td>$${record.monthlySalary}</td>
      <td>${record.daysWorked}</td>
      <td>${record.overtimeHours}</td>
      <td>$${record.salary.toFixed(2)}</td>
      <td>${new Date(record.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</td>
    </tr>`;
    monthlySummaryTableBody.innerHTML += row;
  });

  const total = recordsToShow.reduce((acc, record) => acc + record.salary, 0);
  monthlyTotalEl.innerText = `Monthly Total: $${total.toFixed(2)}`;
}

function filterByMonth() {
  const selectedMonth = monthFilter.value;
  if (!selectedMonth) {
    filteredRecords = salaryRecords;
    updateMonthlySummary();
    return;
  }

  filteredRecords = salaryRecords.filter(record => record.month === selectedMonth);

  updateMonthlySummary();
}

function resetMonthFilter() {
  monthFilter.value = "";
  filteredRecords = salaryRecords;
  updateMonthlySummary();
}

function updateDashboard() {
  // Update stats
  document.getElementById("totalEmployees").textContent = employees.length;
  document.getElementById("totalPaidAllTime").textContent = `$${totalPaid.toFixed(2)}`;
  document.getElementById("totalRecords").textContent = salaryRecords.length;

  // Current month total
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentMonthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const currentMonthRecords = salaryRecords.filter(record => record.month === currentMonthKey);
  const currentMonthTotal = currentMonthRecords.reduce((acc, record) => acc + record.salary, 0);
  document.getElementById("currentMonthTotal").textContent = `$${currentMonthTotal.toFixed(2)}`;

  // Update charts
  updateChartsData();
}

function updateChartsData() {
  // Monthly spending trend
  const monthlyData = {};
  salaryRecords.forEach(record => {
    const monthKey = record.month || new Date(record.date).toISOString().split('T')[0].substring(0, 7);
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + record.salary;
  });

  const sortedMonths = Object.keys(monthlyData).sort();
  const monthLabels = sortedMonths.map(m => {
    const [year, month] = m.split('-');
    return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  });
  const monthValues = sortedMonths.map(m => monthlyData[m]);

  if (monthlyChart) monthlyChart.destroy();
  const ctx1 = document.getElementById("monthlyChart");
  if (ctx1) {
    monthlyChart = new Chart(ctx1, {
      type: 'line',
      data: {
        labels: monthLabels,
        datasets: [{
          label: 'Total Salary Paid',
          data: monthValues,
          borderColor: '#28a745',
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }

  // Top earners this month
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentMonthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const currentMonthRecords = salaryRecords.filter(record => record.month === currentMonthKey);

  const employeeEarnings = {};
  currentMonthRecords.forEach(record => {
    employeeEarnings[record.name] = (employeeEarnings[record.name] || 0) + record.salary;
  });

  const topEarners = Object.entries(employeeEarnings)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (topEarnersChart) topEarnersChart.destroy();
  const ctx2 = document.getElementById("topEarnersChart");
  if (ctx2) {
    topEarnersChart = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: topEarners.map(e => e[0]),
        datasets: [{
          label: 'Amount Paid',
          data: topEarners.map(e => e[1]),
          backgroundColor: '#007bff'
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }
}

function exportToCSV() {
  const records = filteredRecords.length > 0 ? filteredRecords : salaryRecords;
  if (records.length === 0) {
    alert("No records to export");
    return;
  }

  let csv = "Name,Monthly Salary,Days Worked,Overtime Hours,Salary Paid,Date\n";
  records.forEach(record => {
    const date = new Date(record.date).toLocaleDateString();
    csv += `"${record.name}",${record.monthlySalary},${record.daysWorked},${record.overtimeHours},${record.salary.toFixed(2)},"${date}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `salary_records_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

function printRecords() {
  const records = filteredRecords.length > 0 ? filteredRecords : salaryRecords;
  if (records.length === 0) {
    alert("No records to print");
    return;
  }

  let html = "<h2>Salary Records</h2><table border='1' cellpadding='10' style='border-collapse: collapse; width: 100%;'>";
  html += "<tr><th>Name</th><th>Monthly Salary</th><th>Days Worked</th><th>Overtime Hours</th><th>Salary Paid</th><th>Date</th></tr>";
  
  records.forEach(record => {
    const date = new Date(record.date).toLocaleDateString();
    html += `<tr><td>${record.name}</td><td>$${record.monthlySalary}</td><td>${record.daysWorked}</td><td>${record.overtimeHours}</td><td>$${record.salary.toFixed(2)}</td><td>${date}</td></tr>`;
  });
  
  html += "</table>";

  const printWindow = window.open('', '', 'height=400,width=800');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
}

function archiveMonth() {
  if (filteredRecords.length === 0) {
    alert("No records to archive. Select a month first.");
    return;
  }

  const monthKey = monthFilter.value;
  if (!monthKey) {
    alert("Please select a month to archive");
    return;
  }

  const existingArchive = archives.find(a => a.monthKey === monthKey);
  if (existingArchive) {
    if (!confirm("This month is already archived. Overwrite?")) return;
    archives = archives.filter(a => a.monthKey !== monthKey);
  }

  const [year, month] = monthKey.split('-');
  const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  archives.push({
    monthKey: monthKey,
    monthName: monthName,
    records: [...filteredRecords],
    total: filteredRecords.reduce((acc, r) => acc + r.salary, 0),
    timestamp: new Date().toISOString()
  });

  localStorage.setItem("payrollArchives", JSON.stringify(archives));
  alert("Month archived successfully!");
}

function showArchives() {
  const archivesList = document.getElementById("archivesList");
  if (archives.length === 0) {
    archivesList.innerHTML = "<p>No archives yet</p>";
  } else {
    archivesList.innerHTML = archives.map(archive => `
      <div class="archive-item">
        <h3>${archive.monthName}</h3>
        <p>Total Paid: <strong>$${archive.total.toFixed(2)}</strong></p>
        <p>Records: ${archive.records.length}</p>
        <button onclick="viewArchive('${archive.monthKey}')" class="btn-secondary">View Details</button>
        <button onclick="deleteArchive('${archive.monthKey}')" class="btn-secondary" style="background-color: #dc3545;">Delete</button>
      </div>
    `).join('');
  }
  archivesModal.style.display = "block";
}

function closeArchives() {
  archivesModal.style.display = "none";
}

function viewArchive(monthKey) {
  const archive = archives.find(a => a.monthKey === monthKey);
  if (!archive) return;

  let details = `<h4>${archive.monthName} - Detailed Records</h4>`;
  details += "<table border='1' cellpadding='8' style='border-collapse: collapse; width: 100%;'>";
  details += "<tr><th>Employee</th><th>Monthly Salary</th><th>Days Worked</th><th>Overtime</th><th>Paid</th><th>Date</th></tr>";
  
  archive.records.forEach(record => {
    details += `<tr><td>${record.name}</td><td>$${record.monthlySalary}</td><td>${record.daysWorked}</td><td>${record.overtimeHours}</td><td>$${record.salary.toFixed(2)}</td><td>${new Date(record.date).toLocaleDateString()}</td></tr>`;
  });
  
  details += `</table><p style="margin-top: 15px;"><strong>Total: $${archive.total.toFixed(2)}</strong></p>`;

  const printWindow = window.open('', '', 'height=500,width=900');
  printWindow.document.write(details);
  printWindow.document.close();
  printWindow.print();
}

function deleteArchive(monthKey) {
  if (confirm("Delete this archive?")) {
    archives = archives.filter(a => a.monthKey !== monthKey);
    localStorage.setItem("payrollArchives", JSON.stringify(archives));
    showArchives();
  }
}

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    // Hide all sections that need toggling
    const dashboard = document.getElementById("dashboard");
    const employeeProfiles = document.getElementById("employeeProfilesSection");
    
    if (dashboard) dashboard.classList.remove("active");
    if (employeeProfiles) employeeProfiles.classList.remove("active");
    
    // Show the clicked section
    section.classList.add("active");
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

window.deleteEmployeeProfile = deleteEmployeeProfile;
window.deleteSalaryRecord = deleteSalaryRecord;
window.openEditForm = openEditForm;
window.closeEditForm = closeEditForm;
window.filterByMonth = filterByMonth;
window.resetMonthFilter = resetMonthFilter;
window.exportToCSV = exportToCSV;
window.printRecords = printRecords;
window.archiveMonth = archiveMonth;
window.showArchives = showArchives;
window.closeArchives = closeArchives;
window.viewArchive = viewArchive;
window.deleteArchive = deleteArchive;
window.scrollToSection = scrollToSection;
