var express= require('express');
var app= express();

var Hospital = require('../models/hospital');
var Medicos = require('../models/medico');
var Usuario = require('../models/usuario');


//=========================================
// Busqueda en todas las tablas
//=========================================
app.get('/todo/:busqueda', (req, res, next ) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp( busqueda, 'i' );

    Promise.all( [buscarHospitales(busqueda,regex), buscarMedicos(busqueda, regex), buscarUsuario(busqueda,regex)] )
            .then( respuestas => {
                res.status(200).json({
                    ok: true,
                    hospitales: respuestas[0],
                    medicos: respuestas[1],
                    usuario: respuestas[2]
                })
            })

});

//=========================================
// Busqueda en tabla especifica
//=========================================
app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {
    
    var busqueda = req.params.busqueda;
    var tabla= String(req.params.tabla);

    var regex = new RegExp( busqueda, 'i' );
    
    var promesa;
    switch(tabla){
        case 'usuarios':
            promesa= buscarUsuario(busqueda, regex);
            break;
        case 'medicos':
            promesa= buscarMedicos(busqueda, regex);
            break;        
        case 'hospitales':
            promesa= buscarHospitales(busqueda, regex);
            break;        
        default:
            return res.status(400).json({
                ok: false,
                mensaje:'Los tipos de busquedas solo son usuarios, medicos y hospitales',
                error: {message: 'Tipo de tabla/coleccion no valida'}            
            })
            
    }
    promesa.then(data =>{
        res.status(200).json({
            ok: true,
            [tabla]: data}            
        )

    })



});



function buscarHospitales( busqueda, regex){

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) =>{
    
           if(err){
               reject('Error al cargar hospitales', err);
           }else {
               resolve(hospitales);
           }
        })
    })
}

function buscarMedicos( busqueda, regex){

    return new Promise((resolve, reject) => {

        Medicos.find({ nombre: regex })
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec( (err, hospitales) =>{
    
           if(err){
               reject('Error al cargar medicos', err);
           }else {
               resolve(hospitales);
           }
        })
    })
}

function buscarUsuario( busqueda, regex){

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
                .or([{ 'nombre': regex }, { 'email': regex }])
                .exec((err,usuario) => {
                    if(err){
                        reject('Error al cargar el usuario', err);
                    }else{
                        resolve(usuario)
                    }
                })
    })
}
module.exports = app;