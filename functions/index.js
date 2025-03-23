const { onValueCreated } = require("firebase-functions/v2/database");
const admin = require("firebase-admin");

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
