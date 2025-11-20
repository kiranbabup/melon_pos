import { Box, CircularProgress } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const TableComponent = ({ tableData = [], columns = [], loading = false, paginationModel, onPaginationModelChange, rowCount, }) => {
    return (
        <Box
            sx={{
                borderRadius: "10px",
                boxShadow: "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
                height: "100%",
                p: 2,
                background: "#fff",
            }}
        >
            {/* DataGrid Table */}
            <DataGrid
                rows={tableData}
                columns={columns}
                autoHeight
                pagination
                paginationMode="server"
                paginationModel={paginationModel}
                onPaginationModelChange={onPaginationModelChange}  
                pageSizeOptions={[10, 25, 50, 100]}
                rowCount={rowCount}
                checkboxSelection={false}
                disableSelectionOnClick
                getRowClassName={(params) =>
                    params.indexRelativeToCurrentPage % 2 === 1 ? 'even-row' : ''
                }
                sx={{
                    borderRadius: 3,
                    background: "#fff",
                    "& .MuiDataGrid-cell": { border: "1" },
                    "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700 }, // Make header text bold
                    "& .even-row": {
                        backgroundColor: "#fafafa",
                    },
                }}
                localeText={{
                    noRowsLabel: "No data available",
                    footerRowSelected: count => `${count} of ${tableData.length} row(s) selected.`,
                }}
                loading={loading}
                slots={{
                    loadingOverlay: () => (
                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", pt: 3 }}>
                            <CircularProgress color="primary" />
                        </Box>
                    ),
                }}
            />
        </Box >
    );
};

export default TableComponent;