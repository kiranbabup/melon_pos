import React, { useEffect, useState } from "react";
import { createStore, getAllStores, updateStore } from "../../services/api";
import TableComponent from "../../components/TableComponent";
import { Box, Button, Switch, Typography } from "@mui/material";
import LeftPannel from "../../components/LeftPannel";
import HeaderPannel from "../../components/HeaderPannel";
import StoreModal from "./superComponents/StoreModal";
import * as XLSX from "xlsx";

function StoresPage() {
    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const [rowCount, setRowCount] = useState(0);
    const [allStores, setAllStores] = useState([]);
    const [loadingStore, setLoadingStore] = useState(false);
    const [storeMesg, setStoreMesg] = useState("");
    const [storeErrMesg, setStoreErrMesg] = useState("");
    const [editSupSrlno, setEditSupSrlno] = useState(null);
    const [formType, setFormType] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        email: "",
        phone: "",
        address: "",
    });

    useEffect(() => {
        fetchStores();
    }, []);

    useEffect(() => {
        const start = paginationModel.page * paginationModel.pageSize;
        const end = start + paginationModel.pageSize;
        setTableData(allStores.slice(start, end));
    }, [paginationModel, allStores]);

    const fetchStores = async () => {
        try {
            setLoading(true);
            const response = await getAllStores();
            // console.log(response);
            const mappedData = response.data.stores.map((stor, index) => ({
                ...stor,
                id: index + 1, // sequential table ID
                created_at: stor.created_at?.slice(0, 10),
            }));

            setAllStores(mappedData);
            setRowCount(response.data.stores.length); // Total count
        } catch (error) {
            console.error("Error fetching Stores:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setLoadingStore(true);
            setStoreMesg("");
            setStoreErrMesg("");
            // Send state slno and city name
            const response = await createStore(formData);
            // console.log(response);
            // console.log(response.data);
            if (response.status === 201) {
                setModalOpen(false);
                setStoreMesg(response.data.message);
                fetchStores();
            } else {
                console.error("Failed to add Store:", response.data.message);
                setStoreErrMesg(response.data.message);
            }
        } catch (error) {
            setStoreErrMesg(error.response.data.message);
            console.error("Failed to add Store:", error.response);
        } finally {
            setLoadingStore(false);
            setTimeout(() => {
                setStoreMesg("");
                setStoreErrMesg("");
            }, 20000);  // Clear messages after 20 seconds
        }
    };

    const toggleUsageStatus = async (id, currentStatus) => {
        try {
            const newStatus = !currentStatus;
            const response = await updateStore(id, { status: newStatus, });
            // console.log(response);
            // console.log(response.data);
            if (response.status === 200) {
                setStoreMesg(response.data.message);
                fetchStores();
            } else {
                console.error("Failed to update status:", response.data.message);
                setStoreErrMesg(response.data.message);
            }
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setTimeout(() => {
                setStoreMesg("");
                setStoreErrMesg("");
            }, 20000); // Clear messages after 1 minute 
        }
    };

    const handleEdit = async () => {
        try {
            const response = await updateStore(editSupSrlno, formData );
            // console.log(response);
            // console.log(response.data);
            if (response.status === 200) {
                setModalOpen(false);
                setStoreMesg(response.data.message);
                fetchStores();
            } else {
                console.error("Failed to update status:", response.data.message);
                setStoreErrMesg(response.data.message);
            }
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setTimeout(() => {
                setStoreMesg("");
                setStoreErrMesg("");
            }, 20000); // Clear messages after 1 minute 
        }
    };

    const columns = [
        { field: "id", headerName: "ID", width: 80 },
        { field: "created_at", headerName: "Created On", flex: 1 },
        { field: "name", headerName: "Store Name", width: 180 },
        { field: "code", headerName: "Store Code", width: 180 },
        { field: "email", headerName: "Email", width: 180 },
        { field: "phone", headerName: "Phone", width: 150 },
        { field: "address", headerName: "Address", flex: 1 },
        {
            field: "is_active",
            headerName: "Status",
            flex: 1,
            renderCell: (params) => (
                <Switch
                    checked={params.row.is_active}
                    onChange={() => toggleUsageStatus(params.row.stores_id, params.row.is_active)}
                    color="primary"
                />
            )
        },
        {
            field: "actions",
            headerName: "Actions",
            flex: 1,
            sortable: false,
            renderCell: (params) => (
                <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                        setFormData({
                            name: params.row.name,
                            code: params.row.code,
                            email: params.row.email,
                            phone: params.row.phone,
                            address: params.row.address,
                        })
                        setEditSupSrlno(params.row.store_id);
                        setModalOpen(true);
                        setFormType("Edit Store");
                    }}
                >
                    Edit
                </Button>
            )
        }
    ];

    const closeUserModal = () => {
        setModalOpen(false);
        setFormData({
            name: "",
            code: "",
            email: "",
            phone: "",
            address: "",
        });
        setEditSupSrlno(null);
        setFormType("");
    }

    const onDownloadxl = () => {
        // onDownloadCurrentList("UsersList", tableData);
        const exportData = tableData.map(({ id, store_id, created_at, updated_at, ...rest }) => rest); // remove 'id' if not needed
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "StoresList");
        XLSX.writeFile(workbook, "StoresList.xlsx");
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
                <HeaderPannel HeaderTitle="Manage Stores"
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
                                display: "flex",
                                // justifyContent: "right",
                                alignItems: "center",
                                gap: 2,
                            }}
                        >
                            <Button variant="outlined" color="primary" size="small" sx={{ mr: 1, fontWeight: "bold", }}
                                onClick={() => { setModalOpen(true); setFormType("Add Store") }}
                            >
                                Add Stores
                                {/* <StoreIcon sx={{ ml: 1 }} /> */}
                            </Button>
                            {storeMesg && (
                                <Typography sx={{ color: "green", fontSize: "0.9rem" }}>
                                    {storeMesg}
                                </Typography>
                            )}
                            {storeErrMesg && (
                                <Typography sx={{ color: "red", fontSize: "0.9rem" }}>
                                    {storeErrMesg}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    <StoreModal
                        open={modalOpen}
                        onClose={() => closeUserModal()}
                        formData={formData}
                        setFormData={setFormData}
                        onSave={handleSave}
                        loading={loadingStore}
                        formType={formType}
                        onEdit={handleEdit}
                    />

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

export default StoresPage;