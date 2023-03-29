import Link from "next/link"

export default function Header() {
    return (
        <div className='header'>
            <Link href={'/'} className='headerText'>Northwestern Engineering IDEAL LAB</Link>
        </div>
    )
}