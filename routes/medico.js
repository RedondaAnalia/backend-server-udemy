var express = require('express');

var mdAutentication = require ('../middlewares/autenticacion');
var app = express();

var Medico= require('../models/medico');


//========================================
// Obtener todos los medicos
//========================================
app.get('/', (req, res, next ) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({ })
          .skip(desde)
          .limit(5)
          .populate('usuario', 'nombre email')
          .populate('hospital')
          .exec ( (err, medicos)=> {

                if( err ) {
                    return  res.status(500).json({
                        ok: false,
                        mensaje: 'Error Cargando Medicos',
                        errors: err
                    })
                }

                Medico.count({}, (error,conteo) => {
                    res.status(200).json({
                        ok: true,
                        medicos,
                        total: conteo
                    })

                })
            });   
});


//========================================
// Crear un nuevo medico
//========================================

app.post('/', mdAutentication.verificaToken, (req, res) =>{

    var body= req.body;

    var medico= new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
        });

    medico.save( ( err, medicoGuardado ) =>{
            if( err ) {
                return  res.status(400).json({
                    ok: false,
                    mensaje: 'Error al crear Medico',
                    errors: err
                })
            }
        
        res.status(201).json({
            ok: true,
            medico:medicoGuardado
        });
    });
});


//========================================
// Actualizar medico
//========================================

app.put('/:id', mdAutentication.verificaToken, (req,res) => {

    var id= req.params.id;
    var body= req.body;

    Medico.findById( id, (err, medico ) => {

            if( err ) {
                return  res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar Medico',
                    errors: err
                });
            }
        
            if( !medico ) {
                return  res.status(400).json({
                    ok: false,
                    mensaje: ' El medico con el id' + id + 'no existe',
                    errors: { message: ' No existe un medico con ese ID'}
                })
            }

        medico.nombre= body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save( ( err,medicoGuardado) => {
            
            if( err ) {
                return  res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medicoGuardado
            });
        });
    });
});



//========================================
// Borrar un medico
//========================================

app.delete('/:id', mdAutentication.verificaToken, (req, res) => {
    
    var id= req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
            if( err ) {
                return  res.status(500).json({
                    ok: false,
                    mensaje: 'Error al borrar Medico',
                    errors: err
                })
            }
            
            if( !medicoBorrado ) {
                return  res.status(400).json({
                    ok: false,
                    mensaje: 'No existe un medico con ese ID',
                    errors: {message: 'No existe un medico con ese ID'}
                })
            }
        
        res.status(200).json({
            ok: true,
            medicoBorrado
        });
    })
});



module.exports = app;