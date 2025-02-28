import React, { useState } from "react";
import { TextField, Button, Select, MenuItem, InputLabel, FormControl, Typography, Box } from "@mui/material";
import { styled } from "@mui/system";

const ImageUpload = styled("input")({
  display: "none",
});

const CreateListingForm = () => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [image, setImage] = useState(null);

  const handleImageUpload = (event) => {
    if (event.target.files.length > 0) {
      setImage(URL.createObjectURL(event.target.files[0]));
    }
  };

  const handleSubmitListing = () => {
    console.log({ title, price, description, category, condition, image });
    // send data to back end
  };

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
          <ImageUpload accept="image/*" id="image-upload" type="file" onChange={handleImageUpload} />
          <Button variant="contained" component="span" fullWidth>
            Upload Image
          </Button>
        </label>
      </Box>

      {image && <Box component="img" src={image} alt="Uploaded" sx={{ width: "100%", mt: 2, borderRadius: 2 }} />}

      <Button variant="contained" color="primary" fullWidth sx={{ mt: 3 }} onClick={handleSubmitListing}>
        Create Listing
      </Button>
    </Box>
  );
};

export default CreateListingForm;
