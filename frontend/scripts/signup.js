console.log("signin script connected");

let nameInp = document.getElementById("name");
let emailInp = document.getElementById("email");
let passwordInp = document.getElementById("password");
let submitBtn = document.getElementById("submitBtn");
let waitMsgTag = document.getElementById("waitMsgTag");
console.log(submitBtn);
document.getElementById("form").addEventListener("submit", (event) => {
  event.preventDefault();
  let name = nameInp.value?.trim();
  let email = emailInp.value?.trim();
  let password = passwordInp.value?.trim();

  console.log(email, password);
  if (!email || !password || !name)
    return alert("please inter email and password and name correctly");
  submitBtn.disabled = true;
  submitBtn.classList.add("disable");
  waitMsgTag.classList.add("enable");
  try {
    const options = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    };
    fetch("http://localhost:3000/auth/signup", options)
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          console.log(data);
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
