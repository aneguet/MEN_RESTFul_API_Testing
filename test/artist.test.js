// Setup file defines the test db and other configs
// Chai imports
const chai = require("chai");
const expect = chai.expect;
const should = chai.should();
const chaiHttp = require("chai-http"); // Plugin that allows https integration testing, it tests request & response
chai.use(chaiHttp);
const server = require("../server");

describe("/First Test Collection", () => {
  // All Individual tests
  // ---------------- ** API Tests (api functionality (server.js)) ---------
  it("Test default API Welcome route", (done) => {
    // We request from the server the welcome route
    // app.get("/api/welcome",(req,res)=>{}
    chai
      .request(server)
      .get("/api/welcome")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("object"); // Body response should be an object
        const actualVal = res.body.message;
        console.log("Body response: " + actualVal);
        expect(actualVal).to.be.equal("Welcome to my Artists MEN RESTful API"); // Object received should have a specific value
        done(); // This makes sure the http request completes first and then the assertions are done
      });
  });
  // -----------------------------------------------------------------------
  it("Verifies that we have 0 artists in the database", (done) => {
    chai
      .request(server)
      .get("/api/artists")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array"); // If it is empty it will always be an array
        res.body.length.should.be.eql(0);
        done(); // Run it especially if we have extra cases after this assertion
      });
  });
  // -------------------------------------------------------------------------------
  it("Should POST a valid Artist", (done) => {
    let artist = {
      name: "Test name",
      info: "This is a test info",
      genre: "Test genre",
      photo: "Test photo",
      listeners: "Test listeners",
      albums: ["Test album"],
      top_tracks: ["Test top track"],
      similar_to: ["Test similar to"],
    };
    chai
      .request(server)
      .post("/api/artists")
      .send(artist)
      .end((err, res) => {
        console.log("Body response: " + res.body[0].name);
        res.should.have.status(201);
        done(); // Run it especially if we have extra cases after this assertion
      });
  });
  // -----------------------------------------------------------------------
  it("Verifies that we have 1 artist in the database", (done) => {
    chai
      .request(server)
      .get("/api/artists")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array"); // If it is empty it will always be an array
        res.body.length.should.be.eql(1);
        done(); // Run it especially if we have extra cases after this assertion
      });
  });
  // -------------------------------------------------------------------------------
});
