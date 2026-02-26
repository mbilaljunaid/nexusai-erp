const http = require('http');

http.get('http://localhost:5002/api/ap/invoices', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const invoices = JSON.parse(data).data;
        const inv = invoices.find(i => i.invoiceNumber.startsWith('INV-PO-'));
        if (!inv) return console.log("Not found");
        console.log("Validating Invoice:", inv.id);
        
        const req = http.request({
            hostname: 'localhost',
            port: 5002,
            path: `/api/ap/invoices/${inv.id}/validate`,
            method: 'POST'
        }, (res2) => {
            let data2 = '';
            res2.on('data', chunk => data2 += chunk);
            res2.on('end', () => console.log("RES:", res2.statusCode, data2));
        });
        req.end();
    });
});
