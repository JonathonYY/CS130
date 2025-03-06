import React, { useState } from "react";
import { TextField, Button, Select, MenuItem, InputLabel, FormControl, Typography, Box, IconButton, Link } from "@mui/material";
import { styled } from "@mui/system";
import DeleteIcon from "@mui/icons-material/Delete";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import {useAuth} from "@/lib/authContext";
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
  const {user} = useAuth();

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

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file); // 'image' is the field name on the backend

    try {
      const response = await fetch("/api/image", {
        method: "POST",
        body: formData,
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

  const handleSubmitListing = async () => {
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
    console.log("img urls:", imageUrls);
    try {
      const response = await fetch(`/api/listing/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      console.log(createResult.data.listing_id);
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
      setSnackbarMessage("Error publishing message!");
      setSnackbarOpen(true);
    }
    setUploading(false);
    console.log("created listing:", { title, price, description, category, condition, imageUrls });
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
        <InputLabel>Category</InputLabel>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <MenuItem value="Electronics">Electronics</MenuItem>
          <MenuItem value="Clothing">Clothing</MenuItem>
          <MenuItem value="Furniture">Furniture</MenuItem>
          <MenuItem value="Toys">Toys</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel>Condition</InputLabel>
        <Select value={condition} onChange={(e) => setCondition(e.target.value)}>
          <MenuItem value="New">New</MenuItem>
          <MenuItem value="Great">Great</MenuItem>
          <MenuItem value="Good">Good</MenuItem>
          <MenuItem value="Used">Used</MenuItem>
          <MenuItem value="Poor">Poor</MenuItem>
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
          <MuiAlert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          {snackbarMessage}
          </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default CreateListingForm;
