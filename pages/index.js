import Link from 'next/link';
import dynamic from "next/dynamic";
import Pairwise from "./pairwise_page";

export default function Home() {
    return (
        <div>
            <div>
                <Pairwise/>
                <Link href="/scatter">
                <button>Scatter</button>
                </Link>

            </div>
        </div>
    );
}





