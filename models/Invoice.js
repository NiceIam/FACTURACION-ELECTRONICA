const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true
  },
  issueDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Company reference
  issuer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  
  // Customer info
  customer: {
    nit: { type: String, required: true },
    name: { type: String, required: true },
    email: String,
    address: {
      street: String,
      city: String,
      department: String
    }
  },
  
  // Invoice items
  items: [{
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    taxRate: { type: Number, default: 19 }, // IVA 19%
    taxAmount: Number,
    totalAmount: Number
  }],
  
  // Totals
  subtotal: { type: Number, required: true },
  totalTax: { type: Number, required: true },
  total: { type: Number, required: true },
  
  // DIAN status
  dianStatus: {
    type: String,
    enum: ['pending', 'sent', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // DIAN fields
  cufe: String, // Código Único de Facturación Electrónica
  
  currency: { type: String, default: 'COP' }
}, {
  timestamps: true
});

// Calculate totals before saving
invoiceSchema.pre('save', function(next) {
  let subtotal = 0;
  let totalTax = 0;
  
  this.items.forEach(item => {
    const itemSubtotal = item.quantity * item.unitPrice;
    const itemTax = itemSubtotal * (item.taxRate / 100);
    
    item.taxAmount = itemTax;
    item.totalAmount = itemSubtotal + itemTax;
    
    subtotal += itemSubtotal;
    totalTax += itemTax;
  });
  
  this.subtotal = subtotal;
  this.totalTax = totalTax;
  this.total = subtotal + totalTax;
  
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);