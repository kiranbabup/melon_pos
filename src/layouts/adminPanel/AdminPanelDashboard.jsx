import { Box, Typography } from "@mui/material";
import LeftPannel from "../../components/LeftPannel";
import HeaderPannel from "../../components/HeaderPannel";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import { useEffect, useState } from "react";
// import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, YAxis, XAxis, Bar } from "recharts";
import CountCard from "../../components/dashboard_components/CountCard";
import { getDashboardStats } from "../../services/api";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import BrandingWatermarkRoundedIcon from "@mui/icons-material/BrandingWatermarkRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import BookmarkRemoveIcon from "@mui/icons-material/BookmarkRemove";
import DangerousIcon from "@mui/icons-material/Dangerous";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import StoreIcon from "@mui/icons-material/Store";
import { useNavigate } from "react-router-dom";
import LsService, { storageKey } from "../../services/localstorage";
import { formatToINR } from "../../data/functions";

const COLORS = ["green", "red"];

const AdminPanelDashboard = () => {
  // const [allProduactsCount, setAllProduactsCount] = useState(0);
  // const [allStores, setAllStores] = useState(0);
  const [counts, setCounts] = useState({});
  const navigate = useNavigate();
  const user = LsService.getItem(storageKey);

  useEffect(() => {
    const fetchTableData = async () => {
        try {
          const response = await getDashboardStats(user.branch_id);
          // console.log(response.data);
          setCounts(response.data.data);
        } catch (error) {
          console.error("Error fetching products:", error);}
      };
      fetchTableData();
  }, []);


  useEffect(() => {
    if (user.role !== "admin") {
      LsService.removeItem(storageKey);
      navigate("/");
    }
  }, [user, navigate]);

  const itemValues = [
    {
      HeadTitle: "Total Products",
      IconCompo: LocalMallIcon,
      Value: counts?.totalProducts ? counts?.totalProducts : 0,
      navpath: "/inventory",
    },
    // {
    //   HeadTitle: "Total Staff",
    //   IconCompo: SupervisorAccountIcon,
    //   Value: counts.totalUsers || 0,
    //   navpath: "/users_management"
    // },
    {
      HeadTitle: "Total Customers",
      IconCompo: SupervisorAccountIcon,
      Value: counts?.totalCustomers ? counts?.totalCustomers : 0,
      navpath: "/manage_customers",
    },
    {
      HeadTitle: "Total Orders",
      IconCompo: TrackChangesIcon,
      Value: counts?.totalOrders ? counts?.totalOrders : 0,
      navpath: "/billings",
    },
    // {
    //   HeadTitle: "Total Stores",
    //   IconCompo: StoreIcon,
    //   Value: counts.totalStores || 0,
    //   navpath: "/stores"
    // },
    // {
    //   HeadTitle: "Total Brands",
    //   IconCompo: BrandingWatermarkRoundedIcon,
    //   Value: counts.brandsCount || 0,
    //   navpath: "/brands",
    // },
    // {
    //   HeadTitle: "Total Categories",
    //   IconCompo: CategoryRoundedIcon,
    //   Value: counts.categoriesCount || 0,
    //   navpath: "/categories",
    // },
    // {
    //   HeadTitle: "Total Suppliers",
    //   IconCompo: SupervisorAccountIcon,
    //   Value: counts.suppliersCount || 0,
    //   navpath: "/suppliers"
    // },
    {
      HeadTitle: "Total Low Stock Products",
      IconCompo: BookmarkRemoveIcon,
      Value: counts?.lowStockProducts ? counts?.lowStockProducts : 0,
      navpath: "/products",
    },
    {
      HeadTitle: "Total Out of Stock Products",
      IconCompo: DangerousIcon,
      Value: counts?.outOfStockProducts ? counts?.outOfStockProducts : 0,
      navpath: "/products",
    },
    {
      HeadTitle: "Total Sales",
      IconCompo: ShowChartIcon,
      Value: counts?.totalSales ? `₹${formatToINR(counts?.totalSales)}` : 0,
      navpath: "/billings",
    },
    {
      HeadTitle: "Daily Sales",
      IconCompo: TrendingDownRoundedIcon,
      Value: counts?.todaySales ? `₹${formatToINR(counts?.todaySales)}` : 0,
      navpath: "/billings",
    },
    {
      HeadTitle: "Total Weekly Sales",
      IconCompo: TrendingDownRoundedIcon,
      Value: counts?.weekSales ? `₹${formatToINR(counts?.weekSales)}` : 0,
      navpath: "/billings",
    },
    {
      HeadTitle: "Total Monthly Sales",
      IconCompo: TrendingDownRoundedIcon,
      Value: counts?.monthSales ? `₹${formatToINR(counts?.monthSales)}` : 0,
      navpath: "/billings",
    },
  ];

  // const pieData = [
  // { name: "Payment Received", value: paymentReceivedValue },
  // { name: "Withdraw Requested", value: withdrawRequestedValue },
  // ];

  return (
    <Box
      sx={{
        width: "99vw",
        height: "94vh",
        backgroundColor: "white",
        // #f4f4f5
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
          ml: 1,
        }}
      >
        <LeftPannel HeaderTitle="Super Admin" />
      </Box>
      <Box sx={{ minWidth: "calc( 99vw - 18vw)", ml: 1.5 }}>
        <HeaderPannel HeaderTitle="Super Admin Dashboard" />

        {/* Body starts here */}
        <Box sx={{ width: "99%", mb: 4 }}>
          <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap" }}>
            {itemValues.map((item, idx) => (
              <CountCard
                key={idx}
                HeadTitle={item.HeadTitle}
                IconCompo={item.IconCompo}
                Value={item.Value}
                Navpath={item.navpath}
              />
            ))}
          </Box>

          {/* <Box sx={{ display: "flex", gap: 2, pt: 4, pb: 4 }}> */}

          {/* <Box sx={{
              width: 400, height: 300, mt: 4, borderRadius: "10px",
              boxShadow: "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
            }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    fill="#8884d8"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box> */}
          {/* Payment Received Graph */}
          {/* <Box sx={{ width: 400, height: 300, borderRadius: "10px", boxShadow: "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px", p: 2 }}>
              <Typography variant="h6" align="center" sx={{ mb: 2 }}>Payment Received</Typography>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={paymentReceivedGraph}>
                  <XAxis dataKey="done_on" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="amount" fill="#0088FE" name="Amount" />
                </BarChart>
              </ResponsiveContainer>
            </Box> */}
          {/* Withdraw Requested Graph */}
          {/* <Box sx={{ width: 400, height: 300, borderRadius: "10px", boxShadow: "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px", p: 2 }}>
              <Typography variant="h6" align="center" sx={{ mb: 2 }}>Withdraw Requested</Typography>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={withdrawRequestedGraph}>
                  <XAxis dataKey="addedon" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="amount" fill="#FF8042" name="Amount" />
                </BarChart>
              </ResponsiveContainer>
            </Box> */}
          {/* </Box> */}
        </Box>
        {/* Body ends here */}
      </Box>
    </Box>
  );
};

export default AdminPanelDashboard;
