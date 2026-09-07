export interface PSPAction {
	flowActionId: string;
	flowActionName?: string;
	minAmount: number;
	maxAmount: number;
}

// PSP structure for API responses (when fetching data)
export interface PSPResponse {
	id: string;
	name: string;
}

// PSP structure for API requests (when creating/updating)
export interface PSPRequest {
	id: string;
}

export interface TransactionLimit {
	id: string;
	version: number;
	name: string;
	brandId: string;
	environmentId: string;
	currency: string;
	countries: string[];
	customerTags: string[];
	status: "ENABLED" | "DISABLED";
	pspActions: PSPAction[];
	psps: PSPResponse[]; // Changed to PSPResponse array for fetch responses
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	updatedBy: string;
}

export interface TransactionLimitFormData {
	name: string;
	currency: string;
	countries: string[];
	customerTags: string[];
	status: "ENABLED" | "DISABLED";
	pspActions: PSPAction[];
	psps: PSPRequest[]; // Changed to PSPRequest array for create/update requests
}

export interface FlowAction {
	id: string;
	name: string;
	description?: string;
	flowTypeId: string;
	status: "ENABLED" | "DISABLED";
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	updatedBy: string;
}

export const LIMIT_TYPES = [
	"PER_TRANSACTION",
	"DAILY",
	"MONTHLY",
	"WEEKLY",
] as const;

export const COUNTRY_SETTINGS = ["DEPOSIT", "WITHDRAWAL", "BOTH"] as const;

export const CURRENCIES = [
	"USD",
	"EUR",
	"GBP",
	"JPY",
	"CAD",
	"AUD",
	"INR",
	"SGD",
	"BTC",
	"ETH",
] as const;

export const COUNTRIES = [
	"US",
	"CA",
	"GB",
	"DE",
	"FR",
	"IT",
	"JP",
	"AU",
	"BR",
	"IN",
	"SG",
	"AE",
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
	"Coinbase",
	"Square",
	"Adyen",
	"Coinbase",
	"Square",
	"Adyen",
] as const;

export const MOCK_TAGS = [
	"Banned",
	"VIP",
	"Important",
	"High Risk",
	"Low Risk",
	"Premium",
	"Standard",
	"Basic",
] as const;
