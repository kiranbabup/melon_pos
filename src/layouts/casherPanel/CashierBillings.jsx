import React, { useEffect, useState } from "react";
import { getAllOrders } from "../../services/api";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
  Divider,
  Button,
  Popover,
  CircularProgress,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import LsService, { storageKey } from "../../services/localstorage";
import TablePagination from "@mui/material/TablePagination";
import { useNavigate } from "react-router-dom";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { AccentButton } from "../../data/functions";
import "./print.css";
import billIcon from "./blackLogo.png";
import { generateReceipt, handlePrint } from "./cashFunctions";

function Row({ order, onPrintReceipt }) {
  const [open, setOpen] = useState(false);
  console.log(order);

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
        <TableCell>{order.user_name}</TableCell>
        <TableCell>
          <Button
            variant="contained"
            size="small"
            onClick={() => onPrintReceipt(order)}
          >
            Print Receipt
          </Button>
        </TableCell>
      </TableRow>

      {/* Collapsible Child Row = Cart Items */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="h6" gutterBottom>
                Cart Items
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

function CashierBillings() {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [orderMesg, setOrderMesg] = useState("");
  const [orderErrMesg, setOrderErrMesg] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const paginatedOrders = orders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  const navigate = useNavigate();
  const [billIconBase64, setBillIconBase64] = useState("");

  const userLoginStatus = LsService.getItem(storageKey);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onLogoutClick = () => {
    LsService.removeItem(storageKey);
    navigate("/");
  };

  const open = Boolean(anchorEl);

  useEffect(() => {
    setPage(0); // go back to page 0 whenever orders change
  }, [orders]);

  useEffect(() => {
    fetchStoreOrders();

    fetch(billIcon)
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => setBillIconBase64(reader.result);
        reader.readAsDataURL(blob);
      });
  }, []);

  const fetchStoreOrders = async () => {
    try {
      setOrderMesg("");
      setOrderErrMesg("");
      setLoading(true);

      const response = await getAllOrders();
      console.log(response.data);

      const apiOrders = response.data.data || [];

      const mappedOrders = apiOrders.map((o, i) => {
        const orderDateObj = new Date(o.order_date);
        const orderDateStr = orderDateObj.toISOString().slice(0, 10); // YYYY-MM-DD
        const orderTimeStr = orderDateObj.toTimeString().slice(0, 5); // HH:MM

        // Map OrderProducts -> cart[]
        const cart = (o.OrderProducts || []).map((op) => {
          const prod = Array.isArray(op.Products)
            ? op.Products[0]
            : op.Products;
          return {
            barcode: prod?.barcode || "N/A",
            name: prod?.product_name || `#${op.pr_id}`,
            quantity: op.quantity,
            price: Number(op.price),
            gst: Number(prod?.gst || 0),
            is_combo: !!op.is_combo,
          };
        });

        return {
          ...o,
          sno: i + 1,
          cart, // used by Row + onPrintReceipt
          invoice_number: o.order_id, // use order_id as invoice
          order_date: orderDateStr,
          order_time: orderTimeStr,
          paymentMethod: o.payment_method,
          total: Number(o.total_amount || 0),
          user_name: o.user_name || "Cashier", // if you store user name
        };
      });

      setOrders(mappedOrders);
      setOrderMesg(response.data.message);
    } catch (error) {
      console.error(error);
      setOrderErrMesg(
        error?.response?.data?.message || "Failed to fetch orders"
      );
    } finally {
      setLoading(false);
      setTimeout(() => {
        setOrderErrMesg("");
        setOrderMesg("");
      }, 20000);
    }
  };

  const onPrintReceipt = (order) => {
    // console.log(order);
    // Build products array for the receipt from mapped cart[]
    const products = (order.cart || []).map((item) => ({
      price: Number(item.price),
      quantity: item.quantity,
      product_name: item.name,
      gst: Number(item.gst || 0),
    }));

    // Compute total GST from items
    const totalGstPrice = products
      .reduce((sum, p) => {
        const price = p.price || 0;
        const qty = p.quantity || 0;
        const gstRate = p.gst || 0;
        return sum + (price * qty * gstRate) / 100;
      }, 0)
      .toFixed(2);

    const rePrintPayload = {
      products,
      totalGstPrice,
      total_amount: Number(order.total),
      discount_price: Number(order.discount_price || 0),
      payment_method: order.paymentMethod,
      customer_phone: order.customer_phone || "Guest",
      customer_name: order.customer_name || "Guest",
    };

    const receiptContent = generateReceipt(
      rePrintPayload,
      billIconBase64,
      order.invoice_number,
      order.user_name,
      order.order_date,
      order.order_time,
      userLoginStatus
    );

    handlePrint(receiptContent);
  };

  return (
    <Box
      sx={{
        width: "99vw",
        height: "94vh",
        backgroundColor: "white",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box sx={{ width: "95%", mt: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            height: 64,
            minHeight: 64,
            background: "#fff",
            borderRadius: 3,
            boxShadow:
              "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
            // boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            px: 3,
            mb: 2,
            position: "relative",
          }}
        >
          <ShoppingCartIcon sx={{ fontSize: 36, color: "#0072ff" }} />
          <Typography
            variant="h5"
            fontWeight={800}
            color="#222"
            sx={{ lineHeight: 1 }}
          >
            Cashier Billings
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          {orderMesg && (
            <Typography sx={{ color: "green", fontSize: "0.9rem" }}>
              {orderMesg}
            </Typography>
          )}
          {orderErrMesg && (
            <Typography sx={{ color: "red", fontSize: "0.9rem" }}>
              {orderErrMesg}
            </Typography>
          )}

          <AccentButton
            sx={{
              background: "linear-gradient(90deg, #4e54c8 0%, #8f94fb 100%)",
            }}
            onClick={() => navigate("/cashier_billing_panel")}
          >
            Go to billing
          </AccentButton>

          <Box
            sx={{
              display: "flex",
              justifyContent: "end",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                height: 40,
                bgcolor: "#f47920",
                color: "#fff",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                pr: 1,
                cursor: "pointer",
              }}
              onClick={(e) => handleAvatarClick(e)}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "navy",
                  color: "#fff",
                  borderRadius: "50%",
                  border: "3px solid white",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontWeight: "bold",
                  fontSize: 22,
                }}
              >
                {userLoginStatus?.role?.slice(0, 1).toUpperCase()}
              </Box>
              {userLoginStatus?.role?.slice(1)}
            </Box>

            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              PaperProps={{
                sx: { p: 2, minWidth: 220, borderRadius: 3 },
              }}
            >
              <Typography fontWeight="bold" fontSize="1rem" mb={0.5}>
                {userLoginStatus.username}
              </Typography>
              <Typography fontWeight="bold" fontSize="1rem" mb={0.5}>
                {userLoginStatus.email}
              </Typography>
              <Typography fontSize="0.9rem" color="text.secondary" mb={1}>
                Role: {userLoginStatus.role}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Button
                fullWidth
                variant="text"
                color="error"
                onClick={onLogoutClick}
                sx={{
                  justifyContent: "flex-start",
                  textTransform: "none",
                  fontWeight: "bold",
                }}
                startIcon={<span style={{ fontSize: 18 }}>↩</span>}
              >
                Log out
              </Button>
            </Popover>
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            {loading ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <CircularProgress color="primary" />
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <>
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
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Cashier
                    </TableCell>
                    <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedOrders.map((order) => (
                    <Row
                      key={order.order_id}
                      order={order}
                      onPrintReceipt={onPrintReceipt}
                    />
                  ))}
                </TableBody>
              </>
            )}
          </Table>
          <TablePagination
            component="div"
            count={orders.length}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0); // reset to first page
            }}
            rowsPerPageOptions={[10, 25, 50]}
          />
        </TableContainer>
        <Box p={1} />
      </Box>
    </Box>
  );
}

export default CashierBillings;
