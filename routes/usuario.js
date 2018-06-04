var express= require('express');
var bcrypt= require('bcryptjs');

var mdAutentication = require ('../middlewares/autenticacion');

var app= express();

var Usuario = require('../models/usuario');

//========================================
// Obtener todos los usuarios
//========================================
app.get('/', (req, res, next ) => {

    Usuario.find({ }, 'nombre email img role')
            .exec ( (err, usuarios)=> {

                if( err ) {
                    return  res.status(500).json({
                        ok: false,
                        mensaje: 'Error Cargando Usuarios',
                        errors: err
                    })
                }

                res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                })
            });   
});

//========================================
// Crear un nuevo usuario
//========================================

app.post('/', mdAutentication.verificaToken, (req, res) =>{

    var body= req.body;

    var usuario= new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save( ( err, usuarioGuardado ) =>{
            if( err ) {
                return  res.status(400).json({
                    ok: false,
                    mensaje: 'Error al crear Usuario',
                    errors: err
                })
            }
        
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuariotoken: req.usuario
        });
    });
})


//========================================
// Actualizar usuario
//========================================

app.put('/:id', mdAutentication.verificaToken, (req,res) => {

    var id= req.params.id;
    var body= req.body;

    Usuario.findById( id, (err, usuario ) => {

            if( err ) {
                return  res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar Usuario',
                    errors: err
                });
            }
        
            if( !usuario ) {
                return  res.status(400).json({
                    ok: false,
                    mensaje: ' El usuario con el id' + id + 'no existe',
                    errors: { message: ' No existe un usuario con ese ID'}
                })
            }

        usuario.nombre= body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save( ( err,usuarioGuardado) => {
            
            if( err ) {
                return  res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
});

//========================================
// Borrar un usuario
//========================================

app.delete('/:id', mdAutentication.verificaToken, (req, res) => {
    
    var id= req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
            if( err ) {
                return  res.status(500).json({
                    ok: false,
                    mensaje: 'Error al borrar Usuario',
                    errors: err
                })
            }
            
            if( !usuarioBorrado ) {
                return  res.status(400).json({
                    ok: false,
                    mensaje: 'No existe un usuario con ese ID',
                    errors: {message: 'No existe un usuario con ese ID'}
                })
            }
        
        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    })
})





module.exports = app;