import React, { useEffect, useState } from "react";
import { createUser, getAllStores, getAllUsers, updateUser } from "../../services/api";
import TableComponent from "../../components/TableComponent";
import { Box, Button, Switch, Typography } from "@mui/material";
import LeftPannel from "../../components/LeftPannel";
import HeaderPannel from "../../components/HeaderPannel";
import UserModal from "./superComponents/UserModal";
import * as XLSX from "xlsx";

function UsersManagement() {
    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const [rowCount, setRowCount] = useState(0);
    // const [allUsers, setAllUsers] = useState([]);
    const [loadingUser, setLoadingUser] = useState(false);
    const [userMesg, setUserMesg] = useState("");
    const [userErrMesg, setUserErrMesg] = useState("");
    const [editusrSrlno, setEditusrSrlno] = useState(null);
    const [formType, setFormType] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        email: "",
        role: "",
        store_code: "",
        store_id: "",
    });
    const [stores, setStores] = useState([]);
    const [errMsg, seterrMsg] = useState("");

    useEffect(() => {
        fetchStores();
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [paginationModel]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await getAllUsers({
                page: paginationModel.page + 1,
                limit: paginationModel.pageSize,
            });
            // console.log(response.data);
            const userData = response.data.users || [];
            const mappedData = userData.map((usr, index) => ({
                ...usr,
                // id: index + 1, // sequential table ID
                id: paginationModel.page * paginationModel.pageSize + index + 1,
                createdAt: usr.createdAt?.slice(0, 10),
            }));

            setTableData(mappedData);
            setRowCount(response.data?.totalusers); // Total count
        } catch (error) {
            console.error("Error fetching Users:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStores = async () => {
        try {
            const res = await getAllStores();
            // console.log(res.data.stores);
            // console.log(res);

            if (res.status === 200) {
                setStores(res.data.stores); // assuming res.data is an array of stores
            }
        } catch (err) {
            console.error("Error fetching stores:", err);
        }
    };

    const usernameWrong = "User Name must contain 1cap, 1small, 1number, min char's of 8";
    const passwordWrong = "Password must contain 1cap, 1small, 1number, min char's of 8";
    const emailWrong = "Email must be in format abcd@gmail.com";
    const existingUsername = "User Name already Exists";

    const errors = [];

    // ✅ Regex rules
    const usernameRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

    const handleSave = async () => {
        try {
            setLoadingUser(true);
            setUserMesg("");
            setUserErrMesg("");
            seterrMsg("");

            // ✅ Check existing username
            const existingUser = tableData.find(
                (usr) => usr.username.toLowerCase() === formData.username.toLowerCase()
            );
            if (existingUser) {
                errors.push(existingUsername);
            }

            // ✅ Validate fields
            if (!usernameRegex.test(formData.username)) {
                errors.push(usernameWrong);
            }
            if (!passwordRegex.test(formData.password)) {
                errors.push(passwordWrong);
            }
            if (!emailRegex.test(formData.email)) {
                errors.push(emailWrong);
            }

            // ❌ If any errors, show and stop execution
            if (errors.length > 0) {
                seterrMsg(errors.join(" | "));
                return;
            }

            // ✅ If all validations passed → create user
            const response = await createUser(formData);

            if (response.status === 201) {
                setUserMesg(response.data.message);
                closeUserModal();
                fetchUsers();
            } else {
                setUserErrMesg(response.data.message);
                seterrMsg(response.data.message);
            }
        } catch (error) {
            setUserErrMesg(error.response?.data?.message || "Something went wrong");
            console.error("Failed to add User:", error.response || error);
        } finally {
            setLoadingUser(false);
            setTimeout(() => {
                setUserMesg("");
                setUserErrMesg("");
                seterrMsg("");
            }, 20000);
        }
    };

    const toggleUsageStatus = async (id, currentStatus) => {
        try {
            const newStatus = !currentStatus;
            const response = await updateUser(id, { is_active: newStatus, });
            // console.log(response);
            // console.log(response.data);
            if (response.status === 200) {
                setUserMesg(response.data.message);
                fetchUsers();
            } else {
                console.error("Failed to update status:", response.data.message);
                setUserErrMesg(response.data.message);
            }
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setTimeout(() => {
                setUserMesg("");
                setUserErrMesg("");
            }, 20000); // Clear messages after 1 minute 
        }
    };

    const handleEdit = async () => {
        try {
            setLoadingUser(true);
            // console.log(formData);
            setUserMesg("");
            setUserErrMesg("");
            seterrMsg("");

            // ✅ Validate fields
            if (!usernameRegex.test(formData.username)) {
                errors.push(usernameWrong);
            }
            if (!passwordRegex.test(formData.password)) {
                errors.push(passwordWrong);
            }
            if (!emailRegex.test(formData.email)) {
                errors.push(emailWrong);
            }

            // ❌ If any errors, show and stop execution
            if (errors.length > 0) {
                seterrMsg(errors.join(" | "));
                return;
            }

            const response = await updateUser(editusrSrlno, formData);
            // console.log(response);
            // console.log(response.data);
            if (response.status === 200) {
                setUserMesg(response.data.message);
                closeUserModal();
                fetchUsers();
            } else {
                console.error("Failed to update status:", response.data.message);
                setUserErrMesg(response.data.message);
            }
        } catch (error) {
            setUserErrMesg(error.response?.data?.message || "Something went wrong");
            console.error("Error updating status:", error);
        } finally {
            setLoadingUser(false);
            setTimeout(() => {
                setUserMesg("");
                seterrMsg("");
                setUserErrMesg("");
            }, 20000); // Clear messages after 1 minute 
        }
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleStoreSelect = (storeId) => {
        const id = Number(storeId);   // convert string to number
        // console.log("Selected storeId:", id);

        const store = stores.find((s) => s.store_id === id);
        // console.log("Matched store:", store);

        if (store) {
            setFormData((prev) => ({
                ...prev,
                store_id: store.store_id,
                store_code: store.code
            }));
        }
    };

    const closeUserModal = () => {
        setModalOpen(false);
        setFormData({
            username: "",
            password: "",
            email: "",
            store_code: "",
            store_id: "",
        });
        setEditusrSrlno(null);
        setFormType("");
        seterrMsg("");
    }

    const columns = [
        { field: "id", headerName: "ID", width: 80 },
        { field: "createdAt", headerName: "Created On", flex: 1 },
        { field: "username", headerName: "User Name", width: 180 },
        { field: "password", headerName: "Password", width: 180 },
        { field: "email", headerName: "Email", width: 180 },
        { field: "role", headerName: "Role", flex: 1 },
        { field: "store_code", headerName: "Store Code", flex: 1 },
        {
            field: "is_active",
            headerName: "Status",
            flex: 1,
            renderCell: (params) => (
                <Switch
                    checked={params.row.is_active}
                    onChange={() => toggleUsageStatus(params.row.user_id, params.row.is_active)}
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
                            username: params.row.username,
                            password: params.row.password,
                            email: params.row.email,
                            role: params.row.role,
                            store_code: params.row.store_code,
                            store_id: params.row.store_id,
                        })
                        setEditusrSrlno(params.row.user_id);
                        setModalOpen(true);
                        setFormType("Edit User");
                    }}
                >
                    Edit
                </Button>
            )
        }
    ];

    const onDownloadxl = () => {
        if (tableData.length === 0) {
            alert("No Users data available to download.");
            return;
        }
        // onDownloadCurrentList("UsersList", tableData);
        const exportData = tableData.map(({ id, user_id, password, createdAt, updatedAt, is_active, store_id, last_login, ...rest }) => rest); // remove 'id' if not needed
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "UsersList");
        XLSX.writeFile(workbook, "UsersList.xlsx");
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
                <HeaderPannel HeaderTitle="Manage Users"
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
                                onClick={() => { setModalOpen(true); setFormType("Add User") }}
                            // disabled={!user.trim()}
                            >
                                Add Users
                            </Button>
                            {userMesg && (
                                <Typography sx={{ color: "green", fontSize: "0.9rem" }}>
                                    {userMesg}
                                </Typography>
                            )}
                            {userErrMesg && (
                                <Typography sx={{ color: "red", fontSize: "0.9rem" }}>
                                    {userErrMesg}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    <UserModal
                        open={modalOpen}
                        onClose={() => closeUserModal()}
                        formData={formData}
                        onSave={handleSave}
                        loading={loadingUser}
                        formType={formType}
                        onEdit={handleEdit}
                        handleChange={handleChange}
                        handleStoreSelect={handleStoreSelect}
                        stores={stores}
                        errMsg={errMsg}
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
