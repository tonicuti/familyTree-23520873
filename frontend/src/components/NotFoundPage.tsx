import { Link } from "react-router-dom";

export default function () {
    return (
        <div className="flex flex-col gap-2">404 Not Found
            <Link className="text-red-800" to="/">Back to Home</Link>
        </div>
    );
    
};