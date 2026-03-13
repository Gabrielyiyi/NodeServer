const express = require("express"); // Importar el framework Express
const fs = require("fs"); // Importar el módulo de sistema de archivos
const app = express(); // Crear una instancia de la aplicación Express

// Middleware para parsear datos de formularios
app.use(express.urlencoded({ extended: true })); // Usar middleware para parsear datos URL-encoded

// Arrays para almacenar las tareas pendientes y realizadas
let pendientes = []; // Array para tareas pendientes
let realizadas = []; // Array para tareas realizadas

// Ruta principal para mostrar la lista de tareas
app.get("/tareas", function (req, res) {
  // Definir ruta GET para /tareas
  let paginaHtml = fs.readFileSync("public/index.html", "utf8"); // Leer el archivo HTML de la plantilla

  // --- SECCIÓN PENDIENTES ---
  // El formulario ahora solo tiene la acción de completar
  let textoPendientes = '<form action="/completar-varios" method="POST"><ul>';
  for (let i = 0; i < pendientes.length; i++) {
    // Iterar sobre las tareas pendientes
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
    // Iterar sobre las tareas realizadas
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

  paginaHtml = paginaHtml.replace("{{LISTA_PENDIENTES}}", textoPendientes); // Reemplazar placeholder con lista de pendientes
  paginaHtml = paginaHtml.replace("{{LISTA_REALIZADAS}}", textoRealizadas); // Reemplazar placeholder con lista de realizadas

  res.send(paginaHtml); // Enviar la página HTML generada al cliente
});

// Ruta para agregar una nueva tarea
app.post("/agregar", function (req, res) {
  // Definir ruta POST para /agregar
  let tarea = req.body.nuevaTarea; // Obtener la tarea del cuerpo de la solicitud
  if (tarea === "") {
    // Verificar si la tarea está vacía
    res.send(
      // Enviar alerta si está vacía
      '<script>alert("La caja está vacía"); window.location="/tareas";</script>',
    );
  } else if (pendientes.includes(tarea) || realizadas.includes(tarea)) {
    // Verificar si la tarea ya existe usando includes
    res.send(
      // Enviar alerta si ya existe
      '<script>alert("La tarea ya existe"); window.location="/tareas";</script>',
    );
  } else {
    pendientes.push(tarea); // Agregar tarea a pendientes
    res.redirect("/tareas"); // Redirigir a la lista de tareas
  }
});

// Ruta para mover tareas seleccionadas de pendientes a realizadas
app.post("/completar-varios", function (req, res) {
  // Definir ruta POST para /completar-varios
  let indices = req.body.indices; // Obtener los índices seleccionados
  if (indices) {
    // Si hay índices seleccionados
    let listaACompletar = Array.isArray(indices) ? indices : [indices]; // Asegurar que sea un array

    //Ordenar de mayor a menor para que los índices no cambien al usar splice
    listaACompletar
      .sort((a, b) => b - a) // Ordenar índices de mayor a menor
      .forEach((id) => {
        // Iterar sobre cada índice
        let tarea = pendientes.splice(id, 1); // Remover tarea de pendientes
        realizadas.push(tarea[0]); // Agregar a realizadas
      });
  } else {
    res.send(
      // Enviar alerta si no se seleccionó ninguna tarea
      '<script>alert("No se seleccionó ninguna tarea"); window.location="/tareas";</script>',
    );
    return; // Salir de la función para evitar redirección
  }
  res.redirect("/tareas"); // Redirigir a la lista
});

// Ruta para eliminar tareas seleccionadas de la lista de realizadas
app.post("/eliminar-varios-realizadas", function (req, res) {
  // Definir ruta POST para /eliminar-varios-realizadas
  let indices = req.body.indices; // Obtener los índices seleccionados
  if (indices) {
    // Si hay índices
    let listaABorrar = Array.isArray(indices) ? indices : [indices]; // Asegurar array
    listaABorrar
      .sort((a, b) => b - a) // Ordenar de mayor a menor
      .forEach((id) => {
        // Iterar
        realizadas.splice(id, 1); // Eliminar de realizadas
      });
  } else {
    res.send(
      // Enviar alerta si no se seleccionó ninguna tarea
      '<script>alert("No se seleccionó ninguna tarea"); window.location="/tareas";</script>',
    );
    return; // Salir de la función para evitar redirección
  }
  res.redirect("/tareas"); // Redirigir
});

// Redirigir la raíz a /tareas
app.get("/", function (req, res) {
  // Definir ruta GET para la raíz
  res.redirect("/tareas"); // Redirigir a /tareas
});

// Iniciar el servidor en el puerto 3000
app.listen(3000, function () {
  // Escuchar en el puerto 3000
  console.log("Servidor listo en el puerto 3000"); // Imprimir mensaje de confirmación
});
