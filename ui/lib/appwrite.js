import { useEffect, useState } from "react";
import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.ml.sem",
  // projectId: "684f3e910023bbb6e8ee",
  projectId: '684feac0001a1eb260e2',
//   storageId: "660d0e59e293896f1eaf",
  databaseId: "684ff00e0009ac98108a",
  userCollectionId: "684ff0400013b8928d93",
//   videoCollectionId: "660d157fcb8675efe308",
};

const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

export const account = new Account(client);
const storage = new Storage(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

// Register user
export async function createUser(email, password, username) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);

    const session = await signIn(email, password);

    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountID: newAccount.$id,
        email: email,
        username: username,
        avatar: avatarUrl,
      }
    );

    return session;
  } catch (error) {
    throw new Error(error);
  }
}

// Sign In
export async function signIn(email, password) {
  try {
    const session = await account.createEmailPasswordSession(email, password);

    return {uid: session.$id,};
  } catch (error) {
    throw new Error(error);
  }
}


// Get Current User
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
    return null;
  }
}

// Sign Out
export async function signOut() {
  try {
    const session = await account.deleteSession('current')
    // const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    throw new Error(error);
  }
}

// Get Account
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount.$id;
  } catch (error) {
    throw new Error(error);
  }
}

export async function getSession() {
  try {
    const session = await account.getSession('current');


    // const session = await account.get();
    if (session.$id == {"_h": 0, "_i": 0, "_j": null, "_k": null}) {
      console.log('sioidsojo')
    }
    return session.$id;
  } catch (error) {
    throw new Error(error);
  }
}

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await account.get();
        setUser(response.$id); // User is authenticated
        // Optionally update SecureStore
        // await SecureStore.setItemAsync('user', JSON.stringify(response));
      } catch (error) {
        // console.error('Auth check failed:', error.message);
        setUser(null); // No valid session
        // await SecureStore.deleteItemAsync('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { user, isLoading };
};