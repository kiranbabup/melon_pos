import React, { useEffect, useState } from "react";
import { createProduct, getAllBrands } from "../../services/api";
import {
  Box,
  Button,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import LeftPannel from "../../components/LeftPannel";
import HeaderPannel from "../../components/HeaderPannel";
import LsService, { storageKey } from "../../services/localstorage";

function CreateMainProducts() {
  const [loading, setLoading] = useState(false);
  const [productMesg, setProductMesg] = useState("");
  const [productErrMesg, setProductErrMesg] = useState("");
  const [formData, setFormData] = useState({
    product_name: "",
    product_description: "",
    product_price: "",
    discount_price: "",
    gst: "",
    barcode: "",
    quantity: "",
    qty_alert: "",
    category_id: "",
    brand_id: "",
    manufacturing_date: "",
    expiry_date: "",
  });
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const brandRes = await getAllBrands();
        // console.log(brandRes.data.data);

        setBrands(brandRes.data.data || []);
      } catch (err) {
        console.error("Failed to fetch dropdown data", err);
      }
    };

    fetchDropdowns();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const userDetails = LsService.getItem(storageKey);

  const handleCreateProduct = async () => {
    try {
      setLoading(true);
      setProductMesg("");
      setProductErrMesg("");
      // console.log(formData);

      const isService = Number(formData.category_id) === 2; // 1 = Product, 2 = Service

      const payload = {
        branch_id: userDetails.branch_id,
        category_id: Number(formData.category_id),
        product_name: formData.product_name,
        mrp_price: Number(formData.product_price),
        discount_price: Number(formData.discount_price),
        quantity: Number(formData.quantity),
        qty_alert: Number(formData.qty_alert),

        brand_id: Number(formData.brand_id),
        is_product: isService ? 0 : 1,
        barcode: isService ? null : Number(formData.barcode),

        description: formData.product_description || "",
        gst: formData.gst ? Number(formData.gst) : 0,
        manufacturing_date: isService ? null : formData.manufacturing_date,
        expiry_date: isService ? null : formData.expiry_date,
      };
      // console.log(payload);

      const response = await createProduct(payload);

      if (response.status === 201) {
        setProductMesg(response.data.message);
        onClear();
      } else {
        console.error("Failed to add Product:", response.data.message);
        setProductErrMesg(response.data.message);
      }
    } catch (error) {
      setProductErrMesg(
        error?.response?.data?.message || "Error creating product"
      );
      console.error("Failed to add Product:", error.response || error);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setProductMesg("");
        setProductErrMesg("");
      }, 20000);
    }
  };

  const onClear = () => {
    setFormData({
      product_name: "",
      product_description: "",
      product_price: "",
      discount_price: "",
      gst: "",
      barcode: "",
      quantity: "",
      qty_alert: "",
      category_id: "",
      brand_id: "",
      manufacturing_date: "",
      expiry_date: "",
    });
  };

  return (
    <Box
      sx={{
        width: "99vw",
        height: "94vh",
        backgroundColor: "white",
        display: "flex",
      }}
    >
      {/* left pannel */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "start",
          width: "18vw",
          mt: 1.5,
          ml: 1,
        }}
      >
        <LeftPannel HeaderTitle="Super Admin" />
      </Box>

      {/* Right pannel */}
      <Box sx={{ minWidth: "calc( 99vw - 18vw)", ml: 1.5 }}>
        <HeaderPannel HeaderTitle="Add Products or Services" />
        <Box sx={{ width: "99%" }}>
          <Box
            sx={{
              borderRadius: "10px",
              boxShadow:
                "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
              height: "100%",
              p: 2,
              mb: 1,
              background: "#fff",
              // display: "flex",
              // justifyContent: "space-between",
            }}
          >
            <Grid container spacing={2}>
              <Grid item size={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <MenuItem value="1">Product</MenuItem>
                    <MenuItem value="2">Service</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {Number(formData.category_id) === 1 && (
                <Grid item size={6}>
                  <TextField
                    fullWidth
                    label="Barcode (Manual input or use Scanner)"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </Grid>
              )}
              <Grid item size={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="brand-label">Brand</InputLabel>

                  <Select
                    labelId="brand-label"
                    id="brand-select"
                    name="brand_id"
                    value={formData.brand_id}
                    label="Brand"
                    onChange={handleChange}
                    disabled={loading}
                    MenuProps={{
                      disablePortal: true, // 👈 ensures dropdown opens below
                    }}
                  >
                    {brands.map((b) => (
                      <MenuItem key={b.brand_id} value={b.brand_id}>
                        {b.brand_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item size={6}>
                <TextField
                  fullWidth
                  label={
                    Number(formData.category_id) === 1
                      ? "Product Name"
                      : "Service Name"
                  }
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
                      name="product_price"
                      type="number"
                      inputProps={{ min: 1, step: "0.01" }}
                      value={formData.product_price}
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
                  {Number(formData.category_id) === 1 && (
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
                  {Number(formData.category_id) === 1 && (
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
                    name="product_description"
                    value={formData.product_description}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    disabled={loading}
                  />
                </Grid>
              </Grid>
              {/* Dropdowns */}

              {/* Dates */}
              {Number(formData.category_id) === 1 && (
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
              {Number(formData.category_id) === 1 && (
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
            <Box
              sx={{
                mt: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Button variant="outlined" color="error" onClick={onClear}>
                Clear
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
                onClick={handleCreateProduct}
                disabled={loading}
              >
                {loading
                  ? "Creating..."
                  : Number(formData.category_id) === 1
                  ? "Create Product"
                  : "Create Service"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default CreateMainProducts;
