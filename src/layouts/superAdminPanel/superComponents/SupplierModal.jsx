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

function SupplierModal({
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
            <DialogTitle>{formType === "Edit Supplier" ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Supplier Name"
                            value={formData.suppliers_name || ""}
                            onChange={(e) => handleChange("suppliers_name", e.target.value)}
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
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Address"
                            value={formData.address || ""}
                            onChange={(e) => handleChange("address", e.target.value)}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="City"
                            value={formData.city || ""}
                            onChange={(e) => handleChange("city", e.target.value)}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Country"
                            value={formData.country || ""}
                            onChange={(e) => handleChange("country", e.target.value)}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Description"
                            value={formData.description || ""}
                            onChange={(e) => handleChange("description", e.target.value)}
                            fullWidth
                            multiline
                            rows={3}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button color="error" onClick={onClose} disabled={loading}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={formType === "Add Supplier" ? onSave : onEdit}
                    disabled={loading}
                >
                    {loading ? "Saving..." : "Save"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default SupplierModal;
