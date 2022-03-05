import express from "express";
import { adminAuth } from "../../middlewares/adminAuth.js";
import authorizationMiddle from "../../middlewares/authorization.js";
import UserModel from "./schema.js"
import CharacterModel from "../Characters/schema.js"

const usersRouter = express.Router() 


usersRouter
.get("/", authorizationMiddle, adminAuth, async (req, res, next) => {
    try {
        const user = await UserModel.find({});
        if(user) {
            res.send(user)
        }
    } catch(error) {
        res.status(400).send(error)
    }
  })
.post("/", async (req, res, next) => {
  try {
    const newUser = new UserModel(req.body);
    const { _id } = await newUser.save();
      res.status(201).send({_id});    
  } catch(error) {
    console.log(error)
      res.status(400).send(error)
      }
  })

  //=====================================================================  


// The user can get their own details
.get("/me", authorizationMiddle, async (req, res, next) => {
  try {
    if (req.user) {
      const usersCharacters = await CharacterModel.find({editors: req.user._id})
      req.user.characters = usersCharacters
      await res.send(req.user);

    } else {
      next(createHttpError(404, `User with the ${id} not found!`));
    }
  } catch (error) {
    next(error);
  }
})

//get by id
.get("/:userId", authorizationMiddle, adminAuth, async (req, res, next) => {
  try {
    const id = req.params.userId;

    const user = await UserModel.findById(id);
    if (user) {
      res.send(user);
    } else {
      next(createHttpError(404, `User with the ${id} not found!`));
    }
  } catch (error) {
    next(error);
  }
})


//delete current User
.delete("/me", authorizationMiddle, async (req, res, next) => {
  try {
    const id = req.user._id;
    const deletedUser = await UserModel.deleteOne({ id: id });

    if (deletedUser) {
      res.status(204).send(`user with id ${id} has been deleted`);
    } else {
      res.send(`User with id ${id} not found`);
    }
  } catch (error) {
    next(error);
  }
})

//delete specific user
.delete("/:userId", authorizationMiddle, adminAuth, async (req, res, next) => {
  try {
    const id = req.params.userId;
    const deletedUser = await UserModel.deleteOne({ id: id });

    if (deletedUser) {
      res.status(204).send(`User with id ${id} has been deleted`);
    } else {
      res.send(`User with id ${id} not found`);
    }
  } catch (error) {
    next(error);
  }
})

// user may update themselves
.put("/me", authorizationMiddle, async (req, res, next) => {
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true }
    );

    if (updatedUser) {
      res.send(updatedUser);
    } else {
      next(createHttpError(404, `User with the id: ${id} not found!`));
    }
  } catch (error) {
    next(error);
  }
})

.put("/:userId", authorizationMiddle, adminAuth, async (req, res, next) => {
  try {
    const id = req.params.userId;
    const updatedUser = await UserModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (updatedUser) {
      res.send(updatedUser);
    } else {
      next(createHttpError(404, `User with the id: ${id} not found!`));
    }
  } catch (error) {
    next(error);
  }
})






export default usersRouter