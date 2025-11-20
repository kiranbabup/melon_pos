import { Box } from "@mui/material"
import LeftPannel from "../../components/LeftPannel";
import HeaderPannel from "../../components/HeaderPannel";
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { useEffect, useState } from "react";
// import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, YAxis, XAxis, Bar } from "recharts";
import CountCard from "../../components/dashboard_components/CountCard";
// import { getDashboardStats } from "../../services/api";
import LocalMallIcon from '@mui/icons-material/LocalMall';
import BrandingWatermarkRoundedIcon from '@mui/icons-material/BrandingWatermarkRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import BookmarkRemoveIcon from '@mui/icons-material/BookmarkRemove';
import DangerousIcon from '@mui/icons-material/Dangerous';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import StoreIcon from '@mui/icons-material/Store';
import { useNavigate } from "react-router-dom";
import LsService, { storageKey } from "../../services/localstorage";

const COLORS = ["green", "red",];

const WarehouseAdminDashboard = () => {
  // const [allProduactsCount, setAllProduactsCount] = useState(0);
  const [allStores, setAllStores] = useState(0);
  const [counts, setCounts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // getAllStores().then(res => {
    //   console.log(res.data);
    //   // setAllStores(res.data.products?.length || 0);
    // })
    //   .catch(() => setAllStores(0));

    // getDashboardStats().then(res => {
    //   console.log(res.data);
    //   setCounts(res.data || {});
    // })
    //   .catch(() => setCounts({}));
  }, []);

  const user = LsService.getItem(storageKey);

  useEffect(() => {
    // console.log(user);

    if (user.role !== "admin") {
      LsService.removeItem(storageKey);
      navigate("/");
    }
  }, [user, navigate]);

  const itemValues = [
    {
      HeadTitle: "Total Products",
      IconCompo: LocalMallIcon,
      Value: counts.totalProducts || 0,
      navpath: ""
    },
    {
      HeadTitle: "Total Users",
      IconCompo: SupervisorAccountIcon,
      Value: counts.activeUsers || 0,
      navpath: ""
    },
    {
      HeadTitle: "Total Customers",
      IconCompo: SupervisorAccountIcon,
      Value: counts.totalCustomers || 0,
      navpath: ""
    },
    {
      HeadTitle: "Total Orders",
      IconCompo: TrackChangesIcon,
      Value: counts.totalOrders || 0,
      navpath: ""
    },
    {
      HeadTitle: "Total Stores",
      IconCompo: StoreIcon,
      Value: counts.allStores || 0,
      navpath: ""
    },
    {
      HeadTitle: "Total Brands",
      IconCompo: BrandingWatermarkRoundedIcon,
      Value: counts.activeBrands || 0,
      navpath: ""
    },
    {
      HeadTitle: "Total Categories",
      IconCompo: CategoryRoundedIcon,
      Value: counts.activeCategories || 0,
      navpath: ""
    },
    {
      HeadTitle: "Total Suppliers",
      IconCompo: SupervisorAccountIcon,
      Value: counts.activeSuppliers || 0,
      navpath: ""
    },
    {
      HeadTitle: "Total Low Stock Products",
      IconCompo: BookmarkRemoveIcon,
      Value: counts.lowStockProducts || 0,
      navpath: ""
    },
    {
      HeadTitle: "Total Out of Stock Products",
      IconCompo: DangerousIcon,
      Value: counts.outOfStockProducts || 0,
      navpath: ""
    },
    {
      HeadTitle: "Total Sales",
      IconCompo: ShowChartIcon,
      Value: counts.totalSales || 0,
      navpath: ""
    },
    {
      HeadTitle: "Daily Sales",
      IconCompo: TrendingDownRoundedIcon,
      Value: counts.dailySales || 0,
      navpath: ""
    },
    {
      HeadTitle: "Total Weekly Sales",
      IconCompo: TrendingDownRoundedIcon,
      Value: counts.weeklySales || 0,
      navpath: ""
    },
    {
      HeadTitle: "Total Monthly Sales",
      IconCompo: TrendingDownRoundedIcon,
      Value: counts.monthlySales || 0,
      navpath: ""
    },
  ]

  // const pieData = [
  // { name: "Payment Received", value: paymentReceivedValue },
  // { name: "Withdraw Requested", value: withdrawRequestedValue },
  // ];

  return (
    <Box sx={{
      width: "99vw",
      height: "94vh",
      backgroundColor: "white",
      // #f4f4f5
      display: "flex",
    }}>
      {/* left pannel */}
      <Box
        sx={{
          display: "flex", justifyContent: "center", alignItems: "start",
          width: "18vw",
          mt: 1.5,
        }}
      >
        <LeftPannel HeaderTitle="Warehouse Admin Dashboard" />
      </Box>
      <Box
        sx={{ minWidth: "calc( 99vw - 18vw)", ml: 1.5, }}

      >
        <HeaderPannel HeaderTitle="Warehouse Admin Dashboard" />

        {/* Body starts here */}
        <Box sx={{ width: "99%", mb: 4 }}>

          <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap", }}>
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
    </Box >
  );
}

export default WarehouseAdminDashboard;