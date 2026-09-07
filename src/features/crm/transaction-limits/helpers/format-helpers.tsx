import { Avatar, AvatarGroup, Badge, HStack, Text } from "@chakra-ui/react";
import ReactCountryFlag from "react-country-flag";
import { useTranslation } from "react-i18next";
import { Tooltip } from "@/components/ui/Tooltip/tooltip";

/**
 * Format countries display with react-country-flag
 */
export const useFormatCountries = () => {
	const { t } = useTranslation();

	return (countries: string[]) => {
		const visibleCountries = countries.slice(0, 3);
		const remainingCount = countries.length - 3;

		return (
			<AvatarGroup gap="0" size="sm" spaceX="-4">
				{visibleCountries.map((country) => {
					return (
						<Avatar.Root key={country} size="xs" title={country}>
							<Avatar.Fallback asChild>
								<ReactCountryFlag
									countryCode={country}
									style={{
										width: "100%",
										height: "100%",
										objectFit: "cover",
									}}
									svg
								/>
							</Avatar.Fallback>
						</Avatar.Root>
					);
				})}
				{remainingCount > 0 && (
					<Avatar.Root
						bg="primary.subtle"
						color="primary.fg"
						title={t("transactionLimits.moreCountries", {
							count: remainingCount,
						})}
						variant="solid"
					>
						<Avatar.Fallback>+{remainingCount}</Avatar.Fallback>
					</Avatar.Root>
				)}
			</AvatarGroup>
		);
	};
};

/**
 * Format PSPs display
 */
export const useFormatPSPs = () => {
	return (psps: { id: string; name: string }[]) => {
		const visiblePSPs = psps.slice(0, 3);
		const remainingCount = psps.length - 3;

		return (
			<HStack gap={1} wrap="wrap">
				{visiblePSPs.map((psp) => (
					<Tooltip content={psp.name} key={psp.id}>
						<Badge
							bg="secondary.subtle"
							color="secondary.solid"
							fontSize="xs"
							fontWeight="normal"
							maxWidth="120px"
						>
							<Text
								minW={0}
								overflow="hidden"
								textOverflow="ellipsis"
								w="full"
								whiteSpace="nowrap"
							>
								{psp.name}
							</Text>
						</Badge>
					</Tooltip>
				))}
				{remainingCount > 0 && (
					<Badge
						bg="secondary.subtle"
						color="secondary.solid"
						fontSize="xs"
						fontWeight="normal"
						variant="subtle"
					>
						+{remainingCount}
					</Badge>
				)}
			</HStack>
		);
	};
};

/**
 * Format amount range display
 */
export const formatAmountRange = (min: number, max: number): string => {
	return `${min.toFixed(2)} - ${max.toFixed(2)}`;
};

/**
 * Format date display
 */
export const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	return date
		.toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		})
		.replace(",", " |");
};
