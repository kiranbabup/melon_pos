// import { Box, Button, Typography } from "@mui/material"
// import LeftPannel from "../../components/LeftPannel";
// import HeaderPannel from "../../components/HeaderPannel";
// import TableComponent from "../../components/TableComponent";
// import { useEffect, useState } from "react";
// import { getAllEmployeePaymentData } from "../../services/api";
// import { onDownloadCurrentList } from "../../data/functions";

// const PaymentsReceived = () => {
//     const [tableData, setTableData] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [paginationModel, setPaginationModel] = useState({
//         page: 0,
//         pageSize: 10,
//     });
//     const [rowCount, setRowCount] = useState(0);

//     useEffect(() => {
//         fetchPaymentListData();
//     }, [paginationModel]);

//     const fetchPaymentListData = async () => {
//         try {
//             setLoading(true);
//             const response = await getAllEmployeePaymentData({
//                 page: paginationModel.page + 1,
//                 limit: paginationModel.pageSize,
//             });
//             const data = response.data.data || [];
//             console.log(response.data);

//             // Add id for DataGrid and slno for display (auto-increment)
//             const processed = data.map((row, idx) => ({
//                 ...row,
//                 srlno: paginationModel.page * paginationModel.pageSize + idx + 1,
//                 id: paginationModel.page * paginationModel.pageSize + idx + 1,
//                 addedon: row.addedon?.slice(0, 10),
//             }));

//             console.log(processed);
//             setTableData(processed);
//             setRowCount(response.data.pagination?.totalRecords || 0);
//         } catch (error) {
//             console.error("Failed to fetch Payment list data:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const columns = [
//         { field: "srlno", headerName: "Sl No", flex: 1 },
//         { field: "addedon", headerName: "Payment On", flex: 1 },
//         { field: "name", headerName: "Name", flex: 1 },
//         { field: "transaction_id", headerName: "Transaction ID", flex: 1 },
//         { field: "amount", headerName: "Amount", flex: 1 },
//         {
//             field: "payment_status",
//             headerName: "Status",
//             flex: 1,
//             sortable: false,
//             renderCell: (params) => {
//                 const isVerified = params.row.payment_status === "success";
//                 return (
//                     <Typography
//                         sx={{
//                             display: "inline-block",
//                             fontWeight: "bold",
//                             color: isVerified ? "success.main" : "error.main",
//                             fontSize: "1rem",
//                         }}
//                     >
//                         {isVerified ? "Success" : "Failed"}
//                     </Typography>
//                 );
//             }
//         },
//     ];

//     const onDownloadxl = () => {
//         onDownloadCurrentList("PaymentReceviedList", tableData);
//     }

//     return (
//         <Box sx={{
//             width: "99vw",
//             height: "94vh",
//             backgroundColor: "white",
//             display: "flex",
//         }}>
//             {/* left pannel */}
//             <Box
//                 sx={{
//                     display: "flex", justifyContent: "center", alignItems: "start",
//                     width: "18vw",
//                     mt: 1.5
//                 }}
//             >
//                 <LeftPannel />
//             </Box>
//             <Box
//                 sx={{ minWidth: "calc( 99vw - 18vw)", }}
//             >
//                 <HeaderPannel HeaderTitle="List of Payments Received to us" 
//                 tableData ={tableData} onDownloadCurrentList ={onDownloadxl}
//                 />

//                 {/* Body starts here */}
//                 <Box sx={{ width: "99%" }}>
//                     <TableComponent
//                         tableData={tableData}
//                         columns={columns}
//                         loading={loading}
//                         paginationModel={paginationModel}
//                         onPaginationModelChange={setPaginationModel}
//                         rowCount={rowCount}
//                     />
//                 </Box>
//                 {/* Body ends here */}
//             </Box>
//         </Box>
//     );
// }

// export default PaymentsReceived;