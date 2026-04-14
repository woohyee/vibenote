import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { getFirebaseAuth } from "./firebase";

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  try {
    // 먼저 팝업 시도
    const result = await signInWithPopup(getFirebaseAuth(), googleProvider);
    return result.user;
  } catch {
    // 팝업 차단 시 리다이렉트로 폴백
    await signInWithRedirect(getFirebaseAuth(), googleProvider);
    return null;
  }
}

export async function signOut() {
  await firebaseSignOut(getFirebaseAuth());
}
