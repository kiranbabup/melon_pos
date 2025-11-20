import React, { useEffect, useState } from "react";
import { getStoreInvtryDetails, } from "../../../services/api";
import TableComponent from "../../../components/TableComponent";
import { Box, Typography, } from "@mui/material";
import LeftPannel from "../../../components/LeftPannel";
import HeaderPannel from "../../../components/HeaderPannel";
import LsService, { storageKey } from "../../../services/localstorage";
import * as XLSX from "xlsx";

function StoreInventory() {
    const [loading, setLoading] = useState(false);
    const [storeId, setStoreId] = useState(null);
    const [tableData, setTableData] = useState([]);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
    const [rowCount, setRowCount] = useState(0);
    const [productMesg, setProductMesg] = useState("");
    const [productErrMesg, setProductErrMesg] = useState("");
    const [openVerifyModal, setOpenVerifyModal] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);


    // Get store_id from store_code in localStorage
    useEffect(() => {
        const fetchStoreId = async () => {
            try {
                const userLoginStatus = LsService.getItem(storageKey);
                const code = userLoginStatus.store_id;
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

    // Fetch products for store
    useEffect(() => {
        if (!storeId) return;

        const fetchStoreProducts = async () => {
            try {
                setTableData([]);
                setRowCount(0);
                setLoading(true);
                const response = await getStoreInvtryDetails(storeId);
                // console.log("Store Products:", response.data);

                const mappedData = response.data.data
                    // .filter((prod) => prod.status === "Confirmed")
                    .map((prod, index) => ({
                        id: index + 1,
                        confirmed_on: prod.confirmed_on?.slice(0, 10),
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

    // ✅ Columns with editable remarks & Verify button
    const columns = [
        { field: "id", headerName: "ID", width: 80 },
        { field: "confirmed_on", headerName: "Created On", flex: 1 },
        { field: "products_name", headerName: "Products Name", flex: 1 },
        { field: "products_price", headerName: "Products Price", flex: 1 },
        { field: "discount_price", headerName: "Discount Price", flex: 1 },
        { field: "barcode", headerName: "Barcode", flex: 1 },
        { field: "batch_number", headerName: "Batch Number", flex: 1 },
        { field: "expiry_date", headerName: "Expiry Date", flex: 1 },
        {
            field: "quantity", headerName: "Quantity", flex: 1,
            renderCell: (params) => {
                const qty = Number(params.value);

                let color = "black"; // default
                if (qty === 0) {
                    color = "red";
                } else if (qty <= 5) {
                    color = "orange";
                } else {
                    color = "green";
                }

                return (
                    <span style={{ color, fontWeight: "bold" }}>
                        {qty}
                    </span>
                );
            },
        },
    ];

    const onDownloadxl = () => {
            if (tableData.length === 0) {
                alert("No Users data available to download.");
                return;
            }
            // onDownloadCurrentList("UsersList", tableData);
            const exportData = tableData.map(({ id,  ...rest }) => rest); // remove 'id' if not needed
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "StoreInventory");
            XLSX.writeFile(workbook, "StoreInventory.xlsx");
        }

    return (
        <Box sx={{ width: "99vw", height: "94vh", backgroundColor: "white", display: "flex" }}>
            {/* left pannel */}
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "start", width: "18vw", mt: 1.5 }}>
                <LeftPannel HeaderTitle="Store Manager" />
            </Box>

            <Box sx={{ minWidth: "calc( 99vw - 18vw)" }}>
                <HeaderPannel HeaderTitle="Store Inventory" tableData={tableData} onDownloadCurrentList={onDownloadxl}/>

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

export default StoreInventory;