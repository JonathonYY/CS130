import React, { useState } from "react";
import { TextField, Button, Select, MenuItem, InputLabel, FormControl, Typography, Box, IconButton } from "@mui/material";
import { styled } from "@mui/system";
import DeleteIcon from "@mui/icons-material/Delete";

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

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map((file) => URL.createObjectURL(file));
    setImages((prevImages) => [...prevImages, ...newImages]);

  };

  const handleRemoveImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const handleSubmitListing = () => {
    console.log({ title, price, description, category, condition, images });
    // send data to back end
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
              <img src={img} alt={`image ${index}`} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 4 }} />
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

      <Button variant="contained" color="primary" fullWidth sx={{ mt: 3 }} onClick={handleSubmitListing} disabled={isFormIncomplete}>
        Create Listing
      </Button>
    </Box>
  );
};

export default CreateListingForm;
