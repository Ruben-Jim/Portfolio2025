# EmailJS Setup Guide - Free Email Service

## 🎉 **No Payment Required!**
EmailJS is completely **FREE** for up to 200 emails per month, which is perfect for a portfolio contact form.

## 🚀 **Step-by-Step Setup**

### Step 1: Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Click "Sign Up" and create a free account
3. Verify your email address

### Step 2: Create Email Service
1. In your EmailJS dashboard, go to **"Email Services"**
2. Click **"Add New Service"**
3. Choose your email provider:
   - **Gmail** (recommended for personal use)
   - **Outlook**
   - **Yahoo**
   - Or any other provider
4. Follow the setup instructions for your chosen provider
5. **Service ID**: Note down the service ID (e.g., `service_portfolio`)

### Step 3: Create Email Template
1. Go to **"Email Templates"** in your dashboard
2. Click **"Create New Template"**
3. **Template ID**: Name it `portfolio_template`
4. **Subject**: `New Contact Form Submission - Portfolio`
5. **Content**: Copy the HTML from `emailjs-template.html` and paste it
6. **To Email**: Set to your email address (`Ruben.Jim.co@gmail.com`)
7. **From Name**: `Portfolio Contact Form`
8. **Reply To**: `{{email}}` (so you can reply directly to the sender)

### Step 4: Get Your Public Key
1. Go to **"Account"** → **"General"**
2. Copy your **Public Key** (starts with something like `user_xxxxxxxxx`)

### Step 5: Update Your Configuration
1. Open `assets/js/config.js`
2. Replace the placeholder values:

```javascript
const EMAILJS_CONFIG = {
  serviceId: "service_portfolio", // Your actual service ID
  templateId: "portfolio_template", // Your actual template ID
  publicKey: "your_actual_public_key_here" // Your actual public key
};
```

### Step 6: Test Your Form
1. Open your portfolio website
2. Go to the Contact section
3. Fill out and submit the form
4. Check your email for the beautifully formatted message!

## 📧 **Email Template Features**

### ✅ **What You'll Receive:**
- **Professional Design**: Matches your portfolio's dark theme with yellow accents
- **Complete Information**: Name, email, message, timestamp, website URL
- **Technical Details**: User agent and other useful information
- **Direct Reply**: One-click reply button to respond to the sender
- **Mobile Responsive**: Looks great on all devices

### 🎨 **Template Customization:**
- **Colors**: Easily change the accent colors in the CSS
- **Layout**: Modify padding, margins, and spacing
- **Content**: Add or remove information fields
- **Styling**: Update fonts, borders, and effects

## 🔧 **Configuration Details**

### **Service Setup:**
- **Gmail**: Connect your Gmail account for sending emails
- **Outlook**: Use your Microsoft account
- **Custom SMTP**: Use any email provider with SMTP

### **Template Variables:**
The template uses these variables that are automatically filled:
- `{{fullname}}` - User's name
- `{{email}}` - User's email
- `{{message}}` - User's message
- `{{timestamp}}` - Submission time
- `{{website}}` - Your website URL
- `{{user_agent}}` - User's browser info
- `{{ip_address}}` - User's IP (if available)

## 📊 **Free Plan Limits**
- **200 emails per month** - More than enough for a portfolio
- **No credit card required**
- **No time limits**
- **Full functionality**

## 🚨 **Troubleshooting**

### **Form Not Sending:**
1. Check browser console for errors
2. Verify your EmailJS configuration
3. Ensure your service is properly connected
4. Check that your template is published

### **Emails Not Received:**
1. Check spam/junk folder
2. Verify your email address in the template
3. Check EmailJS dashboard for delivery status
4. Ensure your email service is properly configured

### **Template Not Working:**
1. Verify template ID matches configuration
2. Check that all variables are properly set
3. Ensure template is published (not draft)
4. Test with a simple template first

## 🎯 **Benefits Over Web3Forms**

### ✅ **Advantages:**
- **Completely Free** (200 emails/month)
- **No Payment Required**
- **Custom Templates** with full HTML/CSS control
- **Direct Integration** with your existing form
- **Professional Email Delivery**
- **Easy Setup** and configuration

### 📈 **Upgrade Options:**
If you ever need more than 200 emails/month:
- **Pro Plan**: $15/month for 1,000 emails
- **Business Plan**: $30/month for 10,000 emails
- But for a portfolio, the free plan is perfect!

## 🔒 **Security & Privacy**

### **Data Protection:**
- **No Data Storage**: EmailJS doesn't store your form data
- **Secure Delivery**: Emails sent through secure channels
- **Privacy Compliant**: GDPR and privacy-friendly
- **No Third-party Tracking**: Your data stays private

### **Spam Protection:**
- **Rate Limiting**: Prevents spam submissions
- **Email Validation**: Built-in email format checking
- **CAPTCHA Support**: Can be added if needed

## 🎨 **Customization Examples**

### **Change Colors:**
```css
/* Primary Accent Color */
--accent-color: #ffc107; /* Change to your preferred color */

/* Background Colors */
--bg-primary: #0a0a0a;
--bg-secondary: #1a1a1a;
```

### **Add More Fields:**
1. Add input fields to your HTML form
2. Add corresponding variables to the template
3. Update the JavaScript to include new data

### **Modify Layout:**
- Adjust padding and margins
- Change border radius for different corner styles
- Update font sizes and weights
- Modify spacing between elements

## 📞 **Support**

### **EmailJS Support:**
- **Documentation**: [EmailJS Docs](https://www.emailjs.com/docs/)
- **Community**: [EmailJS Community](https://community.emailjs.com/)
- **Support**: Available through their website

### **Your Setup:**
- All files are ready to use
- Just follow the setup steps above
- Test thoroughly before going live

---

**🎉 You're all set!** Your contact form will now send beautiful, professional emails directly to your inbox without any payment required. The emails will match your portfolio's theme perfectly and provide all the information you need to respond to inquiries.
