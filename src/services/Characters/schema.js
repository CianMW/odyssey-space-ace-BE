import Mongoose from "mongoose";
const { Schema, model } = Mongoose;

const characterSchema = new Schema (
    {
editors: [ { type: Schema.Types.ObjectId, ref: 'User' } ],
avatar: {type: String},
characterName: { type: String, required: true},
skill: { type: String },
style: { type: String },
moxie: { type: Number },
smarts: { type: Number },
wiggles: { type: Number },
friends: { type: Number },
pockets: { type: Number },
gumption: { currentGumption: {type: Number},
            maxGumption: {type:Number, default: 6} 
        },
ailments: { 
    shaken: {type: Boolean, default: false},
    stressed: {type: Boolean, default: false},
    frustrated: {type: Boolean, default: false},
    confused: {type: Boolean, default: false},
    frightened: {type: Boolean, default: false},
    exhausted: {type: Boolean, default: false},
        },
grit: {
    type: Number, default: 0}
},
 { timestamps: true }
)



export default model("Character", characterSchema)