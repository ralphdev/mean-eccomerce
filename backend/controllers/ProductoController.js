'use strict'

var Producto = require('../models/producto');
var Inventario = require('../models/inventario')
var Review = require('../models/review');
var path = require('path');
var fs = require('fs');


//** Registrar Producto */
const registroProductoAdmin = async (req, res) => {

  if (req.user) {

    if (req.user.role == 'admin') {

      let data = req.body;

      let imgPath = req.files.portada.path;
      let name = imgPath.split(path.sep);
      let portadaName = name[2];

      data.slug = data.titulo.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      data.portada = portadaName;

      try {

        console.log('sub ',req.user.sub);

        let reg = await Producto.create(data);

        let inventario = await Inventario.create({
          admin: req.user.sub,
          cantidad: data.stock,
          proveedor: 'Primer registro',
          producto: reg._id
        });

        return res.status(200).send({
          data: reg,
          inventario: inventario
        });


      } catch (error) {

        console.log(error);

        return res.status(500).json({
          message: "Contact Admin -- Problem with the Backend",
        });
      }
    } else {

      res.status(500).json({ message: 'NoAccess' });
    }
  } else {
    res.status(500).json({ message: 'NoAccess' });
  }
}

const listarProductosAdmin = async (req,res) => {
  if(req.user){

      if(req.user.role == 'admin'){

        let filtro = req.params['filtro'];

        let reg = await Producto.find({ titulo: new RegExp(filtro, 'i') });
        return res.status(200).send({ data: reg });

      }else{
        res.status(500).send({ message: 'NoAccess' });
      }
  }else{
    res.status(500).send({message: 'NoAccess'});
  }
}

const obtenerPortadaProducto = async (req,res) => {

  let img = req.params['img'];

  console.log(img);
  fs.stat('./uploads/productos/'+img, function(err){

    if(!err){

      let pathImg = './uploads/productos/'+img;
      return res.status(200).sendFile(path.resolve(pathImg));
    }else{

      let pathImg = './uploads/default.jpg';
      return res.status(200).sendFile(path.resolve(pathImg));
  }
  });
}

const obtenerProductoAdmin = async (req, res) => {
  if (req.user){

    if(req.user.role == 'admin'){

      let id = req.params['id'];

      try {
        var reg = await Producto.findById({_id:id});

        return res.status(200).send({ data:reg });
      }catch (error){

        return res.status(200).send({data:undefined})
      }

    }else{
      return res.status(500).send({ message: 'NoAccess' });
    }
  }else{
    return res.status(500).send({ message: 'NoAccess' });
  }
}

const actualizarProductoAdmin = async (req, res) => {

  if (req.user) {

    if (req.user.role == 'admin') {
      let id = req.params['id'];
      let data = req.body;

      if (req.files) {

        //si hay img
        let imgPath = req.files.portada.path;
        let name = imgPath.split(path.sep);
        let portadaName = name[2];

        let reg = await Producto.findByIdAndUpdate({ _id: id },{
          titulo: data.titulo,
          stock: data.stock,
          precio: data.precio,
          categoria: data.categoria,
          descripcion: data.descripcion,
          contenido: data.contenido,
          portada: portadaName
        });

        fs.stat('./uploads/productos/' + reg.portada, (err) => {
          if (!err) {
            fs.unlink('./uploads/productos/' + reg.portada, (err) => {
              if (err) throw err;
            });
          }
        });

        return res.status(200).send({ data: reg });
      } else {

        //no hay img
        let reg = await Producto.findByIdAndUpdate({_id:id},{
          titulo: data.titulo,
          stock: data.stock,
          precio: data.precio,
          categoria: data.categoria,
          descripcion: data.descripcion,
          contenido: data.contenido,
        });

        return res.status(200).send({ data: reg });
      }
    } else {
      return res.status(500).send({ message: 'NoAccess' });
    }
  } else {
    return res.status(500).send({ message: 'NoAccess' });
  }
}

const eliminarProductoAdmin = async (req,res) => {

  if(req.user){

      if(req.user.role == 'admin'){

        let id = req.params['id']
        let reg = await Producto.findByIdAndRemove({_id:id});

        fs.stat('./uploads/productos/' + reg.portada, (err) => {
          if (!err) {
              fs.unlink('./uploads/productos/' + reg.portada, (err) => {
                if (err) throw err;
              });
          }
        });

        return res.status(200).send({data:reg});
      }else{

        return res.status(500).send({message: 'NoAccess'});
      }
  }else{
    res.status(500).send({message: 'NoAccess'});
  }
}

//** Inventario */
const listarInventarioAdmin = async (req,res) => {
  if(req.user){

    if(req.user.role == 'admin'){

      let id = req.params['id']
      let reg = await Inventario.find({producto: id}).populate('admin').sort({ createdAt:-1 });
      res.status(200).send({data:reg})
    }else{
      return res.status(500).send({ message: 'NoAccess' });
    }
  }else{
    return res.status(500).send({ message: 'NoAccess' });
  }
}

module.exports = {
  listarProductosAdmin,
  registroProductoAdmin,
  obtenerPortadaProducto,
  obtenerProductoAdmin,
  actualizarProductoAdmin,
  eliminarProductoAdmin,
  listarInventarioAdmin
};
