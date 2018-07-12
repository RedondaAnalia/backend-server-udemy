var express = require('express');

var mdAutentication = require ('../middlewares/autenticacion');

var app = express();

var Hospital= require('../models/hospital');

//========================================
// Obtener todos los hospitales
//========================================
app.get('/', (req, res, next ) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
    .skip(desde)
    .limit(5)
            .populate('usuario', 'nombre email')
            .exec ( (err, hospitales)=> {

                if( err ) {
                    return  res.status(500).json({
                        ok: false,
                        mensaje: 'Error Cargando Hospitales',
                        errors: err
                    })
                }

                Hospital.count({}, (error,conteo) =>{
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    })
                })

            });   
});




//========================================
// Crear un nuevo hospital
//========================================

app.post('/', mdAutentication.verificaToken, (req, res) =>{

    var body= req.body;

    var hospital= new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
        });

    hospital.save( ( err, hospitalGuardado ) =>{
            if( err ) {
                return  res.status(400).json({
                    ok: false,
                    mensaje: 'Error al crear Hospital',
                    errors: err
                })
            }
        
        res.status(201).json({
            ok: true,
            hospital:hospitalGuardado
        });
    });
});



//========================================
// Actualizar hospital
//========================================

app.put('/:id', mdAutentication.verificaToken, (req,res) => {

    var id= req.params.id;
    var body= req.body;

    Hospital.findById( id, (err, hospital ) => {

            if( err ) {
                return  res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar Hospital',
                    errors: err
                });
            }
        
            if( !hospital ) {
                return  res.status(400).json({
                    ok: false,
                    mensaje: ' El hospital con el id' + id + 'no existe',
                    errors: { message: ' No existe un hospital con ese ID'}
                })
            }

        hospital.nombre= body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save( ( err,hospitalGuardado) => {
            
            if( err ) {
                return  res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospitalGuardado
            });
        });
    });
});

//========================================
// Borrar un hospital por el id
//========================================

app.delete('/:id', mdAutentication.verificaToken, (req, res) => {
    
    var id= req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
            if( err ) {
                return  res.status(500).json({
                    ok: false,
                    mensaje: 'Error al borrar Hospital',
                    errors: err
                })
            }
            
            if( !hospitalBorrado ) {
                return  res.status(400).json({
                    ok: false,
                    mensaje: 'No existe un hospital con ese ID',
                    errors: {message: 'No existe un hospital con ese ID'}
                })
            }
        
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    })
});


module.exports = app;