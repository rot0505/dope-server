import { Schema, type } from "@colyseus/schema";

export class MaterialState extends Schema {
  @type("number") food: number = 0;
  @type("number") wood: number = 0;
  @type("number") metal: number = 0;
  @type("number") rock: number = 0;
  @type("number") gold: number = 0;
}