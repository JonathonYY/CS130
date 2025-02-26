'use client'

import React, { useState } from "react";
import HomeGrid from "../../components/homeGrid";
import { useRouter } from "next/navigation";
import "../globals.css";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Modal from "@mui/material/Modal";
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';


const Home: React.FC = () => {
    // For routing purposes
    const router = useRouter();


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

            <HomeGrid />

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