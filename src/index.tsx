import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

// Main landing page - EXACT layout as original, just no gradient
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Morning Star Christian Church</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background: #f5f5f5;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
            }
            
            /* Header */
            .header {
                background: white;
                padding: 20px 60px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .header-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                max-width: 1400px;
                margin: 0 auto;
            }
            
            .logo {
                display: flex;
                align-items: baseline;
                gap: 10px;
            }
            
            .logo h1 {
                font-size: 18px;
                font-weight: 400;
                color: #333;
                letter-spacing: 1px;
            }
            
            .logo span {
                font-size: 14px;
                color: #666;
            }
            
            nav {
                display: flex;
                gap: 40px;
                align-items: center;
            }
            
            nav a {
                text-decoration: none;
                color: #333;
                font-size: 14px;
                font-weight: 500;
                letter-spacing: 0.5px;
                transition: color 0.3s;
            }
            
            nav a:hover {
                color: #666;
            }
            
            nav a:last-child {
                background: #333;
                color: white;
                padding: 10px 20px;
                border-radius: 25px;
            }
            
            nav a:last-child:hover {
                background: #555;
            }
            
            /* Main Content */
            .main-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: flex-start;
                padding: 100px 60px;
                background: #f0f0f0;
                position: relative;
            }
            
            .content-wrapper {
                max-width: 1400px;
                margin: 0 auto;
                width: 100%;
            }
            
            .tagline {
                background: white;
                color: #333;
                display: inline-block;
                padding: 12px 25px;
                border-radius: 30px;
                font-size: 13px;
                font-weight: 600;
                letter-spacing: 1.5px;
                text-transform: uppercase;
                margin-bottom: 40px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            h2.main-heading {
                font-size: 72px;
                color: #2c3e50;
                font-weight: 300;
                margin-bottom: 30px;
                line-height: 1.1;
            }
            
            .description {
                font-size: 18px;
                color: #666;
                line-height: 1.8;
                max-width: 600px;
                margin-bottom: 50px;
                font-weight: 300;
            }
            
            .buttons {
                display: flex;
                gap: 20px;
            }
            
            .btn {
                padding: 15px 35px;
                border-radius: 30px;
                text-decoration: none;
                font-size: 14px;
                font-weight: 600;
                letter-spacing: 0.5px;
                transition: all 0.3s;
                cursor: pointer;
                border: none;
                text-transform: uppercase;
            }
            
            .btn-primary {
                background: #f4e4c1;
                color: #333;
            }
            
            .btn-primary:hover {
                background: #e8d4a8;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            
            .btn-secondary {
                background: #e0e0e0;
                color: #333;
            }
            
            .btn-secondary:hover {
                background: #d0d0d0;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .header {
                    padding: 20px 30px;
                }
                
                nav {
                    display: none;
                }
                
                .main-content {
                    padding: 60px 30px;
                }
                
                h2.main-heading {
                    font-size: 48px;
                }
                
                .description {
                    font-size: 16px;
                }
                
                .buttons {
                    flex-direction: column;
                    width: 100%;
                    max-width: 300px;
                }
                
                .btn {
                    width: 100%;
                    text-align: center;
                }
            }
        </style>
    </head>
    <body>
        <header class="header">
            <div class="header-content">
                <div class="logo">
                    <h1>MORNING STAR</h1>
                    <span>CHRISTIAN CHURCH</span>
                </div>
                <nav>
                    <a href="/">HOME</a>
                    <a href="/schedule">SCHEDULE</a>
                    <a href="/outreach">OUTREACH</a>
                    <a href="/watch">WATCH</a>
                    <a href="/form">SUBMIT THE FORM</a>
                </nav>
            </div>
        </header>
        
        <main class="main-content">
            <div class="content-wrapper">
                <span class="tagline">A CHURCH ANCHORED IN HOPE</span>
                
                <h2 class="main-heading">Mending the Broken.</h2>
                
                <p class="description">
                    Join us every Sunday as we gather to hear meaningful teaching, 
                    join in passionate worship, and connect with a community focused on 
                    restoring hope and purpose.
                </p>
                
                <div class="buttons">
                    <a href="/form" class="btn btn-primary">SUBMIT THE FORM</a>
                    <a href="/watch" class="btn btn-secondary">WATCH LIVE STREAM</a>
                </div>
            </div>
        </main>
    </body>
    </html>
  `)
})

// Simple placeholder pages for other routes
app.get('/schedule', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Schedule - Morning Star Christian Church</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background: #f5f5f5;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
            }
            
            .header {
                background: white;
                padding: 20px 60px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .header-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                max-width: 1400px;
                margin: 0 auto;
            }
            
            .logo {
                display: flex;
                align-items: baseline;
                gap: 10px;
            }
            
            .logo h1 {
                font-size: 18px;
                font-weight: 400;
                color: #333;
                letter-spacing: 1px;
            }
            
            .logo span {
                font-size: 14px;
                color: #666;
            }
            
            nav {
                display: flex;
                gap: 40px;
                align-items: center;
            }
            
            nav a {
                text-decoration: none;
                color: #333;
                font-size: 14px;
                font-weight: 500;
                letter-spacing: 0.5px;
                transition: color 0.3s;
            }
            
            nav a:hover {
                color: #666;
            }
            
            nav a:last-child {
                background: #333;
                color: white;
                padding: 10px 20px;
                border-radius: 25px;
            }
            
            .content {
                padding: 80px 60px;
                max-width: 1400px;
                margin: 0 auto;
            }
            
            h2 {
                font-size: 48px;
                color: #2c3e50;
                font-weight: 300;
                margin-bottom: 40px;
            }
            
            .schedule-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 30px;
                margin-top: 40px;
            }
            
            .schedule-item {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .schedule-item h3 {
                color: #333;
                margin-bottom: 15px;
                font-size: 24px;
                font-weight: 400;
            }
            
            .schedule-item p {
                color: #666;
                line-height: 1.6;
                font-size: 16px;
            }
        </style>
    </head>
    <body>
        <header class="header">
            <div class="header-content">
                <div class="logo">
                    <h1>MORNING STAR</h1>
                    <span>CHRISTIAN CHURCH</span>
                </div>
                <nav>
                    <a href="/">HOME</a>
                    <a href="/schedule">SCHEDULE</a>
                    <a href="/outreach">OUTREACH</a>
                    <a href="/watch">WATCH</a>
                    <a href="/form">SUBMIT THE FORM</a>
                </nav>
            </div>
        </header>
        
        <div class="content">
            <h2>Service Schedule</h2>
            
            <div class="schedule-grid">
                <div class="schedule-item">
                    <h3>Sunday Service</h3>
                    <p>9:00 AM - Sunday School<br>
                    10:30 AM - Morning Worship<br>
                    6:00 PM - Evening Service</p>
                </div>
                
                <div class="schedule-item">
                    <h3>Wednesday</h3>
                    <p>7:00 PM - Bible Study & Prayer Meeting</p>
                </div>
                
                <div class="schedule-item">
                    <h3>Special Events</h3>
                    <p>First Saturday of each month - Community Outreach<br>
                    Last Friday of each month - Youth Night</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `)
})

app.get('/outreach', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Outreach - Morning Star Christian Church</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background: #f5f5f5;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
            }
            
            .header {
                background: white;
                padding: 20px 60px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .header-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                max-width: 1400px;
                margin: 0 auto;
            }
            
            .logo {
                display: flex;
                align-items: baseline;
                gap: 10px;
            }
            
            .logo h1 {
                font-size: 18px;
                font-weight: 400;
                color: #333;
                letter-spacing: 1px;
            }
            
            .logo span {
                font-size: 14px;
                color: #666;
            }
            
            nav {
                display: flex;
                gap: 40px;
                align-items: center;
            }
            
            nav a {
                text-decoration: none;
                color: #333;
                font-size: 14px;
                font-weight: 500;
                letter-spacing: 0.5px;
                transition: color 0.3s;
            }
            
            nav a:hover {
                color: #666;
            }
            
            nav a:last-child {
                background: #333;
                color: white;
                padding: 10px 20px;
                border-radius: 25px;
            }
            
            .content {
                padding: 80px 60px;
                max-width: 1400px;
                margin: 0 auto;
            }
            
            h2 {
                font-size: 48px;
                color: #2c3e50;
                font-weight: 300;
                margin-bottom: 40px;
            }
            
            p {
                font-size: 18px;
                color: #666;
                line-height: 1.8;
                max-width: 800px;
                margin-bottom: 30px;
            }
        </style>
    </head>
    <body>
        <header class="header">
            <div class="header-content">
                <div class="logo">
                    <h1>MORNING STAR</h1>
                    <span>CHRISTIAN CHURCH</span>
                </div>
                <nav>
                    <a href="/">HOME</a>
                    <a href="/schedule">SCHEDULE</a>
                    <a href="/outreach">OUTREACH</a>
                    <a href="/watch">WATCH</a>
                    <a href="/form">SUBMIT THE FORM</a>
                </nav>
            </div>
        </header>
        
        <div class="content">
            <h2>Community Outreach</h2>
            <p>
                At Morning Star Christian Church, we believe in serving our community with love and compassion. 
                Our outreach programs focus on meeting practical needs while sharing hope and encouragement.
            </p>
            <p>
                Join us as we make a difference through food banks, homeless ministry, youth programs, 
                and various community service initiatives. Together, we can restore hope and transform lives.
            </p>
        </div>
    </body>
    </html>
  `)
})

app.get('/watch', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Watch - Morning Star Christian Church</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background: #f5f5f5;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
            }
            
            .header {
                background: white;
                padding: 20px 60px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .header-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                max-width: 1400px;
                margin: 0 auto;
            }
            
            .logo {
                display: flex;
                align-items: baseline;
                gap: 10px;
            }
            
            .logo h1 {
                font-size: 18px;
                font-weight: 400;
                color: #333;
                letter-spacing: 1px;
            }
            
            .logo span {
                font-size: 14px;
                color: #666;
            }
            
            nav {
                display: flex;
                gap: 40px;
                align-items: center;
            }
            
            nav a {
                text-decoration: none;
                color: #333;
                font-size: 14px;
                font-weight: 500;
                letter-spacing: 0.5px;
                transition: color 0.3s;
            }
            
            nav a:hover {
                color: #666;
            }
            
            nav a:last-child {
                background: #333;
                color: white;
                padding: 10px 20px;
                border-radius: 25px;
            }
            
            .content {
                padding: 80px 60px;
                max-width: 1400px;
                margin: 0 auto;
            }
            
            h2 {
                font-size: 48px;
                color: #2c3e50;
                font-weight: 300;
                margin-bottom: 40px;
            }
            
            .video-container {
                background: white;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                text-align: center;
            }
            
            .video-placeholder {
                background: #333;
                color: white;
                padding: 100px 40px;
                border-radius: 10px;
                margin-bottom: 30px;
            }
            
            p {
                font-size: 18px;
                color: #666;
                line-height: 1.8;
            }
        </style>
    </head>
    <body>
        <header class="header">
            <div class="header-content">
                <div class="logo">
                    <h1>MORNING STAR</h1>
                    <span>CHRISTIAN CHURCH</span>
                </div>
                <nav>
                    <a href="/">HOME</a>
                    <a href="/schedule">SCHEDULE</a>
                    <a href="/outreach">OUTREACH</a>
                    <a href="/watch">WATCH</a>
                    <a href="/form">SUBMIT THE FORM</a>
                </nav>
            </div>
        </header>
        
        <div class="content">
            <h2>Watch Live Stream</h2>
            <div class="video-container">
                <div class="video-placeholder">
                    <h3>Live Stream</h3>
                    <p>Sunday Service - 10:30 AM</p>
                </div>
                <p>Join us online every Sunday for worship, teaching, and community.</p>
            </div>
        </div>
    </body>
    </html>
  `)
})

app.get('/form', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contact - Morning Star Christian Church</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                background: #f5f5f5;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
            }
            
            .header {
                background: white;
                padding: 20px 60px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .header-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                max-width: 1400px;
                margin: 0 auto;
            }
            
            .logo {
                display: flex;
                align-items: baseline;
                gap: 10px;
            }
            
            .logo h1 {
                font-size: 18px;
                font-weight: 400;
                color: #333;
                letter-spacing: 1px;
            }
            
            .logo span {
                font-size: 14px;
                color: #666;
            }
            
            nav {
                display: flex;
                gap: 40px;
                align-items: center;
            }
            
            nav a {
                text-decoration: none;
                color: #333;
                font-size: 14px;
                font-weight: 500;
                letter-spacing: 0.5px;
                transition: color 0.3s;
            }
            
            nav a:hover {
                color: #666;
            }
            
            nav a:last-child {
                background: #333;
                color: white;
                padding: 10px 20px;
                border-radius: 25px;
            }
            
            .content {
                padding: 80px 60px;
                max-width: 1400px;
                margin: 0 auto;
                width: 100%;
            }
            
            h2 {
                font-size: 48px;
                color: #2c3e50;
                font-weight: 300;
                margin-bottom: 40px;
            }
            
            .form-container {
                background: white;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                max-width: 600px;
            }
            
            .form-group {
                margin-bottom: 25px;
            }
            
            label {
                display: block;
                color: #333;
                font-size: 14px;
                font-weight: 500;
                margin-bottom: 8px;
                letter-spacing: 0.5px;
            }
            
            input, textarea, select {
                width: 100%;
                padding: 12px;
                border: 1px solid #ddd;
                border-radius: 5px;
                font-size: 16px;
                font-family: inherit;
                background: #fafafa;
                transition: all 0.3s;
            }
            
            input:focus, textarea:focus, select:focus {
                outline: none;
                border-color: #999;
                background: white;
            }
            
            textarea {
                min-height: 120px;
                resize: vertical;
            }
            
            .submit-btn {
                background: #f4e4c1;
                color: #333;
                padding: 15px 35px;
                border-radius: 30px;
                border: none;
                font-size: 14px;
                font-weight: 600;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                cursor: pointer;
                transition: all 0.3s;
                width: 100%;
            }
            
            .submit-btn:hover {
                background: #e8d4a8;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
        </style>
    </head>
    <body>
        <header class="header">
            <div class="header-content">
                <div class="logo">
                    <h1>MORNING STAR</h1>
                    <span>CHRISTIAN CHURCH</span>
                </div>
                <nav>
                    <a href="/">HOME</a>
                    <a href="/schedule">SCHEDULE</a>
                    <a href="/outreach">OUTREACH</a>
                    <a href="/watch">WATCH</a>
                    <a href="/form">SUBMIT THE FORM</a>
                </nav>
            </div>
        </header>
        
        <div class="content">
            <h2>Contact Us</h2>
            <div class="form-container">
                <form>
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input type="text" id="name" name="name" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="phone">Phone</label>
                        <input type="tel" id="phone" name="phone">
                    </div>
                    
                    <div class="form-group">
                        <label for="subject">Subject</label>
                        <select id="subject" name="subject" required>
                            <option value="">Select a subject</option>
                            <option value="general">General Inquiry</option>
                            <option value="prayer">Prayer Request</option>
                            <option value="volunteer">Volunteer</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="message">Message</label>
                        <textarea id="message" name="message" required></textarea>
                    </div>
                    
                    <button type="submit" class="submit-btn">Submit Form</button>
                </form>
            </div>
        </div>
    </body>
    </html>
  `)
})

export default app