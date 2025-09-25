# Backend API Requirements for SureBank Mobile App

This document outlines the backend API endpoints required for the SureBank mobile application to function properly with payment services.

## Payment Service Endpoints

### 1. Get Banks List
**Endpoint:** `GET /payments/banks`

**Purpose:** Fetch list of available banks for withdrawal operations

**Implementation Details:**
- The backend should fetch banks from Paystack API
- Paystack endpoint: `https://api.paystack.co/bank?currency=NGN`
- Required header: `Authorization: Bearer YOUR_PAYSTACK_SECRET_KEY`

**Expected Response Format:**
```json
[
  {
    "name": "Access Bank",
    "code": "044",
    "active": true,
    "country": "Nigeria",
    "currency": "NGN",
    "type": "nuban",
    "id": 1,
    "slug": "access-bank",
    "longcode": "044150149"
  }
  // ... more banks
]
```

### 2. Verify Bank Account
**Endpoint:** `POST /payments/verify-bank-account`

**Purpose:** Verify bank account details before processing withdrawals

**Request Body:**
```json
{
  "bankCode": "044",
  "accountNumber": "1234567890"
}
```

**Implementation Details:**
- The backend should verify account using Paystack API
- Paystack endpoint: `https://api.paystack.co/bank/resolve`
- Query parameters: `account_number={accountNumber}&bank_code={bankCode}`
- Required header: `Authorization: Bearer YOUR_PAYSTACK_SECRET_KEY`

**Expected Response Format:**
```json
{
  "accountName": "John Doe",
  "accountNumber": "1234567890",
  "bankId": 1,
  "bankCode": "044"
}
```

**Paystack API Response (for reference):**
```json
{
  "status": true,
  "message": "Account number resolved",
  "data": {
    "account_number": "1234567890",
    "account_name": "JOHN DOE",
    "bank_id": 1
  }
}
```

## Security Considerations

1. **API Keys Security:**
   - Never expose Paystack secret keys in frontend applications
   - Store all sensitive keys in backend environment variables
   - Use secure key management systems in production

2. **Rate Limiting:**
   - Implement rate limiting on these endpoints to prevent abuse
   - Consider caching bank list responses as they don't change frequently

3. **Authentication:**
   - These endpoints should require user authentication
   - Validate user permissions before processing requests

4. **Error Handling:**
   - Return appropriate error messages without exposing sensitive information
   - Log errors for monitoring and debugging

## Implementation Example (Node.js/Express)

```javascript
// Get banks list
app.get('/payments/banks', authenticateUser, async (req, res) => {
  try {
    const response = await axios.get('https://api.paystack.co/bank?currency=NGN', {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });

    if (response.data && response.data.status) {
      return res.json(response.data.data);
    }

    return res.status(500).json({ error: 'Failed to fetch banks' });
  } catch (error) {
    console.error('Error fetching banks:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify bank account
app.post('/payments/verify-bank-account', authenticateUser, async (req, res) => {
  const { bankCode, accountNumber } = req.body;

  if (!bankCode || !accountNumber) {
    return res.status(400).json({ error: 'Bank code and account number are required' });
  }

  try {
    const response = await axios.get(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    if (response.data && response.data.status) {
      const { account_name, account_number, bank_id } = response.data.data;
      return res.json({
        accountName: account_name,
        accountNumber: account_number,
        bankId: bank_id,
        bankCode
      });
    }

    return res.status(400).json({ error: 'Could not verify account' });
  } catch (error) {
    console.error('Error verifying bank account:', error);

    if (error.response?.status === 422) {
      return res.status(400).json({ error: 'Invalid account details' });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
});
```

## Testing

1. **Test with valid Nigerian bank accounts**
2. **Test error scenarios:**
   - Invalid bank codes
   - Invalid account numbers
   - Network failures
   - Rate limiting

## Notes

- The mobile app currently has the frontend implementation ready in `/src/services/api/payments.ts`
- The endpoints are already being called by the mobile app
- This implementation ensures security by keeping sensitive keys on the backend only