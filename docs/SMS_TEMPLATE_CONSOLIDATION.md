# SMS Template System Consolidation

## Overview

This document explains the consolidation of the SMS template system with the unified Notification Template system. The goal is to have a single, unified system for managing both email and SMS templates.

## Key Differences

### Old SMS Template System
- **Collection**: `sms_templates`
- **Model**: `SMSTemplate` (Mongoose)
- **Admin UI**: `/admin/sms-templates`
- **Service**: `lib/notifications/sms-template-service.ts`
- **Template Syntax**: `{{variable}}` (simple replacement)
- **Features**: Separate management, event types, variables

### New Unified Notification Template System
- **Collection**: `notification_templates`
- **Model**: `NotificationTemplate` (Mongoose)
- **Admin UI**: `/admin/notification-templates`
- **Service**: `lib/notifications/templated-notifications.ts`
- **Template Syntax**: Handlebars `{{variable}}` (supports conditionals, loops)
- **Features**: Unified for email and SMS, locale support, better template engine

## What Changed

### 1. SMS Functions Updated
All SMS sending functions in `lib/notifications/sms.ts` now use the unified system:
- `sendOrderConfirmationSMS()` → Uses `sendTemplatedSMS("order_confirmation", ...)`
- `sendPaymentConfirmationSMS()` → Uses `sendTemplatedSMS("payment_confirmation", ...)`
- `sendOrderShippedSMS()` → Uses `sendTemplatedSMS("order_shipped", ...)`
- `sendOrderDeliveredSMS()` → Uses `sendTemplatedSMS("order_delivered", ...)`
- `sendOTPSMS()` → Uses `sendTemplatedSMS("otp", ...)`

### 2. Backward Compatibility
The old `sms-template-service.ts` now checks the unified system as a fallback:
1. First checks old `sms_templates` collection
2. Falls back to unified `notification_templates` collection
3. Finally uses default templates

This ensures existing code using `renderSMSMessage()` continues to work.

### 3. Migration Script
A migration script is available to move existing SMS templates to the unified system:
```bash
yarn migrate:sms-templates
```

This script:
- Reads all templates from `sms_templates` collection
- Converts them to `NotificationTemplate` format
- Skips templates that already exist in the unified system
- Preserves metadata (createdAt, updatedAt, updatedBy)

## Event Type Mapping

The unified system uses string event types (same as email), while the old system used an enum. The mapping is straightforward:

| Old SMSEventType | New Event String |
|-----------------|------------------|
| `ORDER_CONFIRMATION` | `"order_confirmation"` |
| `PAYMENT_CONFIRMATION` | `"payment_confirmation"` |
| `ORDER_SHIPPED` | `"order_shipped"` |
| `ORDER_DELIVERED` | `"order_delivered"` |
| `OTP` | `"otp"` |
| ... | ... |

## Benefits of Consolidation

1. **Single Source of Truth**: One system for all notification templates
2. **Consistency**: Same template engine (Handlebars) for email and SMS
3. **Better Features**: Handlebars supports conditionals, loops, helpers
4. **Locale Support**: Built-in internationalization support
5. **Easier Management**: One admin UI instead of two
6. **Unified API**: Same API patterns for email and SMS

## Migration Guide

### For Developers

1. **Update SMS Sending Code**:
   ```typescript
   // Old way (still works, but deprecated)
   import { sendOrderConfirmationSMS } from "@/lib/notifications/sms";
   await sendOrderConfirmationSMS(phone, orderNumber, context);
   
   // New way (recommended)
   import { sendTemplatedSMS } from "@/lib/notifications/templated-notifications";
   await sendTemplatedSMS("order_confirmation", {
     phone,
     name: "Customer",
     orderNumber,
     orderTotal: "100.00",
     currency: "GHS",
     itemCount: 3,
   });
   ```

2. **Update Template Management**:
   - Use `/admin/notification-templates` instead of `/admin/sms-templates`
   - Select "SMS" as the channel when creating templates
   - Use the same event names as email templates

### For Admins

1. **Run Migration** (if you have existing SMS templates):
   ```bash
   yarn migrate:sms-templates
   ```

2. **Use Unified Admin UI**:
   - Navigate to `/admin/notification-templates`
   - Filter by channel: "SMS" to see only SMS templates
   - Create/edit templates for both email and SMS in one place

3. **Old Admin UI Still Works**:
   - `/admin/sms-templates` still works for backward compatibility
   - However, new templates should be created in the unified system

## Default Templates

The unified system includes default templates for common events. These are used as fallbacks if no custom template is found in the database:

- `order_confirmation`
- `payment_confirmation`
- `order_shipped`
- `order_delivered`
- `otp`
- `password_reset`
- `support_ticket_created`
- `support_ticket_status_update`
- `support_ticket_response`

## Template Variables

SMS templates use the same variable syntax as email templates (Handlebars):
- `{{name}}` - Customer name
- `{{orderNumber}}` - Order number
- `{{orderTotal}}` - Order total amount
- `{{currency}}` - Currency code
- `{{trackingNumber}}` - Shipping tracking number
- `{{otp}}` - One-time password
- `{{expiryMinutes}}` - OTP expiry time
- And more...

## SMS Length Validation

SMS messages are automatically validated and truncated to 160 characters if they exceed the limit. A warning is logged when truncation occurs.

## Backward Compatibility

The old SMS template system is maintained for backward compatibility:
- Old admin UI (`/admin/sms-templates`) still works
- Old API endpoints still work
- Old service functions still work (with fallback to unified system)

However, **new development should use the unified system**.

## Future Plans

1. **Deprecation**: The old SMS template system will be deprecated in a future version
2. **Removal**: After a grace period, the old system will be removed
3. **Migration**: All existing templates should be migrated to the unified system

## Questions?

If you have questions or encounter issues:
1. Check this documentation
2. Review the migration script: `scripts/migrate-sms-templates.ts`
3. Check the unified template service: `lib/notifications/templated-notifications.ts`
