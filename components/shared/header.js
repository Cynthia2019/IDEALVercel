import Link from "next/link"

export default function Header() {
    return (
        <div className='header'>
            <Link href={'/'} className='headerText'>Northwestern IDEAL Metamaterials Data Explorer</Link>
        </div>
    )
}