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

function UnitModal({
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
            <DialogTitle>{formType === "Edit Units" ? "Edit Units" : "Add Units"}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Unit Name"
                            value={formData.unit || ""}
                            onChange={(e) => handleChange("unit", e.target.value)}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Unit Short Code"
                            value={formData.short_name || ""}
                            onChange={(e) => handleChange("short_name", e.target.value)}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="No of Products"
                            value={formData.no_of_products || 0}
                            onChange={(e) => handleChange("no_of_products", e.target.value)}
                            required
                            fullWidth
                            type="number"
                            sx={{ width: "150px" }}
                            InputProps={{
                                inputProps: { min: 0, max: 100 },
                            }}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button color="error" onClick={onClose} disabled={loading}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={formType === "Add Units" ? onSave : onEdit}
                    disabled={loading}
                >
                    {loading ? "Saving..." : "Save"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default UnitModal;
