// Type definitions for better type safety
export interface LoginCredentials {
	email: string;
	password: string;
}

export interface AuthResponse {
	accessToken: string;
	refreshToken: string;
	tokenType: string;
	issuedAt: string;
	expiresAt: string;
	claims: {
		fi_name?: string | null;
		auth_type: string;
		brands?: Array<{
			id: string;
			name: string;
			environments: Array<{
				id: string;
				name: string;
				roleId?: string | null;
			}>;
		}> | null;
		user_id: string;
		role_id: string;
		scope: "SYSTEM" | "BRAND" | "FI";
		fi_id?: string | null;
		token_type: string;
		accessible_brands?: Array<{
			id: string;
			name: string;
			environments: Array<{
				id: string;
				name: string;
				roleId?: string | null;
			}>;
		}> | null;
		email: string;
	};
}

export interface User {
	id: number; // Backend returns Integer (SERIAL), but we convert to string for form inputs
	email: string;
	name: string;
	role: string;
	status: string;
}

export interface BrandResponse {
	message: string;
	success: boolean;
	timestamp: string;
	code: string;
	data: Brand[];
}

export interface Brand {
	id: string;
	name: string;
	fiId?: number; // Backend returns Short (number), but we convert to string for API paths
	email?: string;
	status?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface Environment {
	id: string;
	name: string;
	brandId: string;
	origin?: string;
	successRedirectUrl?: string;
	failureRedirectUrl?: string;
	createdAt: string;
	updatedAt: string;
	createdBy?: string;
	updatedBy?: string;
}

export interface Rule {
	id: string;
	name: string;
	description: string;
	status: string;
	createdAt: string;
}

// Configured PSP types
export interface ConfiguredPSP {
	id: string;
	name: string;
	description: string;
	logo: string;
	credential: string;
	timeout: number;
	blockVpnAccess: boolean;
	blockDataCenterAccess: boolean;
	brandId: string;
	environmentId: string;
	flowTargetId: string;
	flowActionId: string;
	flowDefinitionId: string;
	supportedActions: PSPSupportedAction[];
	status: "ENABLED" | "DISABLED";
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	updatedBy: string;
}

export interface PageableSort {
	sorted: boolean;
	unsorted: boolean;
	empty: boolean;
}

export interface Pageable {
	pageNumber: number;
	pageSize: number;
	sort: PageableSort;
	offset: number;
	unpaged: boolean;
	paged: boolean;
}

export interface ConfiguredPSPsResponse {
	data: ConfiguredPSP[];
	message: string;
	success: boolean;
	timestamp: string;
	code: string;
}

export interface PSPOperationStatusPayload {
	pspId: string;
	flowActionId: string;
	flowDefinitionId: string;
	status: "ENABLED" | "DISABLED";
}

export interface PSPOperationStatusResponse {
	success: boolean;
	timestamp: string;
	code: string;
	message: string;
}

export interface PSPUpdatePayload {
	name: string;
	status: "ENABLED" | "DISABLED";
	logo?: string;
}

export interface PSPDetailsUpdatePayload {
	name: string;
	status: "ENABLED" | "DISABLED";
	flowTargetId: string;
	description: string;
	logo: string;
	credential?: string;
	ipAddress: string[];
	timeout: number;
	blockVpnAccess: boolean;
	blockDataCenterAccess: boolean;
	failureRate: boolean;
	failureRateThreshold: number;
	failureRateDurationMinutes: number;
	maintenanceWindow: Array<{
		id: number; // Backend returns Integer (SERIAL), but we convert to string for form inputs
		flowActionId: string;
		startAt: string;
		endAt: string;
	}>;
	operations: PSPOperation[];
}

export interface PSPUpdateResponse {
	success: boolean;
	timestamp: string;
	code: string;
	message: string;
	data: ConfiguredPSP;
}

export interface PSPCreatePayload {
	name: string;
	description?: string;
	logo?: string;
	credential: string;
	flowTargetId: string;
}

export interface PSPCreateResponse {
	success: boolean;
	timestamp: string;
	code: string;
	message: string;
	data: ConfiguredPSP;
}

// New PSP API types for direct endpoint
export interface PSPOperation {
	flowActionId: string;
	flowDefinitionId: string;
	status: "ENABLED" | "DISABLED";
	currencies: string[];
	countries: string[];
}

export interface PSPFlowTarget {
	id: string;
	credentialSchema: string;
	flowTypeId: string;
	currencies: string[];
	countries: string[];
	paymentMethods: string[];
	supportedActions: PSPSupportedAction[];
}

export interface PSPSupportedAction {
	flowActionId: string;
	flowDefinitionId: string;
	flowActionName: string;
}

export interface PSPDetails {
	id: string;
	name: string;
	description: string;
	logo: string;
	credential?: string;
	timeout: number;
	blockVpnAccess: boolean;
	blockDataCenterAccess: boolean;
	failureRate: boolean;
	healthCheck: boolean;
	failureRateThreshold: number;
	failureRateDurationMinutes: number;
	healthCheckIntervalMinutes: number;
	healthCheckMaxConsecutiveFailures: number;
	brandId: string;
	environmentId: string;
	flowTargetId: string;
	status: "ENABLED" | "DISABLED";
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	updatedBy: string;
	ipAddress: string[];
	maintenanceWindow: Array<{
		id: number; // Backend returns Integer (SERIAL), but we convert to string for form inputs
		flowActionId: string;
		startAt: string;
		endAt: string;
	}>;
	operations: PSPOperation[];
	flowTarget: PSPFlowTarget;
	currencies?: Record<string, PSPCurrency[]>;
}

export interface PSPCurrency {
	currency: string;
	limits: {
		minValue: number | null;
		maxValue: number | null;
	} | null;
}

// Transaction Limits types
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
	id: number; // Backend returns Integer (SERIAL), but we convert to string for form inputs
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

// Interface for creating/updating transaction limits (uses PSPRequest)
export interface TransactionLimitCreateUpdate {
	name: string;
	currency: string;
	countries: string[];
	customerTags: string[];
	status: "ENABLED" | "DISABLED";
	pspActions: PSPAction[];
	psps: PSPRequest[]; // Uses PSPRequest array for create/update requests
}

export interface TransactionLimitsResponse {
	timestamp: string;
	code: string;
	message: string;
	data: TransactionLimit[];
}

export interface PSPDetailsResponse {
	success: boolean;
	timestamp: string;
	code: string;
	message: string;
	data: PSPDetails;
}

// Flow Action types
export interface FlowAction {
	id: string;
	name: string;
	steps: string[];
	flowTypeId: string;
	inputSchema: string;
	outputSchema: string;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	updatedBy: string;
}

// Fee types
export interface FeeComponent {
	id: string; // Backend returns TEXT (not SERIAL) from database
	type: "FIXED" | "PERCENTAGE";
	amount: number;
	minValue: number | null;
	maxValue: number | null;
}

export interface Fee {
	id: number; // Backend returns Integer (SERIAL), but we convert to string for form inputs
	version: number;
	name: string;
	currency: string;
	chargeFeeType: "INCLUSIVE" | "EXCLUSIVE";
	brandId: string;
	environmentId: string;
	flowActionId: string;
	status: "ENABLED" | "DISABLED";
	components: FeeComponent[];
	countries: string[];
	psps: Array<{ id: string; name: string }>;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	updatedBy: string;
}

export interface FeeCreatePayload {
	name: string;
	currency: string;
	chargeFeeType: "INCLUSIVE" | "EXCLUSIVE";
	status: "ENABLED" | "DISABLED";
	flowActionId: string;
	components: Array<{
		type: "FIXED" | "PERCENTAGE";
		amount: number;
		minValue?: number;
		maxValue?: number;
	}>;
	countries: string[];
	psps: Array<{ id: string }>;
}

export interface FeeUpdatePayload extends FeeCreatePayload {}

export interface FeeResponse {
	success: boolean;
	timestamp: string;
	code: string;
	message: string;
	data: Fee[];
}

export interface FeeSingleResponse {
	success: boolean;
	timestamp: string;
	code: string;
	message: string;
	data: Fee;
}

export interface RiskRule {
	id: number; // Backend returns Integer (SERIAL), but we convert to string for form inputs
	version: number;
	name: string;
	type: "DEFAULT" | "CUSTOMER";
	action: "BLOCK" | "ALERT";
	currency: string;
	duration: "HOUR" | "DAY" | "WEEK" | "MONTH";
	maxAmount: number;
	brandId: string;
	environmentId: string;
	flowActionId: string;
	flowActionName: string;
	criteriaType: "TAG" | "ACCOUNT_TYPE";
	criteriaValue: string[] | string;
	status: "ENABLED" | "DISABLED";
	psps: PSPResponse[];
}

// Base interface for risk rule payloads
export interface RiskRulePayloadBase {
	name: string;
	type: "DEFAULT" | "CUSTOMER";
	action: "BLOCK" | "ALERT";
	currency: string;
	duration: "HOUR" | "DAY" | "WEEK" | "MONTH";
	maxAmount: number;
	flowActionId: string;
	status: "ENABLED" | "DISABLED";
	psps: Array<{ id: string }>; // API expects PSPRequest for create/update
}

// Interface for DEFAULT type (no criteria fields)
export interface RiskRulePayloadDefault extends RiskRulePayloadBase {
	type: "DEFAULT";
}

// Interface for CUSTOMER type (requires criteria fields)
export interface RiskRulePayloadCustomer extends RiskRulePayloadBase {
	type: "CUSTOMER";
	criteriaType: "TAG" | "ACCOUNT_TYPE";
	criteriaValue: string[] | string; // API expects JSON string
}

// Union type for create payload
export type RiskRuleCreatePayload =
	| RiskRulePayloadDefault
	| RiskRulePayloadCustomer;

// Union type for update payload
export type RiskRuleUpdatePayload = RiskRuleCreatePayload;

export interface RiskRuleResponse {
	success: boolean;
	timestamp: string;
	code: string;
	message: string;
	data: RiskRule[];
}

export interface RiskRuleSingleResponse {
	success: boolean;
	timestamp: string;
	code: string;
	message: string;
	data: RiskRule;
}

// PSP Groups types
export interface PSP {
	id: string;
	name: string;
}

export interface PSPGroup {
	id: number; // Backend returns Integer (SERIAL), but we convert to string for form inputs
	version: number;
	brandId: string;
	environmentId: string;
	name: string;
	flowActionId: string;
	flowActionName: string;
	currency: string;
	status: "ENABLED" | "DISABLED";
	psps: PSP[];
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	updatedBy: string;
}

export interface PSPGroupFormData {
	name: string;
	flowActionId: string;
	currency: string;
	status: "ENABLED" | "DISABLED";
	psps: string[];
	description?: string;
}

export interface PSPGroupCreatePayload {
	name: string;
	flowActionId: string;
	currency: string;
	status: "ENABLED" | "DISABLED";
	psps: Array<{ id: string }>;
	description?: string;
}

export interface PSPGroupUpdatePayload {
	name: string;
	flowActionId: string;
	currency: string;
	status: "ENABLED" | "DISABLED";
	psps: Array<{ id: string }>;
	description?: string;
}

export interface PSPGroupResponse {
	success: boolean;
	timestamp: string;
	code: string;
	message: string;
	data: PSPGroup[];
}

export interface PSPGroupSingleResponse {
	success: boolean;
	timestamp: string;
	code: string;
	message: string;
	data: PSPGroup;
}

// Webhook types
export interface Webhook {
	id: number; // Backend returns SMALLSERIAL (Small Integer), but we convert to string for form inputs
	statusType: "SUCCESS" | "FAILURE" | "NOTIFICATION";
	url: string;
	retry: number;
	brandId: string;
	environmentId: string;
	status: "ENABLED" | "DISABLED";
	apiKey?: string | null;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	updatedBy: string;
}

export interface WebhookFormData {
	statusType: "SUCCESS" | "FAILURE" | "NOTIFICATION";
	url: string;
	retry: string;
	status: "ENABLED" | "DISABLED";
	apiKey?: string;
}

export interface WebhookCreatePayload {
	statusType: "SUCCESS" | "FAILURE" | "NOTIFICATION";
	url: string;
	retry: number;
	status: "ENABLED" | "DISABLED";
	apiKey?: string;
}

export interface WebhookUpdatePayload {
	statusType: "SUCCESS" | "FAILURE" | "NOTIFICATION";
	url: string;
	retry: number;
	status: "ENABLED" | "DISABLED";
	apiKey?: string;
}

export interface WebhookResponse {
	success: boolean;
	timestamp: string;
	code: string;
	message: string;
	data: Webhook[];
}

export interface WebhookSingleResponse {
	success: boolean;
	timestamp: string;
	code: string;
	message: string;
	data: Webhook;
}

// Routing Rules types
export interface RoutingRule {
	id: number; // Backend returns Integer (SERIAL), but we convert to string for form inputs
	version: number;
	name: string;
	brandId: string;
	environmentId: string;
	pspSelectionMode: "WEIGHTAGE" | "PRIORITY";
	conditionJson: Record<string, unknown>;
	routingType?: "COUNT" | "AMOUNT" | "PERCENTAGE";
	duration?: "HOUR" | "DAY" | "WEEK" | "MONTH";
	status: "ENABLED" | "DISABLED";
	psps: Array<{
		pspId: string;
		pspOrder: number;
	}>;
	createdAt: string;
	updatedAt: string;
	createdBy: string;
	updatedBy: string;
}

export interface RoutingRuleResponse {
	timestamp: string;
	code: string;
	message: string;
	data: RoutingRule[];
}

export interface RoutingRuleCreatePayload {
	name: string;
	pspSelectionMode: "WEIGHTAGE" | "PRIORITY";
	conditionJson: Record<string, unknown>;
	routingType?: "COUNT" | "AMOUNT" | "PERCENTAGE";
	duration?: "HOUR" | "DAY" | "WEEK" | "MONTH";
	psps: Array<{
		pspId: string;
		pspOrder: number;
	}>;
}

export interface RoutingRuleUpdatePayload {
	name: string;
	pspSelectionMode: "WEIGHTAGE" | "PRIORITY";
	conditionJson: Record<string, unknown>;
	routingType?: "COUNT" | "AMOUNT" | "PERCENTAGE";
	duration?: "HOUR" | "DAY" | "WEEK" | "MONTH";
	psps: Array<{
		pspId: string;
		pspOrder: number;
	}>;
}

// Brand Roles Types
export interface BrandRole {
	id: number; // Backend returns Integer (SERIAL), but we convert to string for form inputs
	name: string;
	permission: string; // JSON string
	brandId: string;
	environmentId: string;
	createdAt: string;
	updatedAt: string;
}

export interface BrandRolesResponse {
	data: BrandRole[];
	total: number;
	page: number;
	limit: number;
}

export interface CreateBrandRoleRequest {
	name: string;
	permission: string; // JSON string
}

export interface UpdateBrandRoleRequest {
	name: string;
	permission: string; // JSON string
}

// Permissions Types
export interface ModulePermissions {
	[module: string]: {
		actions: string[];
	};
}

export interface ApiModulePermissions {
	[module: string]: {
		available_actions: string[];
	};
}

export interface PermissionsResponse {
	data: ModulePermissions;
}
