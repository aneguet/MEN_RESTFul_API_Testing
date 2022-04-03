const router = require("express").Router();
const artist = require("../models/artist");
// Token authentication
const { verifyToken } = require("../validation");

// ** CRUD
// FIXME Required implementation: Testing with Tokens
// 1) Create > POST · api/artists/
//router.post("/", verifyToken, (req,res)=>{
router.post("/", (req, res) => {
  data = req.body;
  artist
    .insertMany(data)
    .then((data) => {
      res.status(201).send(data);
    }) // Returns the inserted data
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
});

// 2) Read all  > GET · api/artists/
router.get("/", (req, res) => {
  artist
    .find()
    .then((data) => {
      let outputArr = data.map((element) => ({
        id: element._id,
        name: element.name,
        info: element.info,
        genre: element.genre,
        photo: element.photo,
        listeners: element.listeners,
        albums: element.albums,
        top_tracks: element.top_tracks,
        similar_to: element.similar_to,
        uri: "/api/artists/" + element._id,
      }));
      res.send(outputArr);
    }) // Returns the inserted data
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
});

// 3) Read specific artist > GET · api/artists/id
router.get("/:id", (req, res) => {
  artist
    .findById(req.params.id)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
});

// 4) Update specific artist > PUT · api/artists/id
router.put("/:id", verifyToken, (req, res) => {
  const id = req.params.id;
  artist
    .findByIdAndUpdate(id, req.body)
    .then((data) => {
      if (!data) {
        //wrong or non existing id
        res
          .status(404)
          .send({ message: "Cannot update artist with id= " + id });
      } else {
        res.send({ message: "Artist successfully updated." });
      }
    }) // Returns the inserted data
    .catch((err) => {
      res.status(500).send({ message: "Error updating artist with id= " + id });
    });
});

// 5) Delete specific artist > DELETE · api/artists/id
router.delete("/:id", verifyToken, (req, res) => {
  const id = req.params.id;
  artist
    .findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        //wrong or non existing id
        res
          .status(404)
          .send({ message: "Cannot delete artist with id= " + id });
      } else {
        res.send({ message: "Artist successfully deleted." });
      }
    }) // Returns the inserted data
    .catch((err) => {
      res.status(500).send({ message: "Error deleting artist with id= " + id });
    });
});

// Routes export
module.exports = router;
