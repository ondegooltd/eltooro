import { NextRequest } from "next/server";
import { initModels } from "@/lib/models/helpers";
import { AdminInfo } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api/response";
import { logger, logRequest } from "@/lib/logger";

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

/**
 * Parse FAQ content from AdminInfo records
 * Supports both structured metadata and HTML content parsing
 */
function parseFAQs(adminInfoRecords: any[]): FAQItem[] {
  const faqs: FAQItem[] = [];

  for (const record of adminInfoRecords) {
    // If metadata contains structured FAQ items
    if (record.metadata?.faqs && Array.isArray(record.metadata.faqs)) {
      faqs.push(...record.metadata.faqs);
    }
    // If metadata has question/answer directly
    else if (record.metadata?.question && record.metadata?.answer) {
      faqs.push({
        question: record.metadata.question,
        answer: record.metadata.answer,
        category: record.metadata.category,
      });
    }
    // Try to parse HTML content for FAQ structure
    else if (record.content) {
      // Simple parsing for common FAQ HTML patterns
      const questionMatches = record.content.match(
        /<h[23][^>]*>(.*?)<\/h[23]>/gi,
      );
      const answerMatches = record.content.match(/<p[^>]*>(.*?)<\/p>/gi);

      if (questionMatches && answerMatches) {
        const minLength = Math.min(
          questionMatches.length,
          answerMatches.length,
        );
        for (let i = 0; i < minLength; i++) {
          const question = questionMatches[i].replace(/<[^>]*>/g, "").trim();
          const answer = answerMatches[i].replace(/<[^>]*>/g, "").trim();
          if (question && answer) {
            faqs.push({
              question,
              answer,
              category: record.metadata?.category,
            });
          }
        }
      }
    }
  }

  return faqs;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  try {
    await initModels();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");

    // Fetch FAQ records from AdminInfo
    const query: any = {
      type: "faq",
      status: "published",
    };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { "metadata.question": { $regex: search, $options: "i" } },
        { "metadata.answer": { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (category) {
      query["metadata.category"] = category;
    }

    const records = await AdminInfo.find(query)
      .sort({ order: 1, createdAt: -1 })
      .lean();

    // Parse FAQs from records
    let faqs = parseFAQs(records);

    // If no structured FAQs found, create default FAQs
    if (faqs.length === 0) {
      faqs = [
        {
          question: "How do I track my order?",
          answer:
            "You can track your order by logging into your account and visiting the 'Orders' section. You'll find tracking information for all shipped orders. Alternatively, use the tracking number sent to your email on our Track Order page.",
          category: "orders",
        },
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept Mobile Money (MoMo), credit/debit cards, and bank transfers for Ghanaian customers. International customers can use credit cards and other payment methods available in their region. All payments are processed securely through trusted third-party providers.",
          category: "payments",
        },
        {
          question: "How long does delivery take?",
          answer:
            "Delivery times vary by destination and delivery method. For Ghana, standard delivery typically takes 3-7 business days. International shipping may take 7-21 business days depending on the destination. Check our Shipping page for specific estimates to your location.",
          category: "shipping",
        },
        {
          question: "What is your return policy?",
          answer:
            "Toroglo accepts returns on unused and unopened items within 7 days of delivery. Products must be in original packaging with all tags and labels attached. No refunds are issued—returns result in store credit or replacement products. Visit our Returns page for full details.",
          category: "returns",
        },
        {
          question: "How do I use a promo code?",
          answer:
            "Enter your promo code in the 'Promo Code' field during checkout. The discount will be applied to eligible items in your cart. Note that only one promo code can be used per order, and some codes may have restrictions or expiration dates.",
          category: "orders",
        },
        {
          question: "Are your products authentic?",
          answer:
            "Yes, all products sold on Toroglo are 100% authentic. We source directly from trusted manufacturers and authorized distributors. Our products are carefully selected and verified for quality and authenticity before being offered to customers.",
          category: "products",
        },
        {
          question: "How do I manage my account?",
          answer:
            "You can manage your account by logging in and visiting the 'My Account' section. Here you can update your profile information, manage addresses, view order history, update preferences, and manage your newsletter subscriptions.",
          category: "account",
        },
        {
          question: "Can I cancel my order?",
          answer:
            "Orders can be cancelled if they haven't been shipped yet. Once an order is shipped, it cannot be cancelled, but you can return it according to our return policy. To cancel an order, contact our support team as soon as possible with your order number.",
          category: "orders",
        },
        {
          question: "Do you ship internationally?",
          answer:
            "Yes, Toroglo ships internationally. However, delivery times, shipping costs, and available products may vary by country. International customers are responsible for ensuring products comply with their country's import regulations and for paying any applicable customs duties or taxes.",
          category: "shipping",
        },
        {
          question: "How do I contact customer support?",
          answer:
            "You can contact our customer support team via email at info@toroglo.com, through our Contact page, or by submitting a support ticket. We typically respond within 24 hours during business days. For urgent matters, please use our contact form with 'Urgent' in the subject line.",
          category: "support",
        },
      ];
    }

    // Filter by search if provided
    let filteredFAQs = faqs;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredFAQs = faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchLower) ||
          faq.answer.toLowerCase().includes(searchLower),
      );
    }

    logRequest("GET", "/api/help/faqs", 200, Date.now() - startTime);
    return successResponse(filteredFAQs);
  } catch (error) {
    logger.error("FAQs fetch failed", error as Error, {
      endpoint: "/api/help/faqs",
    });
    logRequest(
      "GET",
      "/api/help/faqs",
      (error as any).statusCode || 500,
      Date.now() - startTime,
    );
    return handleApiError(error);
  }
}
