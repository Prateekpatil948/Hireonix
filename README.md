# Hireonix

Hireonix is a full-stack Job Portal built with a **React** frontend and a **Django + Django REST Framework** backend.

It supports **two roles** – **Candidates** and **Recruiters** – and covers the full hiring flow: posting jobs, applying, managing applications, assigning MCQ tests, and tracking results in a modern, responsive UI.

---

## ✨ Features

### 👨‍💼 Candidate

- Register / login and secure authentication  
- Complete and update candidate profile  
- Browse and search jobs with filters  
- View detailed job descriptions  
- Apply to jobs directly  
- View all applications in a dedicated **Applications** page  
- **Saved Jobs** functionality  
- **Recommended Jobs** based on profile  
- **MCQ Test System** per application:  
  - Generated after applying  
  - 30-minute timer  
  - Tab-switch/refresh restrictions  
  - Auto-submit on time end  
  - Scores visible to recruiters  

### 🧑‍💻 Recruiter

- Register / login  
- Update recruiter & company profile  
- Post, update, delete jobs  
- Manage posted jobs  
- View applicants for each job  
- View test results  
- **Recruiter Dashboard** for quick statistics  

### 🌐 General

- Modern glassmorphism UI  
- Fully responsive  
- REST API architecture  
- Role-based access  
- Clean frontend-backend separation  

---

## 🏗️ Tech Stack

**Frontend**
- React  
- React Router  
- Axios  
- Modern CSS  

**Backend**
- Django  
- Django REST Framework  
- Python  
- SQLite/PostgreSQL  
- CORS support  

---

## 📁 Project Structure

```
Hireonix/
├── backend/
│   └── jobportal/
│       ├── manage.py
│       ├── jobportal/          
│       ├── accounts/           
│       ├── jobs/               
│       ├── applications/       
│       ├── tests/              
│       └── ...
└── frontend/
    ├── public/
    └── src/
        ├── api/
        ├── components/
        ├── pages/
        ├── context/
        ├── App.jsx
        └── main.jsx
```

---

## 🔐 Authentication & Roles

- Candidate and Recruiter accounts  
- Role-specific dashboards and routes  
- API permission classes in backend  
- Token / session based authentication  

---

## 🧪 Candidate Test Flow

1. Candidate applies for job  
2. Application created  
3. Test becomes available in **Applications** page  
4. 30-minute countdown timer  
5. Auto-submit & test restrictions  
6. Score visible to recruiters  

---

## 📜 Useful Scripts

**Backend**
```
python manage.py runserver
python manage.py makemigrations
python manage.py migrate
python manage.py test
```

**Frontend**
```
npm install
npm run dev   # Vite
npm start     # CRA
npm run build
```

---

# 🚀 How to Run the Project

Follow these steps to run both backend and frontend in your local environment.

---

## **1️⃣ Clone the Repository**

```bash
git clone https://github.com/Prateekpatil948/Hireonix.git
cd Hireonix
```

---

## **2️⃣ Start the Backend (Django)**

### Step 1: Go to backend folder

```bash
cd backend
```

### Step 2: Create virtual environment

```bash
python -m venv venv
```

Activate it:

**Windows**
```bash
venv\Scripts\activate
```

**Mac/Linux**
```bash
source venv/bin/activate
```

### Step 3: Install dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Create `.env` file inside `backend/`

```
SECRET_KEY=your_secret_key_here
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
FRONTEND_URL=http://localhost:5173
DATABASE_URL=sqlite:///db.sqlite3
```

### Step 5: Apply migrations

```bash
python manage.py migrate
```

### Step 6: Create superuser (optional)

```bash
python manage.py createsuperuser
```

### Step 7: Run backend server

```bash
python manage.py runserver
```

Backend runs at:

```
http://127.0.0.1:8000/
```

---

## **3️⃣ Start the Frontend (React)**

Open a new terminal:

### Step 1: Go to frontend folder

```bash
cd frontend
```

### Step 2: Install node modules

```bash
npm install
```

### Step 3: Run the frontend

For Vite:

```bash
npm run dev
```

Or for Create React App:

```bash
npm start
```

Frontend runs at:

```
http://localhost:5173
```

---

## ✔️ Project is Running!

- **Frontend:** http://localhost:5173  
- **Backend API:** http://127.0.0.1:8000  

You now have full access to Candidate features, Recruiter features, Job Posting, Applications, Tests, and Dashboards.

---

## 🤝 Contributing

1. Fork the repository  
2. Create a new branch  
3. Commit changes  
4. Push and create a PR  

---

## 📄 License

No license provided yet — all rights reserved.

---

## ✉️ Contact

For any queries, open an issue on GitHub or contact prateekpatil948@gmail.com.
