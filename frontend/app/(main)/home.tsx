import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/Typo";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/context/authContext";
import { verticalScale } from "@/utils/styling";
import * as Icons from "phosphor-react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import ConversationItem from "@/components/ConversationItem";
import Loading from "@/components/Loading";
import Button from "@/components/Button";
import { getConversations, newConversation } from "@/socket/socketEvents";
import { ConversationProps, ResponseProps } from "@/types";

const Home = () => {
  const router = useRouter();
  const { user: currentUser, signOut } = useAuth();
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<ConversationProps[]>([]);

  const processConversations = (res: ResponseProps) => {
    // console.log("res:", res);
    if (res.success) {
      setConversations(res.data);
    }
  };
  const newConversationHandler = (res: ResponseProps) => {
    // console.log("res:", res);
    if (res.success && res.data?.isNew) {
      setConversations((prev) => [...prev, res.data]);
    }
  };

  useEffect(() => {
    getConversations(processConversations);
    newConversation(newConversationHandler);
    getConversations(null);

    return () => {
      getConversations(processConversations, true);
      newConversation(newConversationHandler, true);
    };
  }, []);

  let directConversations = conversations
    .filter((c: ConversationProps) => c.type === "direct")
    .sort((a: ConversationProps, b: ConversationProps) => {
      const aDate = a?.lastMessage?.createdAt || a.createdAt;
      const bDate = b?.lastMessage?.createdAt || b.createdAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });

  let groupConversations = conversations
    .filter((c: ConversationProps) => c.type === "group")
    .sort((a: ConversationProps, b: ConversationProps) => {
      const aDate = a?.lastMessage?.createdAt || a.createdAt;
      const bDate = b?.lastMessage?.createdAt || b.createdAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });

  const handleLogout = async () => {
    await signOut();
  };
  return (
    <ScreenWrapper showPattern={true} bgOpacity={0.4}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Typo
              color={colors.neutral200}
              size={19}
              textProps={{ numberOfLines: 1 }}
            >
              Welcome back ,{" "}
              <Typo fontWeight={"800"} color={colors.white} size={20}>
                {currentUser?.name} 💪
              </Typo>
            </Typo>
          </View>
          <TouchableOpacity
            style={styles.settingIcon}
            onPress={() => {
              router.push("/(main)/profileModal");
            }}
          >
            <Icons.GearSixIcon
              size={verticalScale(22)}
              color={colors.white}
              weight="fill"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: spacingY._20 }}
          >
            <View style={styles.navBar}>
              <View style={styles.tabs}>
                <TouchableOpacity
                  onPress={() => setSelectedTab(0)}
                  style={[
                    styles.tabStyle,
                    selectedTab === 0 && styles.activeTabStyle,
                  ]}
                >
                  <Typo>Direct Messages</Typo>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSelectedTab(1)}
                  style={[
                    styles.tabStyle,
                    selectedTab === 1 && styles.activeTabStyle,
                  ]}
                >
                  <Typo>Groups</Typo>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.conversationList}>
              {selectedTab === 0 &&
                directConversations.map((item: ConversationProps, index) => {
                  return (
                    <ConversationItem
                      item={item}
                      key={index}
                      router={router}
                      showDivider={directConversations.length !== index}
                    />
                  );
                })}
              {selectedTab === 1 &&
                groupConversations.map((item: ConversationProps, index) => {
                  return (
                    <ConversationItem
                      item={item}
                      key={index}
                      router={router}
                      showDivider={directConversations.length !== index}
                    />
                  );
                })}
            </View>

            {!loading &&
              selectedTab === 0 &&
              directConversations.length === 0 && (
                <Typo style={{ textAlign: "center" }}>
                  No direct conversations yet.
                </Typo>
              )}

            {!loading &&
              selectedTab === 1 &&
              groupConversations.length === 0 && (
                <Typo style={{ textAlign: "center" }}>
                  No group conversations yet.
                </Typo>
              )}

            {loading && <Loading />}
          </ScrollView>
        </View>
      </View>
      <Button
        style={styles.floatingButton}
        onPress={() =>
          router.push({
            pathname: "/(main)/newConversationModal",
            params: { isGroup: selectedTab },
          })
        }
      >
        <Icons.PlusIcon
          size={verticalScale(24)}
          color={colors.black}
          weight="bold"
        />
      </Button>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacingX._20,
    gap: spacingX._15,
    paddingTop: spacingY._15,
    paddingBottom: spacingY._12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius._50,
    borderTopRightRadius: radius._50,
    borderCurve: "continuous",
    overflow: "hidden",
    paddingHorizontal: spacingX._20,
  },
  navBar: {
    flexDirection: "row",
    gap: spacingX._15,
    alignItems: "center",
    paddingHorizontal: spacingX._10,
  },
  tabs: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacingX._10,
  },
  tabStyle: {
    paddingVertical: spacingY._10,
    paddingHorizontal: spacingX._20,
    borderRadius: radius.full,
    backgroundColor: colors.neutral100,
  },
  activeTabStyle: {
    backgroundColor: colors.primaryLight,
  },
  conversationList: {
    paddingVertical: spacingY._20,
  },
  settingIcon: {
    padding: spacingY._10,
    backgroundColor: colors.neutral700,
    borderRadius: radius.full,
  },

  floatingButton: {
    height: verticalScale(50),
    width: verticalScale(50),
    borderRadius: 100,
    position: "absolute",
    bottom: verticalScale(30),
    right: verticalScale(30),
  },
});
