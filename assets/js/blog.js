// Blog posts functionality
document.addEventListener('DOMContentLoaded', async function() {
    const blogPostsList = document.getElementById('blogPostsList');
    
    // Load blog posts when the page loads
    await loadBlogPosts();
    
    async function loadBlogPosts() {
        try {
            // Load posts from localStorage (will be replaced with Convex)
            const storedPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
            
            // Filter only published posts
            const publishedPosts = storedPosts.filter(post => post.isPublished);
            
            // If no posts in localStorage, show sample posts
            if (publishedPosts.length === 0) {
                const samplePosts = [
                    {
                        title: "Design conferences in 2022",
                        content: "Veritatis et quasi architecto beatae vitae dicta sunt, explicabo.",
                        category: "Design",
                        bannerImage: "./assets/images/blog-1.jpg",
                        publishDate: "2022-02-23",
                        author: "Ruben Jimenez"
                    },
                    {
                        title: "Best fonts every designer",
                        content: "Sed ut perspiciatis, nam libero tempore, cum soluta nobis est eligendi.",
                        category: "Design",
                        bannerImage: "./assets/images/blog-2.jpg",
                        publishDate: "2022-02-23",
                        author: "Ruben Jimenez"
                    },
                    {
                        title: "Design digest #80",
                        content: "Excepteur sint occaecat cupidatat no proident, quis nostrum exercitationem ullam corporis suscipit.",
                        category: "Design",
                        bannerImage: "./assets/images/blog-3.jpg",
                        publishDate: "2022-02-23",
                        author: "Ruben Jimenez"
                    },
                    {
                        title: "UI interactions of the week",
                        content: "Enim ad minim veniam, consectetur adipiscing elit, quis nostrud exercitation ullamco laboris nisi.",
                        category: "Design",
                        bannerImage: "./assets/images/blog-4.jpg",
                        publishDate: "2022-02-23",
                        author: "Ruben Jimenez"
                    },
                    {
                        title: "The forgotten art of spacing",
                        content: "Maxime placeat, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                        category: "Design",
                        bannerImage: "./assets/images/blog-5.jpg",
                        publishDate: "2022-02-23",
                        author: "Ruben Jimenez"
                    },
                    {
                        title: "Design digest #79",
                        content: "Optio cumque nihil impedit uo minus quod maxime placeat, velit esse cillum.",
                        category: "Design",
                        bannerImage: "./assets/images/blog-6.jpg",
                        publishDate: "2022-02-23",
                        author: "Ruben Jimenez"
                    }
                ];
                
                // Render sample posts
                renderBlogPosts(samplePosts);
            } else {
                // Render stored posts
                renderBlogPosts(publishedPosts);
            }
            
        } catch (error) {
            console.error('Error loading blog posts:', error);
            blogPostsList.innerHTML = '<li class="blog-post-item"><p>Error loading blog posts. Please try again later.</p></li>';
        }
    }
    
    function renderBlogPosts(posts) {
        if (!posts || posts.length === 0) {
            blogPostsList.innerHTML = '<li class="blog-post-item"><p>No blog posts available yet.</p></li>';
            return;
        }
        
        const postsHTML = posts.map(post => `
            <li class="blog-post-item">
                <a href="#" onclick="openBlogPost('${post.title}')">
                    <figure class="blog-banner-box">
                        <img src="${post.bannerImage}" alt="${post.title}" loading="lazy">
                    </figure>
                    <div class="blog-content">
                        <div class="blog-meta">
                            <p class="blog-category">${post.category}</p>
                            <span class="dot"></span>
                            <time datetime="${post.publishDate}">${formatDate(post.publishDate)}</time>
                        </div>
                        <h3 class="h3 blog-item-title">${post.title}</h3>
                        <p class="blog-text">${post.content}</p>
                    </div>
                </a>
            </li>
        `).join('');
        
        blogPostsList.innerHTML = postsHTML;
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }
    
    // Function to open blog post (placeholder for now)
    window.openBlogPost = function(title) {
        alert(`Opening blog post: "${title}"\n\nThis functionality will be implemented to show the full blog post content.`);
    };
    
    // Function to refresh blog posts (can be called from admin page)
    window.refreshBlogPosts = async function() {
        await loadBlogPosts();
    };
});
