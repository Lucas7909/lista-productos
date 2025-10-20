// Lista de productos
const productos = [
  { nombre: "Lata de tomate", precio: 1000 },
  { nombre: "Fideos largos", precio: 1500 },
  { nombre: "Harina", precio: 1300 },
  { nombre: "Detergente", precio: 1800 },
  { nombre: "Arroz integral", precio: 1700 },
];

const contenedor = document.getElementById("productos");
const totalEl = document.getElementById("total");
const btnWhatsapp = document.getElementById("btnWhatsapp");

let total = 0;

// Crear los elementos
productos.forEach((p, i) => {
  const div = document.createElement("div");
  div.classList.add("producto");
  div.innerHTML = `
    <input type="checkbox" id="prod${i}">
    <label for="prod${i}">${p.nombre} - $${p.precio}</label>
    <input type="number" id="cant${i}" value="1" min="1" disabled>
  `;
  contenedor.appendChild(div);

  const checkbox = div.querySelector(`#prod${i}`);
  const cantidad = div.querySelector(`#cant${i}`);

  checkbox.addEventListener("change", () => {
    cantidad.disabled = !checkbox.checked;
    calcularTotal();
  });

  cantidad.addEventListener("input", calcularTotal);
});

function calcularTotal() {
  total = 0;
  productos.forEach((p, i) => {
    const checkbox = document.getElementById(`prod${i}`);
    const cantidad = document.getElementById(`cant${i}`);
    if (checkbox.checked) {
      total += p.precio * parseInt(cantidad.value || 1);
    }
  });
  totalEl.textContent = total.toLocaleString("es-AR");
}

btnWhatsapp.addEventListener("click", () => {
  let mensaje = "📋 *Pedido Despensa Tentación*%0A%0A";
  productos.forEach((p, i) => {
    const checkbox = document.getElementById(`prod${i}`);
    const cantidad = document.getElementById(`cant${i}`);
    if (checkbox.checked) {
      mensaje += `- ${cantidad.value} x ${p.nombre}: $${p.precio * cantidad.value}%0A`;
    }
  });
  mensaje += `%0A*Total:* $${total.toLocaleString("es-AR")}`;
  const url = `https://wa.me/?text=${mensaje}`;
  window.open(url, "_blank");
});
