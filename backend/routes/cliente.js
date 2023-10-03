'use strict'

let express = require('express');
let clienteController = require('../controllers/ClienteController');

let api = express.Router();

api.post('/registro-cliente', clienteController.registroCliente);
api.post('/login-cliente', clienteController.loginCliente);

api.get('/listar-clientes-filtro-admin/:tipo/:filtro?',clienteController.listarClientesFiltroAdmin);
//api.get('/listar_clientes_filtro_admin/:tipo/:filtro?',auth.auth,clienteController.listar_clientes_filtro_admin);

module.exports = api;
