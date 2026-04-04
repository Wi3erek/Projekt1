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

async function generatearticles() {
    const islistready = await genauthorlist()
    if (islistready) {
        const sortby = document.getElementById("sortby").value
        const authorselected = document.getElementById("authorsel").value
        const artbox = document.getElementById("center")
        artbox.innerHTML = ""
        if (artbox && sortby) {
            const artykuly = await articleread(sortby, authorselected)
            console.log(artykuly);
            for (let i = 0; i < artykuly.length; i++) {
                let artid = artykuly[i].id
                let artauthorfirst = artykuly[i].author_firstname
                let artauthorsur = artykuly[i].author_surname
                let artdate = artykuly[i].date
                let arttitle = artykuly[i].title
                let arttext = artykuly[i].article

                const artDiv = document.createElement('div')
                artDiv.setAttribute('class', 'art')
                artDiv.setAttribute('id', 'art' + artid)

                // zawartosc artykułów
                const authorElem = document.createElement('author')
                authorElem.innerHTML = artauthorfirst + " " + artauthorsur

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
    }




}
generatearticles()

// generowanie listy autorów
async function genauthorlist() {
    const authorbox = document.getElementById("authorsel")
    authorbox.innerHTML = "<option value='all'>Wszyscy autorzy</option>"
    if (authorbox) {
        const lista = await readauthors()
        console.log(lista);

        for (let i = 0; i < lista.length; i++) {
            const opt = document.createElement("option")
            opt.value = lista[i]
            opt.innerHTML = lista[i]
            authorbox.appendChild(opt)
        }

        let defaultauthoropt = localStorage.getItem("selectedauthor")
        console.log("zapisny wybor autora", defaultauthoropt);
        if (defaultauthoropt && lista.includes(defaultauthoropt)) {
            // sprawdzic czy zapisana wartosc (default) jest na liscie autorów w ogole
            authorbox.value = localStorage.getItem("selectedauthor")
        }
        else {
            authorbox.value = "all"
        }
        return true
    }
}



async function reload() {
    console.log("reload");
    generatearticles()
}
window.reload = reload

// ############################################################


// ############### DODAWANIE ARTYKUŁU: ###################
// pokazywanie forma (jezeli zalogowany)
async function showaddform() {
    console.log(localStorage.getItem("loginsave"));
    if (localStorage.getItem("loginsave")) {
        const addform = document.getElementById("addform")
        console.log("formularz dodawania artykułu");
        addform.showModal()
    }
    else {
        alert("Musisz być zalogowany aby dodawać artykuły!");
    }

}
window.showaddform = showaddform

// weryfikacja forma (czy dobrze wypełniony)
async function checkart(authorsur, authorfirst, date, title, text) {
    const addarticle = { "author_surname": authorsur, "author_firstname": authorfirst, "date": date, "title": title, "text": text }
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

    const addauthorfirst = document.getElementById("addartauthorfirst").value
    const addauthorsur = document.getElementById("addartauthorsur").value
    const adddate = document.getElementById("addartdate").value
    const addtitle = document.getElementById("addarttitle").value
    const addtext = document.getElementById("addarttext").value

    const isartok = await checkart(addauthorsur, addauthorfirst, adddate, addtitle, addtext)

    if (isartok) {
        const { data, error } = await supabase
            .from('artykuly')
            .insert([
                {
                    author_surname: addauthorsur,
                    author_firstname: addauthorfirst,
                    date: adddate,
                    title: addtitle,
                    article: addtext
                }
            ])
        if (error) {
            console.error("Błąd dodawania artykułu:", error.message)
            return false
        }
        else {
            console.log("Dodano artykuł");
            document.getElementById("addartauthorfirst").value = ""
            document.getElementById("addartauthorsur").value = ""
            document.getElementById("addartdate").value = ""
            document.getElementById("addarttitle").value = ""
            document.getElementById("addarttext").value = ""
            generatearticles()
            addform.close()
            return true
        }

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
        const oldauthorfirst = data[0].author_firstname
        const oldauthorsur = data[0].author_surname
        const olddate = data[0].date
        const oldtitle = data[0].title
        const oldtext = data[0].article
        console.log(oldauthorsur, oldauthorfirst, olddate, oldtitle, oldtext);

        const editform = document.getElementById("editform")
        document.getElementById("editartid").value = artnum
        document.getElementById("editartauthorfirst").value = oldauthorfirst
        document.getElementById("editartauthorsur").value = oldauthorsur
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
    const newauthorfirst = document.getElementById("editartauthorfirst").value
    const newauthorsur = document.getElementById("editartauthorsur").value
    const newdate = document.getElementById("editartdate").value
    const newtitle = document.getElementById("editarttitle").value
    const newtext = document.getElementById("editarttext").value
    const updatedData = { author_surname: newauthorsur, author_firstname: newauthorfirst, date: newdate, title: newtitle, article: newtext }

    console.log("zapisywanie zmian w artykule ", editedformid);
    const isartok = await checkart(newauthorsur, newauthorfirst, newdate, newtitle, newtext)
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
            generatearticles()
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
                generatearticles()
            }
        }
    }
    else {
        alert("Musisz być zalogowany aby usuwać artykuły!")
    }

}
window.articleDel = articleDel


// ################ ODCZYTYWANIE ARTYKUŁÓW Z BAZY: ##############
async function articleread(order, authorselected) {
    console.log(order, authorselected.split(' '));
    if (authorselected != "all") {
        let surname = authorselected.split(' ')[1]
        let firstname = authorselected.split(' ')[0]
        const { data, error } = await supabase
            .from('artykuly')
            .select('*')
            .order(order, { ascending: true })
            .eq('author_surname', surname)
            .eq('author_firstname', firstname)
        if (error) {
            console.error("Błąd pobierania:", error)
            return
        }
        return data
    }
    else {
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

}

// lista autorów z bazy
async function readauthors() {
    const { data, error } = await supabase
        .from('artykuly')
        .select('author_firstname,author_surname')
        .order('author_surname')
    if (error) {
        console.error("Błąd pobierania:", error)
        return
    }
    const autlist = []
    for (let i = 0; i < data.length; i++) {
        if (autlist.includes(data[i].author_firstname + " " + data[i].author_surname) == false) {
            autlist.push(data[i].author_firstname + " " + data[i].author_surname)
        }
    }
    return autlist
}

async function authorsel() {
    const selectedauthor = document.getElementById("authorsel").value
    localStorage.setItem("selectedauthor", selectedauthor)
    console.log("zapisano wybor: ", selectedauthor);

    generatearticles()
}
window.authorsel = authorsel

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

