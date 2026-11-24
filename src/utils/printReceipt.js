/**
 * NEW RATNA PAN SHOP — THERMAL RECEIPT & KOT PRINTING UTILITY
 * Generates and prints an authentic 80mm thermal Kitchen Order Ticket (KOT)
 * and Customer Pickup Slip with instant automatic print dispatch.
 */

export function printKOTReceipt(order, shopConfig = {}) {
  if (!order) return;

  const tokenNum = order.tokenNumber || order.token || order.id || '---';
  const orderId = order.orderId || order.id || `NRP-${tokenNum}`;
  const customerName = order.customerName || 'Counter Guest';
  const phone = order.phone || order.mobile || order.mobileNumber || '';
  const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }) : new Date().toLocaleString('en-IN');

  const shopName = shopConfig?.name || shopConfig?.shopName || 'New Ratna Pan Shop';
  const shopPhone = shopConfig?.phone || '+91 98765 43210';
  const shopAddress = shopConfig?.address || 'Main Market Counter';

  const items = order.items || [];
  const subtotal = Number(order.subtotal || order.total || 0);
  const discount = Number(order.discount || 0);
  const total = Number(order.total || order.grandTotal || subtotal - discount);
  const paymentMethod = order.paymentMethod === 'pay_at_counter' || !order.paymentMethod ? 'Pay at Counter (Cash / UPI)' : order.paymentMethod;
  const paymentStatus = (order.paymentStatus || 'pending').toUpperCase();

  const printWindow = window.open('', '_blank', 'width=420,height=600,top=100,left=100');
  if (!printWindow) {
    // If popups blocked, fallback to hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(getReceiptHtml());
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 250);
    return;
  }

  function getReceiptHtml() {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>KOT Receipt - Token #${tokenNum}</title>
          <meta charset="utf-8" />
          <style>
            @page {
              margin: 4mm;
              size: 80mm auto;
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: 13px;
              line-height: 1.35;
              color: #000;
              background: #fff;
              margin: 0;
              padding: 10px;
              width: 72mm;
            }
            .center { text-align: center; }
            .right { text-align: right; }
            .bold { font-weight: bold; }
            .token-box {
              border: 2px dashed #000;
              padding: 8px 4px;
              margin: 8px 0;
              text-align: center;
            }
            .token-num {
              font-size: 26px;
              font-weight: 900;
              letter-spacing: 1px;
            }
            .token-label {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .divider {
              border-top: 1px dashed #000;
              margin: 6px 0;
            }
            .divider-solid {
              border-top: 2px solid #000;
              margin: 6px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th {
              text-align: left;
              font-size: 11px;
              border-bottom: 1px dashed #000;
              padding-bottom: 4px;
            }
            td {
              padding: 3px 0;
              vertical-align: top;
            }
            .item-note {
              font-size: 11px;
              font-style: italic;
              padding-left: 8px;
            }
            .total-row td {
              font-size: 14px;
              font-weight: bold;
              padding-top: 4px;
            }
            .footer-tag {
              font-size: 10px;
              text-align: center;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="center bold" style="font-size: 16px;">${shopName.toUpperCase()}</div>
          <div class="center" style="font-size: 11px;">${shopAddress}</div>
          <div class="center" style="font-size: 11px;">Tel: ${shopPhone}</div>
          
          <div class="token-box">
            <div class="token-label">SHOP COUNTER PICKUP TOKEN</div>
            <div class="token-num">#${tokenNum}</div>
            <div style="font-size: 11px;">[ KITCHEN ORDER TICKET / KOT ]</div>
          </div>

          <div style="font-size: 11px;">
            <div><strong>Order ID:</strong> ${orderId}</div>
            <div><strong>Date/Time:</strong> ${dateStr}</div>
            <div><strong>Customer:</strong> ${customerName}</div>
            ${phone ? `<div><strong>Phone:</strong> +91 ${phone}</div>` : ''}
            <div><strong>Pickup:</strong> Shop Counter Service</div>
          </div>

          <div class="divider"></div>

          <table>
            <thead>
              <tr>
                <th style="width: 55%;">ITEM</th>
                <th class="center" style="width: 15%;">QTY</th>
                <th class="right" style="width: 30%;">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((it) => `
                <tr>
                  <td class="bold">${it.product?.name || it.name || 'Paan Specialty'}</td>
                  <td class="center bold">${it.quantity || 1}</td>
                  <td class="right bold">₹${(Number(it.price || it.product?.price || 0) * Number(it.quantity || 1)).toFixed(0)}</td>
                </tr>
                ${it.customizableNote ? `<tr><td colspan="3" class="item-note">✦ Note: ${it.customizableNote}</td></tr>` : ''}
              `).join('')}
            </tbody>
          </table>

          <div class="divider"></div>

          <table>
            <tr>
              <td>Subtotal:</td>
              <td class="right">₹${subtotal.toFixed(0)}</td>
            </tr>
            ${discount > 0 ? `
              <tr>
                <td>Special Discount:</td>
                <td class="right">-₹${discount.toFixed(0)}</td>
              </tr>
            ` : ''}
            <tr class="total-row">
              <td class="bold">GRAND TOTAL:</td>
              <td class="right bold">₹${total.toFixed(0)}</td>
            </tr>
          </table>

          <div class="divider-solid"></div>

          <div style="font-size: 11px;">
            <div><strong>Payment:</strong> ${paymentMethod}</div>
            <div><strong>Payment Status:</strong> ${paymentStatus}</div>
          </div>

          <div class="divider"></div>

          <div class="footer-tag">
            Handcrafted Fresh • High Hygiene Assured<br/>
            Thank you for visiting New Ratna Pan Shop!
          </div>
        </body>
      </html>
    `;
  }

  printWindow.document.open();
  printWindow.document.write(getReceiptHtml());
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };

  // Fallback for browsers where onload already fired
  setTimeout(() => {
    try {
      printWindow.focus();
      printWindow.print();
    } catch {
      // ignore
    }
  }, 350);
}
