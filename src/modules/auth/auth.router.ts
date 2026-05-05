import { Router } from "express";
import { authController } from "./auth.controller";
import { asyncHandler } from "src/shared/errors/error-handler";
import { authenticate } from "./middleware/auth.middleware";

const authRouter = Router();

authRouter.post("/register", asyncHandler(authController.register));
authRouter.post("/login", asyncHandler(authController.login));
authRouter.post("/logout", asyncHandler(authController.logout));
authRouter.post("/refresh", asyncHandler(authController.refresh));
authRouter.get("/me", authenticate, asyncHandler(authController.getMe));

export { authRouter };
