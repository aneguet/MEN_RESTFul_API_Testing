const Joi = require('joi');
const jwt = require('jsonwebtoken');

// ** 1) Validating REGISTRATION

const registerValidation = (data)=>{
    const schema = Joi.object({
        name: Joi.string().min(6).max(255).required(),
        email: Joi.string().min(6).max(255).required(),
        password: Joi.string().min(6).max(255).required()
    });
    return schema.validate(data);
}

// ** 2) Validating LOGIN

const loginValidation = (data)=>{
    const schema = Joi.object({
        email: Joi.string().min(6).max(255).required(),
        password: Joi.string().min(6).max(255).required()
    });
    return schema.validate(data);
}


// ** 3) Verify TOKEN JWT
const verifyToken = (req,res,next)=>{
    const token = req.header("auth-token"); // we'll get the token from the login response, we'll have to create this header when needed
    // in a specific request
    if(!token) return res.status(401).json({error: "Access denied"})
    try{ // verifies that the token matches the secret token
        const verified = jwt.verify(token,process.env.TOKEN_SECRET);
        req.user = verified; // ????
        next();  // we pass control to the next request in the stack
    }
    catch(error){
        res.status(400).json({error: "Token is not valid"})
    }
}


module.exports = {registerValidation,loginValidation,verifyToken};