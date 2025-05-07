function togglePasswordVisibility(element) {
    password = document.getElementById(element.getAttribute("data-target-id"));
    if (password.type === "password") {
        password.type = "text";
        element.classList.remove("bi-eye-slash");
        element.classList.add("bi-eye");
    } else {
        password.type = "password";
        element.classList.remove("bi-eye");
        element.classList.add("bi-eye-slash");
    }
}