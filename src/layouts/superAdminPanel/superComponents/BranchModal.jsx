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
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useState } from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";

function BranchModal({
  open,
  onClose,
  formData,
  onSave,
  loading,
  formType,
  onEdit,
  handleChange,
  handleBranchSelect,
  branches,
  errMsg,
}) {
  const isEdit = formType === "Edit User";

  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ backgroundColor: "#0d3679", color: "white" }}>
        {isEdit ? "Edit User" : "Add User"}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="User Name"
              value={formData.username || ""}
              onChange={(e) => handleChange("username", e.target.value)}
              fullWidth
              required
              disabled={isEdit} // 🔒 cannot change on edit
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label={isEdit ? "New Password" : "Password"}
              value={formData.password || ""}
              onChange={(e) => handleChange("password", e.target.value)}
              fullWidth
              required
              type={showPassword ? "text" : "password"}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
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
              disabled={isEdit} // 🔒 cannot change on edit
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                sx={{ width: "150px" }}
                value={formData.role || ""}
                onChange={(e) => handleChange("role", e.target.value)}
                disabled={isEdit} // 🔒 cannot change on edit
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="cashier">Cashier</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Branch dropdown */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Select Branch</InputLabel>
              <Select
                value={formData.branch_id || ""}
                onChange={(e) => handleBranchSelect(e.target.value)}
                sx={{ width: "200px" }}
                disabled={isEdit} // 🔒 cannot change on edit
              >
                {branches.map((branch) => (
                  <MenuItem key={branch.branch_id} value={branch.branch_id}>
                    {branch.name || branch.code || `Branch ${branch.branch_id}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop:"1px dashed grey"
        }}
      >
        <Button
          color="error"
          variant="outlined"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        {errMsg && (
          <Typography sx={{ color: "red", fontSize: "0.9rem" }}>
            {errMsg}
          </Typography>
        )}
        <Button
          variant="contained"
          onClick={isEdit ? onEdit : onSave}
          disabled={
            loading ||
            formData.password === "" ||
            (!isEdit &&
              (formData.username === "" ||
                formData.email === "" ||
                !formData.branch_id ||
                !formData.role))
          }
        >
          {loading ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
export default BranchModal;
