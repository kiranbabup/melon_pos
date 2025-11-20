import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid
} from "@mui/material";

function StoreModal({
    open,
    onClose,
    formData,
    setFormData,
    onSave,
    loading,
    formType,
    onEdit
}) {
    // Handle input changes
    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{formType === "Edit Store" ? "Edit Store" : "Add Store"}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Store Name"
                            value={formData.name || ""}
                            onChange={(e) => handleChange("name", e.target.value)}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Store Code"
                            value={formData.code || ""}
                            onChange={(e) => handleChange("code", e.target.value)}
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
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Phone"
                            value={formData.phone || ""}
                            onChange={(e) => handleChange("phone", e.target.value)}
                            required
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Address"
                            value={formData.address || ""}
                            onChange={(e) => handleChange("address", e.target.value)}
                            required
                            fullWidth
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button color="error" onClick={onClose} disabled={loading}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={formType === "Add Store" ? onSave : onEdit}
                    disabled={loading}
                >
                    {loading ? "Saving..." : "Save"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default StoreModal;
