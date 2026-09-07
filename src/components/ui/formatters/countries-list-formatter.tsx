import { Avatar, AvatarGroup } from "@chakra-ui/react";
import type React from "react";
import ReactCountryFlag from "react-country-flag";
import { useTranslation } from "react-i18next";

interface CountriesListFormatterProps {
	countries: string[];
	maxVisible?: number;
}

export const CountriesListFormatter: React.FC<CountriesListFormatterProps> = ({
	countries,
	maxVisible = 3,
}) => {
	const { t } = useTranslation();
	const visibleCountries = countries.slice(0, maxVisible);
	const remainingCount = countries.length - maxVisible;

	return (
		<AvatarGroup gap="0" size="sm" spaceX="-4">
			{visibleCountries.map((country) => (
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
			))}
			{remainingCount > 0 && (
				<Avatar.Root
					bg="primary.subtle"
					color="primary.fg"
					title={
						t("formatters.moreCountries", {
							count: remainingCount,
						}) || `${remainingCount} more countries`
					}
					variant="solid"
				>
					<Avatar.Fallback>+{remainingCount}</Avatar.Fallback>
				</Avatar.Root>
			)}
		</AvatarGroup>
	);
};
