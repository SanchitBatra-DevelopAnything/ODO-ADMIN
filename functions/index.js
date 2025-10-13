const { onValueCreated } = require("firebase-functions/v2/database");
const { https } = require("firebase-functions/v2"); // Use v2 https for consistency
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const cors = require("cors")({ origin: true }); // ✅ FIX: Import and configure CORS

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    databaseURL: "https://odo-admin-app-default-rtdb.asia-southeast1.firebasedatabase.app",
  });
}

// 🟢 Function 1: Send notification when new order is added
exports.sendApprovalNotification = onValueCreated(
  {
    region: "asia-southeast1",
    ref: "/activeDistributorOrders/{orderId}",
  },
  async (event) => {
    try {
      const messaging = admin.messaging();

      if (!messaging) {
        console.error("Admin SDK not set up correctly");
        return;
      }

      const title = "New Order for ODO Admin";
      const matter = "Please open ODO Admin app to see order details";
      const deviceToken =
        "fObj_GzKSPiSeCBgmmXbpx:APA91bG-wRmHFY8kyQ63K-11CdUGJq-PJ2sqvR8KAx2DXwCxII0k03BwXUrUZLIkQtel4MBChDK8oLFEt1dl6raAAucA6pwYPGsB3rAg_vW4Pya6E08c3m8";

      const payload = {
        notification: { title, body: matter },
        android: { notification: { sound: "default" } },
        apns: { payload: { aps: { sound: "default" } } },
        token: deviceToken,
      };

      const response = await messaging.send(payload);
      console.log("Notification sent successfully:", response);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }
);

// 🟢 Function 2: Check if distributor contact exists
exports.checkDistributorContact = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST" && req.method !== "GET") {
        return res.status(405).send("Method Not Allowed");
      }

      const contact = req.body.contact || req.query.contact;
      if (!contact) {
        return res.status(400).json({ error: "Missing 'contact' parameter" });
      }

      const snapshot = await admin
        .database()
        .ref("Distributors")
        .orderByChild("contact")
        .equalTo(contact)
        .limitToFirst(1)
        .once("value");

      const exists = snapshot.exists();

      return res.status(200).json({ exists });
    } catch (error) {
      console.error("Error checking distributor contact:", error);
      return res.status(500).json({ error: error.message });
    }
  });
});
