# 📘 HOPE CMS User Manual
**Version:** 1.0 (Sprint 3 Final)  
**Live Site:** [https://hopecms.vercel.app/](https://hopecms.vercel.app/)  
**Organization:** HOPE, Inc.

---

## 1. Introduction
The **HOPE CMS** is a secure, web-based platform designed for HOPE, Inc. to streamline customer relationship management, sales tracking, and business intelligence. This manual provides a step-by-step guide on how to navigate the system effectively.

---

## 2. Authentication & Security

### 2.1 Registration
Users can register via the **Register** page using their name, email, and password, or through **Google Authentication**. 
* **The Login Guard:** To ensure security, all newly registered accounts are set to `PENDING`. 
* **Note:** You will see an error message if you try to log in before an administrator has activated your account.

### 2.2 User Roles
The system enforces strict Role-Based Access Control (RBAC):
* **USER:** View-only access to Customers, Products, and Sales.
* **ADMIN:** Can create/edit customers and access the Recovery Panel.
* **SUPERADMIN:** Full control, including User Activation and System Configuration.

---

## 3. Customer Management

### 3.1 Navigating the Customer List
The primary workspace where you can search and filter through the HOPE, Inc. client database.
* **Admin Actions:** If you have the appropriate rights, you will see buttons to **Edit** or **Delete** customers.
* **Soft-Delete:** Deleting a record moves it to the archive; it is not permanently removed from the database.

### 3.2 Sales Drill-down Flow
To view the detailed history of a client:
1. Click on a **Customer Name** from the list.
2. View the **Customer Detail** profile.
3. Scroll to **Sales History** and click on a **Transaction Date**.
4. The system will expand the **Line Items**, showing product codes, unit prices, and quantities.

![Customer Detail and Sales Drill-down]

---

## 4. Product & Pricing
The **Products** page provides a read-only catalogue of all inventory items. 
* **Price History:** Click on any product to see the **Price History Modal**. This shows how the `unitprice` has changed over time, ensuring transparency in billing.

---

## 5. Business Reports
The **Reports** tab provides real-time analytics across three main areas:
* **Product Revenue:** Visualizes which products are top-sellers via bar charts.
* **Customer Summary:** Breaks down total expenditures per client.
* **Top Customers:** High-level metrics for strategic decision-making.

---

## 6. Administrative Tools (Superadmin/Admin Only)

### 6.1 User Activation
Superadmins use the **Admin Panel** to manage who can enter the system.
1. Locate the user under the "Pending" filter.
2. Click **Activate** to grant system access.

![Admin Panel User Management]

### 6.2 Data Recovery
If a customer was deleted by mistake:
1. Navigate to the **Deleted Customers** page.
2. Review the "Stamp" (Who deleted it and when).
3. Click **Recover** to restore the record and all its associated sales data.

---

## 🆘 Support
For technical issues or account activation requests, please contact the **System Superadmin** or your department head.

**Technical Support:** [https://hopecms.vercel.app/](https://hopecms.vercel.app/)