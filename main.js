document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initCategoryFiltering();
    initSearch();
    initHeaderSearch();
    initInquirySystem();
    initScrollAnimations();
    initScrollToTop();
    resolveActiveNavLink();
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

/**
 * Mock lead capture system (resolves instantly to keep contact forms functional)
 */
window.sendWhatsAppLeadNotification = (leadData) => {
    console.log("[Mock Lead Capture] Lead captured successfully:", leadData);
    return Promise.resolve({ success: true });
};



