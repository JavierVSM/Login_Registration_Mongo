const mongoose = require ('mongoose');

const RegistrationSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required: true,
        minlength:3,
        maxlength: 20
    },
    lastName:{
        type:String,
        required: true,
        minlength:3,
        maxlength: 20
    },
    email:{
        type:String,
        required: true,
        unique: true
    },
    password:{
        type:String,
        required: true,
    },
    birthday: {
        type:Date,
        required: true,
    }
});

const User = mongoose.model ('users', RegistrationSchema);

const userModel={
    createUser: function(newUser){
        return User.create(newUser);
    },
    getUsers:function(){
        return User.find();
    },
    getUserbyUserName: function (email){
        return User.findOne({email:email})
    }
};

module.exports = {userModel};