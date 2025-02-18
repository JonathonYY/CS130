'use client'

import HomeGrid from "../../components/homeGrid";
import { useRouter } from "next/navigation";
import "../globals.css";
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';


const Home: React.FC = () => {
    const router = useRouter();

    return (
        <div>
            <div className="logoContainer">
                <img 
                    src="logo1.png" 
                    alt="home page logo" 
                    className="logoGeneral logoHome"
                    onClick={() => router.push("/")}
                />

                <TextField
                    id="standard-search"
                    label="Search field"
                    type="search"
                    variant="outlined"
                    size="small"
                    sx={{mt: 1.75}}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <img src = "search.svg" width = "24" height = "24"/>
                                </InputAdornment>
                            ),
                        },
                    }}
                />

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