import axios from "axios";
import {useStore} from "vuex";
import {computed, onMounted, ref} from "vue";
import {API_URL, USER_API_URL} from "@/common/API";
import {newGuid} from "@/common/GuidLogic";

export function useUser() {
    const user = ref(
        {
            id: '',
            phone: '',
            login: '',
            password: '',
        })

    const isAdmin = ref(false)
    const store = useStore()

    const login = async () => {
        //TODO
        const response = await axios.get(API_URL + USER_API_URL + '/?phone=' + user.value.phone
            + "&password=" + user.value.password);

        if (response.data.length === 1) {
            localStorage.setItem("userID", response.data[0].id)
            localStorage.setItem("Login", response.data[0].login)
            store.commit("setIsAuth", true)
            store.commit("setLogin")
        } else {
            store.commit("setErrorMessage", "Неверно указан логин или пароль")
        }
        checkAdminRole()
    }

    const register = async () => {
        const response = await axios.get(API_URL + USER_API_URL + '/?login=' + user.value.login);
        if (response.data.length === 0) {
            localStorage.setItem("userID", user.value.id)
            localStorage.setItem("Login", user.value.login)
            store.commit("setIsAuth", true)
            store.commit("setLogin")
            const newUser = {
                id: newGuid(),
                login: user.value.login,
                password: user.value.password,
                phone: user.value.phone
            }
            await axios.post(API_URL + USER_API_URL + "/", newUser);
            localStorage.setItem("userID", newUser.id)
        } else {
            store.commit("setErrorMessage", "Пользователь с этим логином уже существует")
        }
        checkAdminRole()
    }

    const signOut = () => {
        localStorage.removeItem("userID")
        localStorage.removeItem("Login")
        store.commit("setIsAuth", false)
        checkAdminRole()

    }

    const checkAuth = () =>{
        store.dispatch("checkAuth")
    }

    const checkAdminRole = () =>{

        if (localStorage.getItem("Login") === 'admin'){
            isAdmin.value = true
        }
        else{
            isAdmin.value = false
        }
        store.commit("setIsAdmin", isAdmin)
    }

    const getLoginByID = async (id) => {
        const response = await axios.get(API_URL + USER_API_URL + '/?id=' + id);
        return response.data[0]
    }

    onMounted(checkAuth)
    onMounted(checkAdminRole)
    computed(checkAdminRole)

    return {
        register, login, signOut,
        checkAuth, checkAdminRole,
        getLoginByID, user, isAdmin
    }
}