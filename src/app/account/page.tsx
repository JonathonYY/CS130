'use client'

import React, { useState } from "react";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import "../globals.css";
import {IconButton, Box, Modal, Button, Avatar} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';


const Account: React.FC = () => {
    const router = useRouter();

    // Change this to get profile pic from API after logging in
    const [avatar, setAvatar] = useState<string>("../../../public/icon.png");

    // Allows the profile picture to be changed upon clicking avatar
    const profileEditClick = () => {
        document.getElementById("profilePicChange")?.click();
    };


    // Handles changing the profile picture
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


    // Opens up modal for deleting account
    const [deleteModal, setDeleteModal] = useState<boolean>(false);
    const handleOpen = () => setDeleteModal(true);
    const handleClose = () => setDeleteModal(false);

    // Deletes account, TODO: implementation
    const deleteAccount = () => {
        redirect("/");
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
                <Button>
                    <Link href="/sellers_home" style = {{marginLeft: 25}}>View my listings</Link>
                </Button>

                <Button>
                    <Link href="/account">Update account</Link>
                </Button>
                
                <Button onClick={handleOpen}>Delete account</Button>

                <Button>
                    <Link href="/" style = {{marginRight: 25}}>Log out</Link>
                </Button>
            </div>

            <Modal
                open={deleteModal}
                onClose={handleClose}
            >
                <Box className="deleteModal">
                    <p>Are you sure you want to delete your account?</p>
                    <Button onClick={deleteAccount}>Yes</Button>
                    <Button onClick={handleClose}>No</Button>
                </Box>
            </Modal>
        </div>
    )
}

export default Account;