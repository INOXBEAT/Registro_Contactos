const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ejs = require('ejs');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/contactDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Definir el esquema del contacto
const contactSchema = new mongoose.Schema({
  nombre: String,
  apellido: String,
  telefono: String,
  email: String,
});

// Crear el modelo de Contacto
const Contact = mongoose.model('Contact', contactSchema);

// Rutas
app.get('/', (req, res) => {
  res.render('index');
});

app.post('/contact', async (req, res) => {
  const { nombre, apellido, telefono, email } = req.body;
  const contact = new Contact({ nombre, apellido, telefono, email });
  await contact.save();
  res.redirect('/');
});

app.get('/visualizar', async (req, res) => {
  const contacts = await Contact.find();
  res.render('visualizar', { contacts });
});

app.post('/visualizar/buscar', async (req, res) => {
  const { searchTerm } = req.body;
  const contacts = await Contact.find({
    $or: [
      { nombre: { $regex: searchTerm, $options: 'i' } },
      { apellido: { $regex: searchTerm, $options: 'i' } },
      { telefono: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } },
    ],
  });
  res.render('visualizar', { contacts, searchTerm });
});

app.get('/contact/:id/edit', async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  res.render('edit', { contact });
});

app.post('/contact/:id/edit', async (req, res) => {
  const { nombre, apellido, telefono, email } = req.body;
  await Contact.findByIdAndUpdate(req.params.id, { nombre, apellido, telefono, email });
  res.redirect('/visualizar');
});

app.get('/contact/:id/delete', async (req, res) => {
  await Contact.findByIdAndDelete(req.params.id);
  res.redirect('/visualizar');
});

// Iniciar el servidor
app.listen(3000, () => {
  console.log('Servidor escuchando en el puerto http://localhost:3000');
});
