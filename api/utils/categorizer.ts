import { ObjectId } from 'mongodb';
import { getDatabase } from '../db/mongodb';

// Deterministic rule-based categorizer
export async function categorizeTransactionByRules(
  description: string,
  userId: ObjectId
): Promise<string | null> {
  const db = await getDatabase();
  const rules = await db
    .collection('categoryRules')
    .find({ userId, enabled: true })
    .sort({ priority: -1 })
    .toArray();

  const lowerDesc = description.toLowerCase();

  for (const rule of rules) {
    for (const keyword of rule.keywords) {
      if (lowerDesc.includes(keyword.toLowerCase())) {
        return rule.category;
      }
    }
  }

  return null;
}

// Lightweight ML fallback categorizer using keyword frequency
const ML_CATEGORIES = {
  groceries: ['grocery', 'supermarket', 'whole foods', 'trader joe', 'safeway', 'kroger', 'costco'],
  dining: ['restaurant', 'cafe', 'pizza', 'burger', 'sushi', 'bar', 'pub', 'hotel', 'doordash', 'uber eats', 'grubhub'],
  transportation: ['uber', 'lyft', 'gas', 'parking', 'transit', 'amtrak', 'airline', 'hotel'],
  utilities: ['electric', 'water', 'internet', 'phone', 'gas bill', 'utility'],
  entertainment: ['movie', 'theater', 'concert', 'spotify', 'netflix', 'gaming', 'steam'],
  shopping: ['amazon', 'target', 'walmart', 'mall', 'store', 'shop'],
  healthcare: ['doctor', 'pharmacy', 'hospital', 'clinic', 'dental', 'medical'],
  fitness: ['gym', 'yoga', 'trainer', 'sport'],
  subscriptions: ['subscription', 'membership', 'plan'],
  salary: ['salary', 'paycheck', 'wage', 'bonus', 'payment'],
  freelance: ['freelance', 'contract', 'invoice', 'gig'],
};

export function categorizeTransactionByML(description: string): string {
  const lowerDesc = description.toLowerCase();
  const scores: Record<string, number> = {};

  // Calculate confidence scores for each category
  for (const [category, keywords] of Object.entries(ML_CATEGORIES)) {
    scores[category] = keywords.filter((kw) => lowerDesc.includes(kw)).length;
  }

  // Return category with highest score, default to 'uncategorized'
  const bestCategory = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .find(([, score]) => score > 0)?.[0];

  return bestCategory || 'uncategorized';
}

export async function categorizeTransaction(description: string, userId: ObjectId): Promise<string> {
  // Try deterministic rules first
  const ruleCategory = await categorizeTransactionByRules(description, userId);
  if (ruleCategory) {
    return ruleCategory;
  }

  // Fallback to ML categorizer
  return categorizeTransactionByML(description);
}
