import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.respository";
import bcryptjs from "bcryptjs";
import { HttpError } from "../error/http-error";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import mongoose from "mongoose";

const userRepository = new UserRepository();

export class UserService {

  // ==============================
  // REGISTER USER
  // ==============================
  async createUser(data: CreateUserDTO) {

    // Check if email already exists
    const existingUser = await userRepository.getUserByEmail(data.email);
    if (existingUser) {
      throw new HttpError(400, "Email already in use");
    }

    // If manager, ownerId must exist
    if (data.role === "manager" && !data.ownerId) {
      throw new HttpError(400, "Manager must belong to an owner");
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(data.password, 10);

    // Create user
    const newUser = await userRepository.createUser({
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      status: "pending", // All new registrations pending approval
      ownerId:
        data.role === "manager" && data.ownerId
          ? new mongoose.Types.ObjectId(data.ownerId)
          : undefined,
    });

    // Remove password before returning
    const userObject = newUser.toObject();
    delete userObject.password;

    return userObject;
  }


  // LOGIN USER

  async loginUser(data: LoginUserDTO) {

    const user = await userRepository.getUserByEmail(data.email);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    // Only approved users can login
    if (user.status !== "approved") {
      throw new HttpError(403, "Account not approved yet");
    }

    // Validate password
    const validPassword = await bcryptjs.compare(
      data.password,
      user.password
    );

    if (!validPassword) {
      throw new HttpError(401, "Invalid credentials");
    }

    // Create JWT payload
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: "30d",
    });

    // Remove password before returning
    const userObject = user.toObject();
    delete userObject.password;

    return {
      token,
      user: userObject,
    };
  }
}