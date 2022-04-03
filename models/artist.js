// Dependencies
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
let artistSchema = new Schema(
{
    name: {type:String, required: true},
    info: {type:String, required: true},
    genre: {type:String, required: true},
    photo: {type:String, required: true},
    listeners: {type:String, required: true},
    albums: {type:Array, required: true},
    top_tracks: {type:Array, required: true},
    similar_to: {type:Array, required: true}
});

// enable __v update state > We'll know when an artist is updated
artistSchema.pre('findOneAndUpdate', function() {
    const update = this.getUpdate();
    if (update.__v != null) {
      delete update.__v;
    }
    const keys = ['$set', '$setOnInsert'];
    for (const key of keys) {
      if (update[key] != null && update[key].__v != null) {
        delete update[key].__v;
        if (Object.keys(update[key]).length === 0) {
          delete update[key];
        }
      }
    }
    update.$inc = update.$inc || {};
    update.$inc.__v = 1;
  });



//Export
//artist > Name of the collection in the db
module.exports = mongoose.model("artist", artistSchema);