'use strict';

    
// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }



// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });



// testimonials variables
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const testimonialsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
}

// add click event to all modal items
for (let i = 0; i < testimonialsItem.length; i++) {

  testimonialsItem[i].addEventListener("click", function () {

    modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
    modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
    modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
    modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;

    testimonialsModalFunc();

  });

}

// add click event to modal close button
modalCloseBtn.addEventListener("click", testimonialsModalFunc);
overlay.addEventListener("click", testimonialsModalFunc);





// blog modal variables
let blogItems = document.querySelectorAll("[data-blog-item]");
const blogModalContainer = document.querySelector("[data-blog-modal-container]");
const blogModalCloseBtn = document.querySelector("[data-blog-modal-close-btn]");
const blogOverlay = document.querySelector("[data-blog-overlay]");


// Authentication system
const users = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "user", password: "user123", role: "user" }
];

let currentUser = null;

// Authentication state management
function updateAuthUI() {
  const loginBtn = document.getElementById('login-btn');
  const addBlogBtn = document.getElementById('add-blog-btn');
  const logoutBtn = document.getElementById('logout-btn');
  
  if (currentUser) {
    // User is logged in
    loginBtn.style.display = 'none';
    addBlogBtn.style.display = 'inline-flex';
    logoutBtn.style.display = 'inline-flex';
  } else {
    // User is not logged in
    loginBtn.style.display = 'inline-flex';
    addBlogBtn.style.display = 'none';
    logoutBtn.style.display = 'none';
  }
}

function login(username, password) {
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    currentUser = user;
    updateAuthUI();
    closeLoginModal();
    showSuccessMessage(`Welcome back, ${user.username}!`);
    return true;
  } else {
    showErrorMessage('Invalid username or password');
    return false;
  }
}

function logout() {
  currentUser = null;
  updateAuthUI();
  showSuccessMessage('Logged out successfully');
}

function isAuthenticated() {
  return currentUser !== null;
}

// Login modal functionality
const loginModal = document.getElementById('login-modal');
const loginOverlay = document.getElementById('login-overlay');
const loginCloseBtn = document.getElementById('login-close-btn');
const cancelLoginBtn = document.getElementById('cancel-login-btn');
const loginForm = document.getElementById('login-form');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');

function openLoginModal() {
  loginModal.classList.add('active');
}

function closeLoginModal() {
  loginModal.classList.remove('active');
  loginForm.reset();
}

// Event listeners for login modal
loginBtn.addEventListener('click', openLoginModal);
loginCloseBtn.addEventListener('click', closeLoginModal);
loginOverlay.addEventListener('click', closeLoginModal);
cancelLoginBtn.addEventListener('click', closeLoginModal);
logoutBtn.addEventListener('click', logout);

// Login form submission
loginForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  login(username, password);
});

// Protect add blog functionality
const originalAddBlogBtn = document.getElementById('add-blog-btn');
originalAddBlogBtn.addEventListener('click', function(e) {
  if (!isAuthenticated()) {
    e.preventDefault();
    openLoginModal();
  }
});

// blog modal elements
const blogModalImage = document.querySelector("[data-blog-modal-image]");
const blogModalCategory = document.querySelector("[data-blog-modal-category]");
const blogModalDate = document.querySelector("[data-blog-modal-date]");
const blogModalTitle = document.querySelector("[data-blog-modal-title]");
const blogModalText = document.querySelector("[data-blog-modal-text]");

// blog modal toggle function
const blogModalFunc = function () {
  blogModalContainer.classList.toggle("active");
  blogOverlay.classList.toggle("active");
}

// Firestore functions
async function loadBlogPostsFromFirestore() {
  try {
    if (!window.db) {
      console.log('Firebase not initialized, using default posts');
      blogPosts = [...defaultBlogPosts];
      return;
    }

    isLoading = true;
    showLoadingState();

    const blogPostsRef = collection(window.db, 'blogPosts');
    const q = query(blogPostsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    blogPosts = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      blogPosts.push({
        id: doc.id,
        title: data.title,
        category: data.category,
        date: data.date,
        image: data.image || './assets/images/blog-1.jpg',
        excerpt: data.excerpt,
        content: data.content,
        createdAt: data.createdAt
      });
    });

    // If no posts in Firestore, use default posts
    if (blogPosts.length === 0) {
      blogPosts = [...defaultBlogPosts];
    }

    hideLoadingState();
  } catch (error) {
    console.error('Error loading blog posts:', error);
    blogPosts = [...defaultBlogPosts];
    hideLoadingState();
    showError('Failed to load blog posts. Using default content.');
  }
}

async function saveBlogPostToFirestore(postData) {
  try {
    if (!window.db) {
      console.log('Firebase not initialized, saving locally');
      return postData;
    }

    const blogPostsRef = collection(window.db, 'blogPosts');
    const docRef = await addDoc(blogPostsRef, {
      ...postData,
      createdAt: serverTimestamp()
    });

    return {
      ...postData,
      id: docRef.id
    };
  } catch (error) {
    console.error('Error saving blog post:', error);
    throw error;
  }
}

function showLoadingState() {
  const blogPostsList = document.getElementById('blog-posts-list');
  blogPostsList.innerHTML = `
    <li class="loading-item">
      <div class="loading-spinner"></div>
      <p>Loading blog posts...</p>
    </li>
  `;
}

function hideLoadingState() {
  isLoading = false;
}

function showError(message) {
  const blogPostsList = document.getElementById('blog-posts-list');
  blogPostsList.innerHTML = `
    <li class="error-item">
      <p>${message}</p>
    </li>
  `;
}

// Function to render blog posts
function renderBlogPosts() {
  const blogPostsList = document.getElementById('blog-posts-list');
  blogPostsList.innerHTML = '';

  if (blogPosts.length === 0) {
    blogPostsList.innerHTML = `
      <li class="empty-item">
        <p>No blog posts found. Create your first post!</p>
      </li>
    `;
    return;
  }

  console.log('Rendering blog posts:', blogPosts);

  blogPosts.forEach(post => {
    const blogItem = document.createElement('li');
    blogItem.className = 'blog-post-item';
    blogItem.innerHTML = `
      <a href="#" data-blog-item data-blog-id="${post.id}">
        <figure class="blog-banner-box">
          <img src="${post.image}" alt="${post.title}" loading="lazy" data-blog-image>
        </figure>
        
        <div class="blog-content">
          <div class="blog-meta">
            <p class="blog-category" data-blog-category>${post.category}</p>
            <span class="dot"></span>
            <time datetime="${post.date}" data-blog-date>${formatDate(post.date)}</time>
          </div>
          
          <h3 class="h3 blog-item-title" data-blog-title>${post.title}</h3>
          
          <p class="blog-text" data-blog-excerpt>${post.excerpt}</p>
        </div>
      </a>
    `;
    blogPostsList.appendChild(blogItem);
  });

  // Re-attach event listeners
  attachBlogEventListeners();
}

// Function to attach blog event listeners
function attachBlogEventListeners() {
  // Remove existing event listeners to prevent duplicates
  const existingItems = document.querySelectorAll("[data-blog-item]");
  existingItems.forEach(item => {
    item.replaceWith(item.cloneNode(true));
  });
  
  // Get fresh references to blog items
  blogItems = document.querySelectorAll("[data-blog-item]");
  
  console.log('Attaching event listeners to', blogItems.length, 'blog items');
  
  for (let i = 0; i < blogItems.length; i++) {
    blogItems[i].addEventListener("click", function (e) {
      e.preventDefault();
      
      const blogId = this.getAttribute('data-blog-id');
      console.log('Clicked blog item with ID:', blogId);
      console.log('Available blog posts:', blogPosts.map(p => ({ id: p.id, title: p.title })));
      
      const post = blogPosts.find(p => p.id === blogId);
      
      if (post) {
        console.log('Found post:', post);
        // Update modal content
        blogModalImage.src = post.image;
        blogModalImage.alt = post.title;
        blogModalCategory.innerHTML = post.category;
        blogModalDate.innerHTML = formatDate(post.date);
        blogModalDate.setAttribute('datetime', post.date);
        blogModalTitle.innerHTML = post.title;
        blogModalText.innerHTML = post.content;
        
        blogModalFunc();
      } else {
        console.error('Blog post not found:', blogId);
        console.error('Available IDs:', blogPosts.map(p => p.id));
      }
    });
  }
}

// Function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

// Blog management functionality
const addBlogBtn = document.getElementById('add-blog-btn');
const addBlogModal = document.getElementById('add-blog-modal');
const addBlogOverlay = document.getElementById('add-blog-overlay');
const addBlogCloseBtn = document.getElementById('add-blog-close-btn');
const cancelBlogBtn = document.getElementById('cancel-blog-btn');
const addBlogForm = document.getElementById('add-blog-form');

// Open add blog modal
addBlogBtn.addEventListener('click', function() {
  addBlogModal.classList.add('active');
  // Set today's date as default
  document.getElementById('blog-date').value = new Date().toISOString().split('T')[0];
});

// Close add blog modal
function closeAddBlogModal() {
  addBlogModal.classList.remove('active');
  addBlogForm.reset();
}

addBlogCloseBtn.addEventListener('click', closeAddBlogModal);
addBlogOverlay.addEventListener('click', closeAddBlogModal);
cancelBlogBtn.addEventListener('click', closeAddBlogModal);

// Editor toolbar functionality
const editorBtns = document.querySelectorAll('.editor-btn');
const contentTextarea = document.getElementById('blog-content');

editorBtns.forEach(btn => {
  btn.addEventListener('click', function() {
    const command = this.getAttribute('data-command');
    const start = contentTextarea.selectionStart;
    const end = contentTextarea.selectionEnd;
    const selectedText = contentTextarea.value.substring(start, end);
    let newText = '';
    
    switch(command) {
      case 'bold':
        newText = `<strong>${selectedText || 'bold text'}</strong>`;
        break;
      case 'italic':
        newText = `<em>${selectedText || 'italic text'}</em>`;
        break;
      case 'insertUnorderedList':
        newText = `<ul>\n  <li>${selectedText || 'list item'}</li>\n</ul>`;
        break;
      case 'insertOrderedList':
        newText = `<ol>\n  <li>${selectedText || 'list item'}</li>\n</ol>`;
        break;
      case 'insertParagraph':
        newText = `<p>${selectedText || 'paragraph text'}</p>`;
        break;
      case 'insertCode':
        newText = `<code>${selectedText || 'code'}</code>`;
        break;
      case 'insertQuote':
        newText = `<blockquote>\n  ${selectedText || 'quote text'}\n</blockquote>`;
        break;
    }
    
    contentTextarea.value = contentTextarea.value.substring(0, start) + newText + contentTextarea.value.substring(end);
    contentTextarea.focus();
    contentTextarea.setSelectionRange(start + newText.length, start + newText.length);
  });
});

// Handle form submission
addBlogForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const submitBtn = this.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  
  try {
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';
    
    const formData = new FormData(this);
    const newPost = {
      title: formData.get('title'),
      category: formData.get('category'),
      date: formData.get('date'),
      image: formData.get('image') || './assets/images/blog-1.jpg',
      excerpt: formData.get('excerpt'),
      content: formData.get('content')
    };
    
    // Save to Firestore
    const savedPost = await saveBlogPostToFirestore(newPost);
    
    // Add to local array
    blogPosts.unshift(savedPost);
    
    // Re-render blog posts
    renderBlogPosts();
    
    // Close modal
    closeAddBlogModal();
    
    // Show success message
    showSuccessMessage('Blog post created successfully!');
    
  } catch (error) {
    console.error('Error creating blog post:', error);
    showErrorMessage('Failed to create blog post. Please try again.');
  } finally {
    // Reset button state
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

function showSuccessMessage(message) {
  // Create a temporary success message
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  successDiv.textContent = message;
  successDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--bg-gradient-yellow-1);
    color: var(--vegas-gold);
    padding: 12px 20px;
    border-radius: 8px;
    border:1px solid var(--vegas-gold);
    box-shadow: var(--shadow-1);
    z-index: 1000;
    font-weight: 500;
  `;
  
  document.body.appendChild(successDiv);
  
  // Remove after 3 seconds
  setTimeout(() => {
    successDiv.remove();
  }, 3000);
}

function showErrorMessage(message) {
  // Create a temporary error message
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--bittersweet-shimmer);
    color: var(--white-1);
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: var(--shadow-1);
    z-index: 1000;
    font-weight: 500;
  `;
  
  document.body.appendChild(errorDiv);
  
  // Remove after 5 seconds
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// Initialize blog posts on page load
document.addEventListener('DOMContentLoaded', async function() {
  await loadBlogPostsFromFirestore();
  renderBlogPosts();
  updateAuthUI(); // Initialize authentication UI
});

// add click event to blog modal close button
blogModalCloseBtn.addEventListener("click", blogModalFunc);
blogOverlay.addEventListener("click", blogModalFunc);

// Blog management variables
let blogPosts = [];
let isLoading = false;

// Default blog posts (fallback if Firestore is not available)
const defaultBlogPosts = [
  {
    id: "default-1",
    title: "Design conferences in 2022",
    category: "Design",
    date: "2022-02-23",
    image: "./assets/images/blog-1.jpg",
    excerpt: "Veritatis et quasi architecto beatae vitae dicta sunt, explicabo.",
    content: `
      <p>Design conferences in 2022 brought together the brightest minds in the industry to discuss the latest trends, innovations, and challenges facing designers today. These events served as crucial platforms for knowledge sharing, networking, and professional development.</p>
      
      <h2>Key Themes and Insights</h2>
      
      <code> cout << "Hello World" << endl; </code>
      
      <p>Key themes that emerged throughout the year included the growing importance of inclusive design, the integration of artificial intelligence in design workflows, and the continued evolution of user experience design in an increasingly digital world.</p>
      
      <blockquote>
        "The future of design lies not in creating beautiful interfaces, but in crafting experiences that truly serve human needs while respecting our planet's resources."
      </blockquote>
      
      <h3>Notable Speakers and Case Studies</h3>
      
      <p>Notable speakers from leading tech companies and design agencies shared insights on how design thinking can drive business success, with case studies demonstrating the measurable impact of good design on user engagement and conversion rates.</p>
      
      <p>The conferences also highlighted the importance of sustainability in design, with many sessions dedicated to creating environmentally conscious products and services that meet user needs while minimizing ecological impact.</p>
      
      <h3>Looking Forward</h3>
      
      <p>As we move into 2023, the design community continues to evolve, with new tools, methodologies, and approaches emerging to help designers create more meaningful and impactful work.</p>
    `
  },
  {
    id: "default-2",
    title: "Best fonts every designer",
    category: "Design",
    date: "2022-02-23",
    image: "./assets/images/blog-2.jpg",
    excerpt: "Sed ut perspiciatis, nam libero tempore, cum soluta nobis est eligendi.",
    content: `
      <p>Typography is the foundation of good design, and choosing the right fonts can make or break a project. In this comprehensive guide, we explore the essential fonts that every designer should have in their toolkit.</p>
      
      <h2>Essential Font Categories</h2>
      
      <p>From timeless classics like <code>Helvetica</code> and <code>Times New Roman</code> to modern favorites like <code>Inter</code> and <code>Poppins</code>, each font brings its own personality and use cases to the table. Understanding when and how to use these fonts is crucial for creating effective designs.</p>
      
      <h3>Serif vs Sans-Serif</h3>
      
      <p>We'll also cover font pairing techniques, ensuring your typography choices work harmoniously together. The right combination can enhance readability, establish hierarchy, and create visual interest that guides users through your content.</p>
      
      <blockquote>
        "Good typography is invisible. Great typography is invisible and beautiful."
      </blockquote>
      
      <h3>Technical Implementation</h3>
      
      <p>Finally, we'll discuss the technical aspects of font implementation, including web font optimization, fallback strategies, and accessibility considerations that ensure your typography works across all devices and for all users.</p>
      
      <pre><code>@font-face {
  font-family: 'CustomFont';
  src: url('font.woff2') format('woff2');
  font-display: swap;
}</code></pre>
    `
  },
  {
    id: "default-3",
    title: "Design digest #80",
    category: "Design",
    date: "2022-02-23",
    image: "./assets/images/blog-3.jpg",
    excerpt: "Excepteur sint occaecat cupidatat no proident, quis nostrum exercitationem ullam corporis suscipit.",
    content: `
      <p>Welcome to Design Digest #80, your weekly roundup of the most important design news, trends, and insights from around the web. This week, we're covering some exciting developments in the design world.</p>
      
      <p>Figma continues to push the boundaries of collaborative design with new features that make it easier for teams to work together in real-time. The latest updates include improved prototyping capabilities and enhanced developer handoff tools.</p>
      
      <p>In the world of web design, we're seeing a resurgence of bold, experimental layouts that challenge traditional grid systems. Designers are embracing asymmetry and unconventional spacing to create more dynamic and engaging user experiences.</p>
      
      <p>Color trends for 2024 are shifting toward more muted, sophisticated palettes that reflect our current cultural moment. Expect to see more earth tones, soft pastels, and carefully balanced neutrals in upcoming projects.</p>
    `
  },
  {
    id: "default-4",
    title: "UI interactions of the week",
    category: "Design",
    date: "2022-02-23",
    image: "./assets/images/blog-4.jpg",
    excerpt: "Enim ad minim veniam, consectetur adipiscing elit, quis nostrud exercitation ullamco laboris nisi.",
    content: `
      <p>This week's collection of UI interactions showcases some truly innovative approaches to user interface design. From micro-animations to gesture-based navigation, these examples demonstrate the power of thoughtful interaction design.</p>
      
      <p>One standout example features a card-based layout with smooth hover effects that provide subtle feedback to users. The animations are purposeful and enhance the user experience without being distracting or overwhelming.</p>
      
      <p>Another impressive interaction involves a progress indicator that uses both visual and haptic feedback to guide users through a multi-step process. The design makes complex workflows feel intuitive and manageable.</p>
      
      <p>We're also seeing interesting uses of scroll-triggered animations that reveal content in creative ways. These interactions add depth and engagement to what might otherwise be static content, keeping users interested and encouraging further exploration.</p>
    `
  },
  {
    id: "default-5",
    title: "The forgotten art of spacing",
    category: "Design",
    date: "2022-02-23",
    image: "./assets/images/blog-5.jpg",
    excerpt: "Maxime placeat, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    content: `
      <p>Spacing is one of the most fundamental yet often overlooked aspects of design. In our rush to add content and features, we sometimes forget that the space between elements is just as important as the elements themselves.</p>
      
      <p>Good spacing creates visual hierarchy, improves readability, and guides users through your interface. It's the invisible structure that makes good design feel effortless and professional. Without proper spacing, even the most beautiful designs can feel cluttered and difficult to navigate.</p>
      
      <p>There are several key principles to consider when working with spacing: consistency, rhythm, and breathing room. Consistent spacing creates a sense of order and predictability, while rhythmic spacing helps establish visual flow and movement.</p>
      
      <p>Don't be afraid of white space. It's not wasted space—it's a powerful design tool that can help highlight important content, create focus, and improve overall user experience. Sometimes, less really is more.</p>
    `
  },
  {
    id: "default-6",
    title: "Design digest #79",
    category: "Design",
    date: "2022-02-23",
    image: "./assets/images/blog-6.jpg",
    excerpt: "Optio cumque nihil impedit uo minus quod maxime placeat, velit esse cillum.",
    content: `
      <p>Design Digest #79 brings you the latest insights from the design community, featuring innovative projects, emerging trends, and expert opinions on the future of design.</p>
      
      <p>This week, we're excited to share some groundbreaking work in the field of sustainable design. Several companies are leading the way in creating products and services that prioritize environmental responsibility without compromising on aesthetics or functionality.</p>
      
      <p>In the realm of digital design, we're seeing interesting experiments with 3D elements and depth in web interfaces. These designs create more immersive experiences while maintaining usability and accessibility standards.</p>
      
      <p>The design community continues to push for more inclusive practices, with new tools and methodologies emerging to help designers create products that work for everyone, regardless of ability, background, or circumstance.</p>
    `
  }
];




// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-select-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

select.addEventListener("click", function () { elementToggleFunc(this); });

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);

  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {

  for (let i = 0; i < filterItems.length; i++) {

    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }

  }

}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {

  filterBtn[i].addEventListener("click", function () {

    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);

    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;

  });

}



// contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// add event to all form input field
for (let i = 0; i < formInputs.length; i++) {
  formInputs[i].addEventListener("input", function () {

    // check form validation
    if (form.checkValidity()) {
      formBtn.removeAttribute("disabled");
    } else {
      formBtn.setAttribute("disabled", "");
    }

  });
}



// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {

    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
    }

  });
}