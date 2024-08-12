"use server";
import { PrismaClient } from "@prisma/client";

export default async function signUpAction({ name, email, password }) {
    const prisma = new PrismaClient();

    try {
        const emailExists = await prisma.user.findUnique({
            where: {
                email: email,
            },
        });
        if (emailExists) {
            throw new Error("user with email already exists");
        }

        const usernameExists = await prisma.user.findUnique({
            where: {
                name: name,
            },
        });
        if (usernameExists) {
            throw new Error(
                "username already exists, please choose another name"
            );
        }

        const res = await prisma.user.create({
            data: {
                email,
                name,
                password,
            },
        });
        if (res) {
            return { message: "created sucessfully", success: true };
        }
    } catch (err) {
        return { message: err.message, success: false };
    }
}
