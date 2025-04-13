# MANZIL - Tourist Guide Mobile Application  

**MANZIL** is a React Native mobile application designed to guide tourists in finding places, exploring reviews, and booking hotels for their stay. The application provides a seamless user experience for both customers and hotel management staff.

---

## **Features**

### **For Customers:**
1. **Sign up & Login:**
   - Users can register by selecting the customer option on the sign up page.
   - Login to access the app features.

2. **Search & Explore:**
   - Search for desired places using the search bar on the home page.
   - The recommendation system suggests places based on the user's location (if enabled).

3. **Explore Cities & Famous Places:**
   - Browse cities and explore their famous attractions.

4. **Hotel Features:**
   - View details of hotels and their rooms.
   - **Reviews Tab:** Check reviews from users and Google reviews.
   - **Navigate Tab:** Navigate to the hotel's location using Google Maps integration.
   - **Make Reservation Tab:** Place room reservation requests based on room availability.

5. **Restaurant Features:**
   - **Navigate Tab:** Find the location of restaurants via Google Maps.
   - **Reviews Tab:** Check user reviews and Google reviews for restaurants.

---

### **For Hotel Management Staff:**
1. **Login:**
   - Hotel management staff login credentials are manually assigned (email and password).
   
2. **Manage Hotel Information:**
   - **Room Info Tab:** View details of their hotel rooms.
   - **Reservation Requests Tab:** Monitor real-time reservation requests from customers.
   - **Edit Room Info Tab:** Update room information as required.

3. **Real-Time Communication:**
   - Integrated **Socket.IO** for real-time updates and interactions between customers and hotel management staff.

---

## **Technologies Used**
- **Frontend:** React Native
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Real-Time Communication:** Socket.IO
- **Google Maps Integration:** Google Maps API
- **Authentication:** JSON Web Tokens (JWT)

---

## **Current Data Setup**
### **Hotels Added:**
1. **Pearl Continental Hotel Karachi**
   - Includes room information.
2. **Hotel One Downtown Lahore**
   - Includes room information.

### **Manual Data Handling:**
- Hotels and their details are currently added manually.
- Login credentials for hotel management staff are also assigned manually.

---

## **Installation & Setup**
1. Clone the repository:
   ```bash
   git clone https://github.com/Muhammad-Mehdi-Changazi/Manzil
   ```
2. Install dependencies:
   ```bash
   cd MANZIL
   npm install
   ```
3. Configure environment variables:
   - Create a `.env` file and add the required variables:
     ```env
     MONGODB_URI= mongodb+srv://sQpbJkHNcJzho6Pd:sQpbJkHNcJzho6Pd@manzil.gxdiu.mongodb.net/
     GOOGLE_API_KEY= AIzaSyAUwcgoinASwKDHlKDuW9HvNodSkBz64YI
     ```
4. Run the backend server:
   ```bash
   cd my-backend
   npm start
   ```
5. Run the frontend:
   ```bash
   cd MANZIL
   npm start
   ```

---

## **Future Enhancements**
- Enable dynamic hotel addition by hotel management staff.
- Implement user feedback for improving recommendations.
- Expand real-time communication to include chat between users and hotel staff.
- Add more hotels and more data.
- Enable the hotel information editing feature.
- Enable the reservation requests more, to deal in real time and accept or reject the request.
- Send notification to the hotel management staff upon receiving a reservation request.
- Send notification to the customer upon acceptance or rejection of their reservation request.


---

**Authors:**  
SPROJ Group 04

