import { BASE_URL } from "./utils.mjs";
let token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", async function () {
  const tripsContainer = document.getElementById("tripsContainer");
  const logout = document.getElementById("logout");
  console.log("token:", token);
  if (!token) {
    alert("Please login first.");
    window.location.href = "../pages/signin.html";
    return;
  }

  try {
    let response = await fetch("http://localhost:3000/trips/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    let data = await response.json();
    console.log(data);
    if (data.trips) {
      if (data.trips.length === 0) {
        tripsContainer.innerHTML = `<p>No trips found. Start by creating one!</p>`;
      } else {
        data.trips.forEach((trip) => {
          const tripCard = document.createElement("div");
          tripCard.className = "trip-card";
          let startDate = new Date(trip.startDate);
          startDate = startDate.toLocaleDateString();
          let endDate = new Date(trip.endDate);
          endDate = endDate.toLocaleDateString();
          tripCard.innerHTML = `
                      <h3>${trip.tripName}</h3>
                      <p><strong>Destination:</strong> ${trip.destination}</p>
                      <p><strong>Budget:</strong> ₹${trip.totalBudget}</p>
                      <p><strong>Dates:</strong> ${startDate} → ${endDate}</p>
                    `;
          const buttonsDiv = document.createElement("div");
          buttonsDiv.className = "trip-card-buttons-div";

          const deleteButton = document.createElement("button");
          deleteButton.textContent = "Delete";
          deleteButton.addEventListener("click", () => deleteTrip(trip._id));

          const viewButton = document.createElement("button");
          viewButton.textContent = "View Details";
          viewButton.addEventListener("click", () => viewDetails(trip._id));

          buttonsDiv.appendChild(viewButton);
          buttonsDiv.appendChild(deleteButton);

          tripCard.appendChild(buttonsDiv);

          tripsContainer.appendChild(tripCard);
        });
      }
    } else if (data.errorMessage === "Invalid or expired token") {
      alert("session has expired, please login in");
      window.location.href = "../pages/signin.html";
    } else {
      alert(data.errorMessage || data.message || "undefined error");
    }
  } catch (error) {
    console.error(error);
    //tripsContainer.innerHTML = `<p>Something went wrong. Please try again later.</p>`;
  }
});

logout.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "../pages/index.html";
});

function deleteTrip(id) {
  console.log("button clicked id:", id);
  fetch(`http://localhost:3000/trips/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      alert("Trip deleted succesfully");
      location.reload();
    })
    .catch((err) => {
      console.log("error occured during delete the trip:", err);
    });
}
function viewDetails(id) {
  window.location.href = `../pages/tripDetail.html?id=${id}`;
  /*
  try {
    let response = await fetch(`${BASE_URL}/expenses/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    let data = await response.json();
    console.log(data);
  } catch (error) {
    console.log("error:", error);
  }
    */
}
