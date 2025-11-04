import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))
app.use('/favicon.ico', serveStatic({ root: './public' }))

// API Routes
app.get('/api/schedule', (c) => {
  return c.json({
    services: [
      { day: 'Sunday', time: '9:00 AM', type: 'Sunday School' },
      { day: 'Sunday', time: '10:30 AM', type: 'Morning Worship' },
      { day: 'Wednesday', time: '7:00 PM', type: 'Bible Study' }
    ]
  })
})

app.post('/api/form', async (c) => {
  const body = await c.req.json()
  // In production, this would send an email or save to database
  console.log('Form submission:', body)
  return c.json({ success: true, message: 'Thank you for your submission!' })
})

// HTML Pages
const layout = (title: string, content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Morning Star Christian Church</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        /* Custom styles for clean design */
        .hero-section {
            background: linear-gradient(180deg, #ffffff 0%, #f3f4f6 100%);
        }
        .btn-primary {
            background: #1e40af;
            transition: all 0.3s ease;
        }
        .btn-primary:hover {
            background: #1e3a8a;
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(30, 64, 175, 0.2);
        }
        .btn-secondary {
            background: #64748b;
            transition: all 0.3s ease;
        }
        .btn-secondary:hover {
            background: #475569;
            transform: translateY(-2px);
        }
        .nav-link {
            position: relative;
            transition: color 0.3s ease;
        }
        .nav-link::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            right: 0;
            height: 2px;
            background: #1e40af;
            transform: scaleX(0);
            transition: transform 0.3s ease;
        }
        .nav-link:hover::after,
        .nav-link.active::after {
            transform: scaleX(1);
        }
    </style>
</head>
<body class="bg-white">
    <!-- Navigation -->
    <nav class="bg-white shadow-md sticky top-0 z-50">
        <div class="container mx-auto px-6 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                    <i class="fas fa-cross text-blue-800 text-2xl"></i>
                    <div>
                        <h1 class="text-xl font-bold text-gray-800">MORNING STAR</h1>
                        <p class="text-xs text-gray-600">CHRISTIAN CHURCH</p>
                    </div>
                </div>
                <div class="hidden md:flex items-center space-x-8">
                    <a href="/" class="nav-link text-gray-700 hover:text-blue-800 font-medium">HOME</a>
                    <a href="/schedule" class="nav-link text-gray-700 hover:text-blue-800 font-medium">SCHEDULE</a>
                    <a href="/outreach" class="nav-link text-gray-700 hover:text-blue-800 font-medium">OUTREACH</a>
                    <a href="/watch" class="nav-link text-gray-700 hover:text-blue-800 font-medium">WATCH</a>
                    <a href="/form" class="btn-primary text-white px-6 py-2 rounded-full font-medium">SUBMIT THE FORM</a>
                </div>
                <button id="mobile-menu-btn" class="md:hidden text-gray-700">
                    <i class="fas fa-bars text-2xl"></i>
                </button>
            </div>
        </div>
        <!-- Mobile Menu -->
        <div id="mobile-menu" class="hidden md:hidden bg-white border-t">
            <div class="px-6 py-4 space-y-3">
                <a href="/" class="block text-gray-700 hover:text-blue-800 font-medium py-2">HOME</a>
                <a href="/schedule" class="block text-gray-700 hover:text-blue-800 font-medium py-2">SCHEDULE</a>
                <a href="/outreach" class="block text-gray-700 hover:text-blue-800 font-medium py-2">OUTREACH</a>
                <a href="/watch" class="block text-gray-700 hover:text-blue-800 font-medium py-2">WATCH</a>
                <a href="/form" class="block text-center btn-primary text-white px-6 py-2 rounded-full font-medium">SUBMIT THE FORM</a>
            </div>
        </div>
    </nav>

    ${content}

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12 mt-20">
        <div class="container mx-auto px-6">
            <div class="grid md:grid-cols-3 gap-8">
                <div>
                    <h3 class="text-xl font-bold mb-4">Morning Star Christian Church</h3>
                    <p class="text-gray-400">A church anchored in hope, mending the broken, and building community.</p>
                </div>
                <div>
                    <h4 class="text-lg font-semibold mb-4">Quick Links</h4>
                    <ul class="space-y-2 text-gray-400">
                        <li><a href="/schedule" class="hover:text-white transition">Service Times</a></li>
                        <li><a href="/outreach" class="hover:text-white transition">Community Outreach</a></li>
                        <li><a href="/watch" class="hover:text-white transition">Live Stream</a></li>
                        <li><a href="/form" class="hover:text-white transition">Contact Us</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="text-lg font-semibold mb-4">Connect With Us</h4>
                    <div class="flex space-x-4">
                        <a href="#" class="text-gray-400 hover:text-white transition">
                            <i class="fab fa-facebook-f text-xl"></i>
                        </a>
                        <a href="#" class="text-gray-400 hover:text-white transition">
                            <i class="fab fa-youtube text-xl"></i>
                        </a>
                        <a href="#" class="text-gray-400 hover:text-white transition">
                            <i class="fab fa-instagram text-xl"></i>
                        </a>
                    </div>
                </div>
            </div>
            <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                <p>&copy; 2024 Morning Star Christian Church. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script>
        // Mobile menu toggle
        document.getElementById('mobile-menu-btn')?.addEventListener('click', function() {
            document.getElementById('mobile-menu').classList.toggle('hidden');
        });

        // Set active nav link
        const currentPath = window.location.pathname;
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });
    </script>
</body>
</html>
`

// Home page
app.get('/', (c) => {
  const content = `
    <!-- Hero Section -->
    <section class="hero-section relative min-h-screen flex items-center">
        <div class="container mx-auto px-6 py-20">
            <div class="max-w-4xl mx-auto text-center">
                <span class="inline-block bg-blue-100 text-blue-800 px-6 py-2 rounded-full text-sm font-semibold mb-8">
                    A CHURCH ANCHORED IN HOPE
                </span>
                <h1 class="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
                    Mending the Broken.
                </h1>
                <p class="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                    Join us every Sunday as we gather to hear meaningful teaching, 
                    join in passionate worship, and connect with a community 
                    focused on restoring hope and purpose.
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="/form" class="btn-primary text-white px-8 py-4 rounded-full text-lg font-semibold inline-flex items-center justify-center">
                        <i class="fas fa-envelope mr-2"></i>
                        SUBMIT THE FORM
                    </a>
                    <a href="/watch" class="btn-secondary text-white px-8 py-4 rounded-full text-lg font-semibold inline-flex items-center justify-center">
                        <i class="fas fa-play-circle mr-2"></i>
                        WATCH LIVE STREAM
                    </a>
                </div>
            </div>
        </div>
        <div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
            <i class="fas fa-chevron-down text-2xl text-gray-400"></i>
        </div>
    </section>

    <!-- Welcome Section -->
    <section class="py-20 bg-white">
        <div class="container mx-auto px-6">
            <div class="grid md:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 class="text-4xl font-bold text-gray-900 mb-6">Welcome Home</h2>
                    <p class="text-lg text-gray-600 mb-6">
                        At Morning Star Christian Church, we believe everyone deserves a place 
                        where they belong. Whether you're exploring faith for the first time or 
                        looking for a church family, you'll find warm hearts and open arms here.
                    </p>
                    <p class="text-lg text-gray-600 mb-8">
                        Our mission is simple: to love God, love people, and make a difference 
                        in our community. Join us as we journey together in faith, hope, and love.
                    </p>
                    <a href="/schedule" class="text-blue-800 font-semibold text-lg hover:underline">
                        View Service Times <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>
                <div class="bg-gray-100 rounded-2xl p-12 text-center">
                    <i class="fas fa-church text-8xl text-blue-800 mb-6"></i>
                    <p class="text-xl font-semibold text-gray-800">Join us this Sunday!</p>
                    <p class="text-gray-600 mt-2">10:30 AM - Morning Worship</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-gray-50">
        <div class="container mx-auto px-6">
            <h2 class="text-4xl font-bold text-center text-gray-900 mb-12">What We Offer</h2>
            <div class="grid md:grid-cols-3 gap-8">
                <div class="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
                    <i class="fas fa-book-bible text-4xl text-blue-800 mb-4"></i>
                    <h3 class="text-xl font-bold text-gray-900 mb-3">Biblical Teaching</h3>
                    <p class="text-gray-600">
                        Dive deep into God's Word with practical, relevant messages that 
                        inspire and challenge you to grow in your faith.
                    </p>
                </div>
                <div class="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
                    <i class="fas fa-hands-praying text-4xl text-blue-800 mb-4"></i>
                    <h3 class="text-xl font-bold text-gray-900 mb-3">Passionate Worship</h3>
                    <p class="text-gray-600">
                        Experience powerful worship that connects your heart to God through 
                        contemporary and traditional music.
                    </p>
                </div>
                <div class="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition">
                    <i class="fas fa-people-group text-4xl text-blue-800 mb-4"></i>
                    <h3 class="text-xl font-bold text-gray-900 mb-3">Community</h3>
                    <p class="text-gray-600">
                        Build lasting relationships in a caring community where everyone 
                        is valued, loved, and supported.
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-blue-800 text-white">
        <div class="container mx-auto px-6 text-center">
            <h2 class="text-4xl font-bold mb-6">Ready to Take the Next Step?</h2>
            <p class="text-xl mb-10 max-w-2xl mx-auto">
                We'd love to connect with you and help you on your spiritual journey. 
                Fill out our form to get connected.
            </p>
            <a href="/form" class="bg-white text-blue-800 px-8 py-4 rounded-full text-lg font-semibold inline-flex items-center hover:bg-gray-100 transition">
                Get Connected <i class="fas fa-arrow-right ml-2"></i>
            </a>
        </div>
    </section>
  `
  return c.html(layout('Home', content))
})

// Schedule page
app.get('/schedule', (c) => {
  const content = `
    <section class="py-20">
        <div class="container mx-auto px-6">
            <h1 class="text-4xl font-bold text-center text-gray-900 mb-12">Service Schedule</h1>
            
            <div class="max-w-4xl mx-auto">
                <div class="grid md:grid-cols-2 gap-8">
                    <!-- Sunday Services -->
                    <div class="bg-white rounded-xl shadow-lg p-8">
                        <div class="flex items-center mb-6">
                            <i class="fas fa-sun text-3xl text-yellow-500 mr-4"></i>
                            <h2 class="text-2xl font-bold text-gray-900">Sunday Services</h2>
                        </div>
                        <div class="space-y-4">
                            <div class="border-l-4 border-blue-800 pl-4">
                                <p class="font-semibold text-gray-900">9:00 AM - Sunday School</p>
                                <p class="text-gray-600">Bible study for all ages</p>
                            </div>
                            <div class="border-l-4 border-blue-800 pl-4">
                                <p class="font-semibold text-gray-900">10:30 AM - Morning Worship</p>
                                <p class="text-gray-600">Main worship service with sermon</p>
                            </div>
                            <div class="border-l-4 border-blue-800 pl-4">
                                <p class="font-semibold text-gray-900">6:00 PM - Evening Service</p>
                                <p class="text-gray-600">Prayer and praise</p>
                            </div>
                        </div>
                    </div>

                    <!-- Weekday Services -->
                    <div class="bg-white rounded-xl shadow-lg p-8">
                        <div class="flex items-center mb-6">
                            <i class="fas fa-calendar-days text-3xl text-blue-800 mr-4"></i>
                            <h2 class="text-2xl font-bold text-gray-900">Weekday Activities</h2>
                        </div>
                        <div class="space-y-4">
                            <div class="border-l-4 border-green-600 pl-4">
                                <p class="font-semibold text-gray-900">Wednesday 7:00 PM</p>
                                <p class="text-gray-600">Bible Study & Prayer Meeting</p>
                            </div>
                            <div class="border-l-4 border-green-600 pl-4">
                                <p class="font-semibold text-gray-900">Thursday 6:30 PM</p>
                                <p class="text-gray-600">Youth Group</p>
                            </div>
                            <div class="border-l-4 border-green-600 pl-4">
                                <p class="font-semibold text-gray-900">Saturday 9:00 AM</p>
                                <p class="text-gray-600">Men's/Women's Ministry</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Special Events -->
                <div class="mt-12 bg-blue-50 rounded-xl p-8">
                    <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">Upcoming Events</h3>
                    <div class="grid md:grid-cols-3 gap-6">
                        <div class="bg-white rounded-lg p-4 text-center">
                            <i class="fas fa-heart text-2xl text-red-500 mb-2"></i>
                            <p class="font-semibold">Community Outreach</p>
                            <p class="text-sm text-gray-600">First Saturday Monthly</p>
                        </div>
                        <div class="bg-white rounded-lg p-4 text-center">
                            <i class="fas fa-music text-2xl text-purple-500 mb-2"></i>
                            <p class="font-semibold">Worship Night</p>
                            <p class="text-sm text-gray-600">Last Friday Monthly</p>
                        </div>
                        <div class="bg-white rounded-lg p-4 text-center">
                            <i class="fas fa-child text-2xl text-green-500 mb-2"></i>
                            <p class="font-semibold">Kids Church</p>
                            <p class="text-sm text-gray-600">Every Sunday 10:30 AM</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  `
  return c.html(layout('Schedule', content))
})

// Outreach page
app.get('/outreach', (c) => {
  const content = `
    <section class="py-20">
        <div class="container mx-auto px-6">
            <h1 class="text-4xl font-bold text-center text-gray-900 mb-6">Community Outreach</h1>
            <p class="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto">
                We believe in making a difference in our community through love, service, and compassion.
            </p>

            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div class="bg-blue-800 p-6">
                        <i class="fas fa-bowl-food text-4xl text-white"></i>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-gray-900 mb-3">Food Bank</h3>
                        <p class="text-gray-600 mb-4">
                            Every Saturday morning, we distribute food to families in need. 
                            Volunteers welcome!
                        </p>
                        <a href="/form" class="text-blue-800 font-semibold hover:underline">
                            Volunteer Now <i class="fas fa-arrow-right ml-1"></i>
                        </a>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div class="bg-green-600 p-6">
                        <i class="fas fa-home text-4xl text-white"></i>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-gray-900 mb-3">Homeless Ministry</h3>
                        <p class="text-gray-600 mb-4">
                            Providing meals, clothing, and hope to our homeless neighbors 
                            through weekly outreach.
                        </p>
                        <a href="/form" class="text-blue-800 font-semibold hover:underline">
                            Get Involved <i class="fas fa-arrow-right ml-1"></i>
                        </a>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div class="bg-purple-600 p-6">
                        <i class="fas fa-graduation-cap text-4xl text-white"></i>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-gray-900 mb-3">Youth Programs</h3>
                        <p class="text-gray-600 mb-4">
                            After-school tutoring, mentorship, and activities for local youth 
                            to build a brighter future.
                        </p>
                        <a href="/form" class="text-blue-800 font-semibold hover:underline">
                            Learn More <i class="fas fa-arrow-right ml-1"></i>
                        </a>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div class="bg-red-600 p-6">
                        <i class="fas fa-hand-holding-heart text-4xl text-white"></i>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-gray-900 mb-3">Care Ministry</h3>
                        <p class="text-gray-600 mb-4">
                            Visiting the sick, elderly, and shut-ins to provide comfort, 
                            prayer, and companionship.
                        </p>
                        <a href="/form" class="text-blue-800 font-semibold hover:underline">
                            Join Our Team <i class="fas fa-arrow-right ml-1"></i>
                        </a>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div class="bg-orange-600 p-6">
                        <i class="fas fa-tools text-4xl text-white"></i>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-gray-900 mb-3">Community Repairs</h3>
                        <p class="text-gray-600 mb-4">
                            Free home repairs for elderly and low-income families in our 
                            community.
                        </p>
                        <a href="/form" class="text-blue-800 font-semibold hover:underline">
                            Volunteer <i class="fas fa-arrow-right ml-1"></i>
                        </a>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div class="bg-teal-600 p-6">
                        <i class="fas fa-globe text-4xl text-white"></i>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-gray-900 mb-3">Mission Trips</h3>
                        <p class="text-gray-600 mb-4">
                            Annual mission trips to serve communities locally and around 
                            the world.
                        </p>
                        <a href="/form" class="text-blue-800 font-semibold hover:underline">
                            Sign Up <i class="fas fa-arrow-right ml-1"></i>
                        </a>
                    </div>
                </div>
            </div>

            <!-- Call to Action -->
            <div class="mt-16 bg-gray-100 rounded-2xl p-12 text-center">
                <h2 class="text-3xl font-bold text-gray-900 mb-4">Make a Difference Today</h2>
                <p class="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                    Your time, talents, and resources can transform lives. Join us in serving 
                    our community and spreading hope.
                </p>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="/form" class="btn-primary text-white px-8 py-3 rounded-full font-semibold inline-flex items-center">
                        <i class="fas fa-hand-holding-heart mr-2"></i>
                        Volunteer
                    </a>
                    <a href="/form" class="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-semibold inline-flex items-center transition">
                        <i class="fas fa-donate mr-2"></i>
                        Donate
                    </a>
                </div>
            </div>
        </div>
    </section>
  `
  return c.html(layout('Outreach', content))
})

// Watch page
app.get('/watch', (c) => {
  const content = `
    <section class="py-20">
        <div class="container mx-auto px-6">
            <h1 class="text-4xl font-bold text-center text-gray-900 mb-6">Watch Live & Past Services</h1>
            <p class="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto">
                Can't make it in person? Join us online for our live stream or catch up on past messages.
            </p>

            <!-- Live Stream Section -->
            <div class="max-w-4xl mx-auto mb-16">
                <div class="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                    <div class="aspect-video bg-gray-800 flex items-center justify-center">
                        <div class="text-center">
                            <i class="fas fa-play-circle text-6xl text-white mb-4"></i>
                            <p class="text-white text-xl font-semibold">Sunday Service Live Stream</p>
                            <p class="text-gray-400 mt-2">Sundays at 10:30 AM</p>
                            <button class="mt-6 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-semibold transition">
                                <i class="fas fa-bell mr-2"></i>
                                Set Reminder
                            </button>
                        </div>
                    </div>
                    <div class="bg-gray-800 p-6">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-4">
                                <span class="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                                    LIVE
                                </span>
                                <span class="text-gray-300">
                                    <i class="fas fa-eye mr-1"></i> 247 watching
                                </span>
                            </div>
                            <div class="flex space-x-2">
                                <button class="text-gray-400 hover:text-white transition">
                                    <i class="fas fa-thumbs-up text-xl"></i>
                                </button>
                                <button class="text-gray-400 hover:text-white transition">
                                    <i class="fas fa-share text-xl"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Messages -->
            <div class="max-w-6xl mx-auto">
                <h2 class="text-3xl font-bold text-gray-900 mb-8">Recent Messages</h2>
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                        <div class="aspect-video bg-gray-200 relative">
                            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Crect fill='%23ddd' width='640' height='360'/%3E%3C/svg%3E" alt="Sermon thumbnail" class="w-full h-full object-cover">
                            <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                                <i class="fas fa-play-circle text-white text-4xl"></i>
                            </div>
                            <span class="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                                32:45
                            </span>
                        </div>
                        <div class="p-4">
                            <h3 class="font-bold text-gray-900 mb-2">Finding Hope in Difficult Times</h3>
                            <p class="text-sm text-gray-600 mb-2">Pastor John Smith</p>
                            <p class="text-xs text-gray-500">November 3, 2024</p>
                        </div>
                    </div>

                    <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                        <div class="aspect-video bg-gray-200 relative">
                            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Crect fill='%23ddd' width='640' height='360'/%3E%3C/svg%3E" alt="Sermon thumbnail" class="w-full h-full object-cover">
                            <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                                <i class="fas fa-play-circle text-white text-4xl"></i>
                            </div>
                            <span class="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                                28:15
                            </span>
                        </div>
                        <div class="p-4">
                            <h3 class="font-bold text-gray-900 mb-2">The Power of Prayer</h3>
                            <p class="text-sm text-gray-600 mb-2">Pastor John Smith</p>
                            <p class="text-xs text-gray-500">October 27, 2024</p>
                        </div>
                    </div>

                    <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                        <div class="aspect-video bg-gray-200 relative">
                            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Crect fill='%23ddd' width='640' height='360'/%3E%3C/svg%3E" alt="Sermon thumbnail" class="w-full h-full object-cover">
                            <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                                <i class="fas fa-play-circle text-white text-4xl"></i>
                            </div>
                            <span class="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                                35:20
                            </span>
                        </div>
                        <div class="p-4">
                            <h3 class="font-bold text-gray-900 mb-2">Walking in Faith</h3>
                            <p class="text-sm text-gray-600 mb-2">Pastor John Smith</p>
                            <p class="text-xs text-gray-500">October 20, 2024</p>
                        </div>
                    </div>

                    <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                        <div class="aspect-video bg-gray-200 relative">
                            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Crect fill='%23ddd' width='640' height='360'/%3E%3C/svg%3E" alt="Sermon thumbnail" class="w-full h-full object-cover">
                            <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                                <i class="fas fa-play-circle text-white text-4xl"></i>
                            </div>
                            <span class="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                                41:10
                            </span>
                        </div>
                        <div class="p-4">
                            <h3 class="font-bold text-gray-900 mb-2">God's Love Never Fails</h3>
                            <p class="text-sm text-gray-600 mb-2">Guest Speaker</p>
                            <p class="text-xs text-gray-500">October 13, 2024</p>
                        </div>
                    </div>

                    <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                        <div class="aspect-video bg-gray-200 relative">
                            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Crect fill='%23ddd' width='640' height='360'/%3E%3C/svg%3E" alt="Sermon thumbnail" class="w-full h-full object-cover">
                            <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                                <i class="fas fa-play-circle text-white text-4xl"></i>
                            </div>
                            <span class="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                                30:55
                            </span>
                        </div>
                        <div class="p-4">
                            <h3 class="font-bold text-gray-900 mb-2">Building Strong Foundations</h3>
                            <p class="text-sm text-gray-600 mb-2">Pastor John Smith</p>
                            <p class="text-xs text-gray-500">October 6, 2024</p>
                        </div>
                    </div>

                    <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                        <div class="aspect-video bg-gray-200 relative">
                            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Crect fill='%23ddd' width='640' height='360'/%3E%3C/svg%3E" alt="Sermon thumbnail" class="w-full h-full object-cover">
                            <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                                <i class="fas fa-play-circle text-white text-4xl"></i>
                            </div>
                            <span class="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                                27:30
                            </span>
                        </div>
                        <div class="p-4">
                            <h3 class="font-bold text-gray-900 mb-2">Living with Purpose</h3>
                            <p class="text-sm text-gray-600 mb-2">Pastor John Smith</p>
                            <p class="text-xs text-gray-500">September 29, 2024</p>
                        </div>
                    </div>
                </div>

                <div class="text-center mt-8">
                    <button class="btn-primary text-white px-8 py-3 rounded-full font-semibold">
                        Load More Messages <i class="fas fa-chevron-down ml-2"></i>
                    </button>
                </div>
            </div>

            <!-- Subscribe Section -->
            <div class="mt-16 bg-blue-50 rounded-2xl p-12 text-center">
                <h2 class="text-3xl font-bold text-gray-900 mb-4">Never Miss a Service</h2>
                <p class="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                    Subscribe to our YouTube channel and get notified when we go live or upload new messages.
                </p>
                <a href="#" class="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-semibold inline-flex items-center transition">
                    <i class="fab fa-youtube mr-2"></i>
                    Subscribe on YouTube
                </a>
            </div>
        </div>
    </section>
  `
  return c.html(layout('Watch', content))
})

// Form page
app.get('/form', (c) => {
  const content = `
    <section class="py-20">
        <div class="container mx-auto px-6">
            <h1 class="text-4xl font-bold text-center text-gray-900 mb-6">Get Connected</h1>
            <p class="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto">
                We'd love to hear from you! Fill out the form below and someone from our team will get back to you soon.
            </p>

            <div class="max-w-4xl mx-auto">
                <div class="grid md:grid-cols-2 gap-12">
                    <!-- Contact Form -->
                    <div class="bg-white rounded-xl shadow-lg p-8">
                        <h2 class="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
                        <form id="contactForm">
                            <div class="mb-4">
                                <label for="name" class="block text-gray-700 font-semibold mb-2">Name *</label>
                                <input type="text" id="name" name="name" required
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                            </div>

                            <div class="mb-4">
                                <label for="email" class="block text-gray-700 font-semibold mb-2">Email *</label>
                                <input type="email" id="email" name="email" required
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                            </div>

                            <div class="mb-4">
                                <label for="phone" class="block text-gray-700 font-semibold mb-2">Phone</label>
                                <input type="tel" id="phone" name="phone"
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                            </div>

                            <div class="mb-4">
                                <label for="subject" class="block text-gray-700 font-semibold mb-2">Subject *</label>
                                <select id="subject" name="subject" required
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                                    <option value="">Select a subject</option>
                                    <option value="general">General Inquiry</option>
                                    <option value="prayer">Prayer Request</option>
                                    <option value="volunteer">Volunteer Opportunity</option>
                                    <option value="membership">Membership Information</option>
                                    <option value="pastoral">Pastoral Care</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div class="mb-6">
                                <label for="message" class="block text-gray-700 font-semibold mb-2">Message *</label>
                                <textarea id="message" name="message" rows="4" required
                                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"></textarea>
                            </div>

                            <button type="submit" class="w-full btn-primary text-white py-3 rounded-lg font-semibold">
                                Send Message
                            </button>
                        </form>

                        <div id="formMessage" class="mt-4 hidden">
                            <div class="bg-green-100 text-green-800 p-4 rounded-lg">
                                <i class="fas fa-check-circle mr-2"></i>
                                Thank you for your message! We'll get back to you soon.
                            </div>
                        </div>
                    </div>

                    <!-- Contact Information -->
                    <div>
                        <div class="bg-gray-50 rounded-xl p-8 mb-8">
                            <h3 class="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
                            <div class="space-y-4">
                                <div class="flex items-start">
                                    <i class="fas fa-map-marker-alt text-blue-800 mt-1 mr-4"></i>
                                    <div>
                                        <p class="font-semibold text-gray-900">Address</p>
                                        <p class="text-gray-600">123 Church Street<br>City, State 12345</p>
                                    </div>
                                </div>
                                <div class="flex items-start">
                                    <i class="fas fa-phone text-blue-800 mt-1 mr-4"></i>
                                    <div>
                                        <p class="font-semibold text-gray-900">Phone</p>
                                        <p class="text-gray-600">(555) 123-4567</p>
                                    </div>
                                </div>
                                <div class="flex items-start">
                                    <i class="fas fa-envelope text-blue-800 mt-1 mr-4"></i>
                                    <div>
                                        <p class="font-semibold text-gray-900">Email</p>
                                        <p class="text-gray-600">info@morningstar.church</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="bg-blue-50 rounded-xl p-8">
                            <h3 class="text-xl font-bold text-gray-900 mb-4">Office Hours</h3>
                            <div class="space-y-2">
                                <div class="flex justify-between">
                                    <span class="text-gray-700">Monday - Friday</span>
                                    <span class="font-semibold text-gray-900">9:00 AM - 5:00 PM</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-700">Saturday</span>
                                    <span class="font-semibold text-gray-900">9:00 AM - 12:00 PM</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-700">Sunday</span>
                                    <span class="font-semibold text-gray-900">8:00 AM - 2:00 PM</span>
                                </div>
                            </div>
                        </div>

                        <div class="mt-8 text-center">
                            <p class="text-gray-600 mb-4">Follow us on social media</p>
                            <div class="flex justify-center space-x-4">
                                <a href="#" class="text-gray-600 hover:text-blue-800 transition">
                                    <i class="fab fa-facebook-f text-2xl"></i>
                                </a>
                                <a href="#" class="text-gray-600 hover:text-blue-800 transition">
                                    <i class="fab fa-instagram text-2xl"></i>
                                </a>
                                <a href="#" class="text-gray-600 hover:text-blue-800 transition">
                                    <i class="fab fa-youtube text-2xl"></i>
                                </a>
                                <a href="#" class="text-gray-600 hover:text-blue-800 transition">
                                    <i class="fab fa-twitter text-2xl"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <script>
        document.getElementById('contactForm')?.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };

            try {
                const response = await fetch('/api/form', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                
                if (result.success) {
                    document.getElementById('formMessage').classList.remove('hidden');
                    document.getElementById('contactForm').reset();
                    
                    setTimeout(() => {
                        document.getElementById('formMessage').classList.add('hidden');
                    }, 5000);
                }
            } catch (error) {
                console.error('Error submitting form:', error);
            }
        });
    </script>
  `
  return c.html(layout('Contact', content))
})

export default app