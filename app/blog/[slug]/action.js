"use server";
import { decrypt } from "@/app/(lib)/sessions";
import prisma from "@/app/(lib)/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { v2 as cloudinary } from "cloudinary";

export async function commentAction(postId, comment, slug) {
    try {
        const user = await decrypt(cookies().get("session")?.value);
        const res = await prisma.comment.create({
            data: {
                comment: comment,
                postId: postId,
                cmntAuthorId: user.id,
            },
        });
        console.log('uhahahahahahahahaha)
        revalidatePath(process.env.BASE_URL + "/posts/" + slug);
        return { res, success: true };
    } catch (err) {
        return { message: err.message, success: false };
    }
}

export async function deleteButtonAction(id, imageId) {
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
