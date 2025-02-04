'use client'

import HomeGrid from "../../components/homeGrid";
import { useRouter } from "next/navigation";
import "../globals.css";


const Home: React.FC = () => {
    const router = useRouter();

    return (
        <div>
            <div className="logoContainer">
                <img 
                    src="logo1.png" 
                    alt="home page logo" 
                    className="logoHome"
                    onClick={() => router.push("/")}
                />

                <p>Search bar goes here</p>

                <img 
                    src="icon.png"
                    alt="user icon"
                    className="userIcon"
                    onClick={() => router.push("/login")}
                />
            </div>

            <hr />

            <HomeGrid />
        </div>
    );
}


export default Home;