import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colorPalettes } from "@/components/ui/gluestack-ui-provider/config";

type PaletteMode = keyof typeof colorPalettes;
type PaletteEntry = [string, string];

function toRgb(value: string) {
  return `rgb(${value.replace(/\s+/g, ", ")})`;
}

function getGroupName(token: string) {
  const name = token.replace("--color-", "");
  const parts = name.split("-");

  if (parts[0] === "background" && parts.length > 1 && Number.isNaN(Number(parts[1]))) {
    return "baggrund-special";
  }

  return parts[0] ?? "øvrig";
}

function sortByToken(a: PaletteEntry, b: PaletteEntry) {
  const aToken = a[0].replace("--color-", "");
  const bToken = b[0].replace("--color-", "");

  const aLastPart = aToken.split("-").at(-1) ?? "";
  const bLastPart = bToken.split("-").at(-1) ?? "";
  const aNumber = Number(aLastPart);
  const bNumber = Number(bLastPart);

  const bothNumbers = !Number.isNaN(aNumber) && !Number.isNaN(bNumber);

  if (bothNumbers) {
    return aNumber - bNumber;
  }

  return aToken.localeCompare(bToken);
}

function PaletteSection({ mode }: { mode: PaletteMode }) {
  const groups = Object.entries(colorPalettes[mode]).reduce<Record<string, PaletteEntry[]>>((acc, entry) => {
    const groupName = getGroupName(entry[0]);
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(entry);
    return acc;
  }, {});

  return (
    <View style={styles.modeSection}>
      {Object.entries(groups)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([groupName, entries]) => (
          <View key={`${mode}-${groupName}`} style={styles.groupSection}>
            <Text style={styles.groupTitle}>{groupName}</Text>
            {entries.sort(sortByToken).map(([token, value]) => {
              const tokenName = token.replace("--color-", "");
              return (
                <View key={`${mode}-${token}`} style={styles.swatchRow}>
                  <View style={[styles.swatch, { backgroundColor: toRgb(value) }]} />
                  <View style={styles.tokenMeta}>
                    <Text style={styles.tokenName}>{tokenName}</Text>
                    <Text style={styles.tokenValue}>{value}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
    </View>
  );
}

export default function ColorPreviewScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} stickyHeaderIndices={[2]}>
        <Text style={styles.screenTitle}>Temafarveoversigt</Text>
        <Text style={styles.screenSubtitle}>Fra gluestack-ui-provider/config.ts</Text>
        <View className="bg-primary-0 flex-row justify-between">
          <Text style={styles.modeTitle}>LYS</Text>
          <Text style={styles.modeTitle}>MØRK</Text>
        </View>
        <View style={styles.columns}>
          <PaletteSection mode="light" />
          <PaletteSection mode="dark" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  modeTitleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: "#f5f5f5",
    paddingBottom: 8,
  },
  columns: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#171717",
  },
  screenSubtitle: {
    fontSize: 13,
    color: "#525252",
  },
  modeSection: {
    flex: 1,
    gap: 10,
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#171717",
  },
  groupSection: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  groupTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#262626",
    textTransform: "capitalize",
  },
  swatchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d4d4d4",
  },
  tokenMeta: {
    flex: 1,
  },
  tokenName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#171717",
  },
  tokenValue: {
    fontSize: 12,
    color: "#525252",
  },
});
