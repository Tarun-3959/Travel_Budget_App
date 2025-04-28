import { BASE_URL } from "./utils.mjs";
console.log("connected");
const createTripForm = document.getElementById("createTripForm");
const addCategoryForm = document.getElementById("addCategoryForm");

const addCategoryBtn = document.getElementById("addCategoryBtn");
const categoriesSection = document.getElementById("categoriesSection");
const token = localStorage.getItem("token");

let categoryCount = 0;
let tripData = {};

addCategoryBtn.addEventListener("click", () => {
  const div = document.createElement("div");
  div.classList.add("category-div");
  div.innerHTML = `
      <input type="text" name="categoryName${categoryCount}" placeholder="Category Name (e.g., Transportation)" required>
      <input type="number" name="categoryBudget${categoryCount}" placeholder="Budget ₹" min="0" required>
      <button type="button" class="removeCategoryBtn">Remove</button>
    `;

  div.querySelector(".removeCategoryBtn").addEventListener("click", () => {
    div.remove();
  });

  categoriesSection.appendChild(div);
  categoryCount++;
});

createTripForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const tripName = document.getElementById("tripName").value.trim();
  const destination = document.getElementById("destination").value.trim();
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  tripData = {
    tripName,
    destination,
    startDate,
    endDate,
  };
  console.log(tripData);
  createTripForm.classList.add("disable");
  addCategoryForm.classList.remove("disable");
});

addCategoryForm.addEventListener("submit", async (e) => {
  console.log("i am running");
  e.preventDefault();
  const categories = [];
  let totalBudget = 0;
  document.querySelectorAll(".category-div").forEach((div) => {
    const name = div.querySelector(`input[type="text"]`).value.trim();
    const budget = parseFloat(div.querySelector(`input[type="number"]`).value);
    totalBudget += budget;
    categories.push({ name, budget });
  });
  tripData.categories = categories;
  tripData.totalBudget = totalBudget;
  try {
    const response = await fetch(`${BASE_URL}/trips/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(tripData),
    });

    const data = await response.json();
    if (data.message) {
      console.log(data);
      alert("Trip created successfully!");
      window.location.href = "./myTrip.html";
    } else {
      alert(data.errorMessage || "Failed to create trip.");
    }
  } catch (error) {
    console.error(error);
    alert("Something went wrong. Please try again.");
  }
});

document
  .getElementById("goBackBtn")
  .addEventListener("click", function goBack() {
    createTripForm.classList.remove("disable");
    addCategoryForm.classList.add("disable");
  });

document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "../pages/index.html";
});
