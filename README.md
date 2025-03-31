# Inventory Management System

![Inventory Management](https://utfs.io/f/W3yeuUt3H29ztwRK831V3ATd4bxQVyKo0YFLvm7t9MD6e8HN)

## Overview
The **Inventory Management System** is a web application designed to streamline inventory tracking and management for **IIT Ropar BoST**. It ensures efficient handling of components, stock updates, and request approvals.

## Features
✅ User authentication with Clerk  
✅ Role-based access control (Super-Admin, Admin, Users)  
✅ Track available, in-use, and requested inventory  
✅ Issue and return inventory items  
✅ Request approval system  
✅ Modern and responsive UI  

## How It Works
1. **User Authentication**: Users log in with Clerk authentication.
2. **Role-Based Access**:
   - **Admins** can manage inventory, approve requests, and modify stock.
   - **Users** can request inventory and return items.
3. **Inventory Management**:
   - Users can view available and in-use stock.
   - Admins can update stock levels and track issued items.
4. **Request & Approval Flow**:
   - Users request inventory items.
   - Admins approve or reject requests.
   - Issued items are tracked and managed for returns.

## Technologies Used
- **Frontend:** Next.js, Tailwind CSS
- **Authentication:** Clerk
- **Backend:** MongoDB, Uploadthing
- **State Management:** Redux
- **Animations:** Framer Motion

## Usage
This project is intended for internal use at **IIT Ropar BoST**. While the code is open source, it is not designed for public installation or contribution.

## License
[MIT License](LICENSE)
