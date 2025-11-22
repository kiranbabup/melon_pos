// Using
import React, { useEffect, useState } from "react";
import {
  getAllCustomers,
  fetchBySearchPhone,
  fetchCustomerOrdersByPhone,
} from "../../services/api";
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

// helper to format date & time like 2025-11-22 12:13 pm
const formatOrderDateTime = (isoString) => {
  if (!isoString) return "N/A";
  const d = new Date(isoString);
  const date = d.toISOString().slice(0, 10); // YYYY-MM-DD
  const time = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${date} ${time}`;
};

function ManageCustomers() {
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [search, setSearch] = useState("");
  const [displayCustomerData, setdisplayCustomerData] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [customerOrdersData, setCustomerOrdersData] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState({
    name: "",
    phone: "",
  });

  // -------- Columns --------
  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "created_on", headerName: "Created On", flex: 1 },
    {
      field: "customer_name",
      headerName: "Customer Name",
      width: 180,
      renderCell: ({ row }) => {
        const cusName = row.customer_name;
        const hasCusName = cusName && cusName.trim() !== "";
        return hasCusName ? cusName : "N/A";
      },
    },
    {
      field: "customer_phone",
      headerName: "Phone Number",
      flex: 1,
      renderCell: ({ row }) => {
        const phone = row.customer_phone;
        const hasPhone = phone && phone.trim() !== "";
        return hasPhone ? phone : "N/A";
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderCell: (params) => {
        const phone = params.row.customer_phone;
        const hasPhone = phone && phone.trim() !== "";

        if (!hasPhone) {
          return <Typography>N/A</Typography>;
        }

        return (
          <Button
            size="small"
            variant="contained"
            onClick={() => {
              setSelectedCustomer({
                name:
                  params.row.customer_name &&
                  params.row.customer_name.trim() !== ""
                    ? params.row.customer_name
                    : "N/A",
                phone: params.row.customer_phone || "N/A",
              });
              setdisplayCustomerData(true);
              onHandleViewCustomerOrders(params.row.customer_phone);
            }}
          >
            View
          </Button>
        );
      },
    },
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

      const cust = res.data?.data;
      if (cust) {
        const mapped = {
          ...cust,
          id: 1,
          created_on: cust.created_at?.slice(0, 10),
        };
        setTableData([mapped]);
        setRowCount(1);
      } else {
        setTableData([]);
        setRowCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch customer by phone:", error);
      setTableData([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  };

  // -------- Effects --------

  useEffect(() => {
    if (!search) {
      fetchTableData();
    }
  }, [paginationModel, search]);

  // When search changes
  useEffect(() => {
    if (!search) {
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
      return;
    }

    if (search.length === 10) {
      setPaginationModel({ page: 0, pageSize: 10 });
      fetchCustomerByPhone(search);
    }
  }, [search]);

  const onHandleViewCustomerOrders = async (phone) => {
    try {
      setLoadingData(true);
      const response = await fetchCustomerOrdersByPhone(phone);
      console.log(response.data.data);
      setCustomerOrdersData(response.data.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoadingData(false);
    }
  };

  // Group orders into products / services for display
  const productOrders = customerOrdersData
    .map((order) => {
      const items = (order.OrderProducts || [])
        .map((op) => {
          const prod = Array.isArray(op.Products)
            ? op.Products[0]
            : op.Products;
          return { ...op, product: prod };
        })
        .filter((it) => it.product && it.product.category_id === 1); // Products only

      if (items.length === 0) return null;
      return { order, items };
    })
    .filter(Boolean);

  const serviceOrders = customerOrdersData
    .map((order) => {
      const items = (order.OrderProducts || [])
        .map((op) => {
          const prod = Array.isArray(op.Products)
            ? op.Products[0]
            : op.Products;
          return { ...op, product: prod };
        })
        .filter((it) => it.product && it.product.category_id === 2); // Services only

      if (items.length === 0) return null;
      return { order, items };
    })
    .filter(Boolean);

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
        {!displayCustomerData ? (
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
                  placeholder="Enter 10-digit phone"
                  variant="outlined"
                  size="small"
                  value={search}
                  sx={{ width: "30rem" }}
                  onChange={(e) =>
                    setSearch(
                      e.target.value.replace(/[^0-9]/g, "").slice(0, 10)
                    )
                  }
                  onKeyDown={(e) => {
                    const allowedKeys = [
                      "Backspace",
                      "Delete",
                      "ArrowLeft",
                      "ArrowRight",
                      "Tab",
                    ];
                    if (
                      !/^[0-9]$/.test(e.key) &&
                      !allowedKeys.includes(e.key)
                    ) {
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
        ) : (
          <Box sx={{ width: "99%", mb: 4 }}>
            {/* Header with customer info + close button */}
            <Box
              sx={{
                borderRadius: "10px",
                boxShadow:
                  "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
                p: 2,
                mb: 2,
                background: "#506991",
              }}
            >
              <Typography variant="h6" fontWeight={700} color="white">
                Customer Orders
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography color="white">
                  Name:{" "}
                  <strong>
                    {customerOrdersData[0]?.customer_name?.trim()
                      ? customerOrdersData[0].customer_name
                      : "N/A"}
                  </strong>
                </Typography>
                <Typography color="white">
                  Phone:{" "}
                  <strong>
                    {customerOrdersData[0]?.customer_phone || "N/A"}
                  </strong>
                </Typography>

                <Button
                  variant="contained"
                  color="error"
                  onClick={() => {
                    setdisplayCustomerData(false);
                    setCustomerOrdersData([]);
                  }}
                >
                  CLOSE
                </Button>
              </Box>
            </Box>

            {/* Products & Services columns */}
            {loadingData ? (
              <Box sx={{ textAlign: "center", mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : customerOrdersData.length === 0 ? (
              <Box
                sx={{
                  borderRadius: "10px",
                  boxShadow:
                    "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
                  p: 3,
                  background: "#fff",
                }}
              >
                <Typography align="center">
                  No orders found for this customer.
                </Typography>
              </Box>
            ) : (
              customerOrdersData.map((order) => {
                const items = order.OrderProducts || [];
                const invoiceNo = `INV${order.order_id}`;
                const orderDateTime = formatOrderDateTime(order.order_date);
                const totalAmount = Number(order.total_amount || 0).toFixed(2);
                const orderDiscount = Number(order.discount_price || 0).toFixed(
                  2
                );

                return (
                  <Box
                    key={order.order_id}
                    sx={{
                      mb: 3,
                      borderRadius: "10px",
                      boxShadow:
                        "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
                      overflow: "hidden",
                      background: "#fff",
                    }}
                  >
                    {/* Order header row – like Bills table top row */}
                    <Box
                      sx={{
                        backgroundColor: "#0d3679",
                        color: "white",
                        p: 1.5,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 3,
                      }}
                    >
                      <Typography>
                        Order ID: <strong>{invoiceNo}</strong>
                      </Typography>
                      <Typography>
                        Order Date &amp; Time: <strong>{orderDateTime}</strong>
                      </Typography>
                      <Typography>
                        Total Order Amount: <strong>₹{totalAmount}</strong>
                      </Typography>
                      <Typography>
                        Order Discount: <strong>₹{orderDiscount}</strong>
                      </Typography>
                      <Typography>
                        Payment Method: <strong>{order.payment_method}</strong>
                      </Typography>
                    </Box>

                    {/* Inner table – Cart Items */}
                    <Box sx={{ p: 2 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ mb: 1 }}
                      >
                        Cart Items
                      </Typography>

                      <Paper sx={{ width: "100%", overflowX: "auto" }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ backgroundColor: "#f0f4ff" }}>
                              <TableCell sx={{ fontWeight: "bold" }}>
                                S No
                              </TableCell>
                              <TableCell sx={{ fontWeight: "bold" }}>
                                Name
                              </TableCell>
                              <TableCell sx={{ fontWeight: "bold" }}>
                                Type
                              </TableCell>
                              <TableCell sx={{ fontWeight: "bold" }}>
                                Qty
                              </TableCell>
                              <TableCell sx={{ fontWeight: "bold" }}>
                                MRP Price
                              </TableCell>
                              <TableCell sx={{ fontWeight: "bold" }}>
                                Selling Price
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {items.map((op, idx) => {
                              const prod = Array.isArray(op.Products)
                                ? op.Products[0]
                                : op.Products;

                              const categoryId = prod?.category_id;
                              const isService = categoryId === 2;
                              const typeLabel = isService
                                ? "Service"
                                : "Product";
                              const name = prod?.product_name || `#${op.pr_id}`;
                              const mrp = Number(prod?.mrp_price || 0).toFixed(
                                2
                              );
                              const selling = Number(
                                prod?.discount_price || op.price || 0
                              ).toFixed(2);

                              return (
                                <TableRow
                                  key={`${order.order_id}-${op.pr_id}-${idx}`}
                                >
                                  <TableCell>{idx + 1}</TableCell>
                                  <TableCell>{name}</TableCell>
                                  <TableCell>{typeLabel}</TableCell>
                                  <TableCell>{op.quantity}</TableCell>
                                  <TableCell>₹{mrp}</TableCell>
                                  <TableCell>₹{selling}</TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </Paper>
                    </Box>
                  </Box>
                );
              })
            )}
            <Box p={1}/>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default ManageCustomers;
