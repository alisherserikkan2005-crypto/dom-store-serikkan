// Lab 5: DOM, events, forms. Pure JavaScript, no frameworks.

const store = new Store();
[
  { name: "Bread", price: 150, qty: 2 },
  { name: "Milk", price: 420, qty: 1 },
  { name: "Eggs", price: 900, qty: 1 },
].forEach((item) => store.add(item));

const form = document.getElementById("add-form");
const list = document.getElementById("product-list");
const totalEl = document.getElementById("total");
const inputs = {
  name: document.getElementById("name"),
  price: document.getElementById("price"),
  qty: document.getElementById("qty"),
};
const errorEls = {
  name: document.getElementById("name-error"),
  price: document.getElementById("price-error"),
  qty: document.getElementById("qty-error"),
};

const formatMoney = (n) => `${n.toLocaleString("ru-RU")} ₸`;

/** Small helper: create an element with text and attributes. */
function el(tag, text = "", attrs = {}) {
  const node = document.createElement(tag);
  node.textContent = text; // textContent, not innerHTML: safe against injected HTML
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
}

function actionButton(label, action, extra = {}) {
  return el("button", label, { type: "button", "data-action": action, ...extra });
}

/** Draw the whole list from the Store and recalculate the total. */
function render() {
  list.replaceChildren();
  const items = store.list();

  if (items.length === 0) {
    const row = el("tr");
    const cell = el("td", "No products yet", { colspan: "5", class: "empty" });
    row.append(cell);
    list.append(row);
  }

  items.forEach(({ name, price, qty }) => {
    const row = el("tr", "", { "data-name": name });
    const qtyCell = el("td", "", { class: "qty-cell" });
    qtyCell.append(
      actionButton("−", "dec", { "aria-label": `Decrease ${name}`, ...(qty <= 1 ? { disabled: "" } : {}) }),
      el("span", String(qty)),
      actionButton("+", "inc", { "aria-label": `Increase ${name}` })
    );
    const removeCell = el("td");
    removeCell.append(actionButton("Delete", "remove", { "aria-label": `Delete ${name}`, class: "danger" }));

    row.append(el("td", name), el("td", formatMoney(price)), qtyCell, el("td", formatMoney(price * qty)), removeCell);
    list.append(row);
  });

  totalEl.textContent = formatMoney(store.total());
}

/* ---------- validation: errors are shown in the DOM, never alert() ---------- */

function validate({ name, price, qty }) {
  const errors = {};
  if (name.trim() === "") {
    errors.name = "Name is required";
  } else if (store.find(name.trim())) {
    errors.name = "This product already exists";
  }
  const priceNumber = Number(price.replace(",", "."));
  if (price.trim() === "" || !Number.isFinite(priceNumber)) {
    errors.price = "Price must be a number";
  } else if (priceNumber <= 0) {
    errors.price = "Price must be greater than 0";
  }
  const qtyNumber = Number(qty);
  if (qty.trim() === "" || !Number.isInteger(qtyNumber)) {
    errors.qty = "Qty must be a whole number";
  } else if (qtyNumber < 1) {
    errors.qty = "Qty must be at least 1";
  }
  return errors;
}

function showErrors(errors) {
  Object.keys(inputs).forEach((field) => {
    const message = errors[field] ?? "";
    errorEls[field].textContent = message;
    inputs[field].classList.toggle("invalid", message !== "");
    inputs[field].setAttribute("aria-invalid", message !== "" ? "true" : "false");
  });
}

/* ---------- events ---------- */

// 1) Add: submit event on the form.
form.addEventListener("submit", (event) => {
  event.preventDefault(); // stop the page reload
  const values = {
    name: inputs.name.value,
    price: inputs.price.value,
    qty: inputs.qty.value,
  };
  const errors = validate(values);
  showErrors(errors);
  if (Object.keys(errors).length > 0) {
    inputs[Object.keys(errors)[0]].focus();
    return;
  }
  store.add({
    name: values.name.trim(),
    price: Number(values.price.replace(",", ".")),
    qty: Number(values.qty),
  });
  form.reset();
  inputs.name.focus();
  render();
});

// 2) Remove / update: ONE click listener on the list (event delegation).
list.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return; // click was not on an action button
  const row = button.closest("tr[data-name]");
  const name = row.dataset.name;
  const item = store.find(name);

  switch (button.dataset.action) {
    case "remove":
      store.remove(name);
      break;
    case "inc":
      store.update(name, { qty: item.qty + 1 });
      break;
    case "dec":
      store.update(name, { qty: Math.max(1, item.qty - 1) });
      break;
  }
  render();
});

// 3) Hide an error as soon as the user starts fixing the field.
form.addEventListener("input", (event) => {
  const field = event.target.id;
  if (errorEls[field]) {
    errorEls[field].textContent = "";
    event.target.classList.remove("invalid");
    event.target.setAttribute("aria-invalid", "false");
  }
});

render();
