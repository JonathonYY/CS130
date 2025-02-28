import React from "react";
import { Button } from "@mui/material";
import FlagIcon from "@mui/icons-material/Flag";

const ReportButton = ({ onClick }) => {
  return (
    <Button variant="contained" color="error" startIcon={<FlagIcon />} onClick={onClick}>
      Report
    </Button>
  );
};

export default function App() {
    return (
      <ReportButton onClick={() => alert("Reported!")} />
    );
}