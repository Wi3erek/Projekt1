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

const loginsave = localStorage.getItem("loginsave")
if (loginsave) {
    loggedas(loginsave)
}
//zalogowano jako...

const logout = document.getElementById("logout")
if (logout) {
    logout.addEventListener("click", logmeout)
}

const artbox = document.getElementById("center")
if (artbox) {
    const artykuly = await articleread()
    console.log(artykuly);
    for (let i = 0; i < artykuly.length; i++) {
        let artid = artykuly[i].id
        let artauthor = artykuly[i].author
        let artdate = artykuly[i].date
        let arttitle = artykuly[i].title
        let arttext = artykuly[i].article

        const artDiv = document.createElement('div')
        artDiv.setAttribute('class', 'art')
        artDiv.setAttribute('id', 'art' + artid)

        // zawartosc artykułów
        const authorElem = document.createElement('author')
        authorElem.innerHTML = artauthor

        const dateElem = document.createElement('time')
        dateElem.innerHTML = artdate

        const titleElem = document.createElement('h3')
        titleElem.innerHTML = arttitle

        const textElem = document.createElement('p')
        textElem.innerHTML = arttext

        // przyciski edycji/usuwania
        const buttonContainer = document.createElement('div')
        buttonContainer.setAttribute('class', 'button-container')

        const buttonEdit = document.createElement('button')
        buttonEdit.setAttribute('class', 'art-button')
        buttonEdit.setAttribute('onclick', 'articleEdit("art" + ' + artid + ')')
        buttonEdit.innerHTML = "Edytuj"

        const buttonDel = document.createElement('button')
        buttonDel.setAttribute('class', 'art-button')
        buttonDel.setAttribute('onclick', 'articleDel("art" + ' + artid + ')')
        buttonDel.innerHTML = "Usuń"

        buttonContainer.appendChild(buttonEdit)
        buttonContainer.appendChild(buttonDel)

        artDiv.appendChild(authorElem)
        artDiv.appendChild(dateElem)
        artDiv.appendChild(titleElem)
        artDiv.appendChild(textElem)
        artDiv.appendChild(buttonContainer)

        artbox.appendChild(artDiv)
    }
}
// dodawanie artykułów z bazy danych do strony

// ------------------------------------------
async function articleEdit(x) { //edytowanie artykułu
    console.log("edytowanie artykułu", x);

}
window.articleEdit = articleEdit


async function articleDel(x) { // usuwanie artykułu
    console.log("usuwanie artykułu", x);

}
window.articleDel = articleDel



async function articleread() {
    const { data, error } = await supabase
        .from('artykuly')
        .select('*')
    if (error) {
        console.error("Błąd pobierania:", error)
        return
    }
    return data

}

async function logmeout() {
    localStorage.removeItem("loginsave")
    window.location = "index.html" //zmienic na login.html
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


