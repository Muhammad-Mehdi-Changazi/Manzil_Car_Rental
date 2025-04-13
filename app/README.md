 **Manzil - Sprint 2**  

 **Project Overview**  
**Manzil** is a **React Native Expo** application designed to help tourists:  
**Reserve hotels** 
**Check for car rental companies & rent cars**   
**Check reviews for tourist spots**  
**Leave reviews for places they visit**  

##  **Sprint 2 Updates**  
In **Sprint 2**, we implemented the following changes:  
**Updated data models** for better structure.  
**Integrated an interactive UI** for a better user experience.  
**Developed separate dashboards** for:  
   - **Hotel Admin (Web Application)**   
   - **Customer (Mobile Application)**  

## **How to Run the Application Locally**  

### **For the Mobile App (Customer Side)**  
1. **Go to the project root directory**  
2. Run:  
   ```sh
   npm install
   npm start
   ```
3. Scan the QR code in Expo Go App.
4. The app will run in Expo Go.

### **For the Hotel Admin Panel (Web Application)**  
1. The hotel admin panel is available in a **separate repository**.  
2. The files are also uploaded in this repository.  
3. **To run it locally:**  
   ```sh
   npm install
   npm start
   ```
4. **Login with hotel credentials (Example):**  
   - **Email:** `pc.admin@pc.com`  
   - **Password:** `pcadminpass123`  
   - Hotel admin credentials are provided manually.

##  **Live Deployment**  
The **Hotel Admin Panel** is available at:  
[Hotel Admin Web Panel](http://myexpoapp-hoteladmin.s3-website-us-east-1.amazonaws.com/)

## **User Authentication**  
**Signup feature** is available for users.  
**Hotel Admin credentials** are provided manually.  

---

###  **Tech Stack**
- **Frontend:** React Native (Expo), React (for Web Panel)  
- **Backend:** Hosted on **AWS** (No need to run separately) 
- **Database & APIs:** MongoDB Integrated with AWS backend  