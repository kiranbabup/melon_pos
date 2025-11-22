// Using
import React, { useEffect, useState } from "react";
import { getAllCustomers, fetchBySearchPhone } from "../../services/api";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import LeftPannel from "../../components/LeftPannel";
import HeaderPannel from "../../components/HeaderPannel";
import * as XLSX from "xlsx";
// import LsService, { storageKey } from "../../services/localstorage";

function ManageCustomers() {
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);

  const [search, setSearch] = useState("");

  // -------- Columns --------
  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "created_on", headerName: "Created On", flex: 1 },
    { field: "customer_name", headerName: "Customer Name", width: 180 },
    { field: "customer_phone", headerName: "Phone Number", width: 180 },
  ];

  // -------- Fetch all customers (paged) --------
  const fetchTableData = async () => {
    try {
      setLoading(true);

      const response = await getAllCustomers({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
      });
      console.log(response.data);

      const apiData = response.data || {};
      const customers = apiData.data || [];
      const total = apiData.totalUsers || apiData.total || customers.length;

      const mappedData = customers.map((cust, index) => ({
        ...cust,
        id: paginationModel.page * paginationModel.pageSize + index + 1,
        created_on: cust.created_at?.slice(0, 10),
      }));

      setTableData(mappedData);
      setRowCount(total);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  // -------- Fetch by phone (search) --------
  const fetchCustomerByPhone = async (phone) => {
    try {
      setLoading(true);
      const res = await fetchBySearchPhone(phone);
      console.log("search result:", res.data);

      const data = res.data?.data || [];
      const list = Array.isArray(data) ? data : [data];

      const mapped = list.map((cust, index) => ({
        ...cust,
        id: index + 1,
        created_on: cust.created_at?.slice(0, 10),
      }));

      setTableData(mapped);
      setRowCount(mapped.length);
    } catch (error) {
      console.error("Failed to fetch customer by phone:", error);
      setTableData([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  };

  // -------- Effects --------

  // When pagination changes and there is NO search -> fetch all
  useEffect(() => {
    if (!search) {
      fetchTableData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel, search]);

  // When search changes
  useEffect(() => {
    if (!search) {
      // cleared search -> show full list again
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
      fetchTableData();
      return;
    }

    // any length > 0 -> search
    setPaginationModel({ page: 0, pageSize: 10 });
    fetchCustomerByPhone(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // -------- Export to Excel --------
  const onDownloadxl = () => {
    if (tableData.length === 0) {
      alert("No Customers data available to download.");
      return;
    }

    // Build a clean array for Excel
    const exportData = tableData.map((row, index) => ({
      S_No: index + 1, // 1, 2, 3, ...
      created_at: (row.created_at || row.created_on || "").slice(0, 10), // 2025-11-21
      customer_name: row.customer_name,
      customer_phone: row.customer_phone,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CustomersList");
    XLSX.writeFile(workbook, "CustomersList.xlsx");
  };

  // -------- JSX --------
  return (
    <Box
      sx={{
        width: "99vw",
        height: "94vh",
        backgroundColor: "white",
        display: "flex",
      }}
    >
      {/* left panel */}
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
          HeaderTitle="Manage Customers"
          tableData={tableData}
          onDownloadCurrentList={onDownloadxl}
        />

        {/* Body */}
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
            <Box
              sx={{
                width: "99%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
              }}
            >
              <TextField
                label="Search by Phone Number"
                placeholder="Enter phone"
                variant="outlined"
                size="small"
                value={search}
                sx={{ width: "30rem" }}
                onChange={(e) =>
                  setSearch(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))
                }
                onKeyDown={(e) => {
                  const allowedKeys = [
                    "Backspace",
                    "Delete",
                    "ArrowLeft",
                    "ArrowRight",
                    "Tab",
                  ];
                  if (!/^[0-9]$/.test(e.key) && !allowedKeys.includes(e.key)) {
                    e.preventDefault();
                  }
                }}
              />

              {/* no add / no edit / no status toggle */}
            </Box>
          </Box>

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
                          backgroundColor: "#87ceeb !important",
                          cursor: "pointer",
                        },
                      }}
                    >
                      {columns.map((col) => (
                        <TableCell key={col.field}>{row[col.field]}</TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination – for full list mode; when searching by phone there will be at most 1 row */}
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

// export default ManageCustomers;
