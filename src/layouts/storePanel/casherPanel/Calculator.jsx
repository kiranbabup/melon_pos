import React, { useState } from "react";
import { Box, Typography, Button, TextField, IconButton, InputAdornment } from "@mui/material";
// import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { AccentButton, GlassCard, PaymentButton } from "../../../data/functions";
import CloseIcon from "@mui/icons-material/Close";

const Calculator = ({ isExistingCustomer, paymentMethod, setPaymentMethod, hasComboItem, mrpTotal, subTotal }) => {
    const [amount, setAmount] = useState("0.00");
    const [changeAmount, setChangeAmount] = useState("");

    // Manual typing in calculator input
    const handleAmountChange = (e) => {
        let val = e.target.value.replace(/[^0-9.]/g, "");
        if ((val.match(/\./g) || []).length > 1) {
            val = val.slice(0, -1);
        }
        setAmount(val);
    };

    // Calculator input from buttons
    const handleAmountInput = (val) => {
        if (amount === "0.00") {
            setAmount(val === "." ? "0." : String(val));
        } else {
            if (val === "." && amount.includes(".")) return;
            setAmount(amount + String(val));
        }
    };

    const onCalChange = () => {
        const paid = parseFloat(amount) || 0;
        const total = (!hasComboItem && !isExistingCustomer) ? mrpTotal : subTotal;
        const change = paid - total;
        setChangeAmount(change >= 0 ? change.toFixed(2) : "0.00");
        setTimeout(() => {
            setChangeAmount("")
        }, 20000);
    }

    return (
        < GlassCard sx={{ flex: 0.8, minWidth: 0, maxWidth: 300, alignItems: "center", gap: 1 }}>
            {/* Calculator input */}

            < TextField
                value={amount}
                onChange={handleAmountChange}
                variant="standard"
                size="medium"
                inputProps={{
                    style: { fontSize: 28, textAlign: "center", color: "#0072ff", fontWeight: 700 },
                    inputMode: "decimal",
                    pattern: "[0-9.]*"
                }}
                sx={{ width: 200, }}
                InputProps={{
                    endAdornment: (
                        amount && ( // show only if there is text
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setAmount("")}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        )
                    ),
                }}
            />

            {/* Show the change below the button */}
            <Typography sx={{ fontWeight: 700, fontSize: 20 }}> Change:
                {
                    changeAmount !== "" ? (
                        <span style={{ color: "#ff0000ff" }}> ₹ {changeAmount}</span>
                    )
                        : " ₹ 0.00"
                }
            </Typography>

            {/* Calculator UI */}
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 70px)", gap: 2 }}>
                {[7, 8, 9, 4, 5, 6, 1, 2, 3, 0, "00", "."].map((val, idx) => (
                    <Button
                        key={idx}
                        variant="contained"
                        sx={{
                            borderRadius: 2,
                            fontSize: 22,
                            background: "#e0e7ff",
                            color: "#222",
                            fontWeight: 700,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                        }}
                        onClick={() => handleAmountInput(val)}
                    >
                        {val}
                    </Button>
                ))}
            </Box>

            {/* Calculate Change button */}
            <AccentButton
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => onCalChange()}
            >
                Calculate Change
            </AccentButton>


            {/* Only show Cash payment method */}
            <Box sx={{ display: "flex", flexDirection: "column", mt: 1 }}>
                <Typography sx={{ fontWeight: 600, alignSelf: "center" }}>Payment Method</Typography>
                <PaymentButton
                    // startIcon={<AttachMoneyIcon />}
                    selected={paymentMethod === "cash"}
                    onClick={() => setPaymentMethod("cash")}
                >₹ Cash</PaymentButton>
            </Box>
        </GlassCard >
    );
};

export default Calculator;