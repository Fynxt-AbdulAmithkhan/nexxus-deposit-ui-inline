import { defineStyle } from "@chakra-ui/react";

export const floatingLabelStyles = defineStyle({
	pos: "absolute",
	bg: "bg",
	top: "-6",
	transition: "position",
	color: "fg.muted",
	fontFamily: "heading",
	fontSize: "2xs",
	fontWeight: "regular",
	zIndex: 1,
	"&[data-float]": {
		top: "-2.5",
		insetStart: "2",
		color: "fg.muted",
		fontFamily: "heading",
		fontSize: "2xs",
		fontWeight: "regular",
	},
});
