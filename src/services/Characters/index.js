import express from "express";
import { adminAuth } from "../../middlewares/adminAuth.js";
import authorizationMiddle from "../../middlewares/authorization.js";
import { gameOwnerAuth } from "../../middlewares/gameOwnerAuth.js";
import CharacterModel from "./schema.js"
import FCG from "fantasy-content-generator";

const characterRouter = express.Router() 


characterRouter
//gets all the characters currently in the database
.get("/", authorizationMiddle, adminAuth, async (req, res, next) => {
    try {
        const characters = await CharacterModel.find({});
        if(characters) {
            res.send(characters)
        }
    } catch(error) {
        console.log(error)
        res.status(400).send(error)
    }
  })

//create a new Character 
.post("/", authorizationMiddle, async (req, res, next) => {
  try {

    const newCharacter = new CharacterModel(req.body);
    req.body.owner = req.user._id
    const { _id } = await newCharacter.save();
    if (_id) {
      const savedChar = await CharacterModel.findById(_id)
      if (savedChar) {
        savedChar.editors.push(req.user._id)
        await savedChar.save()
        res.status(201).send({_id});    
      }
    }

  } catch(error) {
    console.log(error)
      res.status(400).send(error)
  }
  })



export default characterRouter