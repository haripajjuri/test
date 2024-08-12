"use server";
import { decrypt } from "@/app/(lib)/sessions";
import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { v2 as cloudinary } from "cloudinary";

export async function commentAction(postId, comment, slug) {
    const prisma = new PrismaClient();

    try {
        const user = await decrypt(cookies().get("session")?.value);
        const res = await prisma.comment.create({
            data: {
                comment: comment,
                postId: postId,
                cmntAuthorId: user.id,
            },
        });
        revalidatePath(process.env.BASE_URL + "/posts/" + slug);
        return res;
    } catch (err) {
        throw err;
    }
}

export async function getComments(postId) {
    const prisma = new PrismaClient();
    try {
        const comments = await prisma.comment.findMany({
            where: {
                postId: postId,
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                cmntAuthor: {
                    include: {
                        password: false,
                    },
                },
            },
        });
        if (comments.length == 0) {
            throw new Error("empty");
        }
        return comments;
    } catch (err) {
        return { message: err.message, success: false };
    }
}

export async function deleteButtonAction(id, imageId) {
    const prisma = new PrismaClient();
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    try {
        const res = await prisma.post.delete({
            where: {
                id: id,
            },
        });
        cloudinary.uploader.destroy(imageId);
        return { success: true };
    } catch (err) {
        return { message: err.message, success: false };
    }
}

export async function getUser(userId) {
    const prisma = new PrismaClient();
    try {
        const user = await prisma.user.findFirst({
            where: {
                id: userId,
            },
            include: {
                password: false,
                id: false,
            },
        });
        if (!user) {
            return "";
        }
        return user;
    } catch (err) {
        return { message: "unknown error occured", success: false };
    }
}
