import React, { useEffect, useState } from "react";
import { getStoreDetailsbyId, updateRemarks } from "../../../services/api";
import TableComponent from "../../../components/TableComponent";
import { Box, Button, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import LeftPannel from "../../../components/LeftPannel";
import HeaderPannel from "../../../components/HeaderPannel";
import LsService, { storageKey } from "../../../services/localstorage";
import * as XLSX from "xlsx";

function StoreRecivedProducts() {
    const [loading, setLoading] = useState(false);
    const [storeId, setStoreId] = useState(null);
    const [tableData, setTableData] = useState([]);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [rowCount, setRowCount] = useState(0);
    const [productMesg, setProductMesg] = useState("");
    const [productErrMesg, setProductErrMesg] = useState("");
    const [openVerifyModal, setOpenVerifyModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [remarks, setRemarks] = useState("");
    const [remarksQty, setRemarksQty] = useState("");

    // Get store_id from localStorage
    useEffect(() => {
        const fetchStoreId = async () => {
            try {
                const userLoginStatus = LsService.getItem(storageKey);
                const code = userLoginStatus.store_id;
                // console.log(code);
                if (code) {
                    setStoreId(code);
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

    const fetchStoreProducts = async () => {
        try {
            // console.log(storeId);
            setTableData([]);
            setRowCount(0);
            setLoading(true);
            const response = await getStoreDetailsbyId(storeId);
            // console.log(response.data);

            const mappedData = response.data.data
                .filter((prod) => prod.status !== "Confirmed")
                .map((prod, index) => ({
                    id: prod.id,
                    rowId: index + 1,
                    added_on: prod.added_on?.slice(0, 10),
                    quantity: prod.quantity,
                    status: prod.status,
                    remarks: prod.remarks || "",
                    remarks_quantity: prod.remarks_quantity ?? "",
                    products_name: prod.pos_product?.products_name,
                    products_price: prod.pos_product?.products_price,
                    discount_price: prod.pos_product?.discount_price,
                    barcode: prod.pos_product?.barcode,
                    batch_number: prod.pos_product?.batch_number,
                    expiry_date: prod.pos_product?.expiry_date?.slice(0, 10),
                }));

            setTableData(mappedData);
            setRowCount(mappedData.length);
            setProductMesg("Products loaded successfully");
            setProductErrMesg("");
        } catch (error) {
            console.error("Error fetching Store Products:", error);
            setProductErrMesg("Failed to fetch store products");
            setProductMesg("");
        } finally {
            setLoading(false);
        }
    };
    // Fetch products for store
    useEffect(() => {
        if (!storeId) return;
        fetchStoreProducts();
    }, [storeId]);

    // ✅ Handle Verify Button Click
    const handleVerify = async (row) => {
        try {
            setLoading(true);
            const payload = {
                remarks: row.remarks,
                remarks_quantity: row.remarks_quantity,
                status: "Checked",
                checked_on: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
            };

            const response = await updateRemarks(row.id, payload);
            if (response.status === 200) {
                setProductMesg("Product verified successfully");
                // Update row in tableData
                fetchStoreProducts();
            } else {
                setProductErrMesg(response.data.message || "Failed to verify product");
            }
        } catch (error) {
            console.error("Error verifying product:", error);
            setProductErrMesg("Error verifying product");
        } finally {
            setLoading(false);
        }
    };

    // ✅ Columns with editable remarks & Verify button
    const columns = [
        { field: "rowId", headerName: "ID", width: 80 },
        { field: "added_on", headerName: "Created On", flex: 1 },
        { field: "products_name", headerName: "Products Name", flex: 1 },
        { field: "products_price", headerName: "Products Price", flex: 1 },
        { field: "discount_price", headerName: "Discount Price", flex: 1 },
        { field: "barcode", headerName: "Barcode", flex: 1 },
        { field: "batch_number", headerName: "Batch Number", flex: 1 },
        { field: "expiry_date", headerName: "Expiry Date", flex: 1 },
        { field: "quantity", headerName: "Quantity", flex: 1 },
        {
            field: "remarks",
            headerName: "Remarks",
            flex: 1,
            renderCell: (params) => (
                <TextField
                    size="small"
                    value={params.row.remarks ?? ""}
                    disabled={params.row.status === "Checked"}
                    onKeyDown={(e) => {
                        if (e.key === " ") {
                            e.stopPropagation(); // ✅ Prevent DataGrid from hijacking spacebar
                        }
                    }}
                    onChange={(e) =>
                        setTableData((prev) =>
                            prev.map((item) =>
                                item.id === params.row.id ? { ...item, remarks: e.target.value } : item
                            )
                        )
                    }
                />
            ),
        },
        {
            field: "remarks_quantity",
            headerName: "Damage Qty",
            flex: 1,
            renderCell: (params) => {
                const maxQty = params.row.quantity ?? 0;
                return (
                    <TextField
                        size="small"
                        type="number"
                        disabled={params.row.status === "Checked"}
                        inputProps={{
                            min: 1,
                            max: maxQty,
                            step: 1,
                            onKeyDown: (e) => {
                                // prevent e, +, -, . and 0
                                if (["e", "E", "+", "-", "."].includes(e.key)) {
                                    e.preventDefault();
                                }
                            },
                        }}
                        value={params.row.remarks_quantity ?? ""}
                        onChange={(e) => {
                            let val = e.target.value;

                            // disallow 0 or negative
                            if (val === "0" || val.startsWith("0")) {
                                val = "";
                            }

                            // enforce max quantity
                            if (Number(val) > maxQty) {
                                val = maxQty.toString();
                            }

                            setTableData((prev) =>
                                prev.map((item) =>
                                    item.id === params.row.id ? { ...item, remarks_quantity: val } : item
                                )
                            );
                        }}
                    />
                );
            },
        },
        {
            field: "status",
            headerName: "Status",
            flex: 1,
            renderCell: (params) => (
                <span
                    style={{
                        color: params.value === "Pending" ? "red" : "green",
                        fontWeight: "bold",
                    }}
                >
                    {params.value}
                </span>
            ),
        },
        {
            field: "action",
            headerName: "Verify",
            flex: 1,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                        setSelectedRow(params.row);
                        setOpenVerifyModal(true);
                    }}
                    disabled={params.row.status === "Checked" || !params.row.remarks}
                >
                    Verify
                </Button>
            ),
        }
    ];

    const onDownloadxl = () => {
        if (tableData.length === 0) {
            alert("No Users data available to download.");
            return;
        }
        // onDownloadCurrentList("UsersList", tableData);
        const exportData = tableData.map(({ id, rowId, ...rest }) => rest); // remove 'id' if not needed
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "StoreReceivedProducts");
        XLSX.writeFile(workbook, "StoreReceivedProducts.xlsx");
    }

    return (
        <Box sx={{ width: "99vw", height: "94vh", backgroundColor: "white", display: "flex" }}>
            {/* left pannel */}
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "start", width: "18vw", mt: 1.5 }}>
                <LeftPannel HeaderTitle="Store Manager" />
            </Box>

            <Box sx={{ minWidth: "calc( 99vw - 18vw)" }}>
                <HeaderPannel HeaderTitle="Received Products to store" tableData={tableData}
                    onDownloadCurrentList={onDownloadxl}
                />
                <Box sx={{ width: "99%" }}>
                    {(productMesg || productErrMesg) &&
                        <Box
                            sx={{
                                borderRadius: "10px",
                                boxShadow: "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
                                height: "100%",
                                p: 2,
                                mb: 1,
                                background: "#fff",
                                display: "flex",
                                justifyContent: "center",
                            }}
                        >
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
                    }

                    <Dialog open={openVerifyModal} onClose={() => setOpenVerifyModal(false)}>
                        <DialogTitle>Confirm Verification</DialogTitle>
                        <DialogContent>
                            <p><strong>Remarks:</strong> {selectedRow?.remarks || "No remarks"}</p>
                            <p><strong>Damage Quantity:</strong> {selectedRow?.remarks_quantity || "0"}</p>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={() => setOpenVerifyModal(false)}
                                color="error"
                                variant="outlined"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={async () => {
                                    await handleVerify(selectedRow);
                                    setOpenVerifyModal(false);
                                }}
                                color="success"
                                variant="contained"
                                disabled={selectedRow?.status === "Checked"}
                            >
                                Yes, Verify
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <TableComponent
                        tableData={tableData}
                        columns={columns}
                        loading={loading}
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        rowCount={rowCount}
                    />
                </Box>
            </Box>
        </Box>
    );
}

export default StoreRecivedProducts;