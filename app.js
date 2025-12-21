let cardSection = document.getElementById("cardsec")
let log = document.getElementById("login")
let sign = document.getElementById("signup")
let opa = document.getElementById("opa")
let signbut = document.getElementById("signbut")
let loginbut = document.getElementById("loginbut")
let header = document.getElementById("headofall")
let signout = document.getElementById("signout")
let section = document.getElementById("sec")
let user = Cookies.get("user")
let errorMsg = document.getElementById("error-message")
let errorMsgLogin = document.getElementById("error-message-login")
let brandNames = document.getElementById("brandNames")

let currentPage = 1
let pageSize = 10

function loadProductsWithPagination(pageIndex, size) {
    fetch(`https://api.everrest.educata.dev/shop/products/all?page_index=${pageIndex}&page_size=${size}`)
    .then(res => res.json())
    .then(data => {
        cardSection.innerHTML = ""
        data.products.forEach(item => cardSection.innerHTML += cards(item))
        renderPagination(data.total, size)
    })
}

function renderPagination(total, size) {
    let totalPages = Math.ceil(total / size)
    
    let oldPagination = document.querySelector('.pagination-container')
    if (oldPagination) {
        oldPagination.remove()
    }
    
    let paginationHTML = `
        <div class="pagination-container">
            <div class="pagination-controls">
                <label for="pageSize">Items per page:</label>
                <select id="pageSize" onchange="changePageSize(this.value)">
                    <option value="5" ${pageSize === 5 ? 'selected' : ''}>5</option>
                    <option value="10" ${pageSize === 10 ? 'selected' : ''}>10</option>
                    <option value="15" ${pageSize === 15 ? 'selected' : ''}>15</option>
                    <option value="20" ${pageSize === 20 ? 'selected' : ''}>20</option>
                    <option value="30" ${pageSize === 30 ? 'selected' : ''}>30</option>
                    <option value="38" ${pageSize === 38 ? 'selected' : ''}>38</option>
                </select>
            </div>
            
            <div class="pagination-buttons">
                <button onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>← Previous</button>
                
                <div class="page-numbers">
    `
    
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `<button onclick="goToPage(${i})" class="page-btn ${i === currentPage ? 'active' : ''}">${i}</button>`
    }
    
    paginationHTML += `
                </div>
                
                <button onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>Next →</button>
            </div>
        </div>
    `
    
    cardSection.parentElement.insertAdjacentHTML('afterend', paginationHTML)
}

function goToPage(pageNum) {
    if (pageNum < 1) return
    currentPage = pageNum
    loadProductsWithPagination(currentPage, pageSize)
}

function changePageSize(size) {
    pageSize = parseInt(size)
    currentPage = 1
    loadProductsWithPagination(currentPage, pageSize)
}
loadProductsWithPagination(currentPage, pageSize)

function cards(item) {
    let isOutOfStock = item.stock <= 0;
    let disabledAttribute = isOutOfStock ? "disabled" : ""
    let buttonText = isOutOfStock ? "Sold Out" : "Add To Cart"

    let imgURL = "https://via.placeholder.com/300"
    if (item.category && item.category.name.toLowerCase().includes("laptop")) {
        imgURL = "https://pcshop.ge/wp-content/uploads/I34810.jpg";
    } else if (item.category && item.category.name.toLowerCase().includes("phone")) {
        imgURL = "https://hnau.imgix.net/media/catalog/product/i/p/iphone_17_pro_max_cosmic_orange_pdp_image_position_7__anz.jpg?auto=compress&auto=format&fill-color=FFFFFF&fit=fill&fill=solid&w=992&h=558";
    }

    return `
    <div class="card" style="opacity: ${isOutOfStock ? '0.7' : '1'}">
        <img src="${imgURL}" alt="${item.title}">
        <h1>${item.title}</h1>
        <div class="prices">
            <h2><s style="display: ${item.price.discountPercentage === 0 ? 'none' : 'inline'}">${item.price.beforeDiscount}$</s> <sub>${item.price.current}$</sub></h2>
        </div>
        
        <h3>Rating: ${Math.round(item.rating)}</h3>
        
        <h3 style="color: ${isOutOfStock ? 'red' : 'black'}">
            ${isOutOfStock ? "Sold Out" : "Stock: " + item.stock}
        </h3>
        
        <h2 class="discount" style="display: ${item.price.discountPercentage === 0 ? 'none' : 'block'}">
            ${Math.round(item.price.discountPercentage)}%
        </h2>
        <p>${item.description}</p>
        
        <button onclick="addtocart('${item._id}')" ${disabledAttribute} style="cursor: ${isOutOfStock ? 'not-allowed' : 'pointer'}; background-color: ${isOutOfStock ? '#ccc' : ''}">${buttonText}</button>
    </div>`
}

function register(e) {
    e.preventDefault()
    let formInfo = new FormData(e.target)
    let finalForm = Object.fromEntries(formInfo)
    
    finalForm.phone = finalForm.phone.split(' ').join('')
    finalForm.zipcode = finalForm.zipcode.split(' ').join('')
    finalForm.avatar = finalForm.avatar.trim()

    errorMsg.innerText = ""
    finalForm.age = Number(finalForm.age)

    fetch("https://api.everrest.educata.dev/auth/sign_up", {
        method: "POST",
        headers: {
            "accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(finalForm)
    })
    .then(res => {
        if (res.status === 409) {
            errorMsg.innerText = "Error: This email is already in use!"
            throw new Error("Email in use")
        }
        if (res.ok || res.status === 201) {
            return fetch("https://api.everrest.educata.dev/auth/sign_in", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: finalForm.email,
                    password: finalForm.password
                })
            });
        }
    })
    .then(res => res ? res.json() : null)
    .then(data => {
        if (data && data.access_token) {
            localStorage.setItem("userFirstName", finalForm.firstName)
            localStorage.setItem("userLastName", finalForm.lastName)
            localStorage.setItem("userPhone", finalForm.phone)
            localStorage.setItem("userEmail", finalForm.email)
            localStorage.setItem("userAvatar", finalForm.avatar)

            Cookies.set("user", data.access_token, { expires: 30 })
            user = data.access_token
            
            closesignup()
            removelogin()
            profile()
            
            alert("Success! Now check your email and click the verification link.")
        }
    })
}

function login(e) {
    e.preventDefault()
    let formInfo = new FormData(e.target)
    let finalForm = Object.fromEntries(formInfo)
    
    errorMsgLogin.innerText = ""
    
    if (!finalForm.email || !finalForm.password) {
        errorMsgLogin.innerText = "Please enter both email and password!"
        return
    }

    fetch("https://api.everrest.educata.dev/auth/sign_in", {
        method: "POST",
        headers: {
            accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(finalForm)
    })
        .then(res => {
            if (res.status === 400 || res.status === 401) {
                errorMsgLogin.innerText = "Wrong email or password. Please try again!"
                throw new Error("Invalid credentials")
            }
            if (res.ok) {
                return res.json()
            }
        })
        .then((data) => {
            if (data && data.access_token) {
                Cookies.set("user", data.access_token, { expires: 30 })
                
                errorMsgLogin.innerText = "" 
                closelogin()
                removelogin()
                
                user = data.access_token
                profile()
                
                alert("Success! Logged in.")
            }
        })
}

function profile() {
    if (!user) return

    section.classList.remove("sec")
    section.classList.add("sec1")

    fetch("https://api.everrest.educata.dev/auth", {
    method: "GET",
    headers: {
        accept: "application/json",
        Authorization: `Bearer ${user}`
    }
    })
    .then(res => {
        if (!res.ok) {
            throw new Error("Restricted")
        }
        return res.json()
    })
    .then((data) => {
        localStorage.setItem("userFirstName", data.firstName)
        localStorage.setItem("userAvatar", data.avatar)
        renderProfile(data.firstName, data.avatar)
        
        if (data.verified === false) {
            alert("verify your email please otherwise site might face some issues")
        }
    })
    .catch(err => {
        let localName = localStorage.getItem("userFirstName")
        let localAvatar = localStorage.getItem("userAvatar")
        if (localName) {
            renderProfile(localName, localAvatar)
        } else {
            renderProfile("Guest", "https://cdn-icons-png.flaticon.com/512/149/149071.png")
        }
    })
}

function signOut() {
    Cookies.remove("user")
    localStorage.removeItem("userName")
    localStorage.removeItem("userAvatar")
    localStorage.removeItem("userFirstName")
    localStorage.removeItem("userLastName")
    localStorage.removeItem("userPhone")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("cartProducts")
    location.reload()
}

function closesignup() {
    sign.classList.remove("opa2")
    opa.classList.remove("bc")
    document.body.style.overflow = "auto"
}

function closelogin() {
    log.classList.remove("log1")
    opa.classList.remove("bc")
    document.body.style.overflow = "auto"
}

function signup() {
    sign.classList.toggle("opa2")
    opa.classList.toggle("bc")
    document.body.style.overflow = "hidden"
    if (errorMsg) errorMsg.innerText = "" 
}

function openlogin() {
    log.classList.toggle("log1")
    opa.classList.toggle("bc")
    document.body.style.overflow = "hidden"
    if (errorMsgLogin) errorMsgLogin.innerText = "" 
}

function removelogin() {
    signbut.classList.remove("login")
    loginbut.classList.remove("login")
    signout.classList.remove("out")
    signbut.classList.add("fordn")
    loginbut.classList.add("fordn")
    signout.classList.add("login")
}

if (user) {
    removelogin()
    profile()
}

function renderProfile(name, avatar) {
    let img = (avatar && avatar !== "undefined") ? avatar : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
    
    section.innerHTML = `
        <h1>${name}</h1>
        <img src="${img}" alt="User">
    `
}

function checkAndGo() {
    fetch("https://api.everrest.educata.dev/auth", {
        method: "GET",
        headers: {
            "accept": "application/json",
            "Authorization": `Bearer ${user}`
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.verified === true) { 
            window.location.href = "profile.html"
        } else {
            alert("Please verify your email address first!")
        }
    })
}

function checkAndGoToCart() {
    fetch("https://api.everrest.educata.dev/auth", {
        method: "GET",
        headers: {
            "accept": "application/json",
            "Authorization": `Bearer ${user}`
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.verified === true) { 
            window.location.href = "cart.html"
        } else {
            alert("Please verify your email address first!")
        }
    })
}

function addtocart(productId) {
    let cardElement = event.target.closest('.card')
    let productTitle = cardElement.querySelector('h1').textContent
    if (!user) {
        alert("Please login first to use the cart!")
        openlogin()
        return
    }

    fetch("https://api.everrest.educata.dev/auth", {
        method: "GET",
        headers: {
            "accept": "application/json",
            "Authorization": `Bearer ${user}`
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.verified === false) {
            alert("⚠️ Please verify your email first!")
            return;
        }

        return fetch("https://api.everrest.educata.dev/shop/cart", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${user}`,
                "accept": "application/json"
            }
        });
    })
    .then(res => res.json())
    .then(cartData => {
        let existingItem = cartData.products.find(item => item.productId === productId)
        let newQuantity = existingItem ? existingItem.quantity + 1 : 1

        let cartData2 = {
            id: String(productId).trim(),
            quantity: newQuantity
        }

        return fetch("https://api.everrest.educata.dev/shop/cart/product", {
            method: "PATCH",
            headers: {
                "accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user}` 
            },
            body: JSON.stringify(cartData2)
        });
    })
    .then(res => {
        if (res && res.ok) {
            localStorage.setItem("cartProduct_" + productId, productTitle)
        } else if (res) {
            alert("Failed to add item. Status: " + res.status)
        }
    })
}

function refreshToken() {
    fetch("https://api.everrest.educata.dev/auth/refresh", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            refreshToken: localStorage.getItem("refreshToken")
        })
    })
    .then(res => res.json())
    .then(data => {
        Cookies.set("user", data.access_token, { expires: 30 })
        localStorage.setItem("refreshToken", data.refresh_token)
    })
}
function filterByCategory(categoryId) {
    let url = categoryId 
        ? `https://api.everrest.educata.dev/shop/products/category/${categoryId}?page_index=1&page_size=38`
        : "https://api.everrest.educata.dev/shop/products/all?page_index=1&page_size=38"
    
    fetch(url)
        .then(res => res.json())
        .then(data => {
            cardSection.innerHTML = ""
            data.products.forEach(item => cardSection.innerHTML += cards(item))
        })
}
let lastScrollY = window.scrollY
let headerElement = document.getElementById("headofall")

window.addEventListener("scroll", () => {
    let currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
        headerElement.classList.add("header-hidden")
    } else {
        headerElement.classList.remove("header-hidden")
    }
    lastScrollY = currentScrollY
})


let brandNamesList = document.getElementById("brandNames")

function toggleBrandList() {
    brandNamesList.classList.toggle("show-brands")

    if (brandNamesList.classList.contains("show-brands") && brandNamesList.innerHTML === "") {
        renderBrandButtons()
    }
}

function renderBrandButtons() {
    brandNamesList.innerHTML = "<li>Loading brands...</li>"

    fetch("https://api.everrest.educata.dev/shop/products/brands")
        .then(res => res.json())
        .then((data) => {
            brandNamesList.innerHTML = ""
            data.forEach(item => {
                brandNamesList.innerHTML += `
                    <li>
                        <button class="brand-btn" onclick="filterByBrand('${item}')">
                            ${item}
                        </button>
                    </li>`
            })
        })
        .catch(err => {
            console.error("Error fetching brands:", err)
            brandNamesList.innerHTML = "<li>Error loading brands.</li>"
        });
}

function filterByBrand(brandName) {
    window.scrollTo({
        top: 0,
        behavior: "smooth" 
    });

    fetch("https://api.everrest.educata.dev/shop/products/all?page_index=1&page_size=38")
        .then(res => res.json())
        .then(data => {
            cardSection.innerHTML = ""
            let filtered = data.products.filter(item => 
                item.title.toLowerCase().includes(brandName.toLowerCase())
            );

            if (filtered.length > 0) {
                filtered.forEach(item => cardSection.innerHTML += cards(item))
            } else {
                cardSection.innerHTML = `<h1>No ${brandName} products available.</h1>`
            }
        })
}
function searchProducts() {
    let query = document.getElementById("searchInput").value.toLowerCase();
    
    fetch("https://api.everrest.educata.dev/shop/products/all?page_index=1&page_size=38")
        .then(res => res.json())
        .then(data => {
            let filteredProducts = data.products.filter(item => 
                item.title.toLowerCase().includes(query)
            );

            cardSection.innerHTML = ""; 

            if (filteredProducts.length > 0) {
                filteredProducts.forEach(item => {
                    cardSection.innerHTML += cards(item);
                });
            } else {
                cardSection.innerHTML = `<h1 style="grid-column: 1/-1; text-align: center;">No results found for "${query}"</h1>`;
            }
        })
}
