import { matchMaker } from "colyseus";
import { DI } from "../config/database.config";
import { User } from "../entities/UserEntity";
import logger from "../helpers/logger";
import * as matchmakerHelper from "../helpers/matchmakerHelper";
import { Vector3 } from "../helpers/Vectors";
import { QueryOrder, wrap } from '@mikro-orm/core';

const bcrypt = require('bcrypt');
const saltRounds = 10;
// Middleware
//===============================================
/**
 * Forces the email to be all lower case for consistency
 */
// export function prepEmail(req: any, res: any, next: any) {
//     if (req.body.email) {
//         try {
//             req.body.email = req.body.email.toLowerCase();
//         }
//         catch (err) {
//             logger.error(`Error converting email to lower case`);
//         }
//     }

//     next();
// }
//===============================================

/**
 * Update the user for a new room session; updates user's pending session Id and resets their position and rotation
 * @param user The user to update for the new session
 * @param sessionId The new session Id
 */
// function updateUserForNewSession(user: User, sessionId: string) {

//     user.pendingSessionId = sessionId;
//     user.pendingSessionTimestamp = Date.now();
//     user.updatedAt = new Date();

//     user.position = new Vector3(0,1,0);
//     user.rotation = new Vector3(0,0,0);
// }

/**
 * Simple function for creating a new user account.
 * With successful account creation the user will be matchmaked into the first room.
 * @param req 
 * @param res 
 * @returns 
 */
export async function signUp(req: any, res: any) {
    try {
        if (!req.body.address || !req.body.signature) {
            logger.error(`*** Sign Up Error - New user must have a wallet address, and signature!`);
            throw "New user must have a wallet address and signature!";
            return;
        }

        const userRepo = DI.em.fork().getRepository(User);

        // Check if an account with the email already exists
        let user = await userRepo.findOne({ address: req.body.address });

        if (!user) {

            let signature = await encryptPassword(req.body.signature);

            // Create a new user
            user = userRepo.create({
                address: req.body.address,
                signature: signature,
                score: 0,
                room: "Port1"
            });

            // // Match make the user into a room
            // seatReservation = await matchmakerHelper.matchMakeToRoom("lobby_room", user.progress);

            // updateUserForNewSession(user, seatReservation.sessionId);

            // Save the new user to the database
            await userRepo.persistAndFlush(user);
        }
        else {
            logger.error(`*** Sign Up Error - User with that wallet address already exists!`);
            throw "User with that wallet address already exists!";
            return;
        }

        const newUserObj = { ...user };
        delete newUserObj.signature; // Don't send the user's password back to the client

        res.status(200).json({
            error: false,
            output: {
                user: {
                    id: newUserObj._id,
                    walletAddress: newUserObj.address,
                    score: newUserObj.score,
                    room: newUserObj.room
                }
            }
        });
    }
    catch (error) {
        res.status(400).json({
            error: true,
            output: error
        });
    }
}

/**
 * Simple function to sign user in. 
 * It performs a simple check if the provided password matches in the user account.
 * With a successful sign in the user will be matchmaked into the room where they left off or into the first room.
 * @param req 
 * @param res 
 */
export async function logIn(req: any, res: any) {
    try {
        const userRepo = DI.em.fork().getRepository(User);

        // Check if the necessary parameters exist
        if (!req.body.address || !req.body.signature) {
            throw "Missing address or signature";
            return;
        }

        // Check if an account with the email exists
        let user: User = await userRepo.findOne({ address: req.body.address });

        if (user == null) {
            await signUp(req, res);
        } else {
            let validSignature: boolean = await compareEncrypted(req.body.signature, user.signature);

            if (!user || validSignature === false) {

                throw "Incorrect signature";
                return;
            }

            await userRepo.flush();
            let userCopy = { ...user };
            delete userCopy.signature;

            res.status(200).json({
                error: false,
                output: {
                    user: {
                        id: userCopy._id,
                        walletAddress: userCopy.address,
                        score: userCopy.score,
                        room: userCopy.room
                    }
                }
            });
        }
    }
    catch (error) {
        res.status(400).json({
            error: true,
            output: error
        });
    }
}

export async function updateRoom(req: any, res: any) {
    try {
        // Check if the necessary parameters exist
        if (!req.body.address || !req.body.room) {

            logger.error(`*** Update Room Error - Update room must have a wallet address and room!`);
            throw "Update room must have a wallet address and room!";
            return;
        }

        const userRepo = DI.em.fork().getRepository(User);


        // Check if an account with the email already exists
        const user = await userRepo.findOne({ address: req.body.address });

        if (user) {

            wrap(user).assign(req.body);
            await userRepo.flush();

            delete user.signature;

            res.status(200).json({
                error: false,
                output: {
                    user: {
                        id: user._id,
                        walletAddress: user.address,
                        room: user.room
                    }
                }
            });
        }
        else {
            logger.error(`*** Update Error - User with that email already exists!`);
            throw "User with that email already exists!";
            return;
        }

    }
    catch (error) {
        res.status(400).json({
            error: true,
            output: error
        });
    }
}

function encryptPassword(password: string): Promise<string> {
    console.log("Encrypting password: " + password);
    //Encrypt the password
    return bcrypt.hash(password, saltRounds);
}

function compareEncrypted(password: string, hash: string) {
    return bcrypt.compare(password, hash);
}
