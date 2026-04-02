import { supabase } from './supabaseClient.js'

const logbut = document.getElementById("loginbutton")
if (logbut) {
    logbut.addEventListener("click", loginF)
}
// przycisk logowania 

const regbut = document.getElementById("registerbutton")
if (regbut) {
    regbut.addEventListener("click", registerF)
}
//przycisk rejestracji



//zalogowano jako...



// ------------------------------------------
const loginsave = localStorage.getItem("loginsave")
if (loginsave) {
    loggedas(loginsave)
}
async function loggedas(login) {
    const logElem = document.getElementById("logas")
    if (logElem) {
        logElem.innerHTML = login
    }
}

async function logchecker(log, pass) {
    const { data, error } = await supabase
        .from('loginy')
        .select('login, password')
    if (error) {
        console.error("Błąd pobierania:", error)
        return
    }

    console.log(data);
    for (let i = 0; i < data.length; i++) {
        if (data[i].login == log && data[i].password == pass) {
            return true
        }
    }
    return false
}
// czy dane logowania sie zgadzają

async function loginF() {
    const login = document.getElementById("loglogin").value
    const passwd = document.getElementById("logpasswd").value
    console.log("Próba zalogowania: ", login, passwd);

    const isLogOK = await logchecker(login, passwd)
    console.log(isLogOK);
    if (isLogOK == true) {
        console.log("Zalogowano użytkownika", login);
        localStorage.setItem("loginsave", login)
        window.location.href = "index.html"
    }
    else {
        console.log("Błędny login lub hasło.");

    }
}
// logowanie


async function getLogins(log) {
    const { data, error } = await supabase
        .from('loginy')
        .select('login')
    if (error) {
        console.error("Błąd pobierania:", error)
        return
    }

    for (let i = 0; i < data.length; i++) {
        if (data[i].login == log) {
            return false
        }
    }
    return true
}
// czy loginu nie ma juz w bazie

async function registerF() {
    const login = document.getElementById("reglogin").value
    const passwd = document.getElementById("regpasswd").value
    const passwd2 = document.getElementById("regpasswd2").value
    console.log("login:", login, "| passwd:", passwd, "| passwd2", passwd2)

    const isLoginFree = await getLogins(login)

    if (isLoginFree == true) {
        if (passwd.length > 3) {
            if (passwd != passwd2) {
                console.log("ERROR: Hasła nie są takie same.");
            }
            else {
                console.log("rejestrowanie . . .");

                addUser(login, passwd)

            }
        }
        else {
            console.log("ERROR: Za krótkie hasło.");

        }

    }
    else {
        console.log("ERROR: Uzytkownik o takiej nazwie juz istnieje");
    }

}
// rejestracja

async function addUser(userlogin, userpasswd) {
    const { data, error } = await supabase
        .from('loginy')
        .insert([
            {
                login: userlogin,
                password: userpasswd
            }
        ])
    if (error) {
        console.error("Błąd dodawania użytkownika:", error.message)
        return false
    }
    console.log("Zarejestrowano użytkownika", userlogin);
    return true

}
// dodawanie do bazy danych (reg)


