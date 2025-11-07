import Avatar from "@/components/Avatar";
import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import Header from "@/components/Header";
import Input from "@/components/Input";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/context/authContext";
import { updateProfile } from "@/socket/socketEvents";
import { UserDataProps } from "@/types";
import { scale, verticalScale } from "@/utils/styling";
import { useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { uploadImageToCloudinary } from "@/services/imageService";

const ProfileModal = () => {
  const router = useRouter();

  const { user, signOut, updateToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserDataProps>({
    name: "",
    email: "",
    avatar: null,
  });

  const processUpdateProfile = (res: any) => {
    console.log("Profile update response:", res);
    setLoading(false);
    if (res.success) {
      updateToken(res.data.token);
      router.back();
    } else {
      Alert.alert("Update Profile", res.msg || "Failed to update profile o");
    }
  };
  useEffect(() => {
    updateProfile(processUpdateProfile);

    return () => {
      updateProfile(processUpdateProfile, true);
    };
  }, []);

  useEffect(() => {
    setUserData({
      name: user?.name || "",
      email: user?.email || "",
      avatar: user?.avatar || null,
    });
  }, [user]);

  const onPickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      // allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    console.log(result);

    if (!result.canceled) {
      setUserData((prev) => ({ ...prev, avatar: result.assets[0] }));
    }
  };

  const onSubmit = async () => {
    let { name, avatar } = userData;
    if (!name.trim()) {
      Alert.alert("User", "Name cannot be empty");
      return;
    }

    let data = { name, avatar };

    if (avatar && avatar.uri) {
      setLoading(true);
      const res = await uploadImageToCloudinary(avatar, "profiles");
      // console.log("Upload image response:", res);
      if (res.success) {
        data.avatar = res.data;
      } else {
        setLoading(false);
        Alert.alert("Image upload", res.msg || "Failed to upload image");
        return;
      }
    }

    updateProfile(data);
  };
  const handleLogout = async () => {
    router.back();
    await signOut();
  };
  const showLogoutAlert = () => {
    Alert.alert("Confirm", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => {
          console.log("Cancel logout");
        },
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: handleLogout,
      },
    ]);
  };

  return (
    <ScreenWrapper isModal={true}>
      <View style={styles.container}>
        <Header
          title="Update Profile"
          leftIcon={
            Platform.OS === "android" && <BackButton color={colors.black} />
          }
          style={{ marginVertical: spacingY._15 }}
        />

        <ScrollView contentContainerStyle={styles.form}>
          <View style={styles.avatarContainer}>
            <Avatar uri={userData.avatar} size={170} />
            <TouchableOpacity style={styles.editIcon} onPress={onPickImage}>
              <Icons.PencilIcon
                size={verticalScale(20)}
                color={colors.neutral800}
              />
            </TouchableOpacity>
          </View>
          <View style={{ gap: spacingY._20 }}>
            <View style={styles.inputContainer}>
              <Typo style={{ paddingLeft: spacingX._10 }}>Email</Typo>
              <Input
                value={userData.email}
                containerStyle={{
                  borderColor: colors.neutral350,
                  paddingLeft: spacingX._20,
                  backgroundColor: colors.neutral300,
                }}
                onChangeText={(value) =>
                  setUserData((prev) => ({ ...prev, email: value }))
                }
                editable={false}
              />
            </View>
            <View style={styles.inputContainer}>
              <Typo style={{ paddingLeft: spacingX._10 }}>Name</Typo>
              <Input
                value={userData.name}
                containerStyle={{
                  borderColor: colors.neutral350,
                  paddingLeft: spacingX._20,
                  // backgroundColor: colors.neutral300,
                }}
                onChangeText={(value) =>
                  setUserData((prev) => ({ ...prev, name: value }))
                }
                // editable={false}
              />
            </View>
          </View>
        </ScrollView>
      </View>
      <View style={styles.footer}>
        {!loading && (
          <Button
            style={{
              backgroundColor: colors.rose,
              height: verticalScale(56),
              width: verticalScale(56),
            }}
            onPress={showLogoutAlert}
          >
            <Icons.SignOutIcon
              size={verticalScale(30)}
              color={colors.white}
              weight="bold"
            />
          </Button>
        )}
        <Button style={{ flex: 1 }} onPress={onSubmit} loading={loading}>
          <Typo fontWeight={"700"} color={colors.black}>
            Update
          </Typo>
        </Button>
      </View>
    </ScreenWrapper>
  );
};

export default ProfileModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacingY._20,
    // paddingVertical: spacingY._30,
  },

  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: spacingY._20,
    gap: scale(12),
    paddingTop: spacingY._10,
    borderTopColor: colors.neutral200,
    marginBottom: spacingY._10,
    borderTopWidth: 1,
  },
  form: { gap: spacingY._30, marginTop: spacingY._15 },
  avatarContainer: {
    position: "relative",
    alignSelf: "center",
  },
  avatar: {
    alignSelf: "center",
    backgroundColor: colors.neutral300,
    height: verticalScale(135),
    width: verticalScale(135),
    borderRadius: 200,
    borderWidth: 1,
    borderColor: colors.neutral500,
    // overflow:"hidden",
    // position:"relative",
  },
  editIcon: {
    position: "absolute",
    bottom: spacingY._5,
    right: spacingY._7,
    borderRadius: 100,
    backgroundColor: colors.neutral100,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    padding: spacingY._7,
  },
  inputContainer: {
    gap: spacingY._7,
  },
});
