import React, { useEffect, useState } from "react";
import { createUnit, getAllUnits, updateUnit } from "../../services/api";
import TableComponent from "../../components/TableComponent";
import { Box, Button, Switch, Typography } from "@mui/material";
import LeftPannel from "../../components/LeftPannel";
import HeaderPannel from "../../components/HeaderPannel";
import UnitModal from "./superComponents/UnitModal";
import * as XLSX from "xlsx";

const UnitsPage = () => {
    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const [rowCount, setRowCount] = useState(0);
    const [allUnits, setAllUnits] = useState([]);
    const [loadingUnit, setLoadingUnit] = useState(false);
    const [unitMesg, setUnitMesg] = useState("");
    const [unitErrMesg, setUnitErrMesg] = useState("");
    const [editUniSrlno, setEditUniSrlno] = useState(null);
    const [formType, setFormType] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        unit: "",
        short_name: "",
        no_of_products: "",
    });

    useEffect(() => {
        fetchUnits();
    }, []);

    useEffect(() => {
        const start = paginationModel.page * paginationModel.pageSize;
        const end = start + paginationModel.pageSize;
        setTableData(allUnits.slice(start, end));
    }, [paginationModel, allUnits]);

    const fetchUnits = async () => {
        try {
            setLoading(true);
            const response = await getAllUnits();
            // console.log(response.data);
            const mappedData = response.data.map((sup, index) => ({
                ...sup,
                id: index + 1, // sequential table ID
                created_on: sup.created_on?.slice(0, 10),
            }));

            setAllUnits(mappedData);
            setRowCount(response.data.length); // Total count
        } catch (error) {
            console.error("Error fetching Units:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setLoadingUnit(true);
            setUnitMesg("");
            setUnitErrMesg("");
            // Send state slno and city name
            const response = await createUnit(formData);
            // console.log(response);
            // console.log(response.data);
            if (response.status === 201) {
                setModalOpen(false);
                setUnitMesg(response.data.message);
                fetchUnits();
            } else {
                // console.error("Failed to add Unit:", response.data.message);
                setUnitErrMesg(response.data.message);
            }
        } catch (error) {
            setUnitErrMesg(error.response.data.message);
            // console.error("Failed to add Unit:", error.response);
        } finally {
            setLoadingUnit(false);
            setTimeout(() => {
                setUnitMesg("");
                setUnitErrMesg("");
            }, 20000);  // Clear messages after 20 seconds
        }
    };

    const toggleUsageStatus = async (id, currentStatus, unit) => {
        try {
            const newStatus = !currentStatus;
            const response = await updateUnit(id, { status: newStatus, unit: unit });
            // console.log(response);
            // console.log(response.data);
            if (response.status === 200) {
                setUnitMesg(response.data.message);
                fetchUnits();
            } else {
                // console.error("Failed to update status:", response.data.message);
                setUnitErrMesg(response.data.message);
            }
        } catch (error) {
            setUnitErrMesg("Error updating status");
            console.error("Error updating status:", error);
        } finally {
            setTimeout(() => {
                setUnitMesg("");
                setUnitErrMesg("");
            }, 20000); // Clear messages after 1 minute 
        }
    };

    const handleEdit = async () => {
        try {
            const response = await updateUnit(editUniSrlno, { formData });
            // console.log(response);
            // console.log(response.data);
            if (response.status === 200) {
                setUnitMesg(response.data.message);
                fetchUnits();
            } else {
                // console.error("Failed to update status:", response.data.message);
                setUnitErrMesg(response.data.message);
            }
        } catch (error) {
            setUnitErrMesg("Error updating status")
            console.error("Error updating status:", error);
        } finally {
            setTimeout(() => {
                setUnitMesg("");
                setUnitErrMesg("");
            }, 20000); // Clear messages after 1 minute 
        }
    };

    const columns = [
        { field: "id", headerName: "ID", width: 80 },
        { field: "created_on", headerName: "Created On", flex: 1 },
        { field: "unit", headerName: "Units Name", width: 180 },
        { field: "short_name", headerName: "Short Name", width: 120 },
        { field: "no_of_products", headerName: "No. of Products", flex: 1 },
        {
            field: "status",
            headerName: "Status",
            flex: 1,
            renderCell: (params) => (
                <Switch
                    checked={params.row.status}
                    onChange={() => toggleUsageStatus(params.row.unit_id, params.row.status)}
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
                            unit: params.row.unit,
                            short_name: params.row.short_name,
                            no_of_products: params.row.no_of_products,
                        })
                        setEditUniSrlno(params.row.unit_id);
                        setModalOpen(true);
                        setFormType("Edit Units");
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
            unit: "",
            short_name: "",
            no_of_products: "",
        });
        setEditUniSrlno(null);
        setFormType("");
    }

    const onDownloadxl = () => {
        if (tableData.length === 0) {
            alert("No Units data available to download.");
            return;
        }
        // onDownloadCurrentList("UsersList", tableData);
        const exportData = tableData.map(({ id, unit_id, created_on, status, is_active, conversion_factor, is_base_unit, ...rest }) => rest); // remove 'id' if not needed
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "UnitsList");
        XLSX.writeFile(workbook, "UnitsList.xlsx");
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
                <HeaderPannel HeaderTitle="Manage Units"
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
                                onClick={() => { setModalOpen(true); setFormType("Add Units") }}
                            >
                                Add Units
                                {/* <UnitIcon sx={{ ml: 1 }} /> */}
                            </Button>
                            {unitMesg && (
                                <Typography sx={{ color: "green", fontSize: "0.9rem" }}>
                                    {unitMesg}
                                </Typography>
                            )}
                            {unitErrMesg && (
                                <Typography sx={{ color: "red", fontSize: "0.9rem" }}>
                                    {unitErrMesg}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    <UnitModal
                        open={modalOpen}
                        onClose={() => closeUserModal()}
                        formData={formData}
                        setFormData={setFormData}
                        onSave={handleSave}
                        loading={loadingUnit}
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

export default UnitsPage;