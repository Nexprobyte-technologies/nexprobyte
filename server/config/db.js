import mongoose from "mongoose";
import net from "net";

function checkPortOpen(host, port, timeout = 1000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let status = false;

    socket.setTimeout(timeout);
    socket.on("connect", () => {
      status = true;
      socket.destroy();
    });
    socket.on("timeout", () => {
      socket.destroy();
    });
    socket.on("error", () => {
      socket.destroy();
    });
    socket.on("close", () => {
      resolve(status);
    });

    socket.connect(port, host);
  });
}

export async function connectDB() {
  const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/nexprobyte";

  // Fast TCP check to prevent Mongoose driver socket timeout from shutting down the Node event loop
  try {
    const urlParts = mongoURI.replace("mongodb://", "").split("/")[0].split(":");
    const host = urlParts[0] || "127.0.0.1";
    const port = parseInt(urlParts[1] || "27017", 10);

    const isOpen = await checkPortOpen(host, port, 800);
    if (!isOpen) {
      console.warn(`[MongoDB Warning]: Could not connect to MongoDB at ${mongoURI}. Fallback storage active.`);
      return false;
    }
  } catch (e) {
    // Fallback if parsing fails
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
    return true;
  } catch (err) {
    console.warn(`[MongoDB Warning]: Could not connect to MongoDB at ${mongoURI}. Fallback storage active.`);
    return false;
  }
}
