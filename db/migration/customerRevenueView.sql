-- Create a view to show total revenue per product
CREATE OR REPLACE VIEW product_revenue AS
SELECT 
    p.prodCode, 
    p.description, 
    p.unit,
    SUM(sd.quantity) AS totalQtySold,
    SUM(sd.quantity * ph.unitPrice) AS totalRevenue
FROM product p
JOIN salesDetail sd ON sd.prodCode = p.prodCode
JOIN (
  -- This subquery ensures we use the LATEST price for the calculation
  SELECT prodCode, unitPrice FROM priceHist ph1
  WHERE effDate = (SELECT MAX(effDate) FROM priceHist WHERE prodCode = ph1.prodCode)
) ph ON ph.prodCode = sd.prodCode
GROUP BY p.prodCode, p.description, p.unit
ORDER BY totalRevenue DESC;