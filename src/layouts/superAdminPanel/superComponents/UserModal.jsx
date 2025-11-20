import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography
} from "@mui/material";
import { getAllStores } from "../../../services/api";

function UserModal({
    open,
    onClose,
    formData,
    onSave,
    loading,
    formType,
    onEdit,
    handleChange,
    handleStoreSelect,
    stores,
    errMsg
}) {
    // console.log(stores);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{formType === "Edit User" ? "Edit User" : "Add User"}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="User Name"
                            value={formData.username || ""}
                            onChange={(e) => handleChange("username", e.target.value)}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Password"
                            value={formData.password || ""}
                            onChange={(e) => handleChange("password", e.target.value)}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Email"
                            value={formData.email || ""}
                            onChange={(e) => handleChange("email", e.target.value)}
                            fullWidth
                            type="email"
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                sx={{ width: "150px" }}
                                value={formData.role || ""}
                                onChange={(e) => handleChange("role", e.target.value)}
                                disabled={formType === "Edit User"}
                            >
                                <MenuItem value="store">Store</MenuItem>
                                <MenuItem value="cashier">Cashier</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Store dropdown */}
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Select Store</InputLabel>
                            <Select
                                value={formData.store_id || ""}
                                onChange={(e) => handleStoreSelect(e.target.value)}
                                sx={{ width: "200px" }}
                                disabled={formType === "Edit User"}
                            >
                                {stores.map((store) => (
                                    <MenuItem key={store.store_id} value={store.store_id}>
                                        {store.code}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Button color="error" variant="outlined" onClick={onClose} disabled={loading}>Cancel</Button>
                {errMsg && (
                    <Typography sx={{ color: "red", fontSize: "0.9rem" }}>
                        {errMsg}
                    </Typography>
                )}
                <Button
                    variant="contained"
                    onClick={formType === "Add User" ? onSave : onEdit}
                    disabled={loading || formData.password === "" || formData.username === "" || formData.email === ""}
                >
                    {loading ? "Saving..." : "Save"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default UserModal;
