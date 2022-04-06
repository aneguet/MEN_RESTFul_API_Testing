// We switch to the test DB
process.env.NODE_ENV = "test";
// Import models
const Artist = require("../models/artist");
const User = require("../models/user");

// Deletes all the artists in the DB
before((done) => {
  Artist.deleteMany({}, function (err) {});
  // User.deleteMany({}, function (err) {});
  done();
});
after((done) => {
  Artist.deleteMany({}, function (err) {});
  // User.deleteMany({}, function (err) {});

  done();
});
