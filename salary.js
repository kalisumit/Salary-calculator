  const employeeTableBody = document.getElementById("employeeTableBody");
  const totalSalaryEl = document.getElementById("totalSalary");
  const salaryForm = document.getElementById("salaryForm");

  let employees = JSON.parse(localStorage.getItem("employees")) || [];
  let totalPaid = employees.reduce((acc, emp) => acc + emp.salary, 0);

  updateTable();

  salaryForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const daysWorked = parseInt(document.getElementById("daysWorked").value);
    const overtimeHours = parseInt(document.getElementById("overtimeHours").value);
    const dailyRate = parseFloat(document.getElementById("dailyRate").value);
    const salary = (dailyRate / 30) * (daysWorked + (overtimeHours/8));

    const employee = {
      id: Date.now(), 
      name,
      daysWorked,
      overtimeHours,
      salary
    };

    employees.push(employee);
    totalPaid += salary;

    saveToLocalStorage();
    updateTable();
    salaryForm.reset();
  });

  function deleteEmployee(id) {
    const index = employees.findIndex(emp => emp.id === id);
    if (index !== -1) {
      totalPaid -= employees[index].salary;
      employees.splice(index, 1);
      saveToLocalStorage();
      updateTable();
    }
  }

  function updateTable() {
    employeeTableBody.innerHTML = "";
    employees.forEach(emp => {
      const row = `<tr>
        <td>${emp.name}</td>
        <td>${emp.daysWorked}</td>
        <td>${emp.overtimeHours}</td>
        <td>$${emp.salary.toFixed(2)}</td>
        <td><button onclick="deleteEmployee(${emp.id})">Delete</button></td>
      </tr>`;
      employeeTableBody.innerHTML += row;
    });

    totalSalaryEl.innerText = `Total Salary Paid: $${totalPaid.toFixed(2)}`;
  }

  function saveToLocalStorage() {
    localStorage.setItem("employees", JSON.stringify(employees));
  }
  window.deleteEmployee = deleteEmployee;

