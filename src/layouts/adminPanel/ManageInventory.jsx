// Using
import React, { useEffect, useState } from "react";
import {
  getAllProducts,
  fetchBySearchMainProducts,
  updateProduct,
} from "../../services/api";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Switch,
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
import LsService, { storageKey } from "../../services/localstorage";
import { useNavigate } from "react-router-dom";
import EditProductsModal from "../superAdminPanel/superComponents/EditProducts";

function ManageInventoryPage() {
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [productMesg, setProductMesg] = useState("");
  const [productErrMesg, setProductErrMesg] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [openEP, setOpenEP] = useState(false);
  const [rowProductData, setRowProductData] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    if (!search.trim()) {
      fetchTableData();
    }
  }, [paginationModel, search]);

  useEffect(() => {
    if (search.trim()) {
      fetchSearchMainProducts();
    }
  }, [search]);

  useEffect(() => {
    if (search.trim() && searchResults.length > 0) {
      const start = paginationModel.page * paginationModel.pageSize;
      const end = start + paginationModel.pageSize;

      const paged = searchResults.slice(start, end).map((row, idx) => ({
        ...row,
        id: start + idx + 1,
        created_on: row.created_at?.slice(0, 10),
      }));

      setTableData(paged);
      setRowCount(searchResults.length);
    }
  }, [searchResults, search, paginationModel]);

  const userDetails = LsService.getItem(storageKey);

  const fetchTableData = async () => {
    try {
      setLoading(true);

      const response = await getAllProducts(userDetails.branch_id, {
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
      });
      console.log(response.data);

      const apiData = response.data || {};
      const products = apiData.data || [];
      const total = apiData.totalUsers || apiData.total || products.length;

      const mappedData = products.map((prod, index) => ({
        ...prod,
        id: paginationModel.page * paginationModel.pageSize + index + 1,
        created_on: prod.created_at?.slice(0, 10),
      }));

      setTableData(mappedData);
      setRowCount(total);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "created_on", headerName: "Created On", flex: 1 },
    { field: "product_name", headerName: "Products Name", width: 180 },
    { field: "mrp_price", headerName: "MRP Price", flex: 1 },
    { field: "discount_price", headerName: "Discount Price", flex: 1 },
    {
      field: "quantity",
      headerName: "Quantity",
      flex: 1,
      renderCell: ({ row }) => {
        const qty = Number(row.quantity); // 👈 use row.quantity
        if (Number.isNaN(qty)) {
          return <span>-</span>; // optional fallback
        }

        let color = "black";
        if (qty === 0) color = "red";
        else if (qty <= row.qty_alert) color = "orange";
        else color = "green";

        return <span style={{ color, fontWeight: "bold" }}>{qty}</span>;
      },
    },
    {
      field: "category_id",
      headerName: "Category",
      flex: 1,
      renderCell: ({ row }) => {
        const cat = Number(row.category_id);
        if (cat === 1) return "Product";
        if (cat === 2) return "Service";
        return "Unknown";
      },
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <Switch
          checked={params.row.status === "available"}
          onChange={() =>
            toggleUsageStatus(params.row.pr_id, params.row.status)
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
            setRowProductData(params.row);
            setOpenEP(true);
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  const toggleUsageStatus = async (pr_id, currentStatus) => {
    try {
      // adapt these strings to exactly what backend expects:
      const newStatus =
        currentStatus === "available" ? "un-available" : "available";

      const response = await updateProduct(pr_id, { status: newStatus });

      if (response.status === 200) {
        setProductMesg(response.data.message);
        fetchTableData();
      } else {
        console.error("Failed to update status:", response.data.message);
        setProductErrMesg(response.data.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setTimeout(() => {
        setProductMesg("");
        setProductErrMesg("");
      }, 20000);
    }
  };

  const fetchSearchMainProducts = async () => {
    try {
      setTableData([]);
      setLoading(true);

      const trimmedSearch = search.trim();
      const response = await fetchBySearchMainProducts(userDetails.branch_id, trimmedSearch);
      console.log(response.data.products);

      const data = response.data.products || [];

      setSearchResults(
        data.map((prod, index) => ({
          ...prod,
          id: index + 1,
          created_on: prod.created_at?.slice(0, 10),
        }))
      );

      setRowCount(data.length);
    } catch (error) {
      console.error("Failed to fetch search results:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeEditProductsModal = () => {
    setRowProductData("");
    setOpenEP(false);
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
                label="Search Product by Name or Barcode"
                placeholder="Search Product"
                variant="outlined"
                size="small"
                value={search}
                sx={{ width: "30rem" }}
                onChange={(e) => setSearch(e.target.value)}
              />

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
              {/* <IconButton onClick={() => fetchTableData()}>
                <RefreshIcon />
              </IconButton> */}

              <Button
                variant="outlined"
                color="primary"
                size="small"
                sx={{ mr: 1, fontWeight: "bold" }}
                onClick={() => nav("/add-to-main")}
              >
                Add to Inventory
              </Button>
            </Box>
          </Box>

          <EditProductsModal
            open={openEP}
            onClose={() => closeEditProductsModal()}
            fetchProducts={fetchTableData}
            productsData={rowProductData}
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

export default ManageInventoryPage;
