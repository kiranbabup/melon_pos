import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../data/images/melon.png";
import { useEffect, useState } from "react";
import LsService, { storageKey } from "../services/localstorage";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CategoryIcon from "@mui/icons-material/Category";
import BusinessIcon from "@mui/icons-material/Business";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ClassIcon from "@mui/icons-material/Class";
import FactoryIcon from "@mui/icons-material/Factory";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import GroupIcon from "@mui/icons-material/Group";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ProductionQuantityLimitsIcon from "@mui/icons-material/ProductionQuantityLimits";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import InventoryTwoToneIcon from "@mui/icons-material/InventoryTwoTone";
import Inventory2TwoToneIcon from "@mui/icons-material/Inventory2TwoTone";
import WorkspacesIcon from "@mui/icons-material/Workspaces";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

const LeftPannel = ({ HeaderTitle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActiveRoute = (route) => location.pathname === route;
  const user = LsService.getItem(storageKey);
  const [sections, setSections] = useState([]);

  // Map navItems to icons
  const navIcons = {
    "/super_admin": <DashboardIcon />,
    "/admin_panel": <DashboardIcon />,
    "/manage_branches": <FactoryIcon />,
    "/manage_clients": <GroupIcon />,
    "/manage_customers": <GroupIcon />,

    "/store-manager": <DashboardIcon />,
    "/categories": <CategoryIcon />,
    "//suppliers": <BusinessIcon />,
    "/units": <ClassIcon />,
    "/brands": <AssignmentTurnedInIcon />,
    "/inventory": <ShoppingBasketIcon />,
    "/add-to-main": <AddShoppingCartIcon />,
    "/add-store-products": <AddShoppingCartIcon />,
    "/store-pendings": <ProductionQuantityLimitsIcon />,
    "/store-recived-products": <ShoppingBagIcon />,
    "/inventory-by-store": <Inventory2TwoToneIcon />,
    "/confirm-store-inventory": <InventoryTwoToneIcon />,
    "/create-combos": <WorkspacesIcon />,
    "/store-inventory": <ShoppingCartIcon />,
    "/branch-billings": <ReceiptLongIcon />,
    "/store-billings": <ReceiptLongIcon />,
    "/display-combos": <ShoppingCartIcon />,
  };

  // Example sections
  const superAdminSections = [
    {
      title: "Main",
      items: [
        { label: "Dashboard", route: "/super_admin" },
        { label: "Manage Clients", route: "/manage_clients" },
        { label: "Manage Branches", route: "/manage_branches" },
        // { label: "Billings", route: "/billings" },
        // { label: "Inventory", route: "/products" },
        // { label: "Brands", route: "/brands" },
        //
      ],
    },
    // {
    //   title: "Create",
    //   items: [
    //     { label: "Add Inventory", route: "/add-to-main" },
    //     { label: "Add Combos", route: "/add-store-combos" },
    //   ],
    // },
  ];
  const adminPanelSections = [
    {
      title: "Main",
      items: [
        { label: "Dashboard", route: "/admin_panel" },
        { label: "Billings", route: "/branch-billings" },
        { label: "Customers", route: "/manage_customers" },
        { label: "Brands", route: "/brands" },
        { label: "Add Inventory", route: "/add-to-main" },
        { label: "Inventory", route: "/inventory" },
        { label: "Add Combos", route: "/create-combos" },
        { label: "Combos Inventory", route: "/display-combos" },
        //
        // { label: "Manage Users", route: "/users_management" },
      ],
    },
    // {
    //   title: "Create",
    //   items: [
    //   ],
    // },
  ];

  useEffect(() => {
    // console.log(user);
    if (user) {
      if (user.role === "super_admin") {
        setSections(superAdminSections);
      } else if (user.role === "admin"){
        setSections(adminPanelSections);
      }
    } else {
      return;
    }
  }, []);

  const getSectionForRoute = (pathname) => {
    const found = sections.find((section) =>
      section.items.some((item) => item.route === pathname)
    );
    return found ? found.title : sections[0]?.title ?? "";
  };

  const [openSection, setOpenSection] = useState(
    sections.length > 0 ? sections[0].title : ""
  );

  useEffect(() => {
    setOpenSection(
      getSectionForRoute(location.pathname) || (sections[0]?.title ?? "")
    );
  }, [location.pathname, sections]);

  const onHandleNav = () => {
    if (user.role === "super_admin") {
      navigate("/super_admin");
    }else if (user.role === "admin") {
      navigate("/admin_panel");
    } else {
      navigate("/login");
    }
  };

  return (
    <Box
      sx={{
        width: "15vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "start",
        gap: 2,
      }}
    >
      <Box
        sx={{
          height: "10vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          boxShadow:
            "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
          backgroundColor: "#fafafa",
          borderRadius: "10px",
        }}
        onClick={() => onHandleNav()}
      >
        <img
          src={logo}
          alt="Logo"
          style={{
            width: "3rem",
            height: "3rem",
            borderRadius: "50%",
            marginRight: "10px",
            marginLeft: "20px",
          }}
        />
        <Typography variant="subtitle1" fontWeight="bold">
          {HeaderTitle}
        </Typography>
      </Box>

      <Box
        sx={{
          width: "92%",
          boxShadow:
            "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
          backgroundColor: "#fafafa",
          borderRadius: "10px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          p: 1,
        }}
      >
        {sections.map((section, idx) => (
          <Box key={section.title} sx={{ width: "100%", mb: 1 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                // pl: 2,
                mb: 0.5,
                cursor: "pointer",
                userSelect: "none",
              }}
              onClick={() =>
                setOpenSection(
                  openSection === section.title ? "" : section.title
                )
              }
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ flexGrow: 1 }}
              >
                {section.title}
              </Typography>
              {openSection === section.title ? (
                <KeyboardArrowUpIcon fontSize="small" />
              ) : (
                <KeyboardArrowDownIcon fontSize="small" />
              )}
            </Box>
            {openSection === section.title && (
              <List disablePadding>
                {section.items.map((item) => (
                  <ListItemButton
                    key={item.route}
                    selected={isActiveRoute(item.route)}
                    onClick={() => navigate(item.route)}
                    sx={{
                      borderRadius: 2,
                      my: 0.5,
                      bgcolor: isActiveRoute(item.route)
                        ? "#87ceeb"
                        : "transparent",
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {navIcons[item.route] || <DashboardIcon />}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: isActiveRoute(item.route)
                          ? "bold"
                          : "normal",
                      }}
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
            {idx < sections.length - 1 && <Divider sx={{ my: 1 }} />}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default LeftPannel;
