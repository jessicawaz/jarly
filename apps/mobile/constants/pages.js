import AntDesign from "@expo/vector-icons/AntDesign";
import Octicons from "@expo/vector-icons/Octicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from "@expo/vector-icons/Feather";

export const PAGES = [
  {
    route: "/home",
    name: "Home",
    order: 1,
    icon: <AntDesign name="home" size={24} />,
  },
  {
    route: "/goals",
    name: "Goals",
    order: 2,
    icon: <Octicons name="goal" size={24} />,
  },
  {
    route: "/month",
    name: "Recap",
    order: 3,
    icon: <MaterialIcons name="calendar-month" size={24} />,
  },
  {
    route: "/settings",
    name: "Settings",
    order: 4,
    icon: <Feather name="settings" size={24} />,
  },
];
