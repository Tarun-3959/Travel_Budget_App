import { BASE_URL } from "./utils.mjs";
let tripId = null;
const tripDetailsDiv = document.getElementById("tripDetails");
const expensesListDiv = document.getElementById("expensesList");
const addExpensesBtn = document.getElementById("addExpensesBtn");
const addNewCategoryForm = document.getElementById("addNewCategoryForm");
const addNewExpenseForm = document.getElementById("addNewExpenseForm");
const categoryOptions = document.getElementById("category");
const categoryWiseExpensesBtn = document.getElementById(
  "categoryWiseExpensesBtn"
);
const budgetVsSpentsBtn = document.getElementById("budgetVsSpentsBtn");
const dayWiseExpensesBtn = document.getElementById("dayWiseExpensesBtn");

const categoryWiseDiv = document.getElementById("categoryWiseDiv");
const budgetVsSpentsDiv = document.getElementById("budgetVsSpentsDiv");
const dayWiseDiv = document.getElementById("dayWiseDiv");

const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", async () => {
  if (!token) {
    alert("Please login first.");
    window.location.href = "../pages/signin.html";
    return;
  }

  // Get tripId from URL
  const urlParams = new URLSearchParams(window.location.search);
  tripId = urlParams.get("id");
  if (!tripId) {
    alert("somenthing went wron, please try again");
    console.log("Trip ID is missing in URL.");
    return;
  }

  try {
    // Fetch trip details
    const tripRes = await fetch(`${BASE_URL}/trips/${tripId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const tripData = await tripRes.json();

    if (tripData.message) {
      tripId = tripData.trip._id;
      const trip = tripData.trip;
      console.log(trip);
      tripDetailsDiv.innerHTML = `
        <h1>${trip.tripName}</h1>
        <p><strong>Destination:</strong> ${trip.destination}</p>
        <p><strong>Start Date:</strong> ${new Date(
          trip.startDate
        ).toLocaleDateString()}</p>
        <p><strong>End Date:</strong> ${new Date(
          trip.endDate
        ).toLocaleDateString()}</p>
        <p><strong>Budget:</strong> ₹${trip.totalBudget}</p>
      `;
      addExpensesBtn.classList.remove("disable");
      categoryWiseExpensesBtn.classList.remove("disable");
      budgetVsSpentsBtn.classList.remove("disable");
      dayWiseExpensesBtn.classList.remove("disable");

      addExpensesBtn.addEventListener("click", () => {
        addExpenses(trip);
      });
      addNewExpenseForm.addEventListener("submit", (e) => {
        e.preventDefault();
        let formData = new FormData(addNewExpenseForm);
        let data = {};
        for (let [key, value] of formData.entries()) data[key] = value;
        addNewExpenseFun(data, trip._id);
      });
    } else if (tripData.errorMessage === "Trip not found.") {
      tripDetailsDiv.innerHTML = `<p>Trip not found!</p>`;
    } else {
      tripDetailsDiv.innerHTML = `<p>Failed to load trip details.</p>`;
    }
    // Fetch expenses
    const expensesRes = await fetch(`${BASE_URL}/expenses/${tripId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const expensesData = await expensesRes.json();
    console.log("expenses data:", expensesData);
    if (expensesData.message && expensesData.expenses.length > 0) {
      expensesData.expenses.forEach((expense) => {
        const expenseDiv = document.createElement("div");
        expenseDiv.classList.add("expense-item");
        expenseDiv.innerHTML = `
          <p><b>Category: </b>${expense.category}</p>
          <p><b>Amount: </b>₹${expense.amount}</p>
          <p><b>Date:</b>${new Date(expense.date).toLocaleDateString()}</p>
        `;
        expensesListDiv.appendChild(expenseDiv);
      });
    } else if (expensesData.errorMessage) {
      expensesListDiv.innerHTML = `<p>${expensesData.errorMessage}</p>`;
    } else {
      expensesListDiv.innerHTML = `<p>No expenses found. Start adding some!</p>`;
    }
  } catch (error) {
    console.error(error);
    tripDetailsDiv.innerHTML = `<p>Something went wrong. Please try again later.</p>`;
    expensesListDiv.innerHTML = `<p>Unable to load expenses.</p>`;
  }
});

categoryWiseExpensesBtn.addEventListener("click", async () => {
  try {
    const res = await fetch(
      `${BASE_URL}/analysis/category-breakdown/${tripId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    let data = await res.json();
    console.log("data:", data);
    if (data.message) {
      if (data.breakdown.length > 0) {
        categoryWiseDiv.innerHTML = "";
        data.breakdown.forEach((data) => {
          let subDiv = document.createElement("div");
          subDiv.classList.add("subDiv");
          subDiv.innerHTML = `
          <p><b>Category:</b> ${data.category}</p>
          <p><b>Total Spent:</b> ${data.totalSpent}</p>         
          `;
          categoryWiseDiv.appendChild(subDiv);
        });
      } else {
        categoryWiseDiv.innerHTML = "Insufficient Data to calculate";
      }
    } else {
      categoryWiseDiv.innerHTML =
        data.errorMessage || "Something went wrong, please try again";
    }
  } catch (error) {
    categoryWiseDiv.innerHTML = "Something went wrong, please try again";
    console.log("error:", error);
  }
});

budgetVsSpentsBtn.addEventListener("click", async () => {
  try {
    const res = await fetch(`${BASE_URL}/analysis/budget-vs-spent/${tripId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    let response = await res.json();
    console.log("response:", response);
    if (response.message) {
      if (response.data.length > 0) {
        budgetVsSpentsDiv.innerHTML = "";
        response.data.forEach((data) => {
          let subDiv = document.createElement("div");
          subDiv.classList.add("subDiv");
          subDiv.innerHTML = `
          <p><b>Category:</b> ${data.category}</p>
          <p><b>Budget:</b> ${data.budget}</p>
          <p><b>Total Spent:</b> ${data.spent || 0}</p>         
          `;
          budgetVsSpentsDiv.appendChild(subDiv);
        });
      } else {
        budgetVsSpentsDiv.innerHTML = "Insufficient Data to calculate";
      }
    } else {
      budgetVsSpentsDiv.innerHTML =
        data.errorMessage || "Something went wrong, please try again";
    }
  } catch (error) {
    categoryWiseDiv.innerHTML = "Something went wrong, please try again";
    console.log("error:", error);
  }
});

dayWiseExpensesBtn.addEventListener("click", async () => {
  try {
    const res = await fetch(`${BASE_URL}/analysis/daily-spending/${tripId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    let response = await res.json();
    console.log("response:", response);
    if (response.message) {
      if (response.data.length > 0) {
        dayWiseDiv.innerHTML = "";
        response.data.forEach((data) => {
          let subDiv = document.createElement("div");
          subDiv.classList.add("subDiv");
          subDiv.innerHTML = `
          <p><b>Date:</b> ${data.date}</p>
          <p><b>Spent:</b> ${data.spent}</p>        
          `;
          dayWiseDiv.appendChild(subDiv);
        });
      } else {
        dayWiseDiv.innerHTML = "Insufficient Data to calculate";
      }
    } else {
      dayWiseDiv.innerHTML =
        data.errorMessage || "Something went wrong, please try again";
    }
  } catch (error) {
    categoryWiseDiv.innerHTML = "Something went wrong, please try again";
    console.log("error:", error);
  }
});

function addExpenses(trip) {
  addNewExpenseForm.classList.remove("disable");
  console.log("trip:", trip);
  trip.categories.forEach((category) => {
    let option = document.createElement("option");
    option.innerText = category.name;
    option.value = category.name.toLowerCase();
    categoryOptions.appendChild(option);
  });
}

async function addNewExpenseFun(data, id) {
  try {
    let response = await fetch(`${BASE_URL}/expenses/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    let res = await response.json();
    if (res.message) {
      alert("Expense is added!");
      location.reload();
    }

    if (res.errorMessage) alert("something went wrong, please try again");
    addNewExpenseForm.classList.remove("enable");
    addNewExpenseForm.classList.add("disable");
  } catch (error) {
    alert("error occured");
  }
}

document.getElementById("addNewCategoryBtn").addEventListener("click", () => {
  addNewCategoryForm.classList.add("enable");
});
addNewCategoryForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  let formData = new FormData(addNewCategoryForm);
  let data = {};
  for (let [key, value] of formData.entries()) data[key] = value;
  console.log(data);
  let reqBody = JSON.stringify({ newCategories: [data] });
  console.log("reqbody for send:", reqBody);
  try {
    let response = await fetch(`${BASE_URL}/trips/${tripId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: reqBody,
    });
    let res = await response.json();
    if (res.message) {
      let option = document.createElement("option");
      option.innerText = data.name;
      option.value = data.name.toLowerCase();
      categoryOptions.appendChild(option);
    } else {
      alert("something went wrong, please try again");
    }
    addNewCategoryForm.classList.remove("enable");
  } catch (error) {
    console.log("error occured:", error);
    alert("something went wrong, please try again");
  }
});

document.getElementById("Logout").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "../pages/signin.html";
});
