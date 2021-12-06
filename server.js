const express = require ('express');
const mongoose = require ('mongoose');
const bcrypt = require( 'bcrypt' );
const session = require( 'express-session' );
const flash = require( 'express-flash' );

mongoose.connect('mongodb://localhost/registration_db', {useNewUrlParser: true});

const {userModel} = require( './models/userModel' );

const app = express ();

app.set('views', __dirname+ '/views');
app.set ('view engine', 'ejs');


app.use(flash());
app.use(express.urlencoded({extendend:true}) );
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 * 20}//number in miliseconds 
}));

app.get ('/', function (request, response){
    response.render ('login');
});

app.post ('/addUser', function (request, response){
    const firstName= request.body.firstName;
    const lastName= request.body.lastName;
    const email= request.body.email;
    const password= request.body.password;
    const birthday= request.body.birthday;

    if (firstName.length == 0 || lastName.length == 0 || email.length == 0 || password.length == 0 || birthday.length == 0 ){
        request.flash('error', 'All fields must be completed');
        response.redirect('/');
    }
    else{
        bcrypt.hash(password, 10)
        .then (encryptedPassword => {
            const newUser = {
                firstName,
                lastName,
                email,
                password: encryptedPassword,
                birthday
            };
            userModel
            .createUser(newUser)
            .then( result => {
                request.session.firstName = result.firstName;
                request.session.lastName = result.lastName;
                request.session.email = result.email;
                response.redirect('/home');  
            })
            .catch( err => {
                request.flash( 'registration', 'That email is already in use!' );
                response.redirect( '/' )
            });  
        
        });
    }
});

app.post ('/login', function (request, response){
    const email= request.body.loginEmail;
    const password= request.body.loginPassword;

    userModel
    .getUserbyUserName(email)
    .then( result => {
        console.log("Result: ", result);
        if (result === null){
            throw new Error("User email do not exist");
        }

        bcrypt.compare( password, result.password)
        .then( flag => {
            if(!flag){
                throw new Error("Wrong password credentials");
            }
            request.session.firstName = result.firstName;
            request.session.lastName = result.lastName;
            request.session.email = result.email;
            response.redirect('/home');
            })
        .catch( error => {
            request.flash('login', error.message);
                response.redirect('/');
        });
    })
    .catch( error => {
        request.flash('login', error.message);
        response.redirect('/');
    });
});

app.get ('/home', function (request, response){
    if( request.session.email === undefined ){
        response.redirect( '/' );
    }
    else{
        let currentUser = {
            firstName : request.session.firstName, 
            lastName : request.session.lastName,
        }
        response.render ('index', {currentUser:currentUser});
    }
});

app.post( '/logout', function( request, response ){
    request.session.destroy();
    response.redirect( '/' ); 
});

app.listen (8080, function (){
    console.log ("The user server is running on 8080")
});