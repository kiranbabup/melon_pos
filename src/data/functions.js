import { Button, Card } from "@mui/material";
import { styled } from "@mui/material/styles";
import * as XLSX from "xlsx";

const today = new Date();
export const date = today.toLocaleDateString();
export const time = today.toLocaleTimeString();
  
export const onDownloadCurrentList = (filename, tableData) => {
        // Remove unwanted fields if needed, or just export as is
        const exportData = tableData.map(({ id, ...rest }) => rest); // remove 'id' if not needed
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `${filename}`);
        XLSX.writeFile(workbook, `${filename}.xlsx`);
    };

export const GlassCard = styled(Card)(({ theme }) => ({
  background: "rgba(255,255,255,0.7)",
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
  borderRadius: 24,
  backdropFilter: "blur(8px)",
  border: "1px solid rgba(255,255,255,0.18)",
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  minHeight: 0,
  flex: 1,
}));

export const AccentButton = styled(Button)(({ theme }) => ({
  borderRadius: 16,
  fontWeight: 700,
  fontSize: 18,
  minWidth: 140,
  height: 44,
  padding: theme.spacing(0, 3),
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  background: "linear-gradient(90deg, #00c6ff 0%, #0072ff 100%)",
  color: "#fff",
  '&:hover': {
    background: "linear-gradient(90deg, #0072ff 0%, #00c6ff 100%)",
  }
}));

export const PaymentButton = styled(Button)(({ theme, selected }) => ({
  borderRadius: 12,
  fontWeight: 600,
  fontSize: 16,
  minWidth: 100,
  height: 44,
  margin: theme.spacing(0.5),
  background: selected ? "linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)" : "#f4f4f4",
  color: selected ? "#fff" : "#222",
  boxShadow: selected ? "0 2px 8px rgba(67,233,123,0.15)" : "none",
  '&:hover': {
    background: "linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)",
    color: "#fff"
  }
}));

export const formatToINR = (number) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  };


    // 0:    cart    :    
    //     Array(4)
    //         0:    
    //             barcode    :    "123456789"
    //             batch_number    :    "18082025"
    //             cgst    :    1
    //             combo_item    :    false
    //             description    :    ""
    //             name    :    "Moong dal pro"
    //             price    :    120
    //             quantity    :    9
    //             sgst    :    1
    //             [[Prototype]]:    Object
    //         1:    { barcode: '123456789', name: 'Moong dal pro', description: '', price: 255, quantity: 1, … }
    //         2:    { barcode: '8904236200918', name: 'Fish seeds', description: '', price: 255, quantity: 1, … }
    //         3:    { barcode: 'qwertyu1234', name: 'VERMECELLI', description: '', price: 100, quantity: 7, … }
    //         length    :    4
    //         [[Prototype]]:    Array(0)
    //         customerDetails    :    
    //         customerMobile    :    "6303442696"
    //         customerName    :    "Dani Meenakshi "
    //         [[Prototype]]:    Object
    //         invoice_number    :    "INV-11"
    //         order_date    :    "21/8/2025"
    //         order_id    :    11
    //         order_time    :    "05:19 pm"
    //         paymentMethod    :    "cash"
    //         total    :    2035
    //         user_id    :    6
    //         user_name    :    "MohanVsp"