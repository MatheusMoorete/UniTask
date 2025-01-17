import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyD6Xqd5D_mBY_8OAUxmTYsS93fOr5D7RIo",
    authDomain: "unitask-792a4.firebaseapp.com",
    projectId: "unitask-792a4",
    storageBucket: "unitask-792a4.firebasestorage.app",
    messagingSenderId: "250467637574",
    appId: "1:250467637574:web:cada841434ac2ef476ed47",
    measurementId: "G-RNYGH3Z9BD"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export default app 