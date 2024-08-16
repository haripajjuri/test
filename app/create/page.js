import { cookies } from "next/headers";
import CreateForm from "./form";
import { redirect } from "next/navigation";

export default async function UpdatePost() {
    if (!cookies().get("session")?.value) {
        redirect("/login");
    }
    return <CreateForm />;
}
