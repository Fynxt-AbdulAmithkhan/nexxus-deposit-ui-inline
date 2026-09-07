import { getAllISOCodes } from "iso-country-currency";

export type CurrencyOption = {
	value: string;
	label: string;
};

export type CountryOption = {
	value: string;
	label: string;
};

/**
 * Generate currency options from iso-country-currency package
 * Returns unique currencies with their codes and names
 */
export function getCurrencyOptions(): CurrencyOption[] {
	try {
		// Get all country and currency data from the package
		const countryCurrencyData = getAllISOCodes();

		// Create a map to track unique currencies
		const currencyMap = new Map<string, CurrencyOption>();

		// Process currency data from the package
		for (const data of countryCurrencyData) {
			if (data?.currency) {
				const currencyCode = data.currency;
				// const countryName = data.countryName || '';

				// Create a more descriptive label
				const label = `${currencyCode}`;

				// Only add if not already present (avoid duplicates)
				if (!currencyMap.has(currencyCode)) {
					currencyMap.set(currencyCode, {
						value: currencyCode,
						label,
					});
				}
			}
		}

		// Convert map to array and sort alphabetically by currency code
		const options = Array.from(currencyMap.values()).sort((a, b) =>
			a.value.localeCompare(b.value),
		);

		return options;
	} catch (error) {
		console.error("Error generating currency options:", error);

		// Fallback to a basic set of common currencies
		return [
			{ value: "USD", label: "USD - US Dollar" },
			{ value: "EUR", label: "EUR - Euro" },
			{ value: "GBP", label: "GBP - British Pound Sterling" },
			{ value: "JPY", label: "JPY - Japanese Yen" },
			{ value: "CAD", label: "CAD - Canadian Dollar" },
			{ value: "AUD", label: "AUD - Australian Dollar" },
			{ value: "CHF", label: "CHF - Swiss Franc" },
			{ value: "CNY", label: "CNY - Chinese Yuan" },
			{ value: "SEK", label: "SEK - Swedish Krona" },
			{ value: "NZD", label: "NZD - New Zealand Dollar" },
		];
	}
}

/**
 * Get currency options for specific countries
 * @param countryCodes Array of ISO country codes
 * @returns Currency options for the specified countries
 */
export function getCurrencyOptionsForCountries(
	countryCodes: string[],
): CurrencyOption[] {
	try {
		const countryCurrencyData = getAllISOCodes();
		const currencyMap = new Map<string, CurrencyOption>();

		for (const countryCode of countryCodes) {
			const countryData = countryCurrencyData.find(
				(c) => c.iso === countryCode,
			);
			if (countryData?.currency) {
				// const label = `${countryData.currency} - ${countryData.countryName || ''}`;
				const label = `${countryData.currency}`;

				currencyMap.set(countryData.currency, {
					value: countryData.currency,
					label,
				});
			}
		}

		return Array.from(currencyMap.values()).sort((a, b) =>
			a.value.localeCompare(b.value),
		);
	} catch (error) {
		console.error("Error generating currency options for countries:", error);
		return getCurrencyOptions(); // Fallback to all currencies
	}
}

/**
 * Get popular/commonly used currencies
 * @returns Array of popular currency options
 */
export function getPopularCurrencyOptions(): CurrencyOption[] {
	const popularCurrencyCodes = [
		"USD",
		"EUR",
		"GBP",
		"JPY",
		"CAD",
		"AUD",
		"CHF",
		"CNY",
		"SEK",
		"NZD",
		"INR",
		"BRL",
		"MXN",
		"SGD",
		"HKD",
		"KRW",
		"TRY",
		"RUB",
		"ZAR",
		"THB",
	];

	try {
		const allOptions = getCurrencyOptions();
		return allOptions.filter((option) =>
			popularCurrencyCodes.includes(option.value),
		);
	} catch (error) {
		console.error("Error getting popular currency options:", error);
		return getCurrencyOptions();
	}
}

/**
 * Get country options from iso-country-currency package
 * Returns countries with their ISO codes and names
 */
export function getCountryOptions(): CountryOption[] {
	try {
		const countryCurrencyData = getAllISOCodes();

		return countryCurrencyData
			.filter((data) => data.iso && data.countryName)
			.map((data) => ({
				value: data.iso,
				label: data.countryName,
			}))
			.sort((a, b) => a.label.localeCompare(b.label));
	} catch (error) {
		console.error("Error generating country options:", error);

		// Fallback to a basic set of common countries
		return [
			{ value: "US", label: "United States" },
			{ value: "CA", label: "Canada" },
			{ value: "GB", label: "United Kingdom" },
			{ value: "DE", label: "Germany" },
			{ value: "FR", label: "France" },
			{ value: "IT", label: "Italy" },
			{ value: "JP", label: "Japan" },
			{ value: "AU", label: "Australia" },
			{ value: "BR", label: "Brazil" },
			{ value: "IN", label: "India" },
			{ value: "SG", label: "Singapore" },
			{ value: "AE", label: "United Arab Emirates" },
			{ value: "CH", label: "Switzerland" },
			{ value: "NZ", label: "New Zealand" },
			{ value: "NL", label: "Netherlands" },
			{ value: "BE", label: "Belgium" },
			{ value: "AT", label: "Austria" },
			{ value: "ES", label: "Spain" },
			{ value: "PT", label: "Portugal" },
			{ value: "IE", label: "Ireland" },
		];
	}
}
