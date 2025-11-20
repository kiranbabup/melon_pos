import { Box, Typography } from "@mui/material";
import LeftPannel from "../../../components/LeftPannel";
import HeaderPannel from "../../../components/HeaderPannel";
import { useEffect, useState } from "react";
// import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, YAxis, XAxis, Bar } from "recharts";
import CountCard from "../../../components/dashboard_components/CountCard";
import { getStoreDashboardStats } from "../../../services/api";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import BookmarkRemoveIcon from "@mui/icons-material/BookmarkRemove";
import DangerousIcon from "@mui/icons-material/Dangerous";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import { useNavigate } from "react-router-dom";
import LsService, { storageKey } from "../../../services/localstorage";
import MuseumIcon from "@mui/icons-material/Museum";
import { formatToINR } from "../../../data/functions";

const COLORS = ["green", "red"];

const StoreAdminDashboard = () => {
  // const [allProduactsCount, setAllProduactsCount] = useState(0);
  // const [allStores, setAllStores] = useState(0);
  const [counts, setCounts] = useState({});
  const [mrp, setMrp] = useState(0);
  const [sp, setSp] = useState(0);
  const navigate = useNavigate();
  const user = LsService.getItem(storageKey);

  useEffect(() => {
    // getAllStores().then(res => {
    //   console.log(res.data);
    //   // setAllStores(res.data.products?.length || 0);
    // })
    //   .catch(() => setAllStores(0));

    if (user.store_id) {
      getStoreDashboardStats(user.store_id)
        .then((res) => {
          // console.log(res.data);
          setCounts(res.data || {});
          setMrp(res.data?.storeProductsMrpPrice[0]?.total_mrp_value || 0);
          setSp(
            res.data?.storeProductsDiscountPrice[0]?.total_discount_value || 0
          );
        })
        .catch(() => setCounts({}));
    }
  }, []);

  useEffect(() => {
    // console.log(user);

    if (user.role !== "store") {
      LsService.removeItem(storageKey);
      navigate("/");
    }
  }, [user, navigate]);

  const itemValues = [
    {
      HeadTitle: "Total Products",
      IconCompo: LocalMallIcon,
      Value: counts.totalProducts || 0,
      navpath: "/store-inventory",
    },
    {
      HeadTitle: "Total Orders",
      IconCompo: TrackChangesIcon,
      Value: counts.totalOrders || 0,
      navpath: "/store-billings",
    },
    {
      HeadTitle: "Total Sales",
      IconCompo: ShowChartIcon,
      Value: `₹${formatToINR(counts.totalSales)}` || 0,
      navpath: "/store-billings",
    },
    {
      HeadTitle: "Daily Sales",
      IconCompo: TrendingDownRoundedIcon,
      Value: `₹${formatToINR(counts.todaySales)}` || 0,
      navpath: "/store-billings",
    },
    {
      HeadTitle: "Total Weekly Sales",
      IconCompo: TrendingDownRoundedIcon,
      Value: `₹${formatToINR(counts.weekSales)}` || 0,
      navpath: "/store-billings",
    },
    {
      HeadTitle: "Total Monthly Sales",
      IconCompo: TrendingDownRoundedIcon,
      Value: `₹${formatToINR(counts.monthSales)}` || 0,
      navpath: "/store-billings",
    },
    {
      HeadTitle: "Total Store MRP",
      IconCompo: MuseumIcon,
      Value: `₹${formatToINR(mrp)}`,
      navpath: "/store-inventory",
    },
    {
      HeadTitle: "Total Store SP",
      IconCompo: MuseumIcon,
      Value: `₹${formatToINR(sp)}`,
      navpath: "/store-inventory",
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
        }}
      >
        <LeftPannel HeaderTitle="Store Manager" />
      </Box>
      <Box sx={{ minWidth: "calc( 99vw - 18vw)", ml: 1.5 }}>
        <HeaderPannel HeaderTitle="Store Manager" />

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

export default StoreAdminDashboard;
