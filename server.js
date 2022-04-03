// ** Installed dependencies
const express = require("express");
const mongoose = require("mongoose");
const app = express();
// ** Swagger · http://localhost:4000/api/docs/
const swaggerUi = require("swagger-ui-express");
const yaml = require("yamljs");
// Swagger Setup 
const swaggerDefinition = yaml.load('./swagger.yaml');
app.use('/api/docs',swaggerUi.serve,swaggerUi.setup(swaggerDefinition, { customSiteTitle: "API · Artists" }));

// ** Routes > Import
const artistRoutes = require("./routes/artist");
const authRoutes = require("./routes/auth");


require("dotenv-flow").config(); // Imports the port settings

// parse request of content-type>JSON |  Replaces deprecated bodyParser dependency
app.use(express.json());

// ** CORS  (for Heroku to work)
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "auth-token, Origin, X-Requested-With, Content-Type, Accept");
    next();
});


// ** Connection to the database
mongoose.connect(
    //connection string
    process.env.DBHOST,
    {
        useUnifiedTopology:true,
        useNewUrlParser:true 
    }
).catch(error=>console.log("Error connecting to MongoDB: "+error));

mongoose.connection.once('open',()=>console.log("Connected successfully to MongoDB"));

// ** ROUTES
app.get("/api/welcome",(req,res)=>{
    res.status(200).send({message:"Welcome to my Artists MEN RESTful API"});
});

// ** Routes > Use
app.use("/api/artists", artistRoutes);
app.use("/api/user",authRoutes);

// ** PORT
const PORT = process.env.PORT || 4000;
app.listen(PORT,function(){// We listen to the port
    console.log("Server is running on port "+ PORT);
}) 
module.exports = app; //Exports app as module