import Mongoose from "mongoose";
const { Schema, model } = Mongoose;

const gameSchema = new Schema(
    {
name: { type: String, required: true },
ownerId: {  type: Schema.Types.ObjectId, ref: 'User' },
characters:[ { type: Schema.Types.ObjectId, ref: 'Character' } ],
players: [ { type: Schema.Types.ObjectId, ref: 'User' } ]
},
 { timestamps: true }
)



export default model("Game", gameSchema)