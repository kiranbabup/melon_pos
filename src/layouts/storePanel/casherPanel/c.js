// import React, { useEffect, useState, useRef } from "react";
// import { Box, Typography, Button, TextField, IconButton, Paper, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Snackbar, Divider, Popover, InputAdornment } from "@mui/material";
// import MuiAlert from '@mui/material/Alert';
// import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
// import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
// import DeleteIcon from '@mui/icons-material/Delete';
// import AddIcon from '@mui/icons-material/Add';
// import RemoveIcon from '@mui/icons-material/Remove';
// import SearchIcon from '@mui/icons-material/Search';
// import LogoutIcon from '@mui/icons-material/Logout';
// import { get_store_product_details, get_customer_data, billing } from "../../../services/api";
// import LsService, { storageKey } from "../../../services/localstorage";
// import { useNavigate } from "react-router-dom";
// import { AccentButton, GlassCard, PaymentButton } from "../../../data/functions";
// import CloseIcon from "@mui/icons-material/Close";
// import billIcon from "../../../data/images/melon.png";

// const CashierDashboard = () => {
//   // ... existing states ...
//   const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
//   const [receiptData, setReceiptData] = useState(null); // new state for receipt data
//   const receiptRef = useRef(null); // Ref for the receipt content

//   // Function to generate receipt content
//   const generateReceipt = (billingData) => {
//     const today = new Date();
//     const date = today.toLocaleDateString();
//     const time = today.toLocaleTimeString();

//     return `
//       <div style="font-family: monospace; width: 300px; margin: 0 auto;">
//         <div style="text-align: center;">
//           <img src="${billIcon}" alt="Logo" style="max-width: 150px;">
//           <h3 style="margin-bottom: 5px;">Sri KK Mart</h3>
//           <p style="font-size: 12px; margin: 0;">Uravakonda, Anantapur</p>
//           <p style="font-size: 12px; margin: 0;">${date} ${time}</p>
//         </div>
//         <hr style="border-top: 1px dashed #000; margin: 10px 0;">
//         <div style="display: flex; justify-content: space-between; font-size: 12px;">
//           <span>Customer:</span>
//           <span>${billingData.customer_phone || 'Guest'}</span>
//         </div>
//         <hr style="border-top: 1px dashed #000; margin: 10px 0;">
//         <div style="font-size: 12px;">
//           ${billingData.products.map(item => `
//             <div style="display: flex; justify-content: space-between;">
//               <span>${item.is_combo ? item.combo_id : item.product_id} x ${item.quantity}</span>
//               <span>₹${(item.price * item.quantity).toFixed(2)}</span>
//             </div>
//           `).join('')}
//         </div>
//         <hr style="border-top: 1px dashed #000; margin: 10px 0;">
//         <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: bold;">
//           <span>Total:</span>
//           <span>₹${billingData.total_amount.toFixed(2)}</span>
//         </div>
//         <hr style="border-top: 1px dashed #000; margin: 10px 0;">
//         <p style="text-align: center; font-size: 10px;">Thank you for shopping with us!</p>
//       </div>
//     `;
//   };

//   // Function to trigger printing
//   const handlePrint = () => {
//     const printWindow = window.open('', '', 'width=300,height=600');
//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Receipt</title>
//           <style>
//             @media print {
//               body {
//                 font-family: monospace;
//               }
//               /* Add any additional print styles here */
//             }
//           </style>
//         </head>
//         <body>${receiptData}</body>
//       </html>
//     `);
//     printWindow.document.close();
//     printWindow.focus();
//     printWindow.print();
//     printWindow.close();
//   };

//   // Billing submit handler
//   const handleBillingSubmit = async () => {
//     // Prepare billing payload with all required fields
//     const payload = {
//       customer_id: isExistingCustomer && customer ? customer.slno : null, // Use slno if existing
//       customer_joined_by: isExistingCustomer && customer ? customer.joined_by : "new",
//       user_id: userId, // cashier id from localStorage
//       total_amount: (!hasComboItem && !isExistingCustomer) ? mrpTotal : subTotal,
//       payment_method: paymentMethod,
//       store_id: storeId,
//       products: cart.map(item => ({
//         price: (!hasComboItem && !isExistingCustomer) ? item.products_price : (item.discount_price || item.products_price),
//         product_id: item.is_combo ? null : item.products_id, // null for combo, id for individual
//         is_combo: item.is_combo,
//         combo_id: item.is_combo ? item.barcode : null, // barcode for combo, null for individual
//         quantity: item.quantity
//       })),
//       is_existing_customer: isExistingCustomer,
//       customer_phone: customerMobile
//     };

//     try {
//       const resp = await billing(payload); // Call the billing API
//       console.log(resp);
//       if (resp.status === 200) {
//         // Generate receipt data
//         const receiptContent = generateReceipt(payload);
//         setReceiptData(receiptContent);
//         // Show success Snackbar
//         setSuccessSnackbarOpen(true);
//       }
//       setCart([]);
//       setAmount("0.00");
//       setChangeAmount("");
//       setCustomerMobile("");
//       setCustomerName("");
//       setCustomer(null);
//       setIsExistingCustomer(true);
//       setSearch("");
//       setBillingOpen(false);
//     } catch (err) {
//       console.error("Billing error:", err);
//       // Optionally show error Snackbar here
//     }
//   };

//   // Snackbar close handler
//   const handleSnackbarClose = (event, reason) => {
//     if (reason === 'clickaway') {
//       return;
//     }
//     setSuccessSnackbarOpen(false);
//     if (receiptData) {
//       handlePrint();
//       setReceiptData(null);
//     }
//   };

//   // ... rest of the component ...

//   {/* Snackbar for billing success */ }
//       // < Snackbar
//       //   open={successSnackbarOpen}
//       //   autoHideDuration={4000}
//       //   onClose={handleSnackbarClose}
//       //   anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
//       // >
//       //   <MuiAlert
//       //     elevation={6}
//       //     variant="filled"
//       //     onClose={handleSnackbarClose}
//       //     severity="success"
//       //     sx={{ width: '100%' }}
//       //   >
//       //     Billing successful!
//       //   </MuiAlert>
//       // </Snackbar >