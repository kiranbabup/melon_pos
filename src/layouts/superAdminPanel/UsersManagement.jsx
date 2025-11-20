import React, { useEffect, useState } from "react";
import {
  createUser,
  getAllStores,
  getAllUsers,
  updateUser,
} from "../../services/api";
import TableComponent from "../../components/TableComponent";
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
    fetchUsers();
  }, [paginationModel]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await getAllUsers({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
      });

      // Destructure from the API shape
      const apiData = response.data || {};
      const userData = apiData.data || []; // <-- array of users
      const totalUsers = apiData.totalUsers || 0; // <-- total count

      const mappedData = userData.map((usr, index) => ({
        ...usr,
        // sequential table ID across pages
        id: paginationModel.page * paginationModel.pageSize + index + 1,
        created_at: usr.created_at?.slice(0, 10),
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
    // { field: "store_code", headerName: "Store Code", flex: 1 },
    // {
    //   field: "is_active",
    //   headerName: "Status",
    //   flex: 1,
    //   renderCell: (params) => (
    //     <Switch
    //       checked={params.row.is_active}
    //       onChange={() =>
    //         toggleUsageStatus(params.row.user_id, params.row.is_active)
    //       }
    //       color="primary"
    //     />
    //   ),
    // },
    // {
    //   field: "actions",
    //   headerName: "Actions",
    //   flex: 1,
    //   sortable: false,
    //   renderCell: (params) => (
    //     <Button
    //       size="small"
    //       variant="contained"
    //       onClick={() => {
    //         setFormData({
    //           username: params.row.username,
    //           password: params.row.password,
    //           email: params.row.email,
    //           role: params.row.role,
    //           store_code: params.row.store_code,
    //           store_id: params.row.store_id,
    //         });
    //         setEditusrSrlno(params.row.user_id);
    //         setModalOpen(true);
    //         setFormType("Edit User");
    //       }}
    //     >
    //       Edit
    //     </Button>
    //   ),
    // },
  ];

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
          ml:1,
        }}
      >
        <LeftPannel HeaderTitle="Super Admin" />
      </Box>

      <Box sx={{ minWidth: "calc( 99vw - 18vw)", ml: 1.5  }}>
        <HeaderPannel
          HeaderTitle="Manage Users"
          tableData={tableData}
          onDownloadCurrentList={onDownloadxl}
        />

        {/* Body starts here */}
        <Box sx={{ width: "99%" }}>
          <Paper sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#0d3679" }}>
                  {columns.map((col) => (
                    <TableCell key={col.field} sx={{ fontWeight: "bold", color:"white" }}>
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
                          index % 2 === 1 ? "#fafafa" : "inherit",
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

export default UsersManagement;
