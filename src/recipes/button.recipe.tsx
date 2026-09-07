import { defineRecipe } from "@chakra-ui/react";

export const buttonRecipe = defineRecipe({
	base: {
		// display: 'inline-flex',
		// alignItems: 'center',
		// justifyContent: 'center',
		// fontWeight: 'semibold',
		// borderRadius: 'md',
		// cursor: 'pointer',
		// transition: 'all 0.2s',
		// _disabled: {
		//   opacity: 0.4,
		//   cursor: 'not-allowed',
		// },
	},
	variants: {
		variant: {
			solid: {
				bg: "secondary.solid",
				color: "secondary.contrast",
				_hover: {
					bg: "secondary.solid",
				},
				_active: {
					bg: "secondary.solid",
				},
			},
			outline: {
				borderWidth: "1px",
				borderColor: "secondary.solid",
				color: "secondary.solid",
				_hover: {
					bg: "secondary.subtle",
				},
			},
			ghost: {
				color: "secondary.solid",
				_hover: {
					bg: "secondary.subtle",
				},
			},
		},
	},
	defaultVariants: {
		variant: "solid",
	},
});
