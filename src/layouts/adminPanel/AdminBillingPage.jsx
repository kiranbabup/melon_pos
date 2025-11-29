// AdminBillingPage
import React, { useEffect, useState } from "react";
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

function Row({ order }) {
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

function AdminBillingPage() {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0); // totalUsers from backend

  useEffect(() => {
    fetchStoreOrders();
  }, [paginationModel]);

  const fetchStoreOrders = async () => {
    try {
      setLoading(true);

      const response = await getAllOrders({
        page: paginationModel.page + 1, // backend is usually 1-based
        limit: paginationModel.pageSize,
      });
      // console.log(response.data);

      const apiData = response.data || {};
      const apiOrders = apiData.data || [];
      const totalUsers = apiData.totalOrders || 0; // total count from backend

      const mappedOrders = apiOrders.map((o, i) => {
        const orderDateObj = new Date(o.order_date);
        const orderDateStr = orderDateObj.toISOString().slice(0, 10); // YYYY-MM-DD
        const orderTimeStr = orderDateObj.toTimeString().slice(0, 5); // HH:MM

        // 🔹 GROUP PRODUCTS & COMBOS
        const productMap = new Map();
        const comboMap = new Map();

        (o.OrderProducts || []).forEach((op) => {
          // 👉 COMBO LINES
          if (op.ComboProduct) {
            const cp = op.ComboProduct;
            const comboId = cp.combo_id;
            const comboMeta = cp.Combo || {};

            // ❗ if we already processed this combo_id once, ignore duplicates
            if (comboMap.has(comboId)) return;

            const lineQty = Number(op.quantity || 0); // quantity of this combo purchased
            const comboName = comboMeta.combo_name || `Combo #${comboId}`; // use this
            const comboPrice = Number(comboMeta.combo_price || 0); // use this
            const comboGst = Number(comboMeta.combo_gst || 0); // use this

            comboMap.set(comboId, {
              combo_id: comboId,
              name: comboName,
              quantity: lineQty, // do NOT sum, just take from first row
              pricePerCombo: comboPrice,
              gst: comboGst,
            });

            return;
          }

          // 👉 NORMAL PRODUCT LINES
          const prod = Array.isArray(op.Products)
            ? op.Products[0]
            : op.Products;
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

        // 🔹 Build cart[] from both maps
        const cart = [];

        // Normal products
        productMap.forEach((p) => {
          const unitPrice = p.quantity ? p.totalPrice / p.quantity : 0;
          const total = unitPrice * p.quantity;

          cart.push({
            barcode: p.barcode,
            name: p.name,
            quantity: p.quantity,
            price: unitPrice,
            item_total: Number(total.toFixed(2)), // 👈 qty * price
            gst: p.gst,
            is_combo: false,
          });
        });

        // Combos (one row per combo_id, using first occurrence only)
        comboMap.forEach((c) => {
          const total = c.pricePerCombo * c.quantity;

          cart.push({
            barcode: "N/A",
            name: c.name, // combo_name
            quantity: c.quantity, // quantity from the first row
            price: c.pricePerCombo, // combo_price (per combo)
            item_total: Number(total.toFixed(2)), // 👈 qty * price
            gst: c.gst, // combo_gst
            is_combo: true,
          });
        });

        return {
          ...o,
          sno: paginationModel.page * paginationModel.pageSize + i + 1,
          cart, // ✅ aggregated list used by Row & onPrintReceipt
          invoice_number: o.order_id,
          order_date: orderDateStr,
          order_time: orderTimeStr,
          paymentMethod: o.payment_method,
          total: Number(o.total_amount || 0),
          user_name: o.user_name || "Cashier",
        };
      });

      setOrders(mappedOrders);
      setRowCount(totalUsers);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onDownloadxl = () => {
    if (orders.length === 0) {
      alert("No billing data available to download.");
      return;
    }

    let currentInvoice = null;
    let serialNo = paginationModel.page * paginationModel.pageSize + 1;

    const exportData = orders.flatMap((order) =>
      order.cart.map((item) => {
        const taxableAmount = (item.price * 100) / (100 + item.gst);
        const totalGSTAmount = item.price - taxableAmount;
        const cgstAmount = totalGSTAmount / 2;
        const sgstAmount = totalGSTAmount / 2;

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
          Discount: (item.discount || 0).toFixed(2),
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

    const startRow = paginationModel.page * paginationModel.pageSize + 1;
    const endRow = startRow + orders.length - 1;
    const filename = `Billings_${startRow}-${endRow}_of_${rowCount}.xlsx`;

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    worksheet["!cols"] = [
      { wch: 5 },
      { wch: 20 },
      { wch: 10 },
      { wch: 10 },
      { wch: 30 },
      { wch: 8 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 12 },
      { wch: 10 },
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
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((order) => (
                      <Row key={order.order_id} order={order} />
                    ))}
                  </TableBody>
                </>
              )}
            </Table>
            <TablePagination
              component="div"
              count={rowCount} // totalUsers from server
              page={paginationModel.page}
              onPageChange={(_e, newPage) =>
                setPaginationModel((prev) => ({ ...prev, page: newPage }))
              }
              rowsPerPage={paginationModel.pageSize}
              onRowsPerPageChange={(event) => {
                const newSize = parseInt(event.target.value, 10);
                setPaginationModel({ page: 0, pageSize: newSize });
              }}
              rowsPerPageOptions={[10, 25, 50]}
            />
          </TableContainer>
          {rowCount < 10 ? <Box p={2} /> : <Box p={8} />}
        </Box>
      </Box>
    </Box>
  );
}

export default AdminBillingPage;
