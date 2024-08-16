"use client";

import toast from "react-hot-toast";
import { deleteSession } from "../(lib)/sessions";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();
    async function handleSubmit() {
        const res = await deleteSession();
        if (!res.success) {
            toast.error(res.message);
            return;
        }
        toast.success("logged out sucessfully");
        router.push("/");
    }
    return (
        <button
            type="submit"
            onClick={handleSubmit}
            className="mr-3 px-3 py-[1.5px] rounded-sm text-[14px] font-medium cursor-pointer bg-white text-black"
        >
            Logout
        </button>
    );
}
