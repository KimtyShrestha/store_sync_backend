import z from "zod";
import { UserSchema } from "../types/user.types";
// re-use UserSchema from types
export const CreateUserDTO = UserSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  username: true,
  password: true,
})
  .extend(
    // add new attribute to zod
    {
      confirmPassword: z.string().min(6),
    }
  )
  .refine(
    // extra validation for confirmPassword
    (data) => data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );
export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;