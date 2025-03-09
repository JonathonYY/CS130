import React, { useState } from "react";
import { Button, Box } from "@mui/material";
import FlagIcon from "@mui/icons-material/Flag";
import { useAuth } from "@/lib/authContext";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const ReportButton = (idObj) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const { user, token } = useAuth();
  const [severity, setSeverity] = useState("info");
  const reportUser = async () => {
    try {
      if (!token) {
        setSeverity("error");
        setSnackbarMessage("Unauthorized user");
        setSnackbarOpen(true);
        return;
      }

      const response = await fetch(`/api/listing/${idObj.idObj}/report/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ 
            user_id: user.uid
        }),
      });
      const data = await response.json();

      if (data.error) {
        setSeverity("error");
        setSnackbarMessage(data.error);
        setSnackbarOpen(true);
        return;
      }
      setSeverity("info");
      setSnackbarMessage("Listing has been reported!");
      setSnackbarOpen(true);
    } catch (error) {
      console.log(error);
      setSeverity("error");
      setSnackbarMessage("Error reporting!");
      setSnackbarOpen(true);
    }
  };
  const handleClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{marginLeft:'auto'}}>
      <Button variant="contained" color="error" startIcon={<FlagIcon />} onClick={reportUser}>
        Report
      </Button>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleClose} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
          <MuiAlert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
          {snackbarMessage}
          </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default ReportButton;
