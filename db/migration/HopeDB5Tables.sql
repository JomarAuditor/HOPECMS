CREATE TABLE customer (custno VARCHAR(5) NOT NULL PRIMARY KEY, 
											custname VARCHAR(20), 
											address VARCHAR(50), 
											payterm VARCHAR(3) CONSTRAINT pay_ck 
											CHECK (payterm IN ('COD', '30D', '45D'))) ;

CREATE TABLE  sales (transNo VARCHAR(8) NOT NULL PRIMARY KEY, 
												salesDate DATE, 
												custNo VARCHAR(5), 
												empNo VARCHAR(5), 	
												FOREIGN KEY (custNo) REFERENCES customer, 
												FOREIGN KEY (empno) REFERENCES employee);

CREATE TABLE product (prodCode VARCHAR(6) NOT NULL PRIMARY KEY, 
											description VARCHAR(30), 
											unit VARCHAR(3) CONSTRAINT unit_ck 
											CHECK (unit IN ('pc','ea','mtr','pkg','ltr')));

CREATE TABLE salesDetail (transNo VARCHAR(8) NOT NULL REFERENCES sales, 
													prodCode VARCHAR(6) NOT NULL REFERENCES product, 
													quantity DECIMAL(10,2) CONSTRAINT quantity_ck 
													CHECK (quantity >= 0.0), 
													PRIMARY KEY (transNo, prodCode));

CREATE TABLE priceHist (effDate DATE NOT NULL, 
											   prodCode VARCHAR(6) NOT NULL REFERENCES product, 
											   unitPrice DECIMAL(10,2) CONSTRAINT unitP_ck 
											   CHECK (unitPrice > 0),  
											   PRIMARY KEY (effDate, prodCode));
