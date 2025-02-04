'use client'

import { useRouter } from "next/navigation";
import Link from "next/link";
import "../globals.css";


const Account: React.FC = () => {
    const router = useRouter();

    return (
        <div>
            <div className="logoContainer">
                <p className="bigHeader">My account</p>

                <img 
                    src="logo1.png" 
                    alt="home page logo" 
                    className="logoGeneral"
                    onClick={() => router.push("/")}
                />
            </div>    

            <hr style = {{marginTop: -10}}/>

            <p>Really cool account settings go here yippee!</p>

            <div className="buttonContainer">
                <Link href="/account" style = {{marginLeft: 25}}>View my listings</Link>

                <Link href="/account">Update account</Link>

                <Link href="/">Delete account</Link>

                <Link href="/" style = {{marginRight: 25}}>Log out</Link>
            </div>
        </div>
    )
}

export default Account;