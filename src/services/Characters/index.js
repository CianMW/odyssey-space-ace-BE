import express from "express";
import { adminAuth } from "../../middlewares/adminAuth.js";
import authorizationMiddle from "../../middlewares/authorization.js";
import { gameOwnerAuth } from "../../middlewares/gameOwnerAuth.js";
import CharacterModel from "./schema.js"
import FCG from "fantasy-content-generator";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";



cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET 
})

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "space-aces-characters",
  },
});


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
    newCharacter.owner = req.user._id
    newCharacter.avatar = `https://robohash.org/${req.body.characterName}`
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

  .put("/:id/upload", multer({ storage: cloudinaryStorage }).single("image"),
  async (req, res, next) => {
    try {
    console.log("this is the cloudinary api" , process.env.CLOUDINARY_URL)
    if(req.file) {
      const character = await CharacterModel.findById(req.params.id)
      character.avatar = req.file.path
      const addFileUrl = await character.save()
      res.send(addFileUrl)
    } else {
      console.log(error)
      res.send("Database Error Saving File")
    }
  } catch(error) {
    console.log(error)
    res.send("Error uploading file")
  }
  })



export default characterRouter