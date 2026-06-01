/**
 * SMS Template Service
 * Handles fetching and rendering SMS templates from database
 */

import { getDb } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import { logger } from "@/lib/logger";
import {
  SMSEventType,
  renderSMSTemplate,
  DEFAULT_SMS_TEMPLATES,
  validateTemplateLength,
} from "./sms-templates";
import { getCache, setCache, deleteCache, CACHE_TTL } from "@/lib/cache/redis";

interface TemplateContext {
  [key: string]: any;
}

interface SMSTemplate {
  _id?: ObjectId;
  eventType: SMSEventType;
  name: string;
  message: string;
  variables: string[];
  status: "active" | "inactive";
  isDefault: boolean;
  usageCount: number;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: ObjectId;
}

/**
 * Get active template for event type (default if multiple exist)
 */
export async function getSMSTemplate(
  eventType: SMSEventType
): Promise<SMSTemplate | null> {
  const db = await getDb();

  // Check cache first
  const cacheKey = `sms_template:${eventType}`;
  const cached = await getCache<SMSTemplate>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from database - prefer default, then any active template
  const template = await db.collection<SMSTemplate>("sms_templates").findOne({
    eventType,
    status: "active",
    $or: [{ isDefault: true }, { isDefault: { $exists: false } }],
  });

  // If no default, get any active template
  const activeTemplate =
    template ||
    (await db.collection<SMSTemplate>("sms_templates").findOne({
      eventType,
      status: "active",
    }));

  if (activeTemplate) {
    // Cache for 1 hour
    await setCache(cacheKey, activeTemplate, CACHE_TTL.ADMIN_INFO);
    return activeTemplate;
  }

  return null;
}

/**
 * Render SMS message using template or fallback to default
 * Now also checks unified NotificationTemplate system for backward compatibility
 */
export async function renderSMSMessage(
  eventType: SMSEventType,
  context: TemplateContext
): Promise<string> {
  try {
    // First, try to get template from old SMS templates collection
    const template = await getSMSTemplate(eventType);

    if (template && template.message) {
      // Render template with context
      const rendered = renderSMSTemplate(template.message, context);

      // Validate length
      const validation = validateTemplateLength(rendered);
      if (!validation.valid) {
        logger.warn(`SMS template exceeds 160 characters for ${eventType}`, {
          length: validation.length,
          exceeds: validation.exceeds,
          templateId: template._id?.toString(),
        });
        // Truncate to 160 chars
        return rendered.substring(0, 160);
      }

      // Track usage
      await trackTemplateUsage(template._id!);

      return rendered;
    }

    // Fallback: Check unified NotificationTemplate system
    try {
      const { NotificationTemplate } = await import("@/lib/models");
      const { renderTemplate } = await import("./template-renderer");
      
      const unifiedTemplate = await NotificationTemplate.findOne({
        channel: "sms",
        event: eventType,
        isEnabled: true,
        locale: context.locale || "en",
      });

      if (unifiedTemplate && unifiedTemplate.body) {
        const rendered = renderTemplate(unifiedTemplate.body, context);
        const validation = validateTemplateLength(rendered);
        if (!validation.valid) {
          logger.warn(`SMS template exceeds 160 characters for ${eventType}`, {
            length: validation.length,
            exceeds: validation.exceeds,
            templateId: unifiedTemplate._id?.toString(),
          });
          return rendered.substring(0, 160);
        }
        return rendered;
      }
    } catch (unifiedError) {
      logger.debug("Could not check unified notification templates", {
        error: unifiedError instanceof Error ? unifiedError.message : String(unifiedError),
      });
    }

    // Fallback to default template
    const defaultTemplate = DEFAULT_SMS_TEMPLATES[eventType];
    if (defaultTemplate) {
      const rendered = renderSMSTemplate(defaultTemplate, context);
      const validation = validateTemplateLength(rendered);
      if (!validation.valid) {
        return rendered.substring(0, 160);
      }
      return rendered;
    }

    // Last resort: return empty string
    logger.error(`No template found for event type: ${eventType}`);
    return "";
  } catch (error) {
    logger.error("Failed to render SMS template", error as Error, {
      eventType,
    });
    // Fallback to default
    const defaultTemplate = DEFAULT_SMS_TEMPLATES[eventType];
    if (defaultTemplate) {
      return renderSMSTemplate(defaultTemplate, context);
    }
    return "";
  }
}

/**
 * Track template usage for analytics
 */
async function trackTemplateUsage(templateId: ObjectId): Promise<void> {
  const db = await getDb();
  try {
    await db.collection("sms_templates").updateOne(
      { _id: templateId },
      {
        $inc: { usageCount: 1 },
        $set: { lastUsedAt: new Date() },
      }
    );
  } catch (error) {
    logger.error("Failed to track template usage", error as Error, {
      templateId: templateId.toString(),
    });
  }
}

/**
 * Invalidate template cache
 */
export async function invalidateTemplateCache(
  eventType?: SMSEventType
): Promise<void> {
  if (eventType) {
    await deleteCache(`sms_template:${eventType}`);
  } else {
    // Invalidate all templates
    const eventTypes = Object.values(SMSEventType);
    const keys = eventTypes.map((et) => `sms_template:${et}`);
    await Promise.all(keys.map((key) => deleteCache(key)));
  }
}
