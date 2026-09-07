/**
 * Country-scope matching, mirroring the brand service's `CountryMatcher`.
 *
 * Rules (fees, transaction limits) carry a list of ISO 3166-1 alpha-2 codes; the
 * request carries one. A rule whose list does not cover the request's country is
 * out of scope and must simply be ignored — it must never be applied, and it must
 * never on its own reject the transaction.
 *
 * A rule with no configured countries is unrestricted. Codes are compared
 * case-insensitively and trimmed, so `us` matches `US`; anything that is not a
 * resolvable code (a display name such as `United States`) matches nothing.
 */
export function matchesCountry(
    configuredCountries: string[] | undefined | null,
    requestCountry: string | undefined | null,
): boolean {
    if (!configuredCountries || configuredCountries.length === 0) return true;

    const request = normalise(requestCountry);
    if (!request) return false;

    return configuredCountries.some((country) => normalise(country) === request);
}

function normalise(country: string | undefined | null): string | null {
    if (typeof country !== 'string') return null;
    const trimmed = country.trim().toUpperCase();
    return trimmed.length > 0 ? trimmed : null;
}
