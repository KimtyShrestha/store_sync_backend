import z from "zod";

export const UserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),

  firstName: z.string().optional(),
  lastName: z.string().optional(),

  role: z.enum(["superadmin", "owner", "manager"]),
  status: z.enum(["pending", "approved"]).optional(),

  ownerId: z.string().optional(),
  profileImage: z.string().nullable().optional(),
});

export type UserType = z.infer<typeof UserSchema>;