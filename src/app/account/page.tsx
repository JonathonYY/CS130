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
    InputAdornment,
    createTheme,
    ThemeProvider
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';


// Define properties needed for user settings
interface User {
    email: string,
    first: string,
    last: string,
    pfp: string,
    phone: string,
    buyerRating: number,
    sellerRating: number,
}


// Adding in button color to palette
declare module '@mui/material/styles' {
    interface Palette {
        buttonBlue: Palette['primary'];
        deleteRed: Palette['primary'];
    }

    interface PaletteOptions {
        buttonBlue?: PaletteOptions['primary'];
        deleteRed?: PaletteOptions['primary'];
    }
}


// Override button color
declare module '@mui/material/Button' {
    interface ButtonPropsColorOverrides {
        buttonBlue: true;
        deleteRed: true;
    }
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
        phone: "",
        buyerRating: 0,
        sellerRating: 0,
    });

    // Create button color theme
    const theme = createTheme({
        palette: {
            buttonBlue: {
                main: "#8BB8E8"
            },

            deleteRed: {
                main: "#E88C8C"
            }
        }
    })
    

    // Make get call to get user info
    const getUserInfo = async () => {
        // TODO: change GET call to call for user_id based on auth instead of preset
        const response = await fetch("/api/user/abcdef", {
            method: "GET",
        });

        const { data, error } = await response.json();
        if (error) {
            console.log("Error");
            console.log(error);
          } else {
            // console.log(data)

            setUserData({
                email: data.email_address,
                first: data.first,
                last: data.last,
                pfp: data.pfp,
                phone: data.phone_number,
                buyerRating: data.cum_buyer_rating,
                sellerRating: data.cum_seller_rating
            });
            setLoading(false);
        }
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
    const handleUpdate = async () => {
        if (userData.first == "" || userData.last == "") {
            console.log("Missing required fields!");
            return;
        }

        // TODO: change PATCH call to call for user_id based on auth instead of preset
        const response = await fetch("/api/user/abcdef", {
            body: JSON.stringify({
                first: userData.first,
                last: userData.last,
                pfp: userData.pfp,
                phone_number: userData.phone
            }),
            method: "PATCH",
        });

        const { data, error } = await response.json();
        
        if (error) {
            console.log("Error");
            console.log(error);
        } else {
            console.log("Success");
            console.log(data);
        }
    }


    // Opens up modal for deleting account
    const [deleteModal, setDeleteModal] = useState<boolean>(false);
    const handleOpen = () => setDeleteModal(true);
    const handleClose = () => setDeleteModal(false);

    // Deletes account
    // TODO: implementation of DELETE API
    async function deleteAccount() {
        // TODO: change DELETE call to call for user_id based on auth instead of preset
        const response = await fetch("/api/user/abcdef", {
            method: "DELETE",
        });

        const { data, error } = await response.json();
        
        if (error) {
            console.log("Error");
            console.log(error);
        } else {
            console.log("Success");
            console.log(data);
        }

        router.push("/");
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

            <hr style={{ marginTop: -10 }} />

            {/* Hidden input for changing profile pic */}
            <input
                id="profilePicChange"
                type="file"
                accept="image/png, image/jpeg, image/svg+xml"
                style={{ display: "none" }}
                onChange={changeProfilePic}
            />

            {(loading &&
                <p>Loading user data</p>
            ) || ( 
                    <div style={{ marginTop: 20 }}>
                        <Grid container sx={{ marginLeft: 4, marginRight:-2 }} spacing={20} alignItems="flex-start">
                            <Grid display="flex" flexDirection="column" alignItems="center">
                                <Box position="relative" display="inline-block">
                                    <Avatar src={userData.pfp} sx={{ width: 125, height: 125 }} />
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
                                        <EditIcon fontSize="small" onClick={profileEditClick} />
                                    </IconButton>
                                </Box>

                                <div className="ratings">
                                    <p><b>Buyer rating: {userData.buyerRating}/5</b></p>

                                    <p><b>Seller rating: {userData.sellerRating}/5</b></p>
                                </div>
                            </Grid>

                            <Grid container spacing={2} size={{ sm: 9.625, md: 9.625 }}>
                                <Grid size={{ xs: 12, md: 12 }}>
                                    <TextField
                                        label="Email"
                                        value={userData.email}
                                        name="email"
                                        sx={{ width: '100%' }}
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
                                </Grid>

                                <Grid size={{ xs: 12, md: 12 }}>
                                    <TextField
                                        fullWidth
                                        label="First Name - Required"
                                        value={userData.first}
                                        name="first"
                                        onChange={handleInputChange}
                                        style={{ marginTop: 10 }}
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
                                </Grid>

                                <Grid size={{ xs: 12, md: 12 }}>
                                    <TextField
                                        fullWidth
                                        label="Last Name - Required"
                                        value={userData.last}
                                        name="last"
                                        onChange={handleInputChange}
                                        style={{ marginTop: 10 }}
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
                                </Grid>

                                <Grid size={{ xs: 12, md: 12 }}>
                                    <TextField
                                        fullWidth
                                        label="Phone Number - Optional"
                                        value={userData.phone}
                                        name="phone"
                                        onChange={handleInputChange}
                                        style={{ marginTop: 10 }}
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
                                </Grid>

                            </Grid>
                        </Grid>

                        <ThemeProvider theme={theme}>
                            <Grid container spacing={20} sx={{ marginTop: 10, marginLeft: 4, marginRight: -21 }}>
                                <Grid size={{xs: 3, sm: 3, md: 3}}>
                                    <Button variant="contained" color="buttonBlue">
                                        <Link href="/sellers_home">View my listings</Link>
                                    </Button>
                                </Grid>

                                <Grid size={{md: 3}}>
                                    <Button variant="contained" onClick={handleUpdate} color="buttonBlue">Update Account</Button>
                                </Grid>

                                <Grid size={{md: 3}}>
                                    <Button variant="contained" onClick={handleOpen} color="deleteRed">Delete account</Button>
                                </Grid>

                                <Grid size={{md: 3}}>
                                    <Button variant="contained" color="deleteRed">
                                        <Link href="/">Log out</Link>
                                    </Button>
                                </Grid>

                            </Grid>    
                        </ThemeProvider>
                        

                    </div>
                )}

            {/* Modal for deleting account */}
            <Modal
                open={deleteModal}
                onClose={handleClose}
            >
                <Box className="modals">
                    <p><b>Are you sure you want to delete your account?</b></p>
                    <div style={{marginTop: 10}}>
                        <ThemeProvider theme={theme}>
                            <Grid container spacing={3}>
                                <Button onClick={deleteAccount} variant="contained" color="deleteRed">Yes</Button>
                                <Button onClick={handleClose} variant="contained" color="buttonBlue">No</Button>
                            </Grid>
                            
                        </ThemeProvider>    
                    </div>
                </Box>
            </Modal>

            {/* Modals for different outcomes for updating account */}
        </div>
    )
}

export default Account;