import z from "zod";

export const CreateUserDTO = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6).optional(),

  firstName: z.string().optional(),
  lastName: z.string().optional(),

  role: z.enum(["owner", "manager"]), // superadmin cannot self-register

  ownerId: z.string().optional(), // required if role = manager
})
.refine(
  (data) => {
    if (data.confirmPassword && data.password !== data.confirmPassword) {
      return false;
    }
    return true;
  },
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
);

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginUserDTO = z.infer<typeof LoginUserDTO>;