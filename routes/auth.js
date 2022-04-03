
const router = require("express").Router();
const User = require("../models/user");
// Validation
const {registerValidation,loginValidation} = require("../validation"); // Joi library validation 
const { valid } = require("joi");
// Password encription
const bcrypt = require('bcrypt');
// Authentication through tokens
const jwt = require('jsonwebtoken');

// ** REGISTRATION
router.post("/register", async (req,res)=>{

    // Input VALIDATION · Inputs from request are validated in validation.js
    const {error} = registerValidation(req.body);
    
    if(error){ // Produced by the joy library (it uses it to validate data)
        return res.status(400).json({error: error.details[0].message});
    }
    
    // Double validation (Mongoose validation + Joi validation) before sending it to the db
    
    // Check if EMAIL already exists
    const emailExist = await User.findOne({email:req.body.email});
    if(emailExist){
        return res.status(400).json({error: "Email already exists"});
    }
    // Password Hashing (bcrypt library)
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password,salt);

    // Creates USER OBJECT and saves it to the db (mongoose definition)
    const userObject = new User({
        name: req.body.name,
        email: req.body.email,
        password                
    });

    try{
        const savedUser = await userObject.save();
        res.json({error:null, data: savedUser._id}); // _id > id we get from mongoDB, we return the user id
    }
    catch(error){
        res.status(400).json({error});
    };
});

// ** LOGIN
router.post("/login", async (req,res)=>{ 
    
    // Validation
    const {error} = loginValidation(req.body);
    if(error){ 
        return res.status(400).json({error: error.details[0].message});
    }
    // No errors > Find user
    const user = await User.findOne({email:req.body.email});
    
    // Error > EMAIL doesn't exist in DB
    if(!user){
        return res.status(400).json({error: "Email doesn't exist"});
    }
    // Error > PASS is wrong
    const validPassword = await bcrypt.compare(req.body.password,user.password); // We compare the given password and the one found in the DB
    if(!validPassword){
        return res.status(400).json({error: "Incorrect password"});
    }
    // Auth TOKEN with username & id
    const token = jwt.sign(
        //payload
        {
            name: user.name,
            id: user._id
        },
        // Token_secret (defined in .env file)
        process.env.TOKEN_SECRET,
        // Expiration time (defined in .env file)
        {expiresIn: process.env.JWT_EXPIRES_IN},
    );
    // Attach auth token to header
    res.header("auth-token",token).json({
        error:null,
        data: {token}
    });
});
// ------------------------------------------------


// Routes export
module.exports= router;