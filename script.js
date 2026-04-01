import { supabase } from './supabaseClient.js'

async function getTasks() {
    const { data, error } = await supabase
        .from('loginy')
        .select('*')
    if (error) {
        console.error("Błąd pobierania:", error)
        return
    }

    console.log("testowe połączenie z bazą:", data)

}
getTasks()
console.log("aa");
