import { createContext } from "react";

const AppContext = createContext({
  cookTable: [],
  showAlertDialog: () => {},
});

export default AppContext;
