import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Divider,
  Popover,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import SearchIcon from "@mui/icons-material/Search";
import {
  fetchBySearchMainProducts,
  fetchBySearchPhone,
  billOrder,
  fetchByOrderID,
} from "../../services/api";
import LsService, { storageKey } from "../../services/localstorage";
import { useNavigate } from "react-router-dom";
import {
  AccentButton,
  date,
  GlassCard,
  PaymentButton,
  time,
} from "../../data/functions";
import billIcon from "./blackLogo.png";
import "./print.css";
import { generateReceipt, handlePrint } from "./cashFunctions";
import Calculator from "./cashierComponents/Calculator";
import logo from "../../data/images/melon.png";
import SnackbarCompo from "../../components/SnackbarCompo";

const CashierBillGenarationPage = () => {
  const [search, setSearch] = useState("");
  // Products fetched from API
  const [products, setProducts] = useState([]);
  // Cart items
  const [cart, setCart] = useState([]);
  // Dropdown for product search
  const [showDropdown, setShowDropdown] = useState(false);

  // Billing dialog states
  const [billingOpen, setBillingOpen] = useState(false);
  const [customerMobile, setCustomerMobile] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerLoading, setCustomerLoading] = useState(false);
  const [isExistingCustomer, setIsExistingCustomer] = useState(true);

  // Snackbar for billing success
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarContent, setsnackbarContent] = useState("");
  const [snackbarMode, setSnackbarMode] = useState("");

  const [anchorEl, setAnchorEl] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [billIconBase64, setBillIconBase64] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");

  const navigate = useNavigate();

  const userLoginStatus = LsService.getItem(storageKey);

  useEffect(() => {
    fetch(billIcon)
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => setBillIconBase64(reader.result);
        reader.readAsDataURL(blob);
      });
  }, []);

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onLogoutClick = () => {
    LsService.removeItem(storageKey);
    navigate("/");
  };

  const open = Boolean(anchorEl);

  // Fetch products based on search term
  const fetchProducts = async () => {
    try {
      const trimmedSearch = search.trim();
      if (!trimmedSearch) {
        setProducts([]);
        setShowDropdown(false);
        return;
      }

      if (!userLoginStatus.branch_id) return;

      const res = await fetchBySearchMainProducts(
        userLoginStatus.branch_id,
        trimmedSearch
      );

      // console.log(res.data);

      const prods = res.data.products || [];
      setProducts(
        prods.map((prod) => ({
          ...prod,
          mrp_price: Number(prod.product_price),
          discount_price: Number(prod.discount_price),
        }))
      );

      // Show dropdown for name search, not barcode
      if (!/^\d{4,}$/.test(trimmedSearch)) {
        setShowDropdown(prods.length > 0);
      } else {
        setShowDropdown(false);
        // barcode → try add directly
        tryAddByBarcode(trimmedSearch, prods);
      }
    } catch (err) {
      console.error("fetchBySearchMainProducts error:", err);
      showSnackbar("error", "Error please ty again.");
      setProducts([]);
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    if (search.trim() !== "") {
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Add product to cart
  const handleAddToCart = (product) => {
    // console.log(product);

    const isService = Number(product.category_id) === 2; // service flag
    const isCombo = !!product.is_combo;
    const isUnlimited = isService || isCombo; // 👈 treat combos same as services

    // For normal products only → block if out of stock
    if (!isUnlimited && product.quantity <= 0) {
      showSnackbar(
        "error",
        "Sorry you can not buy this product due to out of stock."
      );
      return;
    }

    setCart((prev) => {
      const exists = prev.find((item) => item.pr_id === product.pr_id);

      if (exists) {
        // Unlimited types (service/combo): just increase quantity
        if (isUnlimited) {
          return prev.map((item) =>
            item.pr_id === product.pr_id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }

        // Normal products: cap at available quantity
        if (exists.quantity >= (product.quantity ?? exists.quantity)) {
          return prev;
        }

        return prev.map((item) =>
          item.pr_id === product.pr_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      // Add new item
      return [
        ...prev,
        {
          ...product,
          quantity: 1,
          // For services & combos, give a very large available qty
          quantity_available: isUnlimited
            ? Number.MAX_SAFE_INTEGER
            : product.quantity,
        },
      ];
    });

    setShowDropdown(false);
    setSearch("");
  };

  // Add product by barcode
  const tryAddByBarcode = (barcode, prods = products) => {
    const found = prods.find(
      (prod) => String(prod.barcode || "") === String(barcode)
    );
    if (found) {
      handleAddToCart(found);
      setSearch("");
      setShowDropdown(false);
      return true;
    }
    return false;
  };

  const sortedCart = useMemo(() => {
    const typeRank = (item) => {
      const cat = Number(item.category_id);
      const isCombo = !!item.is_combo;

      // Combos last
      if (isCombo) return 2;

      // Products first
      if (cat === 1) return 0;

      // Services next (category_id = 2, not combo)
      if (cat === 2) return 1;

      // Anything else (fallback)
      return 3;
    };

    return [...cart].sort((a, b) => {
      const ta = typeRank(a);
      const tb = typeRank(b);

      if (ta !== tb) return ta - tb;

      // Secondary sort inside the same group (optional)
      // by pr_id or name so it stays consistent
      if (a.pr_id && b.pr_id) {
        return a.pr_id - b.pr_id;
      }

      return (a.product_name || "").localeCompare(b.product_name || "");
    });
  }, [cart]);

  const handleQtyChange = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.pr_id !== id) return item;

          const maxQty = item.quantity_available ?? item.quantity;
          const newQty = item.quantity + delta;

          // If new qty <= 0 → mark as 0, will be filtered out
          if (newQty <= 0) {
            return { ...item, quantity: 0 };
          }

          // Prevent going above available quantity
          if (newQty > maxQty) {
            return item;
          }

          return { ...item, quantity: newQty };
        })
        // Remove rows where quantity is 0
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove an item from cart
  const handleRemove = (id) => {
    setCart((prev) => prev.filter((item) => item.pr_id !== id));
  };

  const totalGst =
    cart && cart.length > 0
      ? cart
          .reduce((sum, item) => {
            const price = parseFloat(
              item.discount_price || item.mrp_price || 0
            );
            const qty = parseFloat(item.quantity || 0);
            const gstRate = parseFloat(item.gst || 0); // percentage
            const gstAmount = (price * qty * gstRate) / 100;
            return sum + gstAmount;
          }, 0)
          .toFixed(2)
      : "0.00";

  // Show history handler
  const handleShowHistory = () => {
    navigate("/cashier-billing-history");
  };

  // Fetch customer details by mobile number and store full object
  const fetchCustomerByMobile = async (phone) => {
    try {
      const res = await fetchBySearchPhone(phone);
      // console.log(res.data);

      const cust = res.data.data;
      if (cust && cust.customer_name) {
        return cust;
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  // When mobile changes, check if customer exists and store details
  useEffect(() => {
    const checkCustomer = async () => {
      if (customerMobile.length === 10) {
        setCustomerLoading(true);
        const cust = await fetchCustomerByMobile(customerMobile);
        if (cust) {
          setCustomerName(cust.customer_name);
          setIsExistingCustomer(true);
        } else {
          setCustomerName("");
          setIsExistingCustomer(false);
        }
        setCustomerLoading(false);
      } else {
        setCustomerName("");
        setIsExistingCustomer(false);
      }
    };
    checkCustomer();
    // eslint-disable-next-line
  }, [customerMobile]);

  // Cart subtotal (selling price)
  const subTotal = cart.reduce(
    (sum, item) =>
      sum + Number(item.discount_price || item.mrp_price || 0) * item.quantity,
    0
  );

  const effectiveBaseTotal = subTotal;

  // Discount amount (₹) derived from percentage
  const discountAmount = useMemo(() => {
    const p = parseFloat(discountPercent);
    if (isNaN(p) || p <= 0) return 0;
    return (effectiveBaseTotal * p) / 100;
  }, [discountPercent, effectiveBaseTotal]);

  // Grand total after discount
  const grandTotal = Math.max(effectiveBaseTotal - discountAmount, 0);

  const handleBillingSubmit = async () => {
    // console.log("Cart before billing:", cart);

    // 👉 Open print window immediately on user click (so popup is allowed)
    const printWindowRef = window.open("", "", "width=350");

    // 1️⃣ Build items from cart (what you send TO the billing API)
    const items = cart.map((item) => ({
      pr_id: item.pr_id,
      quantity: item.quantity,
      price: Number(item.discount_price),
      is_combo: item.is_combo,
    }));

    // 2️⃣ Payload for /billing
    const payload = {
      branch_id: userLoginStatus.branch_id, // or storeId if you want it dynamic
      user_id: userLoginStatus.user_id,
      payment_method: paymentMethod,
      order_date: new Date().toISOString(),
      total_amount: grandTotal,
      notes: "",
      discount_price: discountAmount,
      customerData: {
        customer_name: customerName,
        customer_phone: customerMobile,
      },
      items,
    };

    const cashier_name = userLoginStatus.username;

    try {
      setSubmitLoading(true);

      // 3️⃣ Call billing API
      const resp = await billOrder(payload);
      // console.log("bill resp:", resp.data);

      if (resp.status === 201) {
        const orderID = resp.data.data;
        // console.log("Created orderID:", orderID);

        // 4️⃣ Fetch full order details using orderID
        const orderResp = await fetchByOrderID(orderID);
        // console.log("orderResp:", orderResp.data);

        const order = orderResp.data.data;
        if (!order) {
          console.error("No order object found in fetchByOrderID response");
          setSubmitLoading(false);
          return;
        }

        // 5️⃣ Build receipt items: aggregate PRODUCTS and COMBOS separately
        const comboMap = new Map();
        const productMap = new Map();

        (order.OrderProducts || []).forEach((op) => {
          // 👉 COMBO LINES
          if (op.ComboProduct) {
            const cp = op.ComboProduct;
            const comboId = cp.combo_id;
            const comboMeta = cp.Combo || {};

            // if we've already processed this combo_id once, ignore duplicates
            if (comboMap.has(comboId)) return;

            const lineQty = Number(op.quantity || 0); // quantity of this combo purchased
            const comboName = comboMeta.combo_name || `Combo #${comboId}`;
            const comboPrice = Number(comboMeta.combo_price || 0); // price per combo
            const comboGst = Number(comboMeta.combo_gst || 0);

            comboMap.set(comboId, {
              combo_id: comboId,
              product_name: comboName,
              quantity: lineQty,
              price: comboPrice,
              gst: comboGst,
              is_combo: true,
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
              product_name: prod.product_name || `#${prId}`,
              quantity: 0,
              totalPrice: 0,
              gst,
              is_combo: false,
            };
          }

          entry.quantity += lineQty;
          entry.totalPrice += lineQty * linePrice;

          productMap.set(prId, entry);
        });

        // 👉 Flatten into a single array for the receipt
        const receiptProducts = [];

        // First: normal products (grouped by product)
        productMap.forEach((p) => {
          const unitPrice = p.quantity ? p.totalPrice / p.quantity : 0;
          receiptProducts.push({
            price: unitPrice,
            quantity: p.quantity,
            product_name: p.product_name,
            gst: p.gst,
            is_combo: false,
          });
        });

        // Then: combos (one line per combo_id, using only the first occurrence)
        comboMap.forEach((c) => {
          receiptProducts.push({
            price: c.price, // Combo.Combo.combo_price
            quantity: c.quantity, // op.quantity from first row
            product_name: c.product_name, // Combo.Combo.combo_name
            gst: c.gst, // Combo.Combo.combo_gst
            is_combo: true,
          });
        });

        // 6️⃣ Compute GST total from order items
        const totalGstFromOrder = receiptProducts
          .reduce((sum, p) => {
            const price = p.price || 0;
            const qty = p.quantity || 0;
            const gstRate = Number(p.gst || 0);
            return sum + (price * qty * gstRate) / 100;
          }, 0)
          .toFixed(2);

        // 7️⃣ Prepare payload for generateReceipt from ORDER details
        const orderPaymentMethod = order.payment_method || paymentMethod;
        const invoiceNumber = order.order_id || orderID;

        const orderDateObj = new Date(order.order_date);
        const orderDateStr = orderDateObj.toISOString().slice(0, 10);
        const orderTimeStr = orderDateObj.toTimeString().slice(0, 5);
        const invoiceName ="TAX INVOICE";
        const receiptPayload = {
          products: receiptProducts,
          totalGstPrice: totalGstFromOrder,
          total_amount: Number(order.total_amount),
          discount_price: Number(order.discount_price || 0),
          payment_method: orderPaymentMethod,
          customer_phone: customerMobile === "" ? "Guest" : customerMobile,
          customer_name: customerName === "" ? "Guest" : customerName,
        };

        const receiptContent = generateReceipt(
          receiptPayload,
          billIconBase64,
          invoiceNumber,
          cashier_name,
          orderDateStr,
          orderTimeStr,
          userLoginStatus,
          invoiceName
        );

        // 8️⃣ Print & UI updates (no setTimeout needed)
        handlePrint(receiptContent, printWindowRef);
        showSnackbar(
          "success",
          resp.data.message || "Bill generated successfully"
        );
        onHandleCC();
        setSubmitLoading(false);
      } else {
        console.error("Billing API did not return 201:", resp.status);
        // close pre-opened window if something went wrong
        showSnackbar("error", "Billing failed. Please try again.");
        printWindowRef?.close();
      }
    } catch (err) {
      console.error("Billing error:", err);
      showSnackbar(
        "error",
        err?.response?.data?.message || "Billing failed. Please try again."
      );
      // close pre-opened window if error
      printWindowRef?.close();
    } finally {
      setSubmitLoading(false);
    }
  };

  const showSnackbar = (mode, message) => {
    setSnackbarMode(mode); // "success" | "error" | "warning" | "info"
    setsnackbarContent(message);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = (_e, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const onHandleCC = () => {
    setBillingOpen(false);
    setCart([]);
    setCustomerMobile("");
    setCustomerName("");
    setIsExistingCustomer(true);
    setSearch("");
    setDiscountPercent("");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)",
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          height: 64,
          background: "#fff",
          borderRadius: 3,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          px: 3,
          position: "relative",
        }}
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
        <Typography
          variant="h5"
          fontWeight={800}
          color="#222"
          sx={{ lineHeight: 1 }}
        >
          Billing Software
        </Typography>
        <ShoppingCartIcon sx={{ fontSize: 36, color: "#0072ff" }} />

        {/* Search Bar */}
        <Box sx={{ position: "relative", ml: 5 }}>
          <TextField
            size="medium"
            variant="outlined"
            placeholder="Search products by name or barcode"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && search && /^\d{4,}$/.test(search)) {
                tryAddByBarcode(search);
              }
            }}
            onFocus={() => {
              if (products.length > 0 && search && !/^\d{4,}$/.test(search))
                setShowDropdown(true);
            }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: "#aaa", mr: 1 }} />,
              sx: { borderRadius: 2, background: "#f8fafc", height: 44 },
            }}
            sx={{ minWidth: 340 }}
            autoComplete="off"
          />

          {/* Search Results Dropdown */}
          {showDropdown && search && !/^\d{4,}$/.test(search) && (
            <Paper
              sx={{
                position: "absolute",
                top: 50,
                left: 0,
                width: 340,
                zIndex: 10,
                maxHeight: 300,
                overflowY: "auto",
                borderRadius: 2,
                boxShadow: 3,
                p: 1,
              }}
            >
              {products.map((prod) => (
                <Box
                  key={prod.pr_id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1,
                    borderBottom: "1px solid #eee",
                    cursor: "pointer",
                    "&:hover": { background: "#f0f4ff" },
                  }}
                  onClick={() => handleAddToCart(prod)}
                >
                  <Typography>{prod.product_name}</Typography>
                  <Typography color="primary">
                    ₹{prod.discount_price || prod.mrp_price}
                  </Typography>
                </Box>
              ))}
              {products.length === 0 && (
                <Typography sx={{ p: 2, color: "#888" }}>
                  No products found.
                </Typography>
              )}
            </Paper>
          )}
        </Box>
        <Box sx={{ flexGrow: 1 }} />

        {/* History and Logout Buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, ml: 2 }}>
          <AccentButton
            sx={{
              background: "linear-gradient(90deg, #4e54c8 0%, #8f94fb 100%)",
            }}
            onClick={handleShowHistory}
          >
            Show History
          </AccentButton>

          {/* user avatar, details & logout button */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "end",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                height: 40,
                bgcolor: "#f47920",
                color: "#fff",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                pr: 1,
                cursor: "pointer",
              }}
              onClick={(e) => handleAvatarClick(e)}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "navy",
                  color: "#fff",
                  borderRadius: "50%",
                  border: "3px solid white",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontWeight: "bold",
                  fontSize: 22,
                }}
              >
                {userLoginStatus?.role?.slice(0, 1).toUpperCase()}
              </Box>
              {userLoginStatus?.role?.slice(1)}
            </Box>

            <Popover
              open={open}
              anchorEl={anchorEl}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              PaperProps={{
                sx: { p: 2, minWidth: 220, borderRadius: 3 },
              }}
            >
              <Typography fontWeight="bold" fontSize="1rem" mb={0.5}>
                {userLoginStatus.username}
              </Typography>
              <Typography fontWeight="bold" fontSize="1rem" mb={0.5}>
                {userLoginStatus.email}
              </Typography>
              <Typography fontSize="0.9rem" color="text.secondary" mb={1}>
                Role: {userLoginStatus.role}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Button
                fullWidth
                variant="text"
                color="error"
                onClick={onLogoutClick}
                sx={{
                  justifyContent: "flex-start",
                  textTransform: "none",
                  fontWeight: "bold",
                }}
                startIcon={<span style={{ fontSize: 18 }}>↩</span>}
              >
                Log out
              </Button>
            </Popover>
          </Box>
        </Box>
      </Box>

      {/* Main content row: Cart & Calculator side by side */}
      <Box
        sx={{
          display: "flex",
          flex: 1,
          gap: 4,
          alignItems: "stretch",
        }}
      >
        {/* Left: Cart & Summary */}
        <GlassCard sx={{ flex: 2.5, mr: 2 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Cart Items
          </Typography>

          {/* Cart Table */}
          <Box
            sx={{
              mb: 2,
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              background: "#f8fafc",
            }}
          >
            {/* Table Header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                px: 2,
                py: 1,
                background: "#e0e7ff",
                fontWeight: 700,
                fontSize: 16,
                color: "#222",
              }}
            >
              <Box sx={{ width: 60, textAlign: "center" }}>S.No</Box>
              <Box sx={{ width: 100, textAlign: "center" }}>
                Barcode / Item #
              </Box>
              <Box sx={{ flex: 2, textAlign: "center" }}>Product Name</Box>
              <Box sx={{ width: 90, textAlign: "center" }}>Price</Box>
              <Box sx={{ width: 90, textAlign: "center" }}>MRP</Box>
              <Box sx={{ width: 90, textAlign: "center" }}>GST</Box>
              <Box sx={{ width: 100, textAlign: "center" }}>Quantity</Box>
              <Box sx={{ width: 90, textAlign: "center" }}>Total</Box>
              <Box sx={{ width: 90, textAlign: "center" }}>Combo</Box>
              <Box sx={{ width: 120, textAlign: "center" }}>Actions</Box>
            </Box>

            {/* Table Rows */}
            {cart.length === 0 ? (
              <Box sx={{ p: 3, textAlign: "center", color: "#888" }}>
                No items in cart.
              </Box>
            ) : (
              sortedCart.map((item, idx) => (
                <Box
                  key={item.pr_id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    px: 2,
                    py: 1.5,
                    borderBottom: "1px solid #e0e7ff",
                    background: idx % 2 === 0 ? "#fff" : "#0e6de1", // Alternate row color
                    color: idx % 2 === 0 ? "black" : "white",
                    transition: "background 0.2s",
                    "&:hover": {
                      background: "#cce8e3",
                      color: "black",
                    },
                  }}
                >
                  {/* S.No */}
                  <Box
                    sx={{
                      width: 60,
                      textAlign: "center",
                      fontWeight: 600,
                    }}
                  >
                    {idx + 1}
                  </Box>
                  {/* Barcode */}
                  <Box
                    sx={{
                      width: 100,
                      textAlign: "center",
                      fontSize: 15,
                      fontWeight: 500,
                    }}
                  >
                    {item.barcode ? item.barcode : "N/A"}
                  </Box>
                  {/* Title */}
                  <Box
                    sx={{
                      flex: 2,
                      fontWeight: 500,
                      fontSize: 16,
                      pl: 1,
                      textAlign: "center",
                    }}
                  >
                    {item.product_name}
                  </Box>
                  {/* Price */}
                  <Box sx={{ width: 90, textAlign: "center", fontWeight: 600 }}>
                    ₹{item.discount_price || item.mrp_price}
                  </Box>
                  {/* MRP */}
                  <Box
                    sx={{
                      width: 90,
                      textAlign: "center",
                      textDecoration: item.discount_price
                        ? "line-through"
                        : "none",
                    }}
                  >
                    {item.discount_price ? `₹${item.mrp_price}` : ""}
                  </Box>
                  {/* GST */}
                  <Box sx={{ width: 90, textAlign: "center" }}>
                    {item.gst ? `${item.gst}%` : `0%`}
                  </Box>
                  {/* Qty controls */}
                  <Box
                    sx={{
                      width: 100,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0,
                      background: "#f5f7fa",
                      borderRadius: 2,
                      py: 0.5,
                    }}
                  >
                    {/* "-" button: allow for all types */}
                    <IconButton
                      size="small"
                      onClick={() => handleQtyChange(item.pr_id, -1)}
                      sx={{ p: 0.5, minWidth: 24 }}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>

                    <Typography
                      sx={{
                        mx: 0.5,
                        minWidth: 22,
                        textAlign: "center",
                        fontWeight: 600,
                        fontSize: 16,
                        color: "black",
                      }}
                    >
                      {item.quantity}
                    </Typography>

                    {/* "+" button: only blocked when hitting available quantity */}
                    <IconButton
                      size="small"
                      onClick={() => handleQtyChange(item.pr_id, 1)}
                      sx={{ p: 0.5, minWidth: 24 }}
                      disabled={
                        item.quantity >=
                        (item.quantity_available ?? item.quantity)
                      }
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* Total */}
                  <Box sx={{ width: 90, textAlign: "center", fontWeight: 600 }}>
                    ₹
                    {(
                      Number(item.discount_price || item.mrp_price || 0) *
                      item.quantity
                    ).toFixed(2)}
                  </Box>
                  {/* Combo */}
                  <Box sx={{ width: 90, textAlign: "center", fontWeight: 600 }}>
                    {item.is_combo ? "Yes" : "No"}
                  </Box>
                  {/* Actions */}
                  <Box
                    sx={{
                      width: 120,
                      display: "flex",
                      justifyContent: "center",
                      gap: 1,
                    }}
                  >
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleRemove(item.pr_id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))
            )}
          </Box>

          {/* Discount input before Transaction Summary */}
          {cart.length !== 0 && (
            <Box
              sx={{
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <TextField
                label="Discount (%)"
                size="small"
                type="number"
                value={discountPercent}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setDiscountPercent("");
                    return;
                  }
                  const num = Math.max(0, Math.min(100, Number(val))); // clamp 0–100
                  setDiscountPercent(num.toString());
                }}
                sx={{ width: 160 }}
              />
              <Typography>
                Discount Amount: ₹{discountAmount.toFixed(2)}
              </Typography>
            </Box>
          )}

          {/* Transaction Summary and Actions */}
          {cart.length !== 0 && (
            <Box sx={{ mb: 2 }}>
              <GlassCard sx={{ background: "rgba(0,114,255,0.07)", mb: 2 }}>
                <Typography fontWeight={600}>Transaction Summary</Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 1,
                  }}
                >
                  <Typography>GST (inclusive in Product or service)</Typography>
                  <Typography>₹{totalGst}</Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography>Sub Total</Typography>
                  <Typography>₹{effectiveBaseTotal.toFixed(2)}</Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography>Discount</Typography>
                  <Typography>- ₹{discountAmount.toFixed(2)}</Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 2,
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                >
                  <Typography>Grand Total</Typography>
                  <Typography color="#0072ff">
                    ₹{grandTotal.toFixed(2)}
                  </Typography>
                </Box>
              </GlassCard>
            </Box>
          )}

          {cart.length !== 0 && (
            <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 2 }}>
              <AccentButton
                sx={{
                  flex: 2,
                  background:
                    "linear-gradient(90deg, #ff5858 0%, #f09819 100%)",
                }}
                startIcon={<ShoppingCartIcon />}
                onClick={() => {
                  setBillingOpen(true);
                }}
              >
                Checkout
              </AccentButton>
            </Box>
          )}
        </GlassCard>

        <Calculator
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          grandTotal={grandTotal}
        />
      </Box>

      {/* Billing Dialog */}
      <Dialog
        open={billingOpen}
        onClose={() => setBillingOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: "#0d3679", color: "white" }}>
          Proceed after collecting cash
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Customer Mobile"
            value={customerMobile}
            onChange={(e) =>
              setCustomerMobile(
                e.target.value.replace(/[^0-9]/g, "").slice(0, 10)
              )
            }
            fullWidth
            margin="normal"
            inputProps={{ maxLength: 10 }}
            disabled={customerLoading}
          />
          <TextField
            label="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            fullWidth
            margin="normal"
            disabled={customerLoading}
          />
          {customerLoading && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
              <CircularProgress size={18} />
              <Typography variant="body2">Checking customer...</Typography>
            </Box>
          )}

          {/* Non-existing customer buying individual products */}
          {!isExistingCustomer && (
            <Box
              sx={{ mt: 2, mb: 2, p: 2, bgcolor: "#ffe0e0", borderRadius: 2 }}
            >
              <Typography color="error.main" fontWeight={700}>
                You are not existing customer.! Enter customer Name.
              </Typography>
            </Box>
          )}
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
              <Typography sx={{ fontWeight: 600, alignSelf: "center" }}>
                Select Payment Method
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-evenly",
                  alignItems: "center",
                }}
              >
                <PaymentButton
                  selected={paymentMethod === "Cash"}
                  onClick={() => setPaymentMethod("Cash")}
                >
                  ₹ Cash
                </PaymentButton>
                <PaymentButton
                  selected={paymentMethod === "UPI"}
                  onClick={() => setPaymentMethod("UPI")}
                >
                  UPI
                </PaymentButton>
                <PaymentButton
                  selected={paymentMethod === "Card"}
                  onClick={() => setPaymentMethod("Card")}
                >
                  CARD
                </PaymentButton>
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                // fontWeight: 700,
              }}
            >
              <Typography>Discount Amount:</Typography>
              <Typography>₹{discountAmount.toFixed(2)}</Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 2,
                fontWeight: 700,
              }}
            >
              <Typography>Grand Total:</Typography>
              <Typography color="primary">₹{grandTotal.toFixed(2)}</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            borderTop: "1px dashed grey",
            justifyContent: "space-evenly",
          }}
        >
          <Button
            onClick={() => setBillingOpen(false)}
            disabled={submitLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            disabled={submitLoading}
            onClick={() => handleBillingSubmit()}
          >
            {submitLoading ? "Submitting..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      <SnackbarCompo
        handleSnackbarClose={handleSnackbarClose}
        snackbarOpen={snackbarOpen}
        snackbarContent={snackbarContent}
        snackbarMode={snackbarMode}
      />
    </Box>
  );
};

export default CashierBillGenarationPage;
