// We switch to the test DB
process.env.NODE_ENV = "test";
// Import models
const Artist = require("../models/artist");
const User = require("../models/user");

//clean up the database before and after each test
// // before((done) => {
// beforeEach((done) => {
//   Artist.deleteMany({}, function (err) {});
//   User.deleteMany({}, function (err) {});
//   done();
// });
// // after((done) => {
// afterEach((done) => {
//   Artist.deleteMany({}, function (err) {});
//   User.deleteMany({}, function (err) {});
//   done();
// });
