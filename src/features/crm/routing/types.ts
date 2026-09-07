export interface PSP {
	pspId: string;
	pspValue: number;
	pspOrder: number;
}

export interface PriorityPSP {
	pspId: string;
	pspOrder: number;
}

export interface WeightagePSP {
	pspId: string;
	pspValue: number;
	pspOrder: number;
}

export interface RoutingRule {
	id: string;
	version: number;
	name: string;
	brandId: string;
	environmentId: string;
	pspSelectionMode: "WEIGHTAGE" | "PRIORITY";
	routingType: "COUNT" | "AMOUNT" | "PERCENTAGE" | null;
	duration: "HOUR" | "DAY" | "WEEK" | "MONTH" | null;
	conditionJson: Record<string, unknown>;
	status: "ENABLED" | "DISABLED";
	psps: Array<{
		pspId: string;
		pspName: string;
		pspOrder: number;
		pspValue: number | null;
	}>;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	updatedBy: string;
}

export interface RoutingRuleFormData {
	name: string;
	time: "HOUR" | "DAY" | "WEEK" | "MONTH";
	rule?: "COUNT" | "AMOUNT" | "PERCENTAGE";
	pspSelectionMode: "WEIGHTAGE" | "PRIORITY";
	conditionJson: Record<string, unknown>;
	status: "ENABLED" | "DISABLED";
	psps: PriorityPSP[] | WeightagePSP[];
	isDefault: boolean;
}

// API payload structure for creating routing rules
// brandId and environmentId are automatically added via headers
export interface RoutingRuleCreatePayload {
	name: string;
	pspSelectionMode: "WEIGHTAGE" | "PRIORITY";
	conditionJson: Record<string, unknown>;
	routingType?: "COUNT" | "AMOUNT" | "PERCENTAGE"; // Only for WEIGHTAGE mode
	duration?: "HOUR" | "DAY" | "WEEK" | "MONTH"; // Only for WEIGHTAGE mode
	psps: Array<{
		pspId: string;
		pspOrder: number;
		pspValue: number;
	}>;
}

export interface RoutingRuleUpdatePayload {
	name: string;
	pspSelectionMode: "WEIGHTAGE" | "PRIORITY";
	conditionJson: Record<string, unknown>;
	routingType?: "COUNT" | "AMOUNT" | "PERCENTAGE"; // Only for WEIGHTAGE mode
	duration?: "HOUR" | "DAY" | "WEEK" | "MONTH"; // Only for WEIGHTAGE mode
	psps: Array<{
		pspId: string;
		pspOrder: number;
		pspValue: number;
	}>;
}

export const ROUTING_METHODS = ["WEIGHTAGE", "PRIORITY"] as const;

export const TIMEFRAMES = ["DAILY", "HOURLY", "WEEKLY", "MONTHLY"] as const;

export const CARD_BRANDS = [
	"ALL",
	"VISA",
	"MASTERCARD",
	"AMEX",
	"DISCOVER",
] as const;

export const MOCK_PSPS = [
	"Stripe",
	"Razorpay",
	"Bridgepay",
	"PayPal",
	"SEPA Direct",
	"BitPay",
	"Coinbase",
	"Square",
	"Adyen",
] as const;
