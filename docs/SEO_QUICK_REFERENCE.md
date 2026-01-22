# SEO Quick Reference Guide

## 🚀 Quick Start

### 1. Verify Implementation
- ✅ Sitemap: `https://www.eltooro.com/sitemap.xml`
- ✅ Robots: `https://www.eltooro.com/robots.txt`
- ✅ Structured Data: Check page source for JSON-LD

### 2. Submit to Search Engines
```bash
# Google Search Console
https://search.google.com/search-console

# Bing Webmaster Tools
https://www.bing.com/webmasters
```

### 3. Test Structured Data
- Google Rich Results Test: https://search.google.com/test/rich-results
- Schema.org Validator: https://validator.schema.org/

---

## 📋 Keyword Categories

### Core Keywords (Use in Homepage)
- Eltooro Ghana
- Organic hair care Ghana
- Natural skin care products Ghana
- Herbal beauty shop Accra/Winneba

### Product-Specific Keywords
- Hair Growth: "hair growth oil for 4C hair", "how to grow edges fast Ghana"
- Beard Care: "beard growth oil Ghana", "best beard booster in Accra"
- Skincare: "organic black soap for acne", "best face serum for hyperpigmentation"
- Supplements: "organic hair growth supplements Ghana", "biotin for hair growth Accra"

### Local SEO Keywords
- "Buy organic hair products online Ghana"
- "Organic beauty shop in Accra"
- "Fast delivery beauty products Ghana"
- "Cash on delivery beauty products Ghana"

### AI Search Keywords (Long-Tail)
- "Where can I buy organic hair growth oil in Accra?"
- "Best organic soap for glowing skin in Ghana"
- "How to grow my hair fast with natural products"
- "Which organic lotion is best for dark skin in Ghana?"

---

## 🛠️ Usage Examples

### Adding SEO to a New Page
```typescript
import { generateMetadata } from "@/lib/seo/metadata";
import { StructuredData } from "@/components/seo/structured-data";
import { generateBreadcrumbSchema } from "@/lib/seo/structured-data";

export const metadata = generateMetadata({
  title: "Your Page Title",
  description: "Your page description with keywords",
  keywords: ["keyword1", "keyword2", "keyword3"],
});

export default function YourPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://www.eltooro.com" },
    { name: "Your Page", url: "https://www.eltooro.com/your-page" },
  ]);

  return (
    <>
      <StructuredData data={breadcrumbSchema} />
      {/* Your page content */}
    </>
  );
}
```

### Adding Product Schema
```typescript
import { generateProductSchema } from "@/lib/seo/structured-data";
import { StructuredData } from "@/components/seo/structured-data";

const productSchema = generateProductSchema({
  name: "Product Name",
  description: "Product description",
  image: "product-image.jpg",
  price: 50,
  currency: "GHS",
  availability: "in stock",
  // ...
});

<StructuredData data={productSchema} />
```

---

## 📊 SEO Checklist

### On-Page SEO
- [x] Unique title tags (60 characters)
- [x] Meta descriptions (150-160 characters)
- [x] H1 tags on every page
- [x] Proper heading hierarchy (H1 → H2 → H3)
- [x] Alt text for images
- [x] Internal linking
- [x] Mobile responsive
- [x] Fast page load

### Technical SEO
- [x] Sitemap.xml
- [x] Robots.txt
- [x] Canonical URLs
- [x] Structured data (JSON-LD)
- [x] Open Graph tags
- [x] Twitter Cards
- [x] Geo-location metadata

### Content SEO
- [x] Keyword-rich content
- [x] Long-tail keywords
- [x] Local keywords (Ghana cities)
- [x] Natural keyword density
- [x] FAQ content

---

## 🔍 Monitoring

### Key Metrics to Track
1. **Organic Traffic** - Google Analytics
2. **Keyword Rankings** - Google Search Console
3. **Click-Through Rate (CTR)** - Search Console
4. **Core Web Vitals** - PageSpeed Insights
5. **Index Coverage** - Search Console

### Tools
- Google Search Console
- Google Analytics
- Bing Webmaster Tools
- PageSpeed Insights
- Schema.org Validator

---

## 🎯 Best Practices

1. **Use Keywords Naturally**
   - Don't stuff keywords
   - Write for humans first
   - Include keywords in titles, descriptions, and content

2. **Optimize for Local Search**
   - Include city names (Accra, Winneba, Kumasi, etc.)
   - Use "Ghana" in descriptions
   - Add local business schema

3. **Create Quality Content**
   - Answer user questions
   - Use FAQ schema
   - Provide detailed product descriptions

4. **Build Internal Links**
   - Link related products
   - Link to categories
   - Use descriptive anchor text

5. **Optimize Images**
   - Use descriptive filenames
   - Add alt text with keywords
   - Compress images

---

## 📝 Next Steps

1. **Content Creation**
   - Add blog posts with keywords
   - Create location-specific pages
   - Add more FAQ content

2. **Link Building**
   - Get listed in Ghana business directories
   - Partner with local blogs
   - Social media integration

3. **Performance**
   - Monitor Core Web Vitals
   - Optimize images
   - Implement lazy loading

4. **Analytics**
   - Set up Google Analytics
   - Track keyword performance
   - Monitor search impressions

---

**Status**: ✅ Production Ready
**Last Updated**: Current
**Keywords**: 100+ implemented
