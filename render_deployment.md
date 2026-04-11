# 🚀 Complete Deployment Guide: Render.com

Follow these exact steps to host your **Credit Card Sales Management System** on Render.

## 1. GitHub Synchronization
Ensure your GitHub repository is up to date with the latest changes I just pushed.
**Repository**: `https://github.com/danishantigraviity/Sbi`

## 2. Create a Web Service on Render
1. Log in to [Render.com](https://dashboard.render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select the **Sbi** repository.

## 3. Configure the Service
In the "Create Web Service" screen, set the following:
*   **Name**: `sbi-sales-platform` (or your choice)
*   **Region**: `Singapore (Southeast Asia)` or your preferred region.
*   **Branch**: `main`
*   **Root Directory**: (Leave blank - we are deploying from the top level)
*   **Runtime**: `Node`
*   **Build Command**: `npm run build`
*   **Start Command**: `npm run start`

## 4. Set Environment Variables
Click **Advanced** or find the **Environment** tab and add these **Secret Keys**:

| Key | Value |
| :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://danishantigraviity_db_user:1BwPAO9DgjnJJkId@sbi.7akzbjm.mongodb.net/Sbi?appName=Sbi` |
| `JWT_SECRET` | `your_jwt_secret_key_123` (Change this for real production security) |
| `NODE_ENV` | `production` |
| `PORT` | `5001` |

## 5. Launch
1. Click **Create Web Service**.
2. Render will automatically run the build process:
   *   Install all root, backend, and frontend dependencies.
   *   Build the Vite frontend.
   *   Start the Express server.
3. Once the log says `Live`, your site is ready!

---

> [!IMPORTANT]
> **Dynamic Tracking & Map Notice**: 
> The application will work perfectly, but the **Live Tracking Map** will use OpenStreetMap by default (free). If you ever want to switch back to Google Maps, remember to add your `VITE_GOOGLE_MAPS_API_KEY` to the Render Environment Variables.

> [!TIP]
> **Deployment Status**:
> You can monitor the progress in the **Events** tab on Render. If the build fails, check the logs for any missing dependencies.
