import prisma from "@/app/(lib)/prisma";
import { notFound } from "next/navigation";
import { Comment } from "./comments";
import { decrypt } from "@/app/(lib)/sessions";
import { cookies } from "next/headers";
import Image from "next/image";
import DeleteButton from "./deleteButton";
import { GoDotFill } from "react-icons/go";
import Timeago from "../../(lib)/timeago";
import { getPlaiceholder } from "plaiceholder";
import { TbFileSad } from "react-icons/tb";
import { FaCircleUser } from "react-icons/fa6";
import { MdLogin } from "react-icons/md";
import Link from "next/link";
import { AiTwotoneEdit } from "react-icons/ai";

export default async function Slug({ params }) {
    const post = await prisma.post.findFirst({
        where: {
            slug: params.slug,
        },
        include: {
            comments: {
                include: {
                    cmntAuthor: {
                        include: {
                            password: false,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            },
            author: {
                include: {
                    password: false,
                },
            },
        },
    });

    if (post == null) {
        return notFound();
    }

    const comments = post.comments;

    const currentUser = await decrypt(cookies().get("session")?.value);

    let buffer = await fetch(post?.image).then(async (res) => {
        return Buffer.from(await res.arrayBuffer());
    });

    const { base64 } = await getPlaiceholder(buffer);

    return (
        <div className="md:mx-[10%] mx-4 flex flex-col items-center">
            <div className="text-3xl font-semibold mt-10 mb-1 text-center">
                {post.title}
            </div>

            <div className="flex items-center my-3 md:text-sm text-xs font-medium text-gray-500">
                <p>
                    posted by{" "}
                    {currentUser?.id == post?.author?.id
                        ? "you"
                        : "@" + post?.author?.name}
                </p>

                <div className="mx-[6px]">
                    <GoDotFill color="grey" size={"0.5em"} />
                </div>

                <p>
                    <Timeago date={post?.createdAt} />
                </p>

                {post?.isEdited && (
                    <div className="flex items-center">
                        <div className="mx-[6px]">
                            <GoDotFill color="grey" size={"0.5em"} />
                        </div>
                        <p>Edited</p>
                    </div>
                )}
            </div>

            {/* edit and delete buttons */}
            {currentUser?.id == post?.author?.id ? (
                <div className="flex items-center mt-[6px] mb-3 md:text-sm text-xs font-medium text-gray-500 gap-3">
                    <DeleteButton id={post?.id} imageId={post?.imageId} />

                    <Link href={`/update/${post?.id}`}>
                        <button className="flex items-center gap-2 px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200">
                            <AiTwotoneEdit />
                            <p className="pr-1">Edit</p>
                        </button>
                    </Link>
                </div>
            ) : (
                ""
            )}

            <div className="w-full overflow-hidden flex items-center justify-center rounded-md my-2">
                <Image
                    src={post?.image}
                    placeholder="blur"
                    width={1130}
                    height={600}
                    blurDataURL={base64}
                    alt="cover image"
                />
            </div>

            <div
                className="prose-sm prose !max-w-none mt-8"
                dangerouslySetInnerHTML={{
                    __html: post.description,
                }}
            />

            <div className="w-full mt-10 mb-2 text-gray-600">
                <div className="font-semibold text-3xl">Comments</div>
            </div>

            <div className="w-full h-[70px] py-2">
                {cookies().get("session")?.value ? (
                    <div className="h-[70px]">
                        <Comment postId={post.id} slug={params.slug} />
                    </div>
                ) : (
                    <div className="flex gap-2 items-center py-3">
                        <MdLogin size={"1.4em"} />
                        <Link href={`/login?redirect=/blog/${params.slug}`}>
                            <div className="font-medium text-sm cursor-pointer">
                                please <u>login</u> to add comments.
                            </div>
                        </Link>
                    </div>
                )}
            </div>

            <div className="w-full mt-2">
                {comments?.length == 0 ? (
                    <div className="flex gap-1 items-center mt-2 mb-8">
                        <TbFileSad size={"1.5em"} />
                        <p className="font-semibold text-sm">
                            no comments. be first to comment
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {comments.map((comment, i) => (
                            <div key={i}>
                                <div className="flex gap-[10px] items-center py-3">
                                    <div className="">
                                        <FaCircleUser
                                            size={"2.2em"}
                                            className="pt-[1px]"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-[1.1px]">
                                        <div className="flex gap-[5px] items-center">
                                            <p className="font-bold text-[14px]">
                                                @{comment?.cmntAuthor.name}
                                            </p>

                                            <GoDotFill
                                                color="grey"
                                                size={"0.4em"}
                                            />

                                            <p className="text-[12px] font-medium text-[grey]">
                                                <Timeago
                                                    date={comment?.createdAt}
                                                />
                                            </p>
                                        </div>
                                        <div className="text-sm font-normal">
                                            {comment?.comment}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
