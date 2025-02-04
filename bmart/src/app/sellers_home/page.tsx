'use client'

import { useRouter } from "next/navigation";
import "../globals.css";

const SellersHome: React.FC = () => {
    const router = useRouter();

    return (
        <div>
            <div className="logoContainer">
                <p className="bigHeader">My Listings</p>

                <img 
                    src="logo1.png" 
                    alt="logo" 
                    className="logoGeneral"
                    onClick={() => router.push("/")}
                />
            </div>    

            <hr />

            <p>Really cool listings stuff go here... this shit sounds like the hardest to impl ngl</p>

            <img 
                src="create.png"
                alt="create button"
                className="createButton"
                onClick={() => router.push("/create_listing")}
            />
        </div>
    );
}

export default SellersHome;