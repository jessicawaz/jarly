import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Octicons from "@expo/vector-icons/Octicons";

export const jars = [
  {
    name: "Needs",
    desc: "Groceries, bills, rent...",
    color: "#FF8B6B",
    textColor: "#C05A40",
    light: "#FFEAE4",
    icon: <FontAwesome6 name="person-shelter" size={20} color="black" />,
  },
  {
    name: "Goals",
    desc: "Saving toward something",
    color: "#6BC5A0",
    textColor: "#3A8A68",
    light: "#E0F5EC",
    icon: <Octicons name="goal" size={20} color="black" />,
  },
  {
    name: "Fun",
    desc: "Eating out, hobbies...",
    color: "#FFD166",
    textColor: "#9A7800",
    light: "#FFF5D6",
    icon: (
      <MaterialCommunityIcons name="party-popper" size={20} color="black" />
    ),
  },
];

export const calculateNeedsSpentPct = (spent, needsAmt) => {
  return needsAmt > 0 ? Math.round((spent / needsAmt) * 100) : 0;
};

export const calculateGoalsSpentPct = (spent, goalsAmt) => {
  return goalsAmt > 0 ? Math.round((spent / goalsAmt) * 100) : 0;
};

export const calculateFunSpentPct = (spent, funAmt) => {
  return funAmt > 0 ? Math.round((spent / funAmt) * 100) : 0;
};
