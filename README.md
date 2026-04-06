# 🏥 Pharmacy Portal PWA

A Progressive Web App for pharmacy owners to manage their pharmacies, view statements, browse products, and track orders.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Modern browser with PWA support

### Installation

```bash
# Clone the repository
git clone [your-repo-url]
cd pharmacy-pwa

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your API URL
VITE_API_BASE_URL=http://10.10.20.80:3001/api
VITE_APP_URL=http://10.10.20.80:9002

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
pharmacy-pwa/
├── public/
│   ├── manifest.json                          ✅ Application Structure ✓
│   ├── offline.html                           ✅ Application Structure ✓
│   ├── sw.js                                  ✅ Application Structure ✓
│   └── icons/ (create these)
├── src/
│   ├── api/
│   │   └── client.js                          ✅ API & Services ✓
│   ├── components/
│   │   ├── common/
│   │   │   ├── LoadingScreen.jsx              ✅ Common Components ✓
│   │   │   ├── ErrorBoundary.jsx              ✅ Common Components ✓
│   │   │   └── OfflineIndicator.jsx           ✅ Common Components ✓
│   │   ├── layout/
│   │   │   ├── MainLayout.jsx                 ✅ Common Components ✓
│   │   │   ├── Sidebar.jsx                    ✅ Common Components ✓
│   │   │   └── Header.jsx                     ✅ Common Components ✓
│   │   └── pharmacy/
│   │       └── PharmacySelector.jsx           ✅ Common Components ✓
│   ├── i18n/
│   │   └── config.js                          ✅ API & Services ✓
│   ├── locales/
│   │   ├── ar.json                            ✅ Translations ✓
│   │   └── en.json                            ✅ Translations ✓
│   ├── pages/
│   │   ├── Login.jsx                          ✅ All Page Components ✓
│   │   ├── Register.jsx                       ✅ All Page Components ✓
│   │   ├── Dashboard.jsx                      ✅ All Page Components ✓
│   │   ├── Products.jsx                       ✅ All Page Components ✓
│   │   ├── Orders.jsx                         ✅ All Page Components ✓
│   │   ├── Statement.jsx                      ✅ All Page Components ✓
│   │   └── Profile.jsx                        ✅ All Page Components ✓
│   ├── services/
│   │   └── webauthn.js                        ✅ API & Services ✓
│   ├── store/
│   │   └── authStore.js                       ✅ API & Services ✓
│   ├── styles/
│   │   └── index.css                          ✅ Styles ✓
│   ├── App.jsx                                ✅ Application Structure ✓
│   └── main.jsx                               ✅ Application Structure ✓
├── .env                                       ✅ Core Configuration ✓
├── .gitignore                                 ✅ Core Configuration ✓
├── Dockerfile                                 ✅ Core Configuration ✓
├── docker-compose.yml                         ✅ Core Configuration ✓
├── index.html                                 ✅ Application Structure ✓
├── nginx.conf                                 ✅ Core Configuration ✓
├── package.json                               ✅ Core Configuration ✓
├── tailwind.config.js                         ✅ Core Configuration ✓
└── vite.config.js                             ✅ Core Configuration ✓
```

## 🛠️ Tech Stack

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with RTL support
- **State Management**: Zustand
- **API Client**: Axios with React Query
- **Routing**: React Router v6
- **i18n**: react-i18next
- **Forms**: React Hook Form
- **Biometric Auth**: @simplewebauthn/browser
- **PWA**: Workbox
- **Offline Storage**: IndexedDB with idb
- **Notifications**: React Hot Toast

## 📱 Features

### Core Features
- ✅ JWT Authentication with refresh token
- ✅ Biometric/WebAuthn login (Face ID, Touch ID)
- ✅ Multiple pharmacy management
- ✅ Product catalog with search and filters
- ✅ Order history and tracking
- ✅ Pharmacy statement with transactions
- ✅ User profile management

### PWA Features
- ✅ Installable on mobile and desktop
- ✅ Offline functionality
- ✅ Push notifications
- ✅ Background sync
- ✅ App-like experience

### UI/UX Features
- ✅ Bilingual support (Arabic/English)
- ✅ RTL/LTR layout switching
- ✅ Dark/Light theme
- ✅ Responsive design
- ✅ Loading states and error handling
- ✅ Toast notifications

## 🔐 Authentication Flow

1. **Traditional Login**:
   - Email + Password → JWT token
   - Optional "Remember Me" for 30-day session

2. **Biometric Login**:
   - First login with email/password
   - Register biometric device
   - Subsequent logins with biometric only

## 🏥 Pharmacy Selection Flow

1. User logs in
2. App fetches available pharmacies
3. If no pharmacies: Show "Contact Administration" message
4. If one pharmacy: Auto-select
5. If multiple: User selects from list
6. Selected pharmacy stored in API session

## 🌐 Environment Variables

```env
# API Configuration
VITE_API_BASE_URL=http://10.10.20.80:3001/api
VITE_APP_URL=http://10.10.20.80:9002

# WebAuthn Configuration
VITE_WEBAUTHN_RP_NAME=Pharmacy Portal
VITE_WEBAUTHN_RP_ID=10.10.20.80

# Features
VITE_ENABLE_BIOMETRIC=true
VITE_ENABLE_PUSH_NOTIFICATIONS=true
VITE_ENABLE_OFFLINE=true

# Default Settings
VITE_DEFAULT_LANGUAGE=ar
VITE_DEFAULT_THEME=light
```

## 📦 Build & Deployment

### Development
```bash
npm run dev           # Start dev server on port 5173
npm run dev:host     # Expose to network for mobile testing
```

### Production Build
```bash
npm run build        # Create production build
npm run preview      # Test production build locally
```

### Docker Deployment
```bash
docker build -t pharmacy-pwa .
docker run -p 9002:80 pharmacy-pwa
```

### Nginx Configuration
```nginx
server {
    listen 9002;
    server_name 10.10.20.80;
    root /var/www/pharmacy-pwa/dist;
    
    # PWA headers
    add_header Service-Worker-Allowed /;
    
    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🧪 Testing

```bash
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
npm run lint         # Lint code
```

## 📱 Mobile App Generation

### iOS (using Capacitor)
```bash
npm install @capacitor/core @capacitor/ios
npx cap init
npx cap add ios
npx cap sync
npx cap open ios
```

### Android (using TWA)
```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://your-domain/manifest.json
bubblewrap build
```

## 🔍 Performance Metrics

Target metrics:
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Score: > 90
- Bundle Size: < 200KB (gzipped)

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure API allows your frontend origin
   - Check API_BASE_URL in .env

2. **Biometric Not Working**
   - Requires HTTPS in production
   - Check browser compatibility
   - Verify WebAuthn RP settings

3. **Offline Not Working**
   - Clear browser cache
   - Check service worker registration
   - Verify IndexedDB storage

4. **RTL Layout Issues**
   - Ensure `dir="rtl"` on html element
   - Check Tailwind RTL utilities
   - Verify font supports Arabic

## 📚 API Documentation

Full API documentation available at: `/api/docs`

Key endpoints:
- Auth: `/api/auth/*`
- Pharmacies: `/api/pharmacies/*`
- Products: `/api/products/*`
- Orders: `/api/pharmacy/orders/*`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is proprietary and confidential.

## 🚨 Important Notes

1. **Authentication Required**: All app features require login
2. **Pharmacy Selection**: Users must select a pharmacy before accessing features
3. **Biometric Registration**: Requires initial password login
4. **Token Expiry**: 24h default, 30d with "Remember Me"
5. **Rate Limiting**: API has rate limits (see documentation)
6. **Offline Sync**: Changes sync when connection restored

## 📞 Support

For issues or questions:
- Technical Support: [support@pharmacy.com]
- API Issues: Check `/api/status`
- Documentation: See `/docs` folder

## 🎯 Roadmap

- [ ] Advanced analytics dashboard
- [ ] Barcode scanning
- [ ] Voice search
- [ ] Multi-language expansion
- [ ] Payment integration
- [ ] Inventory management
- [ ] Prescription uploads
- [ ] Chat support

---

Built with ❤️ for Pharmacy Owners



Development vs Production:
Development (Current - npm run dev)
- Runs on Vite dev server (http://localhost:5173)
- Hot Module Replacement (HMR) - instant updates
- React Query DevTools visible
- Source maps for debugging
- Connects to backend API at: http://10.10.20.80:3001/api
Production (After npm run build)
- Creates static files in /dist folder:
  ├── index.html
  ├── assets/
  │   ├── index-[hash].js
  │   ├── index-[hash].css
  │   └── [images, fonts, etc.]
  └── manifest.json (PWA)

- No dev server needed
- No DevTools
- Minified/optimized code
- Ready to deploy to any web server
How to Build for Production:
Read C:\Users\Office-PC\Downloads\Claude-pharmacy-pwa\package.json (lines 7-13)
# Build for production
npm run build

# Preview production build locally (optional)
npm run preview
Deployment Options:
1. Static Hosting (Recommended for PWA)
Netlify - Deploy /dist folder
Vercel - Auto-deploy from Git
GitHub Pages - Free static hosting
Firebase Hosting - Good for PWAs
Cloudflare Pages - Fast CDN
2. Traditional Web Server
Nginx - Serve /dist folder
Apache - Traditional hosting
IIS - Windows server
3. Backend Integration
Serve from NestJS backend's public folder
Single deployment with frontend + backend
Important: API URL Configuration
Check your .env.example:
Read C:\Users\Office-PC\Downloads\Claude-pharmacy-pwa\.env.example
Important! You need to create a .env file for production:
# Create .env file (copy from .env.example)
cp .env.example .env
Then update VITE_API_BASE_URL to your production backend:
# Development
VITE_API_BASE_URL=http://10.10.20.80:3001/api

# Production (change this)
VITE_API_BASE_URL=https://api.yourdomain.com/api
Summary:
✅ This is a frontend-only Progressive Web App (PWA)
Built with React + Vite
Connects to separate NestJS backend API
After build → Pure static files (HTML/CSS/JS)
Can be hosted anywhere that serves static files
Backend API must be accessible from the deployed frontend URL
Next Steps:
Finish development & testing
Configure production API URL in .env
Run npm run build
Deploy /dist folder to your hosting service
Ensure backend API accepts requests from frontend domain (CORS)
The app is fully self-contained - no server-side rendering needed! 🚀