import { Schema, type, ArraySchema } from "@colyseus/schema";

export class MainD extends Schema {
  @type("number") slotNum: number = 0;
  @type("string") mainType: string = "";
}

export class MotorD extends Schema {
  @type("number") slotNum: number = 0;
  @type("string") motorType: string = "";
  @type("number") health: number = 0.0;
}

export class CannonD extends Schema {
  @type("number") slotNum: number = 0;
  @type("string") cannonType: string = "";
  @type("number") health: number = 0.0;
}

export class ShellD extends Schema {
  @type("string") shellType: string = "";
  @type("number") amount: number = 0;
}

export class ShipState extends Schema {
  @type("string") ShipName: string = "";
  @type({ array: MainD }) MainData = new Array<MainD>();
  @type({ array: MotorD }) MotorData = new Array<MotorD>();
  @type({ array: CannonD }) CannonData = new Array<CannonD>();
  @type({ array: ShellD }) ShellData = new Array<ShellD>();
}