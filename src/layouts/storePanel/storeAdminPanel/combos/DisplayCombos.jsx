import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Collapse, IconButton, } from "@mui/material";
import LeftPannel from "../../../../components/LeftPannel";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import LsService, { storageKey } from "../../../../services/localstorage";
import TablePagination from "@mui/material/TablePagination";
import { getStoreCombosbyid } from "../../../../services/api";
import HeaderPannel from "../../../../components/HeaderPannel";
import * as XLSX from "xlsx";

function Row({ combo }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Parent Row = Combo */}
            <TableRow>
                <TableCell>
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell>{combo.id}</TableCell>
                <TableCell>{combo.combo_name}</TableCell>
                <TableCell>{combo.combo_description || "-"}</TableCell>
                <TableCell>₹{combo.combo_price}</TableCell>
                <TableCell>{combo.combo_quantity}</TableCell>
                {/* <TableCell>{combo.combo_gst}%</TableCell> */}
                <TableCell>{combo.status}</TableCell>
            </TableRow>

            {/* Collapsible Child Row = Products inside Combo */}
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box margin={1}>
                            <Typography variant="h6" gutterBottom>
                                Products in Combo
                            </Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        {/* <TableCell>Product ID</TableCell> */}
                                        <TableCell>Barcode</TableCell>
                                        <TableCell>Name</TableCell>
                                        <TableCell align="right">Price</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {combo.pos_combo_products?.map((prod) => (
                                        <TableRow key={prod.id}>
                                            {/* <TableCell>{prod.id}</TableCell> */}
                                            <TableCell>{prod.barcode}</TableCell>
                                            <TableCell>{prod.products_name}</TableCell>
                                            <TableCell align="right">₹{prod.price}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

function DisplayCombos() {
    const [loading, setLoading] = useState(false);
    const [storeId, setStoreId] = useState(0);
    const [combos, setCombos] = useState([]);
    const [productMesg, setProductMesg] = useState("");
    const [productErrMesg, setProductErrMesg] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const paginatedCombos = combos.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    useEffect(() => {
        setPage(0); // go back to page 0 whenever combos change
    }, [combos]);

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

    const fetchStoreCombos = async () => {
        try {
            setProductMesg("");
            setProductErrMesg("");
            setLoading(true);

            // console.log(storeId);

            const response = await getStoreCombosbyid(storeId);
            // console.log(response);
            // console.log(response.data.data);

            const mappedData = response.data.data.map((com, index) => ({
                ...com,
                id: index + 1, // sequential table ID
                // createdAt: com.createdAt?.slice(0, 10),
            }));

            setCombos(mappedData || []);

            setProductMesg(response.data.message);
        } catch (error) {
            setProductErrMesg(error.response?.data?.message || "Error fetching combos");
        } finally {
            setLoading(false);
            setTimeout(() => {
                setProductErrMesg("");
                setProductMesg("");
            }, 20000);
        }
    };

    useEffect(() => {
        if (storeId > 0) {
            fetchStoreCombos();
        }
    }, [storeId]);



    const onDownloadxl = () => {
        const exportData = combos.map(({ id, pos_combo_products, combo_id, created_on, updated_on, combo_gst, created_by, updated_by, store_id, ...rest }) => ({
            ...rest,
            Products: pos_combo_products
                ? pos_combo_products
                    .map((prod) => `${prod.products_name} (₹${prod.price})`)
                    .join(", ")
                : "",
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Store_Combos");
        XLSX.writeFile(workbook, "Store_Combos.xlsx");
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
                <HeaderPannel HeaderTitle="View Combos"
                    tableData={combos}
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
                                justifyContent: "space-between",
                            }}
                        >

                            {/* <IconButton onClick={() => fetchCitiesData()} ><RefreshIcon /></IconButton> */}
                            <Box
                                sx={{
                                    width: "99%",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: 2,
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
                        </Box>
                    }

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell />
                                    <TableCell>ID</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Price</TableCell>
                                    <TableCell>Quantity</TableCell>
                                    {/* <TableCell>GST</TableCell> */}
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedCombos.map((combo) => (
                                    <Row key={combo.id} combo={combo} />
                                ))}
                            </TableBody>
                        </Table>
                        <TablePagination
                            component="div"
                            count={combos.length}
                            page={page}
                            onPageChange={(event, newPage) => setPage(newPage)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(event) => {
                                setRowsPerPage(parseInt(event.target.value, 10));
                                setPage(0); // reset to first page
                            }}
                            rowsPerPageOptions={[10, 25, 50]}
                        />
                    </TableContainer>
                    <Box p={1} />
                </Box>
            </Box>
        </Box>
    );
}

export default DisplayCombos;