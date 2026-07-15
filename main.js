document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initCategoryFiltering();
    initSearch();
    initHeaderSearch();
    initInquirySystem();
    initScrollAnimations();
    initScrollToTop();
    resolveActiveNavLink();
    initProductDetailsModal();
    initHeroSlider();
});

/**
 * Mobile Navigation Drawer Toggle & Active Links Check
 */
function initMobileMenu() {
    const toggleBtn = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!toggleBtn || !mainNav) return;

    toggleBtn.addEventListener('click', () => {
        const isOpen = mainNav.classList.toggle('open');
        toggleBtn.setAttribute('aria-expanded', isOpen);
        
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('open')) {
                mainNav.classList.remove('open');
                toggleBtn.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        });
    });
}

/**
 * Auto highlight active navigation link based on current filename
 */
function resolveActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    const path = window.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1);

    if (navLinks.length === 0) return;

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === page || (page === '' && href === 'index.html')) {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        }
    });
}

/**
 * Dynamic Product Category Filtering
 */
let activeCategory = 'all';

function initCategoryFiltering() {
    // Make sure click callbacks work correctly
    window.filterCategory = (category, btnElement) => {
        activeCategory = category;
        
        // Update active tab styles
        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });
        
        if (btnElement) {
            btnElement.classList.add('active');
            btnElement.setAttribute('aria-selected', 'true');
        }

        // Apply filters
        applyProductFilters();
    };

    // Footer links to trigger categories
    window.triggerCategoryTab = (category) => {
        const tabBtn = document.getElementById(`tab-${category}`);
        if (tabBtn) {
            tabBtn.click();
            tabBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    // Check for URL search parameters to auto-trigger a category filter on load
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('cat');
    if (catParam) {
        setTimeout(() => {
            const tabBtn = document.getElementById(`tab-${catParam}`);
            if (tabBtn) {
                tabBtn.click();
                tabBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 150);
    }

    const searchParam = urlParams.get('search');
    if (searchParam) {
        setTimeout(() => {
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = decodeURIComponent(searchParam);
                applyProductFilters();
                
                // Highlight header search input too if present
                document.querySelectorAll('.header-search-input').forEach(input => {
                    input.value = decodeURIComponent(searchParam);
                    const container = input.closest('.header-search-collapsible');
                    if (container) container.classList.add('active');
                });
            }
        }, 150);
    }
}

/**
 * Live Product Search Filter
 */
function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        applyProductFilters();
    });

    window.resetSearch = () => {
        searchInput.value = '';
        const allTab = document.getElementById('tab-all');
        if (allTab) {
            allTab.click();
        } else {
            applyProductFilters();
        }
    };
}

/**
 * Master Product Filter Application (Combines Category + Search Query)
 */
function applyProductFilters() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const cards = document.querySelectorAll('.product-card');
    const grid = document.getElementById('product-grid');
    const noResults = document.getElementById('no-results');
    const countDisplay = document.getElementById('products-count');
    
    let visibleCount = 0;

    cards.forEach(card => {
        const cardCategories = card.dataset.category.split(' ');
        const cardName = card.dataset.name.toLowerCase();
        const cardDesc = card.querySelector('.product-desc').textContent.toLowerCase();
        
        // Category check: card categories list must contain the active category, or active category is 'all'
        const matchesCategory = (activeCategory === 'all' || cardCategories.includes(activeCategory));
        
        // Search check: query matches name or description
        const matchesSearch = (query === '' || cardName.includes(query) || cardDesc.includes(query));

        if (matchesCategory && matchesSearch) {
            card.style.display = '';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    // Handle results count and empty states
    if (countDisplay) {
        countDisplay.textContent = `Showing ${visibleCount} formulation${visibleCount === 1 ? '' : 's'}`;
    }

    if (visibleCount === 0) {
        if (grid) grid.style.display = 'none';
        if (noResults) noResults.style.display = 'block';
    } else {
        if (grid) grid.style.display = '';
        if (noResults) noResults.style.display = 'none';
    }
}

/**
 * Alphabetical and Featured sorting
 */
window.sortProducts = (sortBy) => {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll('.product-card'));
    
    cards.sort((a, b) => {
        if (sortBy === 'alphabetical') {
            const nameA = a.dataset.name.toLowerCase();
            const nameB = b.dataset.name.toLowerCase();
            return nameA.localeCompare(nameB);
        } else {
            // Default "Featured First" (Restores default HTML order via layout priority)
            // Storing fallback HTML order in a data attribute when loaded
            return a.dataset.order - b.dataset.order;
        }
    });

    // Re-append cards in sorted order
    cards.forEach(card => grid.appendChild(card));
};

// Assign default order value for restoration sorting
document.querySelectorAll('.product-card').forEach((card, index) => {
    card.dataset.order = index;
});


/**
 * B2B Lead Inquiry Drawer & Form Submission Systems
 */
function initInquirySystem() {
    const overlay = document.getElementById('inquiry-overlay');
    const drawerTitle = document.getElementById('drawer-title');
    const drawerProductName = document.getElementById('drawer-product-name');
    const drawerProductDesc = document.getElementById('drawer-product-desc');
    const drawerProductPanel = document.getElementById('drawer-product-panel');
    const drawerProdInput = document.getElementById('drawer-prod-input');
    const drawerMsg = document.getElementById('drawer-msg');

    window.openInquiryModal = (productName, category = '') => {
        if (category === 'WhatsApp') {
            const phoneNumber = '919671055999';
            const textMessage = `Hello Venzic Lifesciences, I would like to inquire about "${productName}". Please share MOQ and pricing terms.`;
            const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(textMessage)}`;
            window.open(waUrl, '_blank');
            return;
        }

        if (!overlay) return;

        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Update drawer title based on channel
        if (drawerTitle) {
            drawerTitle.textContent = 'Request Quote';
        }

        // Customise drawer prompt if launched from a specific product card
        if (productName && category !== 'Corporate' && category !== 'Mobile Sticky') {
            drawerProductPanel.style.display = 'block';
            drawerProductName.textContent = productName;
            drawerProdInput.value = productName;
            
            // Auto fill description snippet if card exists
            const card = Array.from(document.querySelectorAll('.product-card'))
                .find(c => c.dataset.name === productName);
            if (card) {
                const desc = card.querySelector('.product-desc').textContent;
                drawerProductDesc.textContent = desc;
            } else {
                drawerProductDesc.textContent = `Inquiry regarding contract manufacturing for ${productName}.`;
            }

            if (category === 'WhatsApp') {
                drawerMsg.value = `Hello Venzic Lifesciences, I would like to place an order / request quote for "${productName}" via your WhatsApp Business Platform API. Please share MOQ and pricing terms.`;
            } else {
                drawerMsg.value = `Hello, I would like to get a B2B quote for third-party contract manufacturing of ${productName}. Please share your minimum order quantity (MOQ) and price estimates.`;
            }
        } else {
            drawerProductPanel.style.display = 'none';
            drawerProdInput.value = 'General Manufacturing Service';
            drawerMsg.value = `Hello, I'm interested in contract manufacturing services with Venzic Lifesciences. I would like to discuss a custom formulation/private label project.`;
        }
    };

    window.closeInquiryModal = () => {
        if (!overlay) return;
        overlay.style.display = 'none';
        document.body.style.overflow = '';
        
        // Reset drawer form state
        const drawerForm = document.getElementById('drawer-form');
        const drawerSuccess = document.getElementById('drawer-success');
        if (drawerForm) drawerForm.style.display = '';
        if (drawerSuccess) drawerSuccess.style.display = 'none';
    };

    // Close modal on escape press or clicking outside drawer body
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay && overlay.style.display === 'flex') {
            closeInquiryModal();
        }
    });

    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeInquiryModal();
            }
        });
    }
}

/**
 * Form Submit Interceptors (Funnels lead details to the WhatsApp API Bridge)
 */
function handleInquirySubmit(event) {
    event.preventDefault();
    const form = document.getElementById('contact-form');
    const successMsg = document.getElementById('form-success');
    const submitBtn = document.getElementById('submit-btn');
    const spinner = submitBtn.querySelector('.btn-spinner');
    const btnText = submitBtn.querySelector('span');

    if (!form || !successMsg) return;

    // Show loading spinner
    if (spinner) spinner.style.display = 'inline-block';
    if (btnText) btnText.textContent = 'Processing inquiry...';
    submitBtn.disabled = true;

    // Prepare lead data object
    const leadData = {
        name: document.getElementById('form-name').value,
        phone: document.getElementById('form-phone').value,
        email: document.getElementById('form-email').value,
        service: document.getElementById('form-service').value,
        qty: document.getElementById('form-qty').value,
        message: document.getElementById('form-msg').value
    };

    // Route lead data through the WhatsApp Business bridge
    sendWhatsAppLeadNotification(leadData).then(result => {
        console.log("[Inquiry Form] WhatsApp Bridge response:", result);
        
        form.style.display = 'none';
        successMsg.style.display = 'block';
        
        form.reset();
        
        // Revert button styling
        if (spinner) spinner.style.display = 'none';
        if (btnText) btnText.textContent = 'Send B2B Inquiry';
        submitBtn.disabled = false;
    }).catch(err => {
        console.error("[Inquiry Form] Bridge transmission failed:", err);
        submitBtn.disabled = false;
        if (btnText) btnText.textContent = 'Send B2B Inquiry';
    });
}

function handleDrawerSubmit(event) {
    event.preventDefault();
    const form = document.getElementById('drawer-form');
    const successMsg = document.getElementById('drawer-success');
    const submitBtn = document.getElementById('drawer-submit-btn');

    if (!form || !successMsg) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending details...';

    // Prepare lead data object
    const leadData = {
        name: document.getElementById('drawer-name').value,
        phone: document.getElementById('drawer-phone').value,
        email: document.getElementById('drawer-email').value,
        service: document.getElementById('drawer-prod-input').value,
        message: document.getElementById('drawer-msg').value
    };

    // Route lead data through the WhatsApp Business bridge
    sendWhatsAppLeadNotification(leadData).then(result => {
        console.log("[Drawer Form] WhatsApp Bridge response:", result);
        
        form.style.display = 'none';
        successMsg.style.display = 'block';
        
        form.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Inquiry';
    }).catch(err => {
        console.error("[Drawer Form] Bridge transmission failed:", err);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Inquiry';
    });
}


/**
 * Intersection Observer Scroll-triggered Entry Animations
 */
function initScrollAnimations() {
    // Add scroll animation hook classes to key items (cards, details, coordinate blocks)
    // We exclude sections from full fade-in to prevent layout rendering blocks on long B2B pages
    const animElements = [
        ...document.querySelectorAll('.product-card'),
        ...document.querySelectorAll('.about-details'),
        ...document.querySelectorAll('.coordinate-block')
    ];

    animElements.forEach(el => {
        el.classList.add('fade-in-on-scroll');
    });

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.01 // Use low threshold to ensure tall elements trigger immediately
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target); // Trigger once
            }
        });
    }, observerOptions);

    animElements.forEach(el => {
        observer.observe(el);
    });
}

/**
 * Scroll to Top Visibility Controller
 */
function initScrollToTop() {
    const scrollBtn = document.getElementById('scroll-to-top');
    if (!scrollBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * Collapsible Header Search Bar Trigger logic
 */
function initHeaderSearch() {
    const searchContainers = document.querySelectorAll('.header-search-collapsible');
    
    searchContainers.forEach(container => {
        const toggleBtn = container.querySelector('.search-toggle-btn');
        const input = container.querySelector('.header-search-input');
        
        if (!toggleBtn || !input) return;
        
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = container.classList.toggle('active');
            if (isOpen) {
                input.focus();
            } else if (input.value.trim() !== '') {
                triggerHeaderSearch(input.value.trim());
            }
        });

        input.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                triggerHeaderSearch(input.value.trim());
            }
        });
        
        // Sync with live searches if typing on products.html
        input.addEventListener('input', () => {
            const sidebarSearch = document.getElementById('search-input');
            if (sidebarSearch) {
                sidebarSearch.value = input.value;
                applyProductFilters();
            }
        });
    });

    // Close header search when clicking outside
    document.addEventListener('click', () => {
        searchContainers.forEach(container => {
            const input = container.querySelector('.header-search-input');
            if (input && input.value.trim() === '') {
                container.classList.remove('active');
            }
        });
    });
}

function triggerHeaderSearch(query) {
    if (!query) return;
    
    // Check if we are currently on products.html
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        // If we are on products.html, sync with sidebar search and apply filters
        searchInput.value = query;
        applyProductFilters();
        
        // Scroll to product section
        const section = document.getElementById('products-section');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    } else {
        // Otherwise redirect to products.html with query
        window.location.href = `products.html?search=${encodeURIComponent(query)}`;
    }
}

/**
 * About Us Certificate Lightbox Modal controls
 */
window.openCertLightbox = (imageSrc) => {
    const modal = document.getElementById('certLightbox');
    const img = document.getElementById('lightboxImg');
    if (modal && img) {
        img.src = imageSrc;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

window.closeCertLightbox = () => {
    const modal = document.getElementById('certLightbox');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

let currentProductCard = null;

function initProductDetailsModal() {
    document.addEventListener('click', (e) => {
        // Trigger modal when clicking description, title, or product image
        const trigger = e.target.closest('.product-desc, .product-title, .product-card-image');
        if (trigger) {
            const card = trigger.closest('.product-card');
            if (card) {
                openProductDetailsPopup(card);
            }
        }
    });
}

function openProductDetailsPopup(card) {
    currentProductCard = card;
    let modal = document.getElementById('productDetailsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'productDetailsModal';
        modal.className = 'product-details-modal';
        modal.onclick = closeProductDetailsPopup;
        modal.innerHTML = `
            <div class="product-details-container" onclick="event.stopPropagation()">
                <button class="close-modal-btn" onclick="closeProductDetailsPopup()">&times;</button>
                <div class="product-details-content">
                    <div class="product-details-grid">
                        <div class="product-details-image-wrapper">
                            <div class="product-details-image">
                                <button class="modal-nav-btn modal-prev-btn" onclick="navProductDetails('prev', event)" aria-label="Previous Product">&lsaquo;</button>
                                <img src="" id="popupProductImg" alt="">
                                <button class="modal-nav-btn modal-next-btn" onclick="navProductDetails('next', event)" aria-label="Next Product">&rsaquo;</button>
                            </div>
                            <div class="product-details-thumbs" id="popupProductThumbs"></div>
                        </div>
                        <div class="product-details-info">
                            <h3 id="popupProductTitle"></h3>
                            <span class="popup-product-moq" id="popupProductMOQ"></span>
                            <div class="popup-product-desc-wrapper">
                                <h4>Description</h4>
                                <p id="popupProductDesc"></p>
                            </div>
                            <div class="popup-product-specs-wrapper">
                                <h4>Specifications</h4>
                                <ul id="popupProductSpecs"></ul>
                            </div>
                            <div class="popup-product-actions">
                                <a href="tel:+919671055999" class="btn btn-outline btn-md" id="popupProductShopBtn">Call Us</a>
                                <button id="popupProductWhatsappBtn" class="btn btn-primary btn-md btn-whatsapp">Order on WhatsApp</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const title = card.querySelector('.product-title').innerText;
    const desc = card.querySelector('.product-desc').innerText;
    const imgUrl = card.querySelector('.product-card-image img').getAttribute('src');
    const moq = card.querySelector('.product-min-qty') ? card.querySelector('.product-min-qty').innerText : 'Private Label MOQ Applies';
    
    const specItems = card.querySelectorAll('.product-specs li');
    let specsHTML = '';
    specItems.forEach(li => {
        specsHTML += `<li>${li.innerHTML}</li>`;
    });

    document.getElementById('popupProductTitle').innerText = title;
    document.getElementById('popupProductDesc').innerText = desc;
    document.getElementById('popupProductImg').setAttribute('src', imgUrl);
    document.getElementById('popupProductImg').setAttribute('alt', title);
    document.getElementById('popupProductMOQ').innerText = moq.replace('Min. Order:', 'MOQ:').replace('Min Order:', 'MOQ:');
    document.getElementById('popupProductSpecs').innerHTML = specsHTML;

    // Render image gallery thumbnails
    const imagesAttr = card.getAttribute('data-images') || '';
    const imgUrls = imagesAttr ? imagesAttr.split(',') : [imgUrl];
    const thumbsContainer = document.getElementById('popupProductThumbs');
    if (thumbsContainer) {
        if (imgUrls.length > 1) {
            let thumbsHTML = '';
            imgUrls.forEach((url, index) => {
                thumbsHTML += `<img src="${url}" class="popup-thumb-img ${index === 0 ? 'active' : ''}" onclick="setPopupMainImg('${url}', this, event)" alt="Thumbnail ${index + 1}">`;
            });
            thumbsContainer.innerHTML = thumbsHTML;
            thumbsContainer.style.display = 'flex';
        } else {
            thumbsContainer.innerHTML = '';
            thumbsContainer.style.display = 'none';
        }
    }

    // Toggle navigation chevrons display
    const visibleCards = Array.from(document.querySelectorAll('.product-card')).filter(c => c.style.display !== 'none');
    const prevBtn = modal.querySelector('.modal-prev-btn');
    const nextBtn = modal.querySelector('.modal-next-btn');
    if (prevBtn && nextBtn) {
        if (visibleCards.length <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
        }
    }

    // Link WhatsApp trigger
    const waBtn = document.getElementById('popupProductWhatsappBtn');
    waBtn.onclick = function() {
        closeProductDetailsPopup();
        if (typeof openInquiryModal === 'function') {
            openInquiryModal(title, 'WhatsApp');
        }
    };

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

window.setPopupMainImg = (url, thumbEl, e) => {
    if (e) e.stopPropagation();
    const mainImg = document.getElementById('popupProductImg');
    if (mainImg) {
        mainImg.setAttribute('src', url);
    }
    const thumbs = document.querySelectorAll('.popup-thumb-img');
    thumbs.forEach(t => t.classList.remove('active'));
    if (thumbEl) {
        thumbEl.classList.add('active');
    }
};

window.navProductDetails = (direction, e) => {
    if (e) e.stopPropagation();
    const visibleCards = Array.from(document.querySelectorAll('.product-card')).filter(c => c.style.display !== 'none');
    if (visibleCards.length <= 1) return;
    
    let index = visibleCards.indexOf(currentProductCard);
    if (index === -1) return;
    
    let newIndex;
    if (direction === 'next') {
        newIndex = (index + 1) % visibleCards.length;
    } else {
        newIndex = (index - 1 + visibleCards.length) % visibleCards.length;
    }
    
    openProductDetailsPopup(visibleCards[newIndex]);
};

function closeProductDetailsPopup() {
    const modal = document.getElementById('productDetailsModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}
window.closeProductDetailsPopup = closeProductDetailsPopup;

window.sendWhatsAppLeadNotification = (leadData) => {
    console.log("[Lead Capture] Formulating WhatsApp message:", leadData);
    
    let message = `*Venzic Lifesciences - New B2B Inquiry*\n\n`;
    message += `*Name:* ${leadData.name || 'Not provided'}\n`;
    message += `*Mobile:* ${leadData.phone || 'Not provided'}\n`;
    
    if (leadData.email) {
        message += `*Email:* ${leadData.email}\n`;
    }
    if (leadData.service) {
        message += `*Service/Product:* ${leadData.service}\n`;
    }
    if (leadData.qty) {
        message += `*Quantity:* ${leadData.qty}\n`;
    }
    if (leadData.message) {
        message += `*Inquiry Details:* ${leadData.message}\n`;
    }

    const encodedText = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/919671055999?text=${encodedText}`;
    
    window.open(whatsappUrl, '_blank');
    
    return Promise.resolve({ success: true });
};

/**
 * Auto-rotating Hero Slideshow
 */
function initHeroSlider() {
    const sliderImg = document.getElementById('hero-slider-img');
    const sliderBadge = document.getElementById('hero-slider-badge');
    const sliderTitle = document.getElementById('hero-slider-title');
    const sliderDesc = document.getElementById('hero-slider-desc');
    
    if (!sliderImg || !sliderBadge || !sliderTitle || !sliderDesc) return;
    
    const slides = [
        {
            img: "https://5.imimg.com/data5/SELLER/Default/2026/1/576055496/RP/KD/ZN/258108820/product-2-500x500.jpg",
            badge: "Himalayan Shilajit",
            title: "Pure Himalayan Shilajit Honey Sticks",
            desc: "Premium energy booster packed for modern ease."
        },
        {
            img: "https://5.imimg.com/data5/SELLER/Default/2026/1/576202074/CM/XO/HD/258108820/shilajit-extract-500x500.jpg",
            badge: "Herbal Extracts Capsule",
            title: "Shilajit Extract Capsule",
            desc: "Standardized to 20-60% Fulvic Acid with 80+ trace minerals."
        },
        {
            img: "https://5.imimg.com/data5/ANDROID/Default/2026/1/578532812/ZV/NM/IE/258108820/product-jpeg-500x500.jpg",
            badge: "Shilajit Resin",
            title: "Himalayan Shilajit Resin (Gold Grade)",
            desc: "Premium purified Ayurvedic Shilajit resin extracted above 16,000 feet."
        },
        {
            img: "https://5.imimg.com/data5/SELLER/Default/2026/1/576168640/AB/PB/AB/258108820/korean-beauty-500x500.jpg",
            badge: "Herbal Skincare",
            title: "Korean Beauty Cream",
            desc: "Niacinamide, Rice and Centella extracts for glass skin hydration."
        },
        {
            img: "https://5.imimg.com/data5/SELLER/Default/2026/1/576188437/EJ/ID/DD/258108820/women-libido-enhancement-capsule-third-party-manufacturer-500x500.jpg",
            badge: "Herbal Vitality",
            title: "Women Libido Enhancement Capsule",
            desc: "Specially formulated to support female vitality and energy."
        },
        {
            img: "https://5.imimg.com/data5/ANDROID/Default/2026/1/577964372/JW/CA/BS/258108820/product-jpeg-500x500.jpg",
            badge: "Mushroom Extracts",
            title: "Ganoderma Extracts Capsule",
            desc: "Triple purified Ganoderma extracts for immune system support."
        }
    ];
    
    let currentSlide = 0;
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        
        // Add fade class
        sliderImg.classList.add('hero-slider-fade');
        sliderBadge.classList.add('hero-slider-fade');
        sliderTitle.classList.add('hero-slider-fade');
        sliderDesc.classList.add('hero-slider-fade');
        
        setTimeout(() => {
            const slide = slides[currentSlide];
            sliderImg.setAttribute('src', slide.img);
            sliderBadge.textContent = slide.badge;
            sliderTitle.textContent = slide.title;
            sliderDesc.textContent = slide.desc;
            
            // Remove fade class to fade back in
            sliderImg.classList.remove('hero-slider-fade');
            sliderBadge.classList.remove('hero-slider-fade');
            sliderTitle.classList.remove('hero-slider-fade');
            sliderDesc.classList.remove('hero-slider-fade');
        }, 300); // matches the transition timing
    }
    
    // Auto-slide every 2 seconds
    setInterval(nextSlide, 2000);
}



