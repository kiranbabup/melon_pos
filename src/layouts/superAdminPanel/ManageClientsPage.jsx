// Using
import React, { useEffect, useState } from "react";
import {
  createUser,
  getAllBranches,
  getAllUsers,
  updateUser,
  updateUserPassword,
} from "../../services/api";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import LeftPannel from "../../components/LeftPannel";
import HeaderPannel from "../../components/HeaderPannel";
import UserModal from "./superComponents/UserModal";
import * as XLSX from "xlsx";

function ManageClientsPage() {
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
  const [branches, setBranches] = useState([]);
  const [errMsg, seterrMsg] = useState("");

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const res = await getAllBranches();
      //   console.log(res.data);
      setBranches(res.data.data || []);
    } catch (err) {
      console.error("Error fetching branches:", err);
    }
  };

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

      // Destructure from the API shape
      const apiData = response.data || {};
      const userData = apiData.data || []; // <-- array of users
      const totalUsers = apiData.totalUsers || 0; // <-- total count

      const mappedData = userData.map((usr, index) => ({
        ...usr,
        id: paginationModel.page * paginationModel.pageSize + index + 1,
        created_at: usr.created_at?.slice(0, 10),
        branch_name: usr.Branch?.name,
        branch_code: usr.Branch?.code,
      }));

      setTableData(mappedData);
      setRowCount(totalUsers);
    } catch (error) {
      console.error("Error fetching Users:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "created_at", headerName: "Created On", flex: 1 },
    { field: "name", headerName: "User Name", width: 180 },
    { field: "email", headerName: "Email", width: 180 },
    { field: "role", headerName: "Role", flex: 1 },
    { field: "branch_name", headerName: "Branch Name", flex: 1 }, // or branch_name / branch_code
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <Switch
          checked={params.row.status}
          onChange={() =>
            toggleUsageStatus(params.row.user_id, params.row.status)
          }
          color="primary"
        />
      ),
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
              username: params.row.name, // backend field is name
              password: "", // 👉 don't show hashed password
              email: params.row.email,
              role: params.row.role,
              branch_id: params.row.branch_id,
            });
            setEditusrSrlno(params.row.user_id);
            setFormType("Edit User");
            setModalOpen(true);
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  const handleBranchSelect = (branchId) => {
    const id = Number(branchId);
    const branch = branches.find((b) => b.branch_id === id);

    if (branch) {
      setFormData((prev) => ({
        ...prev,
        branch_id: branch.branch_id,
      }));
    }
  };

  const usernameWrong =
    "User Name must contain 1cap, 1small, 1number, min char's of 8";
  const passwordWrong =
    "Password must contain 1cap, 1small, 1number, min char's of 8";
  const emailWrong = "Email must be in format abcd@gmail.com";
  const existingUsername = "User Name already Exists";

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

  const handleSave = async () => {
    const errors = []; // ✅ move inside

    try {
      setLoadingUser(true);
      setUserMesg("");
      setUserErrMesg("");
      seterrMsg("");

      // existing username (by name field)
      const existingUser = tableData.find(
        (usr) => usr.name.toLowerCase() === formData.username.toLowerCase()
      );
      if (existingUser) {
        errors.push(existingUsername);
      }

      if (formData.username.length < 8) {
        errors.push(usernameWrong);
      }
      if (!passwordRegex.test(formData.password)) {
        errors.push(passwordWrong);
      }
      if (!emailRegex.test(formData.email)) {
        errors.push(emailWrong);
      }
      if (!formData.branch_id) {
        errors.push("Please select a Branch");
      }

      if (errors.length > 0) {
        seterrMsg(errors.join(" | "));
        return;
      }

      // 👉 Map frontend formData to backend fields
      const payload = {
        name: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        branch_id: formData.branch_id,
      };

      const response = await createUser(payload);

      if (response.status === 201 || response.status === 200) {
        setUserMesg(response.data.message || "User created successfully");
        closeUserModal();
        fetchUsers();
      } else {
        setUserErrMesg(response.data.message || "Failed to create user");
        seterrMsg(response.data.message || "Failed to create user");
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

  const handleEdit = async () => {
    const errors = []; // ✅ move inside

    try {
      setLoadingUser(true);
      setUserMesg("");
      setUserErrMesg("");
      seterrMsg("");

      // Only validate password for edit
      if (!passwordRegex.test(formData.password)) {
        errors.push(passwordWrong);
      }

      if (errors.length > 0) {
        seterrMsg(errors.join(" | "));
        return;
      }

      const response = await updateUserPassword(
        editusrSrlno,
        formData.password
      );
      // console.log(response);

      if (response.status === 200) {
        setUserMesg(response.data.message || "Password updated successfully");
        closeUserModal();
        fetchUsers();
      } else {
        console.error("Failed to update password:", response.data.message);
        setUserErrMesg(response.data.message);
      }
    } catch (error) {
      setUserErrMesg(error.response?.data?.message || "Something went wrong");
      console.error("Error updating password:", error);
    } finally {
      setLoadingUser(false);
      setTimeout(() => {
        setUserMesg("");
        seterrMsg("");
        setUserErrMesg("");
      }, 20000);
    }
  };

  const toggleUsageStatus = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const response = await updateUser(id, { status: newStatus });

      if (response.status === 200) {
        setUserMesg(response.data.message || "Status updated");
        fetchUsers();
      } else {
        console.error("Failed to update status:", response.data.message);
        setUserErrMesg(response.data.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      setUserErrMesg(error.response?.data?.message || "Something went wrong");
    } finally {
      setTimeout(() => {
        setUserMesg("");
        setUserErrMesg("");
      }, 20000);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const closeUserModal = () => {
    setModalOpen(false);
    setFormData({
      username: "",
      password: "",
      email: "",
      role: "",
      branch_id: "",
    });
    setEditusrSrlno(null);
    setFormType("");
    seterrMsg("");
    setUserMesg("");
    setUserErrMesg("");
  };

  const onDownloadxl = () => {
    if (tableData.length === 0) {
      alert("No Users data available to download.");
      return;
    }
    // onDownloadCurrentList("UsersList", tableData);
    const exportData = tableData.map(
      ({
        id,
        user_id,
        password,
        created_at,
        updatedAt,
        is_active,
        store_id,
        last_login,
        ...rest
      }) => rest
    ); // remove 'id' if not needed
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "UsersList");
    XLSX.writeFile(workbook, "UsersList.xlsx");
  };

  return (
    <Box
      sx={{
        width: "99vw",
        height: "94vh",
        backgroundColor: "white",
        // #f4f4f5
        display: "flex",
      }}
    >
      {/* left pannel */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "start",
          width: "18vw",
          mt: 1.5,
          ml: 1,
        }}
      >
        <LeftPannel HeaderTitle="INV Technologies" />
      </Box>

      <Box sx={{ minWidth: "calc( 99vw - 18vw)", ml: 1.5 }}>
        <HeaderPannel
          HeaderTitle="Manage Clients"
          tableData={tableData}
          onDownloadCurrentList={onDownloadxl}
        />
        {/* Body starts here */}
        <Box sx={{ width: "99%", mb: 4 }}>
          <Box
            sx={{
              borderRadius: "10px",
              boxShadow:
                "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
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
              <Button
                variant="outlined"
                color="primary"
                size="small"
                sx={{ mr: 1, fontWeight: "bold" }}
                onClick={() => {
                  setModalOpen(true);
                  setFormType("Add User");
                }}
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
            onClose={closeUserModal}
            formData={formData}
            onSave={handleSave}
            loading={loadingUser}
            formType={formType}
            onEdit={handleEdit}
            handleChange={handleChange}
            handleBranchSelect={handleBranchSelect}
            branches={branches}
            errMsg={errMsg}
          />

          <Paper sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#0d3679" }}>
                  {columns.map((col) => (
                    <TableCell
                      key={col.field}
                      sx={{ fontWeight: "bold", color: "white" }}
                    >
                      {col.headerName}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center">
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : tableData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center">
                      No data available
                    </TableCell>
                  </TableRow>
                ) : (
                  tableData.map((row, index) => (
                    <TableRow
                      key={row.id}
                      sx={{
                        backgroundColor:
                          index % 2 === 1 ? "#b3e5ff" : "inherit",
                        "&:hover": {
                          backgroundColor: "#87ceeb !important", // sky blue shade
                          cursor: "pointer",
                        },
                      }}
                    >
                      {columns.map((col) => (
                        <TableCell key={col.field}>
                          {col.renderCell
                            ? col.renderCell({ row })
                            : row[col.field]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <TablePagination
              component="div"
              count={rowCount}
              page={paginationModel.page}
              onPageChange={(_, newPage) =>
                setPaginationModel((prev) => ({ ...prev, page: newPage }))
              }
              rowsPerPage={paginationModel.pageSize}
              onRowsPerPageChange={(e) =>
                setPaginationModel({
                  page: 0,
                  pageSize: parseInt(e.target.value, 10),
                })
              }
              rowsPerPageOptions={[10, 25, 50, 100]}
            />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

export default ManageClientsPage;
