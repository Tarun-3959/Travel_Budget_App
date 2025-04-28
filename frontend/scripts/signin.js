console.log("signin script connected");

let emailInp = document.getElementById("email");
let passwordInp = document.getElementById("password");
let submitBtn = document.getElementById("submitBtn");
let waitMsgTag = document.getElementById("waitMsgTag");
console.log(submitBtn);
document.getElementById("form").addEventListener("submit", (event) => {
  event.preventDefault();
  let email = emailInp.value?.trim();
  let password = passwordInp.value?.trim();
  console.log(email, password);
  if (!email || !password)
    return alert("please inter email and password correctly");
  submitBtn.disabled = true;
  submitBtn.classList.add("disable");
  waitMsgTag.classList.add("enable");
  try {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    };
    fetch("http://localhost:3000/auth/signin", options)
      .then((res) => res.json())
      .then((data) => {
        if (data.message == "User logged in successfully") {
          localStorage.setItem("token", data.token);
          window.location.href = "../pages/myTrip.html";
        } else {
          alert(data.errorMessage);
        }
      })
      .catch((error) => console.log("error in catch:", error))
      .finally(() => {
        submitBtn.disabled = false;
        waitMsgTag.classList.remove("enable");
        submitBtn.classList.remove("disable");
      });
  } catch (error) {
    alert("error came");
    console.log("error is:", error);
  }
});
