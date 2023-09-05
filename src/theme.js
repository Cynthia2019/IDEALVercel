import { grey, red } from "@mui/material/colors";
// Create a theme instance.
export const getDesignTokens = (mode) => ({
	palette: {
	  mode,
	  ...(mode === 'light'
		? {
			// palette values for light mode
			primary: {
				main: "#F4ECF7"
			},
			divider: "#4E2A84",
			background: {
				default: "#fff",
				paper: "#fff",
			  },
			text: {
			  primary: '#000',
			  secondary: grey[800],
			},
			warning: {
			  main: red[500],
			},
		  }
		: {
			// palette values for dark mode
			primary: {
				main: "#F4ECF7"
			},
			divider: "#4E2A84",
			background: {
			  default: "#fff",
			  paper: "#4E2A84",
			},
			text: {
			  primary: "#4E2A84",
			  secondary: "#fff"
			},
			warning: {
				main: red[500],
			  },
		  }),
	},
  });

  

