import { matchMaker } from "colyseus";
import { DI } from "../config/database.config";
import { User } from "../entities/UserEntity";
import logger from "../helpers/logger";
import * as matchmakerHelper from "../helpers/matchmakerHelper";
import { QueryOrder, wrap } from '@mikro-orm/core';

export async function updateScore(req: any, res: any) {
    try {
        // Check if the necessary parameters exist
        if (!req.body.address || !req.body.score) {

            logger.error(`*** Update Score Error - Update score must have a wallet address and score!`);
            throw "Update score must have a wallet address and score!";
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
                        score: user.score
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