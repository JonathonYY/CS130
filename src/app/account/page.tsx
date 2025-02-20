'use client'

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../globals.css";
import Avatar from '@mui/material/Avatar';
import IconButton from "@mui/material/IconButton";
import EditIcon from '@mui/icons-material/Edit';
import Box from "@mui/material/Box";


const Account: React.FC = () => {
    const router = useRouter();

    // Change this to get profile pic from API after logging in
    const [avatar, setAvatar] = useState<string>("../../../public/icon.png");


    const profileEditClick = () => {
        document.getElementById("profilePicChange")?.click();
    };

    
    const changeProfilePic = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        console.log(file);
        if (file && ["image/png", "image/jpeg", "image/svg+xml"].includes(file.type)) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setAvatar(e.target.result as string); // Update avatar
                }
            };
            reader.readAsDataURL(file);
        } else {
            alert("Please select valid image");
        }
    }


    return (
        <div>
            <div className="logoContainer">
                <p className="bigHeader">My account</p>

                <img 
                    src="logo1.png" 
                    alt="logo" 
                    className="logoGeneral"
                    onClick={() => router.push("/")}
                />
            </div>    

            <hr style = {{marginTop: -10}}/>

            {/* Hidden input for changing profile pic */}
            <input 
                id="profilePicChange"
                type="file"
                accept="image/png, image/jpeg, image/svg+xml"
                style={{ display: "none" }}
                onChange = {changeProfilePic}
            />

            <div className="accountContainer">
                <Box position="relative" display="inline-block">
                    <Avatar src={avatar} sx={{width: 125, height: 125}} />
                    <IconButton 
                        sx={{ 
                        position: "absolute", 
                        top: 0, 
                        right: 0, 
                        backgroundColor: "white", 
                            "&:hover": { backgroundColor: "lightgray" }
                        }}
                        size="small"
                    >
                        <EditIcon fontSize="small" onClick = {profileEditClick} />
                    </IconButton>
                </Box>
            </div>

            <div className="buttonContainer">
                <Link href="/sellers_home" style = {{marginLeft: 25}}>View my listings</Link>

                <Link href="/account">Update account</Link>

                <Link href="/">Delete account</Link>

                <Link href="/" style = {{marginRight: 25}}>Log out</Link>
            </div>
        </div>
    )
}

export default Account;