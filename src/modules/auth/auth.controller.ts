import { Request, Response } from "express";
import { ApiResponse } from "src/shared/api-response";
import { authService } from "./services/auth.service";
import {
  GetMeResponse,
  LoginInput,
  LoginResponse,
  LogoutInput,
  RefreshInput,
  RefreshResponse,
  RegisterInput,
  RegisterResponse,
} from "./auth.types";
import { getRequestMetadata } from "src/shared/utils/get-request-metadata";
import { UnauthorizedError } from "src/shared/errors/app-error";
import { config } from "src/shared/config/config";
import { parseExpiryToMs } from "src/shared/utils/date";

export const authController = {
  async register(req: Request, res: Response<ApiResponse<RegisterResponse>>) {
    const body = req.body as RegisterInput;

    const result = await authService.register(body, getRequestMetadata(req));

    res.cookie(config.REFRESH_TOKEN_COOKIE_KEY, result.tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: parseExpiryToMs(config.REFRESH_TOKEN_EXPIRY),
    });

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      timestamp: new Date(),
      data: {
        user: result.user,
        tokens: result.tokens,
      },
    });
  },
  async login(req: Request, res: Response<ApiResponse<LoginResponse>>) {
    const body = req.body as LoginInput;

    const result = await authService.login(body, getRequestMetadata(req));

    res.cookie(config.REFRESH_TOKEN_COOKIE_KEY, result.tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: parseExpiryToMs(config.REFRESH_TOKEN_EXPIRY),
    });

    res.status(200).json({
      status: "success",
      message: "User logged in successfully",
      timestamp: new Date(),
      data: {
        user: result.user,
        tokens: result.tokens,
      },
    });
  },
  async refresh(req: Request, res: Response<ApiResponse<RefreshResponse>>) {
    // TODO: Grab refresh token automatically from Cookie
    const { refreshToken } = req.body as RefreshInput;

    const result = await authService.refresh(
      refreshToken,
      getRequestMetadata(req),
    );

    res.status(200).json({
      status: "success",
      message: "User logged in successfully",
      timestamp: new Date(),
      data: result,
    });
  },

  async logout(
    req: Request,
    res: Response<ApiResponse<object>>,
  ): Promise<void> {
    const { refreshToken } = req.body as LogoutInput;
    await authService.logout(refreshToken);

    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
      timestamp: new Date(),
      data: {},
    });
  },

  /*
   * /getMe is a protected routed protected by middleware
   */
  async getMe(
    req: Request,
    res: Response<ApiResponse<GetMeResponse>>,
  ): Promise<void> {
    // req.user is set by authenticate middleware — guaranteed non-null here
    const userId = req.user?.sub;

    // Still throw in case it is not available.
    if (!userId) {
      throw new UnauthorizedError();
    }
    const user = await authService.getMe(userId);

    res.status(200).json({
      status: "success",
      message: "User fetched successfully",
      timestamp: new Date(),
      data: { user },
    });
  },
};
