import React, { useEffect, useState } from "react";
import { getAllStores, getStoreDetailsbyId, updateConfirm } from "../../../services/api";
import TableComponent from "../../../components/TableComponent";
import { Box, Button, Typography, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import LeftPannel from "../../../components/LeftPannel";
import HeaderPannel from "../../../components/HeaderPannel";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

function ConfirmStoreInventory() {
    const [loading, setLoading] = useState(false);
    const [stores, setStores] = useState([]);
    const [storeId, setStoreId] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const [rowCount, setRowCount] = useState(0);
    const [productMesg, setProductMesg] = useState("");
    const [productErrMesg, setProductErrMesg] = useState("");
    const nav = useNavigate();
    const [openConfirmModal, setOpenConfirmModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const strRes = await getAllStores();
                setStores(strRes.data.stores || []);
            } catch (err) {
                console.error("Failed to fetch dropdown data", err);
                setProductErrMesg("Please refresh again.!");
            }
        };
        fetchDropdowns();
        if (storeId < 1) {
            setProductErrMesg("Please select a Store.!");
        }
    }, []);

    const fetchStoreProducts = async () => {
        try {
            setTableData([]);
            setRowCount(0);
            setLoading(true);
            const response = await getStoreDetailsbyId(storeId);
            // console.log("Store Products:", response.data.data);

            const mappedData = response.data.data
                .filter((prod) => prod.status !== "Pending")
                .map((prod, index) => ({
                    id: prod.id,
                    rowId: index + 1,
                    checked_on: prod.checked_on?.slice(0, 10),
                    quantity: prod.quantity,
                    status: prod.status,
                    store_id: prod.store_id,
                    added_on: prod.added_on,
                    // flatten pos_product
                    remarks: prod.remarks || "",
                    remarks_quantity: prod.remarks_quantity ?? "",
                    products_name: prod.pos_product?.products_name,
                    products_price: prod.pos_product?.products_price,
                    discount_price: prod.pos_product?.discount_price,
                    product_id: prod.pos_product?.products_id,
                    barcode: prod.pos_product?.barcode,
                    batch_number: prod.pos_product?.batch_number,
                    expiry_date: prod.pos_product?.expiry_date?.slice(0, 10),
                }));

            // console.log(mappedData);

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
    useEffect(() => {
        if (!storeId) return;
        fetchStoreProducts();
    }, [storeId]);

    const handleVerify = async (row) => {
        // console.log(row);
        try {
            setLoading(true);
            const finalQuantity = row.quantity - row.remarks_quantity;

            const payload = {
                product_id: row.product_id,
                store_id: row.store_id,
                quantity: finalQuantity,
                added_on: row.added_on,
                checked_on: row.checked_on,
                remarks: row.remarks,
                remarks_quantity: row.remarks_quantity,
                status: "Confirmed",
                confirmed_on: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
            };
            // console.log(payload);

            const response = await updateConfirm(row.id, payload);
            // console.log(response);

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
            setTimeout(() => {
                setProductMesg("");
                setProductErrMesg("");
            }, 20000);
        }
    };

    const columns = [
        { field: "rowId", headerName: "ID", width: 80 },
        { field: "checked_on", headerName: "Created On", flex: 1 },
        { field: "products_name", headerName: "Products Name", width: 180 },
        // { field: "products_price", headerName: "Products Price", flex: 1 },
        { field: "discount_price", headerName: "Discount Price", flex: 1 },
        { field: "barcode", headerName: "Barcode", flex: 1 },
        { field: "batch_number", headerName: "Batch Number", flex: 1 },
        { field: "expiry_date", headerName: "Expiry Date", flex: 1 },
        { field: "quantity", headerName: "Qty Sent", flex: 1, align:"center" },
        { field: "remarks", headerName: "Remarks", flex: 1 },
        {
            field: "remarks_quantity", headerName: "Damage Qty", flex: 1, align:"center",
            renderCell: (params) => {
                const qty = Number(params.value);

                let color = "black"; // default
                if (qty === 0) {
                    color = "green";
                } else {
                    color = "red";
                }

                return (
                    <span style={{ color, fontWeight: "bold" }}>
                        {qty}
                    </span>
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
                        color: params.value === "Checked" ? "red" : "green",
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
                        setOpenConfirmModal(true);
                    }}
                    disabled={params.row.status === "Confirmed"}
                >
                    Verify
                </Button>
            ),
        }
    ];

    const onDownloadxl = () => {
        if (storeId.length === 0) {
            alert("Please select a store to download data.");
            return;
        }
        if (tableData.length === 0) {
            alert("No data available to download.");
            return;
        }

        const exportData = tableData.map(({ id,rowId, store_id,added_on,product_id, ...rest }) => rest); // remove 'id' if not needed
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "ConfirmStoreInventory");
        XLSX.writeFile(workbook, "ConfirmStoreInventory.xlsx");
    }

    return (
        <Box sx={{
            width: "99vw",
            height: "94vh",
            backgroundColor: "white",
            display: "flex",
        }}>
            {/* left pannel */}
            <Box
                sx={{
                    display: "flex", justifyContent: "center", alignItems: "start",
                    width: "18vw",
                    mt: 1.5
                }}
            >
                <LeftPannel HeaderTitle="Super Admin" />
            </Box>

            <Box
                sx={{ minWidth: "calc( 99vw - 18vw)", }}
            >
                <HeaderPannel HeaderTitle="Confirm Store Inventory"
                    tableData={tableData}
                    onDownloadCurrentList={onDownloadxl}
                />

                <Box sx={{ width: "99%" }}>
                    <Box
                        sx={{
                            borderRadius: "10px",
                            boxShadow: "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
                            height: "100%",
                            p: 2,
                            mb: 1,
                            background: "#fff",
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >

                        {/* <IconButton onClick={() => fetchCitiesData()} ><RefreshIcon /></IconButton> */}
                        <Box
                            sx={{
                                width: "99%",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 2,
                            }}
                        >
                            <FormControl sx={{ width: "25%", marginBottom: 2 }}>
                                <InputLabel>Stores</InputLabel>
                                <Select
                                    name="store_id"
                                    value={storeId}
                                    onChange={(e) => setStoreId(e.target.value)}
                                    disabled={loading}
                                >
                                    {stores.map((u) => (
                                        <MenuItem key={u.store_id} value={u.store_id}>
                                            {u.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

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
                            <Button variant="outlined" color="primary" size="small" sx={{ mr: 1, fontWeight: "bold", }}
                                onClick={() => nav("/add-store-products")}
                            >
                                Add store Products
                            </Button>
                        </Box>
                    </Box>

                    <Dialog open={openConfirmModal} onClose={() => setOpenConfirmModal(false)}>
                        <DialogTitle>Confirm Verification</DialogTitle>
                        <DialogContent>
                            <p><strong>Quantity:</strong> {selectedRow?.quantity || "0"}</p>
                            <p><strong>Damage Quantity:</strong> {selectedRow?.remarks_quantity || "0"}</p>
                            <p><strong>Change Quantity to:</strong> {selectedRow?.quantity || "0"} - {selectedRow?.remarks_quantity || "0"} = {selectedRow?.quantity - selectedRow?.remarks_quantity}</p>
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={() => setOpenConfirmModal(false)}
                                color="error"
                                variant="outlined"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={async () => {
                                    await handleVerify(selectedRow);
                                    setOpenConfirmModal(false);
                                }}
                                color="success"
                                variant="contained"
                                disabled={selectedRow?.status === "Confirmed"}
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

export default ConfirmStoreInventory;