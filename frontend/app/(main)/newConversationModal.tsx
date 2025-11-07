import Avatar from "@/components/Avatar";
import BackButton from "@/components/BackButton";
import Header from "@/components/Header";
import ScreenWrapper from "@/components/ScreenWrapper";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import Input from "@/components/Input";
import Typo from "@/components/Typo";
import { useAuth } from "@/context/authContext";
import Button from "@/components/Button";
import { verticalScale } from "@/utils/styling";
import { getContacts, newConversation } from "@/socket/socketEvents";
import { uploadImageToCloudinary } from "@/services/imageService";

const NewConversationModal = () => {
  const router = useRouter();
  const { isGroup } = useLocalSearchParams();
  const isGroupMode = isGroup == "1";

  const { user: currentUser } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [groupAvatar, setGroupAvatar] = useState<{ uri: string } | null>(null);
  const [groupName, setGroupName] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);

  const processGetContacts = (res: any) => {
    // console.log("got contacts : ", res);
    if (res.success) {
      setContacts(res.data);
    }
  };
  const processNewConversation = (res: any) => {
    // console.log("new conv message ==> : ", res.data.participants);
    setIsLoading(false);
    if (res.success) {
      router.back();
      router.push({
        pathname: "/(main)/conversation",
        params: {
          id: res.data._id,
          name: res.data.name,
          avatar: res.data.avatar,
          type: res.data.type,
          participants: JSON.stringify(res.data.participants),
        },
      });
    } else {
      console.log("Error fetching/creating conversation", res.msg);
      Alert.alert("Error", res.msg);
    }
  };

  useEffect(() => {
    getContacts(processGetContacts);
    newConversation(processNewConversation);
    getContacts(null); //skip off ...

    return () => {
      getContacts(processGetContacts, true);
      newConversation(processNewConversation, true);
    };
  }, []);

  const onPickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      // allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    console.log(result);

    if (!result.canceled) {
      setGroupAvatar(result.assets[0]);
    }
  };

  const toggleParticipant = (user: any) => {
    setSelectedParticipants((prev: any) => {
      if (prev.includes(user.id)) {
        return prev.filter((id: string) => id !== user.id);
      }
      return [...prev, user.id];
    });
  };

  const onSelectUser = (user: any) => {
    if (!currentUser) {
      Alert.alert("Authentification", "Please login to start a conversation");
      return;
    }

    if (isGroupMode) {
      toggleParticipant(user);
    } else {
      newConversation({
        type: "direct",
        participants: [currentUser.id, user.id],
      });
    }
  };

  const creatGroup = async () => {
    if (!groupName.trim() || !currentUser || selectedParticipants.length < 2)
      return;

    setIsLoading(true);
    try {
      let avatar = null;
      if (groupAvatar) {
        const uploadResult = await uploadImageToCloudinary(
          groupAvatar,
          "group-avatars"
        );
        if (uploadResult) avatar = uploadResult.data;
      }
      newConversation({
        type: "group",
        participants: [currentUser.id, ...selectedParticipants],
        name: groupName,
        avatar,
      });
    } catch (error: any) {
      console.log("Error creating group: ", error);
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper isModal={true}>
      <View style={styles.container}>
        <Header
          title={isGroupMode ? "New Group" : "Select User"}
          leftIcon={<BackButton color={colors.black} />}
        />

        {isGroupMode && (
          <View style={styles.groupInfoContainer}>
            <View style={styles.avatrContainer}>
              <TouchableOpacity onPress={onPickImage}>
                <Avatar
                  uri={groupAvatar?.uri || null}
                  size={100}
                  isGroup={true}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.groupNameContainer}>
              <Input
                placeholder="Group Name"
                value={groupName}
                onChangeText={setGroupName}
              />
            </View>
          </View>
        )}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contactList}
        >
          {contacts.map((user: any, index) => {
            const isSelected = selectedParticipants.includes(user.id);
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.contactRow,
                  isSelected && styles.selectedContact,
                ]}
                onPress={() => onSelectUser(user)}
              >
                <Avatar size={45} uri={user.avatar} />
                <Typo fontWeight={"500"}>{user.name}</Typo>
                {isGroupMode && (
                  <View style={styles.selectionIndicator}>
                    <View
                      style={[styles.checkbox, isSelected && styles.checked]}
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {isGroupMode && selectedParticipants.length >= 2 && (
          <View style={styles.createGroupButton}>
            <Button
              onPress={creatGroup}
              disabled={!groupName.trim()}
              loading={isLoading}
            >
              <Typo fontWeight={"bold"} size={17}>
                Create Group
              </Typo>
            </Button>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default NewConversationModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: spacingX._15,
  },
  groupInfoContainer: {
    alignItems: "center",
    marginTop: spacingY._10,
  },
  avatrContainer: {
    marginBottom: spacingY._10,
  },
  groupNameContainer: {
    width: "100%",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
    paddingVertical: spacingY._5,
  },
  selectedContact: {
    backgroundColor: colors.neutral100,
    borderRadius: radius._15,
  },
  contactList: {
    gap: spacingY._12,
    marginTop: spacingY._10,
    paddingTop: spacingY._10,
    paddingBottom: verticalScale(150),
  },
  selectionIndicator: {
    marginLeft: "auto",
    marginRight: spacingX._10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  checked: {
    backgroundColor: colors.primary,
  },
  createGroupButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacingX._15,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral200,
  },
});
