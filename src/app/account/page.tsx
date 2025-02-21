'use client'

import React, { useState, useEffect } from "react";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import "../globals.css";
import { 
    IconButton, 
    Box, 
    Modal, 
    Button, 
    Avatar, 
    TextField, 
    InputAdornment
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';


// Define properties needed for user settings
interface User {
    email: string,
    first: string,
    last: string,
    pfp: string,
    buyerRating: number,
    sellerRating: number,
}


const Account: React.FC = () => {
    const router = useRouter();

    // States for informing users data is being fetched
    const [loading, setLoading] = useState(true);

    // States for user data
    const [userData, setUserData] = useState<User>({
        email: "",
        first: "",
        last: "",
        pfp: "",
        buyerRating: 0,
        sellerRating: 0
    });

    // Make get call to get user info
    // TODO: Impl get call
    async function getUserInfo() {
        setTimeout(() => {setLoading(false)}, 1000);
        setUserData({
            email: "test@g.ucla.edu",
            first: "Joe",
            last: "Bruin",
            pfp: "../../../public/icon.png",
            buyerRating: 4,
            sellerRating: 4
        });
    }


    // run on page load
    useEffect(() => {
        getUserInfo();
    }, []);


    // Allows the profile picture to be changed upon clicking avatar
    const profileEditClick = () => {
        document.getElementById("profilePicChange")?.click();
    };


    // Handles changing the profile picture
    const changeProfilePic = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        // console.log(file);
        if (file && ["image/png", "image/jpeg", "image/svg+xml"].includes(file.type)) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setUserData({
                        ...userData,
                        pfp: e.target?.result as string || ""
                    }); // Update avatar
                }
            };
            reader.readAsDataURL(file);
        } else {
            alert("Please select valid image");
        }
    }


    // Handles form changes
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUserData({
            ...userData,
            [event.target.name]: event.target.value
        });
    }


    // Handles updating the account
    // TODO: implementation of PATCH API
    const handleUpdate = () => {
        console.log(userData);
    }


    // Opens up modal for deleting account
    const [deleteModal, setDeleteModal] = useState<boolean>(false);
    const handleOpen = () => setDeleteModal(true);
    const handleClose = () => setDeleteModal(false);

    // Deletes account
    // TODO: implementation of DELETE API
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

            {(loading &&
                <p>Loading user data</p>
            ) || (
                <div>
                    <div className="accountContainer">
                        <Box position="relative" display="inline-block">
                            <Avatar src={userData.pfp} sx={{width: 125, height: 125}} />
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

                        <TextField 
                            fullWidth
                            label="Email" 
                            value={userData.email}
                            name="email"
                            onChange={handleInputChange}
                            slotProps={{
                                input: {
                                    readOnly: true,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <LockIcon />
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />

                        <TextField 
                            fullWidth
                            label="First Name" 
                            value={userData.first}
                            name="first"
                            onChange={handleInputChange}
                            style={{marginTop: 10}}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <EditIcon />
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />

                        <TextField 
                            fullWidth
                            label="Last Name" 
                            value={userData.last}
                            name="last"
                            onChange={handleInputChange}
                            style={{marginTop: 10}}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <EditIcon />
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />
                    </div>

                    <div className="buttonContainer">
                        <Button>
                            <Link href="/sellers_home" style = {{marginLeft: 25}}>View my listings</Link>
                        </Button>

                        <Button onClick={handleUpdate}>Update Account</Button>
                        
                        <Button onClick={handleOpen}>Delete account</Button>

                        <Button>
                            <Link href="/" style = {{marginRight: 25}}>Log out</Link>
                        </Button>
                    </div>
                </div>
            )}

            {/* Modal for deleting account */}
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