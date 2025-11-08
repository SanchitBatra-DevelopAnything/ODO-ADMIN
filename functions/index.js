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

exports.getDistributorsByReferrer = functions.https.onRequest(async (req, res) => {
  const referrerId = req.query.referrerId || req.body.referrerId;

  if (!referrerId) {
    return res.status(400).json({ error: "Missing referrerId" });
  }

  try {
    const snapshot = await admin
      .database()
      .ref("Distributors")
      .orderByChild("referrerId")
      .equalTo(referrerId)
      .once("value");

    if (!snapshot.exists()) {
      return res.json([]);
    }

    const distributors = snapshot.val();

    const names = Object.values(distributors)
        .map((dist) => dist.name)
        .filter((n) => n != null);

    return res.json(names);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

exports.getOrdersForReferrerApp = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST");

  const referrerId = req.query.referrerId;
  const date = req.query.date;

  if (!referrerId || !date) {
    return res.status(400).json({
      error: "Missing referrerId or date in query params"
    });
  }

  try {
    const db = admin.database();

    //----------------------------------
    // ✅ Fetch from activeDistributorOrders
    //----------------------------------
    const activeSnap = await db.ref("activeDistributorOrders")
      .orderByChild("referrerId")
      .equalTo(referrerId)
      .once("value");

    let activeOrders = [];
    if (activeSnap.exists()) {
      const data = activeSnap.val();
      activeOrders = Object.values(data)
        .filter(o =>
          o.orderDate === date &&
          ["pending", "delivered", "out-for-delivery"].includes(o.status)
        )
        .map(o => ({
          orderedFrom: o.shop,
          status: o.status,
          amount: o.totalPriceAfterDiscount ?? 0
        }));
    }

    //----------------------------------
    // ✅ Fetch from processedDistributorOrders/{date}
    //----------------------------------
    const processedPath = `processedDistributorOrders/${date}`;
    const processedSnap = await db.ref(processedPath)
      .orderByChild("referrerId")
      .equalTo(referrerId)
      .once("value");

    let processedOrders = [];
    if (processedSnap.exists()) {
      const data = processedSnap.val();
      processedOrders = Object.values(data)
        .map(o => ({
          orderedFrom: o.shop,
          status: "delivered", // ✅ Always delivered here
          amount: o.totalPriceAfterDiscount ?? 0
        }));
    }

    //----------------------------------
    // ✅ Combine both lists
    //----------------------------------
    const orders = [...activeOrders, ...processedOrders];

    //----------------------------------
    // ✅ Calculate total amount
    //----------------------------------
    const totalAmount = orders.reduce(
      (sum, o) => sum + (o.amount || 0),
      0
    );

    //----------------------------------
    // ✅ Final Response
    //----------------------------------
    const response = {
      orders,
      totalAmount
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error("Error fetching orders: ", error);
    return res.status(500).json({
      error: "Error fetching orders"
    });
  }
});


//Delivery Partner Related Functions
exports.getAssignedOrdersMetadata = functions.https.onRequest(async (req, res) => {
  try {
    const deliveryPartnerId = req.query.deliveryPartnerId;
    if (!deliveryPartnerId) {
      return res.status(400).json({ error: "Missing deliveryPartnerId" });
    }

    // ✅ Fetch only orders assigned to this delivery partner
    const snapshot = await db
      .ref("activeDistributorOrders")
      .orderByChild("deliveryPartnerId")
      .equalTo(deliveryPartnerId)
      .once("value");

    const orders = snapshot.val();
    if (!orders) {
      return res.status(200).json([]);
    }

    const grouped = {};

    // Group orders by shop
    Object.entries(orders).forEach(([orderId, orderData]) => {
      const shopName = orderData.shop;

      if (!grouped[shopName]) {
        grouped[shopName] = {
          orderIds: [],
          totalAmount: 0,
          referrerId: orderData.referrerId,
          "delivery-latitude": orderData["delivery-latitude"],
          "delivery-longitude": orderData["delivery-longitude"],
        };
      }

      grouped[shopName].orderIds.push(orderId);
      grouped[shopName].totalAmount +=
        parseFloat(orderData.totalPriceAfterDiscount) || 0;
    });

    // Fetch referrer details
    for (const shopName in grouped) {
      const referrerId = grouped[shopName].referrerId;
      const refSnapshot = await db
        .ref(`ReferralLeaderboard/${referrerId}`)
        .once("value");
      const refData = refSnapshot.val();

      grouped[shopName].referrerName = refData?.referrerName || null;
      grouped[shopName].referrerContact = refData?.contact || null;

      delete grouped[shopName].referrerId;
    }

    // Format result
    const result = Object.entries(grouped).map(([shop, data]) => ({
      shop,
      orderIds: data.orderIds,
      totalAmount: data.totalAmount,
      referrerName: data.referrerName,
      referrerContact: data.referrerContact,
      "delivery-latitude": data["delivery-latitude"],
      "delivery-longitude": data["delivery-longitude"],
    }));

    return res.status(200).json(result);
  } catch (err) {
    console.error("Error fetching assigned orders:", err);
    return res.status(500).json({ error: err.message });
  }
});


