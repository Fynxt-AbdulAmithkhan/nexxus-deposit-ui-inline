import { Flex, Heading, Text, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { useDirection } from "@/hooks/use-direction";

interface PageHeaderProps {
	title: string;
	subtitle?: string;
	children?: ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
	const direction = useDirection();
	const alignItems = direction === "rtl" ? "end" : "start";

	return (
		<Flex align="center" justify="space-between" mb={6}>
			<VStack align={alignItems} gap={1}>
				<Heading size="lg">{title}</Heading>
				{subtitle && (
					<Text color="gray.600" fontSize="sm">
						{subtitle}
					</Text>
				)}
			</VStack>
			{children}
		</Flex>
	);
}
