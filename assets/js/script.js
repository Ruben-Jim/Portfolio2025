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
  // Re-render blog posts to show/hide edit/delete buttons
  if (typeof renderBlogPosts === 'function') {
    renderBlogPosts();
  }
  // Also update admin dashboard if user is admin
  if (currentUser && currentUser.role === 'admin') {
    renderAdminBlogPosts();
}
}

// Blog management moved to admin tab only - authentication required for editing

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

// Function to render blog posts in admin dashboard
function renderAdminBlogPosts() {
  const adminBlogPostsList = document.getElementById('admin-blog-posts-list');
  if (!adminBlogPostsList) return;

  adminBlogPostsList.innerHTML = '';

  if (blogPosts.length === 0) {
    adminBlogPostsList.innerHTML = `
      <div class="empty-item">
        <p>No blog posts found. Create your first post!</p>
      </div>
    `;
    return;
  }

  console.log('Rendering blog posts in admin dashboard:', blogPosts);

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
        <div class="blog-post-actions">
          <button class="blog-action-btn edit-btn" data-edit-blog="${post.id}" title="Edit Post">
            <ion-icon name="create-outline"></ion-icon>
          </button>
          <button class="blog-action-btn delete-btn" data-delete-blog="${post.id}" title="Delete Post">
            <ion-icon name="trash-outline"></ion-icon>
          </button>
        </div>
    `;
    adminBlogPostsList.appendChild(blogItem);
  });

  // Re-attach event listeners
  attachBlogEventListeners();

  // Attach edit/delete button listeners (always shown in admin dashboard when logged in)
  attachEditDeleteListeners();
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

// Function to open add blog modal for admin dashboard
function openAddBlogModal() {
  if (addBlogModal) {
    addBlogModal.classList.add('active');

    // Clear form for new post
    addBlogForm.reset();

    // Set today's date as default
    const dateInput = document.getElementById('blog-date');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.value = today;
    }

    // Focus on title input
    const titleInput = document.getElementById('blog-title');
    if (titleInput) {
      setTimeout(() => titleInput.focus(), 100);
    }

    // Update character/word counts
    setTimeout(() => {
      if (typeof updateCounts === 'function') updateCounts();
    }, 100);
  }
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
const forms = document.querySelectorAll("[data-form]");

// Initialize all forms
forms.forEach((form, index) => {
  const formInputs = form.querySelectorAll("[data-form-input]");
  const formBtn = form.querySelector("[data-form-btn]");
  const formMessage = form.closest('article').querySelector('[id*="form-message"]') || document.getElementById("form-message");
  const formError = form.closest('article').querySelector('[id*="form-error"]') || document.getElementById("form-error");

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
  
  // Store form elements for later use
  form._formBtn = formBtn;
  form._formMessage = formMessage;
  form._formError = formError;
});

// Initialize EmailJS when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  if (window.EMAILJS_CONFIG && window.EMAILJS_CONFIG.publicKey) {
    emailjs.init(window.EMAILJS_CONFIG.publicKey);
  }
});

// Enhanced form submission with EmailJS for all forms
forms.forEach((form) => {
form.addEventListener("submit", async function(e) {
  e.preventDefault();
    
    const formBtn = form._formBtn;
    const formMessage = form._formMessage;
    const formError = form._formError;
    const isHireMeForm = form.closest('[data-page="hire-me"]') !== null;
  
  // Hide any existing messages
    if (formMessage) formMessage.style.display = 'none';
    if (formError) formError.style.display = 'none';
  
  // Show loading state
    showFormLoading(formBtn, isHireMeForm);
  
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
      const projectType = formData.get('project-type') || 'Not specified';
      const budget = formData.get('budget') || 'Not specified';
    
    // Validate required fields
    if (!fullname || !email || !message) {
      throw new Error('Please fill in all required fields');
    }
    
    // Create email template parameters
    const templateParams = {
      fullname: fullname,
      email: email,
        message: isHireMeForm 
          ? `Project Type: ${projectType}\nBudget: ${budget}\n\nMessage:\n${message}`
          : message,
      timestamp: new Date().toISOString(),
      website: window.location.href,
      user_agent: navigator.userAgent,
        ip_address: 'N/A',
        to_email: 'Ruben.Jim.co@gmail.com',
        subject: isHireMeForm 
          ? 'New Hire Me Inquiry - Portfolio'
          : 'New Contact Form Submission - Portfolio'
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
      // Save to Firestore after successful email send
      try {
        await saveMessageToFirestore({
          name: fullname,
          email: email,
          message: isHireMeForm
            ? `Project Type: ${projectType}\nBudget: ${budget}\n\nMessage:\n${message}`
            : message,
          subject: isHireMeForm
            ? 'New Hire Me Inquiry - Portfolio'
            : 'New Contact Form Submission - Portfolio',
          timestamp: window.serverTimestamp(),
          status: 'new',
          source: isHireMeForm ? 'hire-me' : 'contact'
        });
        console.log('Message saved to Firestore');
      } catch (firestoreError) {
        console.error('Firestore save error:', firestoreError);
        // Don't fail the form submission if Firestore fails, just log it
      }

      showFormSuccess(formMessage, formError);
      form.reset();
      formBtn.setAttribute("disabled", "");
    } else {
      throw new Error('Email sending failed');
    }
    
  } catch (error) {
    console.error('Form submission error:', error);
      showFormError(formMessage, formError);
  } finally {
      hideFormLoading(formBtn, isHireMeForm);
  }
  });
});

function showFormLoading(formBtn, isHireMeForm = false) {
  formBtn.classList.add('loading');
  formBtn.innerHTML = '<ion-icon name="hourglass"></ion-icon><span class="form-btn-text">Sending...</span>';
  formBtn.disabled = true;
}

function hideFormLoading(formBtn, isHireMeForm = false) {
  formBtn.classList.remove('loading');
  const buttonText = isHireMeForm ? 'Send Inquiry' : 'Send Message';
  formBtn.innerHTML = '<ion-icon name="paper-plane"></ion-icon><span class="form-btn-text">' + buttonText + '</span>';
  formBtn.disabled = false;
}

function showFormSuccess(formMessage, formError) {
  if (formMessage) formMessage.style.display = 'block';
  if (formError) formError.style.display = 'none';
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    hideFormMessages(formMessage, formError);
  }, 5000);
}

function showFormError(formMessage, formError) {
  if (formError) formError.style.display = 'block';
  if (formMessage) formMessage.style.display = 'none';
  
  // Auto-hide after 7 seconds
  setTimeout(() => {
    hideFormMessages(formMessage, formError);
  }, 7000);
}

function hideFormMessages(formMessage, formError) {
  if (formMessage) formMessage.style.display = 'none';
  if (formError) formError.style.display = 'none';
}

// Save message to Firestore
async function saveMessageToFirestore(messageData) {
  try {
    // Access the global db instance from the admin module
    if (!window.db) {
      console.warn('Firestore not initialized, but message will still be sent via EmailJS');
      return;
    }

    const messagesRef = window.collection(window.db, 'messages');
    const docRef = await window.addDoc(messagesRef, messageData);
    console.log('Message saved to Firestore successfully with ID:', docRef.id);
    return docRef;
  } catch (error) {
    console.error('Error saving message to Firestore:', error);
    // Don't throw error - we still want the email to be sent even if Firestore fails
    return null;
  }
}

// Prefill contact form with service details
function prefillContactForm(serviceType, message) {
  // Wait for contact page to be active
  setTimeout(() => {
    const contactForm = document.querySelector('[data-page="contact"] [data-form]');
    if (contactForm) {
      const messageField = contactForm.querySelector('textarea[name="message"]');
      if (messageField) {
        const prefilledMessage = `Service: ${serviceType}\n\n${message}\n\nPlease provide more details about your project:`;
        messageField.value = prefilledMessage;
        messageField.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Track in Google Analytics if available
        if (typeof gtag !== 'undefined') {
          gtag('event', 'service_inquiry', {
            'service_type': serviceType,
            'event_category': 'engagement',
            'event_label': 'Service & Pricing Page'
          });
        }
      }
    }
  }, 300);
}

// Track events for Google Analytics
function trackEvent(eventName, eventLabel, eventValue) {
  if (typeof gtag !== 'undefined') {
    gtag('event', eventName, {
      'event_category': 'engagement',
      'event_label': eventLabel,
      'value': eventValue
    });
  }
  
  // Also track project views
  if (eventName === 'project_view') {
    console.log('Project viewed:', eventLabel);
  }
}

// Track project clicks
document.addEventListener('DOMContentLoaded', function() {
  const projectLinks = document.querySelectorAll('.project-link');
  projectLinks.forEach(link => {
    link.addEventListener('click', function() {
      const projectTitle = this.closest('.project-card')?.querySelector('.project-title')?.textContent || 'Unknown Project';
      trackEvent('project_click', projectTitle, 'Portfolio');
    });
  });
});



// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// Function to switch to a specific page
function switchToPage(pageName, skipSave = false) {
  // First, remove active class from all pages and navigation links
  for (let i = 0; i < pages.length; i++) {
    pages[i].classList.remove("active");
  }
  for (let i = 0; i < navigationLinks.length; i++) {
    navigationLinks[i].classList.remove("active");
  }
  
  // Find and activate the matching page
  for (let i = 0; i < pages.length; i++) {
    if (pageName === pages[i].dataset.page) {
      pages[i].classList.add("active");
      window.scrollTo(0, 0);
      
      // Find the matching navigation link by comparing text content
      for (let j = 0; j < navigationLinks.length; j++) {
        const navText = navigationLinks[j].textContent.trim();
        // Match by converting both to lowercase and handling special cases
        let navPageName = navText.toLowerCase().trim();
        if (navPageName === "services & pricing" || (navPageName.includes("services") && navPageName.includes("pricing"))) {
          navPageName = "services-pricing";
        }
        if (navPageName === "hire me") {
          navPageName = "hire-me";
        }
        if (navPageName === pageName) {
          navigationLinks[j].classList.add("active");
          break;
        }
      }
      
      // Save to localStorage (unless skipSave is true)
      if (!skipSave) {
        localStorage.setItem('activePage', pageName);
      }

      // Update URL hash for deep linking support
      if (!skipSave) {
        window.location.hash = pageName;
      }
      
      // Re-initialize accordions if resume page is shown
      if (pages[i].dataset.page === "resume") {
        accordionInitialized = false; // Reset flag to allow re-initialization
        setTimeout(function() {
          initClassAccordion();
          initSubjectAccordion();
        }, 150); // Small delay to ensure DOM is ready
      }

      // Handle admin page authentication
      if (pages[i].dataset.page === "admin") {
        setTimeout(function() {
          if (currentUser && currentUser.role === 'admin') {
            if (typeof window.showDashboard === 'function') window.showDashboard();
            if (typeof window.fetchMessages === 'function') window.fetchMessages();
            if (typeof renderAdminBlogPosts === 'function') renderAdminBlogPosts();
          } else {
            if (typeof window.showLogin === 'function') window.showLogin();
          }
        }, 100); // Small delay to ensure DOM is ready
      }
      return; // Exit early when page is found
    }
  }
}

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {
    let pageName = this.textContent.trim().toLowerCase();
    // Handle special cases for page names
    if (pageName === "services & pricing" || (pageName.includes("services") && pageName.includes("pricing"))) {
      pageName = "services-pricing";
    } else if (pageName === "hire me") {
      pageName = "hire-me";
    }
    switchToPage(pageName);
  });
}

// Handle URL hash changes for deep linking support
window.addEventListener("hashchange", function() {
  const hash = window.location.hash.substring(1); // Remove the '#'
  if (hash && hash !== '') {
    switchToPage(hash, true); // Skip saving to avoid infinite loop
  }
});

// Restore active page from URL hash or localStorage on page load with loading animation
function restoreActivePage() {
  const loadingScreen = document.getElementById('loading-screen');
  const hashPage = window.location.hash.substring(1); // Remove the '#'
  const savedPage = localStorage.getItem('activePage');
  
  // Always show About page first (don't save to localStorage during initial load)
  switchToPage('about', true);
  
  // Prioritize URL hash over localStorage
  const targetPage = (hashPage && hashPage !== '') ? hashPage : savedPage;

  if (targetPage && targetPage !== 'about') {
    // Wait 700ms (less than a second) then switch to target page and hide loading
    setTimeout(function() {
      switchToPage(targetPage);
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
    // If no target page or target page is "about", just hide loading after delay
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

// Firebase initialization and Admin functionality
(function() {
  'use strict';

  // Firebase variables
  let auth = null;
  let db = null;
  let currentUser = null;

  // DOM elements
  const adminLoginModal = document.getElementById('admin-login-modal');
  const adminLoginOverlay = document.getElementById('admin-login-overlay');
  const adminLoginCloseBtn = document.getElementById('admin-login-close-btn');
  const adminCancelLoginBtn = document.getElementById('admin-cancel-login-btn');
  const adminDashboardContent = document.getElementById('admin-dashboard-content');
  const adminLoginBtn = document.getElementById('admin-login-btn');
  const adminLogoutBtn = document.getElementById('admin-logout-btn');
  const adminLoginForm = document.getElementById('admin-login-form');
  const adminLoginError = document.getElementById('admin-login-error');
  const messagesList = document.getElementById('messages-list');

  // Stats elements
  const totalMessagesEl = document.getElementById('total-messages');
  const newMessagesEl = document.getElementById('new-messages');
  const repliedMessagesEl = document.getElementById('replied-messages');

  // Initialize Firebase
  function initializeFirebase() {
    try {
      const firebaseConfig = window.FIREBASE_CONFIG;
      if (!firebaseConfig) {
        console.error('Firebase config not found');
        return false;
      }

      // Initialize Firebase
      const app = window.initializeApp(firebaseConfig);
      auth = window.getAuth(app);
      db = window.getFirestore(app);

      console.log('Firebase initialized successfully');
      console.log('Note: Make sure firestore.rules is deployed to Firebase Console for proper permissions');

      // Test Firestore connectivity
      testFirestoreConnection();

      return true;
    } catch (error) {
      console.error('Firebase initialization error:', error);
      return false;
    }
  }

  // Debug: Log window resolution for testing responsive issues
  function logWindowResolution() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    console.log(`🖥️ Window Resolution: ${width}px x ${height}px`);
    
    // Log which grid layout should be active
    if (width >= 1250) {
      console.log('📊 Grid Layout: 3 columns (large desktop)');
    } else if (width >= 768) {
      console.log('📊 Grid Layout: 2 columns (tablet/medium)');
    } else {
      console.log('📊 Grid Layout: 1 column (mobile)');
    }
  }

  // Log on load and resize
  window.addEventListener('load', logWindowResolution);
  window.addEventListener('resize', logWindowResolution);

  // Initialize Firebase when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    // Check if running locally (file:// protocol) which can cause CORS issues
    if (window.location.protocol === 'file:') {
      console.warn('Running locally with file:// protocol. Firestore may not work properly. Deploy to a web server for full functionality.');
    }

    if (initializeFirebase()) {
      setupAuthListeners();
      setupAdminEventListeners();
    } else {
      console.error('Firebase initialization failed');
    }
    
    // Initial resolution log
    logWindowResolution();
  });

  // Test Firestore connectivity
  function testFirestoreConnection() {
    if (!db) return;

    try {
      // Try to get a reference to test connectivity
      const testRef = window.collection(db, 'messages');
      console.log('Firestore connection test: collection reference created');
    } catch (error) {
      console.error('Firestore connection test failed:', error);
    }
  }

  // Setup authentication state listener (using simple credential check)
  function setupAuthListeners() {
    // Check if admin is already logged in on page load
    if (currentUser && currentUser.role === 'admin') {
      showDashboard();
      fetchMessages();
      renderAdminBlogPosts();
    } else {
      showLogin();
    }
  }

  // Setup admin event listeners
  function setupAdminEventListeners() {
    // Login button click
    if (adminLoginBtn) {
      adminLoginBtn.addEventListener('click', function() {
        if (adminLoginModal) {
          adminLoginModal.classList.add('active');
          adminLoginModal.style.display = 'flex';
        }
      });
    }

    if (adminLoginForm) {
      adminLoginForm.addEventListener('submit', handleAdminLogin);
    }

    if (adminLogoutBtn) {
      adminLogoutBtn.addEventListener('click', handleLogout);
    }

    // Modal controls
    if (adminLoginCloseBtn) {
      adminLoginCloseBtn.addEventListener('click', closeAdminLoginModal);
    }

    if (adminCancelLoginBtn) {
      adminCancelLoginBtn.addEventListener('click', closeAdminLoginModal);
    }

    if (adminLoginOverlay) {
      adminLoginOverlay.addEventListener('click', closeAdminLoginModal);
    }

    // Admin blog management
    const adminAddBlogBtn = document.getElementById('admin-add-blog-btn');
    if (adminAddBlogBtn) {
      adminAddBlogBtn.addEventListener('click', function() {
        openAddBlogModal();
      });
    }

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', handleFilterClick);
    });

    // Refresh button
    const refreshBtn = document.getElementById('refresh-messages');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        console.log('Manual refresh triggered');
        fetchMessages();
      });
    }

    // Test Firestore button
    const testBtn = document.getElementById('test-firestore');
    if (testBtn) {
      testBtn.addEventListener('click', async () => {
        testFirestoreConnection();
      });
    }

    // Reply modal
    const replyModal = document.getElementById('reply-modal');
    const replyModalOverlay = document.getElementById('reply-modal-overlay');
    const replyModalClose = document.getElementById('reply-modal-close');
    const cancelReplyBtn = document.getElementById('cancel-reply');
    const replyForm = document.getElementById('reply-form');

    if (replyModalClose) {
      replyModalClose.addEventListener('click', hideReplyModal);
    }

    if (cancelReplyBtn) {
      cancelReplyBtn.addEventListener('click', hideReplyModal);
    }

    if (replyModalOverlay) {
      replyModalOverlay.addEventListener('click', hideReplyModal);
    }

    if (replyForm) {
      replyForm.addEventListener('submit', handleReplySubmit);
    }
  }

  // Show login modal
  function showLogin() {
    if (adminLoginModal) {
      adminLoginModal.classList.add('active');
      adminLoginModal.style.display = 'flex';
    }
    if (adminDashboardContent) adminDashboardContent.style.display = 'none';
    // Show login button, hide logout button
    if (adminLoginBtn) adminLoginBtn.style.display = 'inline-flex';
    if (adminLogoutBtn) adminLogoutBtn.style.display = 'none';
  }

  // Show dashboard
  function showDashboard() {
    if (adminLoginModal) {
      adminLoginModal.classList.remove('active');
      adminLoginModal.style.display = 'none'; // Completely hide login modal
    }
    if (adminDashboardContent) adminDashboardContent.style.display = 'block';
    // Hide login button, show logout button
    if (adminLoginBtn) adminLoginBtn.style.display = 'none';
    if (adminLogoutBtn) adminLogoutBtn.style.display = 'inline-flex';
  }

  // Close login modal
  function closeAdminLoginModal() {
    if (adminLoginModal) adminLoginModal.classList.remove('active');
    if (adminLoginForm) adminLoginForm.reset();
    if (adminLoginError) adminLoginError.style.display = 'none';
  }

  // Handle admin login (using same credentials as blog admin)
  async function handleAdminLogin(e) {
    e.preventDefault();

    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;

    // Use same credentials as blog admin login
    if (username === 'admin' && password === 'admin123') {
      // Set current user for admin session
      currentUser = { username: 'admin', role: 'admin' };
      showDashboard();
      fetchMessages(); // Fetch messages when admin logs in
      renderAdminBlogPosts(); // Render blog posts in admin dashboard
      showAdminLoginError(''); // Clear any previous errors

      // Also update the global blog auth state for consistency
      updateAuthUI();
    } else {
      showAdminLoginError('Invalid username or password');
    }
  }

  // Handle logout
  async function handleLogout() {
    try {
      // Clear admin session
      currentUser = null;

      // Also update the global blog auth state for consistency
      updateAuthUI();

      // Show login form and hide dashboard
      showLogin();

      console.log('Admin logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Show login error
  function showAdminLoginError(message) {
    if (adminLoginError) {
      adminLoginError.textContent = message;
      adminLoginError.style.display = message ? 'block' : 'none';
    }
  }

  // Handle filter button clicks
  function handleFilterClick(e) {
    const filter = e.target.dataset.filter;

    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    e.target.classList.add('active');

    // Filter messages
    filterMessages(filter);
  }

  // Filter messages based on status
  function filterMessages(filter) {
    const messageItems = document.querySelectorAll('.message-item');

    messageItems.forEach(item => {
      const status = item.dataset.status;

      switch (filter) {
        case 'all':
          item.style.display = 'list-item';
          break;
        case 'new':
          item.style.display = status === 'new' ? 'list-item' : 'none';
          break;
        case 'replied':
          item.style.display = status === 'replied' ? 'list-item' : 'none';
          break;
      }
    });
  }

  // Fetch messages from Firestore
  function fetchMessages() {
    console.log('fetchMessages called, db available:', !!db);
    if (!db) {
      console.warn('Firestore not initialized, cannot fetch messages');
      if (messagesList) {
        messagesList.innerHTML = `
          <div class="no-messages">
            <ion-icon name="alert-circle-outline"></ion-icon>
            <p>Database not initialized. Check Firebase configuration.</p>
          </div>
        `;
      }
      return;
    }

    try {
      console.log('Setting up Firestore listener...');
      const messagesRef = window.collection(db, 'messages');
      const q = window.query(messagesRef, window.orderBy('timestamp', 'desc'));

      window.onSnapshot(q, (snapshot) => {
        console.log('Firestore snapshot received, docs count:', snapshot.size);
        const messages = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          console.log('Message doc:', doc.id, data);
          messages.push({ id: doc.id, ...data });
        });

        console.log('Total messages processed:', messages.length);
        renderMessages(messages);
        updateStats(messages);
      }, (error) => {
        console.error('Error fetching messages:', error);
        // Show error in UI
        if (messagesList) {
          messagesList.innerHTML = `
            <div class="no-messages">
              <ion-icon name="alert-circle-outline"></ion-icon>
              <p>Error loading messages: ${error.message}</p>
              <p>Make sure firestore.rules is deployed to Firebase.</p>
            </div>
          `;
        }
      });
    } catch (error) {
      console.error('Error setting up message listener:', error);
      if (messagesList) {
        messagesList.innerHTML = `
          <div class="no-messages">
            <ion-icon name="alert-circle-outline"></ion-icon>
            <p>Error: ${error.message}</p>
          </div>
        `;
      }
    }
  }

  // Render messages in the dashboard
  function renderMessages(messages) {
    if (!messagesList) return;

    if (messages.length === 0) {
      messagesList.innerHTML = `
        <div class="no-messages">
          <ion-icon name="mail-outline"></ion-icon>
          <p>No messages yet</p>
        </div>
      `;
      return;
    }

    messagesList.innerHTML = `<ul class="message-grid">${messages.map(message => `
      <li class="message-item" data-status="${message.status || 'new'}" data-id="${message.id}">
        <div class="message-card">
        <div class="message-card-icon">
          <ion-icon name="${message.status === 'replied' ? 'checkmark-done-outline' : 'mail-unread-outline'}"></ion-icon>
        </div>
        <div class="message-card-content">
          <div class="message-card-header">
            <h4 class="message-card-name">${message.name || 'Anonymous'}</h4>
            <span class="status-badge status-${message.status || 'new'}">${message.status || 'new'}</span>
          </div>
          <p class="message-card-email">${message.email || ''}</p>
          <p class="message-card-subject">${message.subject || 'No subject'}</p>
            <div class="message-card-text">${(message.message || '').replace(/\n/g, '<br>')}</div>
            <div class="message-card-footer">
          <p class="message-card-date">${formatDate(message.timestamp)}</p>
          ${message.source ? `<p class="message-card-source">Source: ${message.source}</p>` : ''}
            </div>
          <div class="message-card-actions">
            <button class="reply-btn" data-id="${message.id}" title="Reply to this message">
              <ion-icon name="return-up-forward-outline"></ion-icon>
              <span>Reply</span>
            </button>
            ${message.status !== 'replied' ? `<button class="mark-replied-btn" data-id="${message.id}" title="Mark as replied">
              <ion-icon name="checkmark-outline"></ion-icon>
              <span>Mark Replied</span>
            </button>` : ''}
            </div>
          </div>
        </div>
      </li>
    `).join('')}</ul>`;

    // Add event listeners to buttons
    document.querySelectorAll('.reply-btn').forEach(btn => {
      btn.addEventListener('click', handleReplyClick);
    });

    document.querySelectorAll('.mark-replied-btn').forEach(btn => {
      btn.addEventListener('click', handleMarkRepliedClick);
    });
  }

  // Update dashboard stats
  function updateStats(messages) {
    const total = messages.length;
    const newCount = messages.filter(m => (m.status || 'new') === 'new').length;
    const repliedCount = messages.filter(m => m.status === 'replied').length;

    if (totalMessagesEl) totalMessagesEl.textContent = total;
    if (newMessagesEl) newMessagesEl.textContent = newCount;
    if (repliedMessagesEl) repliedMessagesEl.textContent = repliedCount;
  }

  // Format timestamp for display
  function formatDate(timestamp) {
    if (!timestamp) return 'Unknown date';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Handle reply button click
  function handleReplyClick(e) {
    const messageId = e.target.closest('.reply-btn').dataset.id;
    const messageCard = e.target.closest('.message-card');
    const messageData = {
      name: messageCard.querySelector('.message-card-name').textContent,
      email: messageCard.querySelector('.message-card-email').textContent,
      subject: messageCard.querySelector('.message-card-subject').textContent,
      message: messageCard.querySelector('.message-card-text').textContent,
      id: messageId
    };

    showReplyModal(messageData);
  }

  // Handle mark as replied button click
  async function handleMarkRepliedClick(e) {
    const messageId = e.target.dataset.id;

    try {
      const messageRef = window.doc(db, 'messages', messageId);
      await window.updateDoc(messageRef, {
        status: 'replied'
      });
    } catch (error) {
      console.error('Error marking message as replied:', error);
    }
  }

  // Show reply modal
  function showReplyModal(messageData) {
    const replyModal = document.getElementById('reply-modal');
    const replyFrom = document.getElementById('reply-from');
    const replySubject = document.getElementById('reply-subject');
    const replyMessage = document.getElementById('reply-message');
    const replySubjectInput = document.getElementById('reply-subject-input');
    const replyMessageInput = document.getElementById('reply-message-input');
    const replyForm = document.getElementById('reply-form');

    if (replyModal && replyFrom && replySubject && replyMessage && replySubjectInput && replyMessageInput) {
      // Populate original message data
      replyFrom.textContent = `${messageData.name} (${messageData.email})`;
      replySubject.textContent = messageData.subject;
      replyMessage.innerHTML = (messageData.message || '').replace(/\n/g, '<br>');

      // Set default reply subject
      replySubjectInput.value = `Re: ${messageData.subject}`;

      // Clear reply message
      replyMessageInput.value = '';

      // Store message data for reply
      replyForm._messageData = messageData;

      // Show modal using consistent class toggle
      replyModal.classList.add('active');

      // Focus on reply message
      setTimeout(() => replyMessageInput.focus(), 100);
    }
  }

  // Hide reply modal
  function hideReplyModal() {
    const replyModal = document.getElementById('reply-modal');
    if (replyModal) {
      replyModal.classList.remove('active');
    }
  }

  // Handle reply form submission
  async function handleReplySubmit(e) {
    e.preventDefault();

    const replyForm = e.target;
    const messageData = replyForm._messageData;
    const replySubject = document.getElementById('reply-subject-input').value;
    const replyMessage = document.getElementById('reply-message-input').value;

    if (!messageData || !replySubject || !replyMessage) {
      alert('Please fill in all fields');
      return;
    }

    try {
      // Send reply email via EmailJS
      await sendReplyEmail(messageData, replySubject, replyMessage);

      // Update message status in Firestore
      await updateMessageStatus(messageData.id, 'replied');

      // Hide modal
      hideReplyModal();

      // Show success message
      alert('Reply sent successfully!');

    } catch (error) {
      console.error('Reply error:', error);
      alert('Failed to send reply. Please try again.');
    }
  }

  // Send reply email via EmailJS
  async function sendReplyEmail(messageData, subject, message) {
    if (typeof emailjs === 'undefined') {
      throw new Error('EmailJS not loaded');
    }

    const templateParams = {
      to_email: messageData.email,
      to_name: messageData.name,
      from_name: 'Ruben Jimenez',
      subject: subject,
      message: message,
      original_subject: messageData.subject,
      original_message: messageData.message,
      timestamp: new Date().toISOString()
    };

    // Try to use a reply template first, fallback to contact template
    let templateId = 'reply_template';
    let response;

    try {
      response = await emailjs.send(
      window.EMAILJS_CONFIG.serviceId,
        templateId,
      templateParams
    );
    } catch (error) {
      // If reply template doesn't exist, try the contact template
      console.warn('Reply template not found, trying contact template:', error);
      templateId = window.EMAILJS_CONFIG.templateId;
      response = await emailjs.send(
        window.EMAILJS_CONFIG.serviceId,
        templateId,
        templateParams
      );
    }

    if (response.status !== 200) {
      throw new Error('Email sending failed');
    }

    return response;
  }

  // Update message status in Firestore
  async function updateMessageStatus(messageId, status) {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const messageRef = window.doc(db, 'messages', messageId);
    await window.updateDoc(messageRef, {
      status: status,
      repliedAt: window.serverTimestamp()
    });
  }

  // Expose admin functions to global scope for switchToPage
  window.showLogin = showLogin;
  window.showDashboard = showDashboard;
  window.fetchMessages = fetchMessages;

})();

