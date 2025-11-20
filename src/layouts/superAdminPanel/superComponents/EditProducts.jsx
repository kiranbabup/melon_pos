import React, { useEffect, useState } from "react";
import { getAllCategories, getAllSuppliers, getAllBrands, getAllUnits, updateProduct } from "../../../services/api";
import {
    Box, Button, Typography, Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";

function EditProductsModal({ open, onClose, productsData, fetchProducts, }) {
    const [loading, setLoading] = useState(false);
    const [productMesg, setProductMesg] = useState("");
    const [productErrMesg, setProductErrMesg] = useState("");
    const [formData, setFormData] = useState({
        batch_number: "",
        products_name: "",
        products_description: "",
        products_price: "",
        discount_price: "",
        gst: "",
        quantity: "",
        qty_alert: "",
        stock_type: "package",
        unit_id: "",
        category_id: "",
        supplier_id: "",
        brand_id: "",
        manufacturing_date: "",
        expiry_date: "",
    });
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [brands, setBrands] = useState([]);
    const [units, setUnits] = useState([]);

    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const catRes = await getAllCategories();
                const supRes = await getAllSuppliers();
                const brandRes = await getAllBrands();
                const unitRes = await getAllUnits();

                setCategories(catRes.data || []);
                setSuppliers(supRes.data || []);
                setBrands(brandRes.data || []);
                setUnits(unitRes.data || []);
            } catch (err) {
                console.error("Failed to fetch dropdown data", err);
            }
        };

        fetchDropdowns();

        if (productsData) {
            setFormData({
                batch_number: productsData.batch_number || "",
                products_name: productsData.products_name || "",
                products_description: productsData.products_description || "",
                products_price: productsData.products_price || "",
                discount_price: productsData.discount_price || "",
                gst: productsData.gst || "",
                quantity: productsData.quantity || "",
                qty_alert: productsData.qty_alert || "",
                stock_type: productsData.stock_type || "package",
                unit_id: productsData.unit_id || "",
                category_id: productsData.category_id || "",
                // supplier_id: productsData.supplier_id || "",
                brand_id: productsData.brand_id || "",
                manufacturing_date: productsData.manufacturing_date?.slice(0, 10) || "",
                expiry_date: productsData.expiry_date?.slice(0, 10) || "",
            });
        }
    }, [productsData]); // ✅ depend on productsData


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const editProductdata = async () => {
        try {
            // console.log(formData);

            const response = await updateProduct(productsData.barcode, formData);
            // console.log(response);
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
                <Grid container spacing={2} sx={{ my: 2 }} >
                    {/* String Fields */}
                    <Grid item size={6}>
                        <Typography fontWeight="bold">Barcode: {productsData.barcode}</Typography>
                    </Grid>

                    <Grid item size={6}>
                        <TextField
                            fullWidth
                            label="Batch Number"
                            name="batch_number"
                            value={formData.batch_number}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </Grid>

                    <Grid item size={6} container spacing={2}>
                        <Grid item size={12}>
                            <TextField
                                fullWidth
                                label="Product Name"
                                name="products_name"
                                value={formData.products_name}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </Grid>

                        <Grid item size={4}>
                            <TextField
                                fullWidth
                                label="MRP"
                                name="products_price"
                                type="number"
                                inputProps={{ min: 1, step: "0.01" }}
                                value={formData.products_price}
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
                    </Grid>
                    {/* TextArea */}
                    <Grid item size={6}>
                        <TextField
                            fullWidth
                            label="Description"
                            name="products_description"
                            value={formData.products_description}
                            onChange={handleChange}
                            multiline
                            rows={4}
                            disabled={loading}
                        />
                    </Grid>

                    {/* Integers */}
                    <Grid item size={3}>
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

                    <Grid item size={3}>
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

                    {/* Stock Type */}
                    <Grid item size={6}>
                        <FormControl fullWidth>
                            <InputLabel>Stock Type</InputLabel>
                            <Select
                                name="stock_type"
                                value={formData.stock_type}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <MenuItem value="weight">Weight</MenuItem>
                                <MenuItem value="package">Package</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Dropdowns */}
                    <Grid item size={6}>
                        <FormControl fullWidth>
                            <InputLabel>Unit</InputLabel>
                            <Select
                                name="unit_id"
                                value={formData.unit_id}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                {units.map((u) => (
                                    <MenuItem key={u.unit_id} value={u.unit_id}>
                                        {u.unit}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item size={6}>
                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                {categories.map((c) => (
                                    <MenuItem key={c.category_id} value={c.category_id}>
                                        {c.category}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item size={6}>
                        <FormControl fullWidth>
                            <InputLabel>Supplier</InputLabel>
                            <Select
                                name="supplier_id"
                                value={formData.supplier_id}
                                onChange={handleChange}
                                disabled
                            >
                                {suppliers.map((s) => (
                                    <MenuItem key={s.suppliers_id} value={s.suppliers_id}>
                                        {s.suppliers_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item size={6}>
                        <FormControl fullWidth>
                            <InputLabel>Brand</InputLabel>
                            <Select
                                name="brand_id"
                                value={formData.brand_id}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                {brands.map((b) => (
                                    <MenuItem key={b.brand_id} value={b.brand_id}>
                                        {b.brand}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Dates */}
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
                </Grid>
            </DialogContent>
            <DialogActions sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Button variant="outlined"
                    color="error"
                    onClick={onClose}
                >
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