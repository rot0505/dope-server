import { matchMaker } from "colyseus";
import { DI } from "../config/database.config";
import { User } from "../entities/UserEntity";
import logger from "../helpers/logger";
import * as matchmakerHelper from "../helpers/matchmakerHelper";
import { QueryOrder, wrap } from '@mikro-orm/core';
import { MaterialState } from "../entities/schema/MaterialState";

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
                        score: user.score,
                        material: user.material,
                        shipData: {
                            ShipName: user.shipData.ShipName,
                            MainData: user.shipData.MainData,
                            MotorData: user.shipData.MotorData,
                            CannonData: user.shipData.CannonData,
                            ShellData: user.shipData.ShellData
                        }
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

export async function updateMaterial(req: any, res: any) {
    try {
        // Check if the necessary parameters exist
        if (!req.body.address || !req.body.food || !req.body.wood || !req.body.metal || !req.body.rock || !req.body.gold) {

            logger.error(`*** Update material Error - Update material must have a wallet address and material!`);
            throw "Update material must have a wallet address and material!";
            return;
        }

        const userRepo = DI.em.fork().getRepository(User);


        // Check if an account with the email already exists
        const user = await userRepo.findOne({ address: req.body.address });

        if (user) {

            const material = new MaterialState().assign({
                food: parseFloat(req.body.food),
                wood: parseFloat(req.body.wood),
                metal: parseFloat(req.body.metal),
                rock: parseFloat(req.body.rock),
                gold: parseFloat(req.body.gold)
            })
            req.body.material = material

            delete req.body.food
            delete req.body.wood
            delete req.body.metal
            delete req.body.rock
            delete req.body.gold

            wrap(user).assign(req.body);
            await userRepo.flush();

            delete user.signature;

            res.status(200).json({
                error: false,
                output: {
                    user: {
                        id: user._id,
                        walletAddress: user.address,
                        score: user.score,
                        material: user.material,
                        shipData: {
                            ShipName: user.shipData.ShipName,
                            MainData: user.shipData.MainData,
                            MotorData: user.shipData.MotorData,
                            CannonData: user.shipData.CannonData,
                            ShellData: user.shipData.ShellData
                        }
                    }
                }
            });
        }
        else {
            logger.error(`*** Update Error - User with that address already exists!`);
            throw "User with that address already exists!";
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