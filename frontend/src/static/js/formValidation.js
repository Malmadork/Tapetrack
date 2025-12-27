export default function validateRegistrationForm() {
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("verify-password");

    confirmPassword.setCustomValidity("");

    password.addEventListener("input", () => {
        confirmPassword.setCustomValidity("");
    });

    confirmPassword.addEventListener("input", () => {
        confirmPassword.setCustomValidity("");
    });

    // Check passwords match
    if (password.value !== confirmPassword.value) {
        confirmPassword.setCustomValidity("Passwords must match.");
    }

    return confirmPassword.checkValidity();
}
