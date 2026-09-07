import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export type Direction = "ltr" | "rtl";

const RTL_LANGUAGES = ["ar"]; // Add more RTL languages as needed

export function useDirection(): Direction {
	const { i18n } = useTranslation();
	const currentLanguage = i18n.language;

	const direction: Direction = RTL_LANGUAGES.includes(currentLanguage)
		? "rtl"
		: "ltr";

	// Update document direction when language changes
	useEffect(() => {
		const htmlElement = document.documentElement;
		htmlElement.dir = direction;
		htmlElement.lang = currentLanguage;

		// Also set it on the body for extra safety
		document.body.dir = direction;
	}, [direction, currentLanguage]);

	return direction;
}
