"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useRef } from "react";
import toast from "react-hot-toast";
import { commentAction } from "./action";

export function Comment({ postId, slug }) {
    const formRef = useRef(null);

    const commentSchema = z.object({
        comment: z.string().min(1, { message: "please enter a comment" }),
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(commentSchema),
    });

    async function post(data) {
        try {
            const res = await commentAction(postId, data.comment, slug);
            if (res) {
                formRef.current?.reset();
                toast.success("comment added");
            }
        } catch (err) {
            throw err;
        }
    }

    return (
        <form onSubmit={handleSubmit(post)} ref={formRef}>
            <input
                {...register("comment")}
                type="text"
                placeholder="enter a comment"
                name="comment"
            />
            {errors.comment?.message && <p>{errors.comment?.message}</p>}
            <button
                type="submit"
                disabled={isSubmitting}
                className="bg-red-300 disabled:bg-slate-600"
            >
                add comment
            </button>
        </form>
    );
}
