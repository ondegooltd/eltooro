/**
 * Migration Script: SMS Templates to Notification Templates
 * 
 * This script migrates existing SMS templates from the old `sms_templates` collection
 * to the new unified `notification_templates` collection.
 * 
 * Run with: tsx scripts/migrate-sms-templates.ts
 */

import { getDb } from "@/lib/db/mongodb";
import { initModels } from "@/lib/models/helpers";
import { NotificationTemplate } from "@/lib/models";
import { logger } from "@/lib/logger";

interface OldSMSTemplate {
  _id: any;
  eventType: string;
  name: string;
  message: string;
  variables: string[];
  status: "active" | "inactive";
  isDefault: boolean;
  usageCount: number;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: any;
}

async function migrateSMSTemplates() {
  try {
    logger.info("Starting SMS template migration...");

    // Connect to database
    await initModels();
    const db = await getDb();

    // Get all SMS templates from old collection
    const oldTemplates = await db
      .collection<OldSMSTemplate>("sms_templates")
      .find({})
      .toArray();

    logger.info(`Found ${oldTemplates.length} SMS templates to migrate`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const oldTemplate of oldTemplates) {
      try {
        // Skip inactive templates unless they're default
        if (oldTemplate.status === "inactive" && !oldTemplate.isDefault) {
          logger.debug(`Skipping inactive template: ${oldTemplate.eventType}`);
          skipped++;
          continue;
        }

        // Check if template already exists in notification_templates
        const existing = await NotificationTemplate.findOne({
          channel: "sms",
          event: oldTemplate.eventType,
          locale: "en",
        });

        if (existing) {
          logger.info(
            `Template for ${oldTemplate.eventType} already exists, skipping...`
          );
          skipped++;
          continue;
        }

        // Convert old template to new format
        const newTemplate = new NotificationTemplate({
          channel: "sms",
          event: oldTemplate.eventType,
          body: oldTemplate.message,
          isEnabled: oldTemplate.status === "active",
          locale: "en",
          updatedBy: oldTemplate.updatedBy,
          createdAt: oldTemplate.createdAt,
          updatedAt: oldTemplate.updatedAt,
        });

        await newTemplate.save();

        logger.info(
          `Migrated template: ${oldTemplate.eventType} (${oldTemplate.name})`
        );
        migrated++;
      } catch (error) {
        logger.error(
          `Failed to migrate template ${oldTemplate.eventType}`,
          error instanceof Error ? error : new Error(String(error)),
          {
            templateId: oldTemplate._id ? String(oldTemplate._id) : undefined,
          }
        );
        errors++;
      }
    }

    logger.info("Migration completed", {
      total: oldTemplates.length,
      migrated,
      skipped,
      errors,
    });

    // Summary
    console.log("\n=== Migration Summary ===");
    console.log(`Total templates: ${oldTemplates.length}`);
    console.log(`Migrated: ${migrated}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Errors: ${errors}`);
    console.log("\n✅ Migration complete!");

    process.exit(0);
  } catch (error) {
    logger.error("Migration failed", error instanceof Error ? error : new Error(String(error)));
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
migrateSMSTemplates();
