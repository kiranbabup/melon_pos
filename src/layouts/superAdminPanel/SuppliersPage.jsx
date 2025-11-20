import React, { useEffect, useState } from "react";
import { createSupplier, getAllSuppliers, updateSupplier } from "../../services/api";
import TableComponent from "../../components/TableComponent";
import { Box, Button, Switch, TextField, Typography } from "@mui/material";
import LeftPannel from "../../components/LeftPannel";
import HeaderPannel from "../../components/HeaderPannel";
import SupplierModal from "./superComponents/SupplierModal";
import * as XLSX from "xlsx";

function SuppliersPage() {
    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const [rowCount, setRowCount] = useState(0);
    const [allSuppliers, setAllSuppliers] = useState([]);
    const [loadingSupplier, setLoadingSupplier] = useState(false);
    const [supplier, setSupplier] = useState("");
    const [supplierMesg, setSupplierMesg] = useState("");
    const [supplierErrMesg, setSupplierErrMesg] = useState("");
    const [editSupSrlno, setEditSupSrlno] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [formType, setFormType] = useState("");
    const [formData, setFormData] = useState({
        suppliers_name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        country: "",
        description: "",
        // created_by: 1,
    });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    useEffect(() => {
        const start = paginationModel.page * paginationModel.pageSize;
        const end = start + paginationModel.pageSize;
        setTableData(allSuppliers.slice(start, end));
    }, [paginationModel, allSuppliers]);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const response = await getAllSuppliers();
            // console.log(response.data);
            const mappedData = response.data.map((sup, index) => ({
                ...sup,
                id: index + 1, // sequential table ID
                created_on: sup.created_on?.slice(0, 10),
            }));

            setAllSuppliers(mappedData);
            setRowCount(response.data.length); // Total count
        } catch (error) {
            console.error("Error fetching Suppliers:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setLoadingSupplier(true);
            setSupplierMesg("");
            setSupplierErrMesg("");
            // Send state slno and city name
            const response = await createSupplier(formData);
            // console.log(response);
            // console.log(response.data);
            if (response.status === 201) {
                setModalOpen(false);
                setSupplierMesg(response.data.message);
                fetchSuppliers();
            } else {
                console.error("Failed to add Supplier:", response.data.message);
                setSupplierErrMesg(response.data.message);
            }
        } catch (error) {
            setSupplierErrMesg(error.response.data.message);
            console.error("Failed to add Supplier:", error.response);
        } finally {
            setLoadingSupplier(false);
            setTimeout(() => {
                setSupplierMesg("");
                setSupplierErrMesg("");
            }, 20000);  // Clear messages after 20 seconds
        }
    };

    const toggleUsageStatus = async (id, currentStatus) => {
        try {
            const newStatus = !currentStatus;
            const response = await updateSupplier(id, { status: newStatus, });
            // console.log(response);
            // console.log(response.data);
            if (response.status === 200) {
                setSupplierMesg(response.data.message);
                fetchSuppliers();
            } else {
                console.error("Failed to update status:", response.data.message);
                setSupplierErrMesg(response.data.message);
            }
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setTimeout(() => {
                setSupplierMesg("");
                setSupplierErrMesg("");
            }, 20000); // Clear messages after 1 minute 
        }
    };

    const handleEdit = async () => {
        try {
            const response = await updateSupplier(editSupSrlno, { formData });
            // console.log(response);
            // console.log(response.data);
            if (response.status === 200) {
                setSupplierMesg(response.data.message);
                fetchSuppliers();
            } else {
                console.error("Failed to update status:", response.data.message);
                setSupplierErrMesg(response.data.message);
            }
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setTimeout(() => {
                setSupplierMesg("");
                setSupplierErrMesg("");
            }, 20000); // Clear messages after 1 minute 
        }
    };

    const columns = [
        { field: "id", headerName: "ID", width: 80 },
        { field: "created_on", headerName: "Created On", flex: 1 },
        { field: "suppliers_name", headerName: "Suppliers Name", width: 180 },
        { field: "email", headerName: "Email", width: 180 },
        { field: "phone", headerName: "Phone", width: 150 },
        { field: "address", headerName: "Address", flex: 1 },
        { field: "city", headerName: "City", width: 120 },
        { field: "country", headerName: "Country", width: 120 },
        { field: "description", headerName: "Description", flex: 1 },
        {
            field: "status",
            headerName: "Status",
            flex: 1,
            renderCell: (params) => (
                <Switch
                    checked={params.row.status}
                    onChange={() => toggleUsageStatus(params.row.suppliers_id, params.row.status)}
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
                            suppliers_name: params.row.suppliers_name,
                            city: params.row.city,
                            country: params.row.country,
                            email: params.row.email,
                            phone: params.row.phone,
                            address: params.row.address,
                            description: params.row.description,
                        })
                        setEditSupSrlno(params.row.store_id);
                        setModalOpen(true);
                        setFormType("Edit Supplier");
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
            suppliers_name: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            country: "",
            description: "",
        });
        setEditSupSrlno(null);
        setFormType("");
    }

    const onDownloadxl = () => {
        if (tableData.length === 0) {
            alert("No Suppliers data available to download.");
            return;
        }
        // onDownloadCurrentList("UsersList", tableData);
        const exportData = tableData.map(({ id, suppliers_id, status, is_active, created_by, updated_by, created_on, updated_on, ...rest }) => rest); // remove 'id' if not needed
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "SuppliersList");
        XLSX.writeFile(workbook, "SuppliersList.xlsx");
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
                <HeaderPannel HeaderTitle="Manage Suppliers"
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
                                onClick={() => { setModalOpen(true); setFormType("Add Supplier") }}
                            >
                                Add Suppliers
                                {/* <SupplierIcon sx={{ ml: 1 }} /> */}
                            </Button>
                            {supplierMesg && (
                                <Typography sx={{ color: "green", fontSize: "0.9rem" }}>
                                    {supplierMesg}
                                </Typography>
                            )}
                            {supplierErrMesg && (
                                <Typography sx={{ color: "red", fontSize: "0.9rem" }}>
                                    {supplierErrMesg}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    <SupplierModal
                        open={modalOpen}
                        onClose={() => closeUserModal()}
                        formData={formData}
                        setFormData={setFormData}
                        onSave={handleSave}
                        loading={loadingSupplier}
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

export default SuppliersPage;