const { onValueCreated } = require("firebase-functions/v2/database");
const { https } = require("firebase-functions/v2"); // Use v2 https for consistency
const admin = require("firebase-admin");
const functions = require("firebase-functions");
const cors = require("cors")({ origin: true }); // ✅ FIX: Import and configure CORS
const { onSchedule } = require("firebase-functions/v2/scheduler");

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
    const db = admin.database();
    const deliveryPartnerId = req.query.deliveryPartnerId;

    if (!deliveryPartnerId) {
      return res.status(400).json({ error: "Missing deliveryPartnerId" });
    }

    // ✅ Step 1: Fetch all orders for this delivery partner
    const snapshot = await db
      .ref("activeDistributorOrders")
      .orderByChild("deliveryPartnerId")
      .equalTo(deliveryPartnerId)
      .once("value");

    if (!snapshot.exists()) {
      return res.status(200).json([]); // no orders found
    }

    const ordersObj = snapshot.val() || {};

    // ✅ Step 2: Filter only "out-for-delivery" orders
    const filteredOrders = Object.entries(ordersObj)
      .filter(([_, order]) => order.status === "out-for-delivery") // filter by status
      .reduce((acc, [orderId, order]) => {
        acc[orderId] = order; // rebuild map
        return acc;
      }, {});

    if (Object.keys(filteredOrders).length === 0) {
      return res.status(200).json([]); // no matching orders
    }

    // ✅ Step 3: Group by shop
    const grouped = {};

    for (const [orderId, orderData] of Object.entries(filteredOrders)) {
      const shopName = orderData.shop || "Unknown Shop";

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
    }

    // ✅ Step 4: Enrich with referrer details
    for (const shopName in grouped) {
      const referrerId = grouped[shopName].referrerId;
      if (referrerId) {
        const refSnapshot = await db
          .ref(`ReferralLeaderboard/${referrerId}`)
          .once("value");
        const refData = refSnapshot.val();

        grouped[shopName].referrerName = refData?.referrerName || null;
        grouped[shopName].referrerContact = refData?.contact || null;
      } else {
        grouped[shopName].referrerName = null;
        grouped[shopName].referrerContact = null;
      }

      delete grouped[shopName].referrerId;
    }

    // ✅ Step 5: Format the result
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


exports.getOrdersByIds = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  try {
    // ✅ Get orderIds from query param or body
    let orderIds = [];
    const db = admin.database();

    if (req.method === "GET" && req.query.orderIds) {
      // Comma-separated: ?orderIds=order_1,order_2
      orderIds = req.query.orderIds.split(",").map((id) => id.trim());
    } else if (req.method === "POST" && req.body?.orderIds) {
      orderIds = req.body.orderIds;
    }

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ error: "orderIds parameter is required" });
    }

    // ✅ Fetch all orders concurrently
    const promises = orderIds.map(async (orderId) => {
      const snapshot = await db.ref(`activeDistributorOrders/${orderId}`).once("value");
      if (snapshot.exists()) {
        return { id: orderId, ...snapshot.val() };
      } else {
        return { id: orderId, error: "Order not found" };
      }
    });

    const results = await Promise.all(promises);

    //filter results to only return orders where status = "out-for-delivery" as they can change after order gets updated in deliveryApp.
    const filteredResults = results.filter(order => order.status === "out-for-delivery");

    // ✅ Return combined list
    return res.status(200).json(filteredResults);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ error: error.message });
  }
});

//get store balance in delivery partner app
exports.getStoreBalance = functions.https.onRequest(async (req, res) => {
  try {
    const partnerId = req.query.partnerId;

    if (!partnerId) {
      return res.status(400).json({ error: "partnerId is required" });
    }

    const db = admin.database();

    // 👉 Fetch ONLY orders belonging to this delivery partner
    const snapshot = await db
      .ref("activeDistributorOrders")
      .orderByChild("deliveryPartnerId")
      .equalTo(partnerId)
      .get();

    if (!snapshot.exists()) {
      return res.json({ totalHisaab: 0, data: {} });
    }

    const partnerOrders = snapshot.val();

    // 👉 Filter manually for delivered orders (small list now)
    const deliveredOrders = Object.values(partnerOrders).filter(
      (order) => order.status === "delivered"
    );

    // 👉 Group orders by darkStoreId
    const groupedOrders = {};
    deliveredOrders.forEach((order) => {
      const storeId = order.darkStoreId;
      if (!groupedOrders[storeId]) groupedOrders[storeId] = [];
      groupedOrders[storeId].push(order);
    });

    let totalHisaab = 0;
    const responseData = {};

    // 👉 Build final Flutter-friendly format
    for (const darkStoreId of Object.keys(groupedOrders)) {
      // Fetch store name
      const storeSnap = await db
        .ref(`darkStores/${darkStoreId}/darkStoreName`)
        .get();

      const storeName = storeSnap.exists()
        ? storeSnap.val()
        : `Store_${darkStoreId}`;

      // Map orders to required format
      const orders = groupedOrders[darkStoreId].map((o) => {
        const amount = o.totalPriceAfterDiscount ?? 0;
        totalHisaab += amount;

        return {
          shopName: o.shop,
          amount: amount,
        };
      });

      responseData[storeName] = {
        orders: orders,
      };
    }

    return res.json({
      totalHisaab,
      data: responseData,
    });

  } catch (error) {
    console.error("ERROR", error);
    return res.status(500).json({ error: error.message });
  }
});

///--------KHOKHA APP FUNCTIONS ---------////
exports.getItemsByKhokhaStore = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const storeId = req.query.storeId;

      if (!storeId) {
        return res.status(400).json({ error: "storeId is required" });
      }

      const snapshot = await admin
        .database()
        .ref("khokhaItems")
        .once("value");

      const data = snapshot.val();

      if (!data) {
        return res.json([]);
      }

      const items = Object.entries(data).map(([id, value]) => {
        const storeStock = value.stock?.[storeId];

        return {
          id,
          categoryId: value.categoryId,
          name: value.name,
          price: value.price,
          imageUrl: value.imageUrl,

          // ONLY current available stock
          stock:
            typeof storeStock === "object"
              ? storeStock.value ?? 0
              : storeStock ?? 0
        };
      });

      res.json(items);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
});



//function to restock by acquiring a lock such that at this point order placed from app fails.
exports.updateStockForStore = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    const { storeId, items, operation } = req.body;

    // Basic validation
    if (
      !storeId ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !["add", "subtract"].includes(operation)
    ) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const db = admin.database();
    const lockRef = db.ref(`storeLocks/${storeId}`);

    try {
      /** ===============================
       * 1️⃣ ADD (RESTOCK)
       * =============================== */
      if (operation === "add") {
        // Acquire lock
        await lockRef.set({
          restockInProgress: true,
          updatedAt: Date.now()
        });

        const txns = items.map(({ itemId, qty }) => {
          if (!itemId || typeof qty !== "number" || qty <= 0) {
            throw new Error("Invalid item payload");
          }

          return db
            .ref(`khokhaItems/${itemId}/stock/${storeId}/value`)
            .transaction(current => {
              if (typeof current !== "number") return qty;
              return current + qty;
            });
        });

        const results = await Promise.all(txns);

        if (results.some(r => !r.committed)) {
          throw new Error("Stock add failed");
        }

        // Release lock
        await lockRef.set({
          restockInProgress: false,
          updatedAt: Date.now()
        });

        return res.json({
          success: true,
          message: "Stock added successfully"
        });
      }

      /** ===============================
       * 2️⃣ SUBTRACT (ORDER)
       * =============================== */
      if (operation === "subtract") {
        const lockSnap = await lockRef.once("value");

        if (lockSnap.val()?.restockInProgress) {
          return res
            .status(409)
            .json({ error: "Restock in progress, try later" });
        }

        const txns = items.map(({ itemId, qty }) => {
          if (!itemId || typeof qty !== "number" || qty <= 0) {
            throw new Error("Invalid item payload");
          }

          return db
            .ref(`khokhaItems/${itemId}/stock/${storeId}/value`)
            .transaction(current => {
              if (typeof current !== "number") return current;
              if (current < qty) return current; // abort safely
              return current - qty;
            });
        });

        const results = await Promise.all(txns);

        if (results.some(r => !r.committed)) {
          return res
            .status(409)
            .json({ error: "Insufficient stock" });
        }

        return res.json({
          success: true,
          message: "Stock subtracted successfully"
        });
      }
    } catch (err) {
      console.error(err);

      // Safety: unlock if restock crashes
      if (operation === "add") {
        await lockRef.set({
          restockInProgress: false,
          updatedAt: Date.now()
        });
      }

      res.status(500).json({ error: err.message });
    }
  });
});





exports.setDailyOpeningLimit = onSchedule(
  {
    schedule: "0 5 * * *",        // 5:00 AM every day
    timeZone: "Asia/Kolkata",      // India timezone
  },
  async (event) => {
    const db = admin.database();
    try {
      const today = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });
      const itemsSnap = await db.ref("khokhaItems").once("value");

      const updates = {};

      itemsSnap.forEach((itemSnap) => {
        const itemId = itemSnap.key;
        const stock = itemSnap.child("stock").val();
        if (!stock) return;

        Object.keys(stock).forEach((storeId) => {
          updates[
            `khokhaItems/${itemId}/stock/${storeId}/openingLimit`
          ] = stock[storeId].limit;

          updates[
            `khokhaItems/${itemId}/stock/${storeId}/openingLimitDate`
          ] = today;
        });
      });

      await db.ref().update(updates);
      console.log("Opening limits set for", today);

    } catch (err) {
      console.error("Error in setDailyOpeningLimit:", err);
    }
  }
);

exports.generateAdminSummary = functions.https.onRequest(
  async (req, res) => {
    try {
      const { storeId, date , operation } = req.body;
      const db = admin.database();

      if (!storeId || !date) {
        return res.status(400).json({
          error: "storeId and date are required"
        });
      }

      const ordersSnap = await db
        .ref(`khokhaOrders/${storeId}/${date}`)
        .once("value");

      const itemsSold = {};
      let totalUPI = 0;
      let totalCash = 0;

      ordersSnap.forEach(orderSnap => {
        const order = orderSnap.val();

        if (order.paymentType === "UPI") totalUPI += order.orderTotal;
        if (order.paymentType === "CASH") totalCash += order.orderTotal;

        Object.values(order.items || {}).forEach(item => {
          const itemId = item.itemId;
          const qty = item.quantity || item.qty || 0;
        
          itemsSold[itemId] = (itemsSold[itemId] || 0) + qty;
        });
        
      });

      const resultItems = [];

      for (const itemId of Object.keys(itemsSold)) {
        const [stockSnap, priceSnap] = await Promise.all([
          db.ref(`khokhaItems/${itemId}/stock/${storeId}`).once("value"),
          db.ref(`khokhaItems/${itemId}/price`).once("value")
        ]);

        const stock = stockSnap.val();
        const price = priceSnap.val();
        const soldQty = itemsSold[itemId];
        const closingStock = stock.openingLimit - soldQty;

        resultItems.push({
          itemId,
          price,
          soldQty,
          totalAmount: soldQty * price,

          openingLimit: stock.openingLimit,
          currentLimit: stock.limit,
          closingStock,

          replenishQty:
            stock.limit > closingStock ? stock.limit - closingStock : 0,
          collectBackQty:
            stock.limit < closingStock ? closingStock - stock.limit : 0
        });
      }

      const aggregatedOrder = {
        date,
        storeId,
        items: resultItems,
        payments: {
          totalUPICollection: totalUPI,
          totalCashCollection: totalCash
        },
        generatedAt: Date.now()
      };

      //this is for khokha to view a realtime view of aggregated total.
      if(operation === "view"){
        return res.json({
          status: "SUCCESS",
          message: "Aggregated order generated",
          aggregatedOrder
        });
      }

      await db
        .ref(`khokhaAggregatedOrders/${date}/${storeId}`)
        .set(aggregatedOrder);

      return res.json({
        status: "SUCCESS",
        message: "Aggregated order generated",
        path: `khokhaAggregatedOrders/${date}/${storeId}`
      });

    } catch (e) {
      console.error(e);
      return res.status(500).json({
        error: "Internal server error "+e.message
      });
    }
  }
);

exports.getAggregatedStoreParchiByDate = functions.https.onRequest(
  (req, res) => {
    cors(req, res, async () => {
      try {
        // Allow only POST
        if (req.method !== "POST") {
          return res.status(405).json({ error: "Method not allowed" });
        }

        const { date } = req.body;

        if (!date) {
          return res.status(400).json({
            error: "date is required (YYYY-MM-DD)"
          });
        }

        const db = admin.database();

        const snap = await db
          .ref(`khokhaAggregatedOrders/${date}`)
          .once("value");

        if (!snap.exists()) {
          return res.json({
            date,
            stores: []
          });
        }

        const stores = Object.keys(snap.val());

        return res.json({
          date,
          stores
        });

      } catch (err) {
        console.error(err);
        return res.status(500).json({
          error: "Internal server error"
        });
      }
    });
  }
);









