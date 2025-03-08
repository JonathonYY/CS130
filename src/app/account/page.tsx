'use client'

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    ThemeProvider,
    Rating
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import { useAuth } from "@/lib/authContext";
import Image from "next/image";


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
    // For routing purposes
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
    const [userPfp, setUserPfp] = useState<string>("");
    const [userPfpFile, setUserPfpFile] = useState<File>();

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

    // For authentication purposes
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { user, token, signInWithGoogle, signOutUser } = useAuth();
    const accountURL = "/api/user/" + user?.uid;


    // Make get call to get user info
    const getUserInfo = async () => {
        if (accountURL === "/api/user/undefined") {
            return;
        }

        const response = await fetch(accountURL, {
            method: "GET",
        });

        const { data, error } = await response.json();
        if (error && error == "user does not exist") {
            // If user does not exist, means that they need a new account. Create account then make new GET call if success
            const createResult = await createNewUser();
            if (createResult) {
                getUserInfo();
            } else {
                console.log("Error");
                console.log(error);
            }
        } else if (error) {
            console.log("Error");
            console.log(error);
        } else {
            setUserPfp(data.pfp);
            setUserData({
                email: data.email_address,
                first: data.first,
                last: data.last,
                pfp: data.pfp,
                phone: data.phone_number,
                buyerRating: data.buyer_rating,
                sellerRating: data.seller_rating
            });
            setLoading(false);
        }
    }


    // Create account for new user
    const createNewUser = async () => {
        let first = "First";
        let last = "Last";
        if (typeof user?.displayName === 'string') {
            const splitName = user.displayName.split(" ");
            first = splitName[0];
            last = splitName[1];
        }

        const response = await fetch("/api/user", {
            body: JSON.stringify({
                user_id: user?.uid,
                first: first,
                last: last,
                email_address: user?.email
            }),
            method: "POST"
        });

        const { data, error } = await response.json();
        if (error) {
            console.log("Error");
            console.log(error);
            return false;
        } else {
            console.log("Successfully created account");
            console.log(data);
            return true;
        }
    }


    // run on page load
    useEffect(() => {
        getUserInfo();
    }, [user]);

    useEffect(() => {
        if (user === undefined) return; // Wait until user is determined
        if (user === null) {
        router.push("/login");
        return;
        }
    }, [user, router]);

    // Opens up modal for updating account
    const [updateModal, setUpdateModal] = useState<boolean>(false);
    const handleOpenUpdate = () => setUpdateModal(true);
    const handleCloseUpdate = () => setUpdateModal(false);

    // Handles message displayed by update modal
    const [updateModalMessage, setUpdateModalMessage] = useState<string>("");

    // Allows the profile picture to be changed upon clicking avatar
    const profileEditClick = () => {
        document.getElementById("profilePicChange")?.click();
    };


    // Handles changing the profile picture
    const changeProfilePic = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        // console.log(file);
        if (file && ["image/png", "image/jpeg", "image/svg+xml"].includes(file.type)) {
            setUserPfpFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setUserPfp(reader.result as string);
            }
            reader.readAsDataURL(file);
        } else {
            setUpdateModalMessage("Invalid image!");
            handleOpenUpdate();
        }
    }


    // Handles form changes
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUserData({
            ...userData,
            [event.target.name]: event.target.value
        });
    }


    // Upload image
    const uploadImage = async () => {
        const formData = new FormData();
        if (userPfpFile instanceof File) {
            console.log(userPfpFile);
            formData.append("image", userPfpFile);
        }

        const imgResponse = await fetch("/api/image", {
            method: "POST",
            body: formData,
        });

        const { data, error } = await imgResponse.json();
        if (error) {
            setUpdateModalMessage("Error Uploading Image!");
            handleOpenUpdate();
            console.log(error);
            return "";
        }

        setUserData({
            ...userData,
            pfp: data
        });

        return data;
    }


    // Handles updating the account
    const handleUpdate = async () => {
        if (userData.first == "" || userData.last == "") {
            setUpdateModalMessage("Missing required fields!");
            handleOpenUpdate();
            return;
        }

        const result = await uploadImage();

        const response = await fetch(accountURL, {
            body: JSON.stringify({
                first: userData.first,
                last: userData.last,
                pfp: result,
                phone_number: userData.phone
            }),
            method: "PATCH",
        });

        const { data, error } = await response.json();

        if (error) {
            setUpdateModalMessage("Error updating account!");
            console.log(error);
        } else {
            setUpdateModalMessage("Successfully updated account!");
            console.log(data);
        }
        handleOpenUpdate();
    }


    // Opens up modal for deleting account
    const [deleteModal, setDeleteModal] = useState<boolean>(false);
    const handleOpenDelete = () => setDeleteModal(true);
    const handleCloseDelete = () => setDeleteModal(false);

    // Deletes account
    async function deleteAccount() {
        const response = await fetch(accountURL, {
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

                <Image
                    src="/logo1.png"
                    alt="logo"
                    className="logoGeneral"
                    onClick={() => router.push("/")}
                    width="52"
                    height="52"
                />
            </div>

            <hr />

            {/* Hidden input for changing profile pic */}
            <input
                id="profilePicChange"
                type="file"
                accept="image/png, image/jpeg, image/svg+xml"
                style={{ display: "none" }}
                onChange={changeProfilePic}
            />

            {(loading &&
                <p className="loading"><b>Loading user data</b></p>
            ) || (
                    <div style={{ marginTop: 20 }}>
                        <Grid container sx={{ marginLeft: 4, marginRight: -2 }} spacing={20} alignItems="flex-start">
                            <Grid display="flex" flexDirection="column" alignItems="center">
                                <Box position="relative" display="inline-block">
                                    <Avatar src={userPfp} sx={{ width: 125, height: 125 }} />
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
                                    <p><b>Buyer rating: </b></p>
                                    <Rating value={userData.buyerRating} readOnly precision={0.5} />

                                    <p><b>Seller rating: </b></p>
                                    <Rating value={userData.sellerRating} readOnly precision={0.5} />
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
                            <Grid container spacing={20} sx={{ marginTop: 10, marginLeft: 4, marginRight: -6.75 }}>
                                <Grid size={{ xs: 2.4, sm: 2.4, md: 2.4 }}>
                                    <Button variant="contained" color="buttonBlue">
                                        <Link href="/sellers_home">My listings</Link>
                                    </Button>
                                </Grid>

                                <Grid size={{ xs: 2.4, sm: 2.4, md: 2.4 }}>
                                    <Button variant="contained" color="buttonBlue">
                                        <Link href="/buyers_home">My interests</Link>
                                    </Button>
                                </Grid>

                                <Grid size={{ xs: 2.4, sm: 2.4, md: 2.4 }}>
                                    <Button variant="contained" onClick={handleUpdate} color="buttonBlue">Update Account</Button>
                                </Grid>

                                <Grid size={{ xs: 2.4, sm: 2.4, md: 2.4 }}>
                                    <Button variant="contained" onClick={handleOpenDelete} color="deleteRed">Delete account</Button>
                                </Grid>

                                <Grid size={{ xs: 2.4, sm: 2.4, md: 2.4 }}>
                                    <Button variant="contained" color="deleteRed" onClick={signOutUser}>
                                        <Link href="/">Log out</Link>
                                    </Button>
                                </Grid>

                            </Grid>
                        </ThemeProvider>


                    </div>
                )}

            {/* Modal for updating account */}
            <Modal
                open={updateModal}
                onClose={handleCloseUpdate}
            >
                <Box className="modals">
                    <p><b>{updateModalMessage}</b></p>
                </Box>
            </Modal>

            {/* Modal for deleting account */}
            <Modal
                open={deleteModal}
                onClose={handleCloseDelete}
            >
                <Box className="modals">
                    <p><b>Are you sure you want to delete your account?</b></p>
                    <div style={{ marginTop: 10 }}>
                        <ThemeProvider theme={theme}>
                            <Grid container spacing={3}>
                                <Button onClick={deleteAccount} variant="contained" color="deleteRed">Yes</Button>
                                <Button onClick={handleCloseDelete} variant="contained" color="buttonBlue">No</Button>
                            </Grid>

                        </ThemeProvider>
                    </div>
                </Box>
            </Modal>
        </div>
    )
}

export default Account;