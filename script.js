const URL_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSFcZvN6VTdHBllZMjxGmxM4oWkWpvZiIctRl5xw5FWcb0Qr5zJiAP8Sw271z5k3j9EhFKR0SB26OKw/pub?gid=0&single=true&output=csv";
    const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbytvKMP56xGXHfS3qCRLhbd6SxjOQXgTFDGTu5eqwFgYPXARM3X3Ws8PHMDl0i4mxCr/exec"; // 👉 reemplazá con tu URL de Apps Script

    const contenedor = document.getElementById("productos");
    const totalEl = document.getElementById("total");
    const btnWhatsapp = document.getElementById("btnWhatsapp");

    let productos = [];
    let total = 0;

    // Leer los productos desde Google Sheets (CSV)
    fetch(URL_CSV)
  .then(res => res.text())
  .then(csv => {
    const filas = csv.trim().split("\n").slice(1);
    productos = filas.map(f => {
      const celdas = f.split(",");
      const nombre = celdas[0].trim();
      const precio = parseFloat(celdas[1]);
      const stock = parseInt(celdas[2]);
      return { nombre, precio, stock };
    });
    mostrarProductos();
  });

    function mostrarProductos() {
      contenedor.innerHTML = "";
      productos.forEach((p, i) => {
        const div = document.createElement("div");
        div.classList.add("producto");
        div.innerHTML = `
          <input type="checkbox" id="prod${i}">
          <label for="prod${i}">${p.nombre} - $${p.precio.toLocaleString("es-AR")} (Stock: ${p.stock})</label>
          <input type="number" id="cant${i}" value="1" min="1" max="${p.stock}" disabled>
        `;
        contenedor.appendChild(div);

        const checkbox = div.querySelector(`#prod${i}`);
        const cantidad = div.querySelector(`#cant${i}`);

        checkbox.addEventListener("change", () => {
          cantidad.disabled = !checkbox.checked;
          calcularTotal();
        });

        cantidad.addEventListener("input", () => {
          if (parseInt(cantidad.value) > p.stock) cantidad.value = p.stock;
          calcularTotal();
        });
      });
    }

    function calcularTotal() {
      total = 0;
      productos.forEach((p, i) => {
        const checkbox = document.getElementById(`prod${i}`);
        const cantidad = document.getElementById(`cant${i}`);
        if (checkbox.checked) {
          total += p.precio * parseInt(cantidad.value || 1);
        }
      });
      totalEl.textContent = `Total: $${total.toLocaleString("es-AR")}`;
    }

    // Actualizar stock en Google Sheets
   function descontarStock(nombre, cantidad) {
  fetch(URL_SCRIPT, {
    method: "POST",
    body: JSON.stringify({ nombre: nombre, cantidad: Number(cantidad) })
  })
  .then(res => res.json()) // Ahora Apps Script devuelve JSON válido
  .then(data => {
    console.log("Respuesta del servidor:", data);
    if (data.status === "ok") {
      // Mostramos alerta con el stock actualizado
      alert(`✅ Stock actualizado para ${nombre}. Nuevo stock: ${data.nuevoStock}`);
      
      // Opcional: actualizar visualmente el input de cantidad máximo en la página
      const inputCantidad = document.querySelector(`#cant${getIndexProducto(nombre)}`);
      if (inputCantidad) {
        inputCantidad.max = data.nuevoStock;
        if (Number(inputCantidad.value) > data.nuevoStock) {
          inputCantidad.value = data.nuevoStock;
        }
      }
    } else {
      alert(`❌ Error al actualizar stock: ${data.message}`);
    }
  })
  .catch(err => {
    console.error("Error al actualizar stock:", err);
    alert("❌ No se pudo actualizar el stock. Revisa la consola.");
  });
}

// Función auxiliar para obtener el índice del producto según su nombre
function getIndexProducto(nombre) {
  for (let i = 0; i < productos.length; i++) {
    if (productos[i].nombre.trim().toLowerCase() === nombre.trim().toLowerCase()) {
      return i;
    }
  }
  return -1;
}



    // Enviar por WhatsApp
    btnWhatsapp.addEventListener("click", () => {
      let mensaje = "📋 *Pedido Despensa Tentación*%0A%0A";
      productos.forEach((p, i) => {
        const checkbox = document.getElementById(`prod${i}`);
        const cantidad = document.getElementById(`cant${i}`);
        if (checkbox.checked) {
          mensaje += `- ${cantidad.value} x ${p.nombre}: $${p.precio * cantidad.value}%0A`;
          descontarStock(p.nombre, parseInt(cantidad.value)); // 👈 actualiza el stock
        }
      });

      mensaje += `%0A*Total:* $${total.toLocaleString("es-AR")}`;
      const url = `https://wa.me/?text=${mensaje}`;
      window.open(url, "_blank");
    });
    
