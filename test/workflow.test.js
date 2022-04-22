process.env.NODE_ENV = 'test';
// Setup file defines the test db and other configs
// Chai imports
const chai = require('chai');
const expect = chai.expect;
const should = chai.should();
const chaiHttp = require('chai-http'); // Plugin that allows https integration testing, it tests request & response
chai.use(chaiHttp);
const server = require('../server');

describe('/General, User and Artist tests', () => {
  it('Test default API Welcome route', (done) => {
    chai
      .request(server)
      .get('/api/welcome')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('object');
        const actualVal = res.body.message;
        // console.log("Body response: " + actualVal);
        expect(actualVal).to.be.equal('Welcome to my Artists MEN RESTful API');
        done(); // This makes sure the http request completes first and then the assertions are done
      });
  });
  //--------------------------  Register User and Login ---------------------------
  it('Should REGISTER User and LOGIN', (done) => {
    let user = {
      name: 'Test user',
      email: 'test@test.com',
      password: '123456',
    };
    chai
      .request(server)
      .post('/api/user/register')
      .send(user)
      .end((err, res) => {
        // Asserts
        // console.log("***** Body response: " + res.body.error);
        expect(res.status).to.be.equal(200);
        expect(res.body).to.be.a('object');
        expect(res.body.error).to.be.equal(null);
        // 2) Login user
        chai
          .request(server)
          .post('/api/user/login')
          .send({
            email: 'test@test.com',
            password: '123456',
          })
          .end((err, res) => {
            // Asserts
            // console.log("********* Body response: " + res.body.error);
            expect(res.status).to.be.equal(200);
            expect(res.body.error).to.be.equal(null);
            done();
          });
      });
  });
  //--------------------------  Register User and Login with invalid Email --------
  it('Should not REGISTER User and LOGIN with invalid Email', (done) => {
    let user = {
      name: 'Test user',
      email: 'test@test.com',
      password: '123456',
    };
    chai
      .request(server)
      .post('/api/user/register')
      .send(user)
      .end((err, res) => {
        // Asserts
        expect(res.status).to.be.equal(200);
        expect(res.body).to.be.a('object');
        expect(res.body.error).to.be.equal(null);
        // 2) Login user
        chai
          .request(server)
          .post('/api/user/login')
          .send({
            email: 'testttt@test.com',
            password: '123456',
          })
          .end((err, res) => {
            // Asserts
            expect(res.status).to.be.equal(400);
            expect(res.body).to.be.a('object');
            expect(res.body.error).to.be.equal("Email doesn't exist");
            done();
          });
      });
  });
  //--------------------------  Register User and Login with invalid Password --------
  it('Should not REGISTER User and LOGIN with invalid Password', (done) => {
    let user = {
      name: 'Test user',
      email: 'test@test.com',
      password: '123456',
    };
    chai
      .request(server)
      .post('/api/user/register')
      .send(user)
      .end((err, res) => {
        // Asserts
        expect(res.status).to.be.equal(200);
        expect(res.body).to.be.a('object');
        expect(res.body.error).to.be.equal(null);
        // 2) Login user
        chai
          .request(server)
          .post('/api/user/login')
          .send({
            email: 'test@test.com',
            password: '523457',
          })
          .end((err, res) => {
            // Asserts
            expect(res.status).to.be.equal(400);
            expect(res.body).to.be.a('object');
            expect(res.body.error).to.be.equal('Incorrect password');
            done();
          });
      });
  });
  //--------------------------  Register User that already exists ----------------------------
  // Error 400. "Email already exists"
  it('Should not REGISTER User that already exists', (done) => {
    let user = {
      name: 'Test user',
      email: 'test@test.com',
      password: '123456',
    };
    chai
      .request(server)
      .post('/api/user/register')
      .send(user)
      .end((err, res) => {
        // Asserts
        expect(res.status).to.be.equal(200);
        expect(res.body).to.be.a('object');
        expect(res.body.error).to.be.equal(null);
        // 2) register the same user again
        chai
          .request(server)
          .post('/api/user/register')
          .send(user)
          .end((err, res) => {
            // Asserts
            expect(res.status).to.be.equal(400);
            expect(res.body).to.be.a('object');
            expect(res.body.error).to.be.equal('Email already exists');
            done();
          });
      });
  });
  // GET ALL the Artists
  it('Should GET ALL the Artists', (done) => {
    chai
      .request(server)
      .get('/api/artists')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a('array');
        res.body.length.should.be.eql(0);
        done();
      });
  });
  //--------------------------  Register + Login + Create Artist + Verify 1 in DB ----------------------
  // Before creating the artist, we need to register a user and login to get the token
  it('Should REGISTER+LOGIN User, CREATE a valid Artist and verify 1 ARTIST in the DB', (done) => {
    let user = {
      name: 'Test user',
      email: 'test@test.com',
      password: '123456',
    };

    // 1) Register user
    chai
      .request(server)
      .post('/api/user/register')
      .send(user)
      .end((err, res) => {
        // Asserts
        expect(res.status).to.be.equal(200);
        expect(res.body).to.be.a('object');
        expect(res.body.error).to.be.equal(null);

        // 2) Login user
        chai
          .request(server)
          .post('/api/user/login')
          .send({
            email: 'test@test.com',
            password: '123456',
          })
          .end((err, res) => {
            // Asserts
            expect(res.status).to.be.equal(200);
            expect(res.body.error).to.be.equal(null);
            let token = res.body.data.token;
            // 3) Create artist
            let artist = {
              name: 'Test name',
              info: 'This is a test info',
              genre: 'Test genre',
              photo: 'Test photo',
              listeners: 'Test listeners',
              albums: ['Test album'],
              top_tracks: ['Test top track'],
              similar_to: ['Test similar to'],
            };
            chai
              .request(server)
              .post('/api/artists')
              .set({ 'auth-token': token })
              .send(artist)
              .end((err, res) => {
                // 4) Verify that there's 1 artist and that it has the same values
                res.should.have.status(201);
                expect(res.body).to.be.a('array');
                expect(res.body.length).to.be.eql(1);
                let savedArtist = res.body[0];
                expect(savedArtist.name).to.be.equal(artist.name);
                expect(savedArtist.info).to.be.equal(artist.info);
                expect(savedArtist.genre).to.be.equal(artist.genre);
                expect(savedArtist.photo).to.be.equal(artist.photo);
                expect(savedArtist.listeners).to.be.equal(artist.listeners);
                expect(savedArtist.albums).to.eql(artist.albums);
                expect(savedArtist.top_tracks).to.eql(artist.top_tracks);
                expect(savedArtist.similar_to).to.eql(artist.similar_to);
                done();
              });
          });
      });
  });
  //--------------------------  Register + Login + Create Invalid Artist (no name) ----------------------
  it('Should REGISTER+LOGIN User, CREATE invalid Artist (no name property)', (done) => {
    let user = {
      name: 'Test user',
      email: 'test@test.com',
      password: '123456',
    };

    // 1) Register user
    chai
      .request(server)
      .post('/api/user/register')
      .send(user)
      .end((err, res) => {
        // Asserts
        expect(res.status).to.be.equal(200);
        expect(res.body).to.be.a('object');
        expect(res.body.error).to.be.equal(null);

        // 2) Login user
        chai
          .request(server)
          .post('/api/user/login')
          .send({
            email: 'test@test.com',
            password: '123456',
          })
          .end((err, res) => {
            // Asserts
            expect(res.status).to.be.equal(200);
            expect(res.body.error).to.be.equal(null);
            let token = res.body.data.token;
            // 3) Create artist
            let artist = {
              // name: 'Test name',
              info: 'This is a test info',
              genre: 'Test genre',
              photo: 'Test photo',
              listeners: 'Test listeners',
              albums: ['Test album'],
              top_tracks: ['Test top track'],
              similar_to: ['Test similar to'],
            };
            chai
              .request(server)
              .post('/api/artists')
              .set({ 'auth-token': token })
              .send(artist)
              .end((err, res) => {
                res.should.have.status(500);
                res.body.should.have.property('message');
                expect(res.body.message).to.include(
                  'artist validation failed: name'
                );
                // console.log('*********** ' + res.body.message);
                done();
              });
          });
      });
  });
  //--------------------------  Register + Login + Create Artist + Get by Id ----------------------
  it('Should REGISTER+LOGIN User, CREATE a valid Artist and GET By Id', (done) => {
    let user = {
      name: 'Test user',
      email: 'test@test.com',
      password: '123456',
    };

    // 1) Register user
    chai
      .request(server)
      .post('/api/user/register')
      .send(user)
      .end((err, res) => {
        // Asserts
        expect(res.status).to.be.equal(200);
        expect(res.body).to.be.a('object');
        expect(res.body.error).to.be.equal(null);

        // 2) Login user
        chai
          .request(server)
          .post('/api/user/login')
          .send({
            email: 'test@test.com',
            password: '123456',
          })
          .end((err, res) => {
            // Asserts
            expect(res.status).to.be.equal(200);
            expect(res.body.error).to.be.equal(null);
            let token = res.body.data.token;
            // 3) Create artist
            let artist = {
              name: 'Test name',
              info: 'This is a test info',
              genre: 'Test genre',
              photo: 'Test photo',
              listeners: 'Test listeners',
              albums: ['Test album'],
              top_tracks: ['Test top track'],
              similar_to: ['Test similar to'],
            };
            chai
              .request(server)
              .post('/api/artists')
              .set({ 'auth-token': token })
              .send(artist)
              .end((err, res) => {
                // 4) Verify that there's 1 artist and that it has the same values
                res.should.have.status(201);
                expect(res.body).to.be.a('array');
                expect(res.body.length).to.be.eql(1);
                let savedArtist = res.body[0];
                // console.log("********* SAVED ARTIST ID: " + savedArtist._id);
                expect(savedArtist.name).to.be.equal(artist.name);
                expect(savedArtist.info).to.be.equal(artist.info);
                expect(savedArtist.genre).to.be.equal(artist.genre);
                expect(savedArtist.photo).to.be.equal(artist.photo);
                expect(savedArtist.listeners).to.be.equal(artist.listeners);
                expect(savedArtist.albums).to.eql(artist.albums);
                expect(savedArtist.top_tracks).to.eql(artist.top_tracks);
                expect(savedArtist.similar_to).to.eql(artist.similar_to);

                // 5) Get Artist By ID
                chai
                  .request(server)
                  .get('/api/artists/' + savedArtist._id)
                  .end((err, res) => {
                    res.should.have.status(200);
                    // console.log("*********** " + res.body.name);
                    expect(res.body).to.be.a('object');
                    res.body.should.have.property('name');
                    res.body.should.have.property('info');
                    res.body.should.have.property('genre');
                    res.body.should.have.property('photo');
                    res.body.should.have.property('listeners');
                    res.body.should.have.property('albums');
                    res.body.should.have.property('top_tracks');
                    res.body.should.have.property('similar_to');
                    res.body.should.have.property('_id').eql(savedArtist._id);
                    done();
                  });
              });
          });
      });
  });
  //--------------------------  Register + Login + Create Artist + Get by wrong Id ----------------------
  it('Should REGISTER+LOGIN User, CREATE a valid Artist and GET By wrong Id', (done) => {
    let user = {
      name: 'Test user',
      email: 'test@test.com',
      password: '123456',
    };

    // 1) Register user
    chai
      .request(server)
      .post('/api/user/register')
      .send(user)
      .end((err, res) => {
        // Asserts
        expect(res.status).to.be.equal(200);
        expect(res.body).to.be.a('object');
        expect(res.body.error).to.be.equal(null);

        // 2) Login user
        chai
          .request(server)
          .post('/api/user/login')
          .send({
            email: 'test@test.com',
            password: '123456',
          })
          .end((err, res) => {
            // Asserts
            expect(res.status).to.be.equal(200);
            expect(res.body.error).to.be.equal(null);
            let token = res.body.data.token;
            // 3) Create artist
            let artist = {
              name: 'Test name',
              info: 'This is a test info',
              genre: 'Test genre',
              photo: 'Test photo',
              listeners: 'Test listeners',
              albums: ['Test album'],
              top_tracks: ['Test top track'],
              similar_to: ['Test similar to'],
            };
            chai
              .request(server)
              .post('/api/artists')
              .set({ 'auth-token': token })
              .send(artist)
              .end((err, res) => {
                // 4) Verify that there's 1 artist and that it has the same values
                res.should.have.status(201);
                expect(res.body).to.be.a('array');
                expect(res.body.length).to.be.eql(1);
                let savedArtist = res.body[0];
                expect(savedArtist.name).to.be.equal(artist.name);
                expect(savedArtist.info).to.be.equal(artist.info);
                expect(savedArtist.genre).to.be.equal(artist.genre);
                expect(savedArtist.photo).to.be.equal(artist.photo);
                expect(savedArtist.listeners).to.be.equal(artist.listeners);
                expect(savedArtist.albums).to.eql(artist.albums);
                expect(savedArtist.top_tracks).to.eql(artist.top_tracks);
                expect(savedArtist.similar_to).to.eql(artist.similar_to);

                // 5) Get Artist By ID
                chai
                  .request(server)
                  .get('/api/artists/' + '1sad234fe5')
                  .end((err, res) => {
                    expect(res.status).to.be.oneOf([404, 500]);
                    res.body.should.have.property('message');
                    // console.log("*********** " + res.body.message);

                    done();
                  });
              });
          });
      });
  });
  //--------------------------  Register + Login + Create Artist + Update Artist ----------------------
  it('Should REGISTER+LOGIN User, CREATE a valid Artist and Update it', (done) => {
    let user = {
      name: 'Test user',
      email: 'test@test.com',
      password: '123456',
    };

    // 1) Register user
    chai
      .request(server)
      .post('/api/user/register')
      .send(user)
      .end((err, res) => {
        // Asserts
        expect(res.status).to.be.equal(200);
        expect(res.body).to.be.a('object');
        expect(res.body.error).to.be.equal(null);

        // 2) Login user
        chai
          .request(server)
          .post('/api/user/login')
          .send({
            email: 'test@test.com',
            password: '123456',
          })
          .end((err, res) => {
            // Asserts
            expect(res.status).to.be.equal(200);
            expect(res.body.error).to.be.equal(null);
            let token = res.body.data.token;
            // 3) Create artist
            let artist = {
              name: 'Test name',
              info: 'This is a test info',
              genre: 'Test genre',
              photo: 'Test photo',
              listeners: 'Test listeners',
              albums: ['Test album'],
              top_tracks: ['Test top track'],
              similar_to: ['Test similar to'],
            };
            chai
              .request(server)
              .post('/api/artists')
              .set({ 'auth-token': token })
              .send(artist)
              .end((err, res) => {
                // 4) Verify that there's 1 artist and that it has the same values
                res.should.have.status(201);
                expect(res.body).to.be.a('array');
                expect(res.body.length).to.be.eql(1);
                let savedArtist = res.body[0];
                // console.log("********* SAVED ARTIST ID: " + savedArtist._id);
                expect(savedArtist.name).to.be.equal(artist.name);
                expect(savedArtist.info).to.be.equal(artist.info);
                expect(savedArtist.genre).to.be.equal(artist.genre);
                expect(savedArtist.photo).to.be.equal(artist.photo);
                expect(savedArtist.listeners).to.be.equal(artist.listeners);
                expect(savedArtist.albums).to.eql(artist.albums);
                expect(savedArtist.top_tracks).to.eql(artist.top_tracks);
                expect(savedArtist.similar_to).to.eql(artist.similar_to);

                // 5) Update Artist
                let artistUpdated = {
                  name: 'Test name 2',
                  info: 'This is a test info 2',
                  genre: 'Test genre 2',
                  photo: 'Test photo 2',
                  listeners: 'Test listeners 2',
                  albums: ['Test album 2'],
                  top_tracks: ['Test top track 2'],
                  similar_to: ['Test similar to 2'],
                };
                chai
                  .request(server)
                  .put('/api/artists/' + savedArtist._id)
                  .set({ 'auth-token': token })
                  .send(artistUpdated)
                  .end((err, res) => {
                    res.should.have.status(200);
                    // console.log('*********** ' + res.body.message);
                    res.body.should.have.property('message');
                    expect(res.body.message).to.be.equal(
                      'Artist successfully updated.'
                    );

                    done();
                  });
              });
          });
      });
  });
  //--------------------------  Register + Login + Create Artist + Update Artist by wrong ID ----------------------
  it('Should REGISTER+LOGIN User, CREATE a valid Artist and Update it by wrong ID', (done) => {
    let user = {
      name: 'Test user',
      email: 'test@test.com',
      password: '123456',
    };

    // 1) Register user
    chai
      .request(server)
      .post('/api/user/register')
      .send(user)
      .end((err, res) => {
        // Asserts
        expect(res.status).to.be.equal(200);
        expect(res.body).to.be.a('object');
        expect(res.body.error).to.be.equal(null);

        // 2) Login user
        chai
          .request(server)
          .post('/api/user/login')
          .send({
            email: 'test@test.com',
            password: '123456',
          })
          .end((err, res) => {
            // Asserts
            expect(res.status).to.be.equal(200);
            expect(res.body.error).to.be.equal(null);
            let token = res.body.data.token;
            // 3) Create artist
            let artist = {
              name: 'Test name',
              info: 'This is a test info',
              genre: 'Test genre',
              photo: 'Test photo',
              listeners: 'Test listeners',
              albums: ['Test album'],
              top_tracks: ['Test top track'],
              similar_to: ['Test similar to'],
            };
            chai
              .request(server)
              .post('/api/artists')
              .set({ 'auth-token': token })
              .send(artist)
              .end((err, res) => {
                // 4) Verify that there's 1 artist and that it has the same values
                res.should.have.status(201);
                expect(res.body).to.be.a('array');
                expect(res.body.length).to.be.eql(1);
                let savedArtist = res.body[0];
                // console.log("********* SAVED ARTIST ID: " + savedArtist._id);
                expect(savedArtist.name).to.be.equal(artist.name);
                expect(savedArtist.info).to.be.equal(artist.info);
                expect(savedArtist.genre).to.be.equal(artist.genre);
                expect(savedArtist.photo).to.be.equal(artist.photo);
                expect(savedArtist.listeners).to.be.equal(artist.listeners);
                expect(savedArtist.albums).to.eql(artist.albums);
                expect(savedArtist.top_tracks).to.eql(artist.top_tracks);
                expect(savedArtist.similar_to).to.eql(artist.similar_to);

                // 5) Update Artist
                let artistUpdated = {
                  name: 'Test name 2',
                  info: 'This is a test info 2',
                  genre: 'Test genre 2',
                  photo: 'Test photo 2',
                  listeners: 'Test listeners 2',
                  albums: ['Test album 2'],
                  top_tracks: ['Test top track 2'],
                  similar_to: ['Test similar to 2'],
                };
                chai
                  .request(server)
                  .put('/api/artists/' + 'as2skjajk3')
                  .set({ 'auth-token': token })
                  .send(artistUpdated)
                  .end((err, res) => {
                    expect(res.status).to.be.oneOf([404, 500]);
                    res.body.should.have.property('message');
                    // console.log('*********** ' + res.body.message);
                    done();
                  });
              });
          });
      });
  });
  //--------------------------  Register + Login + Create Artist + Delete Artist ----------------------
  it('Should REGISTER+LOGIN User, CREATE a valid Artist and Delete it', (done) => {
    let user = {
      name: 'Test user',
      email: 'test@test.com',
      password: '123456',
    };

    // 1) Register user
    chai
      .request(server)
      .post('/api/user/register')
      .send(user)
      .end((err, res) => {
        // Asserts
        expect(res.status).to.be.equal(200);
        expect(res.body).to.be.a('object');
        expect(res.body.error).to.be.equal(null);

        // 2) Login user
        chai
          .request(server)
          .post('/api/user/login')
          .send({
            email: 'test@test.com',
            password: '123456',
          })
          .end((err, res) => {
            // Asserts
            expect(res.status).to.be.equal(200);
            expect(res.body.error).to.be.equal(null);
            let token = res.body.data.token;
            // 3) Create artist
            let artist = {
              name: 'Test name',
              info: 'This is a test info',
              genre: 'Test genre',
              photo: 'Test photo',
              listeners: 'Test listeners',
              albums: ['Test album'],
              top_tracks: ['Test top track'],
              similar_to: ['Test similar to'],
            };
            chai
              .request(server)
              .post('/api/artists')
              .set({ 'auth-token': token })
              .send(artist)
              .end((err, res) => {
                // 4) Verify that there's 1 artist and that it has the same values
                res.should.have.status(201);
                expect(res.body).to.be.a('array');
                expect(res.body.length).to.be.eql(1);
                let savedArtist = res.body[0];
                // console.log("********* SAVED ARTIST ID: " + savedArtist._id);
                expect(savedArtist.name).to.be.equal(artist.name);
                expect(savedArtist.info).to.be.equal(artist.info);
                expect(savedArtist.genre).to.be.equal(artist.genre);
                expect(savedArtist.photo).to.be.equal(artist.photo);
                expect(savedArtist.listeners).to.be.equal(artist.listeners);
                expect(savedArtist.albums).to.eql(artist.albums);
                expect(savedArtist.top_tracks).to.eql(artist.top_tracks);
                expect(savedArtist.similar_to).to.eql(artist.similar_to);

                // 5) Delete Artist
                chai
                  .request(server)
                  .delete('/api/artists/' + savedArtist._id)
                  .set({ 'auth-token': token })
                  .end((err, res) => {
                    res.should.have.status(200);
                    // console.log('*********** ' + res.body.message);
                    res.body.should.have.property('message');
                    expect(res.body.message).to.be.equal(
                      'Artist successfully deleted.'
                    );
                    done();
                  });
              });
          });
      });
  });
  //--------------------------  Register + Login + Create Artist + Delete Artist by wrong ID ----------------------
  it('Should REGISTER+LOGIN User, CREATE a valid Artist and Delete it by wrong ID', (done) => {
    let user = {
      name: 'Test user',
      email: 'test@test.com',
      password: '123456',
    };

    // 1) Register user
    chai
      .request(server)
      .post('/api/user/register')
      .send(user)
      .end((err, res) => {
        // Asserts
        expect(res.status).to.be.equal(200);
        expect(res.body).to.be.a('object');
        expect(res.body.error).to.be.equal(null);

        // 2) Login user
        chai
          .request(server)
          .post('/api/user/login')
          .send({
            email: 'test@test.com',
            password: '123456',
          })
          .end((err, res) => {
            // Asserts
            expect(res.status).to.be.equal(200);
            expect(res.body.error).to.be.equal(null);
            let token = res.body.data.token;
            // 3) Create artist
            let artist = {
              name: 'Test name',
              info: 'This is a test info',
              genre: 'Test genre',
              photo: 'Test photo',
              listeners: 'Test listeners',
              albums: ['Test album'],
              top_tracks: ['Test top track'],
              similar_to: ['Test similar to'],
            };
            chai
              .request(server)
              .post('/api/artists')
              .set({ 'auth-token': token })
              .send(artist)
              .end((err, res) => {
                // 4) Verify that there's 1 artist and that it has the same values
                res.should.have.status(201);
                expect(res.body).to.be.a('array');
                expect(res.body.length).to.be.eql(1);
                let savedArtist = res.body[0];
                // console.log('********* SAVED ARTIST ID: ' + savedArtist._id);
                expect(savedArtist.name).to.be.equal(artist.name);
                expect(savedArtist.info).to.be.equal(artist.info);
                expect(savedArtist.genre).to.be.equal(artist.genre);
                expect(savedArtist.photo).to.be.equal(artist.photo);
                expect(savedArtist.listeners).to.be.equal(artist.listeners);
                expect(savedArtist.albums).to.eql(artist.albums);
                expect(savedArtist.top_tracks).to.eql(artist.top_tracks);
                expect(savedArtist.similar_to).to.eql(artist.similar_to);

                // 5) Delete Artist
                chai
                  .request(server)
                  .delete('/api/artists/' + 'hjbhbhk2')
                  .set({ 'auth-token': token })
                  .end((err, res) => {
                    expect(res.status).to.be.oneOf([404, 500]);
                    res.body.should.have.property('message');
                    // console.log('*********** ' + res.body.message);
                    done();
                  });
              });
          });
      });
  });
});
