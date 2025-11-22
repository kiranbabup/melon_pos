// AdminBillingPage
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  CircularProgress,
  IconButton,
} from "@mui/material";
import LeftPannel from "../../components/LeftPannel";
import HeaderPannel from "../../components/HeaderPannel";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import TablePagination from "@mui/material/TablePagination";
import * as XLSX from "xlsx";
import { getAllOrders } from "../../services/api";

function Row({ order, onPrintReceipt }) {
  const [open, setOpen] = useState(false);
//   console.log(order);

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

function AdminBillingPage() {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const paginatedOrders = orders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  useEffect(() => {
    setPage(0); // go back to page 0 whenever orders change
  }, [orders]);

  useEffect(() => {
    setPage(0); // go back to page 0 whenever orders change
  }, [orders]);

  useEffect(() => {
    fetchStoreOrders();
  }, []);

  const fetchStoreOrders = async () => {
    try {
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
    } catch (error) {
      console.error(error);
      
    } finally {
      setLoading(false);
    }
  };

  const onDownloadxl = () => {
    if (paginatedOrders.length === 0) {
      alert("No billing data available to download.");
      return;
    }

    let currentInvoice = null;
    let serialNo = page * rowsPerPage + 1; // Start serial number based on current page

    // Use paginatedOrders instead of orders
    const exportData = paginatedOrders.flatMap((order) =>
      order.cart.map((item) => {
        const taxableAmount = (item.price * 100) / (100 + item.gst);
        const totalGSTAmount = item.price - taxableAmount;
        const cgstAmount = totalGSTAmount / 2;
        const sgstAmount = totalGSTAmount / 2;

        // Check if this is a new invoice
        const showInvoiceDetails = currentInvoice !== order.invoice_number;
        if (showInvoiceDetails) {
          currentInvoice = order.invoice_number;
        }

        return {
          S_No: serialNo++,
          Date_of_Inv: showInvoiceDetails
            ? `${order.order_date} ${order.order_time}`
            : "",
          Inv_No: showInvoiceDetails ? order.invoice_number : "",
          HSN_CODE: item.batch_number,
          Material_Name: item.name,
          Quantity: item.quantity,
          Mesurement: item.unit,
          Basic_Amt: taxableAmount.toFixed(2),
          Discount: item.discount.toFixed(2),
          Taxable_Amt: taxableAmount.toFixed(2),
          Rate_of_Tax: `${item.gst}%`,
          IGST: "-",
          CGST: cgstAmount.toFixed(2),
          SGST: sgstAmount.toFixed(2),
          Total_Tax_Amt: totalGSTAmount.toFixed(2),
          Inv_Value: item.price,
        };
      })
    );

    // Generate filename with page range
    const startRow = page * rowsPerPage + 1;
    const endRow = Math.min((page + 1) * rowsPerPage, orders.length);
    const filename = `Billings_${startRow}-${endRow}_of_${orders.length}.xlsx`;

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Rest of the code remains same
    worksheet["!cols"] = [
      { wch: 5 }, // S_No
      { wch: 20 }, // Inv_Date
      { wch: 10 }, // Inv_No
      { wch: 10 }, // HSN_CODE
      { wch: 30 }, // Material_Name
      { wch: 8 }, // Quantity
      { wch: 10 }, // Mesurement
      { wch: 10 }, // Basic_Amt
      { wch: 10 }, // Discount
      { wch: 10 }, // Taxable_Amt
      { wch: 10 }, // Rate_of_Tax
      { wch: 8 }, // IGST
      { wch: 8 }, // CGST
      { wch: 8 }, // SGST
      { wch: 12 }, // Total_Tax_Amt
      { wch: 10 }, // Inv_Value
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Billings");
    XLSX.writeFile(workbook, filename);
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
        }}
      >
        <LeftPannel HeaderTitle="Super Admin" />
      </Box>

      <Box sx={{ minWidth: "calc( 99vw - 18vw)" }}>
        <HeaderPannel
          HeaderTitle="Bills Generated"
          tableData={orders}
          onDownloadCurrentList={onDownloadxl}
        />

        <Box sx={{ width: "99%" }}>
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
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {paginatedOrders.map((order) => (
                              <Row
                                key={order.order_id}
                                order={order}
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
    </Box>
  );
}

export default AdminBillingPage;
