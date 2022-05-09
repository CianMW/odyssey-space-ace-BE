import express from "express";
import { adminAuth } from "../../middlewares/adminAuth.js";
import authorizationMiddle from "../../middlewares/authorization.js";
import { gameOwnerAuth } from "../../middlewares/gameOwnerAuth.js";
import GameModel from "./schema.js"
import UserModel from ".././users/schema.js"
import createHttpError from "http-errors";
const gamesRouter = express.Router() 


gamesRouter
//gets all the games currently in the database
.get("/", authorizationMiddle, adminAuth, async (req, res, next) => {
    try {
        const game = await GameModel.find({});
        if(game) {
            res.send(game)
        }
    } catch(error) {
        console.log(error)
        res.status(400).send(error)
    }
  })
//create a new game  
.post("/", authorizationMiddle, async (req, res, next) => {
  try {
      console.log("the user is : ", req.user)
      const body = req.body
      console.log("THIS IS THE BODY", body)
      req.body.ownerId = req.user._id

      let playerIds = []
      for (let i = 0; i < req.body.players.length; i++){
        let userId = await UserModel.find({email: req.body.players[i]})
        console.log("found Player!!!", userId)
        if (userId.length > 0) {
          playerIds.push(userId[0]._id)

        }
      }
      req.body.players = playerIds
    const newGame = new GameModel(body);
    const { _id } = await newGame.save();
    if (_id) {
      const userToUpdate = await UserModel.findById(req.user._id.toString())
      if (userToUpdate){
        console.log("THE USER !!!!",userToUpdate)
        userToUpdate.games.push(_id)
        await userToUpdate.save()
      } else {
        next(createHttpError(400, "There was a problem finding user"))
      }
      res.status(201).send({_id});    
    }

  } catch(error) {
    console.log(error)
      res.status(400).send(error)
  }
  })


// The user can get their own games and games they play in
// first get games where user is the owner
.get("/me", authorizationMiddle, async (req, res, next) => {
  try {
    if (req.user) {
        const games = await GameModel.find({ownerId: req.user._id });
        const playerGames = await GameModel.find({players: req.user._id });
        console.log("the player games:", playerGames)
        games.push(playerGames)
      res.send(games);
    } else {
      next(createHttpError(404, `User with the ${id} not found!`));
    }
  } catch (error) {
    next(error);
  }
})

//get game by id
.get("/:gameId", authorizationMiddle, adminAuth, async (req, res, next) => {
  try {
    const id = req.params.gameId;

    const game = await UserModel.findById(id);
    if (game) {
      res.send(game);
    } else {
      next(createHttpError(404, `Game with the ${id} not found!`));
    }
  } catch (error) {
    next(error);
  }
})

//delete specific Game (admin)
.delete("/:gameId", authorizationMiddle, gameOwnerAuth, async (req, res, next) => {
  try {
    const id = req.params.gameId;
    const deletedGame = await GameModel.findByIdAndDelete(id);

    if (deletedGame) {
      res.status(204).send(`Game with id ${id} has been deleted`);
    } else {
      res.send(`User with id ${id} not found`);
    }
  } catch (error) {
    next(error);
  }
})

//---update game by id---
//needs custom middleware to check if authorized user is owner
// add user to player list
.put("/:gameId/addUser/:userId", authorizationMiddle, gameOwnerAuth, async (req, res, next) => {
  try {
    const gameId = req.params.gameId;
    const userId = req.params.userId;

    const foundGame = await GameModel.findById(gameId);
    const addPlayer = foundGame.players.push(userId)
    const updatedGame = await foundGame.save();

    if (updatedGame) {
      res.send(updatedGame);
    } else {
      next(createHttpError(404, `User with the id: ${id} not found!`));
    }
  } catch (error) {
    next(error);
  }
})


// remove player from player list
.put("/:gameId/removeUser/:userId", authorizationMiddle, gameOwnerAuth, async (req, res, next) => {
  try {
    const gameId = req.params.gameId;
    const userId = req.params.userId;

    const foundGame = await GameModel.findById(gameId);
    const newPlayerList = foundGame.players.filter((player) => player.toString() !== userId)
    foundGame.players = newPlayerList
    const updatedGame = await foundGame.save();

    if (updatedGame) {
      res.send(updatedGame);
    } else {
      next(createHttpError(404, `User with the id: ${id} not found!`));
    }
  } catch (error) {
    next(error);
  }
})

// Add Character to game
.put("/:gameId/addCharacter/:characterId", authorizationMiddle, gameOwnerAuth, async (req, res, next) => {
  try {
    const gameId = req.params.gameId;
    const characterId = req.params.characterId;

    const foundGame = await GameModel.findById(gameId);
    if (foundGame) {
      foundGame.characters.push(characterId)
      const updatedGame = await foundGame.save();
  
      if (updatedGame) {
        res.send(updatedGame);
      } else {
        next(createHttpError(404, `User with the id: ${id} not found!`));
      }
    }
  } catch (error) {
    next(error);
  }
})






export default gamesRouter