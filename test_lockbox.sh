curl -X POST http://0.0.0.0:5002/api/ar/lockbox/batches \
-H "Content-Type: application/json" \
-d '{
    "batchData": {
        "batchDate": "2024-03-01T00:00:00.000Z",
        "bankAccountId": "019488e0-6a0b-71ff-80c1-be5617a23c34",
        "currencyCode": "USD",
        "totalAmount": "15500",
        "itemCount": 2
    },
    "itemsData": [
        {
            "checkNumber": "CHK101",
            "remittanceRef": "INV-GLO-001",
            "payerName": "Globex Corporation",
            "amount": "2500",
            "itemDate": "2024-03-01T00:00:00.000Z"
        },
        {
            "checkNumber": "CHK102",
            "remittanceRef": "INV-INI-002",
            "payerName": "Initech LLC",
            "amount": "13000",
            "itemDate": "2024-03-01T00:00:00.000Z"
        }
    ]
}'

echo ""
echo "Fetching summary..."
curl -X GET http://0.0.0.0:5002/api/ar/lockbox/summary
echo ""
