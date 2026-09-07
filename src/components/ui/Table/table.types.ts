import type {
	ColumnDef,
	ColumnFiltersState,
	PaginationState,
	SortingState,
	Table as TanTable,
	VisibilityState,
} from "@tanstack/react-table";
import type { ReactNode } from "react";

/**
 * Extended column definition that adds tooltip functionality
 */
export type ExtendedColumnDef<TData, TValue = unknown> = ColumnDef<
	TData,
	TValue
> & {
	/**
	 * Whether to show tooltip for this column header
	 * @default false
	 */
	enableTooltip?: boolean;
	/**
	 * Custom tooltip content (overrides header text)
	 */
	tooltipContent?: string;
	/**
	 * Whether this column should be sticky (left or right)
	 */
	sticky?: "left" | "right";
	/**
	 * Z-index for sticky column (higher values appear on top)
	 */
	stickyZIndex?: number;
};

export interface TableProps<TData, TValue> {
	/**
	 * The data to display in the table
	 */
	data: TData[];
	/**
	 * Column definitions for the table
	 */
	columns: ExtendedColumnDef<TData, TValue>[];
	/**
	 * Whether the table is loading
	 */
	isLoading?: boolean;
	/**
	 * Whether to enable server-side rendering features
	 */
	isServerSide?: boolean;
	/**
	 * Total number of items for server-side pagination
	 */
	totalCount?: number;
	/**
	 * Current page for server-side pagination
	 */
	pageIndex?: number;
	/**
	 * Page size for server-side pagination
	 */
	pageSize?: number;
	/**
	 * Callback when pagination changes (for server-side)
	 */
	onPaginationChange?: (pagination: PaginationState) => void;
	/**
	 * Callback when sorting changes (for server-side)
	 */
	onSortingChange?: (sorting: SortingState) => void;
	/**
	 * Callback when column filters change (for server-side)
	 */
	onColumnFiltersChange?: (filters: ColumnFiltersState) => void;
	/**
	 * Callback when column visibility changes (for server-side)
	 */
	onColumnVisibilityChange?: (visibility: VisibilityState) => void;
	/**
	 * Whether to show pagination controls
	 */
	showPagination?: boolean;
	/**
	 * Whether to show global search
	 */
	showGlobalSearch?: boolean;
	/**
	 * Global search value
	 */
	globalSearchValue?: string;
	/**
	 * Callback when global search changes
	 */
	onGlobalSearchChange?: (value: string) => void;
	/**
	 * Placeholder text for global search
	 */
	globalSearchPlaceholder?: string;
	/**
	 * Custom empty state component
	 */
	emptyState?: ReactNode;
	/**
	 * Custom loading state component
	 */
	loadingState?: ReactNode;
	/**
	 * Additional CSS classes
	 */
	className?: string;
	/**
	 * Table variant
	 */
	variant?: "outline" | "line" | undefined;
	/**
	 * Table size
	 */
	size?: "sm" | "md" | "lg";
	/**
	 * Whether to enable row selection
	 */
	enableRowSelection?: boolean;
	/**
	 * Selected row IDs
	 */
	selectedRowIds?: string[];
	/**
	 * Callback when row selection changes
	 */
	onRowSelectionChange?: (selectedRowIds: string[]) => void;
	/**
	 * Row ID accessor function
	 */
	getRowId?: (row: TData) => string;
	/**
	 * Maximum height of the table container (enables scrolling)
	 * Examples:
	 * - 'calc(100vh - 300px)' (default - fits screen with 300px for other UI)
	 * - 'calc(100vh - 200px)' (less space for other UI)
	 * - '500px' (fixed height)
	 * - 'auto' (no scroll, natural height)
	 */
	maxHeight?: string | number;
	/**
	 * Whether to enable sticky header
	 */
	stickyHeader?: boolean;
	/**
	 * Additional toolbar actions
	 */
	actions?: ReactNode;
	/**
	 * Callback when a row is clicked
	 */
	onRowClick?: (row: TData) => void;
}

export interface TablePaginationProps<TData> {
	/**
	 * The table instance to control pagination
	 */
	table: TanTable<TData>;
	/**
	 * Total number of items (for info text)
	 */
	totalCount: number;
	/**
	 * Available page sizes
	 */
	pageSizeOptions?: number[];
	/**
	 * Whether pagination is disabled
	 */
	isDisabled?: boolean;
}

export interface TableToolbarProps {
	/**
	 * Global search value
	 */
	globalSearchValue?: string;
	/**
	 * Callback when global search changes
	 */
	onGlobalSearchChange?: (value: string) => void;
	/**
	 * Placeholder text for global search
	 */
	globalSearchPlaceholder?: string;
	/**
	 * Whether to show global search
	 */
	showGlobalSearch?: boolean;
	/**
	 * Whether to show column visibility toggle
	 */
	showColumnVisibility?: boolean;
	/**
	 * Column visibility state
	 */
	columnVisibility?: VisibilityState;
	/**
	 * Callback when column visibility changes
	 */
	onColumnVisibilityChange?: (visibility: VisibilityState) => void;
	/**
	 * Available columns for visibility toggle
	 */
	columns?: Array<{ id: string; header: string }>;
	/**
	 * Additional toolbar actions
	 */
	actions?: ReactNode;
}

export interface TableState {
	/**
	 * Sorting state
	 */
	sorting: SortingState;
	/**
	 * Column filters state
	 */
	columnFilters: ColumnFiltersState;
	/**
	 * Column visibility state
	 */
	columnVisibility: VisibilityState;
	/**
	 * Row selection state
	 */
	rowSelection: Record<string, boolean>;
	/**
	 * Pagination state
	 */
	pagination: PaginationState;
	/**
	 * Global filter value
	 */
	globalFilter: string;
}
