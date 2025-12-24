// CreateComboPage
import React, { useEffect, useState } from "react";
import { getAllProducts, addCombo } from "../../services/api";
import {
  Box,
  Button,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import LeftPannel from "../../components/LeftPannel";
import HeaderPannel from "../../components/HeaderPannel";
import LsService, { storageKey } from "../../services/localstorage";

function CreateComboPage() {
  const [loading, setLoading] = useState(false);
  const [productMesg, setProductMesg] = useState("");
  const [productErrMesg, setProductErrMesg] = useState("");
  const [branch_id, setbranch_id] = useState(null);

  const [storeProducts, setStoreProducts] = useState([]);

  const [formData, setFormData] = useState({
    combo_name: "",
    combo_price: 0,
    description: "",
    combo_gst: 0,
    is_product: 0,
    services: [{ pr_id: "", price: "" }],
  });

  // Get store_id from localStorage
  useEffect(() => {
    const fetchStoreId = async () => {
      try {
        // console.log(userLoginStatus);
        const userLoginStatus = LsService.getItem(storageKey);

        if (userLoginStatus) {
          setbranch_id(userLoginStatus.branch_id);
        } else {
          setProductErrMesg("Invalid Branch, no Branch found");
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
        setProductErrMesg("Failed to fetch Branch details");
      } finally {
        setLoading(false);
      }
    };
    fetchStoreId();
  }, []);

  useEffect(() => {
    if (!branch_id) return;

    const fetchStoreProducts = async () => {
      try {
        setLoading(true);
        const response = await getAllProducts(branch_id);
        // console.log("branch products:", response.data.data);

        const mappedData = response.data.data.map((prod, index) => ({
          id: index + 1,
          quantity: prod.quantity,
          // flatten pos_product
          pr_id: prod?.pr_id,
          product_name: prod?.product_name,
          product_price: prod?.discount_price,
          category_id: prod?.category_id,
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
  }, [branch_id]);

  const handleFieldChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // when is_product changes, clear selected services
  const handleIsProductChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      is_product: value,
      services: [{ pr_id: "", price: "" }],
    }));
  };
  const handleServiceChange = (index, name, value) => {
    setFormData((prev) => {
      const updated = [...prev.services];

      if (name === "pr_id") {
        const prod = storeProducts.find((p) => p.pr_id === value);
        updated[index] = {
          ...updated[index],
          pr_id: value,
          // auto-fill price from discount_price
          price: prod ? String(prod.product_price || "") : "",
        };
      } else {
        // name === "price"
        updated[index] = { ...updated[index], price: value };
      }

      return { ...prev, services: updated };
    });
  };

  const handleAddServiceRow = () => {
    setFormData((prev) => ({
      ...prev,
      services: [...prev.services, { pr_id: "", price: "" }],
    }));
  };

  const handleRemoveServiceRow = (index) => {
    setFormData((prev) => {
      const updated = [...prev.services];
      updated.splice(index, 1);
      return {
        ...prev,
        services: updated.length ? updated : [{ pr_id: "", price: "" }],
      };
    });
  };
  useEffect(() => {
    const total = formData.services.reduce(
      (sum, s) => sum + Number(s.price || 0),
      0
    );
    setFormData((prev) => ({ ...prev, combo_price: total }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.services]);

  const handleCreateProduct = async () => {
    // basic validation
    if (!formData.combo_name.trim()) {
      setProductErrMesg("Combo name is required");
      return;
    }

    const gst = formData.combo_gst; // already a number
    if (!gst || gst < 1 || gst > 18) {
      setProductErrMesg("GST must be between 1 and 18");
      return;
    }

    const selectedServices = formData.services.filter(
      (s) => s.pr_id && s.price !== ""
    );

    if (selectedServices.length === 0) {
      setProductErrMesg("Please select at least one item");
      return;
    }
    const servicesPayload = selectedServices.map((s) => ({
      pr_id: Number(s.pr_id), // or keep as string if API expects string
      price: Number(s.price),
    }));

    try {
      setLoading(true);
      setProductMesg("");
      setProductErrMesg("");

      const payload = {
        branch_id,
        is_product: formData.is_product, // 0 = product, 1 = service
        combo_name: formData.combo_name,
        combo_price: Number(formData.combo_price || 0), // total combo price
        description: formData.description,
        combo_gst: gst,
        services: servicesPayload,
      };

      // console.log("Final Payload:", payload);
      const response = await addCombo(payload);

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
      combo_price: 0,
      description: "",
      combo_gst: 0,
      is_product: 0,
      services: [{ pr_id: "", price: "" }],
    });
  };

  return (
    <Box
      sx={{
        width: "99vw",
        height: "94vh",
        backgroundColor: "white",
        display: "flex",
        gap: 2,
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
        }}
      >
        <LeftPannel HeaderTitle="Store Manager" />
      </Box>

      {/* Right pannel */}
      <Box sx={{ minWidth: "calc( 99vw - 18vw)" }}>
        <HeaderPannel HeaderTitle="Add Combo Products" />
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
                <FormControl sx={{ mb: 2, width: "100%" }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    label="Type"
                    value={formData.is_product}
                    onChange={(e) => handleIsProductChange(e.target.value)}
                  >
                    <MenuItem value={0}>Product</MenuItem>
                    <MenuItem value={1}>Service</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item size={6}>
                <TextField
                  fullWidth
                  label="Combo Name"
                  type="text"
                  value={formData.combo_name}
                  onChange={(e) =>
                    handleFieldChange("combo_name", e.target.value)
                  }
                  disabled={loading}
                  sx={{ mb: 2 }}
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Combo Description"
              name="description"
              value={formData.description}
              onChange={(e) => handleFieldChange("description", e.target.value)}
              multiline
              rows={4}
              disabled={loading}
              sx={{ mb: 2 }}
            />
            {/* Dynamic Product Rows */}
            {formData.services.map((row, index) => {
              // decide which category to show
              const desiredCategory = formData.is_product === 0 ? 1 : 2;

              // allow only that category
              const options = storeProducts.filter(
                (p) => p.category_id === desiredCategory
              );

              // if you also want to prevent duplicates in the list:
              const selectedIds = formData.services
                .map((s, i) => (i === index ? null : s.pr_id))
                .filter(Boolean);

              const filteredOptions = options.filter(
                (p) => !selectedIds.includes(p.pr_id)
              );

              const selectedProd = storeProducts.find(
                (p) => p.pr_id === row.pr_id
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
                    <Grid item size={3}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel id={`product-label-${index}`}>
                          {formData.is_product === 0 ? "Products" : "Services"}
                        </InputLabel>

                        <Select
                          labelId={`product-label-${index}`}
                          id={`product-select-${index}`}
                          label={
                            formData.is_product === 0 ? "Products" : "Services"
                          }
                          value={row.pr_id}
                          onChange={(e) =>
                            handleServiceChange(index, "pr_id", e.target.value)
                          }
                          disabled={loading}
                          MenuProps={{
                            disablePortal: true,
                            PaperProps: {
                              style: {
                                maxHeight: 250,
                              },
                            },
                          }}
                        >
                          {filteredOptions.map((p) => (
                            <MenuItem key={p.pr_id} value={p.pr_id}>
                              {p.product_name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid
                      item
                      size={3}
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <Typography sx={{ color: "grey" }}>
                        MRP:{" "}
                        <strong style={{ color: "black" }}>
                          {selectedProd ? selectedProd.product_price : "0"}
                        </strong>
                      </Typography>
                    </Grid>

                    <Grid item size={3}>
                      <TextField
                        fullWidth
                        label="Selling Price"
                        value={row.price}
                        onChange={(e) =>
                          handleServiceChange(index, "price", e.target.value)
                        }
                        type="number"
                        onKeyDown={(e) => {
                          if (["e", "E", "+", "-"].includes(e.key))
                            e.preventDefault();
                        }}
                      />
                    </Grid>

                    <Grid
                      item
                      size={3}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        color="error"
                        onClick={() => handleRemoveServiceRow(index)}
                        disabled={formData.services.length === 1}
                      >
                        Remove
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              );
            })}
            {/* Add More Button */}
            {formData.services.length <
              storeProducts.filter(
                (p) => p.category_id === (formData.is_product === 0 ? 1 : 2)
              ).length && (
              <Button
                variant="outlined"
                onClick={handleAddServiceRow}
                disabled={loading}
              >
                Add More
              </Button>
            )}
            <Grid container spacing={2} mt={2.5}>
              <Grid item size={6}>
                <TextField
                  label="Combo Price"
                  type="number"
                  fullWidth
                  sx={{ mb: 2 }}
                  value={formData.combo_price}
                  onChange={(e) =>
                    handleFieldChange("combo_price", e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-", "."].includes(e.key))
                      e.preventDefault();
                  }}
                />
              </Grid>
              <Grid item size={6}>
                <TextField
                  label="GST (%)"
                  type="number"
                  fullWidth
                  sx={{ mb: 2 }}
                  value={formData.combo_gst}
                  inputProps={{ min: 1, max: 18, maxLength: 2 }}
                  onChange={(e) => {
                    // allow only digits, max 2 characters, then convert to number (or 0 if empty)
                    const raw = e.target.value
                      .replace(/[^0-9]/g, "")
                      .slice(0, 2);
                    const num = raw === "" ? 0 : Number(raw);
                    handleFieldChange("combo_gst", num);
                  }}
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-", "."].includes(e.key))
                      e.preventDefault();
                  }}
                />
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
                disabled={
                  loading ||
                  formData.services.filter((s) => s.pr_id && s.price !== "")
                    .length < 2
                }
              >
                {loading ? "Adding..." : "Add Combo"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default CreateComboPage;
