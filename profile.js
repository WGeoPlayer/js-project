let section = document.getElementById("sec")
let user = Cookies.get("user")

function displayProfile(data) {
    localStorage.setItem("userFirstName", data.firstName)
    localStorage.setItem("userLastName", data.lastName)
    localStorage.setItem("userPhone", data.phone)
    localStorage.setItem("userEmail", data.email)
    localStorage.setItem("userAvatar", data.avatar)
    
    section.innerHTML = `
        <img src="${data.avatar}" alt="">
        <div>
            <h1>${data.firstName} ${data.lastName}</h1>
            <h2>Phone Number: ${data.phone}</h2>
            <h2>Email: ${data.email}</h2>
        </div>
        <button onclick="signOut()">Sign Out</button>`
}

function loadProfile() {
    let firstName = localStorage.getItem("userFirstName") || "Guest"
    let lastName = localStorage.getItem("userLastName") || ""
    let phone = localStorage.getItem("userPhone") || "Not available"
    let email = localStorage.getItem("userEmail") || "Not available"
    let avatar = localStorage.getItem("userAvatar") || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
    
    section.innerHTML = `
        <img src="${avatar}" alt="">
        <div>
            <h1>${firstName} ${lastName}</h1>
            <h2>Phone Number: ${phone}</h2>
            <h2>Email: ${email}</h2>
        </div>
        <button onclick="signOut()">Sign Out</button>`
}

if (user) {
    fetch("https://api.everrest.educata.dev/auth", {
        method: "GET",
        headers: {
            accept: "application/json",
            Authorization: `Bearer ${user}`
        }
    })
    .then(res => {
        if (!res.ok) {
            throw new Error("Failed to fetch")
        }
        return res.json()
    })
    .then((data) => {
        console.log(data)
        displayProfile(data)
    })
    .catch(err => {
        console.error("Error fetching profile:", err)
        loadProfile()
    })
} else {
    loadProfile()
}

function signOut() {
    Cookies.remove("user")
    localStorage.removeItem("userName")
    localStorage.removeItem("userAvatar")
    localStorage.removeItem("userFirstName")
    localStorage.removeItem("userLastName")
    localStorage.removeItem("userPhone")
    localStorage.removeItem("userEmail")
    location.reload()
    window.location.href = "index.html"
}
