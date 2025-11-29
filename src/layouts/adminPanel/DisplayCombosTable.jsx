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
import { getCombosByBranch } from "../../services/api";
import LsService, { storageKey } from "../../services/localstorage";

function Row({ combo }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Parent Row = Combo */}
      <TableRow>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{combo.sno}</TableCell>
        <TableCell>{combo.combo_id}</TableCell>
        <TableCell>{combo.combo_name}</TableCell>
        <TableCell>
          {combo.is_product ? "Product Combo" : "Service Combo"}
        </TableCell>
        <TableCell>₹{combo.combo_price.toFixed(2)}</TableCell>
        <TableCell>{combo.combo_gst}%</TableCell>
        <TableCell>
          {combo.created_date} {combo.created_time}
        </TableCell>
        <TableCell>{combo.status ? "Active" : "Inactive"}</TableCell>
      </TableRow>

      {/* Collapsible Child Row = Items inside combo */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="h6" gutterBottom>
                Combo Items
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
                      Type
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
                  {combo.items?.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.barcode}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell align="center">{item.category}</TableCell>
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

function DisplayCombosTable() {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const userLoginStatus = LsService.getItem(storageKey);

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

      const response = await getCombosByBranch(userLoginStatus.branch_id);
      // console.log(response.data);

      const apiCombos = response.data.data || [];

      const mappedCombos = apiCombos.map((c, i) => {
        const createdAt = new Date(c.created_at);
        const createdDate = createdAt.toISOString().slice(0, 10); // YYYY-MM-DD
        const createdTime = createdAt.toTimeString().slice(0, 5); // HH:MM

        const items = (c.ComboProducts || []).map((cp) => {
          const p = cp.Product || {};
          return {
            barcode: p.barcode || "N/A",
            name: p.product_name || `#${cp.pr_id}`,
            price: Number(cp.price), // combo component price
            gst: Number(p.gst || c.combo_gst || 0),
            category:
              Number(p.category_id) === 1
                ? "Product"
                : Number(p.category_id) === 2
                ? "Service"
                : "Other",
          };
        });

        return {
          sno: i + 1,
          combo_id: c.combo_id,
          combo_name: c.combo_name,
          combo_price: Number(c.combo_price || 0),
          combo_gst: Number(c.combo_gst || 0),
          is_product: !!c.is_product, // true = product combo, false = service combo
          status: c.status,
          created_date: createdDate,
          created_time: createdTime,
          items, // used in Row collapse
        };
      });

      setOrders(mappedCombos);
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
          HeaderTitle="Created Combos List"
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
                        Combo ID
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Combo Name
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Type
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Combo Price
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        GST
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Created At
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Status
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paginatedOrders.map((combo) => (
                      <Row key={combo.combo_id} combo={combo} />
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
          {orders.length < 10 ? <Box p={2} /> : <Box p={8} />}
        </Box>
      </Box>
    </Box>
  );
}

export default DisplayCombosTable;
