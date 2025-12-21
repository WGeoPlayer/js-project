let user = Cookies.get("user")
let localName = localStorage.getItem("userFirstName")
let localAvatar = localStorage.getItem("userAvatar")
let section = document.getElementById("sec")
let productItem = document.getElementById("productitem")
let ul = document.getElementById("ul")
let empCrt = document.getElementById("aboveul")
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
            window.location.href = "profile.html"
        })
}

function displayHeaderUser() {
    let name = localName ? localName : "Guest";
    let img = (localAvatar && localAvatar !== "undefined") ? localAvatar : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    section.innerHTML = `
        <h1>${name}</h1>
        <img src="${img}" alt="User">
    `;
}

displayHeaderUser()
renderCart()

function renderCart() {
    fetch("https://api.everrest.educata.dev/shop/cart", {
        method: "GET",
        headers: {
            "accept": "application/json",
            "Authorization": `Bearer ${user}`
        }
    })
    .then(res => res.json())
    .then(data => {
        ul.innerHTML = ""
        if (data.products && data.products.length > 0) {
            data.products.forEach(item => {
                ul.innerHTML += cartItemTemplate(item);
            });
        } else {
            aboveul.innerHTML = `<h1 class="hiddencrt">Cart Is Empty</h1>`
            ul.innerHTML = `<li><img class="emptyCart" src="emptyCart.png" alt=""></li>`
        }
        updateCartTotal();
    })
}

function updateCartTotal() {
    let items = document.querySelectorAll('li');
    
    if (items.length === 0 || items[0].innerText.includes("empty")) {
        return;
    }
    
    let total = 0;
    items.forEach(item => {
        let priceText = item.querySelectorAll('h3')[1].innerText;
        let price = parseFloat(priceText.replace('$', ''));
        total += price;
    });
    
    let heading = document.querySelector('.totalprice');
    heading.innerHTML = ""
    heading.innerHTML = `<button class="checkoutbaby">Check Out</button> Total: $` + total.toFixed(2);
}

function cartItemTemplate(item) {
    let productId = item.productId
    let quantity = item.quantity || 1
    let pricePerUnit = item.pricePerQuantity || 0
    let totalPrice = pricePerUnit * quantity
    let productTitle = localStorage.getItem("cartProduct_" + productId) || "Product"

    let laptopImg = "https://pcshop.ge/wp-content/uploads/I34810.jpg"
    let phoneImg = "https://hnau.imgix.net/media/catalog/product/i/p/iphone_17_pro_max_cosmic_orange_pdp_image_position_7__anz.jpg?auto=compress&auto=format&fill-color=FFFFFF&fit=fill&fill=solid&w=992&h=558";

    let productThumbnail = laptopImg;

    let title = productTitle.toLowerCase();
    
    if (
        title.includes("iphone") || 
        title.includes("samsung") || 
        title.includes("xiaomi") || 
        title.includes("galaxy") ||
        title.includes("honor") ||
        title.includes("oneplus") ||
        pricePerUnit < 1200
    ) {
        productThumbnail = phoneImg
    }

    return `
    <li>
        <div class="somefunct">
            <button onclick="removeItem('${productId}')">X</button>
            <img src="${productThumbnail}" alt="${productTitle}">
            <p>${productTitle}</p>
        </div>
        <div class="deinitem">
            <button onclick="updateQuantity('${productId}', ${quantity - 1})">-</button>
            <p id="productitem">${quantity}</p>
            <button onclick="updateQuantity('${productId}', ${quantity + 1})">+</button>
        </div>
        <h3>$ ${pricePerUnit}</h3>
        <h3>$ ${totalPrice.toFixed(0)}</h3>
    </li>`;
}

function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) return

    fetch("https://api.everrest.educata.dev/shop/cart/product", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user}`
        },
        body: JSON.stringify({
            id: productId,
            quantity: newQuantity
        })
    })
    .then(() => renderCart())
}

function removeItem(productId) {
    fetch("https://api.everrest.educata.dev/shop/cart/product", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user}`
        },
        body: JSON.stringify({ id: productId })
    })
    .then(() => renderCart())
}
