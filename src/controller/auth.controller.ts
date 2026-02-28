import { UserService } from "../services/user.service";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { Request, Response } from "express";
import z from "zod";
let userService = new UserService();

export class AuthController {
    async register(req: Request, res: Response) {
    try {

        console.log("Incoming body:", req.body);   // 👈 PUT IT HERE

        const parsedData = CreateUserDTO.safeParse(req.body); // validate request body

        if (!parsedData.success) {
            return res.status(400).json(
                { success: false, message: z.prettifyError(parsedData.error) }
            )
        }

        const userData: CreateUserDTO = parsedData.data;
        const newUser = await userService.createUser(userData);

        return res.status(201).json(
            { success: true, message: "User Created", data: newUser }
        );

    } catch (error: Error | any) {
        return res.status(error.statusCode ?? 500).json(
            { success: false, message: error.message || "Internal Server Error" }
        );
    }
}

    async login(req: Request, res: Response) {
  try {
    const parsedData = LoginUserDTO.safeParse(req.body);

    if (!parsedData.success) {
      return res.status(400).json({
        success: false,
        message: z.prettifyError(parsedData.error),
      });
    }

    const loginData: LoginUserDTO = parsedData.data;

    const { token, user } = await userService.loginUser(loginData);

    // SET HTTP-ONLY COOKIE
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production (https)
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: user,
    });

  } catch (error: Error | any) {
    return res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}
    
}