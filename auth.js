const SUPABASE_URL = "sb_publishable_awmrbbDzoC8_6Y3xwNSkMw_gjB1ewQP";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpY2x4YnB5YmtpZWFid2drdnJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0ODkwNTIsImV4cCI6MjA5MzA2NTA1Mn0.NGGJ1NjCJReEeBPxgo__-Sq1ohXDt3rciK9dcfHY_gQ";

const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const tabs = document.querySelectorAll(".tab");
const forms = document.querySelectorAll(".auth-form");
const message = document.getElementById("authMessage");

function showMessage(text, type = "") {
  message.textContent = text;
  message.className = "message " + type;
}

function showForm(name) {
  tabs.forEach(tab => tab.classList.toggle("active", tab.dataset.tab === name));
  forms.forEach(form => form.classList.remove("active"));

  if (name === "login") document.getElementById("loginForm").classList.add("active");
  if (name === "register") document.getElementById("registerForm").classList.add("active");
  if (name === "forgot") document.getElementById("forgotForm").classList.add("active");

  showMessage("");
}

function isAllowedEmail(email) {
  const allowedDomains = ["gmail.com", "hotmail.com", "outlook.com", "icloud.com", "yahoo.com"];
  const parts = email.toLowerCase().trim().split("@");
  if (parts.length !== 2) return false;
  return allowedDomains.includes(parts[1]);
}

tabs.forEach(tab => {
  tab.addEventListener("click", () => showForm(tab.dataset.tab));
});

document.getElementById("switchRegister").addEventListener("click", (e) => {
  e.preventDefault();
  showForm("register");
});

document.getElementById("openRegister").addEventListener("click", (e) => {
  e.preventDefault();
  showForm("register");
  document.getElementById("signin").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("openForgot").addEventListener("click", (e) => {
  e.preventDefault();
  showForm("forgot");
});

document.getElementById("backLogin").addEventListener("click", (e) => {
  e.preventDefault();
  showForm("login");
});

document.querySelectorAll(".toggle-pass").forEach(btn => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.target);
    input.type = input.type === "password" ? "text" : "password";
    btn.textContent = input.type === "password" ? "Show" : "Hide";
  });
});

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("loginUsername").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;

  if (!username || !password) {
    showMessage("Please enter your username and password.", "error");
    return;
  }

  showMessage("Signing in...");

  const { data: email, error: usernameError } = await client.rpc("get_email_by_username", {
    p_username: username
  });

  if (usernameError || !email) {
    showMessage("Username not found.", "error");
    return;
  }

  const { error } = await client.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    showMessage("Invalid username or password.", "error");
    return;
  }

  showMessage("Signed in successfully. Redirecting...", "success");

  setTimeout(() => {
    window.location.href = "account.html";
  }, 900);
});

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("regUsername").value.trim().toLowerCase();
  const email = document.getElementById("regEmail").value.trim().toLowerCase();
  const password = document.getElementById("regPassword").value;
  const confirmPassword = document.getElementById("regConfirmPassword").value;
  const phone = document.getElementById("regPhone").value.trim();

  if (username.length < 3 || username.length > 20) {
    showMessage("Username must be between 3 and 20 characters.", "error");
    return;
  }

  if (!/^[a-z0-9_]+$/.test(username)) {
    showMessage("Username can only contain letters, numbers and underscores.", "error");
    return;
  }

  if (!isAllowedEmail(email)) {
    showMessage("Please use Gmail, Outlook, Hotmail, iCloud or Yahoo.", "error");
    return;
  }

  if (password.length < 8) {
    showMessage("Password must be at least 8 characters.", "error");
    return;
  }

  if (password !== confirmPassword) {
    showMessage("Passwords do not match.", "error");
    return;
  }

  showMessage("Creating account...");

  const { error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        phone
      }
    }
  });

  if (error) {
    showMessage(error.message, "error");
    return;
  }

  showMessage("Account created successfully. You can sign in now.", "success");
  showForm("login");
});

document.getElementById("forgotForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("forgotEmail").value.trim().toLowerCase();

  if (!isAllowedEmail(email)) {
    showMessage("Please enter a valid email address.", "error");
    return;
  }

  showMessage("Sending reset link...");

  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + "/reset-password.html"
  });

  if (error) {
    showMessage(error.message, "error");
    return;
  }

  showMessage("Password reset link sent to your email.", "success");
});
