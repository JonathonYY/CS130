import React, { useState } from "react";
import { TextField, Button, Select, MenuItem, InputLabel, FormControl, Typography, Box, IconButton, Link } from "@mui/material";
import { styled } from "@mui/system";
import DeleteIcon from "@mui/icons-material/Delete";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const ImageUpload = styled("input")({
  display: "none",
});

const UpdateListingForm = (listingObj) => {
  const [title, setTitle] = useState(listingObj.listingObj.title);
  const [price, setPrice] = useState(listingObj.listingObj.price);
  const [description, setDescription] = useState(listingObj.listingObj.description);
  const [category, setCategory] = useState(listingObj.listingObj.category);
  const [condition, setCondition] = useState(listingObj.listingObj.condition);
  const [images, setImages] = useState(listingObj.listingObj.image_paths.length > 0 ? listingObj.listingObj.image_paths.map((img_path) => [img_path, null]) : []);
  
  const [isChanged, setIsChanged] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map((file) => [URL.createObjectURL(file), file]);
    
    setImages((prevImages) => [...prevImages, ...newImages]);
    setIsChanged(true);
  };

  const handleRemoveImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setIsChanged(true);
  };

  const handleClose = () => {
    setSnackbarOpen(false);
  };

  const handleUpload = async (file) => {
    if (!file) return Promise.resolve(null);
    
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
    setUploading(true);
    let imageUrls = [];
    for (let imgPair of images) {
      try {
        
        let returnedUrl = await handleUpload(imgPair[1]);
        if (!returnedUrl) {
          returnedUrl = imgPair[0];
        }
        imageUrls.push(returnedUrl);
      }
      catch (error) {
        console.log("Image Upload Failed:", error);
      }
      
    }
    try {
      const response = await fetch(`/api/listing/${listingObj.listingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          title: title,
          price: price,
          condition: condition,
          category: category,
          description: description,
          selected_buyer: listingObj.listingObj.selected_buyer,
          potential_buyers: listingObj.listingObj.potential_buyers,
          image_paths: imageUrls
        }),
      });
      const updateResult = await response.json();

      if (updateResult.error) {
        setSnackbarMessage(updateResult.error);
        setSnackbarOpen(true);
        setUploading(false);
        setIsChanged(false);
        return;
      }

      setSnackbarMessage(
        <>
          View changes{" "}
          <Link href={`view_listing?id=${listingObj.listingId}`}>
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
    setIsChanged(false);
  };

  const isFormIncomplete = !isChanged || !title || !description || !category || !condition || images.length === 0;

  return (
    <Box sx={{ maxWidth: 500, margin: "auto", p: 3, boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>
        Change a Listing
      </Typography>

      <TextField
        label="Item Title"
        fullWidth
        variant="outlined"
        margin="normal"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setIsChanged(true);
        }}
      />

      <TextField
        label="Price ($)"
        fullWidth
        type="number"
        variant="outlined"
        margin="normal"
        value={price}
        onChange={(e) => {
          setPrice(e.target.value);
          setIsChanged(true);
        }}
      />

      <TextField
        label="Description"
        fullWidth
        multiline
        rows={4}
        variant="outlined"
        margin="normal"
        value={description}
        onChange={(e) => {
          setDescription(e.target.value);
          setIsChanged(true);
        }}
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>Category</InputLabel>
        <Select value={category} onChange={(e) => {
          setCategory(e.target.value);
          setIsChanged(true);
        }}>
          <MenuItem value="electronics">electronics</MenuItem>
          <MenuItem value="clothing">clothing</MenuItem>
          <MenuItem value="furniture">furniture</MenuItem>
          <MenuItem value="toys">toys</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel>Condition</InputLabel>
        <Select value={condition} onChange={(e) => {
          setCondition(e.target.value);
          setIsChanged(true);
        }}>
          <MenuItem value="new">new</MenuItem>
          <MenuItem value="great">great</MenuItem>
          <MenuItem value="good">good</MenuItem>
          <MenuItem value="used">used</MenuItem>
          <MenuItem value="poor">poor</MenuItem>
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
        {uploading ? "Updating..." : "Change Listing"}
      </Button>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleClose} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} >
          <MuiAlert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          {snackbarMessage}
          </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default UpdateListingForm;
