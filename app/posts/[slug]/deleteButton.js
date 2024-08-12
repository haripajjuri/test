"use client";

import toast from "react-hot-toast";
import { deleteButtonAction } from "./action";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ id, imageId }) {
    const [msg, setMsg] = useState("");
    const router = useRouter();

    async function deletePost() {
        setMsg("");
        const isDeleted = await deleteButtonAction(id, imageId);
        if (!isDeleted.success) {
            setMsg(isDeleted.message);
        }
        router.push("/");
        toast.success("post deleted");
    }
    return (
        <div>
            <button onClick={() => deletePost()}>delete post</button>
            {msg && <p>msg</p>}
        </div>
    );
}
