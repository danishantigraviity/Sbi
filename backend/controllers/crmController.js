const Lead = require('../models/Lead');
const CallQueue = require('../models/CallQueue');
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const pdf = require('pdf-parse');
const fs = require('fs');

exports.bulkUploadLeads = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let leadsData = [];
    const filePath = req.file.path;

    if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        req.file.mimetype === 'application/vnd.ms-excel') {
      
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rawData = xlsx.utils.sheet_to_json(sheet);
      
      leadsData = rawData.map(row => ({
        name: row.Name || row.name || 'Unknown',
        phone: String(row.Phone || row.phone || row.Contact || ''),
        email: row.Email || row.email || '',
        address: row.Address || row.address || 'Uploaded via Excel'
      }));

    } else if (req.file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      
      // Simple regex-based extraction for PDF (Name and Phone)
      // This is a basic implementation and might need tuning based on PDF layout
      const lines = data.text.split('\n').filter(line => line.trim() !== '');
      leadsData = lines.map(line => {
        const phoneMatch = line.match(/(\+?\d{10,12})/);
        if (phoneMatch) {
          const namePart = line.replace(phoneMatch[0], '').trim();
          return {
            name: namePart || 'PDF Lead',
            phone: phoneMatch[0],
            email: '',
            address: 'Uploaded via PDF'
          };
        }
        return null;
      }).filter(l => l !== null);
    }

    // Clean up temporary file
    fs.unlinkSync(filePath);

    if (leadsData.length === 0) {
      return res.status(400).json({ message: 'No valid leads found in file' });
    }

    const savedLeads = [];
    for (const leadInfo of leadsData) {
      if (!leadInfo.phone) continue;

      const newLead = new Lead({
        ...leadInfo,
        sellerId: req.user.id,
        status: 'new'
      });
      await newLead.save();

      const queueItem = new CallQueue({
        leadId: newLead._id,
        sellerId: req.user.id,
        phoneNumber: leadInfo.phone,
        status: 'pending'
      });
      await queueItem.save();
      
      savedLeads.push(newLead);
    }

    res.status(201).json({ 
      message: `Successfully imported ${savedLeads.length} leads and queued them for calling.`,
      count: savedLeads.length 
    });

  } catch (err) {
    console.error('Bulk upload error:', err);
    res.status(500).json({ message: 'Server error during lead ingestion' });
  }
};

exports.getQueueStatus = async (req, res) => {
  try {
    const queue = await CallQueue.find({ sellerId: req.user.id })
      .populate('leadId')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(queue);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch queue status' });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const stats = await CallQueue.aggregate([
      { $match: { sellerId: new mongoose.Types.ObjectId(req.user.id.toString()) } },
      { $group: {
          _id: '$status',
          count: { $sum: 1 }
      }}
    ]);

    const totalCalls = await CallQueue.countDocuments({ sellerId: req.user.id });
    const successCount = await CallQueue.countDocuments({ sellerId: req.user.id, status: 'completed' });

    res.json({
      distribution: stats,
      totalCalls,
      successRate: totalCalls > 0 ? (successCount / totalCalls * 100).toFixed(2) : 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};
