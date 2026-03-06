require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const PDFDocument = require('pdfkit'); // 🔥 WAYBILL PDF GENERATOR (ADDED)

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

/* =========================================================
   🔒 SECURITY UPGRADE — ADMIN AUTH MIDDLEWARE (ADDED)
   Protects ALL /api/admin/* routes automatically
   ========================================================= */

app.use('/api/admin', (req, res, next) => {
  if (req.headers.authorization !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  next();
});

// Test route
app.get('/', (req, res) => {
  res.send('BlueRoute API is running 🚀');
});

// 🔥 HEALTH CHECK ENDPOINT (ADDED - NO OTHER CODE CHANGED)
app.get('/health', (req, res) => {
  res.json({ status: "ok" });
});

// 🔥 RAILWAY HEALTH CHECK ENDPOINT (ADDED - REQUIRED FOR STABILITY)
app.get('/healthz', (req, res) => {
  res.status(200).send("OK");
});

// Database test route
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      connected: true,
      time: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      connected: false,
      error: error.message
    });
  }
});

// Track shipment
app.get('/api/track/:trackingNumber', async (req, res) => {
  const { trackingNumber } = req.params;

  try {
    const shipmentResult = await pool.query(
      'SELECT * FROM shipments WHERE tracking_number = $1',
      [trackingNumber]
    );

    if (shipmentResult.rows.length === 0) {
      return res.status(404).json({ found: false });
    }

    const shipment = shipmentResult.rows[0];

    const scansResult = await pool.query(
      'SELECT location, remark, scanned_at FROM scan_events WHERE shipment_id = $1 ORDER BY scanned_at DESC',
      [shipment.id]
    );

    res.json({
      found: true,
      shipment,
      scan_history: scansResult.rows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

/* =========================================================
   🔥 NEW ADMIN CREATE SHIPMENT ENDPOINT (UPGRADED)
   ========================================================= */

app.post('/api/admin/create-shipment', async (req, res) => {

  if (req.headers.authorization !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const {
    senderName,
    senderAddress,
    senderPhone,
    senderEmail,
    receiverName,
    receiverAddress,
    receiverPhone,
    receiverEmail,
    origin,
    destination,
    shipmentName,
    weight,
    itemsSent,
    boxCount,
    sentDate,
    estimatedDelivery,
    remarks
  } = req.body;

  try {

    if (!origin || !destination) {
      return res.status(400).json({ error: "Origin and destination required" });
    }

    const trackingNumber = 'BR' + Date.now();

    const shipmentInsert = await pool.query(
      `INSERT INTO shipments 
      (tracking_number, origin, destination, status, last_updated)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id`,
      [trackingNumber, origin, destination, 'Shipment Created']
    );

    const shipmentId = shipmentInsert.rows[0].id;

    await pool.query(
      `INSERT INTO scan_events (shipment_id, location, remark, scanned_at)
       VALUES ($1, $2, $3, NOW())`,
      [shipmentId, origin, 'Shipment Created']
    );

    res.json({
      success: true,
      trackingNumber
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: 'Failed to create shipment'
    });
  }
});

/* =========================================================
   🔥 ADMIN SHIPMENT LIST ENDPOINT (ADDED FOR shipments.html)
   ========================================================= */

app.get('/api/admin/shipments', async (req, res) => {

  if (req.headers.authorization !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {

    const result = await pool.query(`
      SELECT 
        tracking_number AS tracking,
        status,
        origin,
        destination,
        last_updated
      FROM shipments
      WHERE archived = FALSE
      ORDER BY last_updated DESC
    `);

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to load shipments'
    });
  }
});

/* =========================================================
   🔥 ADMIN UPDATE SHIPMENT ENDPOINT (ADDED FOR update.html)
   ========================================================= */

app.post('/api/admin/update-shipment', async (req, res) => {

  if (req.headers.authorization !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { trackingNumber, status, location, remark } = req.body;

  try {

    const shipmentResult = await pool.query(
      'SELECT id FROM shipments WHERE tracking_number = $1',
      [trackingNumber]
    );

    if (shipmentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    const shipmentId = shipmentResult.rows[0].id;

    await pool.query(
      'UPDATE shipments SET status = $1, last_updated = NOW() WHERE id = $2',
      [status, shipmentId]
    );

    await pool.query(
      `INSERT INTO scan_events (shipment_id, location, remark, scanned_at)
       VALUES ($1, $2, $3, NOW())`,
      [shipmentId, location, remark]
    );

    res.json({
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Update failed'
    });
  }
});

/* =========================================================
   🔥 ADMIN ARCHIVE SHIPMENT ENDPOINT (REQUIRED)
   ========================================================= */

app.post('/api/admin/archive-shipment', async (req, res) => {

  if (req.headers.authorization !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { tracking } = req.body;

  try {

    await pool.query(
      'UPDATE shipments SET archived = TRUE WHERE tracking_number = $1',
      [tracking]
    );

    res.json({
      success: true
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Archive failed'
    });
  }
});

/* =========================================================
   🔥 ADMIN WAYBILL GENERATOR (PDF)  ← NEW REQUIRED FEATURE
   ========================================================= */

app.get('/api/admin/waybill/:trackingNumber', async (req, res) => {

  if (req.headers.authorization !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const { trackingNumber } = req.params;

  try {

    const result = await pool.query(
      'SELECT * FROM shipments WHERE tracking_number = $1',
      [trackingNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).send('Shipment not found');
    }

    const shipment = result.rows[0];

    const doc = new PDFDocument({ size: 'A6', margin: 20 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename=waybill-${trackingNumber}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(16).text('BlueRoute Express', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Tracking Number: ${shipment.tracking_number}`);
    doc.text(`Origin: ${shipment.origin}`);
    doc.text(`Destination: ${shipment.destination}`);
    doc.text(`Status: ${shipment.status}`);
    doc.text(`Last Update: ${shipment.last_updated}`);

    doc.moveDown();
    doc.text('Handle With Care', { align: 'center' });

    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).send('Waybill generation failed');
  }

});

// Start server (RAILWAY UPGRADE ONLY)
const PORT = process.env.PORT || 3000;

/* ============================================
📦 CREATE SHIPMENT ENDPOINT
Allows admin or system to create shipments
============================================ */

app.post('/api/shipments', async (req, res) => {
  try {

    const { tracking_number, origin, destination, status } = req.body;

    const result = await pool.query(
      `INSERT INTO shipments 
       (tracking_number, origin, destination, status, last_updated)
       VALUES ($1,$2,$3,$4,NOW())
       RETURNING *`,
      [tracking_number, origin, destination, status]
    );

    res.json(result.rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Failed to create shipment"
    });

  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ===============================
// CREATE SHIPMENT ENDPOINT
// ===============================

app.post('/api/shipments', async (req, res) => {
  try {

    const { tracking_number, origin, destination, status } = req.body;

    const result = await pool.query(
      `INSERT INTO shipments (tracking_number, origin, destination, status, last_updated)
       VALUES ($1,$2,$3,$4,NOW())
       RETURNING *`,
      [tracking_number, origin, destination, status]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create shipment" });
  }
});