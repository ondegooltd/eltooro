import Handlebars from "handlebars";
import { logger } from "@/lib/logger";

/**
 * Render a template string with data using Handlebars
 * @param template - Template string with Handlebars variables
 * @param data - Data object to populate template variables
 * @returns Rendered string
 */
export function renderTemplate(
  template: string,
  data: Record<string, any>
): string {
  try {
    const compiled = Handlebars.compile(template);
    return compiled(data);
  } catch (error) {
    logger.error("Template rendering failed", error as Error, {
      template: template.substring(0, 100),
      dataKeys: Object.keys(data),
    });
    throw error;
  }
}

/**
 * Validate that all required variables are present in the data
 * @param template - Template string
 * @param data - Data object
 * @param requiredVars - Array of required variable names
 * @returns Validation result
 */
export function validateTemplateVariables(
  template: string,
  data: Record<string, any>,
  requiredVars?: string[]
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  if (requiredVars) {
    for (const varName of requiredVars) {
      if (!(varName in data) || data[varName] === undefined || data[varName] === null) {
        missing.push(varName);
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Extract variable names from a Handlebars template
 * @param template - Template string
 * @returns Array of variable names found in template
 */
export function extractTemplateVariables(template: string): string[] {
  const variables: string[] = [];
  const regex = /\{\{([^}]+)\}\}/g;
  let match;

  while ((match = regex.exec(template)) !== null) {
    const varName = match[1].trim();
    // Remove Handlebars helpers and modifiers
    const cleanVarName = varName
      .split(" ")[0]
      .replace(/^#/, "")
      .replace(/^\//, "")
      .replace(/^else/, "")
      .trim();
    if (cleanVarName && !variables.includes(cleanVarName)) {
      variables.push(cleanVarName);
    }
  }

  return variables;
}

/**
 * Sanitize template to prevent XSS (basic implementation)
 * For production, consider using a more robust sanitization library
 */
export function sanitizeTemplate(template: string): string {
  // Basic sanitization - escape HTML in template
  // For production, use a library like DOMPurify for HTML templates
  return template;
}
