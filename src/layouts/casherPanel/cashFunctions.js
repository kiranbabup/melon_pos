import "../../App.css"

export const generateReceipt = (billingData, billIconBase64, invoiceNumber, cashier_name, date, time, loginUserData) => {
  // console.log(billingData);
  // console.log(billingData.products);
  // console.log(storeDetails);
  // const address = "kkmart, Akkayyapalem, Visakhapatnam, Andhra Pradesh 530016";
  const totalQuantity = billingData.products.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  return `
    <div style="font-family: monospace; width: 300px; margin: 0 auto; padding: 8;">
      <div style="display: flex; flex-direction: column; align-items: center;">
        <img src="${billIconBase64}" alt="Logo" style="max-width: 150px;" />
        <div style="width: 100%;">
          <hr style="border-bottom: 1px dashed #000;">
        </div>
        <p style="font-size: 12px; margin: 0; padding: 0;">GSTIN: -----N/A----- </p>
        <div style="width: 100%;">
          <hr style="border-bottom: 1px dashed #000;">
        </div>
        <h3 style="margin: 0; padding: 0;">${loginUserData.branchDetails.name}</h3>
        <h4 style="text-align: center; margin: 0; padding: 0;">${loginUserData.branchDetails.address}</h4>
        <h4 style="margin: 0; padding: 0;">Phone: ${loginUserData.branchDetails.phone}</h4>
        <div style="width: 100%;">
          <hr style="border-bottom: 1px dashed #000;">
        </div>
        <p style="font-size: 12px; margin: 0; padding: 0;">${date} ${time}</p>
      </div>

      <hr style="border-bottom: 1px dashed #000;">
      
      <h3 style="text-align: center; margin: 0; padding: 0;">TAX INVOICE</h3>

      <div style="display: flex; justify-content: space-between; font-size: 12px; margin: 0; padding: 0;">
        <span>Customer Name: </span>
        <span>${billingData.customer_name || 'Guest'}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 12px;">
        <span>Customer Number: </span>
        <span>${billingData.customer_phone || 'Guest'}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 12px;">
        <span>Invoice Number: </span>
        <span>INV${invoiceNumber === "" ? "Preview Mode" : invoiceNumber}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 12px;">
        <span>Cashier Name: </span>
        <span>${cashier_name.slice(0, 6) || 'Guest'}</span>
      </div>
      <hr style="border-bottom: 1px dashed #000; margin: 10px 0;">

      <div style="font-size: 12px;">
      <div>
        <span>Item Name</span>
        <div style="display: flex; justify-content: space-between;">
          <span>Selling Price x Quantity</span>
          <span>GST%</span>
          <span>Value</span>
        </div>
      </div>
      <hr style="border-bottom: 1px dashed #000;">

        ${billingData.products.map(item => `
          <div>
            <span>${item.product_name}</span>
            <div style="display: flex; justify-content: space-between;">
              <span>₹${item.price} x ${item.quantity}</span>
              <span>${item.gst}%</span>
              <span>₹${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          </div>
        `).join('')}
      </div>
      <hr style="border-bottom: 1px dashed #000; margin: 10px 0;">
      <span>Total inclusive GST: ₹${billingData.totalGstPrice}</span>
      <div style="display: flex; justify-content: space-between; font-size: 14px;">
        <span>Total Bill Discount:</span>
        <span>-₹${billingData.discount_price.toFixed(2)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: bold;">
        <span>Total Bill Amount:</span>
        <span>₹${billingData.total_amount.toFixed(2)}</span>
      </div>
      <hr style="border-bottom: 1px dashed #000; margin: 10px 0;">
      <div style="display: flex; justify-content: space-between;">
        <span>Items: ${billingData.products.length}</span>
        <span>Quantity: ${totalQuantity}</span>
      </div>
      <hr style="border-bottom: 1px dashed #000; margin: 10px 0;">
      <p style="text-align: left; font-size: 10px; margin: 0;">Note: GST is inclusive in the Item pricing.</p>
      <hr style="border-bottom: 1px dashed #000; margin: 10px 0;">
      <p style="text-align: center; font-size: 10px; margin: 0;"><------ Amount Received From Customer ------></p>
      <hr style="border-bottom: 1px dashed #000; margin: 10px 0;">
      <p style="text-align: center; font-size: 10px; margin: 0;">Thank you! Visit us again!</p>
      <p style="text-align: left; font-size: 10px; margin-top: 20px;">"This is a computer generated invoice."</p>
    </div>
  `;
};

// Function to trigger printing
// cashFunctions.js
export const handlePrint = (receiptData, externalWindow) => {
  // if externalWindow is passed, use that. Otherwise open a new one (for preview button).
  const printWindow = externalWindow || window.open('', '', 'width=350');

  printWindow.document.write(`
    <html>
      <head>
        <title>Bill Receipt</title>
        <style>
          @media print {
            @page {
              size: auto;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: monospace;
              margin: 0;
              padding: 0;
            }
          }
          body {
            font-family: monospace;
            margin: 0;
            padding: 0;
          }
        </style>
      </head>
      <body>
        <div id="receipt-wrapper" style="display:inline-block;">
          ${receiptData}
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
};
