function showMessage(message, type = "success") {
    let box = document.getElementById("messageBox");

    if (!box) return;

    box.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
}
// ================= COMMON FUNCTIONS =================
function setError(input) {
    input.classList.remove("input-success");
    input.classList.add("input-error");
}
function setSuccess(input) {
    input.classList.remove("input-error");
    input.classList.add("input-success");
}

// ================= REGISTER =================
function validateRegister() {

    let name = document.getElementById("name");
    let email = document.getElementById("email");
    let password = document.getElementById("password");
    let confirmPassword = document.getElementById("confirmPassword");

    let emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    let isValid = true;

    if (name.value.trim() === "") {
        setError(name);
        isValid = false;
    } else setSuccess(name);

    if (!email.value.match(emailPattern)) {
        setError(email);
        isValid = false;
    } else setSuccess(email);

    if (password.value.length < 6) {
        setError(password);
        isValid = false;
    } else setSuccess(password);

    if (password.value !== confirmPassword.value || confirmPassword.value === "") {
        setError(confirmPassword);
        isValid = false;
    } else setSuccess(confirmPassword);

    if (!isValid) {
        showMessage("Please fix errors before submitting", "danger");
        return false;
    }

    alert("Registration Successful!");
    window.location.href = "login.html";
    return false;
}

// ================= LOGIN =================
function validateLogin() {

    let email = document.getElementById("loginEmail");
    let password = document.getElementById("loginPassword");

    let emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    let isValid = true;

    if (!email.value.match(emailPattern)) {
        setError(email);
        isValid = false;
    } else setSuccess(email);

    if (password.value === "") {
        setError(password);
        isValid = false;
    } else setSuccess(password);

    if (!isValid) {
       showMessage("Invalid login details", "danger");
        return false;
    }

    showMessage("Login Successful!", "success");

setTimeout(() => {
    window.location.href = "catalog.html";
}, 1500);

return false;
}

// ================= CART VALIDATION =================
function validateCart() {

    let payment = document.querySelector('input[name="payment"]:checked');

    if (!payment) {
        showMessage("Select payment method", "danger");
        return false;
    }

    showMessage("Order placed successfully!", "success");

    // clear cart
    localStorage.removeItem("cart");

    // redirect
    window.location.href = "catalog.html";

    return false;
}

// ================= REAL-TIME VALIDATION =================
document.addEventListener("DOMContentLoaded", function () {

    let inputs = document.querySelectorAll(
        "input[type='text'], input[type='email'], input[type='password']"
    );

    inputs.forEach(input => {
        input.addEventListener("input", function () {

            if (input.type === "email") {
                let pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
                input.value.match(pattern) ? setSuccess(input) : setError(input);
            }

            else if (input.type === "password") {
                input.value.length >= 6 ? setSuccess(input) : setError(input);
            }

            else {
                input.value.trim() !== "" ? setSuccess(input) : setError(input);
            }

        });
    });

});

// ================= CART LOGIC =================

// Add first item
function addFirstItem(id, name, price) {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    let existing = cart.find(item => item.name === name);

    if (!existing) {
        cart.push({ id, name, price, qty: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    renderControls(id, name, price);
}

// Render + - and input
function renderControls(id, name, price) {

    let container = document.getElementById("controls-" + id);

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let item = cart.find(i => i.name === name);

    let qty = item ? item.qty : 1;

    container.innerHTML = `
        <div class="d-flex justify-content-center align-items-center gap-2">

            <button class="btn btn-sm btn-danger"
                onclick="changeQty('${id}','${name}', ${price}, -1)">-</button>

            <input type="number" min="1" value="${qty}"
                id="qty-${id}"
                class="form-control text-center"
                style="width:70px;"
                onchange="updateQty('${id}','${name}', ${price})">

            <button class="btn btn-sm btn-success"
                onclick="changeQty('${id}','${name}', ${price}, 1)">+</button>

        </div>
    `;
}

// Change quantity
function changeQty(id, name, price, change) {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    let item = cart.find(i => i.name === name);

    if (item) {
        item.qty += change;

        if (item.qty <= 0) {
            cart = cart.filter(i => i.name !== name);

            document.getElementById("controls-" + id).innerHTML = `
                <button class="btn btn-primary w-100"
                    onclick="addFirstItem('${id}','${name}', ${price})">
                    Add to Cart
                </button>
            `;
        }
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    if (item && item.qty > 0) {
        document.getElementById("qty-" + id).value = item.qty;
    }
}

// Manual input quantity
function updateQty(id, name, price) {

    let input = document.getElementById("qty-" + id);
    let newQty = parseInt(input.value);

    if (isNaN(newQty) || newQty <= 0) {
        showMessage("Invalid quantity", "danger");
        return;
    }

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let item = cart.find(i => i.name === name);

    if (item) {
        item.qty = newQty;
    }

    localStorage.setItem("cart", JSON.stringify(cart));
}

// Load catalog state
function loadCatalogState() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart.forEach(item => {
        renderControls(item.id, item.name, item.price);
    });
}
// ================= CART PAGE =================
function loadCart() {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let table = document.getElementById("cartItems");

    if (!table) return;

    table.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        let row = `
            <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>Rs.${item.price}</td>
                <td>Rs.${item.qty * item.price}</td>
                <td>
                    <button onclick="removeItem('${item.name}')"
                        class="btn btn-sm btn-danger">Remove</button>
                </td>
            </tr>
        `;
        table.innerHTML += row;
        total += item.qty * item.price;
    });

    document.getElementById("billTotal").innerText = total;
}
// Remove item
function removeItem(name) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    let item = cart.find(i => i.name === name);

    if (item) {
        item.qty -= 1;

        // If quantity becomes 0 → remove item completely
        if (item.qty <= 0) {
            cart = cart.filter(i => i.name !== name);
        }
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    showMessage(name + " removed from cart", "warning");

    loadCart();
}
function loadBill() {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let table = document.getElementById("billItems");

    if (!table) return;

    table.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        let row = `
            <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>Rs.${item.qty * item.price}</td>
            </tr>
        `;
        table.innerHTML += row;
        total += item.qty * item.price;
    });

    document.getElementById("totalAmount").innerText = total;
}
