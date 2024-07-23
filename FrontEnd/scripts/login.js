const form = document.getElementById("loginForm");
const loginUrl = "http://localhost:5678/api/users/login";
const htmlError = document.getElementById("loginError");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const inputData = {
    email: email,
    password: password,
  };

  fetch(loginUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(inputData),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "../../index.html";
      } else {
        htmlError.textContent = "Les champs saisis sont incorrects.";
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la requête:", error);
    });
});
