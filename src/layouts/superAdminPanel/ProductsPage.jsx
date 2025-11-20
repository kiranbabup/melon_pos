import React, { useEffect, useState } from "react";
import {
  fetchBySearchMainProducts,
  getAllProducts,
  updateProduct,
} from "../../services/api";
import TableComponent from "../../components/TableComponent";
import { Box, Button, Switch, TextField, Typography } from "@mui/material";
import LeftPannel from "../../components/LeftPannel";
import HeaderPannel from "../../components/HeaderPannel";
import { useNavigate } from "react-router-dom";
import EditProductsModal from "./superComponents/EditProducts";
import * as XLSX from "xlsx";

function ProductsPage() {
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [rowMainCount, setRowMainCount] = useState(0);
  const [allProducts, setAllProducts] = useState([]);
  const [productMesg, setProductMesg] = useState("");
  const [productErrMesg, setProductErrMesg] = useState("");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [openEP, setOpenEP] = useState(false);
  const [rowProductData, setRowProductData] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    if (!search.trim()) {
      fetchProducts();
    }
  }, [paginationModel, search]);

  useEffect(() => {
    if (search.trim()) {
      fetchSearchMainProducts();
    }
  }, [search]);

  useEffect(() => {
    if (search.trim() && searchResults.length > 0) {
      const start = paginationModel.page * paginationModel.pageSize;
      const end = start + paginationModel.pageSize;

      const paged = searchResults.slice(start, end).map((row, idx) => ({
        ...row,
        id: start + idx + 1,
        created_on: row.created_on?.slice(0, 10),
      }));

      setTableData(paged);
      setRowCount(searchResults.length);
    }
  }, [searchResults, search, paginationModel]);

  const fetchProducts = async () => {
    try {
      setTableData([]);
      setLoading(true);

      const response = await getAllProducts({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
      });

      // console.log(response.data);

      const apiData = response.data || {};
      const products = apiData.data || [];
      const totalProducts = apiData.totalProducts || 0;

      const mappedData = products.map((prod, index) => ({
        ...prod,
        id: paginationModel.page * paginationModel.pageSize + index + 1,

        // 👇 map backend -> frontend column fields
        created_on: prod.created_at?.slice(0, 10),
        products_name: prod.product_name,
        products_price: prod.mrp_price,

        // quantity, discount_price, status already match your columns
      }));

      setTableData(mappedData);
      setRowCount(totalProducts);
      setRowMainCount(totalProducts);
    } catch (error) {
      console.error("Error fetching Products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchMainProducts = async () => {
    try {
      setTableData([]);
      setLoading(true);
      // Trim the search string before sending
      const trimmedSearch = search.trim();
      const response = await fetchBySearchMainProducts(trimmedSearch);
      const data = response.data.products || [];
      // console.log(data);

      setSearchResults(
        data.map((prod, index) => ({
          ...prod,
          id: index + 1,
          created_on: prod.created_on?.slice(0, 10),
        }))
      );
      setRowCount(data.length);
    } catch (error) {
      console.error("Failed to fetch search results:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUsageStatus = async (barcode, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      const response = await updateProduct(barcode, { status: newStatus });
      // console.log(response);
      // console.log(response.data);
      if (response.status === 200) {
        setProductMesg(response.data.message);
        fetchProducts();
      } else {
        console.error("Failed to update status:", response.data.message);
        setProductErrMesg(response.data.message);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setTimeout(() => {
        setProductMesg("");
        setProductErrMesg("");
      }, 20000); // Clear messages after 1 minute
    }
  };

  const closeEditProductsModal = () => {
    setRowProductData("");
    setOpenEP(false);
  };

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "created_on", headerName: "Created On", flex: 1 },
    { field: "products_name", headerName: "Products Name", width: 180 },
    { field: "products_price", headerName: "Products Price", flex: 1 },
    { field: "discount_price", headerName: "Discount Price", flex: 1 },
    {
      field: "quantity",
      headerName: "Quantity",
      flex: 1,
      renderCell: (params) => {
        const qty = Number(params.value);

        let color = "black"; // default
        if (qty === 0) {
          color = "red";
        } else if (qty <= params.row.qty_alert) {
          color = "orange";
        } else {
          color = "green";
        }

        return <span style={{ color, fontWeight: "bold" }}>{qty}</span>;
      },
    },
    // {
    //   field: "status",
    //   headerName: "Status",
    //   flex: 1,
    //   renderCell: (params) => (
    //     <Switch
    //       checked={params.row.status === "available"}
    //       onChange={
    //         () => toggleUsageStatus(params.row.pr_id, params.row.status) // barcode is null in your data
    //       }
    //       color="primary"
    //     />
    //   ),
    // },
    // {
    //   field: "actions",
    //   headerName: "Actions",
    //   flex: 1,
    //   sortable: false,
    //   renderCell: (params) => (
    //     <Button
    //       size="small"
    //       variant="contained"
    //       onClick={() => {
    //         setRowProductData(params.row);
    //         // console.log(params.row);
    //         setOpenEP(true);
    //       }}
    //     >
    //       Edit
    //     </Button>
    //   ),
    // },
  ];

  const onDownloadxl = () => {
    if (!tableData || tableData.length === 0) {
      alert("No data to export.");
      return;
    }

    const toYMD = (d) => {
      if (!d) return "";
      if (typeof d === "string" && d.includes("T")) return d.slice(0, 10); // "2025-08-01"
      const dt = new Date(d);
      return isNaN(dt) ? "" : dt.toISOString().slice(0, 10);
    };

    // remove unwanted keys + format dates
    const exportData = tableData.map(
      ({
        id,
        products_id,
        category_id,
        supplier_id,
        unit_id,
        created_by,
        updated_by,
        brand_id,
        shedule,
        base_unit_id,
        ...rest
      }) => ({
        ...rest,
        manufacturing_date: toYMD(rest.manufacturing_date),
        expiry_date: toYMD(rest.expiry_date),
        created_on: toYMD(rest.created_on),
        updated_on: toYMD(rest.updated_on),
      })
    );

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Main_Inventory_ProductsList");
    XLSX.writeFile(wb, "Main_Inventory_ProductsList.xlsx");
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
          HeaderTitle="Manage Main Inventory"
          tableData={tableData}
          onDownloadCurrentList={onDownloadxl}
        />

        <Box sx={{ width: "99%" }}>
          <Box
            sx={{
              borderRadius: "10px",
              boxShadow:
                "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
              height: "100%",
              p: 2,
              mb: 1,
              background: "#fff",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            {/* <IconButton onClick={() => fetchCitiesData()} ><RefreshIcon /></IconButton> */}
            <Box
              sx={{
                width: "99%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
              }}
            >
              <TextField
                label="Search Product by Name or Barcode"
                placeholder="Search Product"
                variant="outlined"
                size="small"
                value={search}
                sx={{ width: "30rem" }}
                onChange={(e) => setSearch(e.target.value)}
              />

              {productMesg && (
                <Typography sx={{ color: "green", fontSize: "0.9rem" }}>
                  {productMesg}
                </Typography>
              )}
              {productErrMesg && (
                <Typography sx={{ color: "red", fontSize: "0.9rem" }}>
                  {productErrMesg}
                </Typography>
              )}
              <Button
                variant="outlined"
                color="primary"
                size="small"
                sx={{ mr: 1, fontWeight: "bold" }}
                onClick={() => nav("/add-to-main")}
              >
                Add Products
              </Button>
            </Box>
          </Box>

          <EditProductsModal
            open={openEP}
            onClose={() => closeEditProductsModal()}
            fetchProducts={fetchProducts}
            productsData={rowProductData}
          />

          <TableComponent
            tableData={tableData}
            columns={columns}
            loading={loading}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            rowCount={rowCount}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default ProductsPage;
