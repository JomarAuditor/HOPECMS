CREATE OR REPLACE VIEW product_current_price AS
SELECT
  p.prodCode,
  p.description,
  p.unit,
  ph.unitPrice,
  ph.effDate AS priceEffDate
FROM product p
JOIN priceHist ph ON ph.prodCode = p.prodCode
WHERE ph.effDate = (
  SELECT MAX(effDate)
  FROM priceHist
  WHERE prodCode = p.prodCode
)
ORDER BY p.prodCode;