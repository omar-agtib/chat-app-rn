import Avatar from "@/components/Avatar";
import BackButton from "@/components/BackButton";
import Header from "@/components/Header";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/context/authContext";
import { scale, verticalScale } from "@/utils/styling";
import { useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import * as Icons from "phosphor-react-native";
import MessageItem from "@/components/MessageItem";
import { useState } from "react";
import Input from "@/components/Input";
import { Image } from "expo-image";

const Conversation = () => {
  const { user: currentUser } = useAuth();
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<{ uri: string } | null>(
    null
  );

  const {
    id: conversationId,
    name,
    participants: stringifiedParticipants,
    avatar,
    type,
  } = useLocalSearchParams();

  const participants = JSON.parse(stringifiedParticipants as string);

  let conversationAvatar = avatar;
  let isDirect = type == "direct";
  const otherParticipant = isDirect
    ? participants.find((p: any) => p._id != currentUser?.id)
    : null;

  if (isDirect && otherParticipant)
    conversationAvatar = otherParticipant.avatar;

  let conversationName = isDirect ? otherParticipant.name : name;

  const dummyMessages = [
    {
      id: "mgs_10",
      sender: {
        id: "user_2",
        name: "Jane Smith",
        avatar: null,
      },
      content: "That would be really useful",
      createdAt: "10:42 AM",
      isMe: false,
    },
    {
      id: "mgs_9",
      sender: {
        id: "me",
        name: "Me",
        avatar: null,
      },
      content: "Great yes thank you",
      createdAt: "10:42 AM",
      isMe: true,
    },
    {
      id: "mgs_8",
      sender: {
        id: "user_2",
        name: "Jane Smith",
        avatar: null,
      },
      content: "Did you manage to check the document I sent yesterday?",
      createdAt: "10:39 AM",
      isMe: false,
    },
    {
      id: "mgs_7",
      sender: {
        id: "me",
        name: "Me",
        avatar: null,
      },
      content: "Yes, I went through it last night. Looks solid!",
      createdAt: "10:40 AM",
      isMe: true,
    },
    {
      id: "mgs_6",
      sender: {
        id: "user_2",
        name: "Jane Smith",
        avatar: null,
      },
      content: "Awesome! I’ll finalize it and send it to the client then.",
      createdAt: "10:41 AM",
      isMe: false,
    },
    {
      id: "mgs_5",
      sender: {
        id: "me",
        name: "Me",
        avatar: null,
      },
      content: "Perfect, let me know if you need any help with the layout.",
      createdAt: "10:42 AM",
      isMe: true,
    },
    {
      id: "mgs_4",
      sender: {
        id: "user_2",
        name: "Jane Smith",
        avatar: null,
      },
      content: "Sure thing! I might ask you to review the summary part.",
      createdAt: "10:43 AM",
      isMe: false,
    },
    {
      id: "mgs_3",
      sender: {
        id: "me",
        name: "Me",
        avatar: null,
      },
      content: "Of course, send it over when ready.",
      createdAt: "10:44 AM",
      isMe: true,
    },
    {
      id: "mgs_2",
      sender: {
        id: "user_2",
        name: "Jane Smith",
        avatar: null,
      },
      content: "Will do. Thanks again for your help!",
      createdAt: "10:45 AM",
      isMe: false,
    },
    {
      id: "mgs_1",
      sender: {
        id: "me",
        name: "Me",
        avatar: null,
      },
      content: "Anytime 😊",
      createdAt: "10:46 AM",
      isMe: true,
    },
  ];

  const onPickFile = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      // allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    console.log(result);

    if (!result.canceled) {
      setSelectedFile(result.assets[0]);
    }
  };

  const onSend = async () => {};

  return (
    <ScreenWrapper showPattern={true} bgOpacity={0.5}>
      <KeyboardAvoidingView
        behavior={Platform.OS == "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Header
          style={styles.header}
          leftIcon={
            <View style={styles.headerLeft}>
              <BackButton />
              <Avatar
                size={40}
                uri={conversationAvatar as string}
                isGroup={type == "group"}
              />
              <Typo color={colors.white} fontWeight={"500"} size={22}>
                {conversationName}
              </Typo>
            </View>
          }
          rightIcon={
            <TouchableOpacity>
              <Icons.DotsThreeOutlineVerticalIcon
                weight="fill"
                color={colors.white}
              />
            </TouchableOpacity>
          }
        />
        <View style={styles.content}>
          <FlatList
            data={dummyMessages}
            inverted={true}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messagesContent}
            renderItem={({ item }) => (
              <MessageItem item={item} isDirect={isDirect} />
            )}
            keyExtractor={(item) => item.id}
          />
          <View style={styles.footer}>
            <Input
              value={message}
              onChangeText={setMessage}
              containerStyle={{
                paddingLeft: spacingX._10,
                paddingRight: scale(65),
                borderWidth: 0,
              }}
              placeholder="Type message"
              icon={
                <TouchableOpacity style={styles.inputIcon} onPress={onPickFile}>
                  <Icons.PlusIcon
                    color={colors.black}
                    weight="bold"
                    size={verticalScale(22)}
                  />
                  {selectedFile && selectedFile.uri && (
                    <Image
                      source={selectedFile.uri}
                      style={styles.selectedFile}
                    />
                  )}
                </TouchableOpacity>
              }
            />
            <View style={styles.inputRightIcon}>
              <TouchableOpacity style={styles.inputIcon} onPress={onSend}>
                <Icons.PaperPlaneTiltIcon
                  color={colors.black}
                  weight="fill"
                  size={verticalScale(22)}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default Conversation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacingX._15,
    paddingTop: spacingY._10,
    paddingBottom: spacingY._15,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._12,
  },
  inputRightIcon: {
    position: "absolute",
    right: scale(10),
    top: verticalScale(15),
    paddingLeft: spacingX._12,
    borderLeftWidth: 1.5,
    borderLeftColor: colors.neutral300,
  },
  selectedFile: {
    position: "absolute",
    height: verticalScale(38),
    width: verticalScale(38),
    borderRadius: radius.full,
    alignSelf: "center",
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius._50,
    borderTopRightRadius: radius._50,
    borderCurve: "continuous",
    overflow: "hidden",
    paddingHorizontal: spacingX._15,
  },
  inputIcon: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    padding: 8,
  },
  footer: {
    paddingTop: spacingY._7,
    paddingBottom: verticalScale(22),
  },
  messageContainer: {
    flex: 1,
  },
  messagesContent: {
    // padding:spacingX._15
    paddingTop: spacingY._20,
    paddingBottom: spacingY._10,
    gap: spacingY._12,
  },
  plusIcon: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    padding: 8,
  },
});
