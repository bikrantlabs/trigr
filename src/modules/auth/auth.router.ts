import { Router } from "express";
import { authController } from "./auth.controller";
import { asyncHandler } from "src/shared/errors/error-handler";

const authRouter = Router();

authRouter.post("/register", asyncHandler(authController.register));

export { authRouter };
