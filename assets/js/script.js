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
  
  // Re-render blog posts to show/hide edit/delete buttons
  if (typeof renderBlogPosts === 'function') {
    renderBlogPosts();
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

async function updateBlogPostInFirestore(postId, postData) {
  try {
    if (!window.db) {
      console.log('Firebase not initialized, updating locally');
      return postData;
    }

    const postRef = doc(window.db, 'blogPosts', postId);
    await updateDoc(postRef, {
      ...postData,
      updatedAt: serverTimestamp()
    });

    return {
      ...postData,
      id: postId
    };
  } catch (error) {
    console.error('Error updating blog post:', error);
    throw error;
  }
}

async function deleteBlogPostFromFirestore(postId) {
  try {
    if (!window.db) {
      console.log('Firebase not initialized, deleting locally');
      return;
    }

    const postRef = doc(window.db, 'blogPosts', postId);
    await deleteDoc(postRef);
  } catch (error) {
    console.error('Error deleting blog post:', error);
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
  const isLoggedIn = isAuthenticated();

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
      ${isLoggedIn ? `
        <div class="blog-post-actions">
          <button class="blog-action-btn edit-btn" data-edit-blog="${post.id}" title="Edit Post">
            <ion-icon name="create-outline"></ion-icon>
          </button>
          <button class="blog-action-btn delete-btn" data-delete-blog="${post.id}" title="Delete Post">
            <ion-icon name="trash-outline"></ion-icon>
          </button>
        </div>
      ` : ''}
    `;
    blogPostsList.appendChild(blogItem);
  });

  // Re-attach event listeners
  attachBlogEventListeners();
  
  // Attach edit/delete button listeners if logged in
  if (isLoggedIn) {
    attachEditDeleteListeners();
  }
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
const contentTextarea = document.getElementById('blog-content');
const lineNumbers = document.getElementById('editor-line-numbers');
const charCount = document.querySelector('.char-count');
const wordCount = document.querySelector('.word-count');

// Update line numbers
function updateLineNumbers() {
  if (!lineNumbers || !contentTextarea) return;
  
  const lines = contentTextarea.value.split('\n');
  const lineCount = lines.length || 1;
  
  let lineNumbersHTML = '';
  for (let i = 1; i <= lineCount; i++) {
    lineNumbersHTML += `${i}\n`;
  }
  
  lineNumbers.textContent = lineNumbersHTML;
}

// Update character and word count
function updateCounts() {
  if (!charCount || !wordCount || !contentTextarea) return;
  
  const text = contentTextarea.value;
  const charCountValue = text.length;
  const wordCountValue = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  
  charCount.textContent = `${charCountValue.toLocaleString()} characters`;
  wordCount.textContent = `${wordCountValue.toLocaleString()} words`;
}

// Open add blog modal
if (addBlogBtn) {
  addBlogBtn.addEventListener('click', function() {
    addBlogModal.classList.add('active');
    // Set today's date as default
    const dateInput = document.getElementById('blog-date');
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }
    // Initialize editor features when modal opens
    setTimeout(function() {
      updateLineNumbers();
      updateCounts();
    }, 100);
  });
}

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

// Sync scroll between textarea and line numbers
function syncScroll() {
  if (!lineNumbers || !contentTextarea) return;
  lineNumbers.scrollTop = contentTextarea.scrollTop;
}

// Initialize editor features
function initEditorFeatures() {
  if (!contentTextarea) return;
  
  // Update on input
  contentTextarea.addEventListener('input', function() {
    updateLineNumbers();
    updateCounts();
  });
  
  // Update on scroll
  contentTextarea.addEventListener('scroll', syncScroll);
  
  // Initial update
  updateLineNumbers();
  updateCounts();
  
  // Update when modal opens
  if (addBlogModal) {
    const observer = new MutationObserver(function(mutations) {
      if (addBlogModal.classList.contains('active')) {
        setTimeout(function() {
          updateLineNumbers();
          updateCounts();
        }, 100);
      }
    });
    
    observer.observe(addBlogModal, { attributes: true, attributeFilter: ['class'] });
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEditorFeatures);
} else {
  initEditorFeatures();
}

// Enhanced editor toolbar functionality
editorBtns.forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    const command = this.getAttribute('data-command');
    
    if (command === 'preview') {
      // Preview functionality - could open a preview modal
      alert('Preview feature coming soon!');
      return;
    }
    
    if (!contentTextarea) return;
    
    contentTextarea.focus();
    const start = contentTextarea.selectionStart;
    const end = contentTextarea.selectionEnd;
    const selectedText = contentTextarea.value.substring(start, end);
    let newText = '';
    let cursorPos = start;
    
    switch(command) {
      case 'bold':
        newText = `<strong>${selectedText || 'bold text'}</strong>`;
        cursorPos = start + (selectedText ? newText.length : 7);
        break;
      case 'italic':
        newText = `<em>${selectedText || 'italic text'}</em>`;
        cursorPos = start + (selectedText ? newText.length : 8);
        break;
      case 'underline':
        newText = `<u>${selectedText || 'underlined text'}</u>`;
        cursorPos = start + (selectedText ? newText.length : 11);
        break;
      case 'insertHeading':
        newText = `<h2>${selectedText || 'Heading'}</h2>`;
        cursorPos = start + (selectedText ? newText.length : 4);
        break;
      case 'insertUnorderedList':
        newText = selectedText 
          ? `<ul>\n  <li>${selectedText}</li>\n</ul>`
          : `<ul>\n  <li>List item</li>\n</ul>`;
        cursorPos = start + newText.length - (selectedText ? 6 : 10);
        break;
      case 'insertOrderedList':
        newText = selectedText
          ? `<ol>\n  <li>${selectedText}</li>\n</ol>`
          : `<ol>\n  <li>List item</li>\n</ol>`;
        cursorPos = start + newText.length - (selectedText ? 6 : 10);
        break;
      case 'insertCode':
        if (selectedText.includes('\n')) {
          newText = `<pre><code>${selectedText || 'code block'}</code></pre>`;
        } else {
          newText = `<code>${selectedText || 'code'}</code>`;
        }
        cursorPos = start + (selectedText ? newText.length : (selectedText.includes('\n') ? 17 : 7));
        break;
      case 'insertQuote':
        newText = `<blockquote>\n  ${selectedText || 'Quote text'}\n</blockquote>`;
        cursorPos = start + (selectedText ? newText.length : 11);
        break;
      case 'insertLink':
        const url = prompt('Enter URL:', 'https://');
        if (url) {
          newText = `<a href="${url}" target="_blank">${selectedText || 'link text'}</a>`;
          cursorPos = start + (selectedText ? newText.length : 10);
        } else {
          return; // User cancelled
        }
        break;
    }
    
    if (newText) {
      contentTextarea.value = contentTextarea.value.substring(0, start) + newText + contentTextarea.value.substring(end);
      updateLineNumbers();
      updateCounts();
      contentTextarea.focus();
      contentTextarea.setSelectionRange(cursorPos, cursorPos);
    }
  });
});

// Handle form submission
if (addBlogForm) {
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
}

// Edit Blog Modal Elements
const editBlogModal = document.getElementById('edit-blog-modal');
const editBlogOverlay = document.getElementById('edit-blog-overlay');
const editBlogCloseBtn = document.getElementById('edit-blog-close-btn');
const cancelEditBlogBtn = document.getElementById('cancel-edit-blog-btn');
const editBlogForm = document.getElementById('edit-blog-form');
const deleteBlogBtn = document.getElementById('delete-blog-btn');
const editContentTextarea = document.getElementById('edit-blog-content');
const editLineNumbers = document.getElementById('edit-editor-line-numbers');
const editCharCount = document.getElementById('edit-char-count');
const editWordCount = document.getElementById('edit-word-count');

// Update line numbers for edit modal
function updateEditLineNumbers() {
  if (!editLineNumbers || !editContentTextarea) return;
  
  const lines = editContentTextarea.value.split('\n');
  const lineCount = lines.length || 1;
  
  let lineNumbersHTML = '';
  for (let i = 1; i <= lineCount; i++) {
    lineNumbersHTML += `${i}\n`;
  }
  
  editLineNumbers.textContent = lineNumbersHTML;
}

// Update character and word count for edit modal
function updateEditCounts() {
  if (!editCharCount || !editWordCount || !editContentTextarea) return;
  
  const text = editContentTextarea.value;
  const charCountValue = text.length;
  const wordCountValue = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  
  editCharCount.textContent = `${charCountValue.toLocaleString()} characters`;
  editWordCount.textContent = `${wordCountValue.toLocaleString()} words`;
}

// Sync scroll for edit modal
function syncEditScroll() {
  if (!editLineNumbers || !editContentTextarea) return;
  editLineNumbers.scrollTop = editContentTextarea.scrollTop;
}

// Initialize edit editor features
function initEditEditorFeatures() {
  if (!editContentTextarea) return;
  
  editContentTextarea.addEventListener('input', function() {
    updateEditLineNumbers();
    updateEditCounts();
  });
  
  editContentTextarea.addEventListener('scroll', syncEditScroll);
}

// Initialize edit editor on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initEditEditorFeatures);
} else {
  initEditEditorFeatures();
}

// Open edit modal with post data
function openEditBlogModal(postId) {
  const post = blogPosts.find(p => p.id === postId);
  if (!post) {
    showErrorMessage('Blog post not found');
    return;
  }
  
  // Populate form fields
  document.getElementById('edit-blog-id').value = post.id;
  document.getElementById('edit-blog-title').value = post.title;
  document.getElementById('edit-blog-category').value = post.category;
  document.getElementById('edit-blog-date').value = post.date;
  document.getElementById('edit-blog-image').value = post.image || '';
  document.getElementById('edit-blog-excerpt').value = post.excerpt;
  editContentTextarea.value = post.content;
  
  // Update counts and line numbers
  setTimeout(function() {
    updateEditLineNumbers();
    updateEditCounts();
  }, 100);
  
  // Open modal
  editBlogModal.classList.add('active');
}

// Close edit modal
function closeEditBlogModal() {
  editBlogModal.classList.remove('active');
  if (editBlogForm) {
    editBlogForm.reset();
  }
}

// Event listeners for edit modal
if (editBlogCloseBtn) {
  editBlogCloseBtn.addEventListener('click', closeEditBlogModal);
}
if (editBlogOverlay) {
  editBlogOverlay.addEventListener('click', closeEditBlogModal);
}
if (cancelEditBlogBtn) {
  cancelEditBlogBtn.addEventListener('click', closeEditBlogModal);
}

// Handle edit form submission
if (editBlogForm) {
  editBlogForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    const postId = document.getElementById('edit-blog-id').value;
    
    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Updating...';
      
      const formData = new FormData(this);
      const updatedPost = {
        title: formData.get('title'),
        category: formData.get('category'),
        date: formData.get('date'),
        image: formData.get('image') || './assets/images/blog-1.jpg',
        excerpt: formData.get('excerpt'),
        content: formData.get('content')
      };
      
      // Update in Firestore
      await updateBlogPostInFirestore(postId, updatedPost);
      
      // Update local array
      const index = blogPosts.findIndex(p => p.id === postId);
      if (index !== -1) {
        blogPosts[index] = { ...updatedPost, id: postId };
      }
      
      // Re-render blog posts
      renderBlogPosts();
      
      // Close modal
      closeEditBlogModal();
      
      // Show success message
      showSuccessMessage('Blog post updated successfully!');
      
    } catch (error) {
      console.error('Error updating blog post:', error);
      showErrorMessage('Failed to update blog post. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

// Handle delete button
if (deleteBlogBtn) {
  deleteBlogBtn.addEventListener('click', async function(e) {
    e.preventDefault();
    
    const postId = document.getElementById('edit-blog-id').value;
    if (!postId) return;
    
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Delete from Firestore
      await deleteBlogPostFromFirestore(postId);
      
      // Remove from local array
      blogPosts = blogPosts.filter(p => p.id !== postId);
      
      // Re-render blog posts
      renderBlogPosts();
      
      // Close modal
      closeEditBlogModal();
      
      // Show success message
      showSuccessMessage('Blog post deleted successfully!');
      
    } catch (error) {
      console.error('Error deleting blog post:', error);
      showErrorMessage('Failed to delete blog post. Please try again.');
    }
  });
}

// Attach edit/delete button listeners
function attachEditDeleteListeners() {
  // Edit buttons
  const editButtons = document.querySelectorAll('[data-edit-blog]');
  editButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const postId = this.getAttribute('data-edit-blog');
      openEditBlogModal(postId);
    });
  });
  
  // Delete buttons
  const deleteButtons = document.querySelectorAll('[data-delete-blog]');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', async function(e) {
      e.preventDefault();
      e.stopPropagation();
      const postId = this.getAttribute('data-delete-blog');
      
      if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
        return;
      }
      
      try {
        await deleteBlogPostFromFirestore(postId);
        blogPosts = blogPosts.filter(p => p.id !== postId);
        renderBlogPosts();
        showSuccessMessage('Blog post deleted successfully!');
      } catch (error) {
        console.error('Error deleting blog post:', error);
        showErrorMessage('Failed to delete blog post. Please try again.');
      }
    });
  });
}

// Enhanced editor toolbar functionality for edit modal
const editEditorBtns = document.querySelectorAll('.editor-btn[data-editor="edit"]');
editEditorBtns.forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    const command = this.getAttribute('data-command');
    
    if (command === 'preview') {
      alert('Preview feature coming soon!');
      return;
    }
    
    if (!editContentTextarea) return;
    
    editContentTextarea.focus();
    const start = editContentTextarea.selectionStart;
    const end = editContentTextarea.selectionEnd;
    const selectedText = editContentTextarea.value.substring(start, end);
    let newText = '';
    let cursorPos = start;
    
    switch(command) {
      case 'bold':
        newText = `<strong>${selectedText || 'bold text'}</strong>`;
        cursorPos = start + (selectedText ? newText.length : 7);
        break;
      case 'italic':
        newText = `<em>${selectedText || 'italic text'}</em>`;
        cursorPos = start + (selectedText ? newText.length : 8);
        break;
      case 'underline':
        newText = `<u>${selectedText || 'underlined text'}</u>`;
        cursorPos = start + (selectedText ? newText.length : 11);
        break;
      case 'insertHeading':
        newText = `<h2>${selectedText || 'Heading'}</h2>`;
        cursorPos = start + (selectedText ? newText.length : 4);
        break;
      case 'insertUnorderedList':
        newText = selectedText 
          ? `<ul>\n  <li>${selectedText}</li>\n</ul>`
          : `<ul>\n  <li>List item</li>\n</ul>`;
        cursorPos = start + newText.length - (selectedText ? 6 : 10);
        break;
      case 'insertOrderedList':
        newText = selectedText
          ? `<ol>\n  <li>${selectedText}</li>\n</ol>`
          : `<ol>\n  <li>List item</li>\n</ol>`;
        cursorPos = start + newText.length - (selectedText ? 6 : 10);
        break;
      case 'insertCode':
        if (selectedText.includes('\n')) {
          newText = `<pre><code>${selectedText || 'code block'}</code></pre>`;
        } else {
          newText = `<code>${selectedText || 'code'}</code>`;
        }
        cursorPos = start + (selectedText ? newText.length : (selectedText.includes('\n') ? 17 : 7));
        break;
      case 'insertQuote':
        newText = `<blockquote>\n  ${selectedText || 'Quote text'}\n</blockquote>`;
        cursorPos = start + (selectedText ? newText.length : 11);
        break;
      case 'insertLink':
        const url = prompt('Enter URL:', 'https://');
        if (url) {
          newText = `<a href="${url}" target="_blank">${selectedText || 'link text'}</a>`;
          cursorPos = start + (selectedText ? newText.length : 10);
        } else {
          return;
        }
        break;
    }
    
    if (newText) {
      editContentTextarea.value = editContentTextarea.value.substring(0, start) + newText + editContentTextarea.value.substring(end);
      updateEditLineNumbers();
      updateEditCounts();
      editContentTextarea.focus();
      editContentTextarea.setSelectionRange(cursorPos, cursorPos);
    }
  });
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
const formMessage = document.getElementById("form-message");
const formError = document.getElementById("form-error");

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

// Initialize EmailJS when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  if (window.EMAILJS_CONFIG && window.EMAILJS_CONFIG.publicKey) {
    emailjs.init(window.EMAILJS_CONFIG.publicKey);
  }
});

// Enhanced form submission with EmailJS
form.addEventListener("submit", async function(e) {
  e.preventDefault();
  
  // Hide any existing messages
  hideFormMessages();
  
  // Show loading state
  showFormLoading();
  
  try {
    // Check if EmailJS is available
    if (typeof emailjs === 'undefined') {
      throw new Error('EmailJS not loaded');
    }
    
    // Get form data
    const formData = new FormData(form);
    const fullname = formData.get('fullname');
    const email = formData.get('email');
    const message = formData.get('message');
    
    // Validate required fields
    if (!fullname || !email || !message) {
      throw new Error('Please fill in all required fields');
    }
    
    // Create email template parameters
    const templateParams = {
      fullname: fullname,
      email: email,
      message: message,
      timestamp: new Date().toISOString(),
      website: window.location.href,
      user_agent: navigator.userAgent,
      ip_address: 'N/A', // EmailJS doesn't provide IP
      to_email: 'Ruben.Jim.co@gmail.com', // Your email address
      subject: 'New Contact Form Submission - Portfolio'
    };
    
    console.log('Sending email with params:', templateParams);
    
    // Send email using EmailJS
    const response = await emailjs.send(
      window.EMAILJS_CONFIG.serviceId,
      window.EMAILJS_CONFIG.templateId,
      templateParams
    );
    
    console.log('EmailJS response:', response);
    
    if (response.status === 200) {
      showFormSuccess();
      form.reset();
      formBtn.setAttribute("disabled", "");
    } else {
      throw new Error('Email sending failed');
    }
    
  } catch (error) {
    console.error('Form submission error:', error);
    showFormError();
  } finally {
    hideFormLoading();
  }
});

function showFormLoading() {
  formBtn.classList.add('loading');
  formBtn.innerHTML = '<ion-icon name="hourglass"></ion-icon><span class="form-btn-text">Sending...</span>';
  formBtn.disabled = true;
}

function hideFormLoading() {
  formBtn.classList.remove('loading');
  formBtn.innerHTML = '<ion-icon name="paper-plane"></ion-icon><span class="form-btn-text">Send Message</span>';
  formBtn.disabled = false;
}

function showFormSuccess() {
  formMessage.style.display = 'block';
  formError.style.display = 'none';
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    hideFormMessages();
  }, 5000);
}

function showFormError() {
  formError.style.display = 'block';
  formMessage.style.display = 'none';
  
  // Auto-hide after 7 seconds
  setTimeout(() => {
    hideFormMessages();
  }, 7000);
}

function hideFormMessages() {
  formMessage.style.display = 'none';
  formError.style.display = 'none';
}



// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// Function to switch to a specific page
function switchToPage(pageName, skipSave = false) {
  for (let i = 0; i < pages.length; i++) {
    if (pageName === pages[i].dataset.page) {
      pages[i].classList.add("active");
      navigationLinks[i].classList.add("active");
      window.scrollTo(0, 0);
      
      // Save to localStorage (unless skipSave is true)
      if (!skipSave) {
        localStorage.setItem('activePage', pageName);
      }
      
      // Re-initialize accordions if resume page is shown
      if (pages[i].dataset.page === "resume") {
        accordionInitialized = false; // Reset flag to allow re-initialization
        setTimeout(function() {
          initClassAccordion();
          initSubjectAccordion();
        }, 150); // Small delay to ensure DOM is ready
      }
    } else {
      pages[i].classList.remove("active");
      navigationLinks[i].classList.remove("active");
    }
  }
}

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {
    const pageName = this.innerHTML.toLowerCase();
    switchToPage(pageName);
  });
}

// Restore active page from localStorage on page load with loading animation
function restoreActivePage() {
  const loadingScreen = document.getElementById('loading-screen');
  const savedPage = localStorage.getItem('activePage');
  
  // Always show About page first (don't save to localStorage during initial load)
  switchToPage('about', true);
  
  if (savedPage && savedPage !== 'about') {
    // Wait 700ms (less than a second) then switch to saved page and hide loading
    setTimeout(function() {
      switchToPage(savedPage);
      // Hide loading screen with fade out
      if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        // Remove from DOM after animation completes
        setTimeout(function() {
          loadingScreen.style.display = 'none';
        }, 500);
      }
    }, 700);
  } else {
    // If no saved page or saved page is "about", just hide loading after delay
    setTimeout(function() {
      if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        setTimeout(function() {
          loadingScreen.style.display = 'none';
        }, 500);
      }
    }, 700);
  }
}

// Restore page on load
document.addEventListener('DOMContentLoaded', function() {
  // Small delay to ensure loading screen is visible
  setTimeout(restoreActivePage, 50);
});

// Also restore if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(restoreActivePage, 50);
  });
} else {
  setTimeout(restoreActivePage, 50);
}



// high-level classes accordion functionality
let accordionInitialized = false;
let accordionDelegateHandler = null;
let accordionTouchHandler = null;

function initClassAccordion() {
  // Use event delegation on the high-level-classes container for reliability
  const highLevelClassesContainer = document.querySelector(".high-level-classes");
  
  if (!highLevelClassesContainer) {
    return; // Container not found
  }
  
  if (accordionInitialized) {
    return;
  }
  
  // Remove old delegation handler if exists
  if (accordionDelegateHandler) {
    highLevelClassesContainer.removeEventListener("click", accordionDelegateHandler);
  }
  if (accordionTouchHandler) {
    highLevelClassesContainer.removeEventListener("touchend", accordionTouchHandler);
  }
  
  // Create new delegation handler
  accordionDelegateHandler = function(e) {
    // Ignore clicks on subject toggle buttons
    const subjectToggle = e.target.closest("[data-subject-toggle]");
    if (subjectToggle) return;
    
    // Check if click is on a button or any element inside a button with data-class-toggle
    const button = e.target.closest("[data-class-toggle]");
    const classHeader = e.target.closest(".class-header");
    
    if (!button && !classHeader) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Get the actual button element
    const targetButton = button || classHeader;
    const classItem = targetButton.closest(".class-item");
    
    if (!classItem) return;
    
    const isActive = classItem.classList.contains("active");
    
    // Close all other class items in the same subject section
    const subjectSection = classItem.closest(".class-subject-section");
    if (subjectSection) {
      subjectSection.querySelectorAll(".class-item").forEach(item => {
        if (item !== classItem) {
          item.classList.remove("active");
        }
      });
    }
    
    // Toggle current item
    if (isActive) {
      classItem.classList.remove("active");
    } else {
      classItem.classList.add("active");
    }
  };
  
  // Attach event listeners using delegation
  highLevelClassesContainer.addEventListener("click", accordionDelegateHandler, { passive: false });
  accordionTouchHandler = function(e) {
    accordionDelegateHandler(e);
    e.preventDefault();
  };
  highLevelClassesContainer.addEventListener("touchend", accordionTouchHandler, { passive: false });
  
  accordionInitialized = true;
}

// Subject accordion functionality (to collapse/expand entire subject sections)
let subjectAccordionInitialized = false;
let subjectAccordionDelegateHandler = null;
let subjectAccordionTouchHandler = null;

function initSubjectAccordion() {
  const highLevelClassesContainer = document.querySelector(".high-level-classes");
  
  if (!highLevelClassesContainer) {
    return;
  }
  
  if (subjectAccordionInitialized) {
    return;
  }
  
  // Remove old delegation handler if exists
  if (subjectAccordionDelegateHandler) {
    highLevelClassesContainer.removeEventListener("click", subjectAccordionDelegateHandler);
  }
  if (subjectAccordionTouchHandler) {
    highLevelClassesContainer.removeEventListener("touchend", subjectAccordionTouchHandler);
  }
  
  // Create new delegation handler
  subjectAccordionDelegateHandler = function(e) {
    // Ignore clicks on class items (handled by class accordion)
    const classItem = e.target.closest(".class-item");
    const classHeader = e.target.closest(".class-header");
    if (classItem || classHeader) return;
    
    // Check if click/touch is on a subject toggle button or any element inside it
    const subjectToggle = e.target.closest("[data-subject-toggle]");
    const subjectTitleBtn = e.target.closest(".subject-title-btn");
    
    if (!subjectToggle && !subjectTitleBtn) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Get the actual button element
    const targetButton = subjectToggle || subjectTitleBtn;
    const subjectSection = targetButton.closest(".class-subject-section");
    
    if (!subjectSection) return;
    
    const isActive = subjectSection.classList.contains("active");
    
    // Toggle active state
    if (isActive) {
      subjectSection.classList.remove("active");
    } else {
      subjectSection.classList.add("active");
    }
  };
  
  // Attach event listeners using delegation for both click and touch
  highLevelClassesContainer.addEventListener("click", subjectAccordionDelegateHandler, { passive: false });
  subjectAccordionTouchHandler = function(e) {
    subjectAccordionDelegateHandler(e);
    e.preventDefault();
  };
  highLevelClassesContainer.addEventListener("touchend", subjectAccordionTouchHandler, { passive: false });
  
  subjectAccordionInitialized = true;
}

// Initialize subject accordion on page load
document.addEventListener('DOMContentLoaded', function() {
  initSubjectAccordion();
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSubjectAccordion);
} else {
  initSubjectAccordion();
}

// Re-initialize subject accordion when navigating to resume page (integrated with existing navigation)
// This is handled in the switchToPage function below

// Initialize accordion on page load
function initializeAccordionOnLoad() {
  // Wait a bit to ensure all DOM is ready, especially if page loads on Resume section
  setTimeout(function() {
    initClassAccordion();
    initSubjectAccordion();
    // Also check if resume page is active on load and initialize
    const resumePage = document.querySelector('[data-page="resume"]');
    if (resumePage && resumePage.classList.contains('active')) {
      setTimeout(function() {
        initClassAccordion();
        initSubjectAccordion();
      }, 100);
    }
  }, 200);
}

document.addEventListener('DOMContentLoaded', initializeAccordionOnLoad);

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAccordionOnLoad);
} else {
  initializeAccordionOnLoad();
}

// Also initialize when window loads (as a fallback)
window.addEventListener('load', function() {
  setTimeout(function() {
    initClassAccordion();
    initSubjectAccordion();
  }, 100);
});
