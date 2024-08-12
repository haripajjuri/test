import { getUser } from "./action";
import { FaCircleUser } from "react-icons/fa6";
import Timeago from "./timeago";
import { GoDotFill } from "react-icons/go";

export default async function Cmnt({ cmnt, cmntAuthorId }) {
    const commentAuthor = await getUser(cmntAuthorId);
    return (
        <div className="flex gap-3 items-center py-3">
            <div>
                <FaCircleUser size={"2.4em"} className="mt-[3px]" />
            </div>

            <div className="flex flex-col gap-[1.5px]">
                <div className="flex gap-[5px] items-center">
                    <p className="font-semibold text-base">
                        {commentAuthor?.name}
                    </p>

                    <GoDotFill color="grey" size={"0.5em"} />

                    <p className="text-xs font-medium text-[grey]">
                        <Timeago date={cmnt?.createdAt} />
                    </p>
                </div>
                <div className="text-sm">{cmnt?.comment}</div>
            </div>
        </div>
    );
}
