"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import signUpAction from "./action";
import Link from "next/link";
import toast from "react-hot-toast";

export default function Signup() {
    const router = useRouter();
    const [state, setState] = useState("");

    const userSchema = z.object({
        email: z.string().email({ message: "enter a valid email id" }),
        name: z
            .string()
            .min(2, { message: "name should contain atleast 2 characters" }),
        password: z
            .string()
            .min(4, { message: "password should contain atleast 4 character" }),
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(userSchema),
    });

    async function post(data) {
        setState("");
        const res = await signUpAction(data);
        if (!res.success) {
            setState(res.message);
        } else {
            toast.success("user created sucessfully");
            router.push("/login");
        }
    }

    //jsx signup form
    return (
        <div className="w-full h-[94svh] flex justify-center bg-[#E0E0E0]">
            <form
                onSubmit={handleSubmit(post)}
                className="flex flex-col gap-2 rounded-xl sm:w-[450px] w-[360px] h-[75%] mt-[100px] bg-white p-4 items-center pt-16"
            >
                <div className="flex flex-col items-center font-semibold gap-2">
                    <p>Hey! Welcome</p>
                    <p>create a new account here</p>
                </div>

                <div className=" h-[20px] mt-2 flex items-center">
                    <div className="text-sm text-[red] font-semibold">
                        {state}
                    </div>
                </div>

                <input
                    {...register("email")}
                    type="text"
                    name="email"
                    placeholder="email"
                    className="text-field"
                    autoCapitalize="off"
                />
                {errors.email?.message && (
                    <p className="text-msg">{errors.email?.message}</p>
                )}

                <input
                    {...register("name")}
                    type="text"
                    name="name"
                    placeholder="name"
                    className="text-field"
                    autoCapitalize="off"
                />
                {errors.name?.message && (
                    <p className="text-msg">{errors.name?.message}</p>
                )}

                <input
                    {...register("password")}
                    type="password"
                    name="password"
                    placeholder="password"
                    className="text-field"
                    autoCapitalize="off"
                />
                {errors.password?.message && (
                    <p className="text-msg">{errors.password?.message}</p>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-black mt-4 text-white font-bold disabled:text-gray-500 disabled:cursor-wait w-[90%] rounded-lg h-10"
                >
                    submit
                </button>

                <div className="w-[90%] text-sm p-1 pt-4">
                    Already have an account?{" "}
                    <Link href={"/login"}>
                        <u>
                            <strong>Login here</strong>
                        </u>
                    </Link>
                </div>
            </form>
        </div>
    );
}
