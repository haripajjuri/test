import { cookies } from "next/headers";
import { decrypt } from "../(lib)/sessions";
import { PrismaClient } from "@prisma/client";

export default async function test(){
    const prisma = new PrismaClient();
    const user = await decrypt(cookies().get('session')?.value);
    if(user){
        try{
            await prisma.post.create({
                data:{
                    title:'test title',
                    description:'this is a description of the post that was going to be created',
                    image:'hello.jpeg.com',
                    authorId: user.id,
                    category:'test',
                    slug:'test-post',
                }
            })
        }catch(err){
            throw new Error('unable to reach the database')
        }
    }  
    //console.log(post);
    return(<div>
        hello
    </div>)
}