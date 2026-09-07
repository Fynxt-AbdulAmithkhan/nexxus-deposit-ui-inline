import type { ReactNode } from "react";

export interface TabItem {
	id: string;
	label: string;
	content: ReactNode;
	disabled?: boolean;
}

export interface TabsProps {
	items: TabItem[];
	defaultActiveTab?: string;
	activeTab?: string;
	onTabChange?: (tabId: string) => void;
	variant?: "default" | "pills" | "underline";
	size?: "sm" | "md" | "lg";
	className?: string;
	tabListClassName?: string;
	tabClassName?: string;
	activeTabClassName?: string;
	contentClassName?: string;
	stickyHeader?: boolean;
	fullHeight?: boolean;
}
