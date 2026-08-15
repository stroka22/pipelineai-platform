import Stripe from 'stripe';

let stripeSingleton: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not set');
  }
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeSingleton;
}

// All amounts in cents. Env overrides let test/live differ if ever needed.
export const PRICING = {
  websiteSetup: Number(process.env.PRICE_WEBSITE_SETUP_CENTS) || 49700, // $497 one-time
  installment: Number(process.env.PRICE_INSTALLMENT_CENTS) || 17900, // $179/mo x3
  hosting: Number(process.env.PRICE_HOSTING_CENTS) || 4700, // $47/mo
  installmentCount: 3,
  hostingTrialDays: 30,
  selfServeMonthly: Number(process.env.PRICE_SELF_SERVE_MONTHLY_CENTS) || 4900, // $49/mo
  selfServeAnnual: Number(process.env.PRICE_SELF_SERVE_ANNUAL_CENTS) || 49000, // $490/yr
  selfServeTrialDays: 7,
};

export type WebsitePlan = 'full' | 'installments' | 'self_serve';
export type BillingInterval = 'monthly' | 'annual';

type PriceSpec = {
  lookupKey: string;
  productName: string;
  unitAmount: number;
  interval?: 'month' | 'year';
};

const priceIdCache = new Map<string, string>();

async function getOrCreatePrice(stripe: Stripe, spec: PriceSpec): Promise<string> {
  const cached = priceIdCache.get(spec.lookupKey);
  if (cached) return cached;

  const existing = await stripe.prices.list({ lookup_keys: [spec.lookupKey], active: true, limit: 1 });
  if (existing.data[0]) {
    priceIdCache.set(spec.lookupKey, existing.data[0].id);
    return existing.data[0].id;
  }

  const price = await stripe.prices.create({
    currency: 'usd',
    unit_amount: spec.unitAmount,
    lookup_key: spec.lookupKey,
    product_data: { name: spec.productName },
    ...(spec.interval ? { recurring: { interval: spec.interval } } : {}),
  });
  priceIdCache.set(spec.lookupKey, price.id);
  return price.id;
}

export function getInstallmentPriceId(stripe: Stripe): Promise<string> {
  return getOrCreatePrice(stripe, {
    lookupKey: 'pipeline_installment_179',
    productName: 'Website Build (3-payment plan)',
    unitAmount: PRICING.installment,
    interval: 'month',
  });
}

export function getHostingPriceId(stripe: Stripe): Promise<string> {
  return getOrCreatePrice(stripe, {
    lookupKey: 'pipeline_hosting_47',
    productName: 'Growth Plan (hosting & support)',
    unitAmount: PRICING.hosting,
    interval: 'month',
  });
}

// Self-serve website plan: $49/mo or $490/yr, both with a 7-day free trial.
export function getSelfServeMonthlyPriceId(stripe: Stripe): Promise<string> {
  return getOrCreatePrice(stripe, {
    lookupKey: 'pipeline_selfserve_49',
    productName: 'Pipeline AI Website (monthly)',
    unitAmount: PRICING.selfServeMonthly,
    interval: 'month',
  });
}

export function getSelfServeAnnualPriceId(stripe: Stripe): Promise<string> {
  return getOrCreatePrice(stripe, {
    lookupKey: 'pipeline_selfserve_annual_490',
    productName: 'Pipeline AI Website (annual)',
    unitAmount: PRICING.selfServeAnnual,
    interval: 'year',
  });
}

export function getSelfServePriceId(stripe: Stripe, billing: BillingInterval): Promise<string> {
  return billing === 'annual' ? getSelfServeAnnualPriceId(stripe) : getSelfServeMonthlyPriceId(stripe);
}

// Create the ongoing $47/mo hosting subscription. Idempotent: returns the
// existing one if the customer already has a hosting subscription.
export async function ensureHostingSubscription(
  stripe: Stripe,
  opts: {
    customerId: string;
    paymentMethodId?: string | null;
    trialDays?: number;
    metadata?: Record<string, string>;
  }
): Promise<{ created: boolean; subscriptionId: string }> {
  const hostingPriceId = await getHostingPriceId(stripe);

  const existing = await stripe.subscriptions.list({
    customer: opts.customerId,
    status: 'all',
    limit: 100,
  });
  const active = existing.data.find(
    (s) =>
      s.status !== 'canceled' &&
      s.status !== 'incomplete_expired' &&
      (s.metadata?.type === 'hosting' || s.items.data.some((i) => i.price.id === hostingPriceId))
  );
  if (active) return { created: false, subscriptionId: active.id };

  const sub = await stripe.subscriptions.create({
    customer: opts.customerId,
    items: [{ price: hostingPriceId }],
    trial_period_days: opts.trialDays ?? PRICING.hostingTrialDays,
    ...(opts.paymentMethodId ? { default_payment_method: opts.paymentMethodId } : {}),
    metadata: { type: 'hosting', ...(opts.metadata || {}) },
  });
  return { created: true, subscriptionId: sub.id };
}

function addMonthsUnix(unixSeconds: number, months: number): number {
  const d = new Date(unixSeconds * 1000);
  d.setMonth(d.getMonth() + months);
  return Math.floor(d.getTime() / 1000);
}

// Convert a freshly-created $179/mo subscription into a fixed 3-charge plan
// that automatically rolls into the $47/mo Growth Plan afterward.
// Phase 1: $179/mo for 3 months (first charge already collected at checkout).
// Phase 2: $47/mo ongoing. Idempotent: skips if a schedule is already attached.
export async function attachInstallmentSchedule(
  stripe: Stripe,
  subscriptionId: string
): Promise<{ scheduleId: string; skipped: boolean }> {
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  if (sub.schedule) {
    const id = typeof sub.schedule === 'string' ? sub.schedule : sub.schedule.id;
    return { scheduleId: id, skipped: true };
  }

  const installmentPriceId = await getInstallmentPriceId(stripe);
  const hostingPriceId = await getHostingPriceId(stripe);

  const schedule = await stripe.subscriptionSchedules.create({ from_subscription: subscriptionId });
  const phaseStart = schedule.phases[0].start_date;
  const installmentEnd = addMonthsUnix(phaseStart, PRICING.installmentCount);

  await stripe.subscriptionSchedules.update(schedule.id, {
    end_behavior: 'release',
    proration_behavior: 'none',
    phases: [
      {
        items: [{ price: installmentPriceId, quantity: 1 }],
        start_date: phaseStart,
        end_date: installmentEnd,
      },
      {
        items: [{ price: hostingPriceId, quantity: 1 }],
      },
    ],
  });

  return { scheduleId: schedule.id, skipped: false };
}
