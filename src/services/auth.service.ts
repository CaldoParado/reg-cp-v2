import pb from "./pb.service";
import { authUser } from "./stores.service";

export const credentials = {
    kiosk: 'cpquiosco',
    register: '123456789'
}

function logout(from: string) {
    if (from === 'kiosk')
        return
    if (from === 'admin'){
        login('register', credentials['register'])
    }else{
        login('kiosk', credentials['kiosk'])
    }
}

async function login(user: string, pass: string) {
    pb.authStore.clear();
    try {
        const authData = await pb.collection('users').authWithPassword(
            user,
            pass,
        );
        authUser.set(pb.authStore.model);
        return authData;
    } catch (e) {
        throw new Error("Fallo en la autenticación, revise la contraseña");
    }
}

function getAuth() {
    return pb.authStore.model;
}

export { login, logout, getAuth }