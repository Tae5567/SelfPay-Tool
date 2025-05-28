// src/utils/ecw-service.ts
import axios from 'axios';

export class ECWService {
  private baseUrl: string;
  private username: string;
  private password: string;
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    // Usually the login URL followed by /api or /services or similar
    this.baseUrl = process.env.ECW_API_URL || '';
    this.username = process.env.ECW_USERNAME || '';
    this.password = process.env.ECW_PASSWORD || '';
  }

  // Authentication - modify this based on actual ECW authentication endpoints
  private async authenticate(): Promise<string> {
    if (this.token && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.token;
    }

    try {
      // This endpoint may be different for your ECW instance
      const response = await axios.post(`${this.baseUrl}/auth`, {
        username: this.username,
        password: this.password
      });

      if (response.data && response.data.token) {
        this.token = response.data.token;
        
        // Set token expiry (typically 1 hour)
        const expiryTime = new Date();
        expiryTime.setHours(expiryTime.getHours() + 1);
        this.tokenExpiry = expiryTime;
        
        return this.token;
      } else {
        throw new Error('Authentication failed: No token received');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      throw new Error(`Failed to authenticate with eClinicalWorks: ${error.message}`);
    }
  }

  // Post a payment to eClinicalWorks
  async postPayment(paymentData: {
    patientId: string;
    amount: number;
    paymentMethod: string;
    dateOfService: string;
    services: any[];
    notes?: string;
  }): Promise<any> {
    try {
      const token = await this.authenticate();

      // Format the payload based on ECW requirements
      // From your screenshots, we need to format this correctly for ECW
      const payload = {
        patientId: paymentData.patientId,
        amount: paymentData.amount,
        paymentMethod: this.mapPaymentMethod(paymentData.paymentMethod),
        dateOfService: paymentData.dateOfService,
        // Format services according to ECW expectations
        services: paymentData.services.map(service => ({
          serviceCode: service.billing_code,
          description: service.name,
          amount: service.price,
          dateOfService: paymentData.dateOfService
        })),
        notes: paymentData.notes || 'Payment collected through Self-Pay Tool'
      };

      // Endpoint to post payments - adjust based on actual ECW API
      const response = await axios.post(
        `${this.baseUrl}/patients/${paymentData.patientId}/payments`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Payment posting error:', error);
      throw new Error(`Failed to post payment: ${error.message}`);
    }
  }

  // Map payment methods to ECW expected values
  private mapPaymentMethod(method: string): string {
    // From your screenshots, these appear to be the ECW values
    const methodMap: { [key: string]: string } = {
      'CREDIT_CARD': 'Credit Card',
      'CASH': 'Cash',
      'CHECK': 'Check',
      'OTHER': 'Other'
    };

    return methodMap[method] || 'Other';
  }

  // Search for patients
  async searchPatients(searchTerm: string): Promise<any[]> {
    try {
      const token = await this.authenticate();

      // Endpoint for patient search - adjust based on actual ECW API
      const response = await axios.get(
        `${this.baseUrl}/patients/search`,
        {
          params: { q: searchTerm },
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Format the response to match your expected structure
      return response.data.results.map((patient: any) => ({
        id: patient.patientId,
        name: `${patient.firstName} ${patient.lastName}`,
        dob: patient.dateOfBirth,
        lastVisit: patient.lastVisitDate
      }));
    } catch (error) {
      console.error('Patient search error:', error);
      return []; // Return empty array on error
    }
  }
}

// Export singleton instance
export const ecwService = new ECWService();
export default ecwService;