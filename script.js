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

// generowanie artykułów na stronie
const sortby = document.getElementById("sortby").value
const artbox = document.getElementById("center")
if (artbox && sortby) {
    const artykuly = await articleread(sortby)
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
        buttonEdit.setAttribute('onclick', `showeditform(${artid}, '${arttitle}')`)
        buttonEdit.innerHTML = "Edytuj"

        const buttonDel = document.createElement('button')
        buttonDel.setAttribute('class', 'art-button')
        buttonDel.setAttribute('onclick', `articleDel(${artid}, '${arttitle}')`)
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

async function reload() {
    location.reload()
}
window.reload = reload

// ############################################################


// ############### DODAWANIE ARTYKUŁU: ###################
// pokazywanie forma (jezeli zalogowany)
async function showaddform() {
    console.log(localStorage.getItem("loginsave"));
    if (localStorage.getItem("loginsave")) {
        const addform = document.getElementById("addform")
        document.getElementById("addartauthor").value = localStorage.getItem("loginsave")
        console.log("formularz dodawania artykułu");
        addform.showModal()
    }
    else {
        alert("Musisz być zalogowany aby dodawać artykuły!");
    }

}
window.showaddform = showaddform

// weryfikacja forma (czy dobrze wypełniony)
async function checkart(author, date, title, text) {
    const addarticle = { "author": author, "date": date, "title": title, "text": text }
    console.log(addarticle);

    for (let i in addarticle) {
        if (addarticle[i] == "" || addarticle[i] == null) {
            console.log(`error, brak danych w ${i}`);
            return false
        }
    }
    return true
}

// dodawanie art do bazy danych
async function addarttodb() {
    const addform = document.getElementById("addform")

    const addauthor = document.getElementById("addartauthor").value
    const adddate = document.getElementById("addartdate").value
    const addtitle = document.getElementById("addarttitle").value
    const addtext = document.getElementById("addarttext").value

    const isartok = await checkart(addauthor, adddate, addtitle, addtext)

    if (isartok) {
        const { data, error } = await supabase
            .from('artykuly')
            .insert([
                {
                    author: addauthor,
                    date: adddate,
                    title: addtitle,
                    article: addtext
                }
            ])
        if (error) {
            console.error("Błąd dodawania artykułu:", error.message)
            return false
        }
        console.log("Dodano artykuł");
        document.getElementById("addartauthor").value = ""
        document.getElementById("addartdate").value = ""
        document.getElementById("addarttitle").value = ""
        document.getElementById("addarttext").value = ""
        location.reload()
        addform.close()
        return true
    }

}
window.addarttodb = addarttodb

// anulowanie dodawania art
async function addartcancel() {
    console.log("anulowanie dodawania artykulu");
    const addform = document.getElementById("addform")
    addform.close()
}
window.addartcancel = addartcancel


// ################## EDYTOWANIE ARTYKUŁU: ###################
async function showeditform(artnum) {
    console.log("edytowanie artykułu", artnum);
    if (localStorage.getItem("loginsave")) {

        const { data, error } = await supabase
            .from('artykuly')
            .select('*')
            .eq('id', artnum)
        if (error) {
            console.error("Błąd pobierania:", error)
            return
        }
        console.log(data);
        const oldauthor = data[0].author
        const olddate = data[0].date
        const oldtitle = data[0].title
        const oldtext = data[0].article
        console.log(oldauthor, olddate, oldtitle, oldtext);

        const editform = document.getElementById("editform")
        document.getElementById("editartid").value = artnum
        document.getElementById("editartauthor").value = oldauthor
        document.getElementById("editartdate").value = olddate
        document.getElementById("editarttitle").value = oldtitle
        document.getElementById("editarttext").value = oldtext
        console.log("formularz edytowania artykułu");
        editform.showModal()
    }
    else {
        alert("Musisz być zalogowany aby edytować artykuły!");
    }
}
window.showeditform = showeditform

async function editarttodb() {
    const editform = document.getElementById("editform")

    const editedformid = document.getElementById("editartid").value
    const newauthor = document.getElementById("editartauthor").value
    const newdate = document.getElementById("editartdate").value
    const newtitle = document.getElementById("editarttitle").value
    const newtext = document.getElementById("editarttext").value
    const updatedData = { author: newauthor, date: newdate, title: newtitle, article: newtext }

    console.log("zapisywanie zmian w artykule ", editedformid);
    const isartok = await checkart(newauthor, newdate, newtitle, newtext)
    if (isartok) {
        const { data, error } = await supabase
            .from('artykuly')
            .update(updatedData)
            .eq('id', editedformid)
        if (error) {
            console.error("Błąd edytowania artykulu", error);
        }
        else {
            console.log("Zaktualizowano artykuł ", editedformid, newtitle);
            editform.close()
            location.reload()
        }
    }

}
window.editarttodb = editarttodb

async function editartcancel() {
    console.log("anulowanie edytowania artykulu");
    const editform = document.getElementById("editform")
    editform.close()
}
window.editartcancel = editartcancel

// ################## USUWANIE ARTYKUŁU: ######################
async function articleDel(artnum, arttitle) {
    if (localStorage.getItem("loginsave")) {
        let areyousure = confirm("Czy na pewno chcesz usunąć artykuł " + arttitle + "?")
        if (areyousure == true) {
            const { data, error } = await supabase
                .from('artykuly')
                .delete()
                .eq('id', artnum)
            if (error) {
                console.error("Błąd podczas usuwania:", error.message);
                alert("Nie udało się usunąć artykułu.");
            } else {
                console.log("Artykuł usunięty pomyślnie!");
                location.reload()
            }
        }
    }
    else {
        alert("Musisz być zalogowany aby usuwać artykuły!")
    }

}
window.articleDel = articleDel


// ################ ODCZYTYWANIE ARTYKUŁÓW Z BAZY: ##############
async function articleread(order) {
    console.log(order);

    const { data, error } = await supabase
        .from('artykuly')
        .select('*')
        .order(order, { ascending: true })
    if (error) {
        console.error("Błąd pobierania:", error)
        return
    }
    return data
}


// ################ REJESTRACJA: #####################
// sprawdzanie czy login nie jest zajęty
async function checkLoginAvailability(log) {
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

// weryfikacja rejestracji (czy hasła spełniają wymogi)
async function registerF() {
    const login = document.getElementById("reglogin").value
    const passwd = document.getElementById("regpasswd").value
    const passwd2 = document.getElementById("regpasswd2").value
    console.log("login:", login, "| passwd:", passwd, "| passwd2", passwd2)

    const isLoginFree = await checkLoginAvailability(login)

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

// dodawanie usera do bazy danych
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

// ################## LOGOWANIE: #######################
// czy wpisane dane się zgadzają z tymi w bazie - login, hasło
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

// zapisanie kto jest zalogowany na stronie (localstorage)
async function loginF() {
    const login = document.getElementById("loglogin").value
    const passwd = document.getElementById("logpasswd").value
    console.log("Próba zalogowania: ", login, passwd);

    const isLogOK = await logchecker(login, passwd) //weryfikacja danych
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

// info "Zalogowano jako: ..."
async function loggedas(login) {
    const logElem = document.getElementById("logas")
    if (logElem) {
        logElem.innerHTML = login
    }
}

// wylogowanie
async function logmeout() {
    localStorage.removeItem("loginsave")
    window.location = "index.html" //zmienic na login.html
}

