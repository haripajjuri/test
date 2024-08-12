import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import { Comment } from "./comments";
import { decrypt } from "@/app/(lib)/sessions";
import { cookies } from "next/headers";
import Image from "next/image";
import DeleteButton from "./deleteButton";
import { GoDotFill } from "react-icons/go";
import Timeago from "./timeago";
import { getPlaiceholder } from "plaiceholder";
import { TbFileSad } from "react-icons/tb";
import { getComments, getUser } from "./action";

export default async function Slug({ params }) {
    const prisma = new PrismaClient();

    //code for fetching post details from slug
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

    //console.log(post);

    if (post == null) {
        return notFound();
    }
    const comments = post.comments;
    console.log(comments);

    const currentUser = await decrypt(cookies().get("session")?.value);

    const buffer = await fetch(post.image).then(async (res) => {
        return Buffer.from(await res.arrayBuffer());
    });
    const { base64 } = await getPlaiceholder(buffer);

    return (
        <div className="md:mx-[10%] mx-4 flex flex-col items-center">
            {/* title of the post */}
            <div className="text-3xl font-semibold mt-10 mb-1 text-center">
                {post.title}
            </div>

            {/* meta details of the post */}
            <div className="flex items-center my-2">
                {post.authorId == currentUser?.id ? (
                    <div className="flex items-center">
                        <p className="font-medium text-sm text-gray-500">
                            posted by you
                        </p>

                        <div className="mx-2">
                            <GoDotFill color="grey" size={"0.5em"} />
                        </div>

                        <DeleteButton id={post?.id} imageId={post?.imageId} />
                    </div>
                ) : (
                    <p className="font-medium text-sm text-gray-500">
                        posted by {post?.author?.name}
                    </p>
                )}

                <div className="mx-2">
                    <GoDotFill color="grey" size={"0.5em"} />
                </div>

                <p className="font-medium text-sm text-gray-500">
                    <Timeago date={post?.createdAt} />
                </p>
            </div>

            {/* image-section */}
            <div className="w-full overflow-hidden flex items-center justify-center rounded-md my-2">
                {/* <Image
                    src={post.image}
                    placeholder="blur"
                    width={1130}
                    height={600}
                    blurDataURL={base64}
                /> */}
            </div>

            {/* description */}
            <div
                className="prose-sm prose !max-w-none mt-8"
                dangerouslySetInnerHTML={{
                    __html: post.description,
                }}
            />

            {/* comment section starts here */}
            <div className="w-full mt-10 mb-2 text-gray-600">
                <div className="font-semibold text-3xl">Comments</div>
            </div>

            <div className="w-full">
                {cookies().get("session")?.value ? (
                    <div>
                        <Comment postId={post.id} slug={params.slug} />
                    </div>
                ) : (
                    <p>please signin to add comment</p>
                )}
            </div>

            <div>
                {comments.map((comment, i) => (
                    <div key={i}>{comment.comment}</div>
                ))}
            </div>
        </div>
    );
}
