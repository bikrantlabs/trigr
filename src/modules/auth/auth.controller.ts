import { Request, Response } from "express";
import { ApiResponse } from "src/shared/api-response";
import { authService } from "./services/auth.service";
import { RegisterInput, RegisterResponse } from "./auth.types";
import { getRequestMetadata } from "src/shared/utils/get-request-metadata";
import { createLogger } from "src/shared/logger";

const logger = createLogger("Auth Controller");
export const authController = {
  async register(req: Request, res: Response<ApiResponse<RegisterResponse>>) {
    logger.info("Auth Controller Register");
    const body = req.body as RegisterInput;
    logger.info(body, "Request Body");
    const result = await authService.register(body, getRequestMetadata(req));

    return res.json({
      status: "success",
      message: "User registered successfully",
      statusCode: 201,
      timestamp: new Date(),
      data: {
        user: result.user,
        tokens: result.tokens,
      },
    });
  },
};
