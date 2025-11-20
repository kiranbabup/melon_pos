import React, { useEffect, useState } from "react";
import { createCategory, getAllCategories, updateCategory } from "../../services/api";
import TableComponent from "../../components/TableComponent";
import { Box, Button, Switch, TextField, Typography } from "@mui/material";
import LeftPannel from "../../components/LeftPannel";
import HeaderPannel from "../../components/HeaderPannel";
import CategoryIcon from '@mui/icons-material/Category';
import EditModalComp from "../../components/EditModalComp";
import * as XLSX from "xlsx";

function CategoriesPage() {
    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const [rowCount, setRowCount] = useState(0);
    const [allCategories, setAllCategories] = useState([]);
    const [loadingCategory, setLoadingCategory] = useState(false);
    const [category, setCategory] = useState("");
    const [categoryMesg, setCategoryMesg] = useState("");
    const [categoryErrMesg, setCategoryErrMesg] = useState("");
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editCatValue, setEditCatValue] = useState("");
    const [editCatSrlno, setEditCatSrlno] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        const start = paginationModel.page * paginationModel.pageSize;
        const end = start + paginationModel.pageSize;
        setTableData(allCategories.slice(start, end));
    }, [paginationModel, allCategories]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await getAllCategories();
            // console.log(response.data);
            const mappedData = response.data.map((cat, index) => ({
                ...cat,
                id: index + 1, // sequential table ID
                created_on: cat.created_on?.slice(0, 10),
            }));

            setAllCategories(mappedData);
            setRowCount(response.data.length); // Total count
        } catch (error) {
            console.error("Error fetching Categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const onClickAddCategory = async () => {
        try {
            setLoadingCategory(true);
            setCategoryMesg("");
            setCategoryErrMesg("");
            // Send state slno and city name
            const response = await createCategory({
                category: category.trim(),
            });
            // console.log(response);
            // console.log(response.data);
            if (response.status === 200) {
                setCategory("");
                setCategoryMesg(response.data.message);
                fetchCategories();
            } else {
                console.error("Failed to add Category:", response.data.message);
                setCategoryErrMesg(response.data.message);
            }
        } catch (error) {
            setCategoryErrMesg(error.response.data.message);
            console.error("Failed to add Category:", error.response);
        } finally {
            setLoadingCategory(false);
            setTimeout(() => {
                setCategoryMesg("");
                setCategoryErrMesg("");
            }, 20000);  // Clear messages after 20 seconds
        }
    };

    const toggleUsageStatus = async (id, currentStatus, category) => {
        try {
            const newStatus = !currentStatus;
            const response = await updateCategory(id, { status: newStatus, category: category });
            // console.log(response);
            // console.log(response.data);
            if (response.status === 200) {
                setCategoryMesg(response.data.message);
                fetchCategories();
            } else {
                console.error("Failed to update status:", response.data.message);
                setCategoryErrMesg(response.data.message);
            }
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setTimeout(() => {
                setCategoryMesg("");
                setCategoryErrMesg("");
            }, 20000); // Clear messages after 1 minute 
        }
    };

    const toggleUsageisActive = async (id, currentStatus, category) => {
        try {
            const newStatus = !currentStatus;
            const response = await updateCategory(id, { is_active: newStatus, category: category });
            // console.log(response);
            // console.log(response.data);
            if (response.status === 200) {
                setCategoryMesg(response.data.message);
                fetchCategories();
            } else {
                console.error("Failed to update is_active:", response.data.message);
                setCategoryErrMesg(response.data.message);
            }
        } catch (error) {
            console.error("Error updating is_active:", error);
        } finally {
            setTimeout(() => {
                setCategoryMesg("");
                setCategoryErrMesg("");
            }, 20000); // Clear messages after 1 minute 
        }
    };

    const onClickModalFinalButton = async () => {
        // console.log(editCatValue, editCatSrlno);

        try {
            setLoading(true);
            const response = await updateCategory(editCatSrlno, { category: editCatValue, status: true });
            setCategoryMesg(response.data.message);
            setEditModalOpen(false);
            fetchCategories();
        } catch (error) {
            console.error("Failed to edit catigory:", error);
        } finally {
            setLoading(false);
            setTimeout(() => {
                setCategoryMesg("");
            }, 20000);
        }
    }

    const columns = [
        { field: "id", headerName: "ID", width: 80 },
        { field: "created_on", headerName: "Created On", flex: 1 },
        { field: "category", headerName: "Category", width: 180 },
        {
            field: "status",
            headerName: "Status",
            flex: 1,
            renderCell: (params) => (
                <Switch
                    checked={params.row.status}
                    onChange={() => toggleUsageStatus(params.row.category_id, params.row.status, params.row.category)}
                    color="primary"
                />
            )
        },
        {
            field: "is_active",
            headerName: "Delete",
            width: 150,
            renderCell: (params) => (
                <Switch
                    checked={params.row.is_active}
                    onChange={() => toggleUsageisActive(params.row.category_id, params.row.is_active, params.row.category)}
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
                        setEditCatValue(params.row.category);
                        setEditCatSrlno(params.row.category_id);
                        setEditModalOpen(true);
                    }}
                >
                    Edit
                </Button>
            )
        }
    ];

    const onDownloadxl = () => {
        if (tableData.length === 0) {
            alert("No Catigories data available to download.");
            return;
        }
        // onDownloadCurrentList("UsersList", tableData);
        const exportData = tableData.map(({ id, category_id, status, is_active, ...rest }) => rest); // remove 'id' if not needed
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "CatigoriesList");
        XLSX.writeFile(workbook, "CatigoriesList.xlsx");
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
                <HeaderPannel HeaderTitle="Manage Categories"
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
                            <TextField
                                label="Add Category"
                                placeholder="Add Category"
                                variant="outlined"
                                size="small"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                            />
                            <Button variant="outlined" color="primary" size="small" sx={{ mr: 1, fontWeight: "bold", }}
                                onClick={() => onClickAddCategory()}
                                disabled={!category.trim()}
                            >
                                {loadingCategory ? "Adding..." : "Add Category"}
                                <CategoryIcon sx={{ ml: 1 }} />
                            </Button>
                            {categoryMesg && (
                                <Typography sx={{ color: "green", fontSize: "0.9rem" }}>
                                    {categoryMesg}
                                </Typography>
                            )}
                            {categoryErrMesg && (
                                <Typography sx={{ color: "red", fontSize: "0.9rem" }}>
                                    {categoryErrMesg}
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    <EditModalComp
                        editModalOpen={editModalOpen}
                        setEditModalOpen={setEditModalOpen}
                        loading={loading}
                        editValue={editCatValue}
                        setEditValue={setEditCatValue}
                        editSlno={editCatSrlno}
                        onClick={onClickModalFinalButton}
                        labelName="Edit Category"
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

export default CategoriesPage;