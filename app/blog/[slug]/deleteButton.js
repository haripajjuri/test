"use client";

import toast from "react-hot-toast";
import { deleteButtonAction } from "./action";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AiTwotoneDelete } from "react-icons/ai";

export default function DeleteButton({ id, imageId }) {
    const router = useRouter();

    async function deletePost() {
        const isDeleted = await deleteButtonAction(id, imageId);
        if (!isDeleted.success) {
            toast.error(isDeleted.message);
            return;
        }
        router.push("/");
        toast.success("post deleted");
    }
    return (
        <div>
            <button
                onClick={() => deletePost()}
                className="flex items-center gap-2 px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200"
            >
                <AiTwotoneDelete />
                <p className="pr-1">Delete</p>
            </button>
        </div>
    );
}
