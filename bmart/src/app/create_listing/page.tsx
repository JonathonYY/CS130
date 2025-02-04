'use client'

import { useRouter } from "next/navigation";
import Link from "next/link";
import "../globals.css";

const CreateListing: React.FC = () => {
    const router = useRouter();

    return (
        <div>
            <div className="logoContainer">
                <p className="bigHeader">Create Listing</p>

                <img 
                    src="logo1.png" 
                    alt="logo" 
                    className="logoGeneral"
                    onClick={() => router.push("/")}
                />
            </div>    

            <hr />

            <p>Really cool create listings stuff go here! Wow!</p>

            <div className="buttonContainer">
                <Link href="/sellers_home" style = {{marginLeft: 25}}>Publish Listing</Link>

                <Link href="/sellers_home">Update Listing</Link>

                <Link href="/sellers_home" style = {{marginRight: 25}}>Remove Listing</Link>
            </div>
        </div>
    );
}

export default CreateListing;