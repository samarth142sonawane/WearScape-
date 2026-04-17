document.addEventListener("DOMContentLoaded", () => {
    // --- Data ---
    const productsData = {
        "1": { title: "Obsidian Drape Shirt", price: 120.00, img: "assets/products/statue_product_1.png", desc: "A masterpiece of minimalist draping. The Obsidian Drape Shirt offers a fluid, unrestricted silhouette ideal for the modern curator." },
        "2": { title: "Nocturne Overcoat", price: 350.00, img: "assets/products/statue_product_2.png", desc: "Command the gallery. The Nocturne Overcoat combines structured tailoring with deep, light-absorbing fabrics." },
        "3": { title: "Monolith Trousers", price: 180.00, img: "assets/products/statue_product_3.png", desc: "Carved from premium wool-blend. These trousers fall with statue-like precision." },
        "4": { title: "Aeon Vest", price: 220.00, img: "assets/products/statue_product_4.png", desc: "Layer depth into your aesthetic. The Aeon Vest is a functional piece that transcends seasonal trends." },
        "5": { title: "Ethereal Silk Tunic", price: 280.00, img: "assets/products/statue_product_5.png", desc: "A flowing, ethereal silk tunic in dark charcoal. Features simple, classical drapery." },
        "6": { title: "Relic Trench Coat", price: 450.00, img: "assets/products/statue_product_6.png", desc: "A structured, avant-garde dark trench coat with sharp, monumental silhouettes." },
        "7": { title: "Stoic Knit Sweater", price: 190.00, img: "assets/products/statue_product_7.png", desc: "A textured, heavy-knit sweater in deep grey, evocative of carved stone." },
        "8": { title: "Antiquity Linen Pants", price: 160.00, img: "assets/products/statue_product_8.png", desc: "Wide-leg linen pants with a raw hem in onyx black offering flowing lines." },
        "9": { title: "Marquis Velvet Jacket", price: 520.00, img: "assets/products/statue_product_9.png", desc: "A plush, dark velvet jacket with a high collar and a majestic presence." },
        "10": { title: "Oblivion Scarf", price: 95.00, img: "assets/products/statue_product_10.png", desc: "An oversized draped scarf layered intricately in black." }
    };
    
    // --- Preloader & Background Canvas Animation ---
    const frames = [];
    const totalFrames = 240;
    const preloaderText = document.querySelector('.loader-content p');
    const progressBar = document.getElementById('progress');
    const preloader = document.getElementById('preloader');
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    
    let loadedFrames = 0;
    
    // Set Canvas Size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Map frame numbers (001 to 240)
    function pad(num, size) {
        let s = num + "";
        while (s.length < size) s = "0" + s;
        return s;
    }

    // Load images
    for (let i = 1; i <= totalFrames; i++) {
        const img = new Image();
        // Path mapping to ezgif extracted frames
        img.src = `ezgif-39b5217de1b7138a-jpg/ezgif-frame-${pad(i, 3)}.jpg`;
        
        img.onload = () => {
            loadedFrames++;
            const progress = (loadedFrames / totalFrames) * 100;
            progressBar.style.width = progress + '%';
            
            if (loadedFrames === totalFrames) {
                setTimeout(() => {
                    preloader.style.opacity = "0";
                    setTimeout(() => { preloader.style.display = "none"; }, 800);
                    startAnimation();
                }, 500); // Small delay to let users see 100%
            }
        };
        img.onerror = () => {
            // Fallback loading advancement in case some frames are missing
            loadedFrames++;
            if (loadedFrames === totalFrames) startAnimation();
        }
        frames.push(img);
    }
    
    // Animation Loop
    let currentFrame = 0;
    let lastTime = 0;
    const fps = 24; // Limit to 24fps for a cinematic feel
    const interval = 1000 / fps;

    function renderImage(img) {
        // Draw image covering the whole canvas (object-fit: cover equivalent in canvas)
        const canvasAspect = canvas.width / canvas.height;
        const imgAspect = img.width / img.height;
        let drawWidth, drawHeight, offsetX = 0, offsetY = 0;

        if (canvasAspect > imgAspect) {
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgAspect;
            offsetY = (canvas.height - drawHeight) / 2;
        } else {
            drawHeight = canvas.height;
            drawWidth = canvas.height * imgAspect;
            offsetX = (canvas.width - drawWidth) / 2;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }

    function startAnimation() {
        requestAnimationFrame(updateFrame);
    }

    function updateFrame(timestamp) {
        if (!lastTime) lastTime = timestamp;
        const delta = timestamp - lastTime;
        
        if (delta > interval) {
            const img = frames[currentFrame];
            if (img && img.complete && img.naturalHeight !== 0) {
                 renderImage(img);
            }
            currentFrame = (currentFrame + 1) % totalFrames;
            lastTime = timestamp - (delta % interval);
        }
        
        requestAnimationFrame(updateFrame);
    }

    // --- Search & Filtering ---
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    function filterProducts() {
        const searchTerm = searchInput.value.toLowerCase();
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;

        productCards.forEach(card => {
            const title = card.querySelector('.product-info h3').textContent.toLowerCase();
            const category = card.dataset.category;
            
            const matchesSearch = title.includes(searchTerm);
            const matchesCategory = (activeFilter === 'all') || (category === activeFilter);

            if (matchesSearch && matchesCategory) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterProducts();
        });
    });

    searchInput.addEventListener('input', filterProducts);

    // --- Cart Logic ---
    const cartToggle = document.getElementById('cartToggle');
    const cartDrawer = document.getElementById('cartDrawer');
    const closeCart = document.getElementById('closeCart');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalValue = document.getElementById('cartTotalValue');
    
    let cart = [];

    function openCart() {
        cartDrawer.classList.add('open');
        cartOverlay.classList.add('show');
    }

    function closeCartDrawer() {
        cartDrawer.classList.remove('open');
        cartOverlay.classList.remove('show');
    }

    cartToggle.addEventListener('click', (e) => {
        e.preventDefault();
        openCart();
    });

    closeCart.addEventListener('click', closeCartDrawer);
    cartOverlay.addEventListener('click', closeCartDrawer);

    function updateCartUI() {
        cartToggle.textContent = `Cart (${cart.length})`;
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
            cartTotalValue.textContent = '$0.00';
            return;
        }

        cartItemsContainer.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            total += item.price;
            const itemHTML = `
                <div class="cart-item">
                    <img src="${item.img}" alt="${item.title}">
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${item.title}</h4>
                        <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                        <button class="remove-item" data-index="${index}">Remove</button>
                    </div>
                </div>
            `;
            cartItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
        });

        cartTotalValue.textContent = `$${total.toFixed(2)}`;

        // Add event listeners tracking remove buttons
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                cart.splice(index, 1);
                updateCartUI();
            });
        });
    }

    function addToCart(productId) {
        const product = productsData[productId];
        if (product) {
            cart.push(product);
            updateCartUI();
            openCart(); // Show cart after adding
        }
    }

    // --- Modal Logic ---
    const productModal = document.getElementById('productModal');
    const modalClose = document.querySelector('.modal-close');
    const modalBody = document.getElementById('modalBody');

    // Make quick view buttons open the modal
    document.querySelectorAll('.btn-quick-view').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.dataset.product;
            const product = productsData[productId];
            
            modalBody.innerHTML = `
                <div class="modal-gallery">
                    <img src="${product.img}" alt="${product.title}">
                </div>
                <div class="modal-info">
                    <h2>${product.title}</h2>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <p>${product.desc}</p>
                    <button class="btn btn-glow w-100 add-to-cart-modal" data-product="${productId}">Add to Cart</button>
                </div>
            `;
            
            productModal.classList.add('show');
            
            // Re-bind add to cart
            document.querySelector('.add-to-cart-modal').addEventListener('click', (e) => {
                addToCart(e.target.dataset.product);
                productModal.classList.remove('show');
            });
        });
    });

    modalClose.addEventListener('click', () => {
        productModal.classList.remove('show');
    });

    // Close modal when clicking outside
    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) {
            productModal.classList.remove('show');
        }
    });

    // --- Eternal Deals logic ---
    
    // 1. Intersection Observer for Scroll Entrance
    const offerCards = document.querySelectorAll('.offer-card');
    const offerObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Read the delay and apply it
                const delay = entry.target.dataset.delay || '0s';
                entry.target.style.transitionDelay = delay;
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    offerCards.forEach(card => offerObserver.observe(card));

    // 2. Timer Logic
    const timerElement = document.getElementById('countdown-timer');
    const card1Content = document.getElementById('offer-card-1-content');
    
    // Set your target end date here. For demo, it's 2 hours from current time.
    // To link to a specific hardcoded date, you would do:
    // const endDate = new Date('2026-12-31T23:59:59');
    const endDate = new Date(new Date().getTime() + 2 * 60 * 60 * 1000); 

    function updateTimer() {
        if (!timerElement) return;
        
        const now = new Date();
        const diff = endDate - now;

        if (diff <= 0) {
            // Timer hit zero, switch to SignUp state
            if(card1Content) {
                card1Content.innerHTML = `
                    <h3>The Winter Solstice Collection</h3>
                    <p>The Drop Has Ended.</p>
                    <a href="#" class="btn btn-glass-fill">Sign Up for Next Drop</a>
                `;
            }
            if(typeof timerInterval !== 'undefined') clearInterval(timerInterval);
            return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        const pad = (n) => n.toString().padStart(2, '0');
        timerElement.textContent = `${pad(hours)}h : ${pad(mins)}m : ${pad(secs)}s`;
    }

    const timerInterval = setInterval(updateTimer, 1000);
    updateTimer(); // Initial call to avoid 1s delay

    // --- Gilded Drop Logic ---
    // Living Border Logic
    let angle = 0;
    function animateBorder() {
        angle = (angle + 1) % 360;
        document.documentElement.style.setProperty('--border-angle', angle + 'deg');
        requestAnimationFrame(animateBorder);
    }
    requestAnimationFrame(animateBorder);
    
    // Scroll Reveal for Gilded Cards
    const gildedCards = document.querySelectorAll('.gilded-card');
    const gildedObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('rise');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    gildedCards.forEach(card => gildedObserver.observe(card));

    // Countdown Timer Logic
    const gildedTimerElement = document.getElementById('countdown-timer-gilded');
    const gildedEndDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

    function updateGildedTimer() {
        if (!gildedTimerElement) return;
        
        const now = new Date();
        const diff = gildedEndDate - now;

        if (diff <= 0) {
            gildedTimerElement.textContent = "00:00:00";
            if(typeof gildedTimerInterval !== 'undefined') clearInterval(gildedTimerInterval);
            return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        const pad = (n) => n.toString().padStart(2, '0');
        gildedTimerElement.textContent = `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
    }

    const gildedTimerInterval = setInterval(updateGildedTimer, 1000);
    updateGildedTimer(); // Initial call
});
