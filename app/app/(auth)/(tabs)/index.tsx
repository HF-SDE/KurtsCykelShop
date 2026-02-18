import React, { useEffect, useState } from "react";
import { Dimensions, Modal, TouchableOpacity, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

// import ResetPasswordModal from "../profile/reset-password";
// import TemplateLayout from "@/components/TemplateLayout";
// import LoadingPage from "@/components/LoadingPage";
// import { useThemeColor } from "@/hooks/useThemeColor";
import { useUserProfile } from "@/hooks/useUserProfile";

import { useSession } from "@/app/ctx";

// import Button from "@/components/DefaultButton";

export default function UserProfileScreen() {
  const { userProfile, isLoading, error } = useUserProfile();
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

  if (isLoading) return <Text> Loading...</Text>;

  return (
    // <TemplateLayout pageName="ProfilePage">
    <View className={`bg-background-0 flex-1 items-center justify-between px-5 ${isLandscape ? "flex-row items-start justify-start" : ""}`}>
      <View className={`w-full max-w-[400px] flex-1 justify-between px-5 ${isLandscape ? "flex-row items-center justify-between" : ""}`}>
        <View className={`items-center pt-10 ${isLandscape ? "flex-row pr-[50px]" : ""}`}>
          <View
            className={`bg-background-100 border-background-200 h-[150px] w-[150px] items-center justify-center rounded-full border-8 ${isLandscape ? "mb-0 mr-5" : "mb-5"}`}
          >
            <Text className="text-typography-900 text-[40px] font-bold">{userProfile?.initials || "?"}</Text>
          </View>
          <View className="w-full">
            <Text className="text-typography-900 w-full text-left text-2xl font-bold">Hi, {userProfile?.name || "N/A"}</Text>
            <Text className="text-typography-900 mb-1.5 w-full text-left text-base">Email: {userProfile?.email || "N/A"}</Text>
          </View>
        </View>

        <View className={`min-h-[180px] justify-center pb-5 pt-10 ${isLandscape ? "min-w-[230px] pb-0" : ""}`}>
          <Button onPress={() => setIsModalVisible(true)}>
            <Text className="text-primary-0">Change Password</Text>
          </Button>

          <Button onPress={signOut}>
            <Text className="text-primary-0">Sign Out</Text>
          </Button>
        </View>
      </View>

      <Modal
        animationType="none"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)} // Close modal on Android back button
      >
        <View className="h-full w-full flex-1 items-center justify-center bg-black/50">
          <View className="bg-background-0 min-h-[400px] w-[90%] max-w-[400px] rounded-[10px] p-2.5">
            {/* <ResetPasswordModal onClose={() => setIsModalVisible(false)} /> */}
          </View>
        </View>
      </Modal>
    </View>
    // </TemplateLayout>
  );
}
