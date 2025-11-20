import { Button, Modal, Box as MuiBox, TextField } from "@mui/material";

const EditModalComp = ({
    editModalOpen,
    setEditModalOpen,
    editValue,
    setEditValue,
    onClick,
    loading,
    labelName,
}) => {
    // console.log(editSlno);

    return (
        <Modal
            open={editModalOpen}
            onClose={() => setEditModalOpen(false)}
        >
            <MuiBox
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 350,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}
            >
                <TextField
                    label={labelName}
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    fullWidth
                />
                <Button
                    variant="contained"
                    onClick={onClick}
                    disabled={!editValue.trim() || loading}
                >
                    Save
                </Button>
            </MuiBox>
        </Modal>
    );
}
export default EditModalComp;