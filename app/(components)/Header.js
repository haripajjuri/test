import { Toaster } from "react-hot-toast";

export default function Header() {
    return (
        <div className="h-[6svh] bg-black flex items-center text-white">
            <Toaster position="bottom-center" reverseOrder={false} />
            Header.
        </div>
    );
}
