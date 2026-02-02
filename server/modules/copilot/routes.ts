import { Router } from "express";
import { copilotController } from "./copilot.controller";

export const copilotRouter = Router();

copilotRouter.post("/chat", copilotController.handleChat);
copilotRouter.post("/contextual-chat", copilotController.handleContextualChat);
