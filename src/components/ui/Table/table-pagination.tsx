import {
	Box,
	ButtonGroup,
	HStack,
	IconButton,
	Pagination,
	Text,
} from "@chakra-ui/react";
import { Icon } from "@/components/ui";
import type { TablePaginationProps } from "./table.types";

export function TablePagination<TData>({
	table,
	totalCount,
	pageSizeOptions = [10, 20, 50, 100],
	isDisabled = false,
}: TablePaginationProps<TData>): React.JSX.Element {
	const pageIndex = table.getState().pagination.pageIndex;
	const pageSize = table.getState().pagination.pageSize;
	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
	const startItem = totalCount === 0 ? 0 : pageIndex * pageSize + 1;
	const endItem = Math.min((pageIndex + 1) * pageSize, totalCount);

	const handlePageSizeChange = (
		event: React.ChangeEvent<HTMLSelectElement>,
	) => {
		const newPageSize = Number(event.target.value);
		// Update pagination in a single controlled update to guarantee new state
		table.setPagination({ pageIndex: 0, pageSize: newPageSize });
	};

	return (
		<Box borderColor="border" borderTop="1px" py={4}>
			<HStack gap={4} justify="space-between">
				{/* Page size selector */}
				<HStack align="center" gap={2}>
					<Text color="fg.muted" fontSize="sm">
						Show
					</Text>
					<Box>
						<select
							disabled={isDisabled}
							onChange={handlePageSizeChange}
							style={{
								padding: "4px 8px",
								borderRadius: "4px",
								border: "1px solid var(--ck-colors-border)",
								fontSize: "14px",
								width: "auto",
								minWidth: "60px",
							}}
							value={pageSize}
						>
							{pageSizeOptions.map((size: number) => (
								<option key={size} value={size}>
									{size}
								</option>
							))}
						</select>
					</Box>
					<Text color="fg.muted" fontSize="sm">
						entries
					</Text>
				</HStack>

				{/* Pagination info */}
				<Text color="fg.muted" fontSize="sm">
					Showing {startItem} to {endItem} of {totalCount} entries
				</Text>

				{/* Pagination controls (Chakra UI Pagination) */}
				<Pagination.Root
					count={totalCount}
					page={pageIndex + 1}
					pageSize={pageSize}
				>
					<ButtonGroup size="sm" variant="outline">
						<Pagination.PrevTrigger asChild>
							<IconButton
								aria-label="Previous page"
								color="fg.muted"
								disabled={pageIndex === 0 || isDisabled}
								onClick={() => table.previousPage()}
							>
								<Icon aria-hidden color="fg.subtle" name="chevron-left" />
							</IconButton>
						</Pagination.PrevTrigger>

						<Pagination.Items
							render={(page) => (
								<IconButton
									_selected={{
										bg: "secondary.solid",
										color: "secondary.contrast",
									}}
									aria-label={`Page ${page.value}`}
									key={page.value}
									minW="40px"
									onClick={() => table.setPageIndex(page.value - 1)}
									size="sm"
									variant={{ base: "outline", _selected: "solid" }}
								>
									{page.value}
								</IconButton>
							)}
						/>

						<Pagination.NextTrigger asChild>
							<IconButton
								aria-label="Next page"
								color="fg.muted"
								disabled={pageIndex === totalPages - 1 || isDisabled}
								onClick={() => table.nextPage()}
							>
								<Icon aria-hidden color="fg.subtle" name="chevron-right" />
							</IconButton>
						</Pagination.NextTrigger>
					</ButtonGroup>
				</Pagination.Root>
			</HStack>
		</Box>
	);
}
