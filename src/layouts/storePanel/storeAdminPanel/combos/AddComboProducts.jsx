import React, { useEffect, useState } from "react";
import { getStoreInvtryDetails, addCombo } from "../../../../services/api";
import { Box, Button, Typography, Grid, TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import LeftPannel from "../../../../components/LeftPannel";
import HeaderPannel from "../../../../components/HeaderPannel";
import LsService, { storageKey } from "../../../../services/localstorage";

function AddComboProducts() {
    const [loading, setLoading] = useState(false);
    const [productMesg, setProductMesg] = useState("");
    const [productErrMesg, setProductErrMesg] = useState("");

    const [storeId, setStoreId] = useState(null);
    const [userId, setUserId] = useState(null);
    const [storeProducts, setStoreProducts] = useState([]);

    const [comboQty, setComboQty] = useState(0);
    const [comboPrice, setComboPrice] = useState(0);
    const [comboFinalQunatity, setComboFinalQunatity] = useState(0);

    const [formData, setFormData] = useState({
        combo_name: "",
        combo_description: "",
        barcodes: "",
        product_ids: "",
        product_names: "",
        product_price: "",
        combo_price: 0,
        selectedProducts: [{ product_id: "", product_price: "" }],
    });

    // Get store_id from localStorage
    useEffect(() => {
        const fetchStoreId = async () => {
            try {
                const userLoginStatus = LsService.getItem(storageKey);
                // console.log(userLoginStatus);

                if (userLoginStatus) {
                    setStoreId(userLoginStatus.store_id);
                    setUserId(userLoginStatus.user_id);
                } else {
                    setProductErrMesg("Invalid store_code, no store found");
                }
            } catch (error) {
                console.error("Error fetching stores:", error);
                setProductErrMesg("Failed to fetch store details");
            } finally {
                setLoading(false);
            }
        };
        fetchStoreId();
    }, []);

    useEffect(() => {
        if (!storeId) return;

        const fetchStoreProducts = async () => {
            try {
                // console.log(storeId);

                setLoading(true);
                const response = await getStoreInvtryDetails(storeId);
                // console.log("Store Products:", response.data);

                const mappedData = response.data.data
                    .filter((prod) => prod.status === "Confirmed")
                    .map((prod, index) => ({
                        id: index + 1,
                        quantity: prod.quantity,
                        // flatten pos_product
                        barcode: prod.pos_product?.barcode,
                        products_id: prod.pos_product?.products_id,
                        products_name: prod.pos_product?.products_name,
                        products_price: prod.pos_product?.products_price,
                    }));

                // console.log(mappedData);

                setStoreProducts(mappedData);
            } catch (error) {
                console.error("Error fetching Store Products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStoreProducts();
    }, [storeId]);

    const handleComboChange = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        if (!formData.selectedProducts || formData.selectedProducts.length === 0) {
            setComboQty(0);
            setComboPrice(0);
            return;
        }

        const selectedProducts = formData.selectedProducts
            .filter((p) => p.product_id)
            .map((p) => {
                const prod = storeProducts.find(sp => sp.products_id === p.product_id);
                return { ...p, ...prod };
            });

        const barcodes = selectedProducts.map(p => p.barcode).join(",");
        const product_ids = selectedProducts.map(p => p.products_id).join(",");
        const product_names = selectedProducts.map(p => p.products_name).join(",");
        const product_price = selectedProducts.map(p => p.products_price).join(",");
        const combo_price = selectedProducts.reduce((sum, p) => sum + Number(p.products_price || 0), 0);

        const availableQuantities = selectedProducts.map(p => Number(p.quantity) || 0);
        const minQty = availableQuantities.length > 0 ? Math.min(...availableQuantities) : 0;

        setComboPrice(combo_price);
        setComboQty(minQty);

        setFormData((prev) => ({
            ...prev,
            barcodes,
            product_ids,
            product_names,
            product_price,
            combo_price,
        }));
    }, [formData.selectedProducts, storeProducts]);

    const handleProductChange = (index, name, value) => {
        const updatedProducts = [...formData.selectedProducts];
        updatedProducts[index][name] = value;
        setFormData((prev) => ({ ...prev, selectedProducts: updatedProducts }));
    };

    const handleAddMore = () => {
        setFormData((prev) => ({
            ...prev,
            selectedProducts: [...prev.selectedProducts, { product_id: "" }],
        }));
    };

    const handleRemove = (index) => {
        const updatedProducts = [...formData.selectedProducts];
        updatedProducts.splice(index, 1);
        setFormData((prev) => ({ ...prev, selectedProducts: updatedProducts }));
    };

    const handleCreateProduct = async () => {
        if (comboFinalQunatity > comboQty) {
            setProductErrMesg(`Combo quantity cannot exceed available stock (${comboQty})`);
            return;
        }
        try {
            setLoading(true);
            setProductMesg("");
            setProductErrMesg("");
            const payload = {
                store_id: storeId,
                combo_name: formData.combo_name,
                combo_description: formData.combo_description,
                barcodes: formData.barcodes,          // "25465,18463,35815"
                product_ids: formData.product_ids,    // "2,1,3"
                products: formData.product_names,     // "Dal,Chilli,Haldi"
                product_price: formData.product_price,// "20,30,50"
                combo_quantity: comboFinalQunatity,   // entered by user
                combo_price: formData.combo_price,     // 100 (sum)
                created_by: userId
            };
            // console.log("Final Payload:", payload);
            const response = await addCombo(payload);
            // console.log(response);
            if (response.status === 201) {
                setProductMesg(response.data.message);
            onClear();
            } else {
                setProductErrMesg(response.data.message);
            }
        } catch (error) {
            setProductErrMesg(
                error?.response?.data?.message || "Error adding product"
            );
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
            combo_name: "",
            combo_description: "",
            barcodes: "",
            product_ids: "",
            product_names: "",
            product_price: "",
            combo_price: 0,
            selectedProducts: [{ product_id: "", }],
        });
        setComboFinalQunatity(0);
        setComboQty(0);
        setComboPrice(0);
    }

    return (
        <Box sx={{
            width: "99vw",
            height: "94vh",
            backgroundColor: "white",
            display: "flex",
            gap: 2
        }}>
            {/* left pannel */}
            <Box
                sx={{
                    display: "flex", justifyContent: "center", alignItems: "start", width: "18vw", mt: 1.5
                }}
            >
                <LeftPannel HeaderTitle="Store Manager" />
            </Box>

            {/* Right pannel */}
            <Box sx={{ minWidth: "calc( 99vw - 18vw)", }} >
                <HeaderPannel HeaderTitle="Add Combo Products to Store Inventory" />
                <Box sx={{ width: "99%" }}>
                    <Box
                        sx={{
                            borderRadius: "10px",
                            boxShadow: "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
                            height: "100%",
                            p: 2,
                            mb: 1,
                            background: "#fff",
                            // display: "flex",
                            // justifyContent: "space-between",
                        }}
                    >
                        <TextField
                            fullWidth
                            label="Combo Name"
                            type="text"
                            value={formData.combo_name}
                            onChange={(e) =>
                                handleComboChange("combo_name", e.target.value)
                            }
                            disabled={loading}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Combo Description"
                            name="combo_description"
                            value={formData.combo_description}
                            onChange={(e) =>
                                handleComboChange("combo_description", e.target.value)}
                            multiline
                            rows={4}
                            disabled={loading}
                            sx={{ mb: 2 }}
                        />

                        {/* Dynamic Product Rows */}
                        {formData.selectedProducts.map((p, index) => {
                            // get available quantity for selected product
                            const selectedProduct = storeProducts.find(
                                (mp) => mp.products_id === p.product_id
                            );
                            const availableQty = selectedProduct
                                ? selectedProduct.quantity
                                : 0;
                            const mrp = selectedProduct
                                ? selectedProduct.products_price
                                : 0;
                            // exclude already selected products
                            const selectedIds = formData.selectedProducts
                                .map((pr) => pr.product_id)
                                .filter((id, i) => i !== index);

                            const filteredProducts = storeProducts.filter(
                                (mp) => !selectedIds.includes(mp.products_id)
                            );

                            return (
                                <Box
                                    key={index}
                                    sx={{
                                        mb: 2,
                                        border: "1px solid #ddd",
                                        borderRadius: "8px",
                                        p: 2,
                                    }}
                                >
                                    <Grid container spacing={2}>
                                        <Grid item size={4}>
                                            <FormControl fullWidth>
                                                <InputLabel>Products</InputLabel>
                                                <Select
                                                    value={p.product_id}
                                                    onChange={(e) =>
                                                        handleProductChange(
                                                            index,
                                                            "product_id",
                                                            e.target.value
                                                        )
                                                    }
                                                    disabled={loading}
                                                >
                                                    {filteredProducts.map((u) => (
                                                        <MenuItem
                                                            key={u.products_id}
                                                            value={u.products_id}
                                                        >
                                                            {u.products_name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        <Grid item size={3} sx={{ display: "flex", alignItems: "center" }}>
                                            <Typography sx={{ color: "grey" }}>Available Quantity: <strong style={{ color: "black" }}>{availableQty}</strong></Typography>
                                        </Grid>
                                        <Grid item size={2} sx={{ display: "flex", alignItems: "center" }}>
                                            <Typography sx={{ color: "grey" }}>MRP: <strong style={{ color: "black" }}>{mrp}</strong></Typography>
                                        </Grid>
                                        <Grid item size={3} sx={{ display: "flex" }}>
                                            <Button
                                                color="error"
                                                onClick={() => handleRemove(index)}
                                                disabled={formData.selectedProducts.length === 1}
                                            >
                                                Remove
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Box>
                            );
                        })}

                        {/* Add More Button */}
                        {formData.selectedProducts.length < storeProducts.length && (
                            <Button
                                variant="outlined"
                                onClick={handleAddMore}
                                disabled={loading}
                            >
                                Add More
                            </Button>
                        )}
                        <Grid container spacing={2} sx={{ marginY: 2, display: "flex", alignItems: "center" }}>
                            <Grid item size={4}>
                                <Typography sx={{ color: "grey" }}>Combo can be created by Max Quantity : <strong style={{ color: "black" }}>{comboQty}</strong></Typography>
                            </Grid>
                            <Grid item size={3}>
                                <TextField
                                    fullWidth
                                    label="Combo Quantity"
                                    name="comboFinalQunatity"
                                    type="number"
                                    inputProps={{ min: 1, max: comboQty }}
                                    value={comboFinalQunatity}
                                    onChange={(e) => setComboFinalQunatity(e.target.value)}
                                    onKeyUp={(e) => {
                                        let val = Number(e.target.value);
                                        if (val > comboQty) {
                                            val = comboQty;
                                        } else {
                                            val = comboFinalQunatity
                                        }
                                        setComboFinalQunatity(val);
                                    }}
                                    onKeyDown={(e) => {
                                        if (["e", "E", "+", "-", "."].includes(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}
                                    disabled={loading}
                                />
                            </Grid>
                            <Grid item size={5}>
                                <Typography  >Combo Price : {comboPrice}</Typography>
                            </Grid>
                        </Grid>

                        {/* Action Buttons */}
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
                                disabled={loading || formData.selectedProducts.length < 2}
                            >
                                {loading ? "Adding..." : "Add Combo"}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box >
    );
}

export default AddComboProducts;