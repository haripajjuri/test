"use server";

import { decrypt, verifySession } from "@/app/(lib)/sessions";
import prisma from "../(lib)/prisma";
import { cookies } from "next/headers";
import { v2 as cloudinary } from "cloudinary";

//function to upload image and return url
export async function uploadImage(FormData) {
    try {
        const file = FormData.get("image");
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        const user = await verifySession();

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        if (!user) {
            throw new Error("you are not authorized, please login!");
        }

        const post = await new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream({ quality: "auto" }, function (err, result) {
                    if (err) {
                        throw new Error("unable to upload image");
                    }
                    resolve(result);
                })
                .end(buffer);
        });
        console.log(post)
        return {
            url: post.secure_url,
            publicId: post.public_id,
            success: true,
        };
    } catch (err) {
        return { message: err.message, success: false };
    }
}

export async function createSlug(input) {
    let slug = input.toLowerCase();
    slug = slug.replace(/[^\w\s-]/g, "");
    slug = slug.replace(/\s+/g, "-");
    slug = slug.replace(/-+/g, "-");
    slug = slug.replace(/^-+|-+$/g, "");
    return slug;
}

export async function createPostAction(data) {
    try {
        const user = await decrypt(cookies().get("session")?.value);
        if (!user.success) {
            throw new Error("please login to post");
        }
        const post = await prisma.post.create({
            data: {
                title: data.title,
                description: data.description,
                image: data.image,
                imageId: data.imageId,
                category: data.category,
                slug: data.slug,
                authorId: user.id,
            },
        });
        return { ...post, success: true };
    } catch (err) {
        return { message: err.message, success: false };
    }
}

export async function doTitleExist(title) {
    const res = await prisma.post.findMany({
        where: {
            title: title,
        },
    });
    if (res.length == 0) {
        return false;
    }
    return true;
}
