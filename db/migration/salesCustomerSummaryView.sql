CREATE OR REPLACE VIEW customer_sales_summary AS
SELECT
  c.custno,
  c.custname,
  c.payterm,
  c.record_status,
  COUNT(DISTINCT s.transNo)        AS totalTransactions,
  SUM(sd.quantity * ph.unitPrice)  AS totalSpend,
  MAX(s.salesDate)                 AS lastSaleDate
FROM customer c
LEFT JOIN sales s        ON s.custNo   = c.custno
LEFT JOIN salesDetail sd ON sd.transNo = s.transNo
LEFT JOIN (
  -- Subquery: one row per product — most recent price only
  SELECT prodCode, unitPrice
  FROM priceHist ph1
  WHERE effDate = (
    SELECT MAX(effDate)
    FROM priceHist
    WHERE prodCode = ph1.prodCode
  )
) ph ON ph.prodCode = sd.prodCode
GROUP BY c.custno, c.custname, c.payterm, c.record_status
ORDER BY totalSpend DESC NULLS LAST;