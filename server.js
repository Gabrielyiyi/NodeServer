const express = require('express'); 
const fs = require('fs');
const app = express();

app.use(express.urlencoded({ extended: true })); 
app.use(express.static('public'));

let pendientes = []; 
let realizadas = [];

app.get('/', function(req, res) {
    let paginaHtml = fs.readFileSync('public/index.html', 'utf8');

    let textoPendientes = "";
    for (let i = 0; i < pendientes.length; i++) {
        textoPendientes = textoPendientes + `
            <li>
                <form action="/completar" method="POST" style="display:inline;">
                    <input type="hidden" name="id" value="${i}">
                    <input type="checkbox" onchange="this.form.submit()">
                </form>
                ${pendientes[i]}
                <a href="/eliminar?id=${i}"> <button>Eliminar</button> </a>
            </li>
        `;
    }

    let textoRealizadas = "";
    for (let i = 0; i < realizadas.length; i++) {
        textoRealizadas = textoRealizadas + `
            <li>
                <input type="checkbox" checked disabled> 
                <s>${realizadas[i]}</s>
            </li>
        `;
    }

    paginaHtml = paginaHtml.replace('{{LISTA_PENDIENTES}}', textoPendientes);
    paginaHtml = paginaHtml.replace('{{LISTA_REALIZADAS}}', textoRealizadas);
    res.send(paginaHtml);
});
app.post('/agregar', function(req, res) {
    let tarea = req.body.nuevaTarea;

    if (tarea === "") {
        res.send('<script>alert("La caja está vacía"); window.location="/";</script>');
    } 
    else if (pendientes.includes(tarea) || realizadas.includes(tarea)) {
        res.send('<script>alert("Esta tarea ya existe"); window.location="/";</script>');
    } 
    else {
        pendientes.push(tarea);
        res.redirect('/');
    }
});
app.post('/completar', function(req, res) {
    let id = req.body.id;
    let tareaTerminada = pendientes.splice(id, 1);
    realizadas.push(tareaTerminada[0]);
    res.redirect('/'); 
});
app.get('/eliminar', function(req, res) {
    let id = req.query.id;
    pendientes.splice(id, 1);
    res.redirect('/');
});
app.listen(3000, function() {
    console.log("Servidor on");
});
