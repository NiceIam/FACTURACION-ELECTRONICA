const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Company = require('../models/Company');

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('issuer')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new invoice
router.post('/', async (req, res) => {
  try {
    const company = await Company.findById(req.body.issuer);
    if (!company) {
      return res.status(400).json({ error: 'Company not found' });
    }

    // Generate invoice number (simple counter for now)
    const lastInvoice = await Invoice.findOne({ issuer: req.body.issuer })
      .sort({ createdAt: -1 });
    
    let nextNumber = 1;
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.number.replace(/\D/g, ''));
      nextNumber = lastNumber + 1;
    }

    const invoiceNumber = `INV-${nextNumber.toString().padStart(6, '0')}`;

    const invoice = new Invoice({
      ...req.body,
      number: invoiceNumber
    });

    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get invoice by ID
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('issuer');
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;