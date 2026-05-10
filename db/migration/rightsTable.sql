-- App users table
CREATE TABLE IF NOT EXISTS "user" (
  userId        TEXT         NOT NULL PRIMARY KEY,  -- matches auth.uid()
  username      VARCHAR(50),
  email         VARCHAR(100),
  user_type     VARCHAR(15)  NOT NULL DEFAULT 'USER'
                             CHECK (user_type IN ('SUPERADMIN','ADMIN','USER')),
  record_status VARCHAR(10)  NOT NULL DEFAULT 'INACTIVE'
                             CHECK (record_status IN ('ACTIVE','INACTIVE')),
  stamp         VARCHAR(60)
);

-- Modules table
CREATE TABLE IF NOT EXISTS Module (
  moduleCode    VARCHAR(10)  NOT NULL PRIMARY KEY,
  moduleName    VARCHAR(30),
  record_status VARCHAR(10)  DEFAULT 'ACTIVE',
  stamp         VARCHAR(60)
);

-- User-to-module mapping
CREATE TABLE IF NOT EXISTS user_module (
  userId        TEXT         NOT NULL REFERENCES "user"(userId),
  moduleCode    VARCHAR(10)  NOT NULL REFERENCES Module(moduleCode),
  rights_value  SMALLINT     NOT NULL DEFAULT 0 CHECK (rights_value IN (0,1)),
  PRIMARY KEY (userId, moduleCode)
);

-- Rights definition table
CREATE TABLE IF NOT EXISTS rights (
  rightCode     VARCHAR(15)  NOT NULL PRIMARY KEY,
  rightName     VARCHAR(30),
  right_value   SMALLINT     DEFAULT 1,
  moduleCode    VARCHAR(10)  REFERENCES Module(moduleCode),
  record_status VARCHAR(10)  DEFAULT 'ACTIVE',
  stamp         VARCHAR(60)
);

-- User-to-right mapping
CREATE TABLE IF NOT EXISTS UserModule_Rights (
  userId        TEXT         NOT NULL REFERENCES "user"(userId),
  rightCode     VARCHAR(15)  NOT NULL REFERENCES rights(rightCode),
  right_value   SMALLINT     NOT NULL DEFAULT 0 CHECK (right_value IN (0,1)),
  PRIMARY KEY (userId, rightCode)
);