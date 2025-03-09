import React, { useState } from "react";
import { TextField, Button, Select, MenuItem, InputLabel, FormControl, Typography, Box, IconButton, Link } from "@mui/material";
import { styled } from "@mui/system";
import DeleteIcon from "@mui/icons-material/Delete";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import OutlinedInput from '@mui/material/OutlinedInput';
import { useAuth } from "@/lib/authContext";

const ImageUpload = styled("input")({
  display: "none",
});

const CreateListingForm = () => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [images, setImages] = useState([]);

  const [uploading, setUploading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [severity, setSeverity] = useState("success");
  const { user, token } = useAuth();

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map((file) => [URL.createObjectURL(file), file]);
    setImages((prevImages) => [...prevImages, ...newImages]);
  };

  const handleRemoveImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    setSnackbarOpen(false);
  };

  const handleUpload = async (file) => {
    if (!file) return;

    if (!token) {
      return Promise.reject("Unauthorized user!");
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file); // 'image' is the field name on the backend

    try {
      const response = await fetch("/api/image", {
        method: "POST",
        body: formData,
        headers: { "Authorization": `Bearer ${token}`, },
      });

      const { data, error } = await response.json();
      if (error) {
        throw new Error("Upload failed");
      }

      return Promise.resolve(data);
    } catch (error) {
      console.error("error uploading file", error);
    }
    return Promise.reject("Image Upload Failed!");
  };
  const clearForm = () => {
    setTitle("");
    setPrice("");
    setDescription("");
    setCategory("");
    setCondition("");
    setImages([]);
  };

  const handleSubmitListing = async () => {
    if (!token) {
      setSeverity("error");
      setSnackbarMessage("Unauthorized user");
      setSnackbarOpen(true);
      setUploading(false);
      return;
    }
    let imageUrls = [];
    for (let imgPair of images) {
      try {
        const returnedUrl = await handleUpload(imgPair[1]);
        imageUrls.push(returnedUrl);
      }
      catch (error) {
        console.log("Image Upload Failed:", error);
      }
    }
    try {
      const response = await fetch(`/api/listing/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ 
            user_id : user.uid,
            title: title,
            price: price,
            condition: condition,
            category: category,
            description: description,
            image_paths: imageUrls
        }),
      });
      const createResult = await response.json();
      setSeverity("success");
      setSnackbarMessage(
        <>
          Listing created{" "}
          <Link href={`view_listing?id=${createResult.data.listing_id}`}>
            here
          </Link>!
        </>
      );
      setSnackbarOpen(true);
    } catch (error) {
      console.log(error);
      setSeverity("error");
      setSnackbarMessage("Error creating listing!");
      setSnackbarOpen(true);
    }
    setUploading(false);
    clearForm();
  };

  const isFormIncomplete = !title || !price || !description || !category || !condition || images.length === 0;

  return (
    <Box sx={{ maxWidth: 500, margin: "auto", p: 3, boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>
        Create a Listing
      </Typography>

      <TextField
        label="Item Title"
        fullWidth
        variant="outlined"
        margin="normal"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <TextField
        label="Price ($)"
        fullWidth
        type="number"
        variant="outlined"
        margin="normal"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <TextField
        label="Description"
        fullWidth
        multiline
        rows={4}
        variant="outlined"
        margin="normal"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <FormControl fullWidth margin="normal">
        <InputLabel id="category-label">Category</InputLabel>
        <Select value={category} id="category-label" input={<OutlinedInput label="Category" />} onChange={(e) => setCategory(e.target.value)}>
          <MenuItem value="ELECTRONICS">Electronics</MenuItem>
          <MenuItem value="CLOTHING">Clothing</MenuItem>
          <MenuItem value="FURNITURE">Furniture</MenuItem>
          <MenuItem value="DORMWARE">Dormware</MenuItem>
          <MenuItem value="TOYS">Toys</MenuItem>
          <MenuItem value="SCHOOL">School</MenuItem>
          <MenuItem value="SERVICES">Services</MenuItem>
          <MenuItem value="HEALTH">Health</MenuItem>
          <MenuItem value="BEAUTY">Beauty</MenuItem>
          <MenuItem value="TICKETS">Tickets</MenuItem>
          <MenuItem value="MISC">Miscellaneous</MenuItem>

        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel id="condition-label">Condition</InputLabel>
        <Select value={condition} id="condition-label" input={<OutlinedInput label="Condition" />} onChange={(e) => setCondition(e.target.value)}>
          <MenuItem value="NEW">New</MenuItem>
          <MenuItem value="GREAT">Great</MenuItem>
          <MenuItem value="GOOD">Good</MenuItem>
          <MenuItem value="USED">Used</MenuItem>
          <MenuItem value="POOR">Poor</MenuItem>
          <MenuItem value="DAMAGED">Damaged</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ mt: 2 }}>
        <label htmlFor="image-upload">
          <ImageUpload accept="image/*" id="image-upload" type="file" multiple onChange={handleImageUpload} />
          <Button variant="contained" component="span" fullWidth>
            Upload Images
          </Button>
        </label>
      </Box>

      {images.length > 0 && (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
          {images.map((img, index) => (
            <Box key={index} sx={{ position: "relative", width: 100, height: 100 }}>
              <img src={img[0]} alt={`image ${index}`} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 4 }} />
              <IconButton
                sx={{ position: "absolute", top: 0, right: 0, backgroundColor: "rgba(0,0,0,0.6)", color: "white" }}
                size="small"
                onClick={() => handleRemoveImage(index)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}

      <Button variant="contained" color="primary" fullWidth sx={{ mt: 3 }} onClick={handleSubmitListing} disabled={isFormIncomplete || uploading}>
        {uploading ? "Publishing..." : "Create Listing"}
      </Button>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleClose} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} >
          <MuiAlert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
          {snackbarMessage}
          </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default CreateListingForm;
