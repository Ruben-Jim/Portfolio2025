// Admin page functionality
document.addEventListener('DOMContentLoaded', async function() {
    const blogForm = document.getElementById('blogForm');
    const postsList = document.getElementById('postsList');
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('.theme-icon');
    
    // Initialize theme
    initializeTheme();
    
    // Set today's date as default
    document.getElementById('publishDate').value = new Date().toISOString().split('T')[0];
    
    // Load existing posts
    await loadPosts();
    
    // Handle theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Handle form submission
    blogForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(blogForm);
        const postData = {
            title: formData.get('title'),
            content: formData.get('content'),
            category: formData.get('category'),
            bannerImage: formData.get('bannerImage'),
            publishDate: formData.get('publishDate'),
            author: formData.get('author'),
            isPublished: formData.get('isPublished') === 'on'
        };
        
        try {
            // Store in localStorage for now (will be replaced with Convex)
            const existingPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
            const newPost = {
                id: Date.now().toString(),
                ...postData,
                createdAt: new Date().toISOString()
            };
            existingPosts.unshift(newPost);
            localStorage.setItem('blogPosts', JSON.stringify(existingPosts));
            
            alert('Blog post created successfully!');
            blogForm.reset();
            document.getElementById('publishDate').value = new Date().toISOString().split('T')[0];
            
            // Reload posts
            await loadPosts();
            
            // Refresh the main page if it's open
            if (window.opener && window.opener.refreshBlogPosts) {
                window.opener.refreshBlogPosts();
            }
            
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Error creating blog post. Please try again.');
        }
    });
    
    // Load posts function
    async function loadPosts() {
        try {
            const posts = await convex.query(api.blogPosts.getAllPosts);
            
            if (posts.length === 0) {
                postsList.innerHTML = '<p>No blog posts yet. Create your first post above!</p>';
                return;
            }
            
            const postsHTML = posts.map(post => `
                <div class="post-item" data-post-id="${post.id}">
                    <div class="post-info">
                        <div class="post-title">${post.title}</div>
                        <div class="post-meta">
                            <span>${post.category}</span>
                            <span>•</span>
                            <span>${formatDate(post.publishDate)}</span>
                            <span>•</span>
                            <span class="status-badge ${post.isPublished ? 'status-published' : 'status-draft'}">
                                ${post.isPublished ? 'Published' : 'Draft'}
                            </span>
                        </div>
                    </div>
                    <div class="post-actions">
                        <button class="action-btn edit-btn" title="Edit" data-post-id="${post.id}">
                            <ion-icon name="create-outline"></ion-icon>
                        </button>
                        <button class="action-btn ${post.isPublished ? 'unpublish-btn' : 'publish-btn'}" 
                                title="${post.isPublished ? 'Unpublish' : 'Publish'}" 
                                data-post-id="${post.id}">
                            <ion-icon name="${post.isPublished ? 'eye-off-outline' : 'eye-outline'}"></ion-icon>
                        </button>
                        <button class="action-btn delete-btn" title="Delete" data-post-id="${post.id}">
                            <ion-icon name="trash-outline"></ion-icon>
                        </button>
                    </div>
                </div>
            `).join('');
            
            postsList.innerHTML = postsHTML;
            
        } catch (error) {
            console.error('Error loading posts:', error);
            postsList.innerHTML = '<p>Error loading posts. Please try again.</p>';
        }
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }
    
    // Handle post actions
    postsList.addEventListener('click', function(e) {
        const button = e.target.closest('.action-btn');
        if (!button) return;
        
        const postId = button.dataset.postId;
        const postItem = button.closest('.post-item');
        const postTitle = postItem.querySelector('.post-title').textContent;
        
        if (button.classList.contains('edit-btn')) {
            editPost(postId);
        } else if (button.classList.contains('delete-btn')) {
            if (confirm(`Are you sure you want to delete "${postTitle}"?`)) {
                deletePost(postId);
            }
        } else if (button.classList.contains('publish-btn') || button.classList.contains('unpublish-btn')) {
            togglePublishStatus(postId);
        }
    });
    
    async function editPost(postId) {
        const posts = await convex.query(api.blogPosts.getAllPosts);
        const post = posts.find(p => p.id === postId);
        
        if (post) {
            // Fill form with post data
            document.getElementById('title').value = post.title;
            document.getElementById('content').value = post.content;
            document.getElementById('category').value = post.category;
            document.getElementById('bannerImage').value = post.bannerImage;
            document.getElementById('publishDate').value = post.publishDate;
            document.getElementById('author').value = post.author;
            document.getElementById('isPublished').checked = post.isPublished;
            
            // Scroll to form
            document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
            
            // Store post ID for update
            blogForm.dataset.editingPostId = postId;
        }
    }
    
    async function deletePost(postId) {
        const posts = await convex.query(api.blogPosts.getAllPosts);
        const updatedPosts = posts.filter(p => p.id !== postId);
        convex.query.setItem('blogPosts', JSON.stringify(updatedPosts));
        loadPosts();
        
        // Refresh the main page if it's open
        if (window.opener && window.opener.refreshBlogPosts) {
            window.opener.refreshBlogPosts();
        }
    }
    
    async function togglePublishStatus(postId) {
        const posts = await convex.query(api.blogPosts.getAllPosts);
        const post = posts.find(p => p.id === postId);
        
        if (post) {
            post.isPublished = !post.isPublished;
            convex.query.setItem('blogPosts', JSON.stringify(posts));
            loadPosts();
            
            // Refresh the main page if it's open
            if (window.opener && window.opener.refreshBlogPosts) {
                window.opener.refreshBlogPosts();
            }
        }
    }
    
    // Handle form reset when editing
    blogForm.addEventListener('reset', function() {
        delete blogForm.dataset.editingPostId;
    });
    
    // Theme functions
    function initializeTheme() {
        const savedTheme = localStorage.getItem('adminTheme') || 'light';
        setTheme(savedTheme);
    }
    
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('adminTheme', newTheme);
    }
    
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update icon with smooth transition
        themeIcon.style.opacity = '0';
        themeIcon.style.transform = 'rotate(180deg) scale(0.8)';
        
        setTimeout(() => {
            themeIcon.setAttribute('name', theme === 'dark' ? 'sunny-outline' : 'moon-outline');
            themeIcon.style.opacity = '1';
            themeIcon.style.transform = 'rotate(0deg) scale(1)';
        }, 200);
        
        // Update button title
        themeToggle.setAttribute('title', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
        
        // Add a subtle animation to the entire admin container
        const adminContainer = document.querySelector('.admin-container');
        adminContainer.style.transform = 'scale(0.98)';
        setTimeout(() => {
            adminContainer.style.transform = 'scale(1)';
        }, 100);
    }
});
