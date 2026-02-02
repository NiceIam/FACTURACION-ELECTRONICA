const axios = require('axios');
const xml2js = require('xml2js');

class DianService {
  constructor() {
    this.baseURL = process.env.DIAN_ENVIRONMENT === 'production' 
      ? process.env.DIAN_PROD_URL 
      : process.env.DIAN_TEST_URL;
  }

  /**
   * Generate UBL 2.1 XML for invoice
   */
  generateUBLXML(invoice, company) {
    const builder = new xml2js.Builder({
      rootName: 'Invoice',
      xmldec: { version: '1.0', encoding: 'UTF-8' }
    });

    const ublData = {
      $: {
        'xmlns': 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
        'xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
        'xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2'
      },
      'cbc:UBLVersionID': '2.1',
      'cbc:ID': invoice.number,
      'cbc:IssueDate': invoice.issueDate.toISOString().split('T')[0],
      'cbc:DocumentCurrencyCode': invoice.currency,
      
      // Supplier (Company)
      'cac:AccountingSupplierParty': {
        'cac:Party': {
          'cac:PartyIdentification': {
            'cbc:ID': company.nit
          },
          'cac:PartyName': {
            'cbc:Name': company.businessName
          }
        }
      },
      
      // Customer
      'cac:AccountingCustomerParty': {
        'cac:Party': {
          'cac:PartyIdentification': {
            'cbc:ID': invoice.customer.nit
          },
          'cac:PartyName': {
            'cbc:Name': invoice.customer.name
          }
        }
      },
      
      // Invoice lines
      'cac:InvoiceLine': invoice.items.map((item, index) => ({
        'cbc:ID': index + 1,
        'cbc:InvoicedQuantity': item.quantity,
        'cbc:LineExtensionAmount': {
          $: { currencyID: invoice.currency },
          _: item.totalAmount
        },
        'cac:Item': {
          'cbc:Description': item.description
        },
        'cac:Price': {
          'cbc:PriceAmount': {
            $: { currencyID: invoice.currency },
            _: item.unitPrice
          }
        }
      })),
      
      // Totals
      'cac:LegalMonetaryTotal': {
        'cbc:LineExtensionAmount': {
          $: { currencyID: invoice.currency },
          _: invoice.subtotal
        },
        'cbc:TaxInclusiveAmount': {
          $: { currencyID: invoice.currency },
          _: invoice.total
        },
        'cbc:PayableAmount': {
          $: { currencyID: invoice.currency },
          _: invoice.total
        }
      }
    };

    return builder.buildObject(ublData);
  }

  /**
   * Send invoice to DIAN (mock implementation)
   */
  async sendInvoiceToDian(xmlContent, invoice) {
    try {
      // Mock DIAN response for development
      console.log('Sending invoice to DIAN:', invoice.number);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful response
      return {
        isValid: true,
        statusCode: '00',
        statusDescription: 'Documento validado correctamente',
        cufe: this.generateCUFE(invoice),
        xmlResponse: '<Response>Success</Response>'
      };
    } catch (error) {
      throw new Error(`Error sending to DIAN: ${error.message}`);
    }
  }

  /**
   * Generate CUFE (mock implementation)
   */
  generateCUFE(invoice) {
    const crypto = require('crypto');
    const cufeString = `${invoice.number}${invoice.issueDate}${invoice.total}`;
    return crypto.createHash('sha1').update(cufeString).digest('hex').substring(0, 20);
  }
}

module.exports = new DianService();