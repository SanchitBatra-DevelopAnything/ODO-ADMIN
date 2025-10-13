const { onValueCreated } = require("firebase-functions/v2/database");
const admin = require("firebase-admin");
const functions = require("firebase-functions");

admin.initializeApp({
  databaseURL: "https://odo-admin-app-default-rtdb.asia-southeast1.firebasedatabase.app", // Replace with your actual DB URL
});

// Cloud Function to trigger when a new order is added
exports.sendApprovalNotification = onValueCreated(
  {
    region: "asia-southeast1", // Match database region
    ref: "/activeDistributorOrders/{orderId}", // Database path to listen
  },
  async (event) => {
    try {
      const messaging = admin.messaging();

      if (!messaging) {
        console.error("Admin SDK not set up correctly");
        return;
      }

      // Hardcoded values
      const title = "New Order for ODO Admin";
      const matter = "Please open ODO Admin app to see order details";
      const deviceToken =
        "fObj_GzKSPiSeCBgmmXbpx:APA91bG-wRmHFY8kyQ63K-11CdUGJq-PJ2sqvR8KAx2DXwCxII0k03BwXUrUZLIkQtel4MBChDK8oLFEt1dl6raAAucA6pwYPGsB3rAg_vW4Pya6E08c3m8";

      const payload = {
        notification: {
          title: title,
          body: matter,
        },
        android: {
          notification: {
            sound: "default",
          },
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
            },
          },
        },
        token: deviceToken,
      };

      const response = await messaging.send(payload);
      console.log("Notification sent successfully:", response);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }
);

// This is to invalidate session -- temporary and if we move to API , this should be done on API.
// autoLogin checks again if this user is valid user or not , if not , we log them out as we have no TTL on sharedPreferences in b2b app.
// a firebase rule of db is added , to index on contact of distributors for fast and efficient querying.
exports.checkDistributorContact = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // Only allow GET or POST
      if (req.method !== "POST" && req.method !== "GET") {
        return res.status(405).send("Method Not Allowed");
      }

      // Get contact number
      const contact = req.body.contact || req.query.contact;

      if (!contact) {
        return res.status(400).json({ error: "Missing 'contact' parameter" });
      }

      // Query the database efficiently
      const snapshot = await admin.database()
        .ref("Distributors")
        .orderByChild("contact")
        .equalTo(contact)
        .limitToFirst(1)
        .once("value");

      const exists = snapshot.exists();

      return res.status(200).json({ exists });
    } catch (error) {
      console.error("Error checking distributor contact:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
});

