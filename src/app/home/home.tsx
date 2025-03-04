"use client";

import React, { useState } from "react";
import HomeGrid from "../../components/homeGrid";
import { useRouter } from "next/navigation";
import "../globals.css";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Modal from "@mui/material/Modal";
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { useAuth } from "@/lib/authContext";

const Home: React.FC = () => {
    // For routing purposes
    const router = useRouter();

    // For authentication purposes
    const { user, token, signInWithGoogle, signOutUser } = useAuth();
    // console.log(user);


    // For handling the search query
    const [searchInput, setSearchInput] = useState<string>("/api/listing");
    const [searchQuery, setSearchQuery] = useState<string>("/api/listing");

    const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = "/api/listing?query=" + event.target.value;
        setSearchInput(newQuery);
    }
    const handleQuerySubmit = () => setSearchQuery(searchInput);
    const handleQuerySubmitKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleQuerySubmit();
        }
    }


    // For handling the advanced search options modal
    const [searchModal, setSearchModal] = useState<boolean>(false);
    const handleOpen = () => setSearchModal(true);
    const handleClose = () => setSearchModal(false);


    return (
        <div>
            <Grid container alignItems="center" spacing={2} size={{xs:12, sm: 12, md:12}}>
                <Grid size={{xs:3, sm: 3, md:3}}>
                    <img 
                    src="logo1.png" 
                    alt="home page logo" 
                    className="logoGeneral logoHome"
                    onClick={() => router.push("/")}
                    />
                </Grid>

                <Grid size={{xs:6, sm: 6, md:6}}>
                    <TextField
                        id="standard-search"
                        label="Search field"
                        type="search"
                        variant="outlined"
                        size="small"
                        fullWidth
                        onChange={handleQueryChange}
                        onKeyDown={handleQuerySubmitKeyDown}
                        sx={{mt: 1.75}}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start" onClick={handleQuerySubmit} style={{cursor: "pointer"}}>
                                        <img src = "search.svg" width = "24" height = "24" />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    <p className="searchOptions" onClick={handleOpen}>Advanced search options</p>
                </Grid>
                
                <Grid size={{xs:3, sm:3, md:3}}>
                    <img 
                        src="icon.png"
                        alt="user icon"
                        className="userIcon"
                        onClick={() => router.push("/login")}
                    />    
                </Grid>
                
            </Grid>

            <hr style={{marginTop: 14}}/>

            <HomeGrid query={searchQuery}/>

            <Modal
                open={searchModal}
                onClose={handleClose}
            >
                <Box className="modals">
                    <p>TODO: Instructions go here</p>
                </Box>
            </Modal>
        </div>
    );
}


export default Home;
