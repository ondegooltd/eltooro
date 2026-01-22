import Agenda, { Job } from "agenda";
import { logger } from "@/lib/logger";

// Get MongoDB URI for Agenda
const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is required for Agenda job queue");
}

// Initialize Agenda with MongoDB connection
// Agenda will create a collection called 'agendaJobs' in your MongoDB database
const agenda = new Agenda({
  db: { address: MONGODB_URI, collection: "agendaJobs" },
  processEvery: "10 seconds", // Check for new jobs every 10 seconds
  maxConcurrency: 5, // Process up to 5 jobs concurrently
  defaultConcurrency: 5,
  defaultLockLifetime: 10 * 60 * 1000, // 10 minutes lock lifetime
});

// Handle Agenda ready event
agenda.on("ready", () => {
  logger.info("Agenda job queue initialized and ready");
  // Don't start here - we'll start lazily when first job is added
});

// Handle Agenda errors
agenda.on("error", (error) => {
  logger.error("Agenda error", error, { context: "agenda" });
});

/**
 * Email Job Processor
 * Handles all email-related jobs using templates
 */
agenda.define("email", { concurrency: 5, lockLifetime: 10 * 60 * 1000 }, async (job: Job) => {
  const { event, data } = job.attrs.data;

  try {
    // Initialize models
    await import("@/lib/models/helpers").then((m) => m.initModels());

    // Use templated notification system
    const { sendTemplatedEmail } = await import(
      "@/lib/notifications/templated-notifications"
    );

    await sendTemplatedEmail(event, data);
  } catch (error) {
    logger.error("Email job failed", error as Error, {
      event,
      data,
      jobId: job.attrs._id?.toString(),
    });
    throw error; // Re-throw to trigger Agenda retry mechanism
  }
});

/**
 * SMS Job Processor
 * Handles all SMS-related jobs using templates
 */
agenda.define("sms", { concurrency: 5, lockLifetime: 10 * 60 * 1000 }, async (job: Job) => {
  const { event, data } = job.attrs.data;

  try {
    // Initialize models
    await import("@/lib/models/helpers").then((m) => m.initModels());

    // Use templated notification system
    const { sendTemplatedSMS } = await import(
      "@/lib/notifications/templated-notifications"
    );

    await sendTemplatedSMS(event, data);
  } catch (error) {
    logger.error("SMS job failed", error as Error, {
      event,
      data,
      jobId: job.attrs._id?.toString(),
    });
    throw error; // Re-throw to trigger Agenda retry mechanism
  }
});

// Job completion and failure handlers
agenda.on("start", (job: Job) => {
  logger.info(`Job started: ${job.attrs.name}`, {
    jobId: job.attrs._id?.toString(),
    jobName: job.attrs.name,
  });
});

agenda.on("success", (job: Job) => {
  logger.info(`Job completed: ${job.attrs.name}`, {
    jobId: job.attrs._id?.toString(),
    jobName: job.attrs.name,
  });
});

agenda.on("fail", (error: Error, job: Job) => {
  logger.error(`Job failed: ${job.attrs.name}`, error, {
    jobId: job.attrs._id?.toString(),
    jobName: job.attrs.name,
    attempts: job.attrs.failCount || 0,
  });
});

/**
 * Initialize Agenda (call this during app startup)
 */
export async function initAgenda(): Promise<void> {
  try {
    await agenda.start();
    logger.info("Agenda job queue started successfully");
  } catch (error) {
    logger.error("Failed to start Agenda", error as Error);
    throw error;
  }
}

/**
 * Gracefully shutdown Agenda (call this during app shutdown)
 */
export async function shutdownAgenda(): Promise<void> {
  try {
    await agenda.stop();
    await agenda.close({ force: true });
    logger.info("Agenda job queue shut down successfully");
  } catch (error) {
    logger.error("Error shutting down Agenda", error as Error);
  }
}

// Track if Agenda has been started
let agendaStarted = false;

/**
 * Ensure Agenda is started (lazy initialization)
 */
async function ensureAgendaStarted(): Promise<void> {
  if (!agendaStarted) {
    try {
      await agenda.start();
      agendaStarted = true;
      logger.info("Agenda job queue started (lazy initialization)");
    } catch (error) {
      // If already started, ignore the error
      if (error instanceof Error && error.message.includes("already started")) {
        agendaStarted = true;
      } else {
        logger.error("Failed to start Agenda", error as Error);
        throw error;
      }
    }
  }
}

/**
 * Add email job to queue
 * @param event - Event type (e.g., "order_confirmation", "otp")
 * @param data - Email data (must include 'email' field)
 * @param options - Job options (delay in milliseconds, attempts for retries)
 */
export async function addEmailJob(
  event: string,
  data: any,
  options?: { delay?: number; attempts?: number }
): Promise<void> {
  try {
    await ensureAgendaStarted();
    
    const jobData = {
      event,
      data,
    };

    // If delay is specified, schedule the job
    if (options?.delay) {
      await agenda.schedule(new Date(Date.now() + options.delay), "email", jobData);
    } else {
      await agenda.now("email", jobData);
    }
  } catch (error) {
    logger.error("Failed to add email job", error as Error, { event, data });
    throw error;
  }
}

/**
 * Add SMS job to queue
 * @param event - Event type (e.g., "order_confirmation", "otp")
 * @param data - SMS data (must include 'phone' field)
 * @param options - Job options (delay in milliseconds, attempts for retries)
 */
export async function addSMSJob(
  event: string,
  data: any,
  options?: { delay?: number; attempts?: number }
): Promise<void> {
  try {
    await ensureAgendaStarted();
    
    const jobData = {
      event,
      data,
    };

    // If delay is specified, schedule the job
    if (options?.delay) {
      await agenda.schedule(new Date(Date.now() + options.delay), "sms", jobData);
    } else {
      await agenda.now("sms", jobData);
    }
  } catch (error) {
    logger.error("Failed to add SMS job", error as Error, { event, data });
    throw error;
  }
}

/**
 * Add notification job (both email and SMS)
 * @param event - Event type (e.g., "order_confirmation", "otp")
 * @param emailData - Email data (optional, must include 'email' field)
 * @param smsData - SMS data (optional, must include 'phone' field)
 * @param options - Job options (delay in milliseconds, attempts for retries)
 */
export async function addNotificationJob(
  event: string,
  emailData?: any,
  smsData?: any,
  options?: { delay?: number; attempts?: number }
): Promise<void> {
  if (emailData) {
    await addEmailJob(event, emailData, options);
  }
  if (smsData) {
    await addSMSJob(event, smsData, options);
  }
}

// Export agenda instance for advanced usage if needed
export { agenda };
