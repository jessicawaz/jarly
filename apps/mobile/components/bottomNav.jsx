import { View, StyleSheet, Text, TouchableOpacity } from "react-native";

import { colors, fonts } from "../constants/colors";
import { PAGES } from "../constants/pages";
import { useRouter } from "expo-router";

export default function BottomNav({ currentPage }) {
  const router = useRouter();

  return (
    <View style={styles.navWrapper}>
      {PAGES.map((page) => {
        const isCurrentPage =
          currentPage.toLowerCase() == page.name?.toLowerCase();
        return (
          <TouchableOpacity
            key={page.order}
            onPress={() => {
              !isCurrentPage && router.push(page.route);
            }}
          >
            <View
              style={[styles.navItem, isCurrentPage && styles.activeNavItem]}
            >
              <View style={styles.navItemIcon}>{page.icon}</View>
              <Text
                style={[
                  styles.navItemText,
                  isCurrentPage && styles.activeNavItemText,
                ]}
              >
                {page.name}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  navWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    borderTopColor: colors.border,
    borderTopWidth: 2,
    padding: 10,
  },
  navItem: {
    width: 80,
    height: 50,
    padding: 4,
    marginBottom: 10,
    borderRadius: 10,
    marginLeft: "auto",
    marginRight: "auto",
  },
  activeNavItem: {
    backgroundColor: colors.needsLight,
  },
  navItemText: {
    fontSize: 12,
    textAlign: "center",
    margin: "auto",
    fontFamily: fonts.extra,
  },
  activeNavItemText: {
    color: colors.needs,
  },
  navItemIcon: {
    marginLeft: "auto",
    marginRight: "auto",
  },
});
