import z from "zod";

export const UserSchema = z.object({
    username: z.string().min(1),
    email: z.email(),
    password: z.string().min(6),

    firstName: z.string().optional(),
    lastName: z.string().optional(),

    role: z.enum(["user", "admin"]).default("user"),


    profileImage: z.string().nullable().optional(),
});

export type UserType = z.infer<typeof UserSchema>;
