let form = document.querySelector("form");
let pass = document.getElementById("pass");
let cpass = document.getElementById("cpass");

function validatePassword(value) {
    let errors = [];

    if (value.length < 8) {
        errors.push("at least 8 characters");
    }
    if (!/[A-Z]/.test(value)) {
        errors.push("one uppercase letter");
    }
    if (!/[a-z]/.test(value)) {
        errors.push("one lowercase letter");
    }
    if (!/[^A-Za-z0-9]/.test(value)) {
        errors.push("one special character");
    }

    return errors;
}

form.addEventListener("submit", function (e) {
    let errors = validatePassword(pass.value);

    if (errors.length > 0) {
        e.preventDefault();
        alert("Password must contain " + errors.join(", ") + ".");
        return;
    }

    if (pass.value !== cpass.value) {
        e.preventDefault();
        alert("Passwords do not match.");
        return;
    }

    console.log("Password matched");
});
