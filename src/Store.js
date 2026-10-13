// Store from Lab 4, extended for Lab 5: items are { name, price, qty }.
// Classic script (no export) so index.html also works by double-click.

class Store {
  #items = []; // private field

  static from(items = []) {
    const store = new this();
    items.forEach((item) => store.add(item));
    return store;
  }

  add(item) {
    if (item === null || typeof item !== "object") {
      throw new TypeError("item must be an object");
    }
    this.#items.push(item);
    return this;
  }

  remove(name) {
    const before = this.#items.length;
    this.#items = this.#items.filter((item) => item.name !== name);
    return this.#items.length < before;
  }

  find(name) {
    return this.#items.find((item) => item.name === name);
  }

  /** New in Lab 5: change fields of an item, e.g. update("Milk", { qty: 3 }). */
  update(name, patch) {
    const index = this.#items.findIndex((item) => item.name === name);
    if (index === -1) return false;
    this.#items[index] = { ...this.#items[index], ...patch };
    return true;
  }

  /** Total = sum of price * qty. */
  total() {
    return this.#items.reduce((sum, { price = 0, qty = 1 }) => sum + price * qty, 0);
  }

  get size() {
    return this.#items.length;
  }

  list() {
    return [...this.#items];
  }
}

class SortedStore extends Store {
  list() {
    return super.list().sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  }
}
