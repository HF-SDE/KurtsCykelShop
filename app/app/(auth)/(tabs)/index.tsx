import React, { useEffect, useState } from "react";
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useSession } from "@/app/ctx";

// import ResetPasswordModal from "../profile/reset-password";
// import TemplateLayout from "@/components/TemplateLayout";
// import LoadingPage from "@/components/LoadingPage";
// import { useThemeColor } from "@/hooks/useThemeColor";
// import { useUserProfile } from "@/hooks/useUserProfile";
// import Button from "@/components/DefaultButton";

export default function UserProfileScreen() {
  // const { userProfile, isLoading, error } = useUserProfile();
  const [isModalVisible, setIsModalVisible] = useState(false); // State to control modal visibility
  const { signOut, session } = useSession();

  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const onChange = ({ window }: { window: any }) => {
      setIsLandscape(window.height < 600);
    };
    Dimensions.addEventListener("change", onChange);
    return () => {
      // Dimensions.removeEventListener("change", onChange);
    };
  }, []);

  // if (isLoading) {
  //   return <Text />;
  // }

  return (
    // <TemplateLayout pageName="ProfilePage">
    <View style={[styles.container, isLandscape && styles.containerLandscape]}>
      <View style={[styles.contentContainer, isLandscape && styles.contentContainerLandscape]}>
        <View style={[styles.topContainer, isLandscape && styles.topContainerLandscape]}>
          {/* <View
            style={[
              styles.avatar,
              {
                backgroundColor: theme.accent,
                borderColor: theme.primary,
              },
              isLandscape && styles.avatarLandscape,
            ]}
          >
            <Text style={[styles.avatarText, { color: theme.text }]}>
              {userProfile?.initials || "?"}
            </Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.nameText, { color: theme.text }]}>
              Hi, {userProfile?.name || "N/A"}
            </Text>
            <Text style={[styles.infoText, { color: theme.text }]}>
              Email: {userProfile?.email || "N/A"}
            </Text>
          </View> */}
        </View>

        <View style={[styles.buttonContainer, isLandscape && styles.buttonContainerLandscape]}>
          {/* <Button
            title="Change Password"
            onPress={() => setIsModalVisible(true)}
          />
          <Button title={"Log Out"} onPress={signOut} /> */}
        </View>
      </View>

      <Modal
        animationType="none"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)} // Close modal on Android back button
      >
        <View style={styles.modalOverlay}>
          {/* <View
            style={[styles.modalContent, { backgroundColor: theme.primary }]}
          >
            <ResetPasswordModal onClose={() => setIsModalVisible(false)} />
          </View> */}
        </View>
      </Modal>
    </View>
    // </TemplateLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  containerLandscape: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  contentContainer: {
    flex: 1,
    maxWidth: 400,
    width: "100%",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  contentContainerLandscape: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topContainer: {
    alignItems: "center",
    paddingTop: 40,
  },
  topContainerLandscape: {
    flexDirection: "row",
    paddingRight: 50,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 8,
  },
  avatarLandscape: {
    marginBottom: 0,
    marginRight: 20,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
  },
  nameText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "left",
    width: "100%",
  },
  infoText: {
    fontSize: 16,
    textAlign: "left",
    width: "100%",
    marginBottom: 5,
  },
  buttonContainer: {
    justifyContent: "center",
    paddingTop: 40,

    paddingBottom: 20,
    minHeight: 180,
  },
  buttonContainerLandscape: {
    paddingBottom: 0,
    minWidth: 230,
  },
  button: {
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    minHeight: 400,
    padding: 10,
    borderRadius: 10,
  },
  textContainer: {
    width: "100%",
  },
});
