"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Suspense, useState } from "react";
import {
    createPostAction,
    createSlug,
    doTitleExist,
    uploadImage,
} from "./action";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Tiptap } from "./tiptap";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Strike from "@tiptap/extension-strike";
import Heading from "@tiptap/extension-heading";
import TextAlign from "@tiptap/extension-text-align";
import BulletList from "@tiptap/extension-bullet-list";
import Blockquote from "@tiptap/extension-blockquote";
import OrderedList from "@tiptap/extension-ordered-list";
import CodeBlock from "@tiptap/extension-code-block";

import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function Create() {
    const [img, setImg] = useState(null);
    const [msg, setMsg] = useState("");
    const [desc, setDesc] = useState("");

    const router = useRouter();

    //zod schema for form
    const postSchema = z.object({
        title: z.string().min(1, { message: "please enter the title" }),
        // description: z.string().min(1, { message: "please enter description" }),
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
        if (desc == "") {
            setMsg("please enter description");
            return;
        }

        const titleExist = await doTitleExist(data.title);

        if (!titleExist) {
            const imageData = new FormData();
            imageData.append("image", img);
            const image = await uploadImage(imageData);

            
            if (!image.success) {
                setMsg(image.message);
                return;
            }

            const postData = {
                title: data.title,
                description: desc,
                category: data.category,
                image: image.url,
                imageId:image.publicId,
                slug: await createSlug(data.title),
            };

            const result = await createPostAction(postData);
            if (!result.success) {
                setMsg(result.message);
            } else {
                toast.success("post created sucessfully");
                router.push(`/posts/${postData.slug}`);
            }
        } else {
            setMsg("title already exists");
        }
    }

    //tiptap rich text editor config
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Strike,
            Highlight.configure({ multicolor: true }),
            Heading.configure({
                levels: [1, 2, 3],
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            BulletList,
            Blockquote,
            OrderedList,
            CodeBlock.configure({
                HTMLAttributes: {
                    class: "code-area",
                },
            }),
        ],
        content: "<p>start your blog</p>",
        immediatelyRender: false,
        onUpdate({ editor }) {
            setDesc(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "text-area prose prose-sm focus:outline-none !max-w-none",
            },
        },
    });

    //jsx form
    return (
        <>
            <div className="w-full h-[94svh] flex justify-center bg-white">
                <form
                    onSubmit={handleSubmit(post)}
                    className="border-2 w-[90%] mt-10"
                >
                    <input
                        {...register("title")}
                        type="text"
                        placeholder="title of the Blog"
                        className="text-field"
                    />
                    {errors.title?.message && <p>{errors.title?.message}</p>}

                    <div className="w-[89.6%]">
                        <Suspense
                            fallback={() => (
                                <>
                                    <div>Loading...</div>
                                </>
                            )}
                        >
                            <Tiptap editor={editor} />
                        </Suspense>
                    </div>

                    <div className="w-[90%] px-2 mt-2 flex items-center">
                        <input
                            {...register("image")}
                            type="file"
                            name="image"
                            onChange={(e) => setImg(e.target.files[0])}
                            required={true}
                        />

                        <select
                            {...register("category")}
                            className="border-2 p-1 border-[grey] rounded-sm"
                        >
                            <option value="">select category</option>
                            <option value="science">science</option>
                            <option value="general">general</option>
                            <option value="food">food</option>
                        </select>
                        {errors.category?.message && (
                            <p>{errors.category?.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-red-400 disabled:bg-slate-300"
                    >
                        submit
                    </button>
                    {msg && <p>{msg}</p>}
                </form>
            </div>
        </>
    );
}
