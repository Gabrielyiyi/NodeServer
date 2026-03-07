const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.urlencoded({ extended: true }));

let pendientes = [];
let realizadas = [];

app.get("/tareas", function (req, res) {
  let paginaHtml = fs.readFileSync("public/index.html", "utf8");

  // --- SECCIÓN PENDIENTES ---
  // El formulario ahora solo tiene la acción de completar
  let textoPendientes = '<form action="/completar-varios" method="POST"><ul>';
  for (let i = 0; i < pendientes.length; i++) {
    textoPendientes += `
            <li>
                <input type="checkbox" name="indices" value="${i}">
                ${pendientes[i]}
            </li>`;
  }
  textoPendientes += "</ul>";

  if (pendientes.length > 0) {
    textoPendientes += `
      <br>
      <button type="submit">Completar seleccionados</button>
    `;
  }
  textoPendientes += "</form>";

  // --- SECCIÓN REALIZADAS ---
  // Esta sección mantiene su botón para eliminar permanentemente
  let textoRealizadas =
    '<form action="/eliminar-varios-realizadas" method="POST"><ul>';
  for (let i = 0; i < realizadas.length; i++) {
    textoRealizadas += `
            <li>
                <input type="checkbox" name="indices" value="${i}">
                <s>${realizadas[i]}</s>
            </li>`;
  }
  textoRealizadas += "</ul>";

  if (realizadas.length > 0) {
    textoRealizadas +=
      '<br><button type="submit">Eliminar seleccionados</button>';
  }
  textoRealizadas += "</form>";

  paginaHtml = paginaHtml.replace("{{LISTA_PENDIENTES}}", textoPendientes);
  paginaHtml = paginaHtml.replace("{{LISTA_REALIZADAS}}", textoRealizadas);

  res.send(paginaHtml);
});

// AGREGAR TAREA
app.post("/agregar", function (req, res) {
  let tarea = req.body.nuevaTarea;
  if (tarea === "") {
    res.send(
      '<script>alert("La caja está vacía"); window.location="/tareas";</script>',
    );
  } else {
    pendientes.push(tarea);
    res.redirect("/tareas");
  }
});

// MOVER DE PENDIENTES A REALIZADAS (Esta es la función del botón de la primera lista)
app.post("/completar-varios", function (req, res) {
  let indices = req.body.indices;
  if (indices) {
    let listaACompletar = Array.isArray(indices) ? indices : [indices];

    //Ordenar de mayor a menor para que los índices no cambien al usar splice
    listaACompletar
      .sort((a, b) => b - a)
      .forEach((id) => {
        let tarea = pendientes.splice(id, 1);
        realizadas.push(tarea[0]);
      });
  }
  res.redirect("/tareas");
});

// ELIMINAR DE REALIZADAS
app.post("/eliminar-varios-realizadas", function (req, res) {
  let indices = req.body.indices;
  if (indices) {
    let listaABorrar = Array.isArray(indices) ? indices : [indices];
    listaABorrar
      .sort((a, b) => b - a)
      .forEach((id) => {
        realizadas.splice(id, 1);
      });
  }
  res.redirect("/tareas");
});

app.get("/", function (req, res) {
  res.redirect("/tareas");
});

app.listen(3000, function () {
  console.log("Servidor listo en el puerto 3000");
});
