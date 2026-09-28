# Restaurant Food Waste Tracker

A full stack NoSQL application built for the Decision Analytics assignment.
Restaurants often waste food without knowing what, when, or how much money it costs them.
This app lets staff record waste as it happens, and lets managers and admins see where the money is going.

Monetary loss is calculated automatically with the formula from the business case:

```
Total Monetary Loss = Quantity Discarded x Unit Cost
```

## Tech stack

- Frontend: React (Vite) + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB (Atlas), accessed through Mongoose
- Auth: JWT login tokens with role based access control (Staff, Manager, Admin)

## Folder structure

```
restaurant-waste-tracker/
  backend/    Express API server and MongoDB models
  frontend/   React app (Vite)
```

## Step 1: Create a free MongoDB Atlas database

1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account.
2. Create a new free (M0) cluster, any cloud provider and region is fine.
3. Under "Database Access", create a database user with a username and password. Remember these.
4. Under "Network Access", add your current IP address (or "Allow access from anywhere" for a quick demo).
5. Click "Connect" on your cluster, choose "Drivers", and copy the connection string.
   It looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
6. Add a database name to the end of it, for example `.../waste_tracker?retryWrites=true&w=majority`

## Step 2: Set up the backend

```
cd backend
npm install
cp .env.example .env
```

Open `.env` and paste your MongoDB connection string into `MONGO_URI`, and set `JWT_SECRET` to any long random string.

Seed the database with a starter admin account, a sample manager and staff account, a default branch, and standard categories and waste reasons:

```
npm run seed
```

Start the backend:

```
npm run dev
```

The API runs at `http://localhost:5000`. You can check it is alive by visiting `http://localhost:5000/api/health`.

## Step 3: Set up the frontend

Open a second terminal:

```
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app runs at `http://localhost:5173`.

## Demo accounts (created by the seed script)

| Role    | Email                     | Password   |
|---------|---------------------------|------------|
| Admin   | admin@wastetracker.com    | Admin@123  |
| Manager | manager@wastetracker.com  | Manager@123|
| Staff   | staff@wastetracker.com    | Staff@123  |

Change these passwords before using the app for anything real.

## How the app covers the business case requirements

**Restaurant Staff**
- Record waste: the Record Waste page lets staff enter an item, quantity, and unit, the monetary loss is computed by the backend automatically.
- Categorize waste: a category dropdown (Prep, Plate, Bar, Spoilage, and so on).
- Select waste reason: a reason dropdown (burnt, expired, dropped, customer return, and so on).
- View their recorded waste: the My Entries page shows only the entries that staff member submitted.

**Restaurant Manager**
- Manage item prices and units: the Item Prices page defines the unit cost per kg, liter, or unit for each ingredient.
- View all waste records: the All Entries page shows every waste entry with its calculated loss.
- Track financial and volume loss: the Dashboard shows total loss, total weight, and breakdowns by category and reason.
- Identify high-waste items: the Dashboard ranks items by total weight and by total dollar loss.
- View waste trends: a line chart on the Dashboard shows daily loss over time.
- Filter waste by date, category, branch: a filter bar is available on the Dashboard and All Entries pages.

**Admin**
- Manage users: the Users page adds employees, assigns roles, and deactivates accounts.
- Manage categories: the Categories page adds, edits, and removes waste categories.
- Manage waste reasons: the Waste Reasons page updates the dropdown list staff use.
- Manage branches: the Branches page registers new locations and assigns regional managers.

## Notes for the report and viva

This project satisfies the assignment's requirement to build a NoSQL application using MongoDB.
Mongoose schemas in `backend/models` define flexible, document based collections (users, branches,
categories, waste reasons, item prices, and waste entries) that reference each other by ObjectId,
similar to how a relational database would use foreign keys, but stored as JSON style documents.
Aggregation pipelines in `backend/controllers/report_controller.js` demonstrate MongoDB's
aggregation framework, used to group and total waste records for the manager's dashboard.

This README does not replace the written report the assignment asks for (explaining the
characteristics, applications, strengths, and limitations of NoSQL). If you want help drafting that
report as a separate document, just ask.
