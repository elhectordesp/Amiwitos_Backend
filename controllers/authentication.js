const jwt = require('jsonwebtoken');
const config = require("../config/config");

const fs = require("fs");

const tokenCtrl = {};

tokenCtrl.verifyToken = async(req, res, next) => { 
    const token = req.headers['authorization'];
    console.log(token);
    if(!token) {
    console.log("err");
    console.log('hemos entrado fatal');
        res.status(401).send({auth: false, message: "no token provided"});
    }else {
        const token2 = req.headers['authorization'].split(' ')[1];
        //COMPRUEBA QUE EL TOKEN SEA VALIDO
        const decoded = await jwt.verify(token2, config.secret); 
        const url = req.originalUrl.split("/");
        const urlPath = req.originalUrl.split('?');
        const method = req.method;
        console.log('no estamos tan mal', decoded)
        if ( !decoded.user.e_type ) {
            await User.findById(decoded.user._id, async (err, user) => {
                if (err) {
                    res.send(500);
                }
                //SI ENCUENTRA EL USUARIO CHECKEA SI ESTE TIENE PERMISOS PARA ACCEDER A LA RUTA
                if (user) {
                    if (check("User", method, url, req.path)) {
                        req.logged = user;
                        return next();
                    } else {
                        res.status(401).send("you are not authorized to access this");
                    }
                }
            });
        } else {
            await Employee.findById(decoded.user._id, (err, employee) => {
                if (err) {
                    res.send(500);
                }
                if (employee) {
                    if (employee.e_type == "SuperUser") {
                        req.logged = employee;
                        return next();
                    } else {
                        //No hace bien la diferecia entre maintenance y owner
                        if (check(employee.e_type, method, url, req.path)) {
                            req.logged = employee;
                            return next();
                        }
                    }
                }
                res.status(401).send("you are not authorized to access this");
            });
        }  
    }
}
//COMPARA CON LA LISTA DE METODOS DISPONIBLES PARA CADA USUARIO
function check(type, method, url, path){
    let parse = url[2]+path;
    let valid = false;

    for(i in list[type][method]){
        if(list[type][method][i] == parse ){   
            valid = true;
        }
    }
    if(valid == true){
        return true;
    }
    return false;
}
//COMPRUEBA QUE EL CLIENTE QUE INTENTA BORRAR O EDITAR UN VEHICULO ES EL PROPIETARIO
tokenCtrl.verifyClientVehicle = async (req, res, next) => {
    if(req.logged.e_type == 'SuperUser'){
        return next();
    }else{
        await Vehicle.findById(req.query.id, async (err, vehicleStored) => {
            if(err){
                res.status(500).send({message: "Cannot save vehicle"});
            }
            else if(!vehicleStored){
                res.status(404).send({message: "Vehicle not found"});
            }
            else if( vehicleStored.client.equals(req.logged.client)){
                return next();
            } 
            else {
                res.status(401).send("You are no authorized to update this vehicle status");
            }
        });
    }
}

//VERIFICA QUE EL CLIENTE QUE INTENTE BORRAR O EDITAR UN CLIENTE SEA EL MISMO
tokenCtrl.verifyClient = async (req, res, next) =>{
    if(req.logged.e_type == 'SuperUser'){
        return next();
    }else{
        await Client.findById(req.query.id, async (err, clientFound) => {
            if(err){
                res.status(500).send({message: 'Server Error'});
            }
            else if(!clientFound){
                res.status(404).send({message: 'Client not found'});
            }
            else if(clientFound._id.equals(req.logged.client)){
                return next();
            }else{
                res.status(401).send('You are not authorized to update this client data');
            }
        });
    }
}
//COMPRUEBA QUE EL USUARIO QUE INTENTA BORRAR O EDITAR SU INFORMACION ES EL
tokenCtrl.verifyUser = async (req, res, next) => {

    if(req.logged.e_type == 'SuperUser'){
       return next();
    }else{
        await User.findById(req.query.id, async (err, userFound) => {
            if(err){
                res.status(500).send({message: 'Cannot save user'});
            }
            else if(!userFound){
                res.status(404).send({message: 'User not found'});
            }
            else if(userFound._id.equals(req.logged._id)){
                return next();
            }
            else{
                res.status(401).send('You are not authorized to update this user data');
            }
        });
    }
}

//VERIFICA QUE EL OWNER QUE ACCEDE A UN EMPLEADO SEA DE SU EMPRESA
tokenCtrl.verifyOwner = async (req, res, next) => {
    await Employee.findById(req.query.id, async (err, employeeFound) => {
        if(err){
            res.status(500).send({message: 'Cannot save employee'});
        }
        else if(!employeeFound){
            res.status(404).send({message: 'Employee not found'});
        }
        else if(employeeFound.client.equals(req.logged.client)){
            return next();
        }
        else{
            res.status(401).send('You are not authorized to update this data');
        }
    });
}

//VERIFICA QUE EL OWNER QUE QUIERE VER TODOS SUS USERS ES EL PROPIETARIO DE ESA EMPRESA
tokenCtrl.verifyOwnerGetUsers = async (req, res, next) => {

    if(req.logged.e_type == 'SuperUser'){
        return next();
     }else{
        await Client.findById(req.query.clients, async (err, clientFound) => {
            if(err) {
                res.status(500).send({message: 'Cannot found Client'});
            }
            else if(!clientFound){
                res.status(404).send({message: 'Client not found'});
            }
            else if(clientFound._id.equals(req.logged.client)){
                return next();
            }else{
                res.status(401).send('You are not authorized to update this data');
            }
        });
    }    
}

//VERIFICA QUE EL CLIENTE QUE CREA UN VEHICLE SEA EL DE SU EMPRESA
tokenCtrl.verifyClientCreateVehicle = async (req, res, next) => {
    if(req.logged.e_type == 'SuperUser'){
        return next();
    }else{
        if(req.logged.client.equals(req.body.client)){
            return next();
        }else{
            res.status(401).send('You are not authorized to update this data');
        }
    }
}

//VERIFICA QUE EL OWNER QUE EDITA O DELETEA UN EMPLOYEE SEA EL DE LA EMPRESA
tokenCtrl.verifyClientEditEmployee = async (req, res, next) => {

    if(req.logged.e_type == 'SuperUser'){
        return next();
    }else{
        await Employee.findById(req.query.id, async (err, vehicleFound) => {
            if(err){
                res.status(500).send({message: 'Cannot save Employee'});
            }
            else if(!vehicleFound){
                res.status(404).send({message: 'Employee not found'});
            }
            else if(vehicleFound.client.equals(req.logged.client)){
                return next();
            }
            else{
                res.status(401).send('You are not authorized to update this data');
            }
        });
    }
}

//VERIFICA QUE EL OWNER QUE INTENTA EDITAR O ELIMINAR UN TUTORIAL ES EL DE SU EMPRESA
tokenCtrl.verifyOwnerTutorial = async (req, res, next) => {
    if(req.logged.e_type == 'SuperUser'){
        return next();
    }else{
        await Tutorial.findById(req.query.id, async (err, tutorialFound) => {
            if(err){
                res.status(500).send({message: 'Cannot save Tutorial'});
            }
            else if(!tutorialFound){
                res.status(404).send({message: 'Tutorial not found'});
            }
            else if(req.logged.client.equals(tutorialFound.client)){
                return next();
            }
            else{
                res.status(401).send('You are not authorized to update this data');
            }
        });
    }
}

//VERIFICA QUE EL OWNER QUE CREA UN TUTORIAL LO HAGA DE SU EMPRESA
tokenCtrl.verifyOwnerCreateTutorial = async(req, res, next) =>{
    if(req.logged.e_type == 'SuperUser'){
        return next();
    }else{
        if(req.logged.client.equals(req.body.client)){
            return next();
        }else{
            res.status(401).send('You are not authorized to update this data');
        }
    }
}

//VERIFICA QUE EL CLIENTE QUE TOCA UNA ESTACION SEA EL DE LA EMPRESA
tokenCtrl.verifyClientStation = async (req, res, next) =>{
    if(req.logged.e_type == 'SuperUser'){
        return next();
    }else{
        await Station.findById(req.query.id, async (err, stationFound) => {
            if(err){
                res.status(500).send({message: 'Cannot save Station'});
            }else if(!stationFound){
                res.status(404).send({message: 'Station not found'});
            }else if(req.logged.client.equals(stationFound.client)){
                return next();
            }else{
                res.status(401).send('You are not authorized to update this data');
            }
        });
    }
}

//VERIFICA QUE EL CLIENTE QUE INTENTA MOSTRARSE LAS STATION DE SU EMPRESA SEA EMPLEADO DE ELLA
tokenCtrl.verifyEmployeeStation = async(req, res, next) =>{
    if(req.logged.e_type == 'SuperUser'){
        return next();
    }else{
        if(req.logged.client.equals(req.query.id)){
            return next();
        }else{
            res.status(401).send('You are not authorized to update this data');
        }
    }
}

//VERIFICA QUE EL CLIENTE QUE TOCA UNA ESTACION SEA EL DE LA EMPRESA
tokenCtrl.verifyClientZone = async (req, res, next) =>{
    if(req.logged.e_type == 'SuperUser'){
        return next();
    }else{
        await Zone.findById(req.query.id, async (err, zoneFound) => {
            if(err){
                res.status(500).send({message: 'Cannot save Zone'});
            }else if(!zoneFound){
                res.status(404).send({message: 'Zone not found'});
            }else if(req.logged.client.equals(zoneFound.client)){
                return next();
            }else{
                res.status(401).send('You are not authorized to update this data');
            }
        });
    }
}

//VERIFICA QUE EL CLIENTE QUE TOCA UNA BILL SEA EL DE LA EMPRESA
tokenCtrl.verifyClientBill = async (req, res, next) =>{
    if(req.logged.e_type == 'SuperUser'){
        return next();
    }else{
        await Bill.findById(req.query.id, async (err, zoneFound) => {
            if(err){
                res.status(500).send({message: 'Cannot save Bill'});
            }else if(!zoneFound){
                res.status(404).send({message: 'Bill not found'});
            }else if(req.logged.client.equals(zoneFound.client)){
                return next();
            }else{
                res.status(401).send('You are not authorized to update this data');
            }
        });
    }
}

module.exports = tokenCtrl;