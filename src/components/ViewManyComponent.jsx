import { Box, Button, Grid, Modal, Box as MuiBox, TextField } from "@mui/material";
import React from "react";

const ViewManyComponent = ({
    viewModalOpen,
    setViewModalOpen,
    viewData,
    setViewData
}) => {
    // console.log(viewData);

    return (
        <Modal
            open={viewModalOpen}
            onClose={() => setViewModalOpen(false)}
        >
            <MuiBox
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 600,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}
            >
                <Box>
                    {Object.entries(viewData)
                        .filter(([key]) =>
                            !["slno", "srlno", "profile_pic", "offer_letter","resume_file_name", "resume", "uploaded_resume","auth_type", "status","role", "noc", "noc_file_name"].includes(key)
                        )
                        .map(([key, value]) => {
                            // Format key: "alternate_no" -> "Alternate No"
                            const label = key
                                .replace(/_/g, ' ')
                                .replace(/\b\w/g, l => l.toUpperCase());

                            // Special handling for is_verified
                            if (key === "is_verified") {
                                return (
                                    <React.Fragment key={key}>
                                        <Grid container spacing={2} sx={{ width: "100%" }}>
                                            <Grid item size={4} style={{ fontWeight: "bold" }}>
                                                {label} :
                                            </Grid>
                                            <Grid item size={8} style={{ textAlign: "left" }}>
                                                {value === 1 || value === "1" ? (
                                                    <span style={{ color: "green", fontWeight: "bold" }}>Verified</span>
                                                ) : (
                                                    <span style={{ color: "red", fontWeight: "bold" }}>Not Verified</span>
                                                )}
                                            </Grid>
                                        </Grid>
                                    </React.Fragment>
                                );
                            }

                            // Show NA if value is empty string or null
                            const displayValue = value === "" || value === null ? "NA" : value;

                            return (
                                <React.Fragment key={key}>
                                    <Grid container spacing={2} sx={{ width: "100%" }}>
                                        <Grid item size={4} style={{ fontWeight: "bold" }}>
                                            {label} :
                                        </Grid>
                                        <Grid item size={8} style={{ textAlign: "left" }}>
                                            {displayValue}
                                        </Grid>
                                    </Grid>
                                </React.Fragment>
                            );
                        })}
                </Box>

                <Button
                    variant="contained"
                    onClick={() => { setViewData({}); setViewModalOpen(false); }}
                >
                    Close
                </Button>
            </MuiBox>
        </Modal>
    );
}
export default ViewManyComponent;