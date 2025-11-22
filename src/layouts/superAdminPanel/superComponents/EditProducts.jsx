import React, { useEffect, useState } from "react";
import { updateProduct } from "../../../services/api";
import {
  Box,
  Button,
  Typography,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

function EditProductsModal({ open, onClose, productsData, fetchProducts }) {
  //   console.log(productsData);
  const [loading, setLoading] = useState(false);
  const [productMesg, setProductMesg] = useState("");
  const [productErrMesg, setProductErrMesg] = useState("");
  const [formData, setFormData] = useState({
    product_name: "",
    mrp_price: "",
    discount_price: "",
    gst: "",
    quantity: "",
    qty_alert: "",
    description: "",
    manufacturing_date: "",
    expiry_date: "",
  });

  useEffect(() => {
    if (productsData) {
      setFormData({
        product_name: productsData.product_name || "",
        mrp_price: productsData.mrp_price || "",
        discount_price: productsData.discount_price || "",
        gst: productsData.gst || "",
        quantity: productsData.quantity || "",
        qty_alert: productsData.qty_alert || "",
        description: productsData.description || "",
        manufacturing_date: productsData.manufacturing_date?.slice(0, 10) || "",
        expiry_date: productsData.expiry_date?.slice(0, 10) || "",
      });
    }
  }, [productsData]); // ✅ depend on productsData

  if (!productsData) {
    // nothing selected yet, avoid rendering fields that access it
    return null;
  }
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const editProductdata = async () => {
    try {
      // console.log(formData);
      setLoading(true);
      const response = await updateProduct(productsData.pr_id, formData);
      console.log(response);
      // console.log(response.data);
      if (response.status === 200) {
        setProductMesg(response.data.message);
        fetchProducts();
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        console.error("Failed to update status:", response.data.message);
        setProductErrMesg(response.data.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setProductMesg("");
        setProductErrMesg("");
      }, 20000);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Prodct Details</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ my: 2 }}>
          {/* String Fields */}
          <Grid item size={6}>
            <Typography fontWeight="bold">
              Category:{" "}
              {productsData?.category_id === 1 ? "Product" : "Service"}
            </Typography>
          </Grid>
          {productsData?.category_id === 1 && (
            <Grid item size={6}>
              <Typography fontWeight="bold">
                Barcode: {productsData?.barcode}
              </Typography>
            </Grid>
          )}
          <Grid item size={6}>
            <Typography fontWeight="bold">
              Brand: {productsData?.Brands?.[0]?.brand_name}
            </Typography>
          </Grid>
          <Grid item size={12}>
            <TextField
              fullWidth
              label="Product Name"
              name="product_name"
              value={formData.product_name}
              onChange={handleChange}
              disabled={loading}
            />
          </Grid>
          <Grid item size={12} container spacing={2}>
            <Grid item size={6} container spacing={2}>
              <Grid item size={4}>
                <TextField
                  fullWidth
                  label="MRP"
                  name="mrp_price"
                  type="number"
                  inputProps={{ min: 1, step: "0.01" }}
                  value={formData.mrp_price}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>

              <Grid item size={4}>
                <TextField
                  fullWidth
                  label="Selling Price"
                  name="discount_price"
                  type="number"
                  inputProps={{ min: 1, step: "0.01" }}
                  value={formData.discount_price}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>

              <Grid item size={4}>
                <TextField
                  fullWidth
                  label="GST (%)"
                  name="gst"
                  type="number"
                  inputProps={{ min: 1, max: 18, step: "0.01" }}
                  value={formData.gst}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>
              {productsData?.category_id === 1 && (
                <Grid item size={6}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    name="quantity"
                    type="number"
                    inputProps={{ min: 1 }}
                    value={formData.quantity}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>
              )}
              {productsData?.category_id === 1 && (
                <Grid item size={6}>
                  <TextField
                    fullWidth
                    label="Quantity Alert"
                    name="qty_alert"
                    type="number"
                    inputProps={{ min: 1 }}
                    value={formData.qty_alert}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>
              )}
            </Grid>
            {/* TextArea */}
            <Grid item size={6}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                disabled={loading}
              />
            </Grid>
          </Grid>

          {/* Dates */}

          {productsData?.category_id === 1 && (
            <Grid item size={6}>
              <TextField
                fullWidth
                label="Manufacturing Date"
                name="manufacturing_date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.manufacturing_date}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
          )}
          {productsData?.category_id === 1 && (
            <Grid item size={6}>
              <TextField
                fullWidth
                label="Expiry Date"
                name="expiry_date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.expiry_date}
                onChange={handleChange}
                disabled={!formData.manufacturing_date || loading}
                inputProps={{
                  min: formData.manufacturing_date || undefined,
                }}
              />
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Button variant="outlined" color="error" onClick={onClose}>
          Close
        </Button>
        <Box>
          {productMesg && (
            <Typography sx={{ color: "green", fontSize: "0.9rem" }}>
              {productMesg}
            </Typography>
          )}
          {productErrMesg && (
            <Typography sx={{ color: "red", fontSize: "0.9rem" }}>
              {productErrMesg}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          color="success"
          onClick={() => editProductdata()}
          disabled={loading}
        >
          {loading ? "Editing..." : "Edit Product"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditProductsModal;
