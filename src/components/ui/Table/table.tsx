/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: <complex> */
import {
	Box,
	Center,
	EmptyState,
	Flex,
	Image,
	Skeleton,
	Spinner,
	Table,
	Text,
	VStack,
} from "@chakra-ui/react";
import {
	type ColumnDef,
	type ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type Header,
	type OnChangeFn,
	type PaginationState,
	type RowSelectionState,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import Icon from "../Icon/icon";
import { Tooltip } from "../Tooltip/tooltip";
import type { ExtendedColumnDef, TableProps } from "./table.types";
import { TablePagination } from "./table-pagination";
import { TableToolbar } from "./table-toolbar";

// Common height calculations for different layouts
export const TABLE_HEIGHTS = {
	// Full page table (minimal header/footer)
	FULL_PAGE: "calc(100vh - 200px)",
	// Standard page with header and navigation
	STANDARD: "calc(100vh - 380px)",
	// Page with dense header/navigation/breadcrumbs
	DENSE: "calc(100vh - 300px)",
	// Mobile friendly
	MOBILE: "calc(100vh - 250px)",
	// Medium fixed height
	MEDIUM: "500px",
	// Large fixed height
	LARGE: "700px",
} as const;

const HeaderCell = <TData,>({ header }: { header: Header<TData, unknown> }) => {
	const canSort = header.column.getCanSort();
	const sortDirection = header.column.getIsSorted();

	// Cast to ExtendedColumnDef to access tooltip properties
	const columnDef = header.column.columnDef as ExtendedColumnDef<
		TData,
		unknown
	>;

	// Determine tooltip content
	const headerText =
		typeof columnDef.header === "string" ? columnDef.header : "";
	const tooltipContent = columnDef.tooltipContent || headerText;

	// Check if tooltip should be enabled (default to false if not specified)
	const enableTooltip = columnDef.enableTooltip === true && tooltipContent;

	// Calculate sticky styles
	const stickyStyles: React.CSSProperties = {
		width: header.getSize(),
	};

	if (columnDef.sticky) {
		stickyStyles.position = "sticky";
		stickyStyles.zIndex = columnDef.stickyZIndex || 10;
		stickyStyles.backgroundColor = "#fafafa";

		if (columnDef.sticky === "left") {
			stickyStyles.left = 0;
		} else if (columnDef.sticky === "right") {
			stickyStyles.right = 0;
		}
	}

	return (
		<Table.ColumnHeader
			cursor={canSort ? "pointer" : "default"}
			onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
			p={3}
			style={stickyStyles}
		>
			<Flex align="center" gap={2}>
				<Box
					color="fg.muted"
					flex={1}
					fontWeight="regular"
					gap={2}
					textStyle="xs"
				>
					{header.isPlaceholder
						? null
						: flexRender(header.column.columnDef.header, header.getContext())}
				</Box>
				{enableTooltip && (
					<Tooltip content={tooltipContent}>
						<Icon color="gray" name="circle-info" size="sm" />
					</Tooltip>
				)}

				{canSort && (
					<VStack gap={0}>
						<Icon
							color={sortDirection === "asc" ? "gray" : "lightGray"}
							name="chevron-up"
							size="2xs"
						/>
						<Icon
							color={sortDirection === "desc" ? "gray" : "lightGray"}
							name="chevron-down"
							size="2xs"
						/>
					</VStack>
				)}
			</Flex>
		</Table.ColumnHeader>
	);
};

export function DataTable<TData, TValue>(
	props: TableProps<TData, TValue>,
): React.JSX.Element {
	const {
		data,
		columns,
		isLoading = false,
		isServerSide = false,
		totalCount,
		pageIndex = 0,
		pageSize = 10,
		onPaginationChange,
		onSortingChange,
		onColumnFiltersChange,
		onColumnVisibilityChange,
		showPagination = true,
		showGlobalSearch = true,
		globalSearchValue = "",
		onGlobalSearchChange,
		globalSearchPlaceholder = "Search...",
		// emptyState,
		// loadingState,
		className,
		size = "sm",
		enableRowSelection = false,
		onRowSelectionChange,
		getRowId,
		maxHeight,
		actions,
		onRowClick,
	} = props;
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [globalFilter, setGlobalFilter] = useState(globalSearchValue);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex,
		pageSize: showPagination
			? pageSize
			: data.length || Number.MAX_SAFE_INTEGER,
	});

	// Update internal state when props change (for server-side)
	useEffect(() => {
		if (isServerSide) {
			setPagination({ pageIndex, pageSize });
		} else if (!showPagination) {
			// When pagination is disabled, show all rows
			setPagination({
				pageIndex: 0,
				pageSize: data.length || Number.MAX_SAFE_INTEGER,
			});
		}
	}, [isServerSide, pageIndex, pageSize, showPagination, data.length]);

	useEffect(() => {
		setGlobalFilter(globalSearchValue);
	}, [globalSearchValue]);

	// Enhanced columns with selection if enabled
	const enhancedColumns = useMemo(() => {
		if (!enableRowSelection) {
			return columns;
		}

		const selectionColumn: ExtendedColumnDef<TData, TValue> = {
			id: "select",
			header: ({ table: tableInstance }) => {
				return (
					<input
						aria-label="Select all rows"
						checked={tableInstance.getIsAllPageRowsSelected()}
						onChange={tableInstance.getToggleAllPageRowsSelectedHandler()}
						ref={(el) => {
							if (el) {
								el.indeterminate = tableInstance.getIsSomePageRowsSelected();
							}
						}}
						type="checkbox"
					/>
				);
			},
			cell: ({ row }) => (
				<input
					aria-label={`Select row ${row.id}`}
					checked={row.getIsSelected()}
					onChange={row.getToggleSelectedHandler()}
					type="checkbox"
				/>
			),
			enableSorting: false,
			enableHiding: false,
			size: 50,
			enableTooltip: false, // Disable tooltip for selection column
		};

		return [selectionColumn, ...columns];
	}, [columns, enableRowSelection]);

	// Handle state changes with proper updater functions
	const handleSortingChange: OnChangeFn<SortingState> = (updaterOrValue) => {
		const newSorting =
			typeof updaterOrValue === "function"
				? updaterOrValue(sorting)
				: updaterOrValue;
		setSorting(newSorting);
		if (isServerSide && onSortingChange) {
			onSortingChange(newSorting);
		}
	};

	const handleColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (
		updaterOrValue,
	) => {
		const newFilters =
			typeof updaterOrValue === "function"
				? updaterOrValue(columnFilters)
				: updaterOrValue;
		setColumnFilters(newFilters);
		if (isServerSide && onColumnFiltersChange) {
			onColumnFiltersChange(newFilters);
		}
	};

	const handleColumnVisibilityChange: OnChangeFn<VisibilityState> = (
		updaterOrValue,
	) => {
		const newVisibility =
			typeof updaterOrValue === "function"
				? updaterOrValue(columnVisibility)
				: updaterOrValue;
		setColumnVisibility(newVisibility);
		if (isServerSide && onColumnVisibilityChange) {
			onColumnVisibilityChange(newVisibility);
		}
	};

	const handlePaginationChange: OnChangeFn<PaginationState> = (
		updaterOrValue,
	) => {
		const result =
			typeof updaterOrValue === "function"
				? updaterOrValue(pagination)
				: updaterOrValue;
		// Always create a fresh object to ensure React state updates
		const newPagination: PaginationState = {
			pageIndex: result.pageIndex,
			pageSize: result.pageSize,
		};
		setPagination(newPagination);
		if (isServerSide && onPaginationChange) {
			onPaginationChange({ ...newPagination });
		}
	};

	const handleGlobalFilterChange = (value: string) => {
		setGlobalFilter(value);
		if (onGlobalSearchChange) {
			onGlobalSearchChange(value);
		}
	};

	const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (
		updaterOrValue,
	) => {
		const newSelection =
			typeof updaterOrValue === "function"
				? updaterOrValue(rowSelection)
				: updaterOrValue;
		setRowSelection(newSelection);
		if (onRowSelectionChange) {
			const selectedIds = Object.keys(newSelection).filter(
				(key) => newSelection[key],
			);
			onRowSelectionChange(selectedIds);
		}
	};

	// Initialize table
	const table = useReactTable({
		data,
		columns: enhancedColumns as ColumnDef<TData, TValue>[],
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
			pagination,
			globalFilter,
		},
		onSortingChange: handleSortingChange,
		onColumnFiltersChange: handleColumnFiltersChange,
		onColumnVisibilityChange: handleColumnVisibilityChange,
		onPaginationChange: handlePaginationChange,
		onRowSelectionChange: handleRowSelectionChange,
		onGlobalFilterChange: handleGlobalFilterChange,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel:
			isServerSide || !showPagination ? undefined : getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		getRowId,
		manualPagination: isServerSide,
		manualSorting: isServerSide,
		manualFiltering: isServerSide,
		pageCount:
			isServerSide && totalCount ? Math.ceil(totalCount / pageSize) : undefined,
		enableRowSelection,
		enableMultiRowSelection: enableRowSelection,
	});

	/* Empty State */

	if (!(isLoading || globalFilter) && table.getRowModel().rows.length === 0) {
		return (
			<VStack align="end" gap={4}>
				{actions}
				<Center h="45vh" w="full">
					<EmptyState.Root>
						<EmptyState.Content>
							<EmptyState.Indicator>
								<Image
									alt="No data found"
									h="120px"
									objectFit="fill"
									src="/svg/not-found.svg"
									w="120px"
								/>
							</EmptyState.Indicator>
							<VStack textAlign="center">
								<EmptyState.Title>No data available</EmptyState.Title>
								<EmptyState.Description>
									Looks like you haven't set any data yet. Start by adding some
									here.
								</EmptyState.Description>
							</VStack>
						</EmptyState.Content>
					</EmptyState.Root>
				</Center>
			</VStack>
		);
	}

	// Note: Loading and empty states are rendered inline inside the table body now

	return (
		<Box borderRadius="lg" className={className} p={2}>
			{/* Toolbar */}
			{showGlobalSearch && (
				<TableToolbar
					actions={actions}
					columns={enhancedColumns.map((col) => {
						const extendedCol = col as ExtendedColumnDef<TData, TValue>;
						return {
							id: extendedCol.id || "",
							header:
								typeof extendedCol.header === "string"
									? extendedCol.header
									: extendedCol.id || "",
						};
					})}
					globalSearchPlaceholder={globalSearchPlaceholder}
					globalSearchValue={globalFilter}
					onGlobalSearchChange={handleGlobalFilterChange}
					showGlobalSearch={showGlobalSearch}
				/>
			)}
			{/* Table Container with ScrollArea */}
			<Box position="relative">
				{/* Loading Overlay */}
				{isLoading && (
					<Box
						alignItems="center"
						aria-busy
						backdropFilter="blur(2px)"
						bg="bg.subtle"
						borderRadius="lg"
						display="flex"
						inset={0}
						justifyContent="center"
						opacity={0.7}
						position="absolute"
						zIndex={15}
					>
						<Box alignItems="center" display="flex">
							<Spinner size="lg" />
							<Text color="fg.default" fontWeight="medium" ml={3}>
								Loading...
							</Text>
						</Box>
					</Box>
				)}

				<Table.ScrollArea borderWidth="1px" maxHeight={maxHeight} rounded="lg">
					<Table.Root size={size} stickyHeader>
						<Table.Header>
							<Table.Row bg="bg.subtle">
								{table
									.getHeaderGroups()
									.map((headerGroup) =>
										headerGroup.headers.map((header) => (
											<HeaderCell<TData> header={header} key={header.id} />
										)),
									)}
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{/* Loading Skeletons */}
							{isLoading &&
								table.getRowModel().rows.length === 0 &&
								Array.from({ length: pagination.pageSize || 10 }).map(
									(_, index) => (
										<Table.Row key={`skeleton-row-${Date.now()}-${index}`}>
											<Table.Cell colSpan={table.getAllLeafColumns().length}>
												<Skeleton borderRadius="sm" height="40px" my={1} />
											</Table.Cell>
										</Table.Row>
									),
								)}

							{globalFilter && table.getRowModel().rows.length === 0 && (
								<Table.Row>
									<Table.Cell
										border={0}
										colSpan={table.getAllLeafColumns().length}
									>
										<Center h="45vh" w="full">
											<EmptyState.Root>
												<EmptyState.Content>
													<EmptyState.Indicator>
														<Image
															alt="No data found"
															h="120px"
															objectFit="fill"
															src="/svg/not-found.svg"
															w="120px"
														/>
													</EmptyState.Indicator>
													<VStack textAlign="center">
														<EmptyState.Title>
															No results found
														</EmptyState.Title>
														<EmptyState.Description>
															Try adjusting your search criteria
														</EmptyState.Description>
													</VStack>
												</EmptyState.Content>
											</EmptyState.Root>
										</Center>
									</Table.Cell>
								</Table.Row>
							)}

							{/* Data Rows */}
							{table.getRowModel().rows.map((row) => (
								<Table.Row
									_hover={onRowClick ? { bg: "gray.50" } : undefined}
									cursor={onRowClick ? "pointer" : "default"}
									key={row.id}
									onClick={
										onRowClick ? () => onRowClick(row.original) : undefined
									}
									transition="background-color 0.15s"
								>
									{row.getVisibleCells().map((cell) => {
										// Cast to ExtendedColumnDef to access sticky properties
										const columnDef = cell.column
											.columnDef as ExtendedColumnDef<TData, unknown>;

										// Calculate sticky styles for cells
										const stickyStyles: React.CSSProperties = {};

										if (columnDef.sticky) {
											stickyStyles.position = "sticky";
											stickyStyles.zIndex = columnDef.stickyZIndex || 10;
											stickyStyles.backgroundColor = "#ffffff";

											if (columnDef.sticky === "left") {
												stickyStyles.left = 0;
											} else if (columnDef.sticky === "right") {
												stickyStyles.right = 0;
											}
										}

										return (
											<Table.Cell
												key={cell.id}
												px={4}
												py={3}
												style={stickyStyles}
											>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</Table.Cell>
										);
									})}
								</Table.Row>
							))}
						</Table.Body>
					</Table.Root>
				</Table.ScrollArea>
			</Box>

			{/* Pagination */}
			{showPagination && (
				<TablePagination
					isDisabled={isLoading}
					table={table}
					totalCount={isServerSide ? totalCount || 0 : data.length}
				/>
			)}
		</Box>
	);
}
