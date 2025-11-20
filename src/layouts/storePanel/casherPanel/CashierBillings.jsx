import React, { useEffect, useState } from "react";
import { getAllOrders, getAllStores } from "../../../services/api";
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
import LsService, { storageKey } from "../../../services/localstorage";
import TablePagination from "@mui/material/TablePagination";
import { useNavigate } from "react-router-dom";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { AccentButton } from "../../../data/functions";
import "./print.css";
import billIcon from "./blackLogo.png";
import { generateReceipt, handlePrint } from "./cashFunctions";

function Row({ order, onPrintReceipt }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Parent Row = Order */}
      <TableRow>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{order.invoice_number}</TableCell>
        <TableCell>
          {order.customerDetails === null
            ? "N/A"
            : order.customerDetails?.customerName}
        </TableCell>
        <TableCell>
          {order.customerDetails === null
            ? order.customerPhone
            : order.customerDetails?.customerMobile}
        </TableCell>
        <TableCell>
          {order.order_date} {order.order_time}
        </TableCell>
        <TableCell>{order.paymentMethod}</TableCell>
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
                      align="right"
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.cart?.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.barcode}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">₹{item.price}</TableCell>
                      <TableCell align="right">{item.gst}%</TableCell>
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
  const [storeId, setStoreId] = useState(0);
  const [userId, setUserId] = useState("");
  const [orders, setOrders] = useState([]);
  const [orderMesg, setOrderMesg] = useState("");
  const [orderErrMesg, setOrderErrMesg] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [storeDetails, setStoreDetails] = useState(null);

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
    const fetchIds = async () => {
      try {
        setLoading(true);
        const userLoginStatus = LsService.getItem(storageKey);
        const strId = userLoginStatus.store_id;
        const usrId = userLoginStatus.user_id;
        const response = await getAllStores();

        if (strId) {
          setStoreId(strId);
          setUserId(usrId);
          if (response?.data) {
            // find store by id
            const selectedStore = response.data.stores.find(
              (store) => store.store_id === userLoginStatus.store_id
            );

            if (selectedStore) {
              setStoreDetails(selectedStore);
              // console.log("Store Details:", selectedStore);
            } else {
              console.log("No store found with this ID");
            }
          }
        } else {
          setOrderErrMesg("Invalid store_code, no store found");
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
        setOrderErrMesg("Failed to fetch store details");
      } finally {
        setLoading(false);
      }
    };
    fetchIds();

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
      const payload = {
        user_id: userId,
        store_id: storeId,
      };
      // console.log(payload);

      const response = await getAllOrders(payload);
      // console.log(response);
      // console.log(response.data.orders);

      setOrders(response.data.orders.reverse() || []);

      setOrderMesg(response.data.message);
    } catch (error) {
      setOrderErrMesg(error.response.data.message);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setOrderErrMesg("");
        setOrderMesg("");
      }, 20000);
    }
  };

  useEffect(() => {
    if (storeId > 0) {
      fetchStoreOrders();
    }
  }, [storeId]);

  const onPrintReceipt = (order) => {
    // console.log(order);
    const rePrintPayload = {
      total_amount: order.total,
      payment_method: order.paymentMethod,
      store_id: storeId,
      products: order.cart.map((item) => ({
        price: item.price,
        quantity: item.quantity,
        product_name: item.name,
      })),
      customer_phone: order.customerPhone || "Guest",
    };
    const customerName =
      order.customerDetails === null
        ? "N/A"
        : order.customerDetails?.customerName;
    const receiptContent = generateReceipt(
      rePrintPayload,
      billIconBase64,
      storeDetails,
      customerName,
      order.invoice_number,
      order.user_name,
      order.order_date,
      order.order_time
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
            onClick={() => navigate("/cashier-panel")}
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
                width: 40,
                height: 40,
                bgcolor: "#f47920",
                color: "#fff",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: 22,
                cursor: "pointer",
              }}
              onClick={(e) => handleAvatarClick(e)}
            >
              {userLoginStatus.role.slice(0, 1).toUpperCase()}
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
              <Typography fontSize="0.95rem" color="text.secondary" mb={0.5}>
                {userLoginStatus.warehouse_code}
              </Typography>
              <Typography fontSize="0.95rem" color="text.secondary" mb={0.5}>
                {userLoginStatus.store_code}
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
