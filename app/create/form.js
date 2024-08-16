"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import {
    createPostAction,
    createSlug,
    doTitleExist,
    uploadImage,
} from "./action";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Tiptap } from "../(lib)/tiptap";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FaImage } from "react-icons/fa6";
import Placeholder from "@tiptap/extension-placeholder";
import { MdOutlinePostAdd } from "react-icons/md";

export default function CreateForm() {
    const router = useRouter();

    const [img, setImg] = useState(null);
    const [imgErr, setImgErr] = useState("");
    const [descErr, setDescErr] = useState("");

    //zod schema for form
    const postSchema = z.object({
        title: z.string().min(1, { message: "please enter the title" }),
        category: z.string().min(1, { message: "please select category" }),
    });

    //assigning zod resolver
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({ resolver: zodResolver(postSchema) });

    //function to post data to database
    async function post(data) {
        setImgErr("");
        setDescErr("");

        if (!img) {
            setImgErr("please choose a cover photo");
            return;
        }
        if (editor?.isEmpty) {
            setDescErr("please write your blog");
            return;
        }

        const titleExist = await doTitleExist(data.title);

        const loadingToast = toast.loading("please wait...");
        if (!titleExist) {
            const imageData = new FormData();
            imageData.append("image", img);
            const image = await uploadImage(imageData);
            if (!image.success) {
                toast.dismiss(loadingToast);
                toast(image.message, {
                    icon: "🥴",
                });
                return;
            }
            const postData = {
                title: data.title,
                description: editor?.getHTML(),
                category: data.category,
                image: image.url,
                imageId: image?.publicId,
                slug: await createSlug(data.title),
            };

            const result = await createPostAction(postData);
            if (!result.success) {
                toast.dismiss(loadingToast);
                toast.error(result.message);
            } else {
                toast.dismiss(loadingToast);
                toast.success("Blog created sucessfully");
                router.push(`/blog/${postData.slug}`);
            }
        } else {
            toast.dismiss(loadingToast);
            toast("title already exists, try a unique title", {
                icon: "🥲",
            });
        }
    }

    //tiptap rich text editor config
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Highlight.configure({ multicolor: true }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Placeholder.configure({
                placeholder: "write something...",
            }),
        ],
        content: "",
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: "text-area prose prose-sm focus:outline-none !max-w-none",
            },
        },
    });

    //jsx form
    return (
        <div className="h-[94svh] flex justify-center">
            <form
                onSubmit={handleSubmit(post)}
                className="md:w-[88%] w-[92%] flex flex-col pt-10 pl-0 md:pl-10"
            >
                {/* title input field */}
                <div className="md:pb-4 pb-3 pl-1">
                    <input
                        {...register("title")}
                        type="text"
                        placeholder="Title..."
                        className="border-b-2 md:w-[85%] w-[100%] focus:outline-none md:text-2xl text-xl font-medium pb-2"
                    />
                    <div className="h-3">
                        {errors.title?.message && (
                            <p className="text-red-400 font-medium text-xs pt-2">
                                {errors.title?.message}*
                            </p>
                        )}
                    </div>
                </div>

                {/* select field and image input tag*/}
                <div className="pt-[12px] md:flex gap-9 text-sm font-medium pb-2">
                    <div className="md:w-[18%] w-[45%] mr-2">
                        <select
                            {...register("category")}
                            id="drop"
                            className="border-b-2 w-full pl-2 pb-2 pt-2 md:pt-1 rounded-md bg-none text-medium font-medium text-gray-500 focus:outline-none"
                        >
                            <option value="">select category</option>
                            <option value="science">science</option>
                            <option value="general">general</option>
                            <option value="food">food</option>
                        </select>

                        <div className="h-4">
                            {errors.category?.message && (
                                <p className="text-red-400 font-medium text-xs pt-2 pl-1">
                                    {errors.category?.message}*
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="pt-5 md:pt-0">
                        <div className="flex items-center pl-2 md:pl-0">
                            <FaImage size={"1.5em"} />
                            <input
                                {...register("image")}
                                type="file"
                                name="image"
                                className="font-medium text-slate-500 file:py-2 hover:file:bg-slate-200 file:px-4 file:mx-4 file:rounded-full file:border-0 file:text-sm file:font-medium"
                                onChange={(e) => setImg(e.target.files[0])}
                                accept="image/*"
                            />
                        </div>
                        <div className="h-4">
                            {imgErr && (
                                <p className="text-red-400 font-medium text-xs pt-2 pl-1">
                                    {imgErr}*
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* rich tect editor */}
                <div className="md:w-[85%] w-[100%]">
                    <Tiptap editor={editor} />
                    <div className="pl-1 h-6 pt-2">
                        {descErr && (
                            <p className="text-red-400 font-medium text-xs">
                                {descErr}*
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-black text-white text-sm font-medium px-5 py-2 rounded-lg disabled:cursor- disabled:text-slate-300 flex gap-2 items-center"
                    >
                        <MdOutlinePostAdd size={"1.2em"} />
                        Add Blog
                    </button>
                </div>
            </form>
        </div>
    );
}
