// Global variables
let companies = [];
let invoices = [];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadDashboard();
    loadCompanies();
    loadInvoices();
});

// Navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    document.getElementById(sectionId).style.display = 'block';
    
    // Update active nav
    document.querySelectorAll('.list-group-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Load dashboard data
async function loadDashboard() {
    try {
        const [companiesRes, invoicesRes] = await Promise.all([
            fetch('/api/companies'),
            fetch('/api/invoices')
        ]);
        
        const companiesData = await companiesRes.json();
        const invoicesData = await invoicesRes.json();
        
        document.getElementById('totalCompanies').textContent = companiesData.length;
        document.getElementById('totalInvoices').textContent = invoicesData.length;
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Load companies
async function loadCompanies() {
    try {
        const response = await fetch('/api/companies');
        companies = await response.json();
        renderCompanies();
    } catch (error) {
        console.error('Error loading companies:', error);
    }
}

// Render companies list
function renderCompanies() {
    const container = document.getElementById('companiesList');
    container.innerHTML = '';
    
    companies.forEach(company => {
        const card = document.createElement('div');
        card.className = 'card mb-3';
        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${company.businessName}</h5>
                <p class="card-text">NIT: ${company.nit}</p>
                <p class="card-text">Email: ${company.email}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// Load invoices
async function loadInvoices() {
    try {
        const response = await fetch('/api/invoices');
        invoices = await response.json();
        renderInvoices();
    } catch (error) {
        console.error('Error loading invoices:', error);
    }
}

// Render invoices list
function renderInvoices() {
    const container = document.getElementById('invoicesList');
    container.innerHTML = '';
    
    invoices.forEach(invoice => {
        const card = document.createElement('div');
        card.className = 'card mb-3';
        card.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h5 class="card-title">${invoice.number}</h5>
                        <p class="card-text">Customer: ${invoice.customer.name}</p>
                        <p class="card-text">Total: $${invoice.total.toLocaleString()}</p>
                        <span class="badge bg-${getStatusColor(invoice.dianStatus)}">${invoice.dianStatus}</span>
                        ${invoice.cufe ? `<br><small class="text-muted">CUFE: ${invoice.cufe}</small>` : ''}
                    </div>
                    <div>
                        ${invoice.dianStatus === 'pending' ? 
                            `<button class="btn btn-success btn-sm" onclick="sendToDian('${invoice._id}')">
                                <i class="fas fa-paper-plane me-1"></i>Send to DIAN
                            </button>` : 
                            `<button class="btn btn-secondary btn-sm" disabled>
                                <i class="fas fa-check me-1"></i>Sent
                            </button>`
                        }
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function getStatusColor(status) {
    const colors = {
        'pending': 'warning',
        'sent': 'info',
        'approved': 'success',
        'rejected': 'danger'
    };
    return colors[status] || 'secondary';
}

// Placeholder functions for modals
function showCreateCompanyModal() {
    alert('Company creation modal - Coming soon!');
}

function showCreateInvoiceModal() {
    alert('Invoice creation modal - Coming soon!');
}

// Send invoice to DIAN
async function sendToDian(invoiceId) {
    if (!confirm('Are you sure you want to send this invoice to DIAN?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/invoices/${invoiceId}/send-to-dian`, {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Invoice sent successfully to DIAN!');
            loadInvoices(); // Refresh the list
            loadDashboard(); // Update dashboard
        } else {
            alert('Error sending invoice to DIAN: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        alert('Error sending invoice: ' + error.message);
    }
}