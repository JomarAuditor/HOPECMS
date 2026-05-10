-- 1. customer (primary managed table)
CREATE TABLE IF NOT EXISTS customer (
  custno    VARCHAR(5)  NOT NULL PRIMARY KEY,
  custname  VARCHAR(20),
  address   VARCHAR(50),
  payterm   VARCHAR(3)  CONSTRAINT pay_ck CHECK (payterm IN ('COD','30D','45D'))
);

-- 2. sales (view-only — no structural changes)
CREATE TABLE IF NOT EXISTS sales (
  transNo   VARCHAR(8)  NOT NULL PRIMARY KEY,
  salesDate DATE,
  custNo    VARCHAR(5)  REFERENCES customer(custno),
  empNo     VARCHAR(5)
);

-- 3. product (view-only — no structural changes)
CREATE TABLE IF NOT EXISTS product (
  prodCode    VARCHAR(6)  NOT NULL PRIMARY KEY,
  description VARCHAR(30),
  unit        VARCHAR(3)  CONSTRAINT unit_ck CHECK (unit IN ('pc','ea','mtr','pkg','ltr'))
);

-- 4. salesDetail (view-only — depends on sales + product)
CREATE TABLE IF NOT EXISTS salesDetail (
  transNo   VARCHAR(8)  NOT NULL REFERENCES sales(transNo),
  prodCode  VARCHAR(6)  NOT NULL REFERENCES product(prodCode),
  quantity  DECIMAL(10,2) CONSTRAINT quantity_ck CHECK (quantity >= 0.0),
  PRIMARY KEY (transNo, prodCode)
);

-- 5. priceHist (view-only — depends on product)
CREATE TABLE IF NOT EXISTS priceHist (
  effDate   DATE        NOT NULL,
  prodCode  VARCHAR(6)  NOT NULL REFERENCES product(prodCode),
  unitPrice DECIMAL(10,2) CONSTRAINT unitP_ck CHECK (unitPrice > 0),
  PRIMARY KEY (effDate, prodCode)
);