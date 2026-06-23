// Get DOM elements
const passwordDiv = document.getElementById("password");
const calendarDiv = document.getElementById("calendar");
const passwordInput = document.getElementById("passwordInput");
const submitButton = document.getElementById("submitButton");
const errorMessage = document.getElementById("errorMessage");

// Function to handle password validation
function validatePassword() {
  const enteredPassword = passwordInput.value.trim();

  if (enteredPassword === "B3@ns") {
    // Hide password div, show calendar div
    passwordDiv.classList.add("hidden");
    calendarDiv.classList.remove("hidden");
    errorMessage.classList.add("hidden");
  } else {
    // Show error message
    errorMessage.classList.remove("hidden");
    passwordInput.value = ""; // Clear the input
    passwordInput.focus(); // Focus back on input
  }
}

// Event listeners
submitButton.addEventListener("click", validatePassword);

// Allow Enter key to submit
passwordInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    validatePassword();
  }
});
