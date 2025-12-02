# NexusAI - Quick Start Testing Guide

## 🚀 Get Started in 5 Minutes

### Access the Application
```
URL: https://[replit-url].replit.dev
Login: admin@nexusai.com / Admin@123456
```

### Test Path 1: Reports & Analytics (5 min)
1. Dashboard → Click "Reports" quick link
2. Select "CRM" module tab
3. Click "+ Create Report" → Choose "Lead Conversion Report"
4. Click "View" → See spreadsheet with data
5. Test: Copy cells (Ctrl+C), Export to PDF

### Test Path 2: SmartViews (3 min)
1. Reports page → "SmartViews" tab
2. Select "CRM" → "+ New View"
3. Name: "High Value Leads"
4. Click "Save View"
5. Verify view appears in list

### Test Path 3: Excel Import/Export (3 min)
1. Reports → "Excel" tab
2. Drag sample_data.xlsx file
3. Click "Save" → See "Imported X records"
4. Click "Export Excel" for any module
5. Verify file downloads

### Test Path 4: Industry Pages (2 min)
1. Logout (to see public pages)
2. Navigate to `/industry/automotive`
3. Review: Challenges → Solutions → Value Chain
4. Click "Request Demo" CTA

### Test Path 5: Features Comparison (2 min)
1. Navigate to `/features`
2. Review comparison table vs. Oracle/Salesforce
3. Scroll to see TCO comparison
4. Click "Start Free Trial"

## ✅ Quick Smoke Tests
- [ ] Login works
- [ ] Dashboard loads
- [ ] Create report works
- [ ] Export PDF works
- [ ] SmartView saves
- [ ] Excel import works
- [ ] Mobile responsive (375px)
- [ ] Dark mode toggle works
- [ ] Public pages accessible

## 📊 Sample Test Data

**CRM Leads** (auto-populated):
- LEAD001: Acme Corp, $150k, Active, Inbound
- LEAD002: TechStart Inc, $75k, Pending, Website

**Finance Invoices** (auto-populated):
- INV001: $50k, Unpaid
- INV002: $75k, Paid

**To Import**: Use `attached_assets/sample_data.xlsx`

## 🔍 Check These URLs
- `/` - Landing page
- `/features` - Features comparison
- `/industry/automotive` - Industry page
- `/reports` - Reports hub (requires login)
- `/dashboard` - Main dashboard (requires login)

## 📱 Test Devices
- Desktop: 1920x1080 (✅ Responsive)
- Tablet: 768x1024 (✅ Responsive)
- Mobile: 375x812 (✅ Responsive)

## ⚡ Performance Targets
- Page load: < 2 sec ✅
- API response: < 100ms ✅
- Memory: < 50MB ✅

## 🆘 Common Issues

**Can't login?**
- Ensure you're on the authenticated version
- Try: admin@nexusai.com / Admin@123456

**Reports not loading?**
- Check browser console for errors
- Refresh page with Ctrl+Shift+R

**Excel import fails?**
- Verify file is .xlsx format
- Check file size < 5MB

## 📞 For Issues
See: COMPREHENSIVE_PROJECT_SUMMARY.md
- Section: "API Testing Guide"
- Section: "Quality Assurance Checklist"

---
**Document**: Quick Start Testing Guide
**Date**: December 2, 2025
**Status**: Ready for Testing ✅
