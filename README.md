# \# 🛠️ ServiceHub

# 

# \### Full-Stack Home Services Marketplace

# 

# ServiceHub is a web-based marketplace designed to connect customers with home service professionals and businesses through a centralized platform.

# 

# \[!\[Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge)](https://servicehub-mauve.vercel.app/)

# \[!\[GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge)](https://github.com/mauryashivangi271/servicehub)

# 

# \## 🌐 Live Website

# 

# https://servicehub-mauve.vercel.app/

# 

# \## 📌 Project Overview

# 

# ServiceHub simplifies the process of discovering, booking and managing home services. It provides dedicated dashboards for customers, service providers, businesses and administrators.

# 

# \## ✨ Key Features

# 

# \### Customer

# \- User registration and authentication

# \- Service discovery and search filters

# \- Service booking and status tracking

# \- Saved services and provider profiles

# \- Quotations and price approvals

# \- Messaging and notifications

# \- Payment and invoice modules

# \- Ratings, reviews and complaints

# 

# \### Service Provider

# \- Provider registration and verification

# \- Service and pricing management

# \- Booking management

# \- Customer communication

# \- Quotation management

# \- Earnings and commission tracking

# \- Performance analytics

# 

# \### Business

# \- Business profile management

# \- Employee management

# \- Employee assignment

# \- Inventory and tool management

# \- Business performance reports

# 

# \### Administrator

# \- Centralized admin dashboard

# \- Customer and provider management

# \- Provider verification

# \- Category and service management

# \- Booking and payment monitoring

# \- Coupon management

# \- Complaint and dispute management

# \- Analytics and audit logs

# 

# \## 🚀 Technology Stack

# 

# | Technology | Purpose |

# |---|---|

# | React.js | Frontend development |

# | JavaScript | Application logic |

# | Tailwind CSS | Responsive UI |

# | Vite | Build tooling |

# | Supabase | Backend and authentication |

# | PostgreSQL | Relational database |

# | Supabase Storage | File storage |

# | Supabase Realtime | Messaging and updates |

# | Edge Functions | Server-side operations |

# | Razorpay | Payment integration |

# | Recharts | Data visualization |

# | Vercel | Deployment |

# | Git \& GitHub | Version control |

# 

# \## 🏗️ System Architecture

# 

# ```mermaid

# flowchart TD

# &#x20;   A\[Customer] --> E\[React Application]

# &#x20;   B\[Service Provider] --> E

# &#x20;   C\[Business] --> E

# &#x20;   D\[Administrator] --> E

# &#x20;   E --> F\[Supabase Authentication]

# &#x20;   E --> G\[PostgreSQL Database]

# &#x20;   E --> H\[Supabase Storage]

# &#x20;   E --> I\[Supabase Realtime]

# &#x20;   E --> J\[Edge Functions]

# &#x20;   J --> K\[Razorpay]

# ```

# 

# \## 🔐 Security Features

# 

# \- Role-based access control

# \- Supabase authentication

# \- PostgreSQL Row Level Security

# \- Protected application routes

# \- Environment variable management

# \- Server-side payment verification

# \- Private document storage

# 

# \## 📁 Project Structure

# 

# ```text

# servicehub/

# ├── public/

# ├── src/

# │   ├── assets/

# │   ├── components/

# │   ├── context/

# │   ├── lib/

# │   ├── pages/

# │   ├── services/

# │   ├── App.jsx

# │   └── main.jsx

# ├── supabase/

# │   └── functions/

# ├── tests/

# ├── package.json

# ├── vite.config.js

# └── vercel.json

# ```

# 

# \## ⚙️ Local Installation

# 

# \### Clone the repository

# 

# ```bash

# git clone https://github.com/mauryashivangi271/servicehub.git

# cd servicehub

# ```

# 

# \### Install dependencies

# 

# ```bash

# npm install

# ```

# 

# \### Configure environment variables

# 

# Create a `.env.local` file in the project root.

# 

# ```env

# VITE\_SUPABASE\_URL=your\_supabase\_url

# VITE\_SUPABASE\_PUBLISHABLE\_KEY=your\_publishable\_key

# ```

# 

# A configured Supabase project with the required database schema, policies and backend functions is needed for full functionality.

# 

# \### Start the development server

# 

# ```bash

# npm run dev

# ```

# 

# \### Create a production build

# 

# ```bash

# npm run build

# ```

# 

# \## 📊 Analytics and Reporting

# 

# ServiceHub includes analytical modules for booking trends, revenue, commissions, category performance, employee performance and inventory management.

# 

# \## 📍 Project Status

# 

# \- Application developed

# \- Production deployment available

# \- Authentication and role-based dashboards implemented

# \- Payment integration implemented

# \- Production functionality and payment testing ongoing

# 

# The application is currently a portfolio and demonstration project. Live commercial payment processing has not been validated.

# 

# \## 🔮 Future Improvements

# 

# \- Enhanced automated testing

# \- Advanced location-based service discovery

# \- Performance optimization

# \- Improved payment settlement and refund workflows

# \- Mobile application

# \- Enhanced reporting

# 

# \## 👩‍💻 Developer

# 

# \*\*Shivangi Maurya\*\*

# 

# BCA Student | Web Developer | Aspiring Data Analyst

# 

# \- GitHub: https://github.com/mauryashivangi271

# \- LinkedIn: https://www.linkedin.com/in/shivangi-maurya19/

# \- Live Project: https://servicehub-mauve.vercel.app/

# 

# \---

# 

# Developed as a full-stack project to demonstrate web development, database management, authentication, business analytics and cloud deployment skills.



