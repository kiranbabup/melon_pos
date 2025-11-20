import React, { useEffect, useState } from "react";
import { getAllStores, getStoreDetailsbyId } from "../../../services/api";
import TableComponent from "../../../components/TableComponent";
import { Box, Button, Typography, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import LeftPannel from "../../../components/LeftPannel";
import HeaderPannel from "../../../components/HeaderPannel";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

function StorePendings() {
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

    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const strRes = await getAllStores();
                setStores(strRes.data.stores || []);
            } catch (err) {
                console.error("Failed to fetch dropdown data", err);
            }
        };
        fetchDropdowns();
    }, []);

    useEffect(() => {
        if (!storeId) return;

        const fetchStoreProducts = async () => {
            try {
                setTableData([]);
                setRowCount(0);
                setLoading(true);
                const response = await getStoreDetailsbyId(storeId);
                // console.log("Store Products:", response.data);

                const mappedData = response.data.data
                    .filter((prod) => prod.status === "Pending") // 🔴 skip confirmed
                    .map((prod, index) => ({
                        id: index + 1,
                        added_on: prod.added_on?.slice(0, 10),
                        quantity: prod.quantity,
                        status: prod.status,
                        // flatten pos_product
                        products_name: prod.pos_product?.products_name,
                        products_price: prod.pos_product?.products_price,
                        discount_price: prod.pos_product?.discount_price,
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

        fetchStoreProducts();
    }, [storeId]);


    const columns = [
        { field: "id", headerName: "ID", width: 80 },
        { field: "added_on", headerName: "Created On", flex: 1 },
        { field: "products_name", headerName: "Products Name", width: 180 },
        { field: "products_price", headerName: "Products Price", flex: 1 },
        { field: "discount_price", headerName: "Discount Price", flex: 1 },
        { field: "barcode", headerName: "Barcode", flex: 1 },
        { field: "batch_number", headerName: "Batch Number", flex: 1 },
        { field: "expiry_date", headerName: "Expiry Date", flex: 1 },
        { field: "quantity", headerName: "Quantity Sent", flex: 1, align:"center" },
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

        const exportData = tableData.map(({ id, ...rest }) => rest); // remove 'id' if not needed
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "StorePendings");
        XLSX.writeFile(workbook, "StorePendings.xlsx");
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
                <HeaderPannel HeaderTitle="View Store Transportation Status"
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

export default StorePendings;