// GIGGS Centralized Pricing & Tier Engine
import { PricingTier, MaterialItem } from '../types/database';

export interface CalculatedPricing {
  currentPrice: number;
  originalPrice: number;
  savings: number;
  discountPercentage: number;
  nextTier?: PricingTier;
  participantsNeededForNextTier: number;
  activeTier: PricingTier;
}

export interface InvoiceBreakdown {
  labourAmount: number;
  materialsTotal: number;
  grossAmount: number;
  groupDiscountAmount: number;
  platformFee: number;
  gstAmount: number;
  netPayable: number;
  materials: MaterialItem[];
}

/**
 * Calculates current applicable price tier based on registration count
 */
export function calculateTierPrice(
  participantCount: number,
  tiers: PricingTier[],
  defaultBasePrice: number = 549
): CalculatedPricing {
  if (!tiers || tiers.length === 0) {
    return {
      currentPrice: defaultBasePrice,
      originalPrice: defaultBasePrice,
      savings: 0,
      discountPercentage: 0,
      participantsNeededForNextTier: 0,
      activeTier: {
        id: 'default',
        minParticipants: 1,
        maxParticipants: 999,
        price: defaultBasePrice
      }
    };
  }

  // Sort tiers by minParticipants ascending
  const sortedTiers = [...tiers].sort((a, b) => a.minParticipants - b.minParticipants);
  const basePrice = sortedTiers[0].price;

  // Find active tier
  let activeTier = sortedTiers[0];
  let activeTierIndex = 0;

  for (let i = 0; i < sortedTiers.length; i++) {
    if (participantCount >= sortedTiers[i].minParticipants) {
      activeTier = sortedTiers[i];
      activeTierIndex = i;
    }
  }

  const nextTier = activeTierIndex < sortedTiers.length - 1 ? sortedTiers[activeTierIndex + 1] : undefined;
  const participantsNeeded = nextTier ? Math.max(0, nextTier.minParticipants - participantCount) : 0;
  const savings = Math.max(0, basePrice - activeTier.price);
  const discountPercentage = Math.round((savings / basePrice) * 100);

  return {
    currentPrice: activeTier.price,
    originalPrice: basePrice,
    savings,
    discountPercentage,
    nextTier,
    participantsNeededForNextTier: participantsNeeded,
    activeTier
  };
}

/**
 * Calculates full itemized invoice breakdown keeping materials & labour strictly separated
 */
export function calculateInvoice(
  labourAmount: number,
  materials: MaterialItem[] = [],
  groupDiscountPer: number = 0
): InvoiceBreakdown {
  const approvedMaterials = materials.filter((m) => m.customerApproved);
  const materialsTotal = approvedMaterials.reduce(
    (acc, item) => acc + item.qty * item.unitPrice,
    0
  );

  const grossAmount = labourAmount + materialsTotal;
  const groupDiscountAmount = (labourAmount * groupDiscountPer) / 100;
  const discountedSubtotal = grossAmount - groupDiscountAmount;

  // Modest platform fee + 18% GST on services
  const platformFee = 20;
  const gstAmount = Math.round((discountedSubtotal + platformFee) * 0.18);
  const netPayable = discountedSubtotal + platformFee + gstAmount;

  return {
    labourAmount,
    materialsTotal,
    grossAmount,
    groupDiscountAmount,
    platformFee,
    gstAmount,
    netPayable,
    materials: approvedMaterials
  };
}
