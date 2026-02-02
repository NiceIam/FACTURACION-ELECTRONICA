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
        
        // Update dashboard statistics
        document.getElementById('totalCompanies').textContent = companiesData.length;
        document.getElementById('totalInvoices').textContent = invoicesData.length;
        
        // Calculate approved invoices
        const approvedCount = invoicesData.filter(inv => inv.dianStatus === 'approved').length;
        document.getElementById('approvedInvoices').textContent = approvedCount;
        
        // Add fade-in animation
        document.querySelectorAll('.dashboard-card').forEach(card => {
            card.classList.add('fade-in');
        });
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
    
    if (companies.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-building fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No companies registered</h5>
                <p class="text-muted">Start by adding your first company</p>
            </div>
        `;
        return;
    }
    
    companies.forEach(company => {
        const card = document.createElement('div');
        card.className = 'card company-card mb-3 fade-in';
        card.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h5 class="card-title">
                            <i class="fas fa-building text-primary me-2"></i>
                            ${company.businessName}
                        </h5>
                        <p class="card-text mb-1">
                            <strong>NIT:</strong> ${company.nit}
                        </p>
                        <p class="card-text mb-1">
                            <strong>Email:</strong> ${company.email}
                        </p>
                        ${company.phone ? `<p class="card-text mb-0"><strong>Phone:</strong> ${company.phone}</p>` : ''}
                    </div>
                    <span class="badge bg-success">Active</span>
                </div>
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
    
    if (invoices.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-file-invoice fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No invoices created</h5>
                <p class="text-muted">Create your first electronic invoice</p>
            </div>
        `;
        return;
    }
    
    invoices.forEach(invoice => {
        const card = document.createElement('div');
        card.className = 'card invoice-card mb-3 fade-in';
        card.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h5 class="card-title">
                            <i class="fas fa-file-invoice text-primary me-2"></i>
                            ${invoice.number}
                        </h5>
                        <p class="card-text mb-1">
                            <strong>Customer:</strong> ${invoice.customer.name}
                        </p>
                        <p class="card-text mb-1">
                            <strong>NIT:</strong> ${invoice.customer.nit}
                        </p>
                        <p class="card-text mb-2">
                            <strong>Total:</strong> $${invoice.total.toLocaleString()} ${invoice.currency}
                        </p>
                        <div class="d-flex align-items-center gap-2">
                            <span class="badge status-${invoice.dianStatus}">${invoice.dianStatus.toUpperCase()}</span>
                            ${invoice.cufe ? `<small class="text-muted">CUFE: ${invoice.cufe.substring(0, 10)}...</small>` : ''}
                        </div>
                    </div>
                    <div class="text-end">
                        <small class="text-muted d-block mb-2">
                            ${new Date(invoice.issueDate).toLocaleDateString()}
                        </small>
                        ${invoice.dianStatus === 'pending' ? 
                            `<button class="btn btn-success btn-sm btn-action" onclick="sendToDian('${invoice._id}')">
                                <i class="fas fa-paper-plane me-1"></i>Send to DIAN
                            </button>` : 
                            `<button class="btn btn-outline-secondary btn-sm" disabled>
                                <i class="fas fa-check me-1"></i>Processed
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