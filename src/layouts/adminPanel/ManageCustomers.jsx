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
  Collapse,
  IconButton,
} from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

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

function Row({ order }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {/* Parent Row = Order */}
      <TableRow>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{order.sno}</TableCell>
        <TableCell>INV{order.invoice_number}</TableCell>
        <TableCell>
          {order.customer_name ? order.customer_name : "N/A"}
        </TableCell>
        <TableCell>
          {order.customer_phone ? order.customer_phone : "N/A"}
        </TableCell>
        <TableCell>
          {order.order_date} {order.order_time}
        </TableCell>
        <TableCell>{order.paymentMethod}</TableCell>
        <TableCell>₹{order.discount_price}</TableCell>
        <TableCell>₹{order.total}</TableCell>
      </TableRow>

      {/* Collapsible Child Row = Cart Items */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="h6" gutterBottom>
                Items
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: "#506991",
                    }}
                  >
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Barcode
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Name
                    </TableCell>
                    <TableCell
                      sx={{ color: "white", fontWeight: "bold" }}
                      align="center"
                    >
                      Qty
                    </TableCell>
                    <TableCell
                      sx={{ color: "white", fontWeight: "bold" }}
                      align="right"
                    >
                      Price
                    </TableCell>
                    <TableCell
                      sx={{ color: "white", fontWeight: "bold" }}
                      align="right"
                    >
                      Item Total
                    </TableCell>
                    <TableCell
                      sx={{ color: "white", fontWeight: "bold" }}
                      align="right"
                    >
                      GST
                    </TableCell>
                    <TableCell
                      sx={{ color: "white", fontWeight: "bold" }}
                      align="center"
                    >
                      isCombo
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.cart?.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.barcode}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                      <TableCell align="right">₹{item.price}</TableCell>
                      <TableCell align="right">₹{item.item_total}</TableCell>
                      <TableCell align="right">{item.gst}%</TableCell>
                      <TableCell align="center">
                        {item.is_combo === true ? "Yes" : "No"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

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
  const [ordersPagination, setOrdersPagination] = useState({
    page: 0,
    pageSize: 10,
  });
  const [ordersRowCount, setOrdersRowCount] = useState(0);

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
              const phone = params.row.customer_phone || "N/A";

              setSelectedCustomer({
                name:
                  params.row.customer_name &&
                  params.row.customer_name.trim() !== ""
                    ? params.row.customer_name
                    : "N/A",
                phone,
              });

              setdisplayCustomerData(true);
              setOrdersPagination({ page: 0, pageSize: 10 });
              onHandleViewCustomerOrders(phone, 0, 10);
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
      // console.log(response.data);

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
      // console.log("search result:", res.data);

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

  useEffect(() => {
    if (!search) {
      fetchTableData();
    }
  }, [paginationModel, search]);

  // When search changes
  useEffect(() => {
    if (!search) {
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
      fetchTableData();
      return;
    }

    // any length > 0 -> search
    setPaginationModel({ page: 0, pageSize: 10 });
    fetchCustomerByPhone(search);
  }, [search]);

  useEffect(() => {
    if (!displayCustomerData || !selectedCustomer.phone) return;

    onHandleViewCustomerOrders(
      selectedCustomer.phone,
      ordersPagination.page,
      ordersPagination.pageSize
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordersPagination]);

  // Build aggregated cart (products + combos) from a single order object
  const buildCartForOrder = (order) => {
    const productMap = new Map();
    const comboMap = new Map();

    (order.OrderProducts || []).forEach((op) => {
      // 👉 COMBO LINES
      if (op.ComboProduct) {
        const cp = op.ComboProduct;
        const comboId = cp.combo_id;
        const comboMeta = cp.Combo || {};

        // if we already processed this combo_id once, ignore duplicates
        if (comboMap.has(comboId)) return;

        const lineQty = Number(op.quantity || 0); // quantity purchased of this combo
        const comboName = comboMeta.combo_name || `Combo #${comboId}`;
        const comboPrice = Number(comboMeta.combo_price || 0);
        const comboGst = Number(comboMeta.combo_gst || 0);

        comboMap.set(comboId, {
          combo_id: comboId,
          name: comboName,
          quantity: lineQty,
          pricePerCombo: comboPrice,
          gst: comboGst,
        });

        return;
      }

      // 👉 NORMAL PRODUCT / SERVICE LINES
      const prod = Array.isArray(op.Products) ? op.Products[0] : op.Products;
      if (!prod) return;

      const prId = prod.pr_id;
      const lineQty = Number(op.quantity || 0);
      const linePrice = Number(prod.discount_price || op.price || 0);
      const gst = Number(prod.gst || 0);

      let entry = productMap.get(prId);
      if (!entry) {
        entry = {
          barcode: prod.barcode || "N/A",
          name: prod.product_name || `#${prId}`,
          quantity: 0,
          totalPrice: 0,
          gst,
        };
      }

      entry.quantity += lineQty;
      entry.totalPrice += lineQty * linePrice;

      productMap.set(prId, entry);
    });

    // 🔹 Build final cart[]
    const cart = [];

    // Normal products/services
    productMap.forEach((p) => {
      const unitPrice = p.quantity ? p.totalPrice / p.quantity : 0;
      const total = unitPrice * p.quantity;

      cart.push({
        barcode: p.barcode,
        name: p.name,
        quantity: p.quantity,
        price: Number(unitPrice.toFixed(2)),
        item_total: Number(total.toFixed(2)),
        gst: p.gst,
        is_combo: false,
      });
    });

    // Combos (one row per combo_id – first occurrence only)
    comboMap.forEach((c) => {
      const total = c.pricePerCombo * c.quantity;

      cart.push({
        barcode: "N/A",
        name: c.name,
        quantity: c.quantity,
        price: Number(c.pricePerCombo.toFixed(2)),
        item_total: Number(total.toFixed(2)),
        gst: c.gst,
        is_combo: true,
      });
    });

    return cart;
  };

  // inside ManageCustomers component, before return()
  const customerOrdersWithCart = customerOrdersData.map((o, i) => {
    const orderDateObj = new Date(o.order_date);
    const orderDateStr = orderDateObj.toISOString().slice(0, 10);
    const orderTimeStr = orderDateObj.toTimeString().slice(0, 5);

    return {
      ...o,
      sno: ordersPagination.page * ordersPagination.pageSize + i + 1,
      invoice_number: o.order_id,
      order_date: orderDateStr,
      order_time: orderTimeStr,
      paymentMethod: o.payment_method,
      discount_price: Number(o.discount_price || 0),
      total: Number(o.total_amount || 0),
      cart: buildCartForOrder(o),
    };
  });

  const onHandleViewCustomerOrders = async (phone, page = 0, pageSize = 10) => {
    try {
      setLoadingData(true);

      const response = await fetchCustomerOrdersByPhone(phone, {
        page: page + 1, // backend is 1-based
        limit: pageSize,
      });

      const apiData = response.data || {};
      const orders = apiData.data || [];
      const totalOrders =
        apiData.totalUsers || apiData.totalOrders || orders.length;

      setCustomerOrdersData(orders);
      setOrdersRowCount(totalOrders);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomerOrdersData([]);
      setOrdersRowCount(0);
    } finally {
      setLoadingData(false);
    }
  };

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
            {rowCount < 10 ? <Box p={2} /> : <Box p={8} />}
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

            {/* Orders table with collapsible rows (like AdminBillingPage) */}
            {loadingData ? (
              <Box sx={{ textAlign: "center", mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : customerOrdersWithCart.length === 0 ? (
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
              <Paper sx={{ width: "100%", overflowX: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow
                      sx={{
                        backgroundColor: "#0d3679",
                      }}
                    >
                      <TableCell />
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        S No
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Invoice No
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Customer
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Mobile
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Order Date
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Payment
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Discount
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Total
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customerOrdersWithCart.map((order) => (
                      <Row key={order.order_id} order={order} />
                    ))}
                  </TableBody>
                </Table>
                {!loadingData && customerOrdersWithCart.length > 0 && (
                  <TablePagination
                    component="div"
                    count={ordersRowCount}
                    page={ordersPagination.page}
                    rowsPerPage={ordersPagination.pageSize}
                    onPageChange={(_e, newPage) =>
                      setOrdersPagination((prev) => ({
                        ...prev,
                        page: newPage,
                      }))
                    }
                    onRowsPerPageChange={(e) =>
                      setOrdersPagination({
                        page: 0,
                        pageSize: parseInt(e.target.value, 10),
                      })
                    }
                    rowsPerPageOptions={[5, 10, 25]}
                  />
                )}
              </Paper>
            )}

            <Box p={2} />
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default ManageCustomers;
