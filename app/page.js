import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default function Home() {
    async function main() {
        const user = await prisma.comment.findMany({
            where: {
                cmntAuthorId: "668ed39235409dd433dfe420",
            },
            include: {
                cmntAuthor: {
                    include: {
                        password: false,
                    },
                },
                post: {
                    include: true,
                },
            },
        });
        console.log(user);
    }
    return (
        <div className="border h-full">
            this is a hero section
            <div className="h-[400px] max-h-[400px] w-full border-2 border-green-500 overflow-hidden flex items-center justify-center rounded-md my-2">
                {/* <Image
                    src={post.image}
                    placeholder="blur"
                    width={1200}
                    height={500}
                    blurDataURL={base64}
                /> */}
            </div>
        </div>
    );
}
